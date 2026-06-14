"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSpot, markVisited, markUnvisited, deleteSpot } from "@/lib/firestore";
import type { Spot, SpotCategory } from "@/types/spot";

const CATEGORY_ICON: Record<SpotCategory, string> = {
  restaurant: "🍽️",
  cafe: "☕",
  camping: "⛺",
  sightseeing: "🗺️",
  goods: "🛍️",
  plants: "🪴",
  bookstore: "📚",
  accommodation: "🛏️",
  other: "📍",
};

const CATEGORY_LABEL: Record<SpotCategory, string> = {
  restaurant: "飲食店",
  cafe: "カフェ・喫茶",
  camping: "キャンプ場・アウトドア",
  sightseeing: "観光・おでかけ",
  goods: "雑貨・ショップ",
  plants: "植物店・花屋",
  bookstore: "書店",
  accommodation: "宿泊施設",
  other: "その他",
};

export default function SpotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const backHref = searchParams.get("from") ?? "/";
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    getSpot(id).then((data) => {
      setSpot(data);
      setLoading(false);
    });
  }, [id]);

  async function handleToggleVisited() {
    if (!spot) return;
    setWorking(true);
    if (spot.status === "unvisited") {
      await markVisited(id);
      setSpot({ ...spot, status: "visited" });
    } else {
      await markUnvisited(id);
      setSpot({ ...spot, status: "unvisited" });
    }
    setWorking(false);
  }

  async function handleDelete() {
    if (!confirm("このスポットを削除しますか？")) return;
    setWorking(true);
    await deleteSpot(id);
    router.push("/");
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
        <p className="py-12 text-center text-sm text-gray-400">読み込み中...</p>
      </main>
    );
  }

  if (!spot) {
    return (
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
        <p className="py-12 text-center text-sm text-gray-400">スポットが見つかりません</p>
      </main>
    );
  }

  const stars = "★".repeat(spot.priority) + "☆".repeat(3 - spot.priority);
  const mapsUrl = `https://maps.google.com/?q=place_id:${spot.placeId}`;
  const staticMapUrl =
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${spot.lat},${spot.lng}&zoom=15&size=600x300&scale=2` +
    `&markers=color:red%7C${spot.lat},${spot.lng}` +
    `&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

  return (
    <main className="mx-auto max-w-lg pb-24">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <Link href={backHref} className="text-gray-500 dark:text-gray-400">
          ← 戻る
        </Link>
      </div>

      {/* 地図プレビュー */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={staticMapUrl}
        alt={spot.name}
        className="w-full object-cover"
        style={{ height: 180 }}
      />

      <div className="px-4 pt-5">
        {/* 場所名・カテゴリ */}
        <div className="flex items-start gap-3">
          <span className="text-3xl">{CATEGORY_ICON[spot.category]}</span>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{spot.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{spot.address}</p>
          </div>
        </div>

        {/* メタ情報 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm text-gray-600 dark:text-gray-300">
            {CATEGORY_LABEL[spot.category]}
          </span>
          <span className="rounded-full bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 text-sm text-yellow-600 dark:text-yellow-400">
            {stars}
          </span>
          <span className={`rounded-full px-3 py-1 text-sm ${
            spot.status === "visited"
              ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          }`}>
            {spot.status === "visited" ? "訪問済み" : "未訪問"}
          </span>
        </div>

        {/* メモ */}
        {spot.memo && (
          <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">{spot.memo}</p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="mt-6 flex flex-col gap-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white"
          >
            Mapsで開く
          </a>

          <button
            onClick={handleToggleVisited}
            disabled={working}
            className={`flex h-12 items-center justify-center rounded-xl font-semibold transition disabled:opacity-40 ${
              spot.status === "unvisited"
                ? "bg-green-600 text-white"
                : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
            }`}
          >
            {spot.status === "unvisited" ? "訪問済みにする" : "未訪問に戻す"}
          </button>

          <button
            onClick={handleDelete}
            disabled={working}
            className="flex h-12 items-center justify-center rounded-xl border border-red-200 dark:border-red-900 font-semibold text-red-500 dark:text-red-400 disabled:opacity-40"
          >
            削除する
          </button>
        </div>
      </div>
    </main>
  );
}
