package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type OrderStatusHistory struct{ ent.Schema }

func (OrderStatusHistory) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (OrderStatusHistory) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("status").NotEmpty(),
		field.String("changed_by").Optional(),
		field.Time("changed_at").Default(time.Now),
		field.String("notes").Optional(),
	}
}
func (OrderStatusHistory) Edges() []ent.Edge {
	return []ent.Edge{edge.From("order", Order.Type).Ref("status_history").Unique().Required()}
}
