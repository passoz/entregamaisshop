#!/usr/bin/env sh
set -e
test -f backend/api/openapi/openapi.json
jq . backend/api/openapi/openapi.json >/dev/null
