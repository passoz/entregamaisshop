package http

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/entregamais/platform/backend/internal/infrastructure/config"
	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
)

type Handlers struct {
	Config config.Config
	Logger *logger.Logger
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
	writeSuccess(w, http.StatusOK, []map[string]any{{"id": "cat_beer", "name": "Cervejas"}, {"id": "cat_wine", "name": "Vinhos"}}, map[string]any{"page": 1, "limit": 20, "total": 2})
}

func (h *Handlers) SellersList(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusOK, []map[string]any{{"id": "seller-1", "name": "Adega Centro"}}, nil)
}

func (h *Handlers) SellersGet(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	writeSuccess(w, http.StatusOK, map[string]any{"id": id, "name": "Adega Centro"}, nil)
}

func (h *Handlers) SellersProducts(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	writeSuccess(w, http.StatusOK, []map[string]any{{"id": "prod-1", "seller_id": id, "name": "Cerveja Pilsen 600ml", "price": 12.5}}, nil)
}

func (h *Handlers) ProductsList(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, http.StatusOK, []map[string]any{{"id": "prod-1", "name": "Cerveja Pilsen 600ml", "seller_id": "seller-1"}}, map[string]any{"page": 1, "limit": 20, "total": 1})
}

func (h *Handlers) ProductsGet(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	writeSuccess(w, http.StatusOK, map[string]any{"id": id, "name": "Cerveja Pilsen 600ml", "price": 12.5}, nil)
}

func (h *Handlers) CartGet(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": "cart-1", "items": []any{}}, nil) }
func (h *Handlers) CartCreateItem(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusCreated, map[string]any{"id": "item-1", "status": "created"}, nil) }
func (h *Handlers) CartUpdateItem(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "status": "updated"}, nil) }
func (h *Handlers) CartDeleteItem(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "status": "deleted"}, nil) }

func (h *Handlers) OrderCreate(w http.ResponseWriter, r *http.Request) {
	var payload map[string]any
	_ = json.NewDecoder(r.Body).Decode(&payload)
	writeSuccess(w, http.StatusCreated, map[string]any{"id": "order-1", "status": "created", "payload": payload}, nil)
}
func (h *Handlers) OrderGet(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "status": "created"}, nil) }
func (h *Handlers) OrderMine(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, []map[string]any{{"id": "order-1", "status": "created"}}, nil) }

func (h *Handlers) SellerProfile(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"seller_id": "seller-1"}, nil) }
func (h *Handlers) SellerProductsList(w http.ResponseWriter, r *http.Request) { h.ProductsList(w, r) }
func (h *Handlers) SellerProductsCreate(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusCreated, map[string]any{"id": "prod-new", "status": "created"}, nil) }
func (h *Handlers) SellerProductsGet(w http.ResponseWriter, r *http.Request) { h.ProductsGet(w, r) }
func (h *Handlers) SellerProductsUpdate(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "status": "updated"}, nil) }
func (h *Handlers) SellerProductsDelete(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "status": "deleted"}, nil) }
func (h *Handlers) SellerInventoryList(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, []map[string]any{{"product_id": "prod-1", "quantity": 20}}, nil) }
func (h *Handlers) SellerInventoryUpdate(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"product_id": r.PathValue("productId"), "status": "updated"}, nil) }
func (h *Handlers) SellerOrdersList(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, []map[string]any{{"id": "order-1"}}, nil) }
func (h *Handlers) SellerOrdersGet(w http.ResponseWriter, r *http.Request) { h.OrderGet(w, r) }
func (h *Handlers) SellerOrderConfirm(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "status": "confirmed"}, nil) }
func (h *Handlers) SellerOrderPrepare(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "status": "preparing"}, nil) }
func (h *Handlers) SellerOrderReady(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "status": "ready_for_pickup"}, nil) }

func (h *Handlers) DriverProfile(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"driver_id": "driver-1", "status": "available"}, nil) }
func (h *Handlers) DriverOrdersList(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, []map[string]any{{"id": "order-1"}}, nil) }
func (h *Handlers) DriverOrdersGet(w http.ResponseWriter, r *http.Request) { h.OrderGet(w, r) }
func (h *Handlers) DriverOrderAccept(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "status": "accepted"}, nil) }
func (h *Handlers) DriverOrderPickup(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "status": "picked_up"}, nil) }
func (h *Handlers) DriverOrderDeliver(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "status": "delivered"}, nil) }
func (h *Handlers) DriverStatus(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"status": "available"}, nil) }

func (h *Handlers) UploadCreate(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusCreated, map[string]any{"id": "upload-1", "status": "processing"}, nil) }
func (h *Handlers) UploadGet(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"id": r.PathValue("id"), "status": "completed"}, nil) }

func (h *Handlers) AdminDashboard(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, map[string]any{"orders_today": 10, "gmv": 1200}, nil) }
func (h *Handlers) AdminSellersList(w http.ResponseWriter, r *http.Request) { h.SellersList(w, r) }
func (h *Handlers) AdminSellersCreate(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusCreated, map[string]any{"id": "seller-new"}, nil) }
func (h *Handlers) AdminDriversList(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, []map[string]any{{"id": "driver-1"}}, nil) }
func (h *Handlers) AdminDriversCreate(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusCreated, map[string]any{"id": "driver-new"}, nil) }
func (h *Handlers) AdminOrdersList(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, []map[string]any{{"id": "order-1"}}, nil) }
func (h *Handlers) AdminUsersList(w http.ResponseWriter, r *http.Request) { writeSuccess(w, http.StatusOK, []map[string]any{{"id": "user-1"}}, nil) }
