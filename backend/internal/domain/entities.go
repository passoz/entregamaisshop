package domain

import "time"

type OrderStatus string

const (
	OrderStatusCreated        OrderStatus = "created"
	OrderStatusConfirmed      OrderStatus = "confirmed"
	OrderStatusPreparing      OrderStatus = "preparing"
	OrderStatusReadyForPickup OrderStatus = "ready_for_pickup"
	OrderStatusOutForDelivery OrderStatus = "out_for_delivery"
	OrderStatusDelivered      OrderStatus = "delivered"
	OrderStatusCancelled      OrderStatus = "cancelled"
)

type EventEnvelope struct {
	EventID       string         `json:"event_id"`
	EventType     string         `json:"event_type"`
	EventVersion  string         `json:"event_version"`
	OccurredAt    time.Time      `json:"occurred_at"`
	Producer      string         `json:"producer"`
	CorrelationID string         `json:"correlation_id"`
	RequestID     string         `json:"request_id,omitempty"`
	Payload       map[string]any `json:"payload"`
	Metadata      map[string]any `json:"metadata,omitempty"`
}
