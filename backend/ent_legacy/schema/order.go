package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Order struct{ ent.Schema }

func (Order) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Order) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("status").Default("created"),
		field.Float("total_amount").Positive(),
		field.String("currency").Default("BRL"),
		field.String("delivery_address_json").NotEmpty(),
	}
}
func (Order) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("customer", User.Type).Ref("orders").Unique().Required(),
		edge.From("seller", Seller.Type).Ref("orders").Unique().Required(),
		edge.From("driver", Entregador.Type).Ref("orders").Unique(),
		edge.To("items", OrderItem.Type),
		edge.To("status_history", OrderStatusHistory.Type),
		edge.To("payments", Payment.Type),
	}
}
func (Order) Indexes() []ent.Index { return nil }
