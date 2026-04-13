# Modulo Fiscal Externo

Servico externo em Go 1.26 para calculo fiscal, snapshots de emissao e GUI administrativa.

## O que entrega

- GUI web para configuracoes, empresas, simulacao e historico.
- API REST para calculo e emissao:
  - `POST /v1/tax/calculate`
  - `POST /v1/invoice/preview`
  - `POST /v1/invoice/issue`
  - `GET /v1/invoice/{id}`
  - `POST /v1/invoice/{id}/cancel`
- Autenticacao via Keycloak com role `admin`.
- Persistencia simples em arquivo JSON para facilitar bootstrap local.

## Rodar localmente

```bash
cd fiscal
go run .
```

## Observacao importante

As aliquotas implementadas aqui sao um motor de referencia para validacao de fluxo, UX e integracao Dolibarr. Nao substituem uma engine fiscal oficial com tabelas e regras legais atualizadas.
