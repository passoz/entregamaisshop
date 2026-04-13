package main

import (
	"embed"
	"fmt"
	"html/template"
	"io"
	"strings"
	"time"
)

//go:embed templates/*.html
var templatesFS embed.FS

//go:embed static/app.css
var appCSS string

type templateSet struct {
	pages map[string]*template.Template
}

func mustLoadTemplates() *templateSet {
	funcs := template.FuncMap{
		"money": func(v float64) string {
			return fmt.Sprintf("R$ %.2f", v)
		},
		"ts": func(t time.Time) string {
			if t.IsZero() {
				return "-"
			}
			return t.Local().Format("02/01/2006 15:04")
		},
		"join": strings.Join,
		"maskSecret": func(value string) string {
			if len(value) <= 4 {
				return value
			}
			return value[:2] + strings.Repeat("*", len(value)-4) + value[len(value)-2:]
		},
	}
	pages := map[string]*template.Template{}
	for _, name := range []string{"dashboard", "settings", "companies", "documents", "document_form"} {
		t := template.Must(template.New("base").Funcs(funcs).ParseFS(templatesFS, "templates/base.html", "templates/"+name+".html"))
		pages[name] = t
	}
	return &templateSet{pages: pages}
}

func (t *templateSet) render(w io.Writer, name string, data viewData) error {
	page, ok := t.pages[name]
	if !ok {
		return fmt.Errorf("unknown template %q", name)
	}
	return page.ExecuteTemplate(w, name, data)
}
