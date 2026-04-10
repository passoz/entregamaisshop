package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type OutboxEvent struct{ ent.Schema }

func (OutboxEvent) Mixin() []ent.Mixin { return []ent.Mixin{TimeMixin{}} }
func (OutboxEvent) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").NotEmpty().Unique(),
		field.String("aggregate_type").NotEmpty(),
		field.String("aggregate_id").NotEmpty(),
		field.String("event_type").NotEmpty(),
		field.String("event_version").Default("v1"),
		field.String("payload_json").NotEmpty(),
		field.String("metadata_json").Optional(),
		field.String("status").Default("pending"),
		field.Int("retry_count").Default(0),
		field.Time("next_attempt_at").Default(time.Now),
		field.Time("published_at").Optional().Nillable(),
	}
}
func (OutboxEvent) Indexes() []ent.Index {
	return []ent.Index{index.Fields("status", "next_attempt_at"), index.Fields("aggregate_type", "aggregate_id")}
}
