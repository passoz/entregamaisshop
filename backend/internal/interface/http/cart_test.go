package http

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCartUpdateAndDelete(t *testing.T) {
	client := prepareTestDB(t)
	defer client.Close()
	h := &Handlers{DB: client}
	ctx := context.Background()

	// 1. Seed data
	_, _ = client.User.Create().SetID("user-1").SetEmail("u@t.com").SetName("U").Save(ctx)
	c, _ := client.Cart.Create().SetID("user-1-cart").SetUserID("user-1").Save(ctx)
	s, _ := client.Seller.Create().SetID("s-1").SetName("S1").SetDocument("1").Save(ctx)
	p, _ := client.Product.Create().SetID("p-1").SetName("P1").SetPrice(10).SetSeller(s).SetSlug("p1").Save(ctx)
	
	itemID := fmt.Sprintf("%s-%s", c.ID, p.ID)
	_, _ = client.CartItem.Create().
		SetID(itemID).
		SetCart(c).
		SetProduct(p).
		SetQuantity(1).
		SetUnitPrice(10).
		Save(ctx)

	// 2. Update Quantity
	body := bytes.NewBufferString(`{"quantity":5}`)
	req := httptest.NewRequest(http.MethodPut, "/api/v1/cart/items/"+itemID, body)
	req.SetPathValue("id", itemID)
	rr := httptest.NewRecorder()
	h.CartUpdateItem(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("update: expected 200, got %d", rr.Code)
	}

	updated, _ := client.CartItem.Get(ctx, itemID)
	if updated.Quantity != 5 {
		t.Errorf("expected quantity 5, got %d", updated.Quantity)
	}

	// 3. Delete Item
	req = httptest.NewRequest(http.MethodDelete, "/api/v1/cart/items/"+itemID, nil)
	req.SetPathValue("id", itemID)
	rr = httptest.NewRecorder()
	h.CartDeleteItem(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("delete: expected 200, got %d", rr.Code)
	}

	exists, _ := client.CartItem.Query().Count(ctx)
	if exists != 0 {
		t.Errorf("expected 0 items, got %d", exists)
	}
}
