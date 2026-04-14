package http

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestEndToEndOrderFlow(t *testing.T) {
	client := prepareTestDB(t)
	defer client.Close()

	h := &Handlers{DB: client}
	ctx := context.Background()

	// 1. Setup Data
	mustCreateSeller(t, client, "seller-1", "Test Seller", "123", "")
	mustCreateCategory(t, client, "cat-1", "Drinks", "drinks")
	mustCreateProduct(t, client, "prod-1", "seller-1", "cat-1", "Beer", "beer", 10.0)
	mustCreateUser(t, client, "user-1", "test@test.com", "Test User")

	// 2. Add to Cart
	payload := map[string]any{"product_id": "prod-1", "quantity": 2}
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "/api/v1/cart/items", bytes.NewBuffer(body))
	req = req.WithContext(context.WithValue(req.Context(), userIDKey, "user-1"))

	rr := httptest.NewRecorder()
	// Create cart first as expected by handler
	mustCreateCart(t, client, "user-1-cart", "user-1")

	h.CartCreateItem(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("expected 201, got %v: %s", rr.Code, rr.Body.String())
	}

	// 3. Checkout
	checkoutPayload := map[string]any{
		"seller_id":    "seller-1",
		"total_amount": 20.0,
		"items": []map[string]any{
			{"product_id": "prod-1", "quantity": 2, "price": 10.0},
		},
	}
	body, _ = json.Marshal(checkoutPayload)
	req, _ = http.NewRequest("POST", "/api/v1/orders", bytes.NewBuffer(body))
	req = req.WithContext(context.WithValue(req.Context(), userIDKey, "user-1"))
	rr = httptest.NewRecorder()
	h.OrderCreate(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("expected 201, got %v: %s", rr.Code, rr.Body.String())
	}

	// 4. Verify Order
	req, _ = http.NewRequest("GET", "/api/v1/orders/me", nil)
	req = req.WithContext(context.WithValue(req.Context(), userIDKey, "user-1"))
	rr = httptest.NewRecorder()
	h.OrderMine(rr, req)

	var response struct {
		Data []any `json:"data"`
	}
	json.Unmarshal(rr.Body.Bytes(), &response)
	if len(response.Data) != 1 {
		t.Errorf("expected 1 order, got %v: %s", len(response.Data), rr.Body.String())
	}

	// 5. Seller Confirm
	ords, err := client.Order.Query().All(ctx)
	if err != nil {
		t.Fatalf("query orders: %v", err)
	}
	orderID := ords[0].ID

	req, _ = http.NewRequest("POST", "/api/v1/vendedor/orders/"+orderID+"/confirm", nil)
	req.SetPathValue("id", orderID)
	rr = httptest.NewRecorder()
	h.SellerOrderConfirm(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %v: %s", rr.Code, rr.Body.String())
	}

	updatedOrder, _ := client.Order.Get(ctx, orderID)
	if updatedOrder.Status != "confirmed" {
		t.Errorf("expected status confirmed, got %v", updatedOrder.Status)
	}
}
