package messaging

import (
	"context"
	"encoding/json"
	"sync"

	"github.com/entregamais/platform/backend/internal/infrastructure/config"
	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
	amqp "github.com/rabbitmq/amqp091-go"
)

type Publisher interface {
	Publish(context.Context, string, any) error
	Close() error
}

type NoopPublisher struct{}

func NewNoopPublisher() Publisher {
	return NoopPublisher{}
}

func (NoopPublisher) Publish(context.Context, string, any) error {
	return nil
}

func (NoopPublisher) Close() error {
	return nil
}

type RabbitPublisher struct {
	conn     *amqp.Connection
	channel  *amqp.Channel
	exchange string
	logger   *logger.Logger
	mu       sync.Mutex
}

func NewPublisher(cfg config.Config, lg *logger.Logger) (Publisher, error) {
	if cfg.RabbitMQURL == "" {
		return NewNoopPublisher(), nil
	}

	conn, err := amqp.Dial(cfg.RabbitMQURL)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		_ = conn.Close()
		return nil, err
	}

	if err := ch.ExchangeDeclare(
		cfg.EventsExchange,
		"topic",
		true,
		false,
		false,
		false,
		nil,
	); err != nil {
		_ = ch.Close()
		_ = conn.Close()
		return nil, err
	}

	return &RabbitPublisher{
		conn:     conn,
		channel:  ch,
		exchange: cfg.EventsExchange,
		logger:   lg,
	}, nil
}

func (p *RabbitPublisher) Publish(ctx context.Context, routingKey string, payload any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	p.mu.Lock()
	defer p.mu.Unlock()

	return p.channel.PublishWithContext(ctx, p.exchange, routingKey, false, false, amqp.Publishing{
		ContentType: "application/json",
		Body:        body,
	})
}

func (p *RabbitPublisher) Close() error {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.channel != nil {
		_ = p.channel.Close()
	}
	if p.conn != nil {
		return p.conn.Close()
	}
	return nil
}
