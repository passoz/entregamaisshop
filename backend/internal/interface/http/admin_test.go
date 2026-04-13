package http

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/entregamais/platform/backend/ent/seller"
)

func TestAdminDashboard(t *testing.T) {
	client := prepareTestDB(t)
	defer client.Close()
	h := &Handlers{DB: client}
	ctx := context.Background()

	// Seed some data
	_, _ = client.User.Create().SetID("user-1").SetEmail("u1@t.com").SetName("U1").Save(ctx)
	_, _ = client.Seller.Create().SetID("s-1").SetName("S1").SetStatus("active").SetDocument("1").Save(ctx)
	_, _ = client.Seller.Create().SetID("s-2").SetName("S2").SetStatus("pending").SetDocument("2").Save(ctx)
	_, _ = client.Order.Create().SetID("o-1").SetCustomerID("user-1").SetSellerID("s-1").SetTotalAmount(150.50).Save(ctx)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/dashboard", nil)
	rr := httptest.NewRecorder()

	h.AdminDashboard(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var response struct {
		Data struct {
			TotalSales          float64 `json:"total_sales"`
			NewUsers            int     `json:"new_users"`
			ActiveSellers       int     `json:"active_sellers"`
			PendingSellersCount int     `json:"pending_sellers_count"`
		} `json:"data"`
	}
	json.Unmarshal(rr.Body.Bytes(), &response)

	if response.Data.TotalSales != 150.50 {
		t.Errorf("expected 150.50 sales, got %.2f", response.Data.TotalSales)
	}
	if response.Data.ActiveSellers != 1 {
		t.Errorf("expected 1 active seller, got %d", response.Data.ActiveSellers)
	}
	if response.Data.PendingSellersCount != 1 {
		t.Errorf("expected 1 pending seller, got %d", response.Data.PendingSellersCount)
	}
}

func TestSellersListFilter(t *testing.T) {
	client := prepareTestDB(t)
	defer client.Close()
	h := &Handlers{DB: client}
	ctx := context.Background()

	// Only active sellers should be returned
	_, _ = client.Seller.Create().SetID("s-active").SetName("Active").SetStatus("active").SetDocument("1").Save(ctx)
	_, _ = client.Seller.Create().SetID("s-pending").SetName("Pending").SetStatus("pending").SetDocument("2").Save(ctx)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/sellers", nil)
	rr := httptest.NewRecorder()

	h.SellersList(rr, req)

	var response struct {
		Data []any `json:"data"`
	}
	json.Unmarshal(rr.Body.Bytes(), &response)

	if len(response.Data) != 1 {
		t.Errorf("expected 1 active seller, got %d", len(response.Data))
	}
}

func TestAdminSellerApprove(t *testing.T) {
	client := prepareTestDB(t)
	defer client.Close()
	h := &Handlers{DB: client}
	ctx := context.Background()

	s, _ := client.Seller.Create().SetID("s-pend").SetName("To Approve").SetStatus("pending").SetDocument("3").Save(ctx)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/sellers/s-pend/approve", nil)
	req.SetPathValue("id", "s-pend")
	rr := httptest.NewRecorder()

	h.AdminSellerApprove(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}

	updated, _ := client.Seller.Get(ctx, "s-pend")
	if updated.Status != seller.StatusActive {
		t.Errorf("expected status active, got %s", updated.Status)
	}
}
