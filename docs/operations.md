# Operations

## Checklist de startup
1. Subir stack do ambiente.
2. Validar health (`/api/v1/health`).
3. Validar OpenAPI (`/openapi.json`).
4. Validar login no Keycloak.
5. Validar Kibana/ELK.

## Comandos operacionais
```bash
# subir
./scripts/dev/up.sh dev

# validar
./scripts/ops/check-stack.sh dev

# logs
docker compose --env-file env/dev/platform.env \
  -f infra/docker/compose/docker-compose.base.yml \
  -f infra/docker/compose/docker-compose.dev.yml \
  logs -f backend gateway keycloak

# parar
./scripts/dev/down.sh dev
```

## Troubleshooting rapido
- gateway fora: verificar `gateway/routes/routes.yaml`
- keycloak fora: verificar `postgres-auth` e realm import
- backend fora: verificar `backend/.env.example` e dependencias
- kibana vazio: validar pipeline Logstash + indice `logs-*`
