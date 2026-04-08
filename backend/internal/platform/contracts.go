package platform

import "context"

type Cache interface {
	Set(ctx context.Context, key string, value []byte, ttlSeconds int) error
	Get(ctx context.Context, key string) ([]byte, error)
}

type ObjectStorage interface {
	PutObject(ctx context.Context, bucket, key string, data []byte, contentType string) error
	GetObject(ctx context.Context, bucket, key string) ([]byte, error)
}

type MessageBus interface {
	Publish(ctx context.Context, exchange, routingKey string, payload []byte, headers map[string]any) error
}
