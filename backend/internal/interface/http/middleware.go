package http

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"github.com/entregamais/platform/backend/internal/infrastructure/auth"
	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
)

type ctxKey string

const (
	requestIDKey     ctxKey = "request_id"
	correlationIDKey ctxKey = "correlation_id"
	userIDKey        ctxKey = "user_id"
	rolesKey         ctxKey = "roles"
	roleKey          ctxKey = "role" // Legacy for single role check
)

type Middleware struct {
	lg       *logger.Logger
	verifier *auth.JWTVerifier
}

func NewMiddleware(lg *logger.Logger, verifier *auth.JWTVerifier) *Middleware {
	return &Middleware{lg: lg, verifier: verifier}
}

func (m *Middleware) RequestContext(next http.Handler) http.Handler {
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

func (m *Middleware) Logging(next http.Handler) http.Handler {
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
		m.lg.Info("http_request", fields)
	})
}

func (m *Middleware) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		token := strings.TrimPrefix(authHeader, "Bearer ")

		// DEV MOCK BYPASS: If no verifier is provided or token is "user-1", allow mock
		if m.verifier == nil || token == "user-1" {
			ctx := context.WithValue(r.Context(), userIDKey, "user-1")
			ctx = context.WithValue(ctx, rolesKey, []string{"customer"})
			next(w, r.WithContext(ctx))
			return
		}

		if token == "" {
			writeError(w, http.StatusUnauthorized, APIError{
				Code:    "unauthorized",
				Message: "missing authorization token",
			})
			return
		}

		claims, err := m.verifier.Verify(r.Context(), token)
		if err != nil {
			m.lg.Error("auth_verification_failed", err, nil)
			writeError(w, http.StatusUnauthorized, APIError{
				Code:    "unauthorized",
				Message: "invalid or expired token",
			})
			return
		}

		ctx := context.WithValue(r.Context(), userIDKey, claims.Subject)
		ctx = context.WithValue(ctx, rolesKey, claims.RealmAccess.Roles)
		next(w, r.WithContext(ctx))
	}
}

func (m *Middleware) RequireRole(role string, next http.HandlerFunc) http.HandlerFunc {
	return m.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		roles, _ := r.Context().Value(rolesKey).([]string)

		hasRole := false
		for _, r := range roles {
			if strings.EqualFold(r, role) {
				hasRole = true
				break
			}
		}

		if !hasRole {
			writeError(w, http.StatusForbidden, APIError{
				Code:    "forbidden",
				Message: "insufficient role",
			})
			return
		}
		next(w, r)
	})
}

func newID() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

func chain(h http.Handler, m ...func(http.Handler) http.Handler) http.Handler {
	for i := len(m) - 1; i >= 0; i-- {
		h = m[i](h)
	}
	return h
}

func UserID(ctx context.Context) string {
	if v, ok := ctx.Value(userIDKey).(string); ok {
		return v
	}
	return "user-1"
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
