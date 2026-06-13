import {
  collection,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Spot, SpotCategory } from "@/types/spot";

type AddSpotInput = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId: string;
  category: SpotCategory;
  memo: string;
  priority: 1 | 2 | 3;
  listId: string;
};

export class DuplicateSpotError extends Error {
  constructor() {
    super("この場所はすでに登録済みです");
    this.name = "DuplicateSpotError";
  }
}

export async function addSpot(input: AddSpotInput): Promise<string> {
  const existing = await getDocs(
    query(
      collection(db, "spots"),
      where("placeId", "==", input.placeId),
      where("listId", "==", input.listId)
    )
  );
  if (!existing.empty) throw new DuplicateSpotError();

  const docRef = await addDoc(collection(db, "spots"), {
    ...input,
    status: "unvisited",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getSpot(id: string): Promise<Spot | null> {
  const snap = await getDoc(doc(db, "spots", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Spot;
}

export async function markVisited(id: string): Promise<void> {
  await updateDoc(doc(db, "spots", id), { status: "visited" });
}

export async function markUnvisited(id: string): Promise<void> {
  await updateDoc(doc(db, "spots", id), { status: "unvisited" });
}

export async function deleteSpot(id: string): Promise<void> {
  await deleteDoc(doc(db, "spots", id));
}
