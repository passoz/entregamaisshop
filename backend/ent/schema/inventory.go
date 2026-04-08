package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type Inventory struct{ ent.Schema }

func (Inventory) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Inventory) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("seller_id").NotEmpty(),
		field.String("product_id").NotEmpty(),
		field.Int("quantity").Default(0),
		field.Int("reserved_quantity").Default(0),
	}
}
func (Inventory) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("seller", Seller.Type).Ref("inventory").Field("seller_id").Required(),
		edge.From("product", Product.Type).Ref("inventory").Field("product_id").Required(),
	}
}
func (Inventory) Indexes() []ent.Index { return []ent.Index{index.Fields("seller_id", "product_id").Unique()}}
