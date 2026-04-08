package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Driver struct{ ent.Schema }

func (Driver) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Driver) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("user_id").NotEmpty().Unique(),
		field.String("status").Default("offline"),
		field.String("vehicle_type").Optional(),
		field.Bool("available").Default(false),
	}
}
func (Driver) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).Ref("driver_profile").Field("user_id").Unique().Required(),
		edge.To("orders", Order.Type),
	}
}
