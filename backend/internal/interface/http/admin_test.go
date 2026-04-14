package http

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAdminDashboard(t *testing.T) {
	client := prepareTestDB(t)
	defer client.Close()
	h := &Handlers{DB: client}

	// Seed some data
	mustCreateUser(t, client, "user-1", "u1@t.com", "U1")
	mustCreateSeller(t, client, "s-1", "S1", "1", "active")
	mustCreateSeller(t, client, "s-2", "S2", "2", "pending")
	mustCreateOrder(t, client, "o-1", "user-1", "s-1", "", 150.50)

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

	// Only active sellers should be returned
	mustCreateSeller(t, client, "s-active", "Active", "1", "active")
	mustCreateSeller(t, client, "s-pending", "Pending", "2", "pending")

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

	mustCreateSeller(t, client, "s-pend", "To Approve", "3", "pending")

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/sellers/s-pend/approve", nil)
	req.SetPathValue("id", "s-pend")
	rr := httptest.NewRecorder()

	h.AdminSellerApprove(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}

	updated, _ := client.Seller.Get(ctx, "s-pend")
	if updated.Status != "active" {
		t.Errorf("expected status active, got %s", updated.Status)
	}
}
