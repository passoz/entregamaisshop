package http

import (
	"net/http"

	"github.com/entregamais/platform/backend/api/openapi"
	"github.com/entregamais/platform/backend/internal/infrastructure/config"
	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
)

func NewRouter(cfg config.Config, lg *logger.Logger) http.Handler {
	mux := http.NewServeMux()

	h := &Handlers{Config: cfg, Logger: lg}

	mux.HandleFunc("GET /api/v1/health", h.Health)
	mux.HandleFunc("GET /api/v1/ready", h.Ready)
	mux.HandleFunc("GET /api/v1/live", h.Live)

	mux.HandleFunc("GET /api/v1/categories", h.CategoriesList)
	mux.HandleFunc("GET /api/v1/sellers", h.SellersList)
	mux.HandleFunc("GET /api/v1/sellers/{id}", h.SellersGet)
	mux.HandleFunc("GET /api/v1/sellers/{id}/products", h.SellersProducts)
	mux.HandleFunc("GET /api/v1/products", h.ProductsList)
	mux.HandleFunc("GET /api/v1/products/{id}", h.ProductsGet)

	mux.HandleFunc("GET /api/v1/cart", requireAuth(h.CartGet))
	mux.HandleFunc("POST /api/v1/cart/items", requireAuth(h.CartCreateItem))
	mux.HandleFunc("PUT /api/v1/cart/items/{id}", requireAuth(h.CartUpdateItem))
	mux.HandleFunc("DELETE /api/v1/cart/items/{id}", requireAuth(h.CartDeleteItem))

	mux.HandleFunc("POST /api/v1/orders", requireAuth(h.OrderCreate))
	mux.HandleFunc("GET /api/v1/orders/{id}", requireAuth(h.OrderGet))
	mux.HandleFunc("GET /api/v1/orders/me", requireAuth(h.OrderMine))

	mux.HandleFunc("GET /api/v1/vendedor/profile", requireRole("vendedor", h.SellerProfile))
	mux.HandleFunc("GET /api/v1/vendedor/products", requireRole("vendedor", h.SellerProductsList))
	mux.HandleFunc("POST /api/v1/vendedor/products", requireRole("vendedor", h.SellerProductsCreate))
	mux.HandleFunc("GET /api/v1/vendedor/products/{id}", requireRole("vendedor", h.SellerProductsGet))
	mux.HandleFunc("PUT /api/v1/vendedor/products/{id}", requireRole("vendedor", h.SellerProductsUpdate))
	mux.HandleFunc("DELETE /api/v1/vendedor/products/{id}", requireRole("vendedor", h.SellerProductsDelete))
	mux.HandleFunc("GET /api/v1/vendedor/inventory", requireRole("vendedor", h.SellerInventoryList))
	mux.HandleFunc("PUT /api/v1/vendedor/inventory/{productId}", requireRole("vendedor", h.SellerInventoryUpdate))
	mux.HandleFunc("GET /api/v1/vendedor/orders", requireRole("vendedor", h.SellerOrdersList))
	mux.HandleFunc("GET /api/v1/vendedor/orders/{id}", requireRole("vendedor", h.SellerOrdersGet))
	mux.HandleFunc("POST /api/v1/vendedor/orders/{id}/confirm", requireRole("vendedor", h.SellerOrderConfirm))
	mux.HandleFunc("POST /api/v1/vendedor/orders/{id}/prepare", requireRole("vendedor", h.SellerOrderPrepare))
	mux.HandleFunc("POST /api/v1/vendedor/orders/{id}/ready", requireRole("vendedor", h.SellerOrderReady))

	mux.HandleFunc("GET /api/v1/entregador/profile", requireRole("entregador", h.DriverProfile))
	mux.HandleFunc("GET /api/v1/entregador/orders", requireRole("entregador", h.DriverOrdersList))
	mux.HandleFunc("GET /api/v1/entregador/orders/{id}", requireRole("entregador", h.DriverOrdersGet))
	mux.HandleFunc("POST /api/v1/entregador/orders/{id}/accept", requireRole("entregador", h.DriverOrderAccept))
	mux.HandleFunc("POST /api/v1/entregador/orders/{id}/pickup", requireRole("entregador", h.DriverOrderPickup))
	mux.HandleFunc("POST /api/v1/entregador/orders/{id}/deliver", requireRole("entregador", h.DriverOrderDeliver))
	mux.HandleFunc("POST /api/v1/entregador/status", requireRole("entregador", h.DriverStatus))

	mux.HandleFunc("POST /api/v1/uploads", requireAuth(h.UploadCreate))
	mux.HandleFunc("GET /api/v1/uploads/{id}", requireAuth(h.UploadGet))

	mux.HandleFunc("GET /api/v1/admin/dashboard", requireRole("admin", h.AdminDashboard))
	mux.HandleFunc("GET /api/v1/admin/sellers", requireRole("admin", h.AdminSellersList))
	mux.HandleFunc("POST /api/v1/admin/sellers", requireRole("admin", h.AdminSellersCreate))
	mux.HandleFunc("GET /api/v1/admin/drivers", requireRole("admin", h.AdminDriversList))
	mux.HandleFunc("POST /api/v1/admin/drivers", requireRole("admin", h.AdminDriversCreate))
	mux.HandleFunc("GET /api/v1/admin/orders", requireRole("admin", h.AdminOrdersList))
	mux.HandleFunc("GET /api/v1/admin/users", requireRole("admin", h.AdminUsersList))

	mux.HandleFunc("GET /openapi.json", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(openapi.Spec)
	})
	mux.HandleFunc("GET /docs", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write([]byte(`<html><body><h1>EntregaMais API Docs</h1><p>Download <a href="/openapi.json">openapi.json</a>.</p></body></html>`))
	})

	return chain(mux, loggingMiddleware(lg), requestContextMiddleware)
}
