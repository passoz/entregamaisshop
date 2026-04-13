# Dolibarr Integrado ao Modulo Fiscal

Esta pasta concentra a camada de integracao do Dolibarr com o motor fiscal externo.

## Componentes

- `custom/fiscalbridge`: bridge fino carregado como modulo externo do Dolibarr.
- `scripts/before-starting.d/10-keycloak-openid.php`: automatiza a configuracao de `openid_connect,dolibarr` e injeta os parametros OIDC no banco do Dolibarr.
- `volumes/`: persistencia local de documentos e banco MariaDB.

## Estrategia

O Dolibarr segue como ERP/comercial. O fiscal pesado continua fora dele:

- Dolibarr organiza entidades, pedidos, faturas e usuarios.
- O FiscalBridge aponta para a GUI/API do servico externo.
- O servico externo persiste snapshots, calcula impostos e pode crescer para emissao oficial.
