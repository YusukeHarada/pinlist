import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let initialized = false;

async function init() {
  if (initialized) return;
  setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY! });
  initialized = true;
}

export type AutocompletePrediction = {
  placeId: string;
  mainText: string;
  secondaryText: string;
};

export async function fetchPredictions(
  input: string,
  locationBias?: google.maps.LatLngLiteral
): Promise<AutocompletePrediction[]> {
  if (!input.trim()) return [];
  await init();
  const { AutocompleteSuggestion, AutocompleteSessionToken } =
    await importLibrary("places") as google.maps.PlacesLibrary;

  const token = new AutocompleteSessionToken();
  const request: google.maps.places.AutocompleteSuggestionRequest = {
    input,
    sessionToken: token,
  };
  if (locationBias) {
    request.locationBias = new google.maps.Circle({
      center: locationBias,
      radius: 50000,
    });
  }

  const { suggestions } =
    await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

  return suggestions
    .filter((s) => s.placePrediction)
    .map((s) => {
      const p = s.placePrediction!;
      return {
        placeId: p.placeId,
        mainText: p.mainText.toString(),
        secondaryText: p.secondaryText?.toString() ?? "",
      };
    });
}

export type PlaceDetail = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId: string;
  types: string[];
};

export async function fetchPlaceDetail(placeId: string): Promise<PlaceDetail> {
  await init();
  const { Place } = await importLibrary("places") as google.maps.PlacesLibrary;
  const place = new Place({ id: placeId });
  await place.fetchFields({
    fields: ["displayName", "formattedAddress", "location", "types"],
  });
  return {
    name: place.displayName ?? "",
    address: place.formattedAddress ?? "",
    lat: place.location?.lat() ?? 0,
    lng: place.location?.lng() ?? 0,
    placeId,
    types: place.types ?? [],
  };
}
