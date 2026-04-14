# Troubleshooting

Problemas comuns:
- APISIX nao roteia: verificar `gateway/routes/routes.yaml`
- Login falha: validar realm import no Keycloak
- Backend sem OpenAPI: confirmar `backend/api/openapi/openapi.json`
- Sem logs no Grafana: validar Promtail, Loki e labels de discovery Docker
