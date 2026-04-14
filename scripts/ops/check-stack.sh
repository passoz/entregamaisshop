#!/usr/bin/env sh
set -e
ENV_NAME="${1:-dev}"

case "$ENV_NAME" in
  dev)
    GATEWAY_URL="http://localhost"
    GRAFANA_URL="http://localhost:5601"
    ;;
  test)
    GATEWAY_URL="http://localhost:19080"
    GRAFANA_URL="http://localhost:15601"
    ;;
  prod)
    GATEWAY_URL="http://localhost"
    GRAFANA_URL="http://localhost:5601"
    ;;
  *)
    echo "Uso: $0 [dev|test|prod]"
    exit 1
    ;;
esac

printf "\nGateway health...\n"
curl -fsS -H "Host: api.127.0.0.1.nip.io" "$GATEWAY_URL/api/v1/health" | head -c 300; printf "\n"

printf "\nBackend openapi...\n"
curl -fsS -H "Host: api.127.0.0.1.nip.io" "$GATEWAY_URL/openapi.json" | head -c 200; printf "\n"

printf "\nKeycloak...\n"
curl -fsSI -H "Host: auth.127.0.0.1.nip.io" "$GATEWAY_URL" | head -n 1

printf "\nGrafana...\n"
curl -fsSI "$GRAFANA_URL" | head -n 1

printf "\nOK: stack $ENV_NAME respondeu endpoints principais.\n"
