# Monorepo Structure

- `backend/`: API e dominio
- `frontend/`: web app
- `gateway/`: APISIX
- `auth/`: Keycloak realm-as-code
- `postgres/`, `postgres-auth/`, `redis/`, `minio/`, `rabbitmq/`: dados/plataforma
- `infra/loki/`, `infra/promtail/`, `infra/grafana/`: observabilidade
- `infra/`: compose, kubernetes, helm
- `.github/workflows/`: CI/CD
