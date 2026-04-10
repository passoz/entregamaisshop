package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type AuditLog struct{ ent.Schema }

func (AuditLog) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (AuditLog) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("actor_user_id").Optional(),
		field.String("action").NotEmpty(),
		field.String("resource_type").NotEmpty(),
		field.String("resource_id").NotEmpty(),
		field.String("metadata_json").Optional(),
		field.String("request_id").Optional(),
		field.String("correlation_id").Optional(),
	}
}
func (AuditLog) Indexes() []ent.Index { return []ent.Index{index.Fields("resource_type", "resource_id"), index.Fields("actor_user_id")}}
