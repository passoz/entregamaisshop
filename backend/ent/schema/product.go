package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Product struct{ ent.Schema }

func (Product) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Product) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("name").NotEmpty(),
		field.String("description").Optional(),
		field.Float("price").Positive(),
		field.String("status").Default("active"),
		field.String("slug").Unique().NotEmpty(),
		field.Time("deleted_at").Optional().Nillable(),
	}
}
func (Product) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("seller", Seller.Type).Ref("products").Unique().Required(),
		edge.From("category", Category.Type).Ref("products").Unique().Required(),
		edge.To("images", ProductImage.Type),
		edge.To("inventory", Inventory.Type),
		edge.To("order_items", OrderItem.Type),
		edge.To("cart_items", CartItem.Type),
	}
}
func (Product) Indexes() []ent.Index { return nil }
