package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type app struct {
	cfg       Config
	store     *store
	templates *templateSet
}

type viewData struct {
	Title         string
	CurrentPath   string
	User          sessionUser
	AuthEnabled   bool
	Flash         string
	Error         string
	Dashboard     dashboardView
	Settings      FiscalSettings
	Companies     []Company
	Documents     []StoredDocument
	FormPayload   string
	FormAction    string
	CalcResponse  *TaxCalculationResponse
	IssueResponse *IssueInvoiceResponse
	RawResponse   string
}

type dashboardView struct {
	CompanyCount  int
	DocumentCount int
	IssuedCount   int
	PendingCount  int
	RecentAudit   []AuditEntry
}

func newApp(cfg Config, store *store) *app {
	return &app{
		cfg:       cfg,
		store:     store,
		templates: mustLoadTemplates(),
	}
}

func (a *app) routes() http.Handler {
	mux := http.NewServeMux()

	mux.Handle("GET /health", http.HandlerFunc(a.handleHealth))
	mux.Handle("GET /static/app.css", http.HandlerFunc(a.handleCSS))
	mux.Handle("GET /auth/login", http.HandlerFunc(a.handleLogin))
	mux.Handle("GET /auth/callback", http.HandlerFunc(a.handleCallback))
	mux.Handle("POST /auth/logout", http.HandlerFunc(a.handleLogout))

	mux.Handle("GET /v1/health", a.apiAuth(http.HandlerFunc(a.handleAPIHealth)))
	mux.Handle("POST /v1/tax/calculate", a.apiAuth(http.HandlerFunc(a.handleAPICalculate)))
	mux.Handle("POST /v1/invoice/preview", a.apiAuth(http.HandlerFunc(a.handleAPIPreview)))
	mux.Handle("POST /v1/invoice/issue", a.apiAuth(http.HandlerFunc(a.handleAPIIssue)))
	mux.Handle("GET /v1/invoice/", a.apiAuth(http.HandlerFunc(a.handleAPIInvoice)))
	mux.Handle("POST /v1/invoice/", a.apiAuth(http.HandlerFunc(a.handleAPIInvoice)))

	mux.Handle("GET /", a.requireSession(http.HandlerFunc(a.handleDashboard)))
	mux.Handle("GET /settings", a.requireSession(http.HandlerFunc(a.handleSettings)))
	mux.Handle("POST /settings", a.requireSession(http.HandlerFunc(a.handleSettings)))
	mux.Handle("GET /companies", a.requireSession(http.HandlerFunc(a.handleCompanies)))
	mux.Handle("POST /companies", a.requireSession(http.HandlerFunc(a.handleCompanies)))
	mux.Handle("POST /companies/delete", a.requireSession(http.HandlerFunc(a.handleCompanyDelete)))
	mux.Handle("GET /documents", a.requireSession(http.HandlerFunc(a.handleDocuments)))
	mux.Handle("GET /documents/new", a.requireSession(http.HandlerFunc(a.handleDocumentForm)))
	mux.Handle("POST /documents/new", a.requireSession(http.HandlerFunc(a.handleDocumentForm)))

	return mux
}

func (a *app) handleHealth(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	_, _ = w.Write([]byte("ok"))
}

func (a *app) handleCSS(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/css; charset=utf-8")
	_, _ = w.Write([]byte(appCSS))
}

func (a *app) handleDashboard(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r.Context())
	snapshot := a.store.snapshot()
	issued := 0
	pending := 0
	for _, doc := range snapshot.Documents {
		switch doc.Status {
		case "issued":
			issued++
		case "draft", "calculated":
			pending++
		}
	}

	recent := snapshot.Audit
	if len(recent) > 8 {
		recent = recent[len(recent)-8:]
	}

	a.render(w, r, "dashboard", viewData{
		Title:       "Fiscal Dashboard",
		CurrentPath: "/",
		User:        user,
		AuthEnabled: a.cfg.OIDCEnabled(),
		Settings:    snapshot.Settings,
		Dashboard: dashboardView{
			CompanyCount:  len(snapshot.Companies),
			DocumentCount: len(snapshot.Documents),
			IssuedCount:   issued,
			PendingCount:  pending,
			RecentAudit:   reverseAudit(recent),
		},
	})
}

func (a *app) handleSettings(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r.Context())
	snapshot := a.store.snapshot()
	flash := ""
	errMsg := ""

	if r.Method == http.MethodPost {
		if err := r.ParseForm(); err != nil {
			errMsg = "Nao foi possivel processar o formulario."
		} else {
			settings := snapshot.Settings
			settings.ServiceName = strings.TrimSpace(r.FormValue("service_name"))
			settings.DefaultRegime = strings.TrimSpace(r.FormValue("default_regime"))
			settings.DefaultOperationNature = strings.TrimSpace(r.FormValue("default_operation_nature"))
			settings.RequireCalculationOnIssue = r.FormValue("require_calculation_on_issue") == "on"
			settings.AllowDraftWithoutFiscal = r.FormValue("allow_draft_without_fiscal") == "on"
			settings.Dolibarr.BaseURL = strings.TrimSpace(r.FormValue("dolibarr_base_url"))
			settings.Dolibarr.APIBaseURL = strings.TrimSpace(r.FormValue("dolibarr_api_base_url"))
			settings.Dolibarr.APIKey = strings.TrimSpace(r.FormValue("dolibarr_api_key"))
			settings.Dolibarr.Entity = strings.TrimSpace(r.FormValue("dolibarr_entity"))
			settings.Dolibarr.WebhookSecret = strings.TrimSpace(r.FormValue("dolibarr_webhook_secret"))

			if err := a.store.updateSettings(settings, user.Email); err != nil {
				errMsg = "Falha ao salvar configuracoes."
			} else {
				flash = "Configuracoes salvas."
				snapshot = a.store.snapshot()
			}
		}
	}

	a.render(w, r, "settings", viewData{
		Title:       "Configuracoes",
		CurrentPath: "/settings",
		User:        user,
		AuthEnabled: a.cfg.OIDCEnabled(),
		Settings:    snapshot.Settings,
		Flash:       flash,
		Error:       errMsg,
	})
}

func (a *app) handleCompanies(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r.Context())
	snapshot := a.store.snapshot()
	flash := ""
	errMsg := ""

	if r.Method == http.MethodPost {
		if err := r.ParseForm(); err != nil {
			errMsg = "Nao foi possivel processar o formulario."
		} else {
			company := Company{
				ID:               strings.TrimSpace(r.FormValue("id")),
				Name:             strings.TrimSpace(r.FormValue("name")),
				CNPJ:             strings.TrimSpace(r.FormValue("cnpj")),
				State:            strings.TrimSpace(r.FormValue("state")),
				MunicipalityCode: strings.TrimSpace(r.FormValue("municipality_code")),
				Regime:           strings.TrimSpace(r.FormValue("regime")),
				Entity:           strings.TrimSpace(r.FormValue("entity")),
				DefaultCFOP:      strings.TrimSpace(r.FormValue("default_cfop")),
				Enabled:          r.FormValue("enabled") == "on",
			}
			if company.ID == "" {
				company.ID = slugify(company.Name)
			}
			if err := a.store.upsertCompany(company, user.Email); err != nil {
				errMsg = err.Error()
			} else {
				flash = "Empresa salva."
				snapshot = a.store.snapshot()
			}
		}
	}

	a.render(w, r, "companies", viewData{
		Title:       "Empresas",
		CurrentPath: "/companies",
		User:        user,
		AuthEnabled: a.cfg.OIDCEnabled(),
		Companies:   snapshot.Companies,
		Flash:       flash,
		Error:       errMsg,
	})
}

func (a *app) handleCompanyDelete(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r.Context())
	if err := r.ParseForm(); err != nil {
		http.Redirect(w, r, "/companies", http.StatusSeeOther)
		return
	}
	_ = a.store.deleteCompany(strings.TrimSpace(r.FormValue("id")), user.Email)
	http.Redirect(w, r, "/companies", http.StatusSeeOther)
}

func (a *app) handleDocuments(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r.Context())
	snapshot := a.store.snapshot()

	docs := snapshot.Documents
	for i, j := 0, len(docs)-1; i < j; i, j = i+1, j-1 {
		docs[i], docs[j] = docs[j], docs[i]
	}

	a.render(w, r, "documents", viewData{
		Title:       "Documentos Fiscais",
		CurrentPath: "/documents",
		User:        user,
		AuthEnabled: a.cfg.OIDCEnabled(),
		Documents:   docs,
	})
}

func (a *app) handleDocumentForm(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r.Context())
	snapshot := a.store.snapshot()
	payload := samplePayload(snapshot.Companies, snapshot.Settings)
	action := "calculate"
	var calc *TaxCalculationResponse
	var issue *IssueInvoiceResponse
	raw := ""
	errMsg := ""

	if r.Method == http.MethodPost {
		if err := r.ParseForm(); err != nil {
			errMsg = "Nao foi possivel processar o formulario."
		} else {
			payload = r.FormValue("payload")
			action = r.FormValue("action")
			var req TaxCalculationRequest
			if err := json.Unmarshal([]byte(payload), &req); err != nil {
				errMsg = "Payload JSON invalido."
			} else {
				if action == "issue" {
					resp, err := a.issueInvoice(req, user.Email)
					if err != nil {
						errMsg = err.Error()
					} else {
						issue = &resp
						buf, _ := json.MarshalIndent(resp, "", "  ")
						raw = string(buf)
					}
				} else {
					resp, err := a.calculate(req, user.Email, false)
					if err != nil {
						errMsg = err.Error()
					} else {
						calc = &resp
						buf, _ := json.MarshalIndent(resp, "", "  ")
						raw = string(buf)
					}
				}
			}
		}
	}

	a.render(w, r, "document_form", viewData{
		Title:         "Simular Documento",
		CurrentPath:   "/documents/new",
		User:          user,
		AuthEnabled:   a.cfg.OIDCEnabled(),
		Companies:     snapshot.Companies,
		FormPayload:   payload,
		FormAction:    action,
		CalcResponse:  calc,
		IssueResponse: issue,
		RawResponse:   raw,
		Error:         errMsg,
	})
}

func (a *app) handleAPIHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":     "ok",
		"service":    "fiscal-module",
		"auth_mode":  map[bool]string{true: "keycloak", false: "local"}[a.cfg.OIDCEnabled()],
		"updated_at": time.Now().UTC().Format(time.RFC3339),
	})
}

func (a *app) handleAPICalculate(w http.ResponseWriter, r *http.Request) {
	var req TaxCalculationRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	resp, err := a.calculate(req, actorFromAPI(r), false)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func (a *app) handleAPIPreview(w http.ResponseWriter, r *http.Request) {
	var req TaxCalculationRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	resp, err := a.calculate(req, actorFromAPI(r), true)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func (a *app) handleAPIIssue(w http.ResponseWriter, r *http.Request) {
	var req TaxCalculationRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	resp, err := a.issueInvoice(req, actorFromAPI(r))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, resp)
}

func (a *app) handleAPIInvoice(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/v1/invoice/")
	if path == "" {
		http.NotFound(w, r)
		return
	}
	if strings.HasSuffix(path, "/cancel") {
		id := strings.TrimSuffix(path, "/cancel")
		id = strings.TrimSuffix(id, "/")
		resp, err := a.store.cancelDocument(id, actorFromAPI(r))
		if err != nil {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, resp)
		return
	}

	doc, ok := a.store.document(path)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "document not found"})
		return
	}
	writeJSON(w, http.StatusOK, doc)
}

func (a *app) calculate(req TaxCalculationRequest, actor string, preview bool) (TaxCalculationResponse, error) {
	req.normalize(a.store.snapshot().Settings)
	resp, err := calculateTaxes(req)
	if err != nil {
		return TaxCalculationResponse{}, err
	}
	if !preview {
		_, err = a.store.saveCalculated(req, resp, actor)
		if err != nil {
			return TaxCalculationResponse{}, err
		}
	}
	return resp, nil
}

func (a *app) issueInvoice(req TaxCalculationRequest, actor string) (IssueInvoiceResponse, error) {
	req.normalize(a.store.snapshot().Settings)
	resp, err := calculateTaxes(req)
	if err != nil {
		return IssueInvoiceResponse{}, err
	}
	doc, err := a.store.issue(req, resp, actor)
	if err != nil {
		return IssueInvoiceResponse{}, err
	}

	return IssueInvoiceResponse{
		Status:     "issued",
		InvoiceID:  doc.ID,
		AccessKey:  doc.AccessKey,
		XMLURL:     fmt.Sprintf("%s/v1/invoice/%s", strings.TrimRight(a.cfg.PublicURL, "/"), doc.ID),
		PDFURL:     fmt.Sprintf("%s/documents", strings.TrimRight(a.cfg.PublicURL, "/")),
		IssuedAt:   doc.UpdatedAt,
		Calculation: doc.Calculation,
	}, nil
}

func (a *app) render(w http.ResponseWriter, r *http.Request, name string, data viewData) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := a.templates.render(w, name, data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func reverseAudit(in []AuditEntry) []AuditEntry {
	out := make([]AuditEntry, len(in))
	copy(out, in)
	for i, j := 0, len(out)-1; i < j; i, j = i+1, j-1 {
		out[i], out[j] = out[j], out[i]
	}
	return out
}

func samplePayload(companies []Company, settings FiscalSettings) string {
	company := Company{
		ID:               "matriz-rj",
		Name:             "EntregaMais Fiscal Ltda",
		CNPJ:             "12345678000199",
		State:            "RJ",
		MunicipalityCode: "3304557",
		Regime:           settings.DefaultRegime,
		Entity:           "1",
		DefaultCFOP:      "5102",
		Enabled:          true,
	}
	if len(companies) > 0 {
		company = companies[0]
	}

	payload := TaxCalculationRequest{
		Company: CompanyInput{
			ID:               company.ID,
			Name:             company.Name,
			CNPJ:             company.CNPJ,
			Regime:           company.Regime,
			State:            company.State,
			MunicipalityCode: company.MunicipalityCode,
		},
		Customer: CustomerInput{
			Document:         "11122233344",
			Type:             "PF",
			State:            "RJ",
			MunicipalityCode: "3304557",
			TaxpayerICMS:     false,
		},
		Document: DocumentInput{
			Type:            "sale",
			Purpose:         "normal",
			IssueDate:       time.Now().Format("2006-01-02"),
			OperationNature: firstNonEmpty(settings.DefaultOperationNature, "Venda de mercadoria"),
		},
		Items: []ItemInput{
			{
				LineID:      "1",
				SKU:         "ABC123",
				Description: "Produto teste",
				NCM:         "61091000",
				CFOP:        firstNonEmpty(company.DefaultCFOP, "5102"),
				Quantity:    2,
				UnitPrice:   100,
				Discount:    10,
				Origin:      0,
			},
		},
		Freight: 20,
	}
	buf, _ := json.MarshalIndent(payload, "", "  ")
	return string(buf)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func decodeJSON(w http.ResponseWriter, r *http.Request, dst any) bool {
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid body"})
		return false
	}
	if err := json.Unmarshal(body, dst); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid json"})
		return false
	}
	return true
}

func actorFromAPI(r *http.Request) string {
	if user, ok := userFromBearer(r); ok {
		return user.Email
	}
	return "api-token"
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = strings.NewReplacer(" ", "-", "/", "-", "_", "-", ".", "-", "@", "-").Replace(value)
	for strings.Contains(value, "--") {
		value = strings.ReplaceAll(value, "--", "-")
	}
	value = strings.Trim(value, "-")
	if value == "" {
		return "empresa-" + strconv.FormatInt(time.Now().Unix(), 10)
	}
	return value
}

func (a *app) pingDolibarr(ctx context.Context, cfg DolibarrSettings) error {
	if strings.TrimSpace(cfg.BaseURL) == "" {
		return fmt.Errorf("dolibarr url is empty")
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, cfg.BaseURL, nil)
	if err != nil {
		return err
	}
	if cfg.APIKey != "" {
		req.Header.Set("DOLAPIKEY", cfg.APIKey)
		if cfg.Entity != "" {
			req.Header.Set("DOLAPIENTITY", cfg.Entity)
		}
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 500 {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		return fmt.Errorf("dolibarr returned %d: %s", resp.StatusCode, bytes.TrimSpace(body))
	}
	return nil
}
