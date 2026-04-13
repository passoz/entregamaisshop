package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type store struct {
	mu    sync.RWMutex
	path  string
	state appState
}

type appState struct {
	Settings  FiscalSettings   `json:"settings"`
	Companies []Company        `json:"companies"`
	Documents []StoredDocument `json:"documents"`
	Audit     []AuditEntry     `json:"audit"`
}

func newStore(path string) (*store, error) {
	s := &store{path: path}
	if err := s.load(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *store) load() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return err
	}

	content, err := os.ReadFile(s.path)
	if err != nil {
		if os.IsNotExist(err) {
			s.state = appState{
				Settings: defaultSettings(),
			}
			return s.persistLocked()
		}
		return err
	}
	if len(content) == 0 {
		s.state = appState{Settings: defaultSettings()}
		return s.persistLocked()
	}
	if err := json.Unmarshal(content, &s.state); err != nil {
		return err
	}
	if s.state.Settings.ServiceName == "" {
		s.state.Settings = defaultSettings()
	}
	return nil
}

func (s *store) snapshot() appState {
	s.mu.RLock()
	defer s.mu.RUnlock()
	data, _ := json.Marshal(s.state)
	var out appState
	_ = json.Unmarshal(data, &out)
	return out
}

func (s *store) updateSettings(settings FiscalSettings, actor string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.state.Settings = settings
	s.appendAuditLocked("settings.updated", actor, "Fiscal settings saved")
	return s.persistLocked()
}

func (s *store) upsertCompany(company Company, actor string) error {
	if company.Name == "" || company.CNPJ == "" || company.Regime == "" {
		return fmt.Errorf("preencha nome, CNPJ e regime tributario")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	found := false
	for i := range s.state.Companies {
		if s.state.Companies[i].ID == company.ID {
			company.CreatedAt = s.state.Companies[i].CreatedAt
			s.state.Companies[i] = company
			found = true
			break
		}
	}
	if !found {
		company.CreatedAt = time.Now().UTC()
		s.state.Companies = append(s.state.Companies, company)
	}
	s.appendAuditLocked("company.upsert", actor, company.Name)
	return s.persistLocked()
}

func (s *store) deleteCompany(id, actor string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	filtered := s.state.Companies[:0]
	for _, company := range s.state.Companies {
		if company.ID != id {
			filtered = append(filtered, company)
		}
	}
	s.state.Companies = filtered
	s.appendAuditLocked("company.delete", actor, id)
	return s.persistLocked()
}

func (s *store) saveCalculated(req TaxCalculationRequest, calc TaxCalculationResponse, actor string) (StoredDocument, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	doc := StoredDocument{
		ID:          newDocumentID(),
		ExternalRef: req.Document.ExternalRef,
		Status:      "calculated",
		Source:      firstNonEmpty(req.Document.Source, "manual"),
		Request:     req,
		Calculation: calc,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
	s.state.Documents = append(s.state.Documents, doc)
	s.appendAuditLocked("document.calculated", actor, doc.ID)
	return doc, s.persistLocked()
}

func (s *store) issue(req TaxCalculationRequest, calc TaxCalculationResponse, actor string) (StoredDocument, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	doc := StoredDocument{
		ID:          newDocumentID(),
		ExternalRef: req.Document.ExternalRef,
		Status:      "issued",
		Source:      firstNonEmpty(req.Document.Source, "manual"),
		Request:     req,
		Calculation: calc,
		AccessKey:   generateAccessKey(),
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
	s.state.Documents = append(s.state.Documents, doc)
	s.appendAuditLocked("document.issued", actor, doc.ID)
	return doc, s.persistLocked()
}

func (s *store) cancelDocument(id, actor string) (StoredDocument, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.state.Documents {
		if s.state.Documents[i].ID == id {
			s.state.Documents[i].Status = "cancelled"
			s.state.Documents[i].UpdatedAt = time.Now().UTC()
			s.appendAuditLocked("document.cancelled", actor, id)
			return s.state.Documents[i], s.persistLocked()
		}
	}
	return StoredDocument{}, fmt.Errorf("document not found")
}

func (s *store) document(id string) (StoredDocument, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, doc := range s.state.Documents {
		if doc.ID == id {
			return doc, true
		}
	}
	return StoredDocument{}, false
}

func (s *store) appendAuditLocked(action, actor, detail string) {
	s.state.Audit = append(s.state.Audit, AuditEntry{
		At:     time.Now().UTC(),
		Action: action,
		Actor:  actor,
		Detail: detail,
	})
	if len(s.state.Audit) > 200 {
		s.state.Audit = s.state.Audit[len(s.state.Audit)-200:]
	}
}

func (s *store) persistLocked() error {
	payload, err := json.MarshalIndent(s.state, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.path, payload, 0o644)
}
