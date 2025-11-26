// src/app/parking/ResetViewButton.tsx
"use client";

import React from "react";

interface Props {
  onClick: () => void;
}

export default function ResetViewButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-4 top-4 z-30 rounded-full border bg-white/90 px-3 py-1.5 text-xs font-medium shadow-md hover:bg-violet-50"
    >
      Reset view
    </button>
  );
}
