import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBPtGR5-x08DunnTe_SV2ASCP0Pi4E0e6w",
  authDomain: "noirframe-8938d.firebaseapp.com",
  projectId: "noirframe-8938d",
  storageBucket: "noirframe-8938d.firebasestorage.app",
  messagingSenderId: "232790563551",
  appId: "1:232790563551:web:b099f6a5686902d513a76a",
  measurementId: "G-SEQ4F4KFTJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;