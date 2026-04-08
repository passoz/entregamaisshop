#!/usr/bin/env sh
mc alias set local http://minio:9000 minio minio123
mc mb --ignore-existing local/uploads
mc mb --ignore-existing local/products
mc mb --ignore-existing local/orders
