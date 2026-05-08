package metrics

import (
	"net/http"
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
)

var (
	httpRequests = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "polyglot_http_requests_total",
			Help: "Total HTTP requests by method, path, and status.",
		},
		[]string{"method", "path", "status"},
	)
	httpDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "polyglot_http_request_duration_seconds",
			Help:    "HTTP request duration by method and path.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)
	analysisDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "polyglot_analysis_duration_seconds",
			Help:    "Corpus analysis duration.",
			Buckets: []float64{0.1, 0.25, 0.5, 1, 2.5, 5, 15, 30, 60, 120},
		},
		[]string{"success"},
	)
)

func init() {
	prometheus.MustRegister(httpRequests, httpDuration, analysisDuration)
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(status int) {
	r.status = status
	r.ResponseWriter.WriteHeader(status)
}

func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		recorder := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		start := time.Now()
		next.ServeHTTP(recorder, r)
		path := r.URL.Path
		httpRequests.WithLabelValues(r.Method, path, strconv.Itoa(recorder.status)).Inc()
		httpDuration.WithLabelValues(r.Method, path).Observe(time.Since(start).Seconds())
	})
}

func ObserveAnalysis(duration time.Duration, success bool) {
	analysisDuration.WithLabelValues(strconv.FormatBool(success)).Observe(duration.Seconds())
}
