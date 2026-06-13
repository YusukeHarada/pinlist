import type { SpotCategory } from "@/types/spot";

const RESTAURANT_TYPES = new Set([
  "restaurant",
  "food",
  "bar",
  "bakery",
  "meal_takeaway",
  "meal_delivery",
]);

const CAFE_TYPES = new Set(["cafe", "coffee_shop"]);

const CAMPING_TYPES = new Set([
  "campground",
  "rv_park",
  "park",
  "natural_feature",
]);

const SIGHTSEEING_TYPES = new Set([
  "tourist_attraction",
  "museum",
  "amusement_park",
  "art_gallery",
  "aquarium",
  "zoo",
  "stadium",
  "place_of_worship",
  "landmark",
  "point_of_interest",
]);

export function inferCategory(placeTypes: string[]): SpotCategory {
  for (const type of placeTypes) {
    if (RESTAURANT_TYPES.has(type)) return "restaurant";
    if (CAFE_TYPES.has(type)) return "cafe";
    if (CAMPING_TYPES.has(type)) return "camping";
    if (SIGHTSEEING_TYPES.has(type)) return "sightseeing";
  }
  return "other";
}
