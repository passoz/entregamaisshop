# Events

Envelope padrao:
```json
{
  "event_id": "uuid",
  "event_type": "order.created",
  "event_version": "v1",
  "occurred_at": "2026-04-02T12:00:00Z",
  "producer": "backend.orders",
  "correlation_id": "corr-123",
  "request_id": "req-123",
  "payload": {},
  "metadata": {}
}
```

Eventos iniciais:
- order.created
- order.confirmed
- order.preparing
- order.ready_for_pickup
- order.assigned_to_driver
- order.out_for_delivery
- order.delivered
- order.cancelled
- product.created
- product.updated
- inventory.updated
- upload.completed
- notification.requested
