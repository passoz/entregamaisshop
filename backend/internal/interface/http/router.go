package http

import (
	"net/http"

	"github.com/entregamais/platform/backend/api/openapi"
	"github.com/entregamais/platform/backend/ent"
	"github.com/entregamais/platform/backend/internal/infrastructure/auth"
	"github.com/entregamais/platform/backend/internal/infrastructure/config"
	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
)

func NewRouter(cfg config.Config, lg *logger.Logger, db *ent.Client, verifier *auth.JWTVerifier) http.Handler {
	mux := http.NewServeMux()

	mw := NewMiddleware(lg, verifier, db)
	h := &Handlers{Config: cfg, Logger: lg, DB: db}

	mux.HandleFunc("GET /api/v1/health", h.Health)
	mux.HandleFunc("GET /api/v1/ready", h.Ready)
	mux.HandleFunc("GET /api/v1/live", h.Live)

	mux.HandleFunc("GET /api/v1/categories", h.CategoriesList)
	mux.HandleFunc("GET /api/v1/sellers", h.SellersList)
	mux.HandleFunc("GET /api/v1/sellers/{id}", h.SellersGet)
	mux.HandleFunc("GET /api/v1/sellers/{id}/products", h.SellersProducts)
	mux.HandleFunc("POST /api/v1/sellers/{id}/reviews", mw.RequireRole("customer", h.SellerReviewCreate))
	mux.HandleFunc("GET /api/v1/products", h.ProductsList)
	mux.HandleFunc("GET /api/v1/products/{id}", h.ProductsGet)
	mux.HandleFunc("POST /api/v1/public/register", h.PublicRegister)

	mux.HandleFunc("GET /api/v1/cart", mw.RequireAuth(h.CartGet))
	mux.HandleFunc("POST /api/v1/cart/items", mw.RequireAuth(h.CartCreateItem))
	mux.HandleFunc("PUT /api/v1/cart/items/{id}", mw.RequireAuth(h.CartUpdateItem))
	mux.HandleFunc("DELETE /api/v1/cart/items/{id}", mw.RequireAuth(h.CartDeleteItem))

	mux.HandleFunc("POST /api/v1/orders", mw.RequireAuth(h.OrderCreate))
	mux.HandleFunc("GET /api/v1/orders/{id}", mw.RequireAuth(h.OrderGet))
	mux.HandleFunc("GET /api/v1/orders/me", mw.RequireAuth(h.OrderMine))

	mux.HandleFunc("GET /api/v1/vendedor/profile", mw.RequireRole("vendedor", h.SellerProfile))
	mux.HandleFunc("GET /api/v1/vendedor/delivery-areas", mw.RequireRole("vendedor", h.SellerDeliveryAreasGet))
	mux.HandleFunc("PUT /api/v1/vendedor/delivery-areas", mw.RequireRole("vendedor", h.SellerDeliveryAreasUpdate))
	mux.HandleFunc("GET /api/v1/vendedor/products", mw.RequireRole("vendedor", h.SellerProductsList))
	mux.HandleFunc("POST /api/v1/vendedor/products", mw.RequireRole("vendedor", h.SellerProductsCreate))
	mux.HandleFunc("GET /api/v1/vendedor/products/{id}", mw.RequireRole("vendedor", h.SellerProductsGet))
	mux.HandleFunc("PUT /api/v1/vendedor/products/{id}", mw.RequireRole("vendedor", h.SellerProductsUpdate))
	mux.HandleFunc("DELETE /api/v1/vendedor/products/{id}", mw.RequireRole("vendedor", h.SellerProductsDelete))
	mux.HandleFunc("GET /api/v1/vendedor/inventory", mw.RequireRole("vendedor", h.SellerInventoryList))
	mux.HandleFunc("PUT /api/v1/vendedor/inventory/{productId}", mw.RequireRole("vendedor", h.SellerInventoryUpdate))
	mux.HandleFunc("GET /api/v1/vendedor/orders", mw.RequireRole("vendedor", h.SellerOrdersList))
	mux.HandleFunc("GET /api/v1/vendedor/orders/{id}", mw.RequireRole("vendedor", h.SellerOrdersGet))
	mux.HandleFunc("POST /api/v1/vendedor/orders/{id}/confirm", mw.RequireRole("vendedor", h.SellerOrderConfirm))
	mux.HandleFunc("POST /api/v1/vendedor/orders/{id}/prepare", mw.RequireRole("vendedor", h.SellerOrderPrepare))
	mux.HandleFunc("POST /api/v1/vendedor/orders/{id}/ready", mw.RequireRole("vendedor", h.SellerOrderReady))

	mux.HandleFunc("GET /api/v1/entregador/profile", mw.RequireRole("entregador", h.DriverProfile))
	mux.HandleFunc("GET /api/v1/entregador/orders", mw.RequireRole("entregador", h.DriverOrdersList))
	mux.HandleFunc("GET /api/v1/entregador/orders/{id}", mw.RequireRole("entregador", h.DriverOrdersGet))
	mux.HandleFunc("POST /api/v1/entregador/orders/{id}/accept", mw.RequireRole("entregador", h.DriverOrderAccept))
	mux.HandleFunc("POST /api/v1/entregador/orders/{id}/pickup", mw.RequireRole("entregador", h.DriverOrderPickup))
	mux.HandleFunc("POST /api/v1/entregador/orders/{id}/deliver", mw.RequireRole("entregador", h.DriverOrderDeliver))
	mux.HandleFunc("POST /api/v1/entregador/status", mw.RequireRole("entregador", h.DriverStatus))

	mux.HandleFunc("POST /api/v1/uploads", mw.RequireAuth(h.UploadCreate))
	mux.HandleFunc("GET /api/v1/uploads/{id}", mw.RequireAuth(h.UploadGet))

	mux.HandleFunc("GET /api/v1/admin/dashboard", mw.RequireRole("admin", h.AdminDashboard))
	mux.HandleFunc("GET /api/v1/admin/sellers", mw.RequireRole("admin", h.AdminSellersList))
	mux.HandleFunc("POST /api/v1/admin/sellers/{id}/approve", mw.RequireRole("admin", h.AdminSellerApprove))
	mux.HandleFunc("POST /api/v1/admin/sellers", mw.RequireRole("admin", h.AdminSellersCreate))
	mux.HandleFunc("GET /api/v1/admin/drivers", mw.RequireRole("admin", h.AdminDriversList))
	mux.HandleFunc("POST /api/v1/admin/drivers/{id}/approve", mw.RequireRole("admin", h.AdminDriverApprove))
	mux.HandleFunc("POST /api/v1/admin/drivers", mw.RequireRole("admin", h.AdminDriversCreate))
	mux.HandleFunc("GET /api/v1/admin/orders", mw.RequireRole("admin", h.AdminOrdersList))
	mux.HandleFunc("GET /api/v1/admin/users", mw.RequireRole("admin", h.AdminUsersList))

	mux.HandleFunc("GET /openapi.json", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(openapi.Spec)
	})
	mux.HandleFunc("GET /docs", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write([]byte(`<html><body><h1>EntregaMais API Docs</h1><p>Download <a href="/openapi.json">openapi.json</a>.</p></body></html>`))
	})

	return chain(mux, mw.Logging, mw.RequestContext)
}
