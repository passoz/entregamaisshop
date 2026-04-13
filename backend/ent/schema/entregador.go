package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Entregador struct{ ent.Schema }

func (Entregador) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Entregador) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("status").Default("pending"),
		field.String("vehicle_type").Optional(),
		field.Bool("available").Default(false),
	}
}
func (Entregador) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).Ref("driver_profile").Unique().Required(),
		edge.To("orders", Order.Type),
	}
}
