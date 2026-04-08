# EntregaMais Platform Monorepo

Plataforma distribuida de delivery de bebidas inspirada no modelo do Ze Delivery, com arquitetura orientada a eventos, observabilidade centralizada e pronta para Docker/Kubernetes.

## Subir rapido
```bash
# desenvolvimento
./scripts/dev/up.sh dev
./scripts/ops/check-stack.sh dev

# teste
./scripts/dev/up.sh test
./scripts/ops/check-stack.sh test
```

## Ambientes
- `dev`: `env/dev/platform.env` + `docker-compose.base.yml` + `docker-compose.dev.yml`
- `test`: `env/test/platform.env` + `docker-compose.base.yml` + `docker-compose.test.yml`
- `prod`: `env/prod/platform.env` + `docker-compose.base.yml` + `docker-compose.prod.yml`

## Manual completo
Veja `docs/manual-run.md`.

## Endpoints principais (dev)
- Gateway: `http://localhost:9080`
- Backend health: `http://localhost:8080/api/v1/health`
- OpenAPI: `http://localhost:8080/openapi.json`
- Docs API: `http://localhost:8080/docs`
- Keycloak: `http://localhost:8081`
- Kibana: `http://localhost:5601`
