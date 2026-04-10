package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Upload struct{ ent.Schema }

func (Upload) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Upload) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("filename").NotEmpty(),
		field.String("resource_id").Optional(),
		field.String("status").Default("pending"),
	}
}
func (Upload) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).Ref("uploads").Unique().Required(),
		edge.From("asset", Asset.Type).Ref("uploads").Unique().Required(),
	}
}
