package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/field"
)

type TimeMixin struct{ ent.Mixin }

func (TimeMixin) Fields() []ent.Field {
	return []ent.Field{
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

func (TimeMixin) Edges() []ent.Edge { return nil }
func (TimeMixin) Indexes() []ent.Index { return nil }
func (TimeMixin) Hooks() []ent.Hook { return nil }
func (TimeMixin) Policy() ent.Policy { return nil }
func (TimeMixin) Annotations() []schema.Annotation { return nil }
func (TimeMixin) Interceptors() []ent.Interceptor { return nil }
