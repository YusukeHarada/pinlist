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

const CATEGORY_LABEL: Record<SpotCategory, string> = {
  restaurant: "飲食店",
  cafe: "カフェ",
  camping: "アウトドア",
  sightseeing: "観光",
  other: "その他",
};

type Props = {
  spot: Spot;
  backHref?: string;
};

export default function SpotCard({ spot, backHref }: Props) {
  const stars = "★".repeat(spot.priority) + "☆".repeat(3 - spot.priority);
  const href = backHref
    ? `/spot/${spot.id}?from=${encodeURIComponent(backHref)}`
    : `/spot/${spot.id}`;

  return (
    <Link href={href}>
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 shadow-sm active:bg-gray-50 dark:active:bg-gray-700">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-2xl">{CATEGORY_ICON[spot.category]}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-semibold text-gray-800 dark:text-gray-100">{spot.name}</p>
              <span className="shrink-0 text-sm text-yellow-500">{stars}</span>
            </div>
            <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">{spot.address}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">
                {CATEGORY_LABEL[spot.category]}
              </span>
              {spot.memo && (
                <span className="truncate text-xs text-gray-400 dark:text-gray-500">{spot.memo}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
