package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type SellerDeliveryArea struct{ ent.Schema }

func (SellerDeliveryArea) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }

func (SellerDeliveryArea) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("label").NotEmpty(),
		field.Float("fee").NonNegative().Default(0),
	}
}

func (SellerDeliveryArea) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("seller", Seller.Type).Ref("delivery_areas").Unique().Required(),
	}
}

func (SellerDeliveryArea) Indexes() []ent.Index { return nil }
