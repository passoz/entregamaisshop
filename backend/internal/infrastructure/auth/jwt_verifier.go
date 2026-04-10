package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/lestrrat-go/jwx/v2/jwk"
)

type JWTVerifier struct {
	issuerURL string
	jwksURL   string
	jwksCache jwk.Cache
	ar        *jwk.Cache
}

type Claims struct {
	jwt.RegisteredClaims
	RealmAccess struct {
		Roles []string `json:"roles"`
	} `json:"realm_access"`
	PreferredUsername string `json:"preferred_username"`
}

func NewJWTVerifier(issuerURL string) (*JWTVerifier, error) {
	jwksURL := fmt.Sprintf("%s/protocol/openid-connect/certs", issuerURL)
	
	ctx := context.Background()
	ar := jwk.NewCache(ctx)
	
	// Register the JWKS URL
	err := ar.Register(jwksURL, jwk.WithMinRefreshInterval(15*time.Minute))
	if err != nil {
		return nil, fmt.Errorf("failed to register JWKS URL: %w", err)
	}

	return &JWTVerifier{
		issuerURL: issuerURL,
		jwksURL:   jwksURL,
		ar:        ar,
	}, nil
}

func (v *JWTVerifier) Verify(ctx context.Context, tokenString string) (*Claims, error) {
	// Get key set from cache
	keySet, err := v.ar.Get(ctx, v.jwksURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS: %w", err)
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, fmt.Errorf("kid header not found")
		}

		key, ok := keySet.LookupKeyID(kid)
		if !ok {
			return nil, fmt.Errorf("key %s not found in JWKS", kid)
		}

		var rawKey interface{}
		if err := key.Raw(&rawKey); err != nil {
			return nil, fmt.Errorf("failed to get raw key: %w", err)
		}

		return rawKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	if claims.Issuer != v.issuerURL {
		return nil, fmt.Errorf("invalid issuer: %s", claims.Issuer)
	}

	return claims, nil
}
