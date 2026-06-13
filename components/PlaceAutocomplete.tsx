"use client";

import { useEffect, useRef, useState } from "react";
import { inferCategory } from "@/lib/categoryMapper";
import { fetchPlaceDetail, fetchPredictions } from "@/lib/places";
import type { AutocompletePrediction } from "@/lib/places";
import type { SpotCategory } from "@/types/spot";

export type SelectedPlace = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId: string;
  suggestedCategory: SpotCategory;
};

type RecentPlace = SelectedPlace;

const STORAGE_KEY = "pinlist_recent_places";
const MAX_RECENT = 5;

function loadRecent(): RecentPlace[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(places: RecentPlace[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
}

function addRecent(place: SelectedPlace) {
  const prev = loadRecent().filter((p) => p.placeId !== place.placeId);
  saveRecent([place, ...prev].slice(0, MAX_RECENT));
}

function removeRecent(placeId: string) {
  saveRecent(loadRecent().filter((p) => p.placeId !== placeId));
}

const CATEGORY_ICON: Record<SpotCategory, string> = {
  restaurant: "🍽️",
  cafe: "☕",
  camping: "⛺",
  sightseeing: "🗺️",
  other: "📍",
};

type Props = {
  onSelect: (place: SelectedPlace) => void;
  placeholder?: string;
};

export default function PlaceAutocomplete({
  onSelect,
  placeholder = "場所を検索...",
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [recentPlaces, setRecentPlaces] = useState<RecentPlace[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Geolocation
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setSuggestions([]);
        setShowRecent(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleInputChange(value: string) {
    setInputValue(value);
    setShowRecent(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await fetchPredictions(
          value,
          userLocation ?? undefined
        );
        setSuggestions(results);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }

  function handleFocus() {
    if (!inputValue.trim()) {
      setRecentPlaces(loadRecent());
      setShowRecent(true);
    }
  }

  async function handleSelect(placeId: string, mainText: string) {
    setSuggestions([]);
    setShowRecent(false);
    setIsLoading(true);
    try {
      const detail = await fetchPlaceDetail(placeId);
      const selected: SelectedPlace = {
        name: detail.name || mainText,
        address: detail.address,
        lat: detail.lat,
        lng: detail.lng,
        placeId: detail.placeId,
        suggestedCategory: inferCategory(detail.types),
      };
      setInputValue(selected.name);
      addRecent(selected);
      onSelect(selected);
    } finally {
      setIsLoading(false);
    }
  }

  function handleRemoveRecent(e: React.MouseEvent, placeId: string) {
    e.stopPropagation();
    removeRecent(placeId);
    setRecentPlaces((prev) => prev.filter((p) => p.placeId !== placeId));
  }

  function handleClear() {
    setInputValue("");
    setSuggestions([]);
    setShowRecent(false);
  }

  const showDropdown =
    (suggestions.length > 0) || (showRecent && recentPlaces.length > 0);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-base shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        {isLoading && (
          <span className="absolute right-3 animate-spin text-gray-400">⏳</span>
        )}
        {!isLoading && inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
            aria-label="クリア"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {showRecent && recentPlaces.length > 0 && (
            <>
              <li className="px-4 py-2 text-xs font-semibold text-gray-400">
                最近選んだ場所
              </li>
              {recentPlaces.map((place) => (
                <li
                  key={place.placeId}
                  onClick={() => handleSelect(place.placeId, place.name)}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-blue-50 active:bg-blue-100"
                >
                  <span className="text-lg">{CATEGORY_ICON[place.suggestedCategory]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-800">{place.name}</p>
                    <p className="truncate text-sm text-gray-500">{place.address}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveRecent(e, place.placeId)}
                    className="ml-1 shrink-0 text-sm text-gray-300 hover:text-red-400"
                    aria-label="履歴から削除"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </>
          )}

          {suggestions.map((pred) => (
            <li
              key={pred.placeId}
              onClick={() => handleSelect(pred.placeId, pred.mainText)}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-blue-50 active:bg-blue-100"
            >
              <span className="text-lg">📍</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-800">{pred.mainText}</p>
                <p className="truncate text-sm text-gray-500">{pred.secondaryText}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
