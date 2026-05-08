package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/baditaflorin/polyglot-nlp-toolkit/internal/api"
	"github.com/baditaflorin/polyglot-nlp-toolkit/internal/config"
	"github.com/baditaflorin/polyglot-nlp-toolkit/internal/nlp"
	"github.com/baditaflorin/polyglot-nlp-toolkit/internal/utils"
)

var (
	version = "0.1.0"
	commit  = "dev"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if utils.HandleErrorOrLogWithMessages(err, "configuration failed", "configuration loaded") {
		os.Exit(1)
	}

	analyzer := nlp.NewWorkerClient(nlp.WorkerConfig{
		ScriptPath:     cfg.NLPWorkerPath,
		Timeout:        time.Duration(cfg.NLPWorkerTimeoutSeconds) * time.Second,
		JavaCommand:    cfg.LangDetectJavaCommand,
		ModelCacheDir:  cfg.ModelCacheDir,
		StanzaDataDir:  cfg.StanzaResourcesDir,
		Transformer:    cfg.SentenceTransformerModel,
		SpacyPolicy:    cfg.SpacyModelPolicy,
		ApplicationEnv: cfg.AppEnv,
	})

	router := api.NewRouter(api.RouterConfig{
		Config:   cfg,
		Analyzer: analyzer,
		Version:  version,
		Commit:   commit,
	})

	server := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
	}

	errs := make(chan error, 1)
	go func() {
		slog.Info("server listening", "addr", cfg.HTTPAddr, "version", version, "commit", commit)
		errs <- server.ListenAndServe()
	}()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			slog.Error("graceful shutdown failed", "error", err)
			os.Exit(1)
		}
		slog.Info("server stopped")
	case err := <-errs:
		if err != nil && err != http.ErrServerClosed {
			slog.Error("server failed", "error", err)
			os.Exit(1)
		}
	}
}
