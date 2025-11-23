"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Parking } from "./_data";
import { distanceInMeters } from "./geo";

interface MapViewProps {
  spots: Parking[];
  onMarkerClick: (id: string) => void; // navigate to post page
  onResetFilters?: () => void;         // <- reset handler from parent
  showReset?: boolean;                 // <- should we show the button?
}

export default function MapView({
  spots,
  onMarkerClick,
  onResetFilters,
  showReset = false,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const [L, setL] = useState<any | null>(null); // Leaflet module

  // Load Leaflet on the client only
  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import("leaflet");
      if (!mounted) return;
      setL((mod as any).default ?? mod);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Create the map once (after Leaflet has loaded)
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) return;
    if (!L) return;

    const initialCenter: [number, number] =
      spots.length > 0 ? [spots[0].lat, spots[0].lng] : [34.0522, -118.2437]; // fallback: LA

    const map = L.map(mapRef.current, {
      center: initialCenter,
      zoom: 13,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [L, spots]);

  // Update markers / popup behavior when spots change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !L) return;

    // Remove previous markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (!spots.length) return;

    const bounds = L.latLngBounds([]);

    // Store displayed marker positions to avoid overlap
    const adjustedPositions: { lat: number; lng: number }[] = [];

    spots.forEach((p) => {
      let displayLat = p.lat;
      let displayLng = p.lng;

      // ---- simple overlap handling ----
      const thresholdMeters = 80; // "too close" threshold
      let overlapsSoFar = 0;

      adjustedPositions.forEach((pos) => {
        const d = distanceInMeters(displayLat, displayLng, pos.lat, pos.lng);
        if (d < thresholdMeters) overlapsSoFar += 1;
      });

      if (overlapsSoFar > 0) {
        const angle = (overlapsSoFar * 45 * Math.PI) / 180; // 45° steps
        const radiusMeters = 25;

        const latRad = (displayLat * Math.PI) / 180;
        const dLat = (radiusMeters / 111_320) * Math.cos(angle);
        const dLng =
          (radiusMeters / (111_320 * Math.cos(latRad))) * Math.sin(angle);

        displayLat += dLat;
        displayLng += dLng;
      }

      adjustedPositions.push({ lat: displayLat, lng: displayLng });
      // ---------------------------------

      const avatarSrc = (p as any).userAvatarUrl ?? p.imageUrl;

      const icon = L.divIcon({
        className: "",
        html: `
          <div class="parking-marker-bubble">
            <div class="parking-marker-avatar">
              <img src="${avatarSrc}" alt="${p.userName}" />
            </div>
            <div class="parking-marker-label">
              ${p.address}
            </div>
          </div>
        `,
        iconSize: [230, 70],
        iconAnchor: [115, 70],
      });

      const marker = L.marker([displayLat, displayLng], {
        icon,
        riseOnHover: true,
      }).addTo(map);

      const popupHtml = `
        <div class="parking-popup">
          <div class="parking-popup-header">
            <div class="parking-popup-avatar">
              ${p.userName.charAt(0).toUpperCase()}
            </div>
            <div class="parking-popup-username">${p.userName}</div>
          </div>

          <img
            src="${p.imageUrl}"
            alt="${p.name}"
            class="parking-popup-image"
          />

          <div class="parking-popup-address">
            ${p.address}<br />
            <span class="parking-popup-city">${p.city}</span>
          </div>

          <button class="parking-popup-button" data-view-post="${p.id}">
            View post
          </button>
        </div>
      `;

      const popup = L.popup({
        closeButton: false,
      }).setContent(popupHtml);

      marker.bindPopup(popup);

      popup.on("add", () => {
        const el = popup.getElement();
        if (!el) return;

        const btn = el.querySelector(
          `[data-view-post="${p.id}"]`
        ) as HTMLButtonElement | null;

        if (btn) {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            onMarkerClick(p.id);
          });
        }
      });

      // Click-only popup
      marker.on("click", () => {
        marker.openPopup();
      });

      markersRef.current.push(marker);
      bounds.extend([displayLat, displayLng]);
    });

    map.fitBounds(bounds, { padding: [40, 40] });
  }, [L, spots, onMarkerClick]);

  return (
    <div className="relative h-[70vh] w-full rounded-2xl border overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />

      {onResetFilters && showReset && (
        <button
          type="button"
          onClick={onResetFilters}
          className="absolute right-4 top-4 z-[1000] rounded-full border bg-white/90 px-3 py-1.5 text-xs font-medium shadow-md hover:bg-violet-50"
        >
          Reset view
        </button>
      )}
    </div>
  );
}







