# Gateway (APISIX)

## Rotas
- Publicas: `/api/v1/categories`, `/api/v1/products*`, `/api/v1/sellers*`, `/docs`, `/openapi.json`
- Customer auth: `/api/v1/cart*`, `/api/v1/orders*`
- Seller auth: `/api/v1/seller/*`
- Driver auth: `/api/v1/driver/*`
- Admin auth: `/api/v1/admin/*`

## Politicas
- OIDC com Keycloak
- rate limit (`limit-count`)
- CORS
- propagacao de headers de correlacao
