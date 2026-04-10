package http

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/entregamais/platform/backend/ent"
	"github.com/entregamais/platform/backend/ent/cart"
	"github.com/entregamais/platform/backend/ent/cartitem"
	"github.com/entregamais/platform/backend/ent/entregador"
	"github.com/entregamais/platform/backend/ent/order"
	"github.com/entregamais/platform/backend/ent/product"
	"github.com/entregamais/platform/backend/ent/seller"
	"github.com/entregamais/platform/backend/ent/sellerdeliveryarea"
	"github.com/entregamais/platform/backend/ent/sellerreview"
	"github.com/entregamais/platform/backend/ent/selleruser"
	"github.com/entregamais/platform/backend/ent/user"
	"github.com/entregamais/platform/backend/internal/infrastructure/config"
	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
)

type Handlers struct {
	Config config.Config
	Logger *logger.Logger
	DB     *ent.Client
}

func (h *Handlers) Health(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusOK, map[string]any{"status": "ok", "service": h.Config.AppName, "time": time.Now().UTC()}, nil)
}

func (h *Handlers) Ready(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusOK, map[string]any{"status": "ready"}, nil)
}

func (h *Handlers) Live(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusOK, map[string]any{"status": "alive"}, nil)
}

func (h *Handlers) CategoriesList(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	list, err := h.DB.Category.Query().All(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to query categories"})
		return
	}
	writeSuccess(w, http.StatusOK, list, map[string]any{"total": len(list)})
}

func (h *Handlers) SellersList(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	list, err := h.DB.Seller.Query().
		Where(seller.StatusEQ("active")).
		WithDeliveryAreas(func(q *ent.SellerDeliveryAreaQuery) {
			q.Order(ent.Asc(sellerdeliveryarea.FieldFee))
		}).
		WithReviews(func(q *ent.SellerReviewQuery) {
			q.WithCustomer()
			q.Order(ent.Desc(sellerreview.FieldCreatedAt))
		}).
		All(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to query sellers"})
		return
	}
	response := make([]sellerResponse, 0, len(list))
	for _, item := range list {
		response = append(response, buildSellerResponse(item, false))
	}
	writeSuccess(w, http.StatusOK, response, nil)
}

func (h *Handlers) SellersGet(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")
	item, err := h.DB.Seller.Query().
		Where(seller.IDEQ(id)).
		WithDeliveryAreas(func(q *ent.SellerDeliveryAreaQuery) {
			q.Order(ent.Asc(sellerdeliveryarea.FieldFee))
		}).
		WithReviews(func(q *ent.SellerReviewQuery) {
			q.WithCustomer()
			q.Order(ent.Desc(sellerreview.FieldCreatedAt))
		}).
		Only(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "seller not found"})
		return
	}
	writeSuccess(w, http.StatusOK, buildSellerResponse(item, true), nil)
}

func (h *Handlers) SellersProducts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")
	list, err := h.DB.Product.Query().Where(product.HasSellerWith(seller.IDEQ(id))).All(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to query products"})
		return
	}
	writeSuccess(w, http.StatusOK, list, nil)
}

func (h *Handlers) ProductsList(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	list, err := h.DB.Product.Query().All(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to query products"})
		return
	}
	writeSuccess(w, http.StatusOK, list, map[string]any{"total": len(list)})
}

func (h *Handlers) ProductsGet(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")
	item, err := h.DB.Product.Get(ctx, id)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "product not found"})
		return
	}
	writeSuccess(w, http.StatusOK, item, nil)
}

func (h *Handlers) CartGet(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(ctx)

	// Create cart if not exists
	c, err := h.DB.Cart.Query().Where(cart.HasUserWith(user.IDEQ(uid))).WithItems(func(q *ent.CartItemQuery) { q.WithProduct() }).Only(ctx)
	if ent.IsNotFound(err) {
		c, err = h.DB.Cart.Create().SetUserID(uid).SetID(uid + "-cart").Save(ctx)
		if err != nil {
			writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to create cart"})
			return
		}
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to get cart"})
		return
	}
	writeSuccess(w, http.StatusOK, c, nil)
}

func (h *Handlers) CartCreateItem(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(ctx)

	var payload struct {
		ProductID string `json:"product_id"`
		Quantity  int    `json:"quantity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	c, err := h.DB.Cart.Query().Where(cart.HasUserWith(user.IDEQ(uid))).Only(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "cart not found"})
		return
	}

	p, err := h.DB.Product.Get(ctx, payload.ProductID)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "product not found"})
		return
	}

	item, err := h.DB.CartItem.Create().
		SetCart(c).
		SetProduct(p).
		SetQuantity(payload.Quantity).
		SetUnitPrice(p.Price).
		SetID(fmt.Sprintf("%s-%s", c.ID, payload.ProductID)).
		Save(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to add item to cart"})
		return
	}
	writeSuccess(w, http.StatusCreated, item, nil)
}
func (h *Handlers) CartUpdateItem(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")
	var payload struct {
		Quantity int `json:"quantity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	item, err := h.DB.CartItem.UpdateOneID(id).SetQuantity(payload.Quantity).Save(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to update item"})
		return
	}
	writeSuccess(w, http.StatusOK, item, nil)
}

func (h *Handlers) CartDeleteItem(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")
	if err := h.DB.CartItem.DeleteOneID(id).Exec(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to delete item"})
		return
	}
	writeSuccess(w, http.StatusOK, map[string]any{"status": "deleted"}, nil)
}

func (h *Handlers) OrderCreate(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(ctx)

	var payload struct {
		SellerID        string  `json:"seller_id"`
		TotalAmount     float64 `json:"total_amount"`
		DeliveryAddress string  `json:"delivery_address"`
		Items           []struct {
			ProductID string  `json:"product_id"`
			Quantity  int     `json:"quantity"`
			Price     float64 `json:"price"`
		} `json:"items"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	// Transaction to create order and items
	err := h.WithTx(ctx, func(tx *ent.Tx) error {
		addressJSON := "{}"
		if payload.DeliveryAddress != "" {
			addressJSON = fmt.Sprintf(`{"raw": "%s"}`, payload.DeliveryAddress)
		}

		ord, err := tx.Order.Create().
			SetID(newID()).
			SetCustomerID(uid).
			SetSellerID(payload.SellerID).
			SetTotalAmount(payload.TotalAmount).
			SetDeliveryAddressJSON(addressJSON).
			Save(ctx)
		if err != nil {
			return err
		}

		for _, it := range payload.Items {
			_, err = tx.OrderItem.Create().
				SetID(newID()).
				SetOrder(ord).
				SetProductID(it.ProductID).
				SetQuantity(it.Quantity).
				SetUnitPrice(it.Price).
				SetTotalPrice(it.Price * float64(it.Quantity)).
				Save(ctx)
			if err != nil {
				return err
			}
		}

		// Clear cart after order
		_, err = tx.CartItem.Delete().Where(cartitem.HasCartWith(cart.HasUserWith(user.IDEQ(uid)))).Exec(ctx)
		return err
	})

	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to create order"})
		return
	}

	writeSuccess(w, http.StatusCreated, map[string]any{"status": "created"}, nil)
}

func (h *Handlers) OrderGet(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")
	item, err := h.DB.Order.Query().Where(order.IDEQ(id)).WithItems(func(q *ent.OrderItemQuery) { q.WithProduct() }).Only(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "order not found"})
		return
	}
	writeSuccess(w, http.StatusOK, item, nil)
}

func (h *Handlers) OrderMine(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(ctx)
	list, err := h.DB.Order.Query().
		Where(order.HasCustomerWith(user.IDEQ(uid))).
		WithSeller().
		WithItems(func(q *ent.OrderItemQuery) {
			q.WithProduct()
		}).
		Order(ent.Desc(order.FieldCreatedAt)).
		All(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to query orders"})
		return
	}
	writeSuccess(w, http.StatusOK, list, nil)
}

func (h *Handlers) WithTx(ctx context.Context, fn func(*ent.Tx) error) error {
	tx, err := h.DB.Tx(ctx)
	if err != nil {
		return err
	}
	defer func() {
		if v := recover(); v != nil {
			tx.Rollback()
			panic(v)
		}
	}()
	if err := fn(tx); err != nil {
		if rerr := tx.Rollback(); rerr != nil {
			err = fmt.Errorf("failed to rollback transaction: %v (original error: %w)", rerr, err)
		}
		return err
	}
	return tx.Commit()
}

func (h *Handlers) SellerProfile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	item, err := h.resolveSellerForUser(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "seller profile not found"})
		return
	}
	writeSuccess(w, http.StatusOK, buildSellerResponse(item, true), nil)
}

func (h *Handlers) SellerProductsList(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	sid := r.URL.Query().Get("seller_id")
	if sid == "" {
		item, err := h.DB.SellerUser.Query().
			Where(selleruser.HasUserWith(user.IDEQ(UserID(ctx)))).
			QuerySeller().
			Only(ctx)
		if err != nil {
			writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "seller profile not found"})
			return
		}
		sid = item.ID
	}
	list, err := h.DB.Product.Query().Where(product.HasSellerWith(seller.IDEQ(sid))).All(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to query products"})
		return
	}
	writeSuccess(w, http.StatusOK, list, nil)
}

func (h *Handlers) SellerProductsCreate(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var payload struct {
		Name       string  `json:"name"`
		Price      float64 `json:"price"`
		SellerID   string  `json:"seller_id"`
		CategoryID string  `json:"category_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}
	item, err := h.DB.Product.Create().
		SetID(newID()).
		SetName(payload.Name).
		SetPrice(payload.Price).
		SetSellerID(payload.SellerID).
		SetCategoryID(payload.CategoryID).
		SetSlug(strings.ToLower(strings.ReplaceAll(payload.Name, " ", "-"))).
		Save(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to create product"})
		return
	}
	writeSuccess(w, http.StatusCreated, item, nil)
}

func (h *Handlers) SellerProductsGet(w http.ResponseWriter, r *http.Request) { h.ProductsGet(w, r) }

func (h *Handlers) SellerProductsUpdate(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")
	var payload map[string]any
	json.NewDecoder(r.Body).Decode(&payload)
	// Dynamic update would be better, but for demo:
	item, err := h.DB.Product.UpdateOneID(id).SetName(payload["name"].(string)).Save(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to update product"})
		return
	}
	writeSuccess(w, http.StatusOK, item, nil)
}

func (h *Handlers) SellerProductsDelete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")
	h.DB.Product.DeleteOneID(id).Exec(ctx)
	writeSuccess(w, http.StatusOK, map[string]any{"status": "deleted"}, nil)
}

func (h *Handlers) SellerInventoryList(w http.ResponseWriter, r *http.Request) {
	// Mock or implement inventory table
	writeSuccess(w, http.StatusOK, []any{}, nil)
}

func (h *Handlers) SellerInventoryUpdate(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusOK, map[string]any{"status": "updated"}, nil)
}

func (h *Handlers) SellerOrdersList(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	sid := r.URL.Query().Get("seller_id")
	list, err := h.DB.Order.Query().
		Where(order.HasSellerWith(seller.IDEQ(sid))).
		WithItems(func(q *ent.OrderItemQuery) {
			q.WithProduct()
		}).
		Order(ent.Desc(order.FieldCreatedAt)).
		All(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to query orders"})
		return
	}
	writeSuccess(w, http.StatusOK, list, nil)
}

func (h *Handlers) SellerOrdersGet(w http.ResponseWriter, r *http.Request) { h.OrderGet(w, r) }

func (h *Handlers) SellerOrderConfirm(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	h.DB.Order.UpdateOneID(id).SetStatus("confirmed").Exec(r.Context())
	writeSuccess(w, http.StatusOK, map[string]any{"status": "confirmed"}, nil)
}

func (h *Handlers) SellerOrderPrepare(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	h.DB.Order.UpdateOneID(id).SetStatus("preparing").Exec(r.Context())
	writeSuccess(w, http.StatusOK, map[string]any{"status": "preparing"}, nil)
}

func (h *Handlers) SellerOrderReady(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	h.DB.Order.UpdateOneID(id).SetStatus("ready").Exec(r.Context())
	writeSuccess(w, http.StatusOK, map[string]any{"status": "ready"}, nil)
}

func (h *Handlers) DriverProfile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(ctx)
	item, err := h.DB.Entregador.Query().Where(entregador.HasUserWith(user.IDEQ(uid))).First(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "driver profile not found"})
		return
	}
	writeSuccess(w, http.StatusOK, item, nil)
}

func (h *Handlers) DriverOrdersList(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	// Show ready orders (available to pick up) or orders already handled by this driver
	list, err := h.DB.Order.Query().
		Where(order.StatusIn("ready", "accepted", "picked_up")).
		WithSeller().
		WithCustomer().
		Order(ent.Desc(order.FieldCreatedAt)).
		All(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to query orders"})
		return
	}
	writeSuccess(w, http.StatusOK, list, nil)
}

func (h *Handlers) DriverOrdersGet(w http.ResponseWriter, r *http.Request) { h.OrderGet(w, r) }

func (h *Handlers) DriverOrderAccept(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	uid := UserID(r.Context())
	h.DB.Order.UpdateOneID(id).SetStatus("accepted").SetDriverID(uid).Exec(r.Context())
	writeSuccess(w, http.StatusOK, map[string]any{"status": "accepted"}, nil)
}

func (h *Handlers) DriverOrderPickup(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	h.DB.Order.UpdateOneID(id).SetStatus("picked_up").Exec(r.Context())
	writeSuccess(w, http.StatusOK, map[string]any{"status": "picked_up"}, nil)
}

func (h *Handlers) DriverOrderDeliver(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	h.DB.Order.UpdateOneID(id).SetStatus("delivered").Exec(r.Context())
	writeSuccess(w, http.StatusOK, map[string]any{"status": "delivered"}, nil)
}

func (h *Handlers) DriverStatus(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusOK, map[string]any{"status": "online"}, nil)
}

func (h *Handlers) AdminSellerApprove(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")

	s, err := h.DB.Seller.UpdateOneID(id).SetStatus("active").Save(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to approve seller"})
		return
	}

	writeSuccess(w, http.StatusOK, s, nil)
}

func (h *Handlers) AdminDashboard(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusOK, map[string]any{"users": 100, "orders": 500}, nil)
}

func (h *Handlers) AdminSellersList(w http.ResponseWriter, r *http.Request) { h.SellersList(w, r) }
func (h *Handlers) AdminSellersCreate(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusCreated, map[string]any{"status": "created"}, nil)
}
func (h *Handlers) AdminDriversList(w http.ResponseWriter, r *http.Request) {
	list, _ := h.DB.Entregador.Query().All(r.Context())
	writeSuccess(w, http.StatusOK, list, nil)
}
func (h *Handlers) AdminDriversCreate(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusCreated, map[string]any{"status": "created"}, nil)
}
func (h *Handlers) AdminOrdersList(w http.ResponseWriter, r *http.Request) {
	list, _ := h.DB.Order.Query().All(r.Context())
	writeSuccess(w, http.StatusOK, list, nil)
}
func (h *Handlers) AdminUsersList(w http.ResponseWriter, r *http.Request) {
	list, _ := h.DB.User.Query().All(r.Context())
	writeSuccess(w, http.StatusOK, list, nil)
}

func (h *Handlers) UploadCreate(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusCreated, map[string]any{"status": "uploaded"}, nil)
}

func (h *Handlers) UploadGet(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusOK, map[string]any{"url": "/mock/asset.jpg"}, nil)
}
