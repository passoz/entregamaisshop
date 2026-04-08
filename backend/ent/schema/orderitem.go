package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type OrderItem struct{ ent.Schema }

func (OrderItem) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (OrderItem) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("order_id").NotEmpty(),
		field.String("product_id").NotEmpty(),
		field.Int("quantity").Positive(),
		field.Float("unit_price").Positive(),
		field.Float("total_price").Positive(),
	}
}
func (OrderItem) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("order", Order.Type).Ref("items").Field("order_id").Required(),
		edge.From("product", Product.Type).Ref("order_items").Field("product_id").Required(),
	}
}
