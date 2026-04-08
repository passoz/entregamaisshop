# Manual Completo de Execucao (dev, test, prod)

## 1. Pre-requisitos
- Docker + Docker Compose plugin
- `curl`
- `jq` (opcional, usado em scripts CI)

## 2. Estrategia de ambientes
A stack usa:
- **base comum**: servicos e wiring
- **overlay por ambiente**: portas/restart/politicas
- **env file por ambiente**: credenciais e nomes isolados

Arquivos principais:
- `infra/docker/compose/docker-compose.base.yml`
- `infra/docker/compose/docker-compose.dev.yml`
- `infra/docker/compose/docker-compose.test.yml`
- `infra/docker/compose/docker-compose.prod.yml`
- `env/dev/platform.env`
- `env/test/platform.env`
- `env/prod/platform.env` (gerado a partir do example)

## 3. Subir ambiente de desenvolvimento
```bash
./scripts/dev/up.sh dev
```
Validar:
```bash
./scripts/ops/check-stack.sh dev
```
Acessos:
- Gateway: `http://localhost:9080`
- Frontend: `http://localhost:3000`
- Keycloak: `http://localhost:8081`
- Kibana: `http://localhost:5601`

## 4. Subir ambiente de teste
```bash
./scripts/dev/up.sh test
```
Validar:
```bash
./scripts/ops/check-stack.sh test
```
Acessos (test):
- Gateway: `http://localhost:19080`
- Frontend: `http://localhost:13000`
- Keycloak: `http://localhost:18081`
- Kibana: `http://localhost:15601`

## 5. Subir profile de producao
```bash
cp env/prod/platform.env.example env/prod/platform.env
# editar segredos/imagenes
./scripts/dev/up.sh prod
./scripts/ops/check-stack.sh prod
```

## 6. Teste end-to-end minimo
1. Login no Keycloak (`customer.demo / 123456`).
2. Listar produtos:
```bash
curl -s http://localhost:9080/api/v1/products
```
3. Criar pedido (com bearer):
```bash
curl -s -X POST http://localhost:9080/api/v1/orders \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"product_id":"prod-1","quantity":2}]}'
```
4. Validar logs no Kibana.

## 7. Parar ambientes
```bash
./scripts/dev/down.sh dev
./scripts/dev/down.sh test
./scripts/dev/down.sh prod
```

## 8. Boas praticas
- nunca commitar `env/prod/platform.env`
- rotacionar segredos por ambiente
- usar imagens versionadas no prod
- manter `dev` e `test` rodando em portas distintas
