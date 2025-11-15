"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MapView from "./MapView";
import SearchControls from "./SearchControls";
import { DEMO_SPOTS, type Parking } from "./_data";
import { USER_LOCATION, distanceInMeters } from "./geo";

export default function ParkingBrowsePage() {
  const router = useRouter();

  // Applied filters (used for map + list)
  const [query, setQuery] = useState("");
  const [maxDistanceMiles, setMaxDistanceMiles] = useState(5); // default 5 mi

  const filteredSpots: Parking[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const maxMeters = maxDistanceMiles * 1609.34; // miles -> meters

    return DEMO_SPOTS.filter((p) => {
      const d = distanceInMeters(
        USER_LOCATION.lat,
        USER_LOCATION.lng,
        p.lat,
        p.lng
      );
      if (d > maxMeters) return false;

      if (!q) return true;
      const haystack = `${p.name} ${p.address} ${p.city}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, maxDistanceMiles]);

  const handleMarkerClick = useCallback(
    (id: string) => {
      // You can change this route later if you want /parking/[id] instead.
      router.push(`/posts/${id}`);
    },
    [router]
  );

  // Reset filters to defaults
  const handleResetFilters = () => {
    setQuery("");
    setMaxDistanceMiles(5);
  };

  // Show reset button only when filters are not at default
  const showReset =
    query.trim() !== "" || maxDistanceMiles !== 5;

  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-8 pt-20">
      <h1 className="mb-2 text-2xl font-bold">Browse parking posts</h1>
      <p className="mb-4 text-sm text-gray-600">
        Search public posts near you. Click a marker on the map to open the post.
      </p>

      {/* Search + filters; higher z so dropdown stays above the map */}
      <section className="relative z-30 mb-4 rounded-2xl border bg-white/90 p-4 shadow-sm">
        <SearchControls
          query={query}
          onQueryApply={setQuery}                
          maxDistanceMiles={maxDistanceMiles}
          onMaxDistanceChange={setMaxDistanceMiles}
        />
      </section>

      {/* Map under the search controls in stacking order */}
      <section className="relative z-10">
        <MapView
          spots={filteredSpots}
          onMarkerClick={handleMarkerClick}
          onResetFilters={handleResetFilters}
          showReset={showReset}
        />
        <p className="mt-3 text-xs text-gray-500">* Demo UI — static data.</p>
      </section>
    </main>
  );
}






