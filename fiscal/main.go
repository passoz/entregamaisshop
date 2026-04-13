package main

import (
	"log"
	"net/http"
)

func main() {
	cfg := loadConfig()
	store, err := newStore(cfg.StateFile)
	if err != nil {
		log.Fatalf("load store: %v", err)
	}

	app := newApp(cfg, store)

	log.Printf("fiscal module listening on %s", cfg.Addr)
	if err := http.ListenAndServe(cfg.Addr, app.routes()); err != nil {
		log.Fatalf("listen: %v", err)
	}
}
