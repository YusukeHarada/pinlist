"use client";

import Link from "next/link";
import type { Spot, SpotCategory } from "@/types/spot";

const CATEGORY_ICON: Record<SpotCategory, string> = {
  restaurant: "🍽️",
  cafe: "☕",
  camping: "⛺",
  sightseeing: "🗺️",
  other: "📍",
};

type Props = {
  spot: Spot;
  backHref?: string;
};

function shortenAddress(address: string): string {
  const s = address.replace(/^日本[、,]\s*(?:〒[\d-]+\s*)?/, "");
  const m = s.match(/^(.+?[都道府県])(.+?郡)?(.+?[市区町村])/);
  if (m) return m[1] + (m[2] ?? "") + m[3];
  return s.replace(/[\d０-９].+$/, "").trim();
}

export default function SpotCard({ spot, backHref }: Props) {
  const stars = "★".repeat(spot.priority) + "☆".repeat(3 - spot.priority);
  const href = backHref
    ? `/spot/${spot.id}?from=${encodeURIComponent(backHref)}`
    : `/spot/${spot.id}`;

  return (
    <Link href={href}>
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 shadow-sm active:bg-gray-50 dark:active:bg-gray-700">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-xl">{CATEGORY_ICON[spot.category]}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{spot.name}</p>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-sm text-gray-500 dark:text-gray-400">{shortenAddress(spot.address)}</p>
              <span className="shrink-0 text-sm text-yellow-500">{stars}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
