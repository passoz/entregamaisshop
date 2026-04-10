package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type Seller struct{ ent.Schema }

func (Seller) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Seller) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("name").NotEmpty(),
		field.String("document").NotEmpty().Unique(),
		field.String("status").Default("pending"),
		field.Time("deleted_at").Optional().Nillable(),
	}
}
func (Seller) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("users", SellerUser.Type),
		edge.To("products", Product.Type),
		edge.To("inventory", Inventory.Type),
		edge.To("orders", Order.Type),
		edge.To("delivery_areas", SellerDeliveryArea.Type),
		edge.To("reviews", SellerReview.Type),
	}
}
func (Seller) Indexes() []ent.Index { return []ent.Index{index.Fields("status")} }
