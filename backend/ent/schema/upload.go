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
		field.String("user_id").NotEmpty(),
		field.String("asset_id").NotEmpty(),
		field.String("resource_type").Optional(),
		field.String("resource_id").Optional(),
		field.String("status").Default("pending"),
	}
}
func (Upload) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).Ref("uploads").Field("user_id").Required(),
		edge.From("asset", Asset.Type).Ref("uploads").Field("asset_id").Required(),
	}
}
