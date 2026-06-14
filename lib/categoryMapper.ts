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

const GOODS_TYPES = new Set([
  "home_goods_store",
  "gift_shop",
  "furniture_store",
  "clothing_store",
  "department_store",
]);

const PLANTS_TYPES = new Set(["florist"]);

const BOOKSTORE_TYPES = new Set(["book_store"]);

const ACCOMMODATION_TYPES = new Set(["lodging"]);

export function inferCategory(placeTypes: string[]): SpotCategory {
  for (const type of placeTypes) {
    if (RESTAURANT_TYPES.has(type)) return "restaurant";
    if (CAFE_TYPES.has(type)) return "cafe";
    if (CAMPING_TYPES.has(type)) return "camping";
    if (SIGHTSEEING_TYPES.has(type)) return "sightseeing";
    if (GOODS_TYPES.has(type)) return "goods";
    if (PLANTS_TYPES.has(type)) return "plants";
    if (BOOKSTORE_TYPES.has(type)) return "bookstore";
    if (ACCOMMODATION_TYPES.has(type)) return "accommodation";
  }
  return "other";
}
