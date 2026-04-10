package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Inventory struct{ ent.Schema }

func (Inventory) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Inventory) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.Int("quantity").Default(0),
		field.Int("reserved_quantity").Default(0),
	}
}
func (Inventory) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("seller", Seller.Type).Ref("inventory").Unique().Required(),
		edge.From("product", Product.Type).Ref("inventory").Unique().Required(),
	}
}
func (Inventory) Indexes() []ent.Index { return nil }
