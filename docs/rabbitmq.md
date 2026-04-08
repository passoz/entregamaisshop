# RabbitMQ

## Exchanges
- `orders.events`
- `catalog.events`
- `uploads.events`
- `notifications.events`

## Filas
- `orders.lifecycle`
- `orders.dlq`
- `inventory.sync`
- `uploads.completed`
- `notifications.dispatch`

## Confiabilidade
- outbox pattern no backend
- DLQ para falhas
- retry com backoff
- idempotencia por `event_id`
