package config

import (
	"os"
	"testing"
)

func TestLoad(t *testing.T) {
	// Setup test environment
	os.Setenv("APP_NAME", "test-api")
	os.Setenv("ENVIRONMENT", "test")
	os.Setenv("PORT", "9999")
	defer func() {
		os.Unsetenv("APP_NAME")
		os.Unsetenv("ENVIRONMENT")
		os.Unsetenv("PORT")
	}()

	cfg := Load()

	if cfg.AppName != "test-api" {
		t.Errorf("expected APP_NAME test-api, got %s", cfg.AppName)
	}
	if cfg.Environment != "test" {
		t.Errorf("expected ENVIRONMENT test, got %s", cfg.Environment)
	}
	if cfg.Port != "9999" {
		t.Errorf("expected PORT 9999, got %s", cfg.Port)
	}
}

func TestLoadDefaults(t *testing.T) {
	// Ensure env is clean
	os.Unsetenv("APP_NAME")
	os.Unsetenv("ENVIRONMENT")
	os.Unsetenv("PORT")

	cfg := Load()

	if cfg.AppName != "backend-api" {
		t.Errorf("expected default APP_NAME backend-api, got %s", cfg.AppName)
	}
	if cfg.Environment != "dev" {
		t.Errorf("expected default ENVIRONMENT dev, got %s", cfg.Environment)
	}
	if cfg.Port != "8080" {
		t.Errorf("expected default PORT 8080, got %s", cfg.Port)
	}
}
