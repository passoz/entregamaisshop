# Backend (Go 1.26)

API principal da plataforma com arquitetura modular baseada em Clean Architecture.

## Caracteristicas
- `net/http` + `http.ServeMux`
- DTOs e respostas padronizadas
- middleware de `request_id` e `correlation_id`
- validacao com `validator/v10`
- OpenAPI versionado em `api/openapi/openapi.json`
- endpoint `/openapi.json` e `/docs`
- base para outbox pattern e publicacao de eventos RabbitMQ
- integracao desacoplada para Redis/MinIO/RabbitMQ/Keycloak

## Rodando localmente
```bash
cd backend
cp .env.example .env
go run ./cmd/api
```

## Testes
```bash
go test ./...
```

## Endpoints base
Base path: `/api/v1`.

Health:
- `GET /health`
- `GET /ready`
- `GET /live`

OpenAPI:
- `GET /openapi.json`
- `GET /docs`
