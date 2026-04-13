package main

import (
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"
)

func calculateTaxes(req TaxCalculationRequest) (TaxCalculationResponse, error) {
	if len(req.Items) == 0 {
		return TaxCalculationResponse{}, fmt.Errorf("at least one item is required")
	}

	serviceOperation := req.isServiceOperation()
	rates := inferRates(req, serviceOperation)

	var (
		totalProducts float64
		totalDiscount float64
		totalTaxes    Taxes
		lines         []CalculatedItem
		messages      []string
	)

	for _, item := range req.Items {
		lineSubtotal := round2(item.Quantity * item.UnitPrice)
		lineDiscount := round2(item.Discount)
		lineBase := round2(lineSubtotal - lineDiscount)
		if lineBase < 0 {
			lineBase = 0
		}

		lineTaxes := Taxes{
			ICMS: round2(lineBase * rates.ICMS / 100),
			IPI:  round2(lineBase * rates.IPI / 100),
			PIS:  round2(lineBase * rates.PIS / 100),
			COFINS: round2(lineBase * rates.COFINS / 100),
			ISS:  round2(lineBase * rates.ISS / 100),
			IBS:  round2(lineBase * rates.IBS / 100),
			CBS:  round2(lineBase * rates.CBS / 100),
		}
		lines = append(lines, CalculatedItem{
			LineID:      item.LineID,
			Description: item.Description,
			BaseICMS:    lineBase,
			RateICMS:    rates.ICMS,
			ValueICMS:   lineTaxes.ICMS,
			BasePIS:     lineBase,
			ValuePIS:    lineTaxes.PIS,
			BaseCOFINS:  lineBase,
			ValueCOFINS: lineTaxes.COFINS,
			ValueISS:    lineTaxes.ISS,
			ValueIPI:    lineTaxes.IPI,
			ValueIBS:    lineTaxes.IBS,
			ValueCBS:    lineTaxes.CBS,
		})
		totalProducts += lineSubtotal
		totalDiscount += lineDiscount
		totalTaxes = addTaxes(totalTaxes, lineTaxes)
	}

	documentTotal := round2(totalProducts - totalDiscount + req.Freight + req.Insurance + req.OtherCosts)
	if serviceOperation {
		messages = append(messages, "Operacao tratada como servico com foco em ISS.")
	} else {
		messages = append(messages, fmt.Sprintf("CFOP final sugerido: %s", req.effectiveCFOP()))
	}
	if strings.EqualFold(req.Company.Regime, "SIMPLES") {
		messages = append(messages, "Regime SIMPLES: aliquotas aplicadas em modo referencial para pre-analise.")
	}
	messages = append(messages, "Calculo referencia. Substitua por tabelas fiscais oficiais antes de emissao em producao.")

	return TaxCalculationResponse{
		Status: "ok",
		Totals: Totals{
			Products:      round2(totalProducts),
			Discount:      round2(totalDiscount),
			Freight:       round2(req.Freight),
			DocumentTotal: documentTotal,
		},
		Taxes: totalTaxes,
		Items: lines,
		FiscalMetadata: FiscalMetadata{
			CFOPEffective:   req.effectiveCFOP(),
			RequiresInvoice: true,
			Messages:        messages,
			SnapshotHash:    snapshotHash(req),
		},
		CalculatedAt: time.Now().UTC(),
	}, nil
}

type rateSet struct {
	ICMS   float64
	IPI    float64
	PIS    float64
	COFINS float64
	ISS    float64
	IBS    float64
	CBS    float64
}

func inferRates(req TaxCalculationRequest, serviceOperation bool) rateSet {
	stateRate := 18.0
	if req.Company.State != "" && req.Customer.State != "" && !strings.EqualFold(req.Company.State, req.Customer.State) {
		stateRate = 12.0
	}

	switch strings.ToUpper(strings.TrimSpace(req.Company.Regime)) {
	case "LUCRO_REAL":
		if serviceOperation {
			return rateSet{PIS: 1.65, COFINS: 7.60, ISS: 5.00}
		}
		return rateSet{ICMS: stateRate, PIS: 1.65, COFINS: 7.60, IPI: 4.00}
	case "LUCRO_PRESUMIDO":
		if serviceOperation {
			return rateSet{PIS: 0.65, COFINS: 3.00, ISS: 5.00}
		}
		return rateSet{ICMS: stateRate, PIS: 0.65, COFINS: 3.00, IPI: 4.00}
	default:
		if serviceOperation {
			return rateSet{ISS: 5.00}
		}
		return rateSet{ICMS: stateRate, PIS: 0.40, COFINS: 1.80}
	}
}

func addTaxes(a, b Taxes) Taxes {
	return Taxes{
		ICMS:   round2(a.ICMS + b.ICMS),
		IPI:    round2(a.IPI + b.IPI),
		PIS:    round2(a.PIS + b.PIS),
		COFINS: round2(a.COFINS + b.COFINS),
		ISS:    round2(a.ISS + b.ISS),
		IBS:    round2(a.IBS + b.IBS),
		CBS:    round2(a.CBS + b.CBS),
	}
}

func round2(value float64) float64 {
	return math.Round(value*100) / 100
}

func newDocumentID() string {
	return "fdoc-" + strconv.FormatInt(time.Now().UnixNano(), 36)
}

func generateAccessKey() string {
	return strconv.FormatInt(time.Now().UnixNano(), 10)
}
