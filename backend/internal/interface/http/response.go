package http

import (
	"encoding/json"
	"net/http"
)

type APIResponse struct {
	Success bool `json:"success"`
	Data    any  `json:"data,omitempty"`
	Error   any  `json:"error,omitempty"`
	Meta    any  `json:"meta,omitempty"`
}

type APIError struct {
	Code          string `json:"code"`
	Message       string `json:"message"`
	Details       any    `json:"details,omitempty"`
	RequestID     string `json:"request_id,omitempty"`
	CorrelationID string `json:"correlation_id,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, body APIResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func writeSuccess(w http.ResponseWriter, status int, data any, meta any) {
	writeJSON(w, status, APIResponse{Success: true, Data: data, Meta: meta})
}

func writeError(w http.ResponseWriter, status int, apiErr APIError) {
	writeJSON(w, status, APIResponse{Success: false, Error: apiErr})
}
