package logger

import (
	"bytes"
	"encoding/json"
	"errors"
	"log"
	"testing"
)

func TestLogger(t *testing.T) {
	var buf bytes.Buffer
	l := &Logger{
		serviceName: "test-service",
		environment: "test",
		out:         log.New(&buf, "", 0),
	}

	l.Info("test message", map[string]any{"foo": "bar"})

	var entry Entry
	if err := json.Unmarshal(buf.Bytes(), &entry); err != nil {
		t.Fatalf("failed to unmarshal log entry: %v", err)
	}

	if entry.Message != "test message" {
		t.Errorf("expected message 'test message', got '%s'", entry.Message)
	}
	if entry.LogLevel != "info" {
		t.Errorf("expected level 'info', got '%s'", entry.LogLevel)
	}
	if entry.Fields["foo"] != "bar" {
		t.Errorf("expected field foo=bar, got %v", entry.Fields["foo"])
	}
}

func TestLoggerError(t *testing.T) {
	var buf bytes.Buffer
	l := &Logger{
		serviceName: "test-service",
		environment: "test",
		out:         log.New(&buf, "", 0),
	}

	testErr := errors.New("boom")
	l.Error("test error", testErr, map[string]any{"id": 123})

	var entry Entry
	if err := json.Unmarshal(buf.Bytes(), &entry); err != nil {
		t.Fatalf("failed to unmarshal log entry: %v", err)
	}

	if entry.Message != "test error" {
		t.Errorf("expected message 'test error', got '%s'", entry.Message)
	}
	if entry.LogLevel != "error" {
		t.Errorf("expected level 'error', got '%s'", entry.LogLevel)
	}
	if entry.Error != "boom" {
		t.Errorf("expected error 'boom', got '%s'", entry.Error)
	}
}
