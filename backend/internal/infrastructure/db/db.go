package db

import (
	"context"
	"fmt"

	"github.com/entregamais/platform/backend/ent"
	"github.com/entregamais/platform/backend/internal/infrastructure/config"
	_ "github.com/lib/pq"
)

func NewClient(cfg config.Config) (*ent.Client, error) {
	client, err := ent.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed opening connection to postgres: %v", err)
	}

	// Run the auto migration tool.
	if err := client.Schema.Create(context.Background()); err != nil {
		return nil, fmt.Errorf("failed creating schema resources: %v", err)
	}

	return client, nil
}
