#!/usr/bin/env sh
set -e
ENV_NAME="${1:-dev}"

case "$ENV_NAME" in
  dev)
    GATEWAY_URL="http://localhost:9080"
    BACKEND_URL="http://localhost:8080"
    KEYCLOAK_URL="http://localhost:8081"
    KIBANA_URL="http://localhost:5601"
    ;;
  test)
    GATEWAY_URL="http://localhost:19080"
    BACKEND_URL="http://localhost:18080"
    KEYCLOAK_URL="http://localhost:18081"
    KIBANA_URL="http://localhost:15601"
    ;;
  prod)
    GATEWAY_URL="http://localhost"
    BACKEND_URL="http://localhost:8080"
    KEYCLOAK_URL="http://localhost:8081"
    KIBANA_URL="http://localhost:5601"
    ;;
  *)
    echo "Uso: $0 [dev|test|prod]"
    exit 1
    ;;
esac

printf "\nGateway health...\n"
curl -fsS "$GATEWAY_URL/api/v1/health" | head -c 300; printf "\n"

printf "\nBackend openapi...\n"
curl -fsS "$BACKEND_URL/openapi.json" | head -c 200; printf "\n"

printf "\nKeycloak...\n"
curl -fsSI "$KEYCLOAK_URL" | head -n 1

printf "\nKibana...\n"
curl -fsSI "$KIBANA_URL" | head -n 1

printf "\nOK: stack $ENV_NAME respondeu endpoints principais.\n"
