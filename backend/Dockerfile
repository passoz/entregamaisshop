FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/backend ./cmd/api

FROM gcr.io/distroless/static-debian12
ENV PORT=8080
WORKDIR /app
COPY --from=builder /bin/backend /app/backend
COPY --from=builder /app/api/openapi/openapi.json /app/api/openapi/openapi.json
EXPOSE 8080
ENTRYPOINT ["/app/backend"]
