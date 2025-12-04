"use client";

import React, { useMemo, useState, useEffect } from "react";
import type { Parking } from "./_data";

interface Props {
  // Current applied query from the parent (what the map uses)
  query: string;
  // Called when the user *applies* a search (selects or presses Enter)
  onQueryApply: (value: string) => void;
  maxDistanceMiles: number;
  onMaxDistanceChange: (value: number) => void;
  // All available spots to search through
  spots: Parking[];
  // Called when a spot is selected from search
  onSpotSelect?: (spotId: string) => void;
}

export default function SearchControls({
  query,
  onQueryApply,
  maxDistanceMiles,
  onMaxDistanceChange,
  spots,
  onSpotSelect,
}: Props) {
  // What the user is currently typing
  const [input, setInput] = useState(query);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  // Keep the input in sync if parent changes query (e.g. Reset view)
  useEffect(() => {
    setInput(query);
  }, [query]);

  const suggestions: Parking[] = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return spots.filter((p) => {
      const haystack = `${p.title} ${p.address} ${p.owner || ''}`.toLowerCase();
      return haystack.includes(q);
    }).slice(0, 6);
  }, [input, spots]);

  const hasInput = input.trim().length > 0;
  const showNoResults = hasInput && suggestions.length === 0;

  const applyValue = (value: string) => {
    const v = value.trim();
    setInput(v);
    onQueryApply(v); // 🔥 tell parent to update map filter
    setOpen(false);
  };

  const handleSelect = (spot: Parking) => {
    // Notify parent to zoom to this spot
    if (onSpotSelect) {
      onSpotSelect(spot.id);
    }
    // You can change this to spot.address if you want address in the box
    applyValue(spot.title);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If dropdown open and suggestions exist, select highlighted suggestion
      if (open && suggestions.length > 0) {
        const spot = suggestions[highlightIndex];
        if (spot) return handleSelect(spot);
      }
      // Otherwise apply whatever is in the input box
      return applyValue(input);
    }

    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) =>
        i === 0 ? suggestions.length - 1 : i - 1
      );
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const distanceOptions = [1, 5, 10, 20, 50];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      {/* Search + dropdown */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-600">
          Search
        </label>
        <div className="relative mt-1">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOpen(true);
              setHighlightIndex(0);
            }}
            onFocus={() => {
              if (suggestions.length > 0 || showNoResults) setOpen(true);
            }}
            onBlur={() => {
              // delay to allow click on suggestion
              setTimeout(() => setOpen(false), 100);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Name or address"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
          />

          {open && (suggestions.length > 0 || showNoResults) && (
            <ul className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-xl border bg-white text-sm shadow-lg">
              {suggestions.length > 0 ? (
                suggestions.map((spot, idx) => (
                  <li
                    key={spot.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(spot);
                    }}
                    className={
                      "cursor-pointer px-3 py-2 " +
                      (idx === highlightIndex ? "bg-violet-50" : "bg-white")
                    }
                  >
                    <div className="font-semibold">{spot.title}</div>
                    <div className="text-xs text-gray-500">
                      {spot.address}
                    </div>
                  </li>
                ))
              ) : (
                <li className="select-none px-3 py-2 text-xs text-gray-500">
                  No spots found for “{input.trim()}”. Try another search.
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Distance dropdown (miles) */}
      <div className="w-full md:w-64">
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-xs font-medium text-gray-600">
            Map view distance
          </label>
          <span className="text-xs font-semibold">
            {maxDistanceMiles} mi
          </span>
        </div>
        <select
          value={maxDistanceMiles}
          onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
        >
          {distanceOptions.map((miles) => (
            <option key={miles} value={miles}>
              {miles} mile{miles === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}




