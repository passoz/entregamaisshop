package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Category struct{ ent.Schema }

func (Category) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Category) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("name").NotEmpty().Unique(),
		field.String("slug").NotEmpty().Unique(),
		field.String("status").Default("active"),
	}
}
func (Category) Edges() []ent.Edge { return []ent.Edge{edge.To("products", Product.Type)} }
