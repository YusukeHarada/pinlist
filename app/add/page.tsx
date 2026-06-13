"use client";

import { useState } from "react";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import type { SelectedPlace } from "@/components/PlaceAutocomplete";
import type { SpotCategory } from "@/types/spot";

const CATEGORY_LABEL: Record<SpotCategory, string> = {
  restaurant: "飲食店",
  cafe: "カフェ・喫茶",
  camping: "キャンプ場・アウトドア",
  sightseeing: "観光・おでかけ",
  other: "その他",
};

const CATEGORIES = Object.entries(CATEGORY_LABEL) as [SpotCategory, string][];

export default function AddPage() {
  const [place, setPlace] = useState<SelectedPlace | null>(null);
  const [category, setCategory] = useState<SpotCategory>("other");
  const [memo, setMemo] = useState("");
  const [priority, setPriority] = useState<1 | 2 | 3>(2);

  function handleSelect(selected: SelectedPlace) {
    setPlace(selected);
    setCategory(selected.suggestedCategory);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!place) return;
    // TODO: Firestoreへの保存を実装
    console.log({ ...place, category, memo, priority });
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-xl font-bold text-gray-800">場所を登録</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            場所を検索
          </label>
          <PlaceAutocomplete onSelect={handleSelect} />
        </div>

        {place && (
          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <p className="font-medium text-gray-800">{place.name}</p>
            <p className="mt-0.5">{place.address}</p>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            カテゴリ
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SpotCategory)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-blue-500"
          >
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
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
                    ? "bg-yellow-400 font-bold shadow"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {"★".repeat(p)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            メモ
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="なぜ行きたいか、など"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={!place}
          className="rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow disabled:opacity-40"
        >
          保存する
        </button>
      </form>
    </main>
  );
}
