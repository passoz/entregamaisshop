# FiscalBridge para Dolibarr

Bridge fino para ligar o Dolibarr ao modulo fiscal externo em Go.

## O que faz

- adiciona uma pagina de configuracao no admin do Dolibarr;
- adiciona um atalho "Fiscal Externo" em pedidos e faturas;
- centraliza a URL da GUI fiscal, URL da API e token.

## O que nao faz ainda

- emissao NF-e/NFS-e dentro do PHP;
- sincronizacao completa de linhas e impostos por gatilho;
- manutencao de regras tributarias brasileiras no core do Dolibarr.

Esse desenho e intencional: o motor fiscal fica desacoplado para que a camada legal/evolutiva possa crescer fora do ERP.
