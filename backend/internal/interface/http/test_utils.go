package http

import (
	"context"
	"testing"

	"github.com/entregamais/platform/backend/ent"
	_ "github.com/mattn/go-sqlite3"
)

func prepareTestDB(t *testing.T) *ent.Client {
	client, err := ent.Open("sqlite3", "file:ent?mode=memory&cache=shared&_fk=1")
	if err != nil {
		t.Fatalf("failed opening connection to sqlite: %v", err)
	}
	if err := client.Schema.Create(context.Background()); err != nil {
		t.Fatalf("failed creating schema resources: %v", err)
	}
	return client
}
