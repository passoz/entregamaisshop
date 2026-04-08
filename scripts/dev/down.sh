#!/usr/bin/env sh
set -e
ENV_NAME="${1:-dev}"

case "$ENV_NAME" in
  dev|test|prod) ;;
  *)
    echo "Uso: $0 [dev|test|prod]"
    exit 1
    ;;
esac

if [ "$ENV_NAME" = "prod" ] && [ ! -f env/prod/platform.env ]; then
  echo "Crie env/prod/platform.env a partir de env/prod/platform.env.example"
  exit 1
fi

ENV_FILE="env/$ENV_NAME/platform.env"
COMPOSE_FILES="-f infra/docker/compose/docker-compose.base.yml -f infra/docker/compose/docker-compose.$ENV_NAME.yml"

docker compose --env-file "$ENV_FILE" $COMPOSE_FILES down
