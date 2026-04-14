package main

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type sessionUser struct {
	Name        string    `json:"name"`
	Email       string    `json:"email"`
	Roles       []string  `json:"roles"`
	AccessToken string    `json:"access_token"`
	ExpiresAt   time.Time `json:"expires_at"`
}

type ctxKey string

const (
	sessionCookieName = "fiscal_session"
	authStateCookie   = "fiscal_auth_state"
	userContextKey    ctxKey = "session-user"
)

func (a *app) requireSession(next http.Handler) http.Handler {
	if !a.cfg.OIDCEnabled() {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), userContextKey, sessionUser{
				Name:  "Local Admin",
				Email: "local-admin@entregamais.local",
				Roles: []string{"admin"},
			})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, ok := a.readSession(r)
		if !ok || !userHasRole(user.Roles, a.cfg.RequiredRole) {
			http.Redirect(w, r, "/auth/login", http.StatusSeeOther)
			return
		}
		ctx := context.WithValue(r.Context(), userContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (a *app) apiAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if user, ok := userFromBearer(r); ok && userHasRole(user.Roles, a.cfg.RequiredRole) {
			ctx := context.WithValue(r.Context(), userContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}
		token := strings.TrimSpace(r.Header.Get("X-API-Token"))
		if token == "" {
			token = strings.TrimSpace(r.URL.Query().Get("api_token"))
		}
		if token != "" && token == a.cfg.APIToken {
			next.ServeHTTP(w, r)
			return
		}
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
	})
}

func (a *app) handleLogin(w http.ResponseWriter, r *http.Request) {
	if !a.cfg.OIDCEnabled() {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	if r.Method == http.MethodPost {
		email := r.FormValue("email")
		password := r.FormValue("password")

		tokenPayload := url.Values{
			"grant_type":    {"password"},
			"username":      {email},
			"password":      {password},
			"client_id":     {a.cfg.KeycloakClientID},
			"client_secret": {a.cfg.KeycloakClientSecret},
			"scope":         {"openid profile email"},
		}

		req, err := http.NewRequest(http.MethodPost, a.cfg.TokenURL(), strings.NewReader(tokenPayload.Encode()))
		if err != nil {
			a.render(w, r, "login", viewData{Title: "Login - Motor Fiscal", Error: "Erro interno no servidor"})
			return
		}
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			a.render(w, r, "login", viewData{Title: "Login - Motor Fiscal", Error: "Falha na comunicacao com Keycloak"})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			a.render(w, r, "login", viewData{Title: "Login - Motor Fiscal", Error: "Credenciais invalidas"})
			return
		}

		var tokenResp struct {
			AccessToken string `json:"access_token"`
			ExpiresIn   int    `json:"expires_in"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
			a.render(w, r, "login", viewData{Title: "Login - Motor Fiscal", Error: "Resposta de token invalida"})
			return
		}

		user, ok := parseBearerUser(tokenResp.AccessToken)
		if !ok || !userHasRole(user.Roles, a.cfg.RequiredRole) {
			a.render(w, r, "login", viewData{Title: "Login - Motor Fiscal", Error: "Acesso restrito a administradores"})
			return
		}
		user.AccessToken = tokenResp.AccessToken
		user.ExpiresAt = time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)

		a.writeSession(w, user)
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	a.render(w, r, "login", viewData{
		Title: "Login - Motor Fiscal",
	})
}

func (a *app) handleCallback(w http.ResponseWriter, r *http.Request) {
	if !a.cfg.OIDCEnabled() {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	stateCookie, err := r.Cookie(authStateCookie)
	if err != nil || stateCookie.Value == "" || stateCookie.Value != r.URL.Query().Get("state") {
		http.Error(w, "invalid auth state", http.StatusUnauthorized)
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "missing authorization code", http.StatusBadRequest)
		return
	}

	tokenPayload := url.Values{
		"grant_type":    {"authorization_code"},
		"code":          {code},
		"redirect_uri":  {a.cfg.RedirectURL()},
		"client_id":     {a.cfg.KeycloakClientID},
		"client_secret": {a.cfg.KeycloakClientSecret},
	}

	req, err := http.NewRequest(http.MethodPost, a.cfg.TokenURL(), strings.NewReader(tokenPayload.Encode()))
	if err != nil {
		http.Error(w, "token exchange failed", http.StatusBadGateway)
		return
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		http.Error(w, "token exchange failed", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		http.Error(w, "token exchange rejected", http.StatusUnauthorized)
		return
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int    `json:"expires_in"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		http.Error(w, "invalid token response", http.StatusBadGateway)
		return
	}

	user, ok := parseBearerUser(tokenResp.AccessToken)
	if !ok || !userHasRole(user.Roles, a.cfg.RequiredRole) {
		http.Error(w, "missing required admin role", http.StatusForbidden)
		return
	}
	user.AccessToken = tokenResp.AccessToken
	user.ExpiresAt = time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)

	a.writeSession(w, user)
	http.SetCookie(w, &http.Cookie{Name: authStateCookie, Value: "", Path: "/", MaxAge: -1})
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func (a *app) handleLogout(w http.ResponseWriter, r *http.Request) {
	user, _ := a.readSession(r)
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
		SameSite: http.SameSiteLaxMode,
	})

	if a.cfg.OIDCEnabled() && user.AccessToken != "" {
		logoutURL := a.cfg.LogoutURL(user.AccessToken)
		http.Redirect(w, r, logoutURL, http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func currentUser(ctx context.Context) sessionUser {
	user, _ := ctx.Value(userContextKey).(sessionUser)
	return user
}

func (a *app) writeSession(w http.ResponseWriter, user sessionUser) {
	payload, _ := json.Marshal(user)
	value := base64.RawURLEncoding.EncodeToString(payload)
	signature := signCookie(value, a.cfg.SessionSecret)
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    value + "." + signature,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   60 * 60 * 8,
		SameSite: http.SameSiteLaxMode,
	})
}

func (a *app) readSession(r *http.Request) (sessionUser, bool) {
	cookie, err := r.Cookie(sessionCookieName)
	if err != nil || cookie.Value == "" {
		return sessionUser{}, false
	}
	parts := strings.Split(cookie.Value, ".")
	if len(parts) != 2 {
		return sessionUser{}, false
	}
	if !verifyCookie(parts[0], parts[1], a.cfg.SessionSecret) {
		return sessionUser{}, false
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return sessionUser{}, false
	}
	var user sessionUser
	if err := json.Unmarshal(payload, &user); err != nil {
		return sessionUser{}, false
	}
	if !user.ExpiresAt.IsZero() && time.Now().After(user.ExpiresAt) {
		return sessionUser{}, false
	}
	return user, true
}

func userFromBearer(r *http.Request) (sessionUser, bool) {
	value := strings.TrimSpace(strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer "))
	if value == "" || strings.Contains(value, " ") {
		return sessionUser{}, false
	}
	return parseBearerUser(value)
}

func parseBearerUser(token string) (sessionUser, bool) {
	parts := strings.Split(token, ".")
	if len(parts) < 2 {
		return sessionUser{}, false
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return sessionUser{}, false
	}
	var claims struct {
		Email             string `json:"email"`
		Name              string `json:"name"`
		PreferredUsername string `json:"preferred_username"`
		RealmAccess       struct {
			Roles []string `json:"roles"`
		} `json:"realm_access"`
	}
	if err := json.Unmarshal(payload, &claims); err != nil {
		return sessionUser{}, false
	}
	email := firstNonEmpty(claims.Email, claims.PreferredUsername)
	name := firstNonEmpty(claims.Name, claims.PreferredUsername, claims.Email)
	if email == "" {
		return sessionUser{}, false
	}
	return sessionUser{
		Name:  name,
		Email: email,
		Roles: claims.RealmAccess.Roles,
	}, true
}

func signCookie(payload, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = io.WriteString(mac, payload)
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func verifyCookie(payload, signature, secret string) bool {
	expected := signCookie(payload, secret)
	return hmac.Equal([]byte(signature), []byte(expected))
}

func userHasRole(roles []string, role string) bool {
	for _, current := range roles {
		if strings.EqualFold(strings.TrimSpace(current), strings.TrimSpace(role)) {
			return true
		}
	}
	return false
}

func randomToken(size int) string {
	buf := make([]byte, size)
	if _, err := rand.Read(buf); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return base64.RawURLEncoding.EncodeToString(buf)
}
