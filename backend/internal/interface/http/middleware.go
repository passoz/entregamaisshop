package http

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"github.com/entregamais/platform/backend/ent"
	"github.com/entregamais/platform/backend/ent/user"
	"github.com/entregamais/platform/backend/internal/infrastructure/auth"
	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
)

type ctxKey string

const (
	requestIDKey     ctxKey = "request_id"
	correlationIDKey ctxKey = "correlation_id"
	userIDKey        ctxKey = "user_id"
	userEmailKey     ctxKey = "user_email"
	userNameKey      ctxKey = "user_name"
	preferredNameKey ctxKey = "preferred_username"
	rolesKey         ctxKey = "roles"
	roleKey          ctxKey = "role" // Legacy for single role check
)

type Middleware struct {
	lg       *logger.Logger
	verifier *auth.JWTVerifier
	db       *ent.Client
}

func NewMiddleware(lg *logger.Logger, verifier *auth.JWTVerifier, db *ent.Client) *Middleware {
	return &Middleware{lg: lg, verifier: verifier, db: db}
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
			ctx = context.WithValue(ctx, userEmailKey, "cliente@entregamais.local")
			ctx = context.WithValue(ctx, userNameKey, "Cliente Teste")
			ctx = context.WithValue(ctx, preferredNameKey, "Cliente Teste")
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
		ctx = context.WithValue(ctx, userEmailKey, claims.Email)
		ctx = context.WithValue(ctx, userNameKey, claims.Name)
		ctx = context.WithValue(ctx, preferredNameKey, claims.PreferredUsername)
		ctx = context.WithValue(ctx, rolesKey, claims.RealmAccess.Roles)

		if err := m.syncUser(ctx); err != nil {
			m.lg.Error("auth_user_sync_failed", err, map[string]any{"user_id": claims.Subject})
			writeError(w, http.StatusInternalServerError, APIError{
				Code:    "internal_error",
				Message: "failed to sync authenticated user",
			})
			return
		}

		next(w, r.WithContext(ctx))
	}
}

func (m *Middleware) syncUser(ctx context.Context) error {
	if m.db == nil {
		return nil
	}

	uid := UserID(ctx)
	if uid == "" {
		return nil
	}

	exists, err := m.db.User.Query().Where(user.IDEQ(uid)).Exist(ctx)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	name := UserName(ctx)
	if name == "" {
		name = PreferredUsername(ctx)
	}
	if name == "" {
		name = "Usuario"
	}

	email := UserEmail(ctx)
	if email == "" {
		email = uid + "@keycloak.local"
	}

	_, err = m.db.User.Create().
		SetID(uid).
		SetName(name).
		SetEmail(email).
		Save(ctx)
	return err
}

func (m *Middleware) RequireRole(role string, next http.HandlerFunc) http.HandlerFunc {
	return m.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		roles, _ := r.Context().Value(rolesKey).([]string)
		requiredRole := canonicalRole(role)

		hasRole := false
		for _, r := range roles {
			if canonicalRole(r) == requiredRole {
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

func canonicalRole(role string) string {
	switch strings.ToLower(strings.TrimSpace(role)) {
	case "vendedor", "seller":
		return "seller"
	case "entregador", "driver":
		return "driver"
	case "cliente", "customer":
		return "customer"
	case "administrador", "admin":
		return "admin"
	default:
		return strings.ToLower(strings.TrimSpace(role))
	}
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

func PreferredUsername(ctx context.Context) string {
	if v, ok := ctx.Value(preferredNameKey).(string); ok {
		return v
	}
	return ""
}

func UserEmail(ctx context.Context) string {
	if v, ok := ctx.Value(userEmailKey).(string); ok {
		return v
	}
	return ""
}

func UserName(ctx context.Context) string {
	if v, ok := ctx.Value(userNameKey).(string); ok {
		return v
	}
	return ""
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
