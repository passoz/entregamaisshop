package http

import (
	"context"
	"net/url"
	"testing"

	"github.com/entregamais/platform/backend/ent"
	_ "github.com/mattn/go-sqlite3"
)

func prepareTestDB(t *testing.T) *ent.Client {
	t.Helper()

	dsn := "file:" + url.QueryEscape(t.Name()) + "?mode=memory&cache=shared&_fk=1"
	client, err := ent.Open("sqlite3", dsn)
	if err != nil {
		t.Fatalf("failed opening connection to sqlite: %v", err)
	}
	if err := client.Schema.Create(context.Background()); err != nil {
		t.Fatalf("failed creating schema resources: %v", err)
	}
	return client
}

func mustCreateUser(t *testing.T, client *ent.Client, id, email, name string) *ent.User {
	t.Helper()

	item, err := client.User.Create().SetID(id).SetEmail(email).SetName(name).Save(context.Background())
	if err != nil {
		t.Fatalf("seed user %s: %v", id, err)
	}
	return item
}

func mustCreateSeller(t *testing.T, client *ent.Client, id, name, document, status string) *ent.Seller {
	t.Helper()

	create := client.Seller.Create().SetID(id).SetName(name).SetDocument(document)
	if status != "" {
		create.SetStatus(status)
	}
	item, err := create.Save(context.Background())
	if err != nil {
		t.Fatalf("seed seller %s: %v", id, err)
	}
	return item
}

func mustCreateCategory(t *testing.T, client *ent.Client, id, name, slug string) *ent.Category {
	t.Helper()

	item, err := client.Category.Create().SetID(id).SetName(name).SetSlug(slug).Save(context.Background())
	if err != nil {
		t.Fatalf("seed category %s: %v", id, err)
	}
	return item
}

func mustCreateProduct(t *testing.T, client *ent.Client, id, sellerID, categoryID, name, slug string, price float64) *ent.Product {
	t.Helper()

	item, err := client.Product.Create().
		SetID(id).
		SetSellerID(sellerID).
		SetCategoryID(categoryID).
		SetName(name).
		SetSlug(slug).
		SetPrice(price).
		Save(context.Background())
	if err != nil {
		t.Fatalf("seed product %s: %v", id, err)
	}
	return item
}

func mustCreateCart(t *testing.T, client *ent.Client, id, userID string) *ent.Cart {
	t.Helper()

	item, err := client.Cart.Create().SetID(id).SetUserID(userID).Save(context.Background())
	if err != nil {
		t.Fatalf("seed cart %s: %v", id, err)
	}
	return item
}

func mustCreateOrder(t *testing.T, client *ent.Client, id, customerID, sellerID, status string, total float64) *ent.Order {
	t.Helper()

	create := client.Order.Create().
		SetID(id).
		SetCustomerID(customerID).
		SetSellerID(sellerID).
		SetTotalAmount(total).
		SetDeliveryAddressJSON(`{"label":"Rua Teste, 123"}`)
	if status != "" {
		create.SetStatus(status)
	}
	item, err := create.Save(context.Background())
	if err != nil {
		t.Fatalf("seed order %s: %v", id, err)
	}
	return item
}

func mustCreateDriverProfile(t *testing.T, client *ent.Client, id, userID string) *ent.Entregador {
	t.Helper()

	item, err := client.Entregador.Create().SetID(id).SetUserID(userID).Save(context.Background())
	if err != nil {
		t.Fatalf("seed driver profile %s: %v", id, err)
	}
	return item
}
