package db

import (
	"context"
	"fmt"
	"strings"

	"github.com/entregamais/platform/backend/ent"
	"github.com/entregamais/platform/backend/ent/category"
	"github.com/entregamais/platform/backend/ent/product"
	"github.com/entregamais/platform/backend/ent/seller"
	"github.com/entregamais/platform/backend/ent/sellerdeliveryarea"
	"github.com/entregamais/platform/backend/ent/sellerreview"
	"github.com/entregamais/platform/backend/ent/selleruser"
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

	// 2. Create Users
	users := []struct {
		ID    string
		Email string
		Name  string
	}{
		{"user-1", "cliente@entregamais.com", "Cliente Teste"},
		{"seller-owner-1", "dono@depositodoze.com", "Dono do Ze"},
	}
	for _, u := range users {
		exists, _ := client.User.Query().Where(user.IDEQ(u.ID)).Exist(ctx)
		if !exists {
			_, err := client.User.Create().
				SetID(u.ID).
				SetEmail(u.Email).
				SetName(u.Name).
				Save(ctx)
			if err != nil {
				fmt.Printf("Error creating user %s: %v\n", u.ID, err)
			}
		}
	}

	// 2.1 Link seller owner to seller 1
	linkExists, _ := client.SellerUser.Query().
		Where(
			selleruser.HasSellerWith(seller.IDEQ("1")),
			selleruser.HasUserWith(user.IDEQ("seller-owner-1")),
		).
		Exist(ctx)
	if !linkExists {
		_, err := client.SellerUser.Create().
			SetID("seller-user-1").
			SetRole("owner").
			SetSellerID("1").
			SetUserID("seller-owner-1").
			Save(ctx)
		if err != nil {
			fmt.Printf("Error linking seller owner: %v\n", err)
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

	// 5. Seller delivery areas
	deliveryAreas := []struct {
		ID       string
		SellerID string
		Label    string
		Fee      float64
	}{
		{"area-1", "1", "Cabo Frio", 0},
		{"area-2", "1", "Arraial do Cabo", 4.90},
		{"area-3", "1", "Buzios", 7.90},
		{"area-4", "2", "Arraial do Cabo", 3.50},
		{"area-5", "2", "Sao Pedro da Aldeia", 5.00},
		{"area-6", "3", "Rio de Janeiro - Zona Sul", 8.90},
	}
	for _, area := range deliveryAreas {
		exists, _ := client.SellerDeliveryArea.Query().Where(sellerdeliveryarea.IDEQ(area.ID)).Exist(ctx)
		if !exists {
			_, err := client.SellerDeliveryArea.Create().
				SetID(area.ID).
				SetSellerID(area.SellerID).
				SetLabel(area.Label).
				SetFee(area.Fee).
				Save(ctx)
			if err != nil {
				fmt.Printf("Error creating delivery area %s: %v\n", area.ID, err)
			}
		}
	}

	// 6. Seller reviews
	reviews := []struct {
		ID         string
		SellerID   string
		CustomerID string
		Score      int
		Comment    string
	}{
		{"review-1", "2", "user-1", 4, "Entrega rapida e bebidas geladas."},
		{"review-2", "3", "user-1", 5, "Atendimento excelente."},
	}
	for _, review := range reviews {
		exists, _ := client.SellerReview.Query().Where(sellerreview.IDEQ(review.ID)).Exist(ctx)
		if !exists {
			_, err := client.SellerReview.Create().
				SetID(review.ID).
				SetSellerID(review.SellerID).
				SetCustomerID(review.CustomerID).
				SetScore(review.Score).
				SetComment(review.Comment).
				Save(ctx)
			if err != nil {
				fmt.Printf("Error creating review %s: %v\n", review.ID, err)
			}
		}
	}

	return nil
}
