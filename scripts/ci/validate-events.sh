#!/usr/bin/env sh
set -e
test -f rabbitmq/definitions/definitions.json
jq . rabbitmq/definitions/definitions.json >/dev/null
