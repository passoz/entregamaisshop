package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Cart struct{ ent.Schema }

func (Cart) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Cart) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("seller_id").Optional(),
		field.String("status").Default("open"),
	}
}
func (Cart) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).Ref("cart").Unique().Required(),
		edge.To("items", CartItem.Type),
	}
}
