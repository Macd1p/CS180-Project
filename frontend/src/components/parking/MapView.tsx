/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Parking } from "./_data";
import { distanceInMeters } from "./geo";

interface MapViewProps {
  spots: Parking[];
  onMarkerClick: (id: string) => void;
  onResetFilters?: () => void;
  showReset?: boolean;
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
  const [L, setL] = useState<any | null>(null);

  // Load Leaflet dynamically (client only)
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

  // Set up global click handler for popup buttons
  useEffect(() => {
    (window as any).__parkingPostClick = (id: string) => {
      console.log("Global handler called for post:", id);
      onMarkerClick(id);
    };

    return () => {
      delete (window as any).__parkingPostClick;
    };
  }, [onMarkerClick]);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) return;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [34.0522, -118.2437], // Default: Los Angeles
      zoom: 13,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      // Clean up all markers first
      markersRef.current.forEach((m) => {
        try {
          if (m && map.hasLayer(m)) {
            m.closePopup();
            m.unbindPopup();
            map.removeLayer(m);
          }
        } catch (e) {
          // Silently handle cleanup errors
        }
      });
      markersRef.current = [];
      
      // Then remove the map
      try {
        map.off();
        map.remove();
      } catch (e) {
        // Silently handle cleanup errors
      }
      mapInstance.current = null;
    };
  }, [L]); // Only depend on L, not spots

  // Update markers when spots change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !L) return;

    // Clear existing markers with proper cleanup
    markersRef.current.forEach((m) => {
      try {
        if (m && map.hasLayer(m)) {
          m.closePopup();
          map.removeLayer(m);
        }
      } catch (e) {
        // Silently handle cleanup errors
      }
    });
    markersRef.current = [];

    if (!spots.length) return;

    const bounds = L.latLngBounds([]);
    const adjustedPositions: { lat: number; lng: number }[] = [];

    spots.forEach((p) => {
      // Skip posts without coordinates
      if (p.lat == null || p.lng == null) return;

      // Base positions
      let displayLat: number = p.lat;
      let displayLng: number = p.lng;

      // Handle overlapping markers
      const thresholdMeters = 80;
      let overlapsSoFar = 0;

      adjustedPositions.forEach((pos) => {
        const d = distanceInMeters(displayLat, displayLng, pos.lat, pos.lng);
        if (d < thresholdMeters) overlapsSoFar += 1;
      });

      if (overlapsSoFar > 0) {
        const angle = (overlapsSoFar * 45 * Math.PI) / 180;
        const radiusMeters = 25;

        const latRad = (displayLat * Math.PI) / 180;
        const dLat = (radiusMeters / 111_320) * Math.cos(angle);
        const dLng =
          (radiusMeters / (111_320 * Math.cos(latRad))) * Math.sin(angle);

        displayLat += dLat;
        displayLng += dLng;
      }

      adjustedPositions.push({ lat: displayLat, lng: displayLng });

      // Fallbacks for missing backend fields
      const avatarSrc = (p as any).url_for_images ?? "/images/default-avatar.svg";
      const userName = (p as any).owner ?? "Unknown User";
      const address = p.address ?? "No address available";
      const title = p.title ?? "Untitled Post";

      // Marker bubble design
      const icon = L.divIcon({
        className: "",
        html: `
          <div class="parking-marker-bubble">
            <div class="parking-marker-avatar">
              <img src="${avatarSrc}" alt="${userName}" />
            </div>
            <div class="parking-marker-label">
              ${address}
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

      // Popup content - use inline onclick for more reliable handling
      const popupHtml = `
        <div class="parking-popup">
          <div class="parking-popup-header">
            <div class="parking-popup-avatar">
              ${userName.charAt(0).toUpperCase()}
            </div>
            <div class="parking-popup-username">${userName}</div>
          </div>

          <img
            src="${avatarSrc}"
            alt="${title}"
            class="parking-popup-image"
          />

          <div class="parking-popup-address">
            ${address}<br />
          </div>

          <button 
            class="parking-popup-button" 
            data-view-post="${p.id}"
            onclick="window.__parkingPostClick && window.__parkingPostClick('${p.id}')"
          >
            View post
          </button>
        </div>
      `;

      const popup = L.popup({ closeButton: false }).setContent(popupHtml);
      marker.bindPopup(popup);

      marker.on("click", () => {
        if (marker && map.hasLayer(marker)) {
          marker.openPopup();
        }
      });

      markersRef.current.push(marker);
      bounds.extend([displayLat, displayLng]);
    });

    if (adjustedPositions.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    // Cleanup function
    return () => {
      markersRef.current.forEach((m) => {
        try {
          if (m && map.hasLayer(m)) {
            m.closePopup();
            map.removeLayer(m);
          }
        } catch (e) {
          // Silently handle cleanup errors
        }
      });
    };
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








