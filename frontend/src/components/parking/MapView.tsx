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
  maxDistanceMiles: number; // For controlling zoom level
  selectedSpotId?: string | null; // For zooming to selected search result
}

export default function MapView({
  spots,
  onMarkerClick,
  onResetFilters,
  showReset = false,
  maxDistanceMiles,
  selectedSpotId = null,
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
      center: [33.9730, -117.3325], // Default: UC Riverside
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

    // Always show all markers, but zoom based on the selected distance
    if (adjustedPositions.length > 0) {
      // Calculate zoom level based on maxDistanceMiles
      // Smaller distance = closer zoom, larger distance = wider zoom
      let zoomLevel: number;
      if (maxDistanceMiles <= 1) {
        zoomLevel = 15; // Very close zoom for 1 mile
      } else if (maxDistanceMiles <= 5) {
        zoomLevel = 13; // Medium-close zoom for 5 miles
      } else if (maxDistanceMiles <= 10) {
        zoomLevel = 12; // Medium zoom for 10 miles
      } else if (maxDistanceMiles <= 20) {
        zoomLevel = 11; // Medium-wide zoom for 20 miles
      } else {
        zoomLevel = 10; // Wide zoom for 50+ miles
      }

      console.log(`MapView: Setting zoom to ${zoomLevel} for ${maxDistanceMiles} miles view`);
      
      // Center on UC Riverside and set zoom
      map.setView([33.9730, -117.3325], zoomLevel, { animate: true });
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
  }, [L, spots, onMarkerClick, maxDistanceMiles]);

  // Zoom to selected spot from search
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selectedSpotId || !spots.length) return;

    const selectedSpot = spots.find(s => s.id === selectedSpotId);
    if (selectedSpot && selectedSpot.lat && selectedSpot.lng) {
      const spotLat = selectedSpot.lat;
      const spotLng = selectedSpot.lng;
      
      console.log(`MapView: Zooming to selected spot at ${spotLat}, ${spotLng}`);
      map.setView([spotLat, spotLng], 16, { animate: true });
      
      // Find and open the popup for this marker
      const marker = markersRef.current.find((m: any) => {
        const pos = m.getLatLng();
        return Math.abs(pos.lat - spotLat) < 0.0001 && Math.abs(pos.lng - spotLng) < 0.0001;
      });
      
      if (marker && map.hasLayer(marker)) {
        setTimeout(() => marker.openPopup(), 300);
      }
    }
  }, [selectedSpotId, spots]);

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








