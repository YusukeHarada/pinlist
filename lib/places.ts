import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let initialized = false;
let placesLib: google.maps.PlacesLibrary | null = null;

async function init() {
  if (initialized) return;
  setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY! });
  initialized = true;
}

async function getPlacesLib(): Promise<google.maps.PlacesLibrary> {
  if (placesLib) return placesLib;
  await init();
  placesLib = (await importLibrary("places")) as google.maps.PlacesLibrary;
  return placesLib;
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
  const { AutocompleteService } = await getPlacesLib();
  const service = new AutocompleteService();
  return new Promise((resolve) => {
    const request: google.maps.places.AutocompletionRequest = { input };
    if (locationBias) {
      request.locationBias = {
        center: locationBias,
        radius: 50000,
      } as google.maps.places.LocationBias;
    }
    service.getPlacePredictions(request, (predictions, status) => {
      if (
        status !== google.maps.places.PlacesServiceStatus.OK ||
        !predictions
      ) {
        resolve([]);
        return;
      }
      resolve(
        predictions.map((p) => ({
          placeId: p.place_id,
          mainText: p.structured_formatting.main_text,
          secondaryText: p.structured_formatting.secondary_text ?? "",
        }))
      );
    });
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
  const { PlacesService } = await getPlacesLib();
  const div = document.createElement("div");
  const service = new PlacesService(div);
  return new Promise((resolve, reject) => {
    service.getDetails(
      { placeId, fields: ["name", "formatted_address", "geometry", "types"] },
      (result, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !result) {
          reject(new Error(`PlacesService error: ${status}`));
          return;
        }
        resolve({
          name: result.name ?? "",
          address: result.formatted_address ?? "",
          lat: result.geometry?.location?.lat() ?? 0,
          lng: result.geometry?.location?.lng() ?? 0,
          placeId,
          types: result.types ?? [],
        });
      }
    );
  });
}
