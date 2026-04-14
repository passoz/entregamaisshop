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
	"github.com/entregamais/platform/backend/internal/infrastructure/messaging"
)

type Handlers struct {
	Config    config.Config
	Logger    *logger.Logger
	DB        *ent.Client
	Publisher messaging.Publisher
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

	if err := h.ensureUserExists(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to sync user"})
		return
	}

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

	if err := h.ensureUserExists(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to sync user"})
		return
	}

	var payload struct {
		ProductID string `json:"product_id"`
		Quantity  int    `json:"quantity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	c, err := h.DB.Cart.Query().Where(cart.HasUserWith(user.IDEQ(uid))).Only(ctx)
	if ent.IsNotFound(err) {
		c, err = h.DB.Cart.Create().SetUserID(uid).SetID(uid + "-cart").Save(ctx)
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to prepare cart"})
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

	if err := h.ensureUserExists(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to sync user"})
		return
	}

	var payload struct {
		SellerID          string   `json:"seller_id"`
		TotalAmount       float64  `json:"total_amount"`
		DeliveryAddress   string   `json:"delivery_address"`
		DeliveryLatitude  *float64 `json:"delivery_latitude"`
		DeliveryLongitude *float64 `json:"delivery_longitude"`
		Items             []struct {
			ProductID string  `json:"product_id"`
			Quantity  int     `json:"quantity"`
			Price     float64 `json:"price"`
		} `json:"items"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	if len(payload.Items) == 0 || payload.Items[0].ProductID == "" {
		cartItems, err := h.DB.CartItem.Query().
			Where(cartitem.HasCartWith(cart.HasUserWith(user.IDEQ(uid)))).
			WithProduct().
			All(ctx)
		if err != nil {
			writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to load cart items"})
			return
		}

		if len(cartItems) == 0 {
			writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "cart is empty"})
			return
		}

		payload.Items = payload.Items[:0]
		if payload.TotalAmount == 0 {
			payload.TotalAmount = 0
		}
		for _, item := range cartItems {
			productID := ""
			if item.Edges.Product != nil {
				productID = item.Edges.Product.ID
			}
			payload.Items = append(payload.Items, struct {
				ProductID string  `json:"product_id"`
				Quantity  int     `json:"quantity"`
				Price     float64 `json:"price"`
			}{
				ProductID: productID,
				Quantity:  item.Quantity,
				Price:     item.UnitPrice,
			})
			payload.TotalAmount += item.UnitPrice * float64(item.Quantity)
		}
	}

	if payload.SellerID == "" && len(payload.Items) > 0 {
		firstProduct, err := h.DB.Product.Query().
			Where(product.IDEQ(payload.Items[0].ProductID)).
			QuerySeller().
			Only(ctx)
		if err == nil {
			payload.SellerID = firstProduct.ID
		}
	}

	if payload.SellerID == "" {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "seller_id is required"})
		return
	}

	orderID := newID()

	// Transaction to create order and items
	err := h.WithTx(ctx, func(tx *ent.Tx) error {
		addressPayload := map[string]any{}
		if payload.DeliveryAddress != "" {
			addressPayload["raw"] = payload.DeliveryAddress
			addressPayload["label"] = payload.DeliveryAddress
		}
		if payload.DeliveryLatitude != nil {
			addressPayload["lat"] = *payload.DeliveryLatitude
		}
		if payload.DeliveryLongitude != nil {
			addressPayload["lng"] = *payload.DeliveryLongitude
		}
		addressRaw, err := json.Marshal(addressPayload)
		if err != nil {
			return err
		}

		create := tx.Order.Create().
			SetID(orderID).
			SetCustomerID(uid).
			SetSellerID(payload.SellerID).
			SetTotalAmount(payload.TotalAmount).
			SetDeliveryAddressJSON(string(addressRaw))
		if payload.DeliveryLatitude != nil {
			create.SetDeliveryLatitude(*payload.DeliveryLatitude)
		}
		if payload.DeliveryLongitude != nil {
			create.SetDeliveryLongitude(*payload.DeliveryLongitude)
		}

		ord, err := create.Save(ctx)
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

	createdOrder, err := h.queryOrderWithTracking(ctx, orderID)
	if err == nil {
		h.publishDeliveryOffer(ctx, createdOrder)
	}

	writeSuccess(w, http.StatusCreated, map[string]any{"status": "created", "id": orderID}, nil)
}

func (h *Handlers) OrderGet(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")
	item, err := h.queryOrderWithTracking(ctx, id)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "order not found"})
		return
	}
	writeSuccess(w, http.StatusOK, buildOrderResponse(item, 0, nil), nil)
}

func (h *Handlers) OrderTrackingGet(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")
	item, err := h.queryOrderWithTracking(ctx, id)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "order not found"})
		return
	}

	writeSuccess(w, http.StatusOK, map[string]any{
		"order_id":   item.ID,
		"status":     item.Status,
		"tracking":   buildTrackingPayload(item, 0),
		"updated_at": item.UpdatedAt,
	}, nil)
}

func (h *Handlers) OrderMine(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(ctx)
	if err := h.ensureUserExists(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to sync user"})
		return
	}
	list, err := h.DB.Order.Query().
		Where(order.HasCustomerWith(user.IDEQ(uid))).
		WithSeller().
		WithDriver().
		WithItems(func(q *ent.OrderItemQuery) {
			q.WithProduct()
		}).
		Order(ent.Desc(order.FieldCreatedAt)).
		All(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to query orders"})
		return
	}

	response := make([]map[string]any, 0, len(list))
	for _, item := range list {
		response = append(response, buildOrderResponse(item, 0, nil))
	}

	writeSuccess(w, http.StatusOK, response, nil)
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
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Price       float64 `json:"price"`
		SellerID    string  `json:"seller_id"`
		CategoryID  string  `json:"category_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	sellerProfile, err := h.resolveSellerForUser(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "seller profile not found"})
		return
	}
	if sellerProfile.Status != "active" {
		writeError(w, http.StatusForbidden, APIError{Code: "forbidden", Message: "seller is pending approval"})
		return
	}

	categoryID := payload.CategoryID
	if categoryID == "" {
		firstCategory, err := h.DB.Category.Query().First(ctx)
		if err != nil {
			writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to resolve category"})
			return
		}
		categoryID = firstCategory.ID
	}

	item, err := h.DB.Product.Create().
		SetID(newID()).
		SetName(payload.Name).
		SetDescription(payload.Description).
		SetPrice(payload.Price).
		SetSellerID(sellerProfile.ID).
		SetCategoryID(categoryID).
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
	sellerProfile, err := h.resolveSellerForUser(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "seller profile not found"})
		return
	}
	list, err := h.DB.Order.Query().
		Where(order.HasSellerWith(seller.IDEQ(sellerProfile.ID))).
		WithSeller().
		WithCustomer().
		WithDriver().
		WithItems(func(q *ent.OrderItemQuery) {
			q.WithProduct()
		}).
		Order(ent.Desc(order.FieldCreatedAt)).
		All(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to query orders"})
		return
	}

	response := make([]map[string]any, 0, len(list))
	for _, item := range list {
		nearbyDrivers, _ := h.listNearbyDrivers(ctx, sellerIDFromOrder(item))
		response = append(response, buildOrderResponse(item, len(nearbyDrivers), nil))
	}

	writeSuccess(w, http.StatusOK, response, nil)
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
	ctx := r.Context()
	if err := h.DB.Order.UpdateOneID(id).SetStatus("ready").Exec(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to mark order as ready"})
		return
	}

	updatedOrder, err := h.queryOrderWithTracking(ctx, id)
	if err == nil {
		h.publishDeliveryOffer(ctx, updatedOrder)
	}
	writeSuccess(w, http.StatusOK, map[string]any{"status": "ready"}, nil)
}

func (h *Handlers) SellerOrderDispatch(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")
	now := time.Now().UTC()

	if err := h.DB.Order.UpdateOneID(id).
		SetStatus("dispatched").
		SetDispatchedAt(now).
		Exec(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to dispatch order"})
		return
	}

	if updatedOrder, err := h.queryOrderWithTracking(ctx, id); err == nil {
		h.publishTrackingUpdate(ctx, "orders.dispatched", updatedOrder)
	}

	writeSuccess(w, http.StatusOK, map[string]any{"status": "dispatched"}, nil)
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
	driverProfile, err := h.DB.Entregador.Query().Where(entregador.HasUserWith(user.IDEQ(UserID(ctx)))).Only(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "driver profile not found"})
		return
	}
	// Show ready orders (available to pick up) or orders already handled by this driver
	list, err := h.DB.Order.Query().
		Where(order.Or(
			order.StatusEQ("ready"),
			order.And(order.StatusIn("accepted", "dispatched", "picked_up"), order.HasDriverWith(entregador.IDEQ(driverProfile.ID))),
		)).
		WithSeller().
		WithCustomer().
		WithDriver().
		WithItems(func(q *ent.OrderItemQuery) {
			q.WithProduct()
		}).
		Order(ent.Desc(order.FieldCreatedAt)).
		All(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to query orders"})
		return
	}

	response := make([]map[string]any, 0, len(list))
	for _, item := range list {
		distanceKm := sellerDistanceToDriver(item, driverProfile)
		if item.Status == "ready" && distanceKm != nil && *distanceKm > defaultNearbyDriverRadiusKm {
			continue
		}

		nearbyDrivers, _ := h.listNearbyDrivers(ctx, sellerIDFromOrder(item))
		response = append(response, buildOrderResponse(item, len(nearbyDrivers), distanceKm))
	}

	writeSuccess(w, http.StatusOK, response, nil)
}

func (h *Handlers) DriverOrdersGet(w http.ResponseWriter, r *http.Request) { h.OrderGet(w, r) }

func (h *Handlers) DriverOrderAccept(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	ctx := r.Context()
	driverProfile, err := h.DB.Entregador.Query().Where(entregador.HasUserWith(user.IDEQ(UserID(ctx)))).Only(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "driver profile not found"})
		return
	}

	if err := h.DB.Order.UpdateOneID(id).
		SetStatus("accepted").
		SetDriverID(driverProfile.ID).
		SetAcceptedAt(time.Now().UTC()).
		Exec(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to accept order"})
		return
	}

	if updatedOrder, qerr := h.queryOrderWithTracking(ctx, id); qerr == nil {
		h.publishTrackingUpdate(ctx, "orders.accepted", updatedOrder)
	}

	writeSuccess(w, http.StatusOK, map[string]any{"status": "accepted"}, nil)
}

func (h *Handlers) DriverOrderPickup(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	ctx := r.Context()
	now := time.Now().UTC()
	if err := h.DB.Order.UpdateOneID(id).SetStatus("dispatched").SetDispatchedAt(now).Exec(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to confirm pickup"})
		return
	}

	if updatedOrder, err := h.queryOrderWithTracking(ctx, id); err == nil {
		h.publishTrackingUpdate(ctx, "orders.dispatched", updatedOrder)
	}

	writeSuccess(w, http.StatusOK, map[string]any{"status": "dispatched"}, nil)
}

func (h *Handlers) DriverOrderDeliver(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	ctx := r.Context()
	if err := h.DB.Order.UpdateOneID(id).SetStatus("delivered").SetDeliveredAt(time.Now().UTC()).Exec(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to deliver order"})
		return
	}

	if updatedOrder, err := h.queryOrderWithTracking(ctx, id); err == nil {
		h.publishTrackingUpdate(ctx, "orders.delivered", updatedOrder)
	}

	writeSuccess(w, http.StatusOK, map[string]any{"status": "delivered"}, nil)
}

func (h *Handlers) DriverStatus(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	driverProfile, err := h.DB.Entregador.Query().Where(entregador.HasUserWith(user.IDEQ(UserID(ctx)))).Only(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "driver profile not found"})
		return
	}

	var payload struct {
		Online *bool `json:"online"`
	}
	_ = json.NewDecoder(r.Body).Decode(&payload)

	online := true
	if payload.Online != nil {
		online = *payload.Online
	}

	item, err := h.DB.Entregador.UpdateOneID(driverProfile.ID).SetAvailable(online).Save(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to update driver status"})
		return
	}

	if h.Publisher != nil {
		_ = h.Publisher.Publish(ctx, "drivers.status.updated", map[string]any{
			"driver_id":   item.ID,
			"available":   online,
			"occurred_at": time.Now().UTC(),
		})
	}

	statusLabel := "offline"
	if online {
		statusLabel = "online"
	}

	writeSuccess(w, http.StatusOK, map[string]any{"status": statusLabel, "online": online}, nil)
}

func (h *Handlers) DriverLocationUpdate(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	driverProfile, err := h.DB.Entregador.Query().Where(entregador.HasUserWith(user.IDEQ(UserID(ctx)))).Only(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "driver profile not found"})
		return
	}

	var payload struct {
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
		Online    *bool   `json:"online"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	now := time.Now().UTC()
	update := h.DB.Entregador.UpdateOneID(driverProfile.ID).
		SetCurrentLatitude(payload.Latitude).
		SetCurrentLongitude(payload.Longitude).
		SetLastLocationAt(now)
	if payload.Online != nil {
		update.SetAvailable(*payload.Online)
	}

	item, err := update.Save(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to persist driver location"})
		return
	}

	if h.Publisher != nil {
		_ = h.Publisher.Publish(ctx, "drivers.location.updated", map[string]any{
			"driver_id":   item.ID,
			"latitude":    payload.Latitude,
			"longitude":   payload.Longitude,
			"occurred_at": now,
			"available":   item.Available,
		})
	}

	activeOrders, err := h.DB.Order.Query().
		Where(order.And(
			order.HasDriverWith(entregador.IDEQ(item.ID)),
			order.StatusIn("accepted", "dispatched", "picked_up"),
		)).
		WithSeller().
		WithCustomer().
		WithDriver().
		WithItems(func(q *ent.OrderItemQuery) {
			q.WithProduct()
		}).
		All(ctx)
	if err == nil {
		for _, activeOrder := range activeOrders {
			h.publishTrackingUpdate(ctx, "orders.tracking.updated", activeOrder)
		}
	}

	writeSuccess(w, http.StatusOK, map[string]any{
		"driver_id":        item.ID,
		"latitude":         payload.Latitude,
		"longitude":        payload.Longitude,
		"last_location_at": now,
		"available":        item.Available,
	}, nil)
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

func (h *Handlers) AdminDriverApprove(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.PathValue("id")

	d, err := h.DB.Entregador.UpdateOneID(id).SetStatus("active").SetAvailable(true).Save(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to approve driver"})
		return
	}

	writeSuccess(w, http.StatusOK, d, nil)
}

func (h *Handlers) AdminDashboard(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	usersCount, _ := h.DB.User.Query().Count(ctx)
	activeSellers, _ := h.DB.Seller.Query().Where(seller.StatusEQ("active")).Count(ctx)
	pendingSellers, _ := h.DB.Seller.Query().Where(seller.StatusEQ("pending")).Count(ctx)
	driversCount, _ := h.DB.Entregador.Query().Count(ctx)

	orders, _ := h.DB.Order.Query().All(ctx)
	var totalSales float64
	for _, o := range orders {
		totalSales += o.TotalAmount
	}

	writeSuccess(w, http.StatusOK, map[string]any{
		"total_sales":           totalSales,
		"new_users":             usersCount,
		"active_sellers":        activeSellers,
		"total_drivers":         driversCount,
		"pending_sellers_count": pendingSellers,
	}, nil)
}

func (h *Handlers) AdminSellersList(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	list, err := h.DB.Seller.Query().
		WithUsers(func(q *ent.SellerUserQuery) {
			q.WithUser()
		}).
		Order(ent.Desc(seller.FieldCreatedAt)).
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
func (h *Handlers) AdminSellersCreate(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusCreated, map[string]any{"status": "created"}, nil)
}
func (h *Handlers) AdminDriversList(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	list, err := h.DB.Entregador.Query().WithUser().Order(ent.Desc(entregador.FieldCreatedAt)).All(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to query drivers"})
		return
	}
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

func (h *Handlers) UserProfileGet(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(ctx)
	item, err := h.DB.User.Get(ctx, uid)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "user not found"})
		return
	}
	writeSuccess(w, http.StatusOK, item, nil)
}

func (h *Handlers) UserProfileUpdate(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(ctx)
	var payload struct {
		Name  string `json:"name"`
		Phone string `json:"phone"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	item, err := h.DB.User.UpdateOneID(uid).
		SetName(payload.Name).
		SetPhone(payload.Phone).
		Save(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to update profile"})
		return
	}
	writeSuccess(w, http.StatusOK, item, nil)
}

func (h *Handlers) SellerProfileUpdate(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	sellerProfile, err := h.resolveSellerForUser(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "seller profile not found"})
		return
	}

	var payload struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	item, err := h.DB.Seller.UpdateOneID(sellerProfile.ID).
		SetName(payload.Name).
		Save(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to update seller profile"})
		return
	}
	writeSuccess(w, http.StatusOK, item, nil)
}

func (h *Handlers) DriverProfileUpdate(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(ctx)
	driverProfile, err := h.DB.Entregador.Query().Where(entregador.HasUserWith(user.IDEQ(uid))).Only(ctx)
	if err != nil {
		writeError(w, http.StatusNotFound, APIError{Code: "not_found", Message: "driver profile not found"})
		return
	}

	var payload struct {
		VehicleType string `json:"vehicle_type"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	item, err := h.DB.Entregador.UpdateOneID(driverProfile.ID).
		SetVehicleType(payload.VehicleType).
		Save(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to update driver profile"})
		return
	}
	writeSuccess(w, http.StatusOK, item, nil)
}

func (h *Handlers) AuthChangePassword(w http.ResponseWriter, r *http.Request) {
	// In a real scenario, this would call Keycloak Admin API or Account API
	// using the user's access token or a service account.
	var payload struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	// Mocking success
	writeSuccess(w, http.StatusOK, map[string]any{"status": "password_changed"}, nil)
}
