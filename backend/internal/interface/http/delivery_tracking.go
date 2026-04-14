package http

import (
	"context"
	"encoding/json"
	"math"
	"time"

	"github.com/entregamais/platform/backend/ent"
	"github.com/entregamais/platform/backend/ent/entregador"
	"github.com/entregamais/platform/backend/ent/order"
)

const defaultNearbyDriverRadiusKm = 10.0

type geoPoint struct {
	Lat       float64    `json:"lat"`
	Lng       float64    `json:"lng"`
	Label     string     `json:"label,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

var sellerLocationPresets = map[string]geoPoint{
	"1": {Lat: -22.8851, Lng: -42.0202, Label: "Deposito Cabo Frio"},
	"2": {Lat: -22.9696, Lng: -42.0284, Label: "Deposito Arraial do Cabo"},
	"3": {Lat: -22.9135, Lng: -43.2003, Label: "Deposito Rio de Janeiro"},
	"4": {Lat: -22.8425, Lng: -42.1026, Label: "Deposito Sao Pedro da Aldeia"},
}

func roundDistance(value float64) float64 {
	return math.Round(value*10) / 10
}

func calculateDistanceKm(startLat, startLng, endLat, endLng float64) float64 {
	const earthRadiusKm = 6371.0
	dLat := degreesToRadians(endLat - startLat)
	dLng := degreesToRadians(endLng - startLng)
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(degreesToRadians(startLat))*math.Cos(degreesToRadians(endLat))*
			math.Sin(dLng/2)*math.Sin(dLng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return earthRadiusKm * c
}

func degreesToRadians(value float64) float64 {
	return value * math.Pi / 180
}

func structToMap(value any) map[string]any {
	raw, err := json.Marshal(value)
	if err != nil {
		return map[string]any{}
	}

	payload := map[string]any{}
	if err := json.Unmarshal(raw, &payload); err != nil {
		return map[string]any{}
	}

	return payload
}

func parseAddressLabel(addressJSON string) string {
	if addressJSON == "" {
		return ""
	}

	var payload map[string]any
	if err := json.Unmarshal([]byte(addressJSON), &payload); err != nil {
		return ""
	}

	if raw, ok := payload["raw"].(string); ok {
		return raw
	}
	if label, ok := payload["label"].(string); ok {
		return label
	}
	return ""
}

func sellerLocationForOrder(ord *ent.Order) *geoPoint {
	sellerID := ""
	if ord.Edges.Seller != nil && ord.Edges.Seller.ID != "" {
		sellerID = ord.Edges.Seller.ID
	}

	point, ok := sellerLocationPresets[sellerID]
	if !ok {
		return nil
	}

	if ord.Edges.Seller != nil && ord.Edges.Seller.Name != "" {
		point.Label = ord.Edges.Seller.Name
	}

	return &point
}

func driverLocationForOrder(ord *ent.Order) *geoPoint {
	if ord.Edges.Driver == nil || ord.Edges.Driver.CurrentLatitude == nil || ord.Edges.Driver.CurrentLongitude == nil {
		return nil
	}

	return &geoPoint{
		Lat:       *ord.Edges.Driver.CurrentLatitude,
		Lng:       *ord.Edges.Driver.CurrentLongitude,
		Label:     "Entregador em rota",
		UpdatedAt: ord.Edges.Driver.LastLocationAt,
	}
}

func deliveryLocationForOrder(ord *ent.Order) *geoPoint {
	if ord.DeliveryLatitude == nil || ord.DeliveryLongitude == nil {
		return nil
	}

	return &geoPoint{
		Lat:   *ord.DeliveryLatitude,
		Lng:   *ord.DeliveryLongitude,
		Label: parseAddressLabel(ord.DeliveryAddressJSON),
	}
}

func trackingStageForStatus(status string) string {
	switch status {
	case "accepted":
		return "to_pickup"
	case "dispatched", "picked_up":
		return "to_delivery"
	case "delivered":
		return "delivered"
	default:
		return "awaiting_dispatch"
	}
}

func routeTargetForOrder(ord *ent.Order) *geoPoint {
	switch trackingStageForStatus(ord.Status) {
	case "to_pickup":
		return sellerLocationForOrder(ord)
	case "to_delivery", "delivered":
		return deliveryLocationForOrder(ord)
	default:
		return nil
	}
}

func buildTrackingPayload(ord *ent.Order, nearbyDriverCount int) map[string]any {
	driverPoint := driverLocationForOrder(ord)
	pickupPoint := sellerLocationForOrder(ord)
	deliveryPoint := deliveryLocationForOrder(ord)
	targetPoint := routeTargetForOrder(ord)

	payload := map[string]any{
		"stage":               trackingStageForStatus(ord.Status),
		"pickup_location":     pickupPoint,
		"delivery_location":   deliveryPoint,
		"driver_location":     driverPoint,
		"nearby_driver_count": nearbyDriverCount,
	}

	if driverPoint != nil && targetPoint != nil {
		payload["route"] = [][]float64{
			{driverPoint.Lat, driverPoint.Lng},
			{targetPoint.Lat, targetPoint.Lng},
		}
		payload["distance_km"] = roundDistance(calculateDistanceKm(driverPoint.Lat, driverPoint.Lng, targetPoint.Lat, targetPoint.Lng))
	}

	return payload
}

func buildOrderResponse(ord *ent.Order, nearbyDriverCount int, nearbyDistanceKm *float64) map[string]any {
	payload := structToMap(ord)
	payload["tracking"] = buildTrackingPayload(ord, nearbyDriverCount)

	if nearbyDistanceKm != nil {
		payload["distance_km"] = roundDistance(*nearbyDistanceKm)
	}

	if ord.Edges.Driver != nil {
		payload["driver_id"] = ord.Edges.Driver.ID
	}

	return payload
}

func (h *Handlers) listNearbyDrivers(ctx context.Context, sellerID string) ([]*ent.Entregador, error) {
	origin, ok := sellerLocationPresets[sellerID]
	if !ok {
		return nil, nil
	}

	drivers, err := h.DB.Entregador.Query().
		Where(
			entregador.AvailableEQ(true),
			entregador.StatusEQ("active"),
			entregador.CurrentLatitudeNotNil(),
			entregador.CurrentLongitudeNotNil(),
		).
		WithUser().
		All(ctx)
	if err != nil {
		return nil, err
	}

	nearby := make([]*ent.Entregador, 0, len(drivers))
	for _, driver := range drivers {
		if driver.CurrentLatitude == nil || driver.CurrentLongitude == nil {
			continue
		}

		distanceKm := calculateDistanceKm(origin.Lat, origin.Lng, *driver.CurrentLatitude, *driver.CurrentLongitude)
		if distanceKm <= defaultNearbyDriverRadiusKm {
			nearby = append(nearby, driver)
		}
	}

	return nearby, nil
}

func (h *Handlers) publishDeliveryOffer(ctx context.Context, ord *ent.Order) {
	if h.Publisher == nil {
		return
	}

	sellerID := ""
	if ord.Edges.Seller != nil {
		sellerID = ord.Edges.Seller.ID
	}
	nearbyDrivers, err := h.listNearbyDrivers(ctx, sellerID)
	if err != nil {
		if h.Logger != nil {
			h.Logger.Error("delivery_offer_nearby_driver_lookup_failed", err, map[string]any{"order_id": ord.ID})
		}
		return
	}

	driverIDs := make([]string, 0, len(nearbyDrivers))
	for _, driver := range nearbyDrivers {
		driverIDs = append(driverIDs, driver.ID)
	}

	payload := map[string]any{
		"event":               "delivery.offer.created",
		"order_id":            ord.ID,
		"seller_id":           sellerID,
		"status":              ord.Status,
		"pickup_location":     sellerLocationForOrder(ord),
		"delivery_location":   deliveryLocationForOrder(ord),
		"nearby_driver_ids":   driverIDs,
		"nearby_driver_count": len(driverIDs),
		"occurred_at":         time.Now().UTC(),
	}

	if err := h.Publisher.Publish(ctx, "delivery.offer.created", payload); err != nil && h.Logger != nil {
		h.Logger.Error("delivery_offer_publish_failed", err, map[string]any{"order_id": ord.ID})
	}
}

func (h *Handlers) publishTrackingUpdate(ctx context.Context, eventType string, ord *ent.Order) {
	if h.Publisher == nil {
		return
	}

	payload := map[string]any{
		"event":       eventType,
		"order_id":    ord.ID,
		"status":      ord.Status,
		"tracking":    buildTrackingPayload(ord, 0),
		"occurred_at": time.Now().UTC(),
	}

	if err := h.Publisher.Publish(ctx, eventType, payload); err != nil && h.Logger != nil {
		h.Logger.Error("tracking_event_publish_failed", err, map[string]any{"order_id": ord.ID, "event_type": eventType})
	}
}

func (h *Handlers) queryOrderWithTracking(ctx context.Context, id string) (*ent.Order, error) {
	return h.DB.Order.Query().
		Where(order.IDEQ(id)).
		WithSeller().
		WithCustomer().
		WithDriver().
		WithItems(func(q *ent.OrderItemQuery) {
			q.WithProduct()
		}).
		Only(ctx)
}

func sellerIDFromOrder(ord *ent.Order) string {
	if ord.Edges.Seller != nil {
		return ord.Edges.Seller.ID
	}
	return ""
}

func sellerDistanceToDriver(ord *ent.Order, driver *ent.Entregador) *float64 {
	sellerPoint := sellerLocationForOrder(ord)
	if sellerPoint == nil || driver.CurrentLatitude == nil || driver.CurrentLongitude == nil {
		return nil
	}

	distance := calculateDistanceKm(*driver.CurrentLatitude, *driver.CurrentLongitude, sellerPoint.Lat, sellerPoint.Lng)
	return &distance
}

func sellerLocationForSellerID(sellerID string) *geoPoint {
	point, ok := sellerLocationPresets[sellerID]
	if !ok {
		return nil
	}
	return &point
}

func sellerSummaryPoint(item *ent.Seller) *geoPoint {
	if item == nil {
		return nil
	}

	point := sellerLocationForSellerID(item.ID)
	if point == nil {
		return nil
	}
	point.Label = item.Name
	return point
}

func nearbySellerDistance(item *ent.Seller, driver *ent.Entregador) *float64 {
	point := sellerSummaryPoint(item)
	if point == nil || driver.CurrentLatitude == nil || driver.CurrentLongitude == nil {
		return nil
	}

	distance := calculateDistanceKm(*driver.CurrentLatitude, *driver.CurrentLongitude, point.Lat, point.Lng)
	return &distance
}

func cloneSellerWithMapData(item *ent.Seller) map[string]any {
	payload := structToMap(item)
	if point := sellerSummaryPoint(item); point != nil {
		payload["location"] = point
	}
	return payload
}
