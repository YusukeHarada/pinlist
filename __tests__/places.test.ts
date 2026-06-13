import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { fetchPredictions, fetchPlaceDetail } from "@/lib/places";

const mockFetchAutocompleteSuggestions = jest.fn();
const mockFetchFields = jest.fn();

const mockAutocompleteSessionToken = jest.fn();
const mockPlace = jest.fn();

const mockPlacesLib = {
  AutocompleteSessionToken: mockAutocompleteSessionToken,
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: mockFetchAutocompleteSuggestions,
  },
  Place: mockPlace,
};

// google.maps.Circle をグローバルに設定
Object.defineProperty(global, "google", {
  value: {
    maps: {
      Circle: jest.fn().mockImplementation((opts) => opts),
    },
  },
  writable: true,
  configurable: true,
});

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  (importLibrary as jest.Mock).mockResolvedValue(mockPlacesLib);
  mockAutocompleteSessionToken.mockImplementation(() => ({}));
});

describe("fetchPredictions", () => {
  it("空文字列の場合は空配列を返す", async () => {
    const result = await fetchPredictions("");
    expect(result).toEqual([]);
    expect(mockFetchAutocompleteSuggestions).not.toHaveBeenCalled();
  });

  it("スペースのみの場合は空配列を返す", async () => {
    const result = await fetchPredictions("   ");
    expect(result).toEqual([]);
  });

  it("予測候補を正しくマッピングして返す", async () => {
    mockFetchAutocompleteSuggestions.mockResolvedValue({
      suggestions: [
        {
          placePrediction: {
            placeId: "p1",
            mainText: { toString: () => "渋谷スクランブル交差点" },
            secondaryText: { toString: () => "東京都渋谷区" },
          },
        },
        {
          placePrediction: {
            placeId: "p2",
            mainText: { toString: () => "渋谷駅" },
            secondaryText: { toString: () => "東京都渋谷区道玄坂" },
          },
        },
      ],
    });

    const result = await fetchPredictions("渋谷");
    expect(result).toEqual([
      { placeId: "p1", mainText: "渋谷スクランブル交差点", secondaryText: "東京都渋谷区" },
      { placeId: "p2", mainText: "渋谷駅", secondaryText: "東京都渋谷区道玄坂" },
    ]);
  });

  it("secondaryText が undefined でも空文字を返す", async () => {
    mockFetchAutocompleteSuggestions.mockResolvedValue({
      suggestions: [
        {
          placePrediction: {
            placeId: "p1",
            mainText: { toString: () => "場所A" },
            secondaryText: undefined,
          },
        },
      ],
    });
    const result = await fetchPredictions("場所");
    expect(result[0].secondaryText).toBe("");
  });

  it("placePrediction がない候補は除外される", async () => {
    mockFetchAutocompleteSuggestions.mockResolvedValue({
      suggestions: [{ placePrediction: null }],
    });
    const result = await fetchPredictions("場所");
    expect(result).toEqual([]);
  });

  it("locationBias を渡すと locationBias が設定される", async () => {
    mockFetchAutocompleteSuggestions.mockResolvedValue({ suggestions: [] });
    const bias = { lat: 35.6762, lng: 139.6503 };
    await fetchPredictions("カフェ", bias);
    expect(mockFetchAutocompleteSuggestions).toHaveBeenCalledWith(
      expect.objectContaining({ locationBias: expect.anything() })
    );
  });

  it("locationBias なしでも動作する", async () => {
    mockFetchAutocompleteSuggestions.mockResolvedValue({ suggestions: [] });
    await fetchPredictions("カフェ");
    expect(mockFetchAutocompleteSuggestions).toHaveBeenCalledWith(
      expect.not.objectContaining({ locationBias: expect.anything() })
    );
  });

  it("setOptions が初回呼び出し時に一度だけ呼ばれる", async () => {
    mockFetchAutocompleteSuggestions.mockResolvedValue({ suggestions: [] });
    const callsBefore = (setOptions as jest.Mock).mock.calls.length;
    await fetchPredictions("test1");
    await fetchPredictions("test2");
    expect((setOptions as jest.Mock).mock.calls.length).toBe(callsBefore);
  });
});

describe("fetchPlaceDetail", () => {
  function makePlaceInstance(overrides: Record<string, unknown> = {}) {
    return {
      fetchFields: mockFetchFields,
      displayName: "渋谷スクランブル交差点",
      formattedAddress: "日本、〒150-0002 東京都渋谷区道玄坂",
      location: { lat: () => 35.6595, lng: () => 139.7004 },
      types: ["tourist_attraction", "point_of_interest"],
      ...overrides,
    };
  }

  it("Place 詳細を正しくマッピングして返す", async () => {
    mockPlace.mockImplementation(() => makePlaceInstance());
    mockFetchFields.mockResolvedValue(undefined);

    const result = await fetchPlaceDetail("p1");
    expect(result).toEqual({
      name: "渋谷スクランブル交差点",
      address: "日本、〒150-0002 東京都渋谷区道玄坂",
      lat: 35.6595,
      lng: 139.7004,
      placeId: "p1",
      types: ["tourist_attraction", "point_of_interest"],
    });
  });

  it("fetchFields がエラーを投げた場合は reject する", async () => {
    mockPlace.mockImplementation(() => makePlaceInstance());
    mockFetchFields.mockRejectedValue(new Error("NOT_FOUND"));
    await expect(fetchPlaceDetail("invalid")).rejects.toThrow("NOT_FOUND");
  });

  it("displayName が未定義の場合は空文字を返す", async () => {
    mockPlace.mockImplementation(() => makePlaceInstance({ displayName: undefined }));
    mockFetchFields.mockResolvedValue(undefined);
    const result = await fetchPlaceDetail("p1");
    expect(result.name).toBe("");
  });

  it("formattedAddress が未定義の場合は空文字を返す", async () => {
    mockPlace.mockImplementation(() => makePlaceInstance({ formattedAddress: undefined }));
    mockFetchFields.mockResolvedValue(undefined);
    const result = await fetchPlaceDetail("p1");
    expect(result.address).toBe("");
  });

  it("types が未定義の場合は空配列を返す", async () => {
    mockPlace.mockImplementation(() => makePlaceInstance({ types: undefined }));
    mockFetchFields.mockResolvedValue(undefined);
    const result = await fetchPlaceDetail("p1");
    expect(result.types).toEqual([]);
  });

  it("location が未定義の場合は lat/lng が 0", async () => {
    mockPlace.mockImplementation(() => makePlaceInstance({ location: undefined }));
    mockFetchFields.mockResolvedValue(undefined);
    const result = await fetchPlaceDetail("p1");
    expect(result.lat).toBe(0);
    expect(result.lng).toBe(0);
  });

  it("displayName・formattedAddress・types が全て未定義でもクラッシュしない", async () => {
    mockPlace.mockImplementation(() =>
      makePlaceInstance({ displayName: undefined, formattedAddress: undefined, types: undefined })
    );
    mockFetchFields.mockResolvedValue(undefined);
    const result = await fetchPlaceDetail("p1");
    expect(result.name).toBe("");
    expect(result.address).toBe("");
    expect(result.types).toEqual([]);
  });
});
