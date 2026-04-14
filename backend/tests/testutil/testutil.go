package testutil

import (
	"context"
	"net/http"
	"testing"

	"github.com/entregamais/platform/backend/ent"
	"github.com/entregamais/platform/backend/internal/infrastructure/config"
	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
	"github.com/entregamais/platform/backend/internal/infrastructure/messaging"
	apihttp "github.com/entregamais/platform/backend/internal/interface/http"
	_ "github.com/mattn/go-sqlite3"
)

func MustOpenTestDB(t *testing.T, name string) *ent.Client {
	t.Helper()

	client, err := ent.Open("sqlite3", "file:"+name+"?mode=memory&cache=shared&_fk=1")
	if err != nil {
		t.Fatalf("failed opening sqlite db: %v", err)
	}
	if err := client.Schema.Create(context.Background()); err != nil {
		t.Fatalf("failed creating schema resources: %v", err)
	}
	return client
}

func NewTestRouter(db *ent.Client) http.Handler {
	return apihttp.NewRouter(
		config.Config{AppName: "test", Environment: "test", Port: "8080"},
		logger.New("test", "test"),
		db,
		nil,
		messaging.NewNoopPublisher(),
	)
}

func MustCreateUser(t *testing.T, client *ent.Client, id, email, name string) {
	t.Helper()

	if _, err := client.User.Create().SetID(id).SetEmail(email).SetName(name).Save(context.Background()); err != nil {
		t.Fatalf("seed user %s: %v", id, err)
	}
}

func MustCreateSeller(t *testing.T, client *ent.Client, id, name, document, status string) {
	t.Helper()

	create := client.Seller.Create().SetID(id).SetName(name).SetDocument(document)
	if status != "" {
		create.SetStatus(status)
	}
	if _, err := create.Save(context.Background()); err != nil {
		t.Fatalf("seed seller %s: %v", id, err)
	}
}

func MustCreateCategory(t *testing.T, client *ent.Client, id, name, slug string) {
	t.Helper()

	if _, err := client.Category.Create().SetID(id).SetName(name).SetSlug(slug).Save(context.Background()); err != nil {
		t.Fatalf("seed category %s: %v", id, err)
	}
}

func MustCreateProduct(t *testing.T, client *ent.Client, id, sellerID, categoryID, name, slug string, price float64) {
	t.Helper()

	if _, err := client.Product.Create().
		SetID(id).
		SetSellerID(sellerID).
		SetCategoryID(categoryID).
		SetName(name).
		SetSlug(slug).
		SetPrice(price).
		Save(context.Background()); err != nil {
		t.Fatalf("seed product %s: %v", id, err)
	}
}
