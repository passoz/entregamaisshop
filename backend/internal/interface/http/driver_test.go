package http

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestDriverOrderLifecycle(t *testing.T) {
	client := prepareTestDB(t)
	defer client.Close()
	h := &Handlers{DB: client}
	ctx := context.Background()

	// 1. Seed data
	mustCreateUser(t, client, "customer-1", "c@t.com", "C")
	mustCreateUser(t, client, "driver-1", "d@t.com", "D")
	mustCreateDriverProfile(t, client, "d-entregador-1", "driver-1")
	mustCreateSeller(t, client, "s-1", "S1", "1", "")

	// Create a READY order
	ord := mustCreateOrder(t, client, "order-1", "customer-1", "s-1", "ready", 100)

	// 2. Driver Accepts Order
	req := httptest.NewRequest(http.MethodPost, "/api/v1/driver/orders/order-1/accept", nil)
	req.SetPathValue("id", "order-1")
	req = req.WithContext(context.WithValue(req.Context(), userIDKey, "driver-1"))
	rr := httptest.NewRecorder()

	h.DriverOrderAccept(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("accept: expected 200, got %d", rr.Code)
	}

	// 3. Driver Pickups Order
	req = httptest.NewRequest(http.MethodPost, "/api/v1/driver/orders/order-1/pickup", nil)
	req.SetPathValue("id", "order-1")
	rr = httptest.NewRecorder()
	h.DriverOrderPickup(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("pickup: expected 200, got %d", rr.Code)
	}

	// 4. Driver Delivers Order
	req = httptest.NewRequest(http.MethodPost, "/api/v1/driver/orders/order-1/deliver", nil)
	req.SetPathValue("id", "order-1")
	rr = httptest.NewRecorder()
	h.DriverOrderDeliver(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("deliver: expected 200, got %d", rr.Code)
	}

	// 5. Final Status Check
	final, _ := client.Order.Get(ctx, ord.ID)
	if final.Status != "delivered" {
		t.Errorf("expected status delivered, got %s", final.Status)
	}
}
