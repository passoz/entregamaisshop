package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/entregamais/platform/backend/internal/infrastructure/config"
	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
)

func TestHealthHandler(t *testing.T) {
	cfg := config.Config{AppName: "test-app"}
	lg := logger.New("test", "test")
	h := &Handlers{Config: cfg, Logger: lg}

	req, err := http.NewRequest("GET", "/api/v1/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(h.Health)

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var response map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	if response["status"] != "ok" {
		t.Errorf("expected status ok, got %v", response["status"])
	}
	if response["service"] != "test-app" {
		t.Errorf("expected service test-app, got %v", response["service"])
	}
}

func TestReadyHandler(t *testing.T) {
	h := &Handlers{}
	req, _ := http.NewRequest("GET", "/api/v1/ready", nil)
	rr := httptest.NewRecorder()
	http.HandlerFunc(h.Ready).ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %v", rr.Code)
	}
}

func TestCategoriesList(t *testing.T) {
	h := &Handlers{}
	req, _ := http.NewRequest("GET", "/api/v1/categories", nil)
	rr := httptest.NewRecorder()
	http.HandlerFunc(h.CategoriesList).ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %v", rr.Code)
	}

	var response struct {
		Data []any `json:"data"`
	}
	json.Unmarshal(rr.Body.Bytes(), &response)

	if len(response.Data) == 0 {
		t.Errorf("expected categories, got 0")
	}
}
