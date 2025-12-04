/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import MapView from "../../components/parking/MapView";
import SearchControls from "../../components/parking/SearchControls";
import type { Parking } from "../../components/parking/_data";
import { useAuth } from "../providers/AuthProvider";

export default function ParkingBrowsePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth(); //states if user is authenticated and if loading to prevent race condition

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  const [spots, setSpots] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [maxDistanceMiles, setMaxDistanceMiles] = useState(5);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  // Fetch from Flask backend
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchSpots = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/parking/spots");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch spots");
        }

        setSpots(data.spots || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, [isAuthenticated]);

  // Filter spots based on query only (not distance)
  const filteredSpots: Parking[] = useMemo(() => {
    if (!spots.length) return [];

    const q = query.trim().toLowerCase();

    console.log(`Filtering ${spots.length} spots with search query: "${q}"`);

    const filtered = spots.filter((p) => {
      // Skip posts with no coordinates
      if (!p.lat || !p.lng) return false;

      // Only filter by search query, not distance
      if (!q) return true;
      const haystack = `${p.title} ${p.address} ${p.owner}`.toLowerCase();
      return haystack.includes(q);
    });

    console.log(`Filtered to ${filtered.length} spots`);
    return filtered;
  }, [spots, query]);

  const handleMarkerClick = useCallback(
    (id: string) => {
      router.push(`/post/${id}`);
    },
    [router]
  );

  const handleSpotSelect = useCallback((spotId: string) => {
    setSelectedSpotId(spotId);
    setQuery(""); // Clear search after selection
  }, []);

  const handleResetFilters = () => {
    setQuery("");
    setMaxDistanceMiles(5);
  };

  const showReset = query.trim() !== "" || maxDistanceMiles !== 5;

  if (!isAuthenticated) return null; // or a loading spinner while redirecting
  if (loading) return <p className="pt-20 text-center text-gray-600">Loading posts...</p>;
  if (error) return <p className="pt-20 text-center text-red-600">Error: {error}</p>;

  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-8 pt-20">
      <h1 className="mb-2 text-2xl font-bold">Browse parking posts</h1>
      <p className="mb-4 text-sm text-gray-600">
        Search public posts and adjust the map view. The distance selector controls the zoom level. Click a marker to open the post.
      </p>

      <section className="relative z-30 mb-4 rounded-2xl border bg-white/90 p-4 shadow-sm">
        <SearchControls
          query={query}
          onQueryApply={setQuery}
          maxDistanceMiles={maxDistanceMiles}
          onMaxDistanceChange={setMaxDistanceMiles}
          spots={spots}
          onSpotSelect={handleSpotSelect}
        />
      </section>

      <section className="relative z-10">
        <MapView
          spots={filteredSpots}
          onMarkerClick={handleMarkerClick}
          onResetFilters={handleResetFilters}
          showReset={showReset}
          maxDistanceMiles={maxDistanceMiles}
          selectedSpotId={selectedSpotId}
        />
        {filteredSpots.length === 0 && (
          <p className="mt-3 text-xs text-gray-500 text-center">
            No spots found nearby. Try adjusting your filters.
          </p>
        )}
      </section>
    </main>
  );
}
