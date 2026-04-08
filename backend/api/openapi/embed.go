package openapi

import _ "embed"

// Spec is the embedded OpenAPI document served by the HTTP router.
//
//go:embed openapi.json
var Spec []byte
