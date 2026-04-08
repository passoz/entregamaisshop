package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type ProductImage struct{ ent.Schema }

func (ProductImage) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (ProductImage) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("product_id").NotEmpty(),
		field.String("asset_id").NotEmpty(),
		field.Int("position").Default(0),
	}
}
func (ProductImage) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("product", Product.Type).Ref("images").Field("product_id").Required(),
		edge.From("asset", Asset.Type).Ref("product_images").Field("asset_id").Unique().Required(),
	}
}
