# Local Development

## Ambientes suportados
- `dev`: desenvolvimento interativo
- `test`: validacoes integradas sem conflitar portas do `dev`
- `prod`: profile de producao (sem build local por padrao)

## Arquivos de ambiente
- `env/dev/platform.env`
- `env/test/platform.env`
- `env/prod/platform.env.example` (copiar para `env/prod/platform.env`)

## Subir stack
```bash
# dev
./scripts/dev/up.sh dev

# test
./scripts/dev/up.sh test
```

## Validar stack
```bash
# dev
./scripts/ops/check-stack.sh dev

# test
./scripts/ops/check-stack.sh test
```

## Parar stack
```bash
./scripts/dev/down.sh dev
./scripts/dev/down.sh test
```

## Portas principais
### dev
- gateway: `9080`
- backend: `8080`
- frontend: `3000`
- keycloak: `8081`
- kibana: `5601`

### test
- gateway: `19080`
- backend: `18080`
- frontend: `13000`
- keycloak: `18081`
- kibana: `15601`
