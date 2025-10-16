/**
 * Firebase Configuration Utilities
 *
 * Provides functions for returning Firebase configuration.
 */

export interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
}

/**
 * Returns the Firebase configuration
 */
export function getFirebaseConfig(): FirebaseConfig {
  return {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

/**
 * Returns the Firebase Admin configuration
 * Used for server-side Firebase Admin SDK initialization
 */
export function getFirebaseAdminConfig() {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
}

/**
 * Validates that the required Firebase configuration is present
 * Throws an error with helpful message if configuration is missing
 */
export function validateFirebaseConfig(config: FirebaseConfig): void {
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missingFields.join(', ')}. ` +
      `Please check your environment variables.`
    );
  }
}

/**
 * Validates that the required Firebase Admin configuration is present
 * Throws an error with helpful message if configuration is missing
 */
export function validateFirebaseAdminConfig(config: {
  projectId: string | undefined;
  clientEmail: string | undefined;
  privateKey: string | undefined;
}): void {
  if (!config.projectId || !config.clientEmail || !config.privateKey) {
    const missing: string[] = [];
    if (!config.projectId) missing.push('projectId');
    if (!config.clientEmail) missing.push('clientEmail');
    if (!config.privateKey) missing.push('privateKey');

    throw new Error(
      `Missing required Firebase Admin configuration: ${missing.join(', ')}. ` +
      `Please check your environment variables.`
    );
  }
}
