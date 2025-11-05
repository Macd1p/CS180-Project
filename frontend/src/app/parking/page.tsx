"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ---------- Types ----------
type Amenity = "EV charging" | "Covered" | "Security" | "24/7" | "Valet";

interface Parking {
  id: string;
  name: string;
  address: string;
  city: string;
  pricePerHour: number; // USD
  distanceMeters: number; // from search point
  rating: number; // 0..5
  amenities: Amenity[];
  maxHeightMeters?: number;
  // Map support:
  lat: number;
  lng: number;
}

// ---------- Demo data ----------
const DEMO: Parking[] = [
  {
    id: "p1",
    name: "Downtown Center Garage",
    address: "123 Main St",
    city: "Los Angeles, CA",
    pricePerHour: 4.5,
    distanceMeters: 220,
    rating: 4.4,
    amenities: ["Covered", "Security", "24/7"],
    maxHeightMeters: 2.0,
    lat: 34.0490,
    lng: -118.2500,
  },
  {
    id: "p2",
    name: "Union Station Lot A",
    address: "800 N Alameda St",
    city: "Los Angeles, CA",
    pricePerHour: 3.0,
    distanceMeters: 950,
    rating: 4.1,
    amenities: ["EV charging", "Covered"],
    maxHeightMeters: 2.1,
    lat: 34.0562,
    lng: -118.2365,
  },
  {
    id: "p3",
    name: "Mission Bay Garage",
    address: "455 3rd St",
    city: "San Francisco, CA",
    pricePerHour: 6.5,
    distanceMeters: 540,
    rating: 4.6,
    amenities: ["EV charging", "Covered", "24/7"],
    maxHeightMeters: 2.2,
    lat: 37.7730,
    lng: -122.3890,
  },
];

// ---------- Utilities ----------
function metersToPretty(m: number) {
  if (m < 950) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const arr: string[] = new Array(5).fill("☆");
  for (let i = 0; i < full; i++) arr[i] = "★";
  if (half && full < 5) arr[full] = "⯪"; // half-ish
  return <span className="text-amber-500">{arr.join("")}</span>;
}

// ---------- Map (MapLibre with fallback) ----------
function useMapLibre() {
  const [maplibre, setMaplibre] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const m = await import("maplibre-gl");
        if (mounted) setMaplibre(m);
      } catch {
        setMaplibre(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return maplibre;
}

function MapPane({
  spots,
  selectedId,
  onSelect,
}: {
  spots: Parking[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const maplibre = useMapLibre();
  const mapInstance = useRef<any>(null);

  const hasKey = !!process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const center = useMemo(() => {
    // If there is a selection, center there; else average LA-ish defaults
    const sel = spots.find((s) => s.id === selectedId);
    if (sel) return [sel.lng, sel.lat] as [number, number];
    // default to LA
    return [-118.244, 34.052];
  }, [spots, selectedId]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    if (!hasKey || !maplibre) return;

    const existing = mapInstance.current;
    if (!existing) {
      const m = new maplibre.Map({
        container: mapRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
        center,
        zoom: 12,
        attributionControl: true,
      });
      mapInstance.current = m;

      m.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "top-right");

      m.on("load", () => {
        // add markers
        spots.forEach((p) => {
          const el = document.createElement("div");
          el.className =
            "shadow-md rounded-full bg-black text-white text-[11px] font-semibold px-2 py-1 cursor-pointer";
          el.innerText = `$${p.pricePerHour.toFixed(0)}`;
          el.style.transform = "translate(-50%, -100%)";
          el.addEventListener("click", () => onSelect(p.id));
          new maplibre.Marker({ element: el, anchor: "bottom" }).setLngLat([p.lng, p.lat]).addTo(m);
        });
      });
    } else {
      existing.setCenter(center);
    }

    return () => {
      // don't destroy on unmount across route changes; Next will recreate anyway
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef, maplibre, hasKey]);

  // Fly to selection
  useEffect(() => {
    if (mapInstance.current && selectedId) {
      const p = spots.find((s) => s.id === selectedId);
      if (p) {
        mapInstance.current.flyTo({ center: [p.lng, p.lat], zoom: 14 });
      }
    }
  }, [selectedId, spots]);

  if (!hasKey || !maplibre) {
    // Fallback: simple grid "map" with positioned dots (roughly scaled)
    const minLat = Math.min(...spots.map((s) => s.lat));
    const maxLat = Math.max(...spots.map((s) => s.lat));
    const minLng = Math.min(...spots.map((s) => s.lng));
    const maxLng = Math.max(...spots.map((s) => s.lng));

    const toPct = (lat: number, lng: number) => {
      const x = ((lng - minLng) / Math.max(0.0001, maxLng - minLng)) * 100;
      const y = (1 - (lat - minLat) / Math.max(0.0001, maxLat - minLat)) * 100;
      return { left: `${x}%`, top: `${y}%` };
    };

    return (
      <div className="relative h-[70vh] w-full rounded-2xl border bg-[linear-gradient(90deg,#f1f5f9_1px,transparent_1px),linear-gradient(#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px]">
        <div className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs shadow">
          Map preview (no API key)
        </div>
        {spots.map((p) => {
          const pos = toPct(p.lat, p.lng);
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              style={{ ...pos }}
              className={`absolute -translate-x-1/2 -translate-y-full rounded-full px-2 py-1 text-[11px] font-semibold shadow ${
                active ? "bg-black text-white" : "bg-white text-gray-900"
              }`}
              title={p.name}
            >
              ${p.pricePerHour.toFixed(0)}
            </button>
          );
        })}
      </div>
    );
  }

  return <div ref={mapRef} className="h-[70vh] w-full rounded-2xl border" />;
}

// ---------- Filters ----------
const ALL_AMENITIES: Amenity[] = ["EV charging", "Covered", "Security", "24/7", "Valet"];

function Filters({
  query,
  setQuery,
  maxPrice,
  setMaxPrice,
  selectedAmenities,
  toggleAmenity,
  clear,
}: {
  query: string;
  setQuery: (s: string) => void;
  maxPrice: number;
  setMaxPrice: (n: number) => void;
  selectedAmenities: Set<Amenity>;
  toggleAmenity: (a: Amenity) => void;
  clear: () => void;
}) {
  return (
    <div className="sticky top-[72px] space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600">Search</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name or address"
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-xs font-medium text-gray-600">Max price (USD / hr)</label>
          <span className="text-xs font-semibold">${maxPrice.toFixed(0)}</span>
        </div>
        <input
          type="range"
          min={2}
          max={20}
          value={maxPrice}
          onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600">Amenities</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_AMENITIES.map((a) => {
            const active = selectedAmenities.has(a);
            return (
              <button
                key={a}
                onClick={() => toggleAmenity(a)}
                className={`rounded-full border px-2 py-1 text-xs ${
                  active ? "border-black bg-black text-white" : "hover:bg-gray-50"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={clear}
        className="w-full rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
      >
        Clear filters
      </button>
    </div>
  );
}

// ---------- List item ----------
function SpotCard({
  p,
  selected,
  onHover,
  onClick,
  onReserve,
}: {
  p: Parking;
  selected: boolean;
  onHover: () => void;
  onClick: () => void;
  onReserve: () => void;
}) {
  return (
    <article
      onMouseEnter={onHover}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition ${
        selected ? "ring-2 ring-black" : "hover:shadow"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">{p.name}</div>
          <div className="text-xs text-gray-600">
            {p.address} • {p.city}
          </div>
          <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-gray-700">
            {p.amenities.map((a) => (
              <span key={a} className="rounded-full border bg-white px-2 py-1">
                {a}
              </span>
            ))}
            {p.maxHeightMeters && (
              <span className="rounded-full border bg-white px-2 py-1">
                Max {p.maxHeightMeters.toFixed(1)}m
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">${p.pricePerHour.toFixed(2)}/hr</div>
          <div className="text-xs text-gray-600">{metersToPretty(p.distanceMeters)}</div>
          <div className="text-xs">
            <Stars rating={p.rating} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReserve();
            }}
            className="mt-2 w-full rounded-lg border px-2 py-1 text-xs font-semibold hover:bg-gray-50"
          >
            Reserve
          </button>
        </div>
      </div>
    </article>
  );
}

// ---------- Page ----------
export default function ParkingPage() {
  const router = useRouter();

  // State
  const [selectedId, setSelectedId] = useState<string | null>(DEMO[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(20);
  const [amenities, setAmenities] = useState<Set<Amenity>>(new Set());

  const toggleAmenity = (a: Amenity) => {
    setAmenities((prev) => {
      const next = new Set(prev);
      next.has(a) ? next.delete(a) : next.add(a);
      return next;
    });
  };
  const clearFilters = () => {
    setQuery("");
    setMaxPrice(20);
    setAmenities(new Set());
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO.filter((p) => {
      if (p.pricePerHour > maxPrice) return false;
      if (amenities.size) {
        for (const a of amenities) if (!p.amenities.includes(a)) return false;
      }
      if (!q) return true;
      const hay = `${p.name} ${p.address} ${p.city}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, maxPrice, amenities]);

  const selected = filtered.find((f) => f.id === selectedId) || filtered[0] || null;

  const tryReserve = async (id: string) => {
    try {
      const r = await fetch("/api/auth/whoami", { method: "GET" });
      if (r.ok) {
        router.push(`/reserve/${id}`);
      } else {
        router.push(`/sign-in?next=${encodeURIComponent(`/reserve/${id}`)}`);
      }
    } catch {
      router.push(`/sign-in?next=${encodeURIComponent(`/reserve/${id}`)}`);
    }
  };

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6">
      <h1 className="mb-3 text-2xl font-bold">Available parking</h1>
      <p className="mb-4 text-sm text-gray-600">
        Browse public spots. Sign in to reserve or create a post.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[360px,1fr]">
        {/* Sidebar */}
        <aside>
          <Filters
            query={query}
            setQuery={setQuery}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selectedAmenities={amenities}
            toggleAmenity={toggleAmenity}
            clear={clearFilters}
          />

          <div className="mt-4 space-y-3">
            {filtered.length === 0 && (
              <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">
                No spots match your filters.
              </div>
            )}
            {filtered.map((p) => (
              <SpotCard
                key={p.id}
                p={p}
                selected={p.id === selected?.id}
                onHover={() => setSelectedId(p.id)}
                onClick={() => setSelectedId(p.id)}
                onReserve={() => tryReserve(p.id)}
              />
            ))}
          </div>
        </aside>

        {/* Map */}
        <section>
          <MapPane
            spots={filtered}
            selectedId={selected?.id ?? null}
            onSelect={(id) => setSelectedId(id)}
          />

          {/* Selected summary card under the map */}
          {selected && (
            <div className="mt-4 rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold">{selected.name}</div>
                  <div className="text-xs text-gray-600">
                    {selected.address} • {selected.city}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-gray-700">
                    {selected.amenities.map((a) => (
                      <span key={a} className="rounded-full border bg-white px-2 py-1">
                        {a}
                      </span>
                    ))}
                    {selected.maxHeightMeters && (
                      <span className="rounded-full border bg-white px-2 py-1">
                        Max {selected.maxHeightMeters.toFixed(1)}m
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    ${selected.pricePerHour.toFixed(2)}/hr
                  </div>
                  <div className="text-xs text-gray-600">
                    {metersToPretty(selected.distanceMeters)}
                  </div>
                  <div className="text-xs">
                    <Stars rating={selected.rating} />
                  </div>
                  <button
                    onClick={() => tryReserve(selected.id)}
                    className="mt-2 w-full rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                  >
                    Reserve
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-gray-500">* Demo UI — static data.</p>
        </section>
      </div>
    </main>
  );
}
