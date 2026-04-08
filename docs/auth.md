# Auth (Keycloak)

Realm: `delivery-platform`

## Roles
- customer
- seller
- driver
- admin
- operator

## Clients
- frontend (public)
- gateway (confidential)
- backend-service (service client)

## Claims esperadas
- user_id
- roles
- seller_id (quando aplicavel)
- driver_id (quando aplicavel)
