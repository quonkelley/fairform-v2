import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getFirebaseAdminConfig, validateFirebaseAdminConfig } from "./config/demo";

let cachedApp: App | null = null;

function createFirebaseAdminApp(): App {
  const serviceAccount = getFirebaseAdminConfig();
  validateFirebaseAdminConfig(serviceAccount);

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
}

export function getFirebaseAdminApp(): App {
  if (cachedApp) {
    return cachedApp;
  }

  if (getApps().length > 0) {
    cachedApp = getApps()[0]!;
    return cachedApp;
  }

  cachedApp = createFirebaseAdminApp();
  return cachedApp;
}

export function getAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}
