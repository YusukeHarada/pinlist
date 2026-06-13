"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import SpotCard from "@/components/SpotCard";
import { useSpots } from "@/hooks/useSpots";
import type { Spot, SpotCategory } from "@/types/spot";

const CATEGORIES: { value: SpotCategory | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "restaurant", label: "飲食店" },
  { value: "cafe", label: "カフェ" },
  { value: "camping", label: "アウトドア" },
  { value: "sightseeing", label: "観光" },
  { value: "other", label: "その他" },
];

export default function SharedListPage() {
  const { listId } = useParams<{ listId: string }>();
  const { spots, loading } = useSpots(listId);
  const [tab, setTab] = useState<"unvisited" | "visited">("unvisited");
  const [category, setCategory] = useState<SpotCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return spots
      .filter((s: Spot) => s.status === tab)
      .filter((s: Spot) => category === "all" || s.category === category)
      .filter((s: Spot) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.memo?.toLowerCase().includes(q)
        );
      });
  }, [spots, tab, category, search]);

  return (
    <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h1 className="mb-1 text-xl font-bold text-gray-800">行きたい場所リスト</h1>
      <p className="mb-4 text-xs text-gray-400">共有リスト</p>

      <div className="mb-4 flex rounded-xl bg-gray-100 p-1">
        {(["unvisited", "visited"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === t ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            }`}
          >
            {t === "unvisited" ? "未訪問" : "訪問済み"}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="場所名・住所・メモで検索"
        className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              category === c.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-gray-400">読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">
          {tab === "unvisited" ? "未訪問の場所はありません" : "訪問済みの場所はありません"}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((spot: Spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </main>
  );
}
