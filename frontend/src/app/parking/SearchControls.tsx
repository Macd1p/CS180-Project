// src/app/parking/SearchControls.tsx
"use client";

import React from "react";

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  maxDistanceKm: number;
  onMaxDistanceChange: (value: number) => void;
}

export default function SearchControls({
  query,
  onQueryChange,
  maxDistanceKm,
  onMaxDistanceChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-600">Search</label>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Name or address"
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
        />
      </div>

      <div className="w-full md:w-64">
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-xs font-medium text-gray-600">
            Max distance from you
          </label>
          <span className="text-xs font-semibold">{maxDistanceKm.toFixed(1)} km</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={maxDistanceKm}
          onChange={(e) => onMaxDistanceChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
