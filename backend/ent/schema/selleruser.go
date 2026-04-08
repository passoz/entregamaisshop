package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type SellerUser struct{ ent.Schema }

func (SellerUser) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (SellerUser) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("seller_id").NotEmpty(),
		field.String("user_id").NotEmpty(),
		field.String("role").Default("seller_operator"),
	}
}
func (SellerUser) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("seller", Seller.Type).Ref("users").Field("seller_id").Required(),
		edge.From("user", User.Type).Ref("seller_links").Field("user_id").Required(),
	}
}
func (SellerUser) Indexes() []ent.Index { return []ent.Index{index.Fields("seller_id", "user_id").Unique()}}
