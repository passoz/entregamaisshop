FROM golang:1.26-alpine AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /out/fiscal .

FROM alpine:3.22
WORKDIR /app
# O UID 10001 é o padrão que usamos para o processo fiscal
RUN adduser -D -u 10001 fiscal && mkdir -p /data && chown -R fiscal:fiscal /data
COPY --from=build /out/fiscal /usr/local/bin/fiscal

# Garantimos que o diretório de dados seja tratável como um volume
VOLUME /data

USER fiscal
EXPOSE 8090
ENV APP_ADDR=:8090
ENV PUBLIC_URL=http://localhost:8090
ENV STATE_FILE=/data/state.json
CMD ["fiscal"]
