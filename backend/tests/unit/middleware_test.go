package unit

import (
	"net/http"
	"net/http/httptest"
	"testing"

	apihttp "github.com/entregamais/platform/backend/internal/interface/http"
	"github.com/entregamais/platform/backend/internal/infrastructure/config"
	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
)

func TestRequestAndCorrelationHeaders(t *testing.T) {
	r := apihttp.NewRouter(config.Config{AppName: "test", Environment: "test", Port: "8080"}, logger.New("test", "test"))
	req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	rr := httptest.NewRecorder()

	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	if rr.Header().Get("X-Request-ID") == "" {
		t.Fatal("expected X-Request-ID")
	}
	if rr.Header().Get("X-Correlation-ID") == "" {
		t.Fatal("expected X-Correlation-ID")
	}
}
