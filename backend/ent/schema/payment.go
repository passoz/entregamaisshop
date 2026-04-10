package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Payment struct{ ent.Schema }

func (Payment) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Payment) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("provider").Default("internal"),
		field.String("status").Default("pending"),
		field.Float("amount").Positive(),
		field.String("currency").Default("BRL"),
		field.String("external_reference").Optional(),
	}
}
func (Payment) Edges() []ent.Edge {
	return []ent.Edge{edge.From("order", Order.Type).Ref("payments").Unique().Required()}
}
