import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseConfig, validateFirebaseConfig } from "./config/demo";

function createFirebaseApp() {
  const firebaseConfig = getFirebaseConfig();
  validateFirebaseConfig(firebaseConfig);
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
