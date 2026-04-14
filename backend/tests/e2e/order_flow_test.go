package e2e

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/entregamais/platform/backend/tests/testutil"
)

func TestOrderFlowMinimal(t *testing.T) {
	db := testutil.MustOpenTestDB(t, "order_flow")
	defer db.Close()

	testutil.MustCreateUser(t, db, "user-1", "user-1@test.local", "User 1")
	testutil.MustCreateSeller(t, db, "seller-1", "Seller 1", "doc-1", "active")
	testutil.MustCreateCategory(t, db, "cat-1", "Categoria 1", "categoria-1")
	testutil.MustCreateProduct(t, db, "prod-1", "seller-1", "cat-1", "Produto 1", "produto-1", 10)

	r := testutil.NewTestRouter(db)

	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/orders", bytes.NewBufferString(`{"seller_id":"seller-1","total_amount":20,"delivery_address":"Rua Teste, 123 - Sao Paulo/SP","items":[{"product_id":"prod-1","quantity":2,"price":10}]}`))
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
