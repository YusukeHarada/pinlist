"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useSpots } from "@/hooks/useSpots";
import type { Spot, SpotCategory } from "@/types/spot";

const LIST_ID = "default";

const CATEGORY_COLOR: Record<SpotCategory, string> = {
  restaurant: "#ef4444",
  cafe: "#f59e0b",
  camping: "#22c55e",
  sightseeing: "#3b82f6",
  goods: "#ec4899",
  plants: "#84cc16",
  bookstore: "#92400e",
  accommodation: "#0891b2",
  other: "#8b5cf6",
};

const CATEGORIES: { value: SpotCategory | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "restaurant", label: "飲食店" },
  { value: "cafe", label: "カフェ" },
  { value: "camping", label: "アウトドア" },
  { value: "sightseeing", label: "観光" },
  { value: "goods", label: "雑貨" },
  { value: "plants", label: "植物" },
  { value: "bookstore", label: "書店" },
  { value: "accommodation", label: "宿泊" },
  { value: "other", label: "その他" },
];

export default function MapPage() {
  const { spots, loading } = useSpots(LIST_ID);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [category, setCategory] = useState<SpotCategory | "all">("all");

  const filteredSpots = useMemo(
    () => (category === "all" ? spots : spots.filter((s) => s.category === category)),
    [spots, category]
  );

  useEffect(() => {
    if (loading || !mapRef.current) return;

    async function initMap() {
      setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY! });
      const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await importLibrary("marker") as google.maps.MarkerLibrary;
      const { LatLngBounds } = await importLibrary("core") as google.maps.CoreLibrary;

      // 初回のみ地図を生成
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new Map(mapRef.current!, {
          center: { lat: 35.6762, lng: 139.6503 },
          zoom: 10,
          mapId: "pinlist-map",
          disableDefaultUI: true,
          zoomControl: true,
        });
      }

      const map = mapInstanceRef.current;

      // 既存マーカーを削除
      markersRef.current.forEach((m) => { m.map = null; });
      markersRef.current = [];

      // 表示スポットが収まるようにビューを調整
      if (filteredSpots.length === 1) {
        map.setCenter({ lat: filteredSpots[0].lat, lng: filteredSpots[0].lng });
        map.setZoom(14);
      } else if (filteredSpots.length > 1) {
        const bounds = new LatLngBounds();
        filteredSpots.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
        map.fitBounds(bounds, { top: 60, right: 20, bottom: 20, left: 20 });
      }

      // ピンを再描画
      filteredSpots.forEach((spot) => {
        const pin = document.createElement("div");
        pin.style.cssText = `
          width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg); cursor: pointer;
          background: ${CATEGORY_COLOR[spot.category]};
          border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,.3);
        `;

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: spot.lat, lng: spot.lng },
          content: pin,
          title: spot.name,
        });

        marker.addListener("click", () => {
          setSelectedSpot(spot);
          map.panTo({ lat: spot.lat, lng: spot.lng });
        });

        markersRef.current.push(marker);
      });
    }

    initMap();
  }, [filteredSpots, loading]);

  const mapsUrl = selectedSpot
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedSpot.name)}&query_place_id=${selectedSpot.placeId}`
    : "";

  return (
    <div className="relative h-[calc(100dvh-56px)]">
      <div ref={mapRef} className="h-full w-full" />

      {/* カテゴリフィルター */}
      <div className="absolute left-0 right-0 top-0 flex flex-wrap gap-1.5 bg-white/85 px-3 py-2 backdrop-blur-sm">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              setCategory(c.value);
              setSelectedSpot(null);
            }}
            className={`rounded-full px-2 py-1 text-xs font-medium transition ${
              category === c.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      )}

      {/* スポットポップアップ */}
      {selectedSpot && (
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-800">{selectedSpot.name}</p>
              <p className="truncate text-sm text-gray-500">{selectedSpot.address}</p>
            </div>
            <button
              onClick={() => setSelectedSpot(null)}
              className="shrink-0 text-gray-400"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl bg-blue-600 py-2 text-center text-sm font-semibold text-white"
            >
              Mapsで開く
            </a>
            <a
              href={`/spot/${selectedSpot.id}`}
              className="flex-1 rounded-xl border border-gray-200 py-2 text-center text-sm font-semibold text-gray-700"
            >
              詳細を見る
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
