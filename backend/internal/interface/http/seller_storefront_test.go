package http

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/entregamais/platform/backend/ent/user"
)

func seedSellerStorefrontData(t *testing.T) *Handlers {
	t.Helper()

	client := prepareTestDB(t)
	ctx := context.Background()

	mustCreateUser(t, client, "customer-1", "customer@test.com", "Cliente")
	mustCreateUser(t, client, "seller-owner-1", "seller@test.com", "Vendedor")
	mustCreateSeller(t, client, "seller-1", "Deposito Teste", "123", "")
	if _, err := client.SellerUser.Create().SetID("seller-user-1").SetSellerID("seller-1").SetUserID("seller-owner-1").SetRole("owner").Save(ctx); err != nil {
		t.Fatalf("seed seller user: %v", err)
	}
	if _, err := client.SellerDeliveryArea.Create().SetID("area-1").SetSellerID("seller-1").SetLabel("Cabo Frio").SetFee(0).Save(ctx); err != nil {
		t.Fatalf("seed delivery area area-1: %v", err)
	}
	if _, err := client.SellerDeliveryArea.Create().SetID("area-2").SetSellerID("seller-1").SetLabel("Arraial").SetFee(4.9).Save(ctx); err != nil {
		t.Fatalf("seed delivery area area-2: %v", err)
	}
	if _, err := client.SellerReview.Create().SetID("review-1").SetSellerID("seller-1").SetCustomerID("customer-1").SetScore(4).SetComment("Boa").Save(ctx); err != nil {
		t.Fatalf("seed review: %v", err)
	}

	return &Handlers{DB: client}
}

func TestSellersGetIncludesRatingAndFreightSummary(t *testing.T) {
	h := seedSellerStorefrontData(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/sellers/seller-1", nil)
	req.SetPathValue("id", "seller-1")
	rr := httptest.NewRecorder()

	h.SellersGet(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var response struct {
		Data struct {
			Rating         float64 `json:"rating"`
			ReviewCount    int     `json:"review_count"`
			MinDeliveryFee float64 `json:"min_delivery_fee"`
			FeeLabel       string  `json:"fee_label"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	if response.Data.Rating != 4 {
		t.Fatalf("expected rating 4, got %.2f", response.Data.Rating)
	}
	if response.Data.ReviewCount != 1 {
		t.Fatalf("expected review_count 1, got %d", response.Data.ReviewCount)
	}
	if response.Data.MinDeliveryFee != 0 {
		t.Fatalf("expected min_delivery_fee 0, got %.2f", response.Data.MinDeliveryFee)
	}
	if response.Data.FeeLabel != "A partir de R$ 0,00" {
		t.Fatalf("unexpected fee label: %s", response.Data.FeeLabel)
	}
}

func TestSellerReviewCreatePersistsReview(t *testing.T) {
	h := seedSellerStorefrontData(t)

	body := bytes.NewBufferString(`{"score":5,"comment":"Excelente"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/sellers/seller-1/reviews", body)
	req = req.WithContext(context.WithValue(req.Context(), userIDKey, "customer-1"))
	req.SetPathValue("id", "seller-1")
	rr := httptest.NewRecorder()

	h.SellerReviewCreate(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rr.Code, rr.Body.String())
	}

	count, err := h.DB.SellerReview.Query().Count(context.Background())
	if err != nil {
		t.Fatalf("failed counting reviews: %v", err)
	}
	if count != 2 {
		t.Fatalf("expected 2 reviews, got %d", count)
	}
}

func TestSellerDeliveryAreasUpdateReplacesAreasForLoggedSeller(t *testing.T) {
	h := seedSellerStorefrontData(t)

	body := bytes.NewBufferString(`{"areas":[{"label":"Buzios","fee":7.9},{"label":"Cabo Frio","fee":0}]}`)
	req := httptest.NewRequest(http.MethodPut, "/api/v1/vendedor/delivery-areas", body)
	req = req.WithContext(context.WithValue(req.Context(), userIDKey, "seller-owner-1"))
	rr := httptest.NewRecorder()

	h.SellerDeliveryAreasUpdate(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	areas, err := h.DB.SellerDeliveryArea.Query().All(context.Background())
	if err != nil {
		t.Fatalf("failed querying areas: %v", err)
	}
	if len(areas) != 2 {
		t.Fatalf("expected 2 areas, got %d", len(areas))
	}
}

func TestSellerReviewCreateSyncsAuthenticatedUserWhenMissing(t *testing.T) {
	h := seedSellerStorefrontData(t)

	body := bytes.NewBufferString(`{"score":5}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/sellers/seller-1/reviews", body)
	ctx := context.WithValue(req.Context(), userIDKey, "keycloak-user-123")
	ctx = context.WithValue(ctx, preferredNameKey, "cliente.keycloak")
	req = req.WithContext(ctx)
	req.SetPathValue("id", "seller-1")
	rr := httptest.NewRecorder()

	h.SellerReviewCreate(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rr.Code, rr.Body.String())
	}

	exists, err := h.DB.User.Query().Where(user.IDEQ("keycloak-user-123")).Exist(context.Background())
	if err != nil {
		t.Fatalf("failed querying synced user: %v", err)
	}
	if !exists {
		t.Fatal("expected synced keycloak user to exist in DB")
	}
}
