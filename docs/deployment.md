# Deployment

## Docker Compose por ambiente
### dev
```bash
./scripts/dev/up.sh dev
./scripts/ops/check-stack.sh dev
```

### test
```bash
./scripts/dev/up.sh test
./scripts/ops/check-stack.sh test
```

### prod (template)
1. Preparar variaveis:
```bash
cp env/prod/platform.env.example env/prod/platform.env
# editar valores reais
```
2. Subir:
```bash
./scripts/dev/up.sh prod
```
3. Validar:
```bash
./scripts/ops/check-stack.sh prod
```
4. Parar:
```bash
./scripts/dev/down.sh prod
```

## Composicao de arquivos
- Base comum: `infra/docker/compose/docker-compose.base.yml`
- Overlay dev: `infra/docker/compose/docker-compose.dev.yml`
- Overlay test: `infra/docker/compose/docker-compose.test.yml`
- Overlay prod: `infra/docker/compose/docker-compose.prod.yml`

## Kubernetes
```bash
kubectl apply -k infra/kubernetes/overlays/dev
kubectl apply -k infra/kubernetes/overlays/staging
kubectl apply -k infra/kubernetes/overlays/prod
```

## Helm
```bash
helm dependency update infra/helm/platform
helm upgrade --install entregamais infra/helm/platform
```
