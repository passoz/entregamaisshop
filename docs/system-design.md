# System Design

## Bounded contexts iniciais
- Catalog (categories/products)
- Seller Operations (inventory/orders)
- Driver Operations (assignment/delivery)
- Customer Commerce (cart/checkout)
- Uploads & Assets
- Identity & Access
- Observability

## Decisoes
- Monolito modular inicial (facil de evoluir para microservices)
- Contratos de eventos versionados
- IDs estaveis em todas as entidades
- Multi-seller e multi-driver nativos no modelo
