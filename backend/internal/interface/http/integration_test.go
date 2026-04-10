package http

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

func TestEndToEndOrderFlow(t *testing.T) {
	client := prepareTestDB(t)
	defer client.Close()

	h := &Handlers{DB: client}
	ctx := context.Background()

	// 1. Setup Data
	s, _ := client.Seller.Create().SetID("seller-1").SetName("Test Seller").SetDocument("123").Save(ctx)
	cat, _ := client.Category.Create().SetID("cat-1").SetName("Drinks").SetSlug("drinks").Save(ctx)
	_, _ = client.Product.Create().
		SetID("prod-1").
		SetName("Beer").
		SetPrice(10.0).
		SetSeller(s).
		SetCategory(cat).
		SetSlug("beer").
		Save(ctx)
	_, _ = client.User.Create().SetID("user-1").SetEmail("test@test.com").SetName("Test User").Save(ctx)

	// 2. Add to Cart
	payload := map[string]any{"product_id": "prod-1", "quantity": 2}
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "/api/v1/cart/items", bytes.NewBuffer(body))
	req = req.WithContext(context.WithValue(req.Context(), userIDKey, "user-1"))
	
	rr := httptest.NewRecorder()
	// Create cart first as expected by handler
	_, _ = client.Cart.Create().SetID("user-1-cart").SetUserID("user-1").Save(ctx)
	
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
	ords, _ := client.Order.Query().All(ctx)
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
