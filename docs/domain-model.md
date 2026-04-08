# Domain Model

Entidades principais:
- User, Address
- Seller, SellerUser
- Driver
- Category, Product, ProductImage, Inventory
- Cart, CartItem
- Order, OrderItem, OrderStatusHistory, Payment
- Asset, Upload
- OutboxEvent, AuditLog

Regras-chave:
- Product pertence a Seller
- Inventory por Seller+Product
- Order pertence a Customer+Seller e pode ter Driver
- Historico de status em `OrderStatusHistory`
