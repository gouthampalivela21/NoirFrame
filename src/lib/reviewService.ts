import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "reviews";

export function subscribeToReviews(callback) {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(reviews);
  });
}

export async function addReview(data) {
  await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateReview(id, data) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteReview(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}