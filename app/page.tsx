"use client";

import { useMemo, useState } from "react";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import SpotCard from "@/components/SpotCard";
import { useSpots } from "@/hooks/useSpots";
import { extractCity } from "@/lib/cityExtractor";
import type { Spot, SpotCategory } from "@/types/spot";

const LIST_ID = "default";

const CATEGORIES: { value: SpotCategory | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "restaurant", label: "飲食店" },
  { value: "cafe", label: "カフェ" },
  { value: "camping", label: "アウトドア" },
  { value: "sightseeing", label: "観光" },
  { value: "other", label: "その他" },
];

type SortKey = "createdAt" | "priority";

export default function HomePage() {
  const { spots, loading } = useSpots(LIST_ID);
  const [tab, setTab] = useState<"unvisited" | "visited">("unvisited");
  const [category, setCategory] = useState<SpotCategory | "all">("all");
  const [city, setCity] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("createdAt");

  // 登録済みスポットから市区町村一覧を生成
  const cities = useMemo(() => {
    const set = new Set<string>();
    spots.forEach((s) => {
      const c = extractCity(s.address);
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [spots]);

  const filtered = useMemo(() => {
    return spots
      .filter((s: Spot) => s.status === tab)
      .filter((s: Spot) => category === "all" || s.category === category)
      .filter((s: Spot) => city === "all" || extractCity(s.address) === city)
      .filter((s: Spot) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.memo?.toLowerCase().includes(q)
        );
      })
      .sort((a: Spot, b: Spot) => {
        if (sort === "priority") return b.priority - a.priority;
        const aTime = a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.seconds ?? 0;
        return bTime - aTime;
      });
  }, [spots, tab, category, city, search, sort]);

  return (
    <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">行きたい場所</h1>
        <ShareButton listId={LIST_ID} />
      </div>

      {/* 未訪問 / 訪問済みタブ */}
      <div className="mb-4 flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
        {(["unvisited", "visited"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === t
                ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t === "unvisited" ? "未訪問" : "訪問済み"}
          </button>
        ))}
      </div>

      {/* 検索 */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="場所名・住所・メモで検索"
        className="mb-3 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />

      {/* カテゴリフィルター */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              category === c.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* エリアフィルター（市区町村が2つ以上あるときだけ表示） */}
      {cities.length >= 2 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCity("all")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              city === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            全エリア
          </button>
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                city === c
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* ソート */}
      <div className="mb-4 flex justify-end">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 outline-none"
        >
          <option value="createdAt">登録日順</option>
          <option value="priority">優先度順</option>
        </select>
      </div>

      {/* スポット一覧 */}
      {loading ? (
        <p className="py-12 text-center text-sm text-gray-400">読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
          {tab === "unvisited"
            ? "行きたい場所を追加してみましょう"
            : "まだ訪問済みの場所はありません"}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((spot: Spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}

      {/* FABボタン */}
      <Link
        href="/add"
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg active:bg-blue-700"
      >
        ＋
      </Link>
    </main>
  );
}
