package unit

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/entregamais/platform/backend/tests/testutil"
)

func TestRequestAndCorrelationHeaders(t *testing.T) {
	r := testutil.NewTestRouter(nil)
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
