package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type Order struct{ ent.Schema }

func (Order) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Order) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("customer_id").NotEmpty(),
		field.String("seller_id").NotEmpty(),
		field.String("driver_id").Optional(),
		field.String("status").Default("created"),
		field.Float("total_amount").Positive(),
		field.String("currency").Default("BRL"),
		field.String("delivery_address_json").NotEmpty(),
	}
}
func (Order) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("customer", User.Type).Ref("orders").Field("customer_id").Required(),
		edge.From("seller", Seller.Type).Ref("orders").Field("seller_id").Required(),
		edge.From("driver", Driver.Type).Ref("orders").Field("driver_id"),
		edge.To("items", OrderItem.Type),
		edge.To("status_history", OrderStatusHistory.Type),
		edge.To("payments", Payment.Type),
	}
}
func (Order) Indexes() []ent.Index {
	return []ent.Index{index.Fields("customer_id"), index.Fields("seller_id", "status"), index.Fields("driver_id", "status")}
}
