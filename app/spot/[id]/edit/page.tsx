"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import type { SelectedPlace } from "@/components/PlaceAutocomplete";
import type { SpotCategory } from "@/types/spot";
import { getSpot, updateSpot } from "@/lib/firestore";

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

const CATEGORIES = Object.entries(CATEGORY_LABEL) as [SpotCategory, string][];

type PlaceInfo = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId: string;
};

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedPlace, setSavedPlace] = useState<PlaceInfo | null>(null);
  const [newPlace, setNewPlace] = useState<SelectedPlace | null>(null);
  const [changingPlace, setChangingPlace] = useState(false);

  const [category, setCategory] = useState<SpotCategory>("other");
  const [memo, setMemo] = useState("");
  const [priority, setPriority] = useState<1 | 2 | 3>(2);

  useEffect(() => {
    getSpot(id).then((spot) => {
      if (spot) {
        setSavedPlace({
          name: spot.name,
          address: spot.address,
          lat: spot.lat,
          lng: spot.lng,
          placeId: spot.placeId,
        });
        setCategory(spot.category);
        setMemo(spot.memo ?? "");
        setPriority(spot.priority);
      }
      setLoading(false);
    });
  }, [id]);

  function handlePlaceSelect(place: SelectedPlace) {
    setNewPlace(place);
    setCategory(place.suggestedCategory);
    setChangingPlace(false);
  }

  const activePlace: PlaceInfo | null = newPlace ?? savedPlace;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activePlace) return;
    setSaving(true);
    setError(null);
    try {
      await updateSpot(id, {
        name: activePlace.name,
        address: activePlace.address,
        lat: activePlace.lat,
        lng: activePlace.lng,
        placeId: activePlace.placeId,
        category,
        memo,
        priority,
      });
      router.push(`/spot/${id}`);
    } catch {
      setError("保存に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
        <p className="py-12 text-center text-sm text-gray-400">読み込み中...</p>
      </main>
    );
  }

  if (!savedPlace) {
    return (
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
        <p className="py-12 text-center text-sm text-gray-400">スポットが見つかりません</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 pt-8 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/spot/${id}`} className="text-gray-500 dark:text-gray-400">
          ← 戻る
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">スポットを編集</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            場所
          </label>
          {changingPlace ? (
            <PlaceAutocomplete onSelect={handlePlaceSelect} />
          ) : (
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium text-gray-800 dark:text-gray-100">{activePlace?.name}</p>
              <p className="mt-0.5">{activePlace?.address}</p>
              <button
                type="button"
                onClick={() => setChangingPlace(true)}
                className="mt-2 text-xs text-blue-500 dark:text-blue-400"
              >
                場所を変更する
              </button>
            </div>
          )}
        </div>

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
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow disabled:opacity-40"
        >
          {saving ? "保存中..." : "変更を保存"}
        </button>
      </form>
    </main>
  );
}
