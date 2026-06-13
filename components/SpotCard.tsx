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
};

export default function SpotCard({ spot }: Props) {
  const stars = "★".repeat(spot.priority) + "☆".repeat(3 - spot.priority);

  return (
    <Link href={`/spot/${spot.id}`}>
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm active:bg-gray-50">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-2xl">{CATEGORY_ICON[spot.category]}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-semibold text-gray-800">{spot.name}</p>
              <span className="shrink-0 text-sm text-yellow-500">{stars}</span>
            </div>
            <p className="mt-0.5 truncate text-sm text-gray-500">{spot.address}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {CATEGORY_LABEL[spot.category]}
              </span>
              {spot.memo && (
                <span className="truncate text-xs text-gray-400">{spot.memo}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
