# Ent Migrate

Este diretorio recebe artefatos de migracao e lock de schema do Ent.

Comandos sugeridos:
```bash
cd backend
ent generate ./ent/schema
ent migrate diff --dir "file://migrations" --name init
```
