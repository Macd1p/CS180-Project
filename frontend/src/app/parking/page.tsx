// src/app/parking/page.tsx
"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MapView from "./MapView";
import SearchControls from "./SearchControls";
import { DEMO_SPOTS, type Parking } from "./_data";
import { USER_LOCATION, distanceInMeters } from "./geo";

export default function ParkingBrowsePage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [maxDistanceKm, setMaxDistanceKm] = useState(5); // slider in km

  const filteredSpots: Parking[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const maxMeters = maxDistanceKm * 1000;
  
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
  }, [query, maxDistanceKm]);  

  const handleMarkerClick = useCallback(
    (id: string) => {
      // You can change this route later if you want /parking/[id] instead.
      router.push(`/posts/${id}`);
    },
    [router]
  );

  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-8 pt-20">
    <h1 className="mb-2 text-2xl font-bold">Browse parking posts</h1>
    <p className="mb-4 text-sm text-gray-600">
      Search public posts near you. Click a marker on the map to open the post.
    </p>

      <section className="mb-4 rounded-2xl border bg-white/90 p-4 shadow-sm">
        <SearchControls
          query={query}
          onQueryChange={setQuery}
          maxDistanceKm={maxDistanceKm}
          onMaxDistanceChange={setMaxDistanceKm}
        />
      </section>

      <section>
        <MapView spots={filteredSpots} onMarkerClick={handleMarkerClick} />
        <p className="mt-3 text-xs text-gray-500">* Demo UI — static data.</p>
      </section>
    </main>
  );
}

