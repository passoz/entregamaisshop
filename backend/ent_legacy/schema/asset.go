package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Asset struct{ ent.Schema }

func (Asset) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Asset) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("bucket").NotEmpty(),
		field.String("object_key").NotEmpty(),
		field.String("content_type").NotEmpty(),
		field.Int64("size_bytes").Min(0),
		field.String("checksum").Optional(),
		field.String("status").Default("active"),
	}
}
func (Asset) Edges() []ent.Edge {
	return []ent.Edge{edge.To("uploads", Upload.Type), edge.To("product_images", ProductImage.Type)}
}
