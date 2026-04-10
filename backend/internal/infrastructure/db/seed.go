package db

import (
	"context"
	"fmt"
	"strings"

	"github.com/entregamais/platform/backend/ent"
	"github.com/entregamais/platform/backend/ent/category"
	"github.com/entregamais/platform/backend/ent/product"
	"github.com/entregamais/platform/backend/ent/seller"
	"github.com/entregamais/platform/backend/ent/user"
)

func Seed(ctx context.Context, client *ent.Client) error {
	// 1. Create Sellers
	sellers := []struct {
		ID   string
		Name string
		Doc  string
	}{
		{"1", "Depósito do Zé", "12345678000199"},
		{"2", "Conveniência 24h", "22345678000188"},
		{"3", "Distribuidora Imperial", "32345678000177"},
	}

	for _, s := range sellers {
		exists, _ := client.Seller.Query().Where(seller.IDEQ(s.ID)).Exist(ctx)
		if !exists {
			_, err := client.Seller.Create().
				SetID(s.ID).
				SetName(s.Name).
				SetDocument(s.Doc).
				Save(ctx)
			if err != nil {
				fmt.Printf("Error creating seller %s: %v\n", s.ID, err)
			}
		}
	}

	// 2. Create User user-1
	exists, _ := client.User.Query().Where(user.IDEQ("user-1")).Exist(ctx)
	if !exists {
		_, err := client.User.Create().
			SetID("user-1").
			SetEmail("ze@entregamais.com").
			SetName("Zé Teste").
			Save(ctx)
		if err != nil {
			fmt.Printf("Error creating user: %v\n", err)
		}
	}

	// 3. Create Categories
	categories := []struct {
		ID   string
		Name string
	}{
		{"cat-1", "Cervejas"},
		{"cat-2", "Destilados"},
		{"cat-3", "Vinhos"},
	}
	for _, c := range categories {
		exists, _ := client.Category.Query().Where(category.IDEQ(c.ID)).Exist(ctx)
		if !exists {
			_, err := client.Category.Create().
				SetID(c.ID).
				SetName(c.Name).
				SetSlug(strings.ToLower(c.Name)).
				Save(ctx)
			if err != nil {
				fmt.Printf("Error creating category %s: %v\n", c.ID, err)
			}
		}
	}

	// 4. Create Products for Seller 1
	products := []struct {
		ID    string
		Name  string
		Price float64
		CatID string
	}{
		{"prod-1", "Cerveja Skol 269ml", 2.99, "cat-1"},
		{"prod-2", "Cerveja Brahma 350ml", 3.49, "cat-1"},
		{"prod-3", "Whisky Red Label 1L", 99.90, "cat-2"},
		{"prod-4", "Vinho Tinto Seco", 29.90, "cat-3"},
	}

	for _, p := range products {
		exists, _ := client.Product.Query().Where(product.IDEQ(p.ID)).Exist(ctx)
		if !exists {
			_, err := client.Product.Create().
				SetID(p.ID).
				SetName(p.Name).
				SetPrice(p.Price).
				SetSellerID("1").
				SetCategoryID(p.CatID).
				SetSlug(strings.ToLower(strings.ReplaceAll(p.Name, " ", "-"))).
				Save(ctx)
			if err != nil {
				fmt.Printf("Error creating product %s: %v\n", p.ID, err)
			}
		}
	}

	return nil
}
