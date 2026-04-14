"use client";

import { useEffect, useRef, useState } from "react";

import type { MapPoint } from "@/lib/deliveryTracking";

declare global {
  interface Window {
    L?: any;
  }
}

let leafletAssetsPromise: Promise<any> | null = null;

function loadLeafletAssets() {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (leafletAssetsPromise) {
    return leafletAssetsPromise;
  }

  leafletAssetsPromise = new Promise((resolve, reject) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("leaflet-custom-overrides")) {
      const style = document.createElement("style");
      style.id = "leaflet-custom-overrides";
      style.textContent = `
        .leaflet-control-attribution,
        .leaflet-bottom.leaflet-right {
          display: none !important;
        }
        .leaflet-container {
          font-family: "DM Sans", sans-serif;
        }
      `;
      document.head.appendChild(style);
    }

    const existingScript = document.getElementById("leaflet-js") as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return leafletAssetsPromise;
}

interface LeafletMapProps {
  className?: string;
  center?: { lat: number; lng: number };
  driver?: MapPoint | null;
  pickup?: MapPoint | null;
  delivery?: MapPoint | null;
  route?: [number, number][];
  stage?: string;
}

function pointColor(kind: "driver" | "pickup" | "delivery") {
  if (kind === "pickup") return "#F7E01B";
  if (kind === "delivery") return "#E31B23";
  return "#222222";
}

export function LeafletMap({
  className = "",
  center,
  driver,
  pickup,
  delivery,
  route = [],
  stage,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadLeafletAssets()
      .then((L) => {
        if (cancelled || !mapRef.current || !L) {
          return;
        }

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false,
          });

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "",
          }).addTo(mapInstanceRef.current);
        }

        setReady(true);
      })
      .catch((error) => {
        console.error("Falha ao carregar Leaflet", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !window.L || !mapInstanceRef.current) {
      return;
    }

    const L = window.L;
    const map = mapInstanceRef.current;

    layersRef.current.forEach((layer) => {
      map.removeLayer(layer);
    });
    layersRef.current = [];

    const points: Array<{ point: MapPoint; kind: "driver" | "pickup" | "delivery" }> = [];
    if (driver) points.push({ point: driver, kind: "driver" });
    if (pickup) points.push({ point: pickup, kind: "pickup" });
    if (delivery) points.push({ point: delivery, kind: "delivery" });

    points.forEach(({ point, kind }) => {
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: kind === "driver" ? 9 : 8,
        color: "#222222",
        weight: 2,
        fillColor: pointColor(kind),
        fillOpacity: 1,
      }).addTo(map);

      const label = point.label || (kind === "driver" ? "Entregador" : kind === "pickup" ? "Coleta" : "Entrega");
      marker.bindTooltip(label, { direction: "top", offset: [0, -8] });
      layersRef.current.push(marker);
    });

    if (route.length >= 2) {
      const polyline = L.polyline(route, {
        color: stage === "to_delivery" ? "#E31B23" : "#222222",
        weight: 5,
        opacity: 0.85,
        dashArray: stage === "to_pickup" ? "10 12" : undefined,
      }).addTo(map);
      layersRef.current.push(polyline);
    }

    const boundsPoints = [
      ...points.map(({ point }) => [point.lat, point.lng]),
      ...route,
    ].filter((value) => Array.isArray(value) && value.length === 2);

    if (boundsPoints.length > 1) {
      map.fitBounds(boundsPoints, { padding: [28, 28] });
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 14);
    } else if (center) {
      map.setView([center.lat, center.lng], 13);
    }
  }, [center, delivery, driver, pickup, ready, route, stage]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border-4 border-ze-black bg-ze-gray ${className}`}>
      <div ref={mapRef} className="h-full min-h-[240px] w-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-ze-gray/80 text-ze-black">
          <span className="text-xs font-black uppercase tracking-[0.25em]">Carregando mapa</span>
        </div>
      )}
    </div>
  );
}
