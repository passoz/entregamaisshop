package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Address struct{ ent.Schema }

func (Address) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Address) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("label").Default("home"),
		field.String("street").NotEmpty(),
		field.String("number").NotEmpty(),
		field.String("district").NotEmpty(),
		field.String("city").NotEmpty(),
		field.String("state").NotEmpty(),
		field.String("zip_code").NotEmpty(),
		field.Float("lat").Optional(),
		field.Float("lng").Optional(),
	}
}
func (Address) Edges() []ent.Edge {
	return []ent.Edge{edge.From("user", User.Type).Ref("addresses").Unique().Required()}
}
