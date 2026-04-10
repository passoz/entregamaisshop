package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type SellerReview struct{ ent.Schema }

func (SellerReview) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }

func (SellerReview) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.Int("score").Min(1).Max(5),
		field.String("comment").Optional(),
	}
}

func (SellerReview) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("seller", Seller.Type).Ref("reviews").Unique().Required(),
		edge.From("customer", User.Type).Ref("seller_reviews").Unique().Required(),
	}
}

func (SellerReview) Indexes() []ent.Index { return nil }
