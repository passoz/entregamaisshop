package http

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
)

type ctxKey string

const (
	requestIDKey     ctxKey = "request_id"
	correlationIDKey ctxKey = "correlation_id"
)

func newID() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func requestContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqID := r.Header.Get("X-Request-ID")
		if reqID == "" {
			reqID = newID()
		}
		corrID := r.Header.Get("X-Correlation-ID")
		if corrID == "" {
			corrID = reqID
		}

		w.Header().Set("X-Request-ID", reqID)
		w.Header().Set("X-Correlation-ID", corrID)

		ctx := context.WithValue(r.Context(), requestIDKey, reqID)
		ctx = context.WithValue(ctx, correlationIDKey, corrID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

func loggingMiddleware(lg *logger.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
			next.ServeHTTP(rec, r)

			fields := map[string]any{
				"request_id":     RequestID(r.Context()),
				"correlation_id": CorrelationID(r.Context()),
				"route":          r.URL.Path,
				"method":         r.Method,
				"status_code":    rec.status,
				"latency_ms":     time.Since(start).Milliseconds(),
			}
			lg.Info("http_request", fields)
		})
	}
}

func chain(h http.Handler, m ...func(http.Handler) http.Handler) http.Handler {
	for i := len(m) - 1; i >= 0; i-- {
		h = m[i](h)
	}
	return h
}

func requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if !strings.HasPrefix(strings.ToLower(auth), "bearer ") {
			writeError(w, http.StatusUnauthorized, APIError{
				Code:          "unauthorized",
				Message:       "missing or invalid bearer token",
				RequestID:     RequestID(r.Context()),
				CorrelationID: CorrelationID(r.Context()),
			})
			return
		}
		next(w, r)
	}
}

func requireRole(role string, next http.HandlerFunc) http.HandlerFunc {
	return requireAuth(func(w http.ResponseWriter, r *http.Request) {
		if strings.ToLower(r.Header.Get("X-Role")) != strings.ToLower(role) {
			writeError(w, http.StatusForbidden, APIError{
				Code:          "forbidden",
				Message:       "insufficient role",
				RequestID:     RequestID(r.Context()),
				CorrelationID: CorrelationID(r.Context()),
			})
			return
		}
		next(w, r)
	})
}

func RequestID(ctx context.Context) string {
	if v, ok := ctx.Value(requestIDKey).(string); ok {
		return v
	}
	return ""
}

func CorrelationID(ctx context.Context) string {
	if v, ok := ctx.Value(correlationIDKey).(string); ok {
		return v
	}
	return ""
}
