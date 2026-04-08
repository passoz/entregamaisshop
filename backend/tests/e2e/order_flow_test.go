package e2e

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	apihttp "github.com/entregamais/platform/backend/internal/interface/http"
	"github.com/entregamais/platform/backend/internal/infrastructure/config"
	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
)

func TestOrderFlowMinimal(t *testing.T) {
	r := apihttp.NewRouter(config.Config{AppName: "test", Environment: "test", Port: "8080"}, logger.New("test", "test"))

	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/orders", bytes.NewBufferString(`{"items": [{"product_id": "prod-1", "quantity": 2}]}`))
	createRR := httptest.NewRecorder()
	r.ServeHTTP(createRR, createReq)
	if createRR.Code != http.StatusCreated {
		t.Fatalf("expected 201 got %d", createRR.Code)
	}

	listReq := httptest.NewRequest(http.MethodGet, "/api/v1/orders/me", nil)
	listRR := httptest.NewRecorder()
	r.ServeHTTP(listRR, listReq)
	if listRR.Code != http.StatusOK {
		t.Fatalf("expected 200 got %d", listRR.Code)
	}
}
