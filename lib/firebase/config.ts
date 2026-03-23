import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase for Client-side
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

const app = getApps().length > 0 
  ? getApp() 
  : (isConfigValid ? initializeApp(firebaseConfig) : null);

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Diagnostics
if (typeof window !== 'undefined') {
  if (!isConfigValid) {
    console.warn("Firebase: Configuration missing or invalid. Check environment variables.");
  } else if (app) {
    console.log("Firebase: Initialized successfully on", window.location.hostname);
  }
}

export { app, auth, db };
