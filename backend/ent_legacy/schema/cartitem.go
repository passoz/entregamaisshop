package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type CartItem struct{ ent.Schema }

func (CartItem) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (CartItem) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.Int("quantity").Positive(),
		field.Float("unit_price").Positive(),
	}
}
func (CartItem) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("cart", Cart.Type).Ref("items").Unique().Required(),
		edge.From("product", Product.Type).Ref("cart_items").Unique().Required(),
	}
}
