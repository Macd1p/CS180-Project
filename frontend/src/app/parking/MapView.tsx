// src/app/parking/MapView.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Parking } from "./_data";

interface MapViewProps {
  spots: Parking[];
  onMarkerClick: (id: string) => void; // navigate to post page
}

export default function MapView({ spots, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const lockedMarkerRef = useRef<any | null>(null);
  const [L, setL] = useState<any | null>(null); // Leaflet module

  // Load Leaflet on the client only
  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import("leaflet");
      if (!mounted) return;
      // Some bundlers put Leaflet on mod.default; others on mod itself
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
    lockedMarkerRef.current = null;

    if (!spots.length) return;

    const bounds = L.latLngBounds([]);

    const closeAllPopups = () => {
      markersRef.current.forEach((m) => m.closePopup());
      lockedMarkerRef.current = null;
    };

    // clicking empty map -> unlock and close
    map.off("click");
    map.on("click", () => {
      closeAllPopups();
    });

    spots.forEach((p) => {
      const avatarSrc = (p as any).userAvatarUrl ?? p.imageUrl;

      // Avatar + oval label bubble
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
        iconAnchor: [115, 70], // center bottom
      });

      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);

      // Popup HTML with "View post" button
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
        autoClose: false,
        closeOnClick: false,
      }).setContent(popupHtml);

      marker.bindPopup(popup);

      let closeTimeout: any = null;

      const clearCloseTimeout = () => {
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
      };

      const scheduleCloseIfNotLocked = () => {
        clearCloseTimeout();
        if (lockedMarkerRef.current === marker) return; // don't close if locked
        closeTimeout = setTimeout(() => {
          marker.closePopup();
        }, 150);
      };

      // Hover: show popup (unless some other marker is locked)
      marker.on("mouseover", () => {
        clearCloseTimeout();
        if (
          lockedMarkerRef.current &&
          lockedMarkerRef.current !== marker
        ) {
          return;
        }
        marker.openPopup();
      });

      marker.on("mouseout", () => {
        scheduleCloseIfNotLocked();
      });

      // When popup is rendered, add hover + button listeners
      popup.on("add", () => {
        const el = popup.getElement();
        if (!el) return;

        el.addEventListener("mouseenter", () => {
          clearCloseTimeout();
        });

        el.addEventListener("mouseleave", () => {
          scheduleCloseIfNotLocked();
        });

        const btn = el.querySelector(
          `[data-view-post="${p.id}"]`
        ) as HTMLButtonElement | null;
        
        if (btn) {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            onMarkerClick(p.id); // navigate to post page
          });
        }        
      });

      // Click: lock this popup open
      marker.on("click", () => {
        clearCloseTimeout();
        if (lockedMarkerRef.current && lockedMarkerRef.current !== marker) {
          lockedMarkerRef.current.closePopup();
        }
        lockedMarkerRef.current = marker;
        marker.openPopup();
      });

      markersRef.current.push(marker);
      bounds.extend([p.lat, p.lng]);
    });

    map.fitBounds(bounds, { padding: [40, 40] });
  }, [L, spots, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className="h-[70vh] w-full rounded-2xl border overflow-hidden"
    />
  );
}




