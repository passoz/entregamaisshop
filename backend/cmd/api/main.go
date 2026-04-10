package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/entregamais/platform/backend/internal/infrastructure/auth"
	apihttp "github.com/entregamais/platform/backend/internal/interface/http"
	"github.com/entregamais/platform/backend/internal/infrastructure/config"
	"github.com/entregamais/platform/backend/internal/infrastructure/db"
	"github.com/entregamais/platform/backend/internal/infrastructure/logger"
)

func main() {
	cfg := config.Load()
	lg := logger.New(cfg.AppName, cfg.Environment)

	dbClient, err := db.NewClient(cfg)
	if err != nil {
		lg.Error("db_connection_failed", err, nil)
		log.Fatal(err)
	}
	defer dbClient.Close()

	if err := db.Seed(context.Background(), dbClient); err != nil {
		lg.Error("db_seed_failed", err, nil)
	}

	// Initialize JWT Verifier
	verifier, err := auth.NewJWTVerifier(cfg.KeycloakIssuerURL)
	if err != nil {
		lg.Error("jwt_verifier_initialization_failed", err, nil)
		// We allow continuation in dev mock mode if needed, but log the error
	}

	router := apihttp.NewRouter(cfg, lg, dbClient, verifier)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      20 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		lg.Info("server_starting", map[string]any{"port": cfg.Port})
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			lg.Error("server_failed", err, nil)
			log.Fatal(err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	lg.Info("server_shutting_down", nil)
	if err := srv.Shutdown(ctx); err != nil {
		lg.Error("server_shutdown_failed", err, nil)
	}
}
