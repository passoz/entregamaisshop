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
- Modulo fiscal: `http://localhost:8090`
- Dolibarr: `http://localhost:8088`
- Grafana: `http://localhost:5601`
- Loki: `http://localhost:3100`

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
- Modulo fiscal: `http://localhost:18090`
- Dolibarr: `http://localhost:18088`
- Grafana: `http://localhost:15601`
- Loki: `http://localhost:19100`

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
4. Validar logs e dashboards no Grafana.

## 6.1 Validacao do modulo fiscal e Dolibarr
1. Acesse a GUI fiscal em `http://localhost:8090` e autentique com `admin@entregamaisshop.com / admin123`.
2. Abra o Dolibarr em `http://localhost:8088` com o mesmo usuario para validar `openid_connect,dolibarr`.
3. No modulo fiscal, use a tela "Simulador" para testar `POST /v1/tax/calculate`.
4. No Dolibarr, confirme a existencia do modulo `FiscalBridge` e da pagina de configuracao em `Home -> Setup -> Modules/Applications`.

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
