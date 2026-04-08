#!/usr/bin/env sh
set -e
cd backend && go test ./...
cd ../frontend && npm run test
