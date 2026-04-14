# Architecture

A plataforma segue arquitetura distribuida com API Gateway (APISIX), Auth centralizado (Keycloak), backend stateless em Go, frontend Next.js, RabbitMQ para eventos e stack Loki/Promtail/Grafana para observabilidade.

Fluxo principal:
- Cliente autentica no Keycloak.
- Frontend chama APIs pelo APISIX.
- APISIX aplica OIDC, CORS, rate-limit e roteia para backend.
- Backend persiste em PostgreSQL, usa Redis/MinIO e publica eventos em RabbitMQ via outbox.
- Logs estruturados fluem para Loki via Promtail.
