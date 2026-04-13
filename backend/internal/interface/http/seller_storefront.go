package http

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/entregamais/platform/backend/ent"
	"github.com/entregamais/platform/backend/ent/seller"
	"github.com/entregamais/platform/backend/ent/sellerdeliveryarea"
	"github.com/entregamais/platform/backend/ent/sellerreview"
	"github.com/entregamais/platform/backend/ent/selleruser"
	"github.com/entregamais/platform/backend/ent/user"
)

type sellerDeliveryAreaResponse struct {
	ID       string  `json:"id"`
	Label    string  `json:"label"`
	Fee      float64 `json:"fee"`
	FeeLabel string  `json:"fee_label"`
}

type sellerReviewResponse struct {
	ID           string `json:"id"`
	Score        int    `json:"score"`
	Comment      string `json:"comment,omitempty"`
	CustomerID   string `json:"customer_id"`
	CustomerName string `json:"customer_name"`
	CreatedAt    string `json:"created_at"`
}

type sellerResponse struct {
	ID             string                       `json:"id"`
	Name           string                       `json:"name"`
	Document       string                       `json:"document"`
	Status         string                       `json:"status"`
	CreatedAt      string                       `json:"created_at"`
	Rating         float64                      `json:"rating"`
	ReviewCount    int                          `json:"review_count"`
	MinDeliveryFee float64                      `json:"min_delivery_fee"`
	FeeLabel       string                       `json:"fee_label"`
	DeliveryAreas  []sellerDeliveryAreaResponse `json:"delivery_areas"`
	Reviews        []sellerReviewResponse       `json:"reviews,omitempty"`
}

func (h *Handlers) resolveSellerForUser(ctx context.Context) (*ent.Seller, error) {
	uid := UserID(ctx)
	return h.DB.SellerUser.Query().
		Where(selleruser.HasUserWith(user.IDEQ(uid))).
		QuerySeller().
		WithDeliveryAreas(func(q *ent.SellerDeliveryAreaQuery) {
			q.Order(ent.Asc(sellerdeliveryarea.FieldFee))
		}).
		WithReviews(func(q *ent.SellerReviewQuery) {
			q.WithCustomer()
			q.Order(ent.Desc(sellerreview.FieldCreatedAt))
		}).
		Only(ctx)
}

func formatBRL(value float64) string {
	formatted := fmt.Sprintf("%.2f", value)
	return "R$ " + strings.ReplaceAll(formatted, ".", ",")
}

func buildSellerResponse(item *ent.Seller, includeReviews bool) sellerResponse {
	reviews := item.Edges.Reviews
	deliveryAreas := item.Edges.DeliveryAreas

	rating := 5.0
	if len(reviews) > 0 {
		total := 0
		for _, review := range reviews {
			total += review.Score
		}
		rating = float64(total) / float64(len(reviews))
	}

	minDeliveryFee := 0.0
	if len(deliveryAreas) > 0 {
		minDeliveryFee = deliveryAreas[0].Fee
		for _, area := range deliveryAreas[1:] {
			if area.Fee < minDeliveryFee {
				minDeliveryFee = area.Fee
			}
		}
	}

	response := sellerResponse{
		ID:             item.ID,
		Name:           item.Name,
		Document:       item.Document,
		Status:         item.Status,
		CreatedAt:      item.CreatedAt.Format(time.RFC3339),
		Rating:         rating,
		ReviewCount:    len(reviews),
		MinDeliveryFee: minDeliveryFee,
		FeeLabel:       fmt.Sprintf("A partir de %s", formatBRL(minDeliveryFee)),
		DeliveryAreas:  make([]sellerDeliveryAreaResponse, 0, len(deliveryAreas)),
	}

	for _, area := range deliveryAreas {
		response.DeliveryAreas = append(response.DeliveryAreas, sellerDeliveryAreaResponse{
			ID:       area.ID,
			Label:    area.Label,
			Fee:      area.Fee,
			FeeLabel: formatBRL(area.Fee),
		})
	}

	if includeReviews {
		response.Reviews = make([]sellerReviewResponse, 0, len(reviews))
		for _, review := range reviews {
			customerName := "Cliente"
			customerID := ""
			if review.Edges.Customer != nil {
				customerName = review.Edges.Customer.Name
				customerID = review.Edges.Customer.ID
			}
			response.Reviews = append(response.Reviews, sellerReviewResponse{
				ID:           review.ID,
				Score:        review.Score,
				Comment:      review.Comment,
				CustomerID:   customerID,
				CustomerName: customerName,
				CreatedAt:    review.CreatedAt.Format(time.RFC3339),
			})
		}
	}

	return response
}

func (h *Handlers) SellerDeliveryAreasGet(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	item, err := h.resolveSellerForUser(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "seller profile not found"})
		return
	}
	writeSuccess(w, http.StatusOK, buildSellerResponse(item, false).DeliveryAreas, nil)
}

func (h *Handlers) SellerDeliveryAreasUpdate(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	item, err := h.resolveSellerForUser(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "seller profile not found"})
		return
	}

	var payload struct {
		Areas []struct {
			Label string  `json:"label"`
			Fee   float64 `json:"fee"`
		} `json:"areas"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	if err := h.WithTx(ctx, func(tx *ent.Tx) error {
		if _, err := tx.SellerDeliveryArea.Delete().Where(sellerdeliveryarea.HasSellerWith(seller.IDEQ(item.ID))).Exec(ctx); err != nil {
			return err
		}

		for _, area := range payload.Areas {
			if _, err := tx.SellerDeliveryArea.Create().
				SetID(newID()).
				SetLabel(area.Label).
				SetFee(area.Fee).
				SetSellerID(item.ID).
				Save(ctx); err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to update delivery areas"})
		return
	}

	updated, err := h.DB.Seller.Query().
		Where(seller.IDEQ(item.ID)).
		WithDeliveryAreas(func(q *ent.SellerDeliveryAreaQuery) {
			q.Order(ent.Asc(sellerdeliveryarea.FieldFee))
		}).
		WithReviews(func(q *ent.SellerReviewQuery) {
			q.WithCustomer()
			q.Order(ent.Desc(sellerreview.FieldCreatedAt))
		}).
		Only(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to reload seller profile"})
		return
	}

	writeSuccess(w, http.StatusOK, buildSellerResponse(updated, false).DeliveryAreas, nil)
}

func (h *Handlers) SellerReviewCreate(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	sellerID := r.PathValue("id")
	uid := UserID(ctx)
	if err := h.ensureUserExists(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to sync user"})
		return
	}

	var payload struct {
		Score   int    `json:"score"`
		Comment string `json:"comment"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	if payload.Score < 1 || payload.Score > 5 {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "score must be between 1 and 5"})
		return
	}

	if _, err := h.DB.Seller.Get(ctx, sellerID); err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "seller not found"})
		return
	}

	item, err := h.DB.SellerReview.Create().
		SetID(newID()).
		SetScore(payload.Score).
		SetComment(payload.Comment).
		SetSellerID(sellerID).
		SetCustomerID(uid).
		Save(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to create review"})
		return
	}

	writeSuccess(w, http.StatusCreated, map[string]any{
		"id":      item.ID,
		"score":   item.Score,
		"comment": item.Comment,
	}, nil)
}

func (h *Handlers) ensureUserExists(ctx context.Context) error {
	uid := UserID(ctx)
	exists, err := h.DB.User.Query().Where(user.IDEQ(uid)).Exist(ctx)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	name := UserName(ctx)
	if name == "" {
		name = PreferredUsername(ctx)
	}
	if name == "" {
		name = "Cliente"
	}

	email := UserEmail(ctx)
	if email == "" {
		email = fmt.Sprintf("%s@keycloak.local", uid)
	}

	_, err = h.DB.User.Create().
		SetID(uid).
		SetName(name).
		SetEmail(email).
		Save(ctx)
	return err
}
