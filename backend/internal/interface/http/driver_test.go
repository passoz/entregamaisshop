package http

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/entregamais/platform/backend/ent/order"
)

func TestDriverOrderLifecycle(t *testing.T) {
	client := prepareTestDB(t)
	defer client.Close()
	h := &Handlers{DB: client}
	ctx := context.Background()

	// 1. Seed data
	_, _ = client.User.Create().SetID("customer-1").SetEmail("c@t.com").SetName("C").Save(ctx)
	_, _ = client.User.Create().SetID("driver-1").SetEmail("d@t.com").SetName("D").Save(ctx)
	_, _ = client.Entregador.Create().SetID("d-entregador-1").SetUserID("driver-1").Save(ctx)
	_, _ = client.Seller.Create().SetID("s-1").SetName("S1").SetDocument("1").Save(ctx)
	
	// Create a READY order
	ord, _ := client.Order.Create().
		SetID("order-1").
		SetCustomerID("customer-1").
		SetSellerID("s-1").
		SetTotalAmount(100).
		SetStatus("ready").
		Save(ctx)

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
	if final.Status != order.StatusDelivered {
		t.Errorf("expected status delivered, got %s", final.Status)
	}
}
