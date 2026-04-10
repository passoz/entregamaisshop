package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type User struct{ ent.Schema }

func (User) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("email").NotEmpty().Unique(),
		field.String("name").NotEmpty(),
		field.String("phone").Optional(),
		field.String("status").Default("active"),
		field.Time("deleted_at").Optional().Nillable(),
	}
}
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("addresses", Address.Type),
		edge.To("seller_links", SellerUser.Type),
		edge.To("seller_reviews", SellerReview.Type),
		edge.To("orders", Order.Type),
		edge.To("cart", Cart.Type).Unique(),
		edge.To("driver_profile", Entregador.Type).Unique(),
		edge.To("uploads", Upload.Type),
	}
}
func (User) Indexes() []ent.Index {
	return []ent.Index{index.Fields("email"), index.Fields("status")}
}
