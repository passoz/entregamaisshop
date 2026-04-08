package usecase

import (
	"context"
	"time"

	"github.com/entregamais/platform/backend/internal/domain"
)

type OrderRepository interface {
	Create(ctx context.Context, customerID, sellerID string, totalAmount float64) (string, error)
}

type EventPublisher interface {
	Publish(ctx context.Context, evt domain.EventEnvelope) error
}

type OrderUseCase struct {
	Repo      OrderRepository
	Publisher EventPublisher
}

func (u OrderUseCase) CreateOrder(ctx context.Context, customerID, sellerID string, totalAmount float64, correlationID, requestID string) (string, error) {
	orderID, err := u.Repo.Create(ctx, customerID, sellerID, totalAmount)
	if err != nil {
		return "", err
	}
	evt := domain.EventEnvelope{
		EventID:       orderID + "-created",
		EventType:     "order.created",
		EventVersion:  "v1",
		OccurredAt:    time.Now().UTC(),
		Producer:      "backend.orders",
		CorrelationID: correlationID,
		RequestID:     requestID,
		Payload: map[string]any{
			"order_id":     orderID,
			"customer_id":  customerID,
			"seller_id":    sellerID,
			"total_amount": totalAmount,
		},
	}
	if err := u.Publisher.Publish(ctx, evt); err != nil {
		return "", err
	}
	return orderID, nil
}
