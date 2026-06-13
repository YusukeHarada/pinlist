"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import type { SelectedPlace } from "@/components/PlaceAutocomplete";
import type { SpotCategory } from "@/types/spot";
import { addSpot } from "@/lib/firestore";

const CATEGORY_LABEL: Record<SpotCategory, string> = {
  restaurant: "飲食店",
  cafe: "カフェ・喫茶",
  camping: "キャンプ場・アウトドア",
  sightseeing: "観光・おでかけ",
  other: "その他",
};

const CATEGORIES = Object.entries(CATEGORY_LABEL) as [SpotCategory, string][];

const LIST_ID = "default";

export default function AddPage() {
  const router = useRouter();
  const [place, setPlace] = useState<SelectedPlace | null>(null);
  const [category, setCategory] = useState<SpotCategory>("other");
  const [memo, setMemo] = useState("");
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(selected: SelectedPlace) {
    setPlace(selected);
    setCategory(selected.suggestedCategory);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!place) return;
    setSaving(true);
    setError(null);
    try {
      await addSpot({
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        placeId: place.placeId,
        category,
        memo,
        priority,
        listId: LIST_ID,
      });
      router.push("/");
    } catch (err) {
      setError("保存に失敗しました。もう一度お試しください。");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-xl font-bold text-gray-800 dark:text-gray-100">場所を登録</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            場所を検索
          </label>
          <PlaceAutocomplete onSelect={handleSelect} />
        </div>

        {place && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
            <p className="font-medium text-gray-800 dark:text-gray-100">{place.name}</p>
            <p className="mt-0.5">{place.address}</p>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            カテゴリ
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SpotCategory)}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 text-base outline-none focus:border-blue-500"
          >
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            優先度
          </label>
          <div className="flex gap-3">
            {([1, 2, 3] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-lg transition ${
                  priority === p
                    ? "bg-yellow-400 dark:bg-yellow-500 font-bold shadow"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                }`}
              >
                {"★".repeat(p)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            メモ
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="なぜ行きたいか、など"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 text-base outline-none focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!place || saving}
          className="rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow disabled:opacity-40"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </form>
    </main>
  );
}
