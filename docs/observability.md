# Observability

Estruturada em logs JSON + correlacao por `request_id`/`correlation_id` + Loki/Promtail + dashboards no Grafana.

Cada servico deve registrar eventos HTTP e async com os campos obrigatorios da plataforma.
