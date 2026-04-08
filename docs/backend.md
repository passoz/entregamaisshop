# Backend

Implementado em Go 1.26 com `net/http` + `http.ServeMux`.

## Camadas Clean Architecture
- domain: entidades, regras e contratos
- usecase: orquestracao
- interface/http: handlers e DTOs
- infrastructure: config, logger, db/cache/storage/messaging/auth

## Padrao de resposta
Sucesso:
```json
{"success": true, "data": {}, "meta": {}}
```
Erro:
```json
{"success": false, "error": {"code": "validation_error", "message": "invalid request", "request_id": "...", "correlation_id": "..."}}
```
