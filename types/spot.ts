import type { Timestamp } from "firebase/firestore";

export type SpotCategory =
  | "restaurant"
  | "cafe"
  | "camping"
  | "sightseeing"
  | "other";

export type Spot = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId: string;
  category: SpotCategory;
  memo: string;
  priority: 1 | 2 | 3;
  status: "unvisited" | "visited";
  createdAt: Timestamp;
  listId: string;
};

export type SpotList = {
  id: string;
  name: string;
  createdAt: Timestamp;
};
