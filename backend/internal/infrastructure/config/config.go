package config

import "os"

type Config struct {
	AppName            string
	Environment        string
	Port               string
	DatabaseURL        string
	KeycloakIssuerURL  string
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func Load() Config {
	return Config{
		AppName:           getEnv("APP_NAME", "backend-api"),
		Environment:       getEnv("ENVIRONMENT", "dev"),
		Port:              getEnv("PORT", "8080"),
		DatabaseURL:       getEnv("DATABASE_URL", "postgres://user:pass@localhost:5432/entregamais?sslmode=disable"),
		KeycloakIssuerURL: getEnv("KEYCLOAK_ISSUER_URL", "http://localhost:8080/realms/delivery-platform"),
	}
}
