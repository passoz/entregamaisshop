package http

import (
	"bytes"
	"context"
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
	mustCreateUser(t, client, "user-1", "u@t.com", "U")
	c := mustCreateCart(t, client, "user-1-cart", "user-1")
	mustCreateSeller(t, client, "s-1", "S1", "1", "")
	mustCreateCategory(t, client, "cat-1", "Categoria", "categoria")
	p := mustCreateProduct(t, client, "p-1", "s-1", "cat-1", "P1", "p1", 10)

	itemID := fmt.Sprintf("%s-%s", c.ID, p.ID)
	if _, err := client.CartItem.Create().
		SetID(itemID).
		SetCart(c).
		SetProduct(p).
		SetQuantity(1).
		SetUnitPrice(10).
		Save(ctx); err != nil {
		t.Fatalf("seed cart item: %v", err)
	}

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
