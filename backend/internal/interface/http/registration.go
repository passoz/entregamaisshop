package http

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/entregamais/platform/backend/ent"
	"github.com/entregamais/platform/backend/ent/entregador"
	"github.com/entregamais/platform/backend/ent/seller"
	"github.com/entregamais/platform/backend/ent/selleruser"
	"github.com/entregamais/platform/backend/ent/user"
)

type publicRegisterPayload struct {
	UserID      string `json:"user_id"`
	Role        string `json:"role"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Phone       string `json:"phone"`
	CPF         string `json:"cpf"`
	CNPJ        string `json:"cnpj"`
	StoreName   string `json:"storeName"`
	VehicleType string `json:"vehicleType"`
}

func (h *Handlers) PublicRegister(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var payload publicRegisterPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "invalid payload"})
		return
	}

	payload.UserID = strings.TrimSpace(payload.UserID)
	payload.Role = strings.TrimSpace(strings.ToLower(payload.Role))
	payload.Name = strings.TrimSpace(payload.Name)
	payload.Email = strings.TrimSpace(strings.ToLower(payload.Email))
	payload.Phone = strings.TrimSpace(payload.Phone)
	payload.CNPJ = strings.TrimSpace(payload.CNPJ)
	payload.StoreName = strings.TrimSpace(payload.StoreName)
	payload.VehicleType = strings.TrimSpace(payload.VehicleType)

	if payload.UserID == "" || payload.Role == "" || payload.Email == "" {
		writeError(w, http.StatusBadRequest, APIError{Code: "bad_request", Message: "missing registration fields"})
		return
	}

	if err := h.WithTx(ctx, func(tx *ent.Tx) error {
		accountName := payload.Name
		if accountName == "" && payload.StoreName != "" {
			accountName = payload.StoreName
		}
		if accountName == "" {
			accountName = "Usuario"
		}

		existingUser, err := tx.User.Query().Where(user.IDEQ(payload.UserID)).Only(ctx)
		switch {
		case err == nil:
			update := tx.User.UpdateOne(existingUser).SetEmail(payload.Email).SetName(accountName)
			if payload.Phone != "" {
				update.SetPhone(payload.Phone)
			}
			if _, err = update.Save(ctx); err != nil {
				return err
			}
		case ent.IsNotFound(err):
			create := tx.User.Create().
				SetID(payload.UserID).
				SetEmail(payload.Email).
				SetName(accountName)
			if payload.Phone != "" {
				create.SetPhone(payload.Phone)
			}
			if _, err = create.Save(ctx); err != nil {
				return err
			}
		default:
			return err
		}

		switch payload.Role {
		case "customer":
			return nil
		case "seller":
			return h.ensureSellerRegistration(ctx, tx, payload)
		case "driver":
			return h.ensureDriverRegistration(ctx, tx, payload)
		default:
			return errors.New("unsupported role")
		}
	}); err != nil {
		writeError(w, http.StatusInternalServerError, APIError{Code: "internal_error", Message: "failed to provision local registration"})
		return
	}

	writeSuccess(w, http.StatusCreated, map[string]any{
		"user_id": payload.UserID,
		"role":    payload.Role,
		"status":  "provisioned",
	}, nil)
}

func (h *Handlers) ensureSellerRegistration(ctx context.Context, tx *ent.Tx, payload publicRegisterPayload) error {
	sellerName := payload.StoreName
	if sellerName == "" {
		sellerName = payload.Name
	}
	if sellerName == "" {
		sellerName = "Loja Parceira"
	}

	sellerID := payload.UserID
	existingSeller, err := tx.Seller.Query().Where(seller.IDEQ(sellerID)).Only(ctx)
	switch {
	case err == nil:
		update := tx.Seller.UpdateOne(existingSeller).SetName(sellerName).SetStatus("pending")
		if payload.CNPJ != "" {
			update.SetDocument(payload.CNPJ)
		}
		if _, err = update.Save(ctx); err != nil {
			return err
		}
	case ent.IsNotFound(err):
		document := payload.CNPJ
		if document == "" {
			document = "pending-" + payload.UserID
		}
		if _, err = tx.Seller.Create().
			SetID(sellerID).
			SetName(sellerName).
			SetDocument(document).
			SetStatus("pending").
			Save(ctx); err != nil {
			return err
		}
	default:
		return err
	}

	linkExists, err := tx.SellerUser.Query().
		Where(
			selleruser.HasSellerWith(seller.IDEQ(sellerID)),
			selleruser.HasUserWith(user.IDEQ(payload.UserID)),
		).
		Exist(ctx)
	if err != nil {
		return err
	}
	if linkExists {
		return nil
	}

	_, err = tx.SellerUser.Create().
		SetID("seller-user-" + payload.UserID).
		SetRole("owner").
		SetSellerID(sellerID).
		SetUserID(payload.UserID).
		Save(ctx)
	return err
}

func (h *Handlers) ensureDriverRegistration(ctx context.Context, tx *ent.Tx, payload publicRegisterPayload) error {
	driverID := payload.UserID
	existingDriver, err := tx.Entregador.Query().Where(entregador.IDEQ(driverID)).Only(ctx)
	switch {
	case err == nil:
		update := tx.Entregador.UpdateOne(existingDriver).SetStatus("pending")
		if payload.VehicleType != "" {
			update.SetVehicleType(payload.VehicleType)
		}
		if _, err = update.Save(ctx); err != nil {
			return err
		}
		return nil
	case ent.IsNotFound(err):
		create := tx.Entregador.Create().
			SetID(driverID).
			SetUserID(payload.UserID).
			SetStatus("pending")
		if payload.VehicleType != "" {
			create.SetVehicleType(payload.VehicleType)
		}
		_, err = create.Save(ctx)
		return err
	default:
		return err
	}
}
