package api

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/baditaflorin/polyglot-nlp-toolkit/internal/config"
	"github.com/baditaflorin/polyglot-nlp-toolkit/internal/metrics"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/go-playground/validator/v10"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Analyzer interface {
	Analyze(ctx context.Context, request AnalyzeRequest) (AnalyzeResponse, error)
	Ready(ctx context.Context) error
}

type RouterConfig struct {
	Config   config.Config
	Analyzer Analyzer
	Version  string
	Commit   string
}

type server struct {
	analyzer Analyzer
	validate *validator.Validate
	version  string
	commit   string
}

func NewRouter(cfg RouterConfig) http.Handler {
	s := &server{
		analyzer: cfg.Analyzer,
		validate: validator.New(validator.WithRequiredStructEnabled()),
		version:  cfg.Version,
		commit:   cfg.Commit,
	}

	r := chi.NewRouter()
	r.Use(requestLogger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{
			cfg.Config.PagesOrigin,
			"https://baditaflorin.github.io",
			"http://localhost:5173",
			"http://127.0.0.1:5173",
		},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type"},
		MaxAge:         300,
	}))
	r.Use(metrics.Middleware)

	r.Get("/healthz", s.healthz)
	r.Get("/readyz", s.readyz)
	r.Handle("/metrics", promhttp.Handler())
	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/analyze", s.analyze)
		r.Get("/languages", s.languages)
	})

	return r
}

func requestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		// #nosec G706 -- structured fields are not interpreted as log templates.
		slog.Info("request", "method", r.Method, "path", r.URL.EscapedPath(), "duration_ms", time.Since(start).Milliseconds())
	})
}

func (s *server) healthz(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"version": s.version,
		"commit":  s.commit,
	})
}

func (s *server) readyz(w http.ResponseWriter, r *http.Request) {
	if err := s.analyzer.Ready(r.Context()); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, ErrorResponse{Error: err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

func (s *server) languages(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"languages": []string{
			"auto", "af", "ar", "bg", "bn", "ca", "cs", "da", "de", "el", "en", "es", "et",
			"fa", "fi", "fr", "gu", "he", "hi", "hr", "hu", "id", "it", "ja", "kn", "ko",
			"lt", "lv", "mk", "ml", "mr", "ne", "nl", "no", "pa", "pl", "pt", "ro", "ru",
			"sk", "sl", "so", "sq", "sv", "sw", "ta", "te", "th", "tl", "tr", "uk", "ur",
			"vi", "zh",
		},
	})
}

func (s *server) analyze(w http.ResponseWriter, r *http.Request) {
	var request AnalyzeRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "invalid JSON body"})
		return
	}
	if request.ClusterCount == 0 {
		request.ClusterCount = 2
	}
	if err := s.validate.Struct(request); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	start := time.Now()
	response, err := s.analyzer.Analyze(r.Context(), request)
	metrics.ObserveAnalysis(time.Since(start), err == nil)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, context.DeadlineExceeded) {
			status = http.StatusGatewayTimeout
		}
		writeJSON(w, status, ErrorResponse{Error: err.Error()})
		return
	}
	response.Version = s.version
	response.Commit = s.commit
	response.DurationMS = float64(time.Since(start).Microseconds()) / 1000
	writeJSON(w, http.StatusOK, response)
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(body); err != nil {
		slog.Error("write response failed", "error", err)
	}
}
