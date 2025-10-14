/**
 * Demo Mode Configuration Utilities
 *
 * Provides functions for detecting demo mode and returning appropriate
 * Firebase configuration based on the current environment.
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
 * Detects if the application is running in demo mode
 * Demo mode is enabled when NEXT_PUBLIC_DEMO_MODE is set to 'true'
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

/**
 * Returns the appropriate Firebase configuration based on the current mode
 * In demo mode, returns demo Firebase config
 * In production mode, returns production Firebase config
 */
export function getFirebaseConfig(): FirebaseConfig {
  if (isDemoMode()) {
    return {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_DEMO_PROJECT_ID,
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_DEMO_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_DEMO_AUTH_DOMAIN,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_DEMO_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_DEMO_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_DEMO_APP_ID,
    };
  }

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
 * Returns the appropriate Firebase Admin configuration based on the current mode
 * Used for server-side Firebase Admin SDK initialization
 */
export function getFirebaseAdminConfig() {
  if (isDemoMode()) {
    return {
      projectId: process.env.FIREBASE_DEMO_PROJECT_ID,
      clientEmail: process.env.FIREBASE_DEMO_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_DEMO_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
  }

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

  const mode = isDemoMode() ? 'demo' : 'production';
  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Firebase ${mode} configuration: ${missingFields.join(', ')}. ` +
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
  const mode = isDemoMode() ? 'demo' : 'production';

  if (!config.projectId || !config.clientEmail || !config.privateKey) {
    const missing: string[] = [];
    if (!config.projectId) missing.push('projectId');
    if (!config.clientEmail) missing.push('clientEmail');
    if (!config.privateKey) missing.push('privateKey');

    throw new Error(
      `Missing required Firebase Admin ${mode} configuration: ${missing.join(', ')}. ` +
      `Please check your environment variables.`
    );
  }
}
