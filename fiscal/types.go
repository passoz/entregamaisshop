package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"os"
	"strings"
	"time"
)

type Config struct {
	Addr                 string
	PublicURL            string
	StateFile            string
	SessionSecret        string
	APIToken             string
	KeycloakPublicURL    string
	KeycloakInternalURL  string
	KeycloakRealm        string
	KeycloakClientID     string
	KeycloakClientSecret string
	RequiredRole         string
}

func loadConfig() Config {
	return Config{
		Addr:                 getenv("APP_ADDR", ":8090"),
		PublicURL:            strings.TrimRight(getenv("PUBLIC_URL", "http://localhost:8090"), "/"),
		StateFile:            getenv("STATE_FILE", "data/state.json"),
		SessionSecret:        getenv("SESSION_SECRET", "fiscal-dev-secret"),
		APIToken:             getenv("FISCAL_API_TOKEN", "fiscal-bridge-dev-token"),
		KeycloakPublicURL:    strings.TrimRight(getenv("KEYCLOAK_PUBLIC_URL", ""), "/"),
		KeycloakInternalURL:  strings.TrimRight(getenv("KEYCLOAK_INTERNAL_URL", getenv("KEYCLOAK_PUBLIC_URL", "")), "/"),
		KeycloakRealm:        getenv("KEYCLOAK_REALM", "delivery-platform"),
		KeycloakClientID:     getenv("KEYCLOAK_CLIENT_ID", "fiscal-gui"),
		KeycloakClientSecret: getenv("KEYCLOAK_CLIENT_SECRET", ""),
		RequiredRole:         getenv("REQUIRED_ROLE", "admin"),
	}
}

func (c Config) OIDCEnabled() bool {
	return c.KeycloakPublicURL != "" && c.KeycloakInternalURL != "" && c.KeycloakClientID != "" && c.KeycloakClientSecret != ""
}

func (c Config) publicRealmURL() string {
	return c.KeycloakPublicURL + "/realms/" + c.KeycloakRealm
}

func (c Config) internalRealmURL() string {
	return c.KeycloakInternalURL + "/realms/" + c.KeycloakRealm
}

func (c Config) AuthorizeURL() string {
	return c.publicRealmURL() + "/protocol/openid-connect/auth"
}

func (c Config) TokenURL() string {
	return c.internalRealmURL() + "/protocol/openid-connect/token"
}

func (c Config) RedirectURL() string {
	return c.PublicURL + "/auth/callback"
}

func (c Config) LogoutURL(token string) string {
	return c.publicRealmURL() + "/protocol/openid-connect/logout?client_id=" + c.KeycloakClientID + "&post_logout_redirect_uri=" + c.PublicURL
}

type FiscalSettings struct {
	ServiceName               string           `json:"service_name"`
	DefaultRegime             string           `json:"default_regime"`
	DefaultOperationNature    string           `json:"default_operation_nature"`
	RequireCalculationOnIssue bool             `json:"require_calculation_on_issue"`
	AllowDraftWithoutFiscal   bool             `json:"allow_draft_without_fiscal"`
	Dolibarr                  DolibarrSettings `json:"dolibarr"`
}

type DolibarrSettings struct {
	BaseURL       string `json:"base_url"`
	APIBaseURL    string `json:"api_base_url"`
	APIKey        string `json:"api_key"`
	Entity        string `json:"entity"`
	WebhookSecret string `json:"webhook_secret"`
}

type Company struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	CNPJ             string    `json:"cnpj"`
	State            string    `json:"state"`
	MunicipalityCode string    `json:"municipality_code"`
	Regime           string    `json:"regime"`
	Entity           string    `json:"entity"`
	DefaultCFOP      string    `json:"default_cfop"`
	Enabled          bool      `json:"enabled"`
	CreatedAt        time.Time `json:"created_at"`
}

type AuditEntry struct {
	At     time.Time `json:"at"`
	Action string    `json:"action"`
	Actor  string    `json:"actor"`
	Detail string    `json:"detail"`
}

type TaxCalculationRequest struct {
	Company    CompanyInput  `json:"company"`
	Customer   CustomerInput `json:"customer"`
	Document   DocumentInput `json:"document"`
	Items      []ItemInput   `json:"items"`
	Freight    float64       `json:"freight"`
	Insurance  float64       `json:"insurance"`
	OtherCosts float64       `json:"other_costs"`
}

type CompanyInput struct {
	ID               string `json:"id"`
	Name             string `json:"name"`
	CNPJ             string `json:"cnpj"`
	Regime           string `json:"regime"`
	State            string `json:"state"`
	MunicipalityCode string `json:"municipality_code"`
}

type CustomerInput struct {
	Document         string `json:"document"`
	Type             string `json:"type"`
	State            string `json:"state"`
	MunicipalityCode string `json:"municipality_code"`
	TaxpayerICMS     bool   `json:"taxpayer_icms"`
}

type DocumentInput struct {
	Type            string `json:"type"`
	Purpose         string `json:"purpose"`
	IssueDate       string `json:"issue_date"`
	OperationNature string `json:"operation_nature"`
	ExternalRef     string `json:"external_ref"`
	Source          string `json:"source"`
}

type ItemInput struct {
	LineID      string  `json:"line_id"`
	SKU         string  `json:"sku"`
	Description string  `json:"description"`
	NCM         string  `json:"ncm"`
	CFOP        string  `json:"cfop"`
	Quantity    float64 `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	Discount    float64 `json:"discount"`
	Origin      int     `json:"origin"`
	ServiceCode string  `json:"service_code"`
}

type Totals struct {
	Products      float64 `json:"products"`
	Discount      float64 `json:"discount"`
	Freight       float64 `json:"freight"`
	DocumentTotal float64 `json:"document_total"`
}

type Taxes struct {
	ICMS   float64 `json:"icms"`
	IPI    float64 `json:"ipi"`
	PIS    float64 `json:"pis"`
	COFINS float64 `json:"cofins"`
	ISS    float64 `json:"iss"`
	IBS    float64 `json:"ibs"`
	CBS    float64 `json:"cbs"`
}

type CalculatedItem struct {
	LineID      string  `json:"line_id"`
	Description string  `json:"description"`
	BaseICMS    float64 `json:"base_icms"`
	RateICMS    float64 `json:"rate_icms"`
	ValueICMS   float64 `json:"value_icms"`
	BasePIS     float64 `json:"base_pis"`
	ValuePIS    float64 `json:"value_pis"`
	BaseCOFINS  float64 `json:"base_cofins"`
	ValueCOFINS float64 `json:"value_cofins"`
	ValueISS    float64 `json:"value_iss"`
	ValueIPI    float64 `json:"value_ipi"`
	ValueIBS    float64 `json:"value_ibs"`
	ValueCBS    float64 `json:"value_cbs"`
}

type FiscalMetadata struct {
	CFOPEffective   string   `json:"cfop_final"`
	RequiresInvoice bool     `json:"requires_invoice"`
	Messages        []string `json:"messages"`
	SnapshotHash    string   `json:"snapshot_hash"`
}

type TaxCalculationResponse struct {
	Status         string           `json:"status"`
	Totals         Totals           `json:"totals"`
	Taxes          Taxes            `json:"taxes"`
	Items          []CalculatedItem `json:"items"`
	FiscalMetadata FiscalMetadata   `json:"fiscal_metadata"`
	CalculatedAt   time.Time        `json:"calculated_at"`
}

type StoredDocument struct {
	ID          string                 `json:"id"`
	ExternalRef string                 `json:"external_ref"`
	Status      string                 `json:"status"`
	Source      string                 `json:"source"`
	AccessKey   string                 `json:"access_key"`
	Request     TaxCalculationRequest  `json:"request"`
	Calculation TaxCalculationResponse `json:"calculation"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
}

type IssueInvoiceResponse struct {
	Status      string                 `json:"status"`
	InvoiceID   string                 `json:"invoice_id"`
	AccessKey   string                 `json:"access_key"`
	XMLURL      string                 `json:"xml_url"`
	PDFURL      string                 `json:"pdf_url"`
	IssuedAt    time.Time              `json:"issued_at"`
	Calculation TaxCalculationResponse `json:"calculation"`
}

func defaultSettings() FiscalSettings {
	return FiscalSettings{
		ServiceName:               "Brazil Fiscal Adapter",
		DefaultRegime:             "SIMPLES",
		DefaultOperationNature:    "Venda de mercadoria",
		RequireCalculationOnIssue: true,
		AllowDraftWithoutFiscal:   true,
	}
}

func getenv(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func (r *TaxCalculationRequest) normalize(settings FiscalSettings) {
	if strings.TrimSpace(r.Company.Regime) == "" {
		r.Company.Regime = settings.DefaultRegime
	}
	if strings.TrimSpace(r.Document.OperationNature) == "" {
		r.Document.OperationNature = settings.DefaultOperationNature
	}
	if strings.TrimSpace(r.Document.IssueDate) == "" {
		r.Document.IssueDate = time.Now().Format("2006-01-02")
	}
}

func (r TaxCalculationRequest) effectiveCFOP() string {
	for _, item := range r.Items {
		if strings.TrimSpace(item.CFOP) != "" {
			return item.CFOP
		}
	}
	return "5102"
}

func (r TaxCalculationRequest) isServiceOperation() bool {
	if strings.Contains(strings.ToLower(r.Document.Type), "service") || strings.Contains(strings.ToLower(r.Document.Type), "nfs") {
		return true
	}
	for _, item := range r.Items {
		if strings.TrimSpace(item.ServiceCode) != "" {
			return true
		}
	}
	return false
}

func snapshotHash(req TaxCalculationRequest) string {
	payload, _ := json.Marshal(req)
	sum := sha256.Sum256(payload)
	return hex.EncodeToString(sum[:])
}
