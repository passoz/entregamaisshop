package logger

import (
	"encoding/json"
	"log"
	"os"
	"time"
)

type Logger struct {
	serviceName string
	environment string
	out         *log.Logger
}

type Entry struct {
	Timestamp     string         `json:"timestamp"`
	ServiceName   string         `json:"service_name"`
	Environment   string         `json:"environment"`
	LogLevel      string         `json:"log_level"`
	Message       string         `json:"message"`
	RequestID     string         `json:"request_id,omitempty"`
	CorrelationID string         `json:"correlation_id,omitempty"`
	Route         string         `json:"route,omitempty"`
	Method        string         `json:"method,omitempty"`
	StatusCode    int            `json:"status_code,omitempty"`
	LatencyMS     int64          `json:"latency_ms,omitempty"`
	EventType     string         `json:"event_type,omitempty"`
	ErrorCode     string         `json:"error_code,omitempty"`
	Fields        map[string]any `json:"fields,omitempty"`
	Error         string         `json:"error,omitempty"`
}

func New(serviceName, environment string) *Logger {
	return &Logger{
		serviceName: serviceName,
		environment: environment,
		out:         log.New(os.Stdout, "", 0),
	}
}

func (l *Logger) log(level, msg string, err error, fields map[string]any) {
	entry := Entry{
		Timestamp:   time.Now().UTC().Format(time.RFC3339Nano),
		ServiceName: l.serviceName,
		Environment: l.environment,
		LogLevel:    level,
		Message:     msg,
		Fields:      fields,
	}
	if err != nil {
		entry.Error = err.Error()
	}

	b, marshalErr := json.Marshal(entry)
	if marshalErr != nil {
		l.out.Printf(`{"timestamp":"%s","log_level":"error","message":"json_marshal_failed","error":"%s"}`,
			time.Now().UTC().Format(time.RFC3339Nano), marshalErr.Error())
		return
	}
	l.out.Println(string(b))
}

func (l *Logger) Info(msg string, fields map[string]any) {
	l.log("info", msg, nil, fields)
}

func (l *Logger) Error(msg string, err error, fields map[string]any) {
	l.log("error", msg, err, fields)
}
