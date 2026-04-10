package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type SellerUser struct{ ent.Schema }

func (SellerUser) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (SellerUser) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("role").Default("owner"),
	}
}
func (SellerUser) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("seller", Seller.Type).Ref("users").Unique().Required(),
		edge.From("user", User.Type).Ref("seller_links").Unique().Required(),
	}
}
func (SellerUser) Indexes() []ent.Index { return nil }
