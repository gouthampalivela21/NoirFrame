import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID",
};

// ✅ FIX: prevent duplicate initialization
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const db = getFirestore(app);