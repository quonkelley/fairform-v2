import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function ensureConfig(key: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing Firebase configuration for ${key}`);
  }
  return value;
}

function createFirebaseApp() {
  Object.entries(firebaseConfig).forEach(([key, value]) =>
    ensureConfig(key, value),
  );
  return initializeApp(firebaseConfig);
}

const firebaseApp: FirebaseApp = !getApps().length ? createFirebaseApp() : getApp();

let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseAuth(): Auth {
  if (authInstance) {
    return authInstance;
  }

  const auth = getAuth(firebaseApp);
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Failed to set Firebase auth persistence", error);
  });
  auth.languageCode = "en";

  authInstance = auth;
  return authInstance;
}

export function getFirestoreDb(): Firestore {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  firestoreInstance = getFirestore(firebaseApp);
  return firestoreInstance;
}
