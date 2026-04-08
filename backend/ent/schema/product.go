package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type Product struct{ ent.Schema }

func (Product) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (Product) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("seller_id").NotEmpty(),
		field.String("category_id").NotEmpty(),
		field.String("name").NotEmpty(),
		field.String("description").Optional(),
		field.Float("price").Positive(),
		field.String("status").Default("active"),
		field.Time("deleted_at").Optional().Nillable(),
	}
}
func (Product) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("seller", Seller.Type).Ref("products").Field("seller_id").Required(),
		edge.From("category", Category.Type).Ref("products").Field("category_id").Required(),
		edge.To("images", ProductImage.Type),
		edge.To("inventory", Inventory.Type),
		edge.To("order_items", OrderItem.Type),
	}
}
func (Product) Indexes() []ent.Index { return []ent.Index{index.Fields("seller_id", "status"), index.Fields("category_id")}}
