"use client";

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
  updated_at?: string;
}

export interface OrderTracking {
  stage?: "awaiting_dispatch" | "to_pickup" | "to_delivery" | "delivered";
  pickup_location?: MapPoint | null;
  delivery_location?: MapPoint | null;
  driver_location?: MapPoint | null;
  route?: [number, number][];
  distance_km?: number;
  nearby_driver_count?: number;
}

const LOCATION_LABEL_KEY = "last_selected_location";
const LOCATION_COORDS_KEY = "last_selected_location_coords";

export function parseAddressLabel(addressJSON?: string) {
  if (!addressJSON) {
    return "Endereço não disponível";
  }

  try {
    const parsed = JSON.parse(addressJSON);
    return parsed.raw || parsed.label || "Endereço não disponível";
  } catch {
    return "Endereço não disponível";
  }
}

export function saveSelectedLocation(label: string, coords?: { lat: number; lng: number }) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(LOCATION_LABEL_KEY, label);

  if (coords) {
    localStorage.setItem(LOCATION_COORDS_KEY, JSON.stringify(coords));
  }
}

export function readSelectedLocation() {
  if (typeof window === "undefined") {
    return { label: "", coords: undefined as { lat: number; lng: number } | undefined };
  }

  const label = localStorage.getItem(LOCATION_LABEL_KEY) || "";
  const rawCoords = localStorage.getItem(LOCATION_COORDS_KEY);

  if (!rawCoords) {
    return { label, coords: undefined };
  }

  try {
    const parsed = JSON.parse(rawCoords);
    if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
      return { label, coords: { lat: parsed.lat, lng: parsed.lng } };
    }
  } catch {
    return { label, coords: undefined };
  }

  return { label, coords: undefined };
}
