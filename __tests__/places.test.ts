import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { fetchPredictions, fetchPlaceDetail } from "@/lib/places";

const mockGetPlacePredictions = jest.fn();
const mockGetDetails = jest.fn();

const mockPlacesLib = {
  AutocompleteService: jest.fn().mockImplementation(() => ({
    getPlacePredictions: mockGetPlacePredictions,
  })),
  PlacesService: jest.fn().mockImplementation(() => ({
    getDetails: mockGetDetails,
  })),
  PlacesServiceStatus: {
    OK: "OK",
    ZERO_RESULTS: "ZERO_RESULTS",
  },
};

// google.maps.places.PlacesServiceStatus をグローバルに設定
Object.defineProperty(global, "google", {
  value: {
    maps: {
      places: {
        PlacesServiceStatus: { OK: "OK", ZERO_RESULTS: "ZERO_RESULTS" },
      },
    },
  },
  writable: true,
  configurable: true,
});

// document.createElement をモック（PlacesServiceが要求するDOMのため）
Object.defineProperty(global, "document", {
  value: { createElement: jest.fn().mockReturnValue({}) },
  writable: true,
  configurable: true,
});

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  (importLibrary as jest.Mock).mockResolvedValue(mockPlacesLib);
});

describe("fetchPredictions", () => {
  it("空文字列の場合は空配列を返す", async () => {
    const result = await fetchPredictions("");
    expect(result).toEqual([]);
    expect(mockGetPlacePredictions).not.toHaveBeenCalled();
  });

  it("スペースのみの場合は空配列を返す", async () => {
    const result = await fetchPredictions("   ");
    expect(result).toEqual([]);
  });

  it("予測候補を正しくマッピングして返す", async () => {
    mockGetPlacePredictions.mockImplementation((_req: unknown, cb: Function) =>
      cb(
        [
          {
            place_id: "p1",
            structured_formatting: {
              main_text: "渋谷スクランブル交差点",
              secondary_text: "東京都渋谷区",
            },
          },
          {
            place_id: "p2",
            structured_formatting: {
              main_text: "渋谷駅",
              secondary_text: "東京都渋谷区道玄坂",
            },
          },
        ],
        "OK"
      )
    );

    const result = await fetchPredictions("渋谷");
    expect(result).toEqual([
      { placeId: "p1", mainText: "渋谷スクランブル交差点", secondaryText: "東京都渋谷区" },
      { placeId: "p2", mainText: "渋谷駅", secondaryText: "東京都渋谷区道玄坂" },
    ]);
  });

  it("secondary_text が undefined でも空文字を返す", async () => {
    mockGetPlacePredictions.mockImplementation((_req: unknown, cb: Function) =>
      cb(
        [
          {
            place_id: "p1",
            structured_formatting: { main_text: "場所A", secondary_text: undefined },
          },
        ],
        "OK"
      )
    );
    const result = await fetchPredictions("場所");
    expect(result[0].secondaryText).toBe("");
  });

  it("Places API がエラーを返した場合は空配列", async () => {
    mockGetPlacePredictions.mockImplementation((_req: unknown, cb: Function) =>
      cb(null, "ZERO_RESULTS")
    );
    const result = await fetchPredictions("存在しない場所xyz");
    expect(result).toEqual([]);
  });

  it("locationBias を渡すと center と radius 50000 が設定される", async () => {
    mockGetPlacePredictions.mockImplementation((_req: unknown, cb: Function) =>
      cb([], "OK")
    );
    const bias = { lat: 35.6762, lng: 139.6503 };
    await fetchPredictions("カフェ", bias);
    expect(mockGetPlacePredictions).toHaveBeenCalledWith(
      expect.objectContaining({
        locationBias: { center: bias, radius: 50000 },
      }),
      expect.any(Function)
    );
  });

  it("locationBias なしでも動作する", async () => {
    mockGetPlacePredictions.mockImplementation((_req: unknown, cb: Function) =>
      cb([], "OK")
    );
    await fetchPredictions("カフェ");
    expect(mockGetPlacePredictions).toHaveBeenCalledWith(
      expect.not.objectContaining({ locationBias: expect.anything() }),
      expect.any(Function)
    );
  });

  it("setOptions が初回呼び出し時に一度だけ呼ばれる", async () => {
    // initialized フラグがすでに true なので setOptions は呼ばれない（べき等性の確認）
    mockGetPlacePredictions.mockImplementation((_req: unknown, cb: Function) =>
      cb([], "OK")
    );
    const callsBefore = (setOptions as jest.Mock).mock.calls.length;
    await fetchPredictions("test1");
    await fetchPredictions("test2");
    // 2回呼んでも setOptions の呼び出し数は増えない
    expect((setOptions as jest.Mock).mock.calls.length).toBe(callsBefore);
  });
});

describe("fetchPlaceDetail", () => {
  it("Place 詳細を正しくマッピングして返す", async () => {
    mockGetDetails.mockImplementation((_req: unknown, cb: Function) =>
      cb(
        {
          name: "渋谷スクランブル交差点",
          formatted_address: "日本、〒150-0002 東京都渋谷区道玄坂",
          geometry: { location: { lat: () => 35.6595, lng: () => 139.7004 } },
          types: ["tourist_attraction", "point_of_interest"],
        },
        "OK"
      )
    );

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

  it("Places API がエラーを返した場合は reject する", async () => {
    mockGetDetails.mockImplementation((_req: unknown, cb: Function) =>
      cb(null, "NOT_FOUND")
    );
    await expect(fetchPlaceDetail("invalid")).rejects.toThrow(
      "PlacesService error: NOT_FOUND"
    );
  });

  it("name が未定義の場合は空文字を返す", async () => {
    mockGetDetails.mockImplementation((_req: unknown, cb: Function) =>
      cb(
        {
          name: undefined,
          formatted_address: "住所",
          geometry: { location: { lat: () => 0, lng: () => 0 } },
          types: [],
        },
        "OK"
      )
    );
    const result = await fetchPlaceDetail("p1");
    expect(result.name).toBe("");
  });

  it("formatted_address が未定義の場合は空文字を返す", async () => {
    mockGetDetails.mockImplementation((_req: unknown, cb: Function) =>
      cb(
        {
          name: "場所",
          formatted_address: undefined,
          geometry: { location: { lat: () => 1, lng: () => 2 } },
          types: ["other"],
        },
        "OK"
      )
    );
    const result = await fetchPlaceDetail("p1");
    expect(result.address).toBe("");
  });

  it("types が未定義の場合は空配列を返す", async () => {
    mockGetDetails.mockImplementation((_req: unknown, cb: Function) =>
      cb(
        {
          name: "場所",
          formatted_address: "住所",
          geometry: { location: { lat: () => 1, lng: () => 2 } },
          types: undefined,
        },
        "OK"
      )
    );
    const result = await fetchPlaceDetail("p1");
    expect(result.types).toEqual([]);
  });

  it("geometry が未定義の場合は lat/lng が 0", async () => {
    mockGetDetails.mockImplementation((_req: unknown, cb: Function) =>
      cb(
        {
          name: "場所",
          formatted_address: "住所",
          geometry: undefined,
          types: [],
        },
        "OK"
      )
    );
    const result = await fetchPlaceDetail("p1");
    expect(result.lat).toBe(0);
    expect(result.lng).toBe(0);
  });

  it("name・formatted_address・types が全て未定義でもクラッシュしない", async () => {
    mockGetDetails.mockImplementation((_req: unknown, cb: Function) =>
      cb(
        {
          name: undefined,
          formatted_address: undefined,
          geometry: { location: { lat: () => 1, lng: () => 2 } },
          types: undefined,
        },
        "OK"
      )
    );
    const result = await fetchPlaceDetail("p1");
    expect(result.name).toBe("");
    expect(result.address).toBe("");
    expect(result.types).toEqual([]);
  });
});
