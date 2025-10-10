import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { NextRequest } from "next/server";

// Initialize Firebase Admin SDK
function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error("Missing Firebase Admin SDK configuration");
  }

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
}

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

/**
 * Verifies Firebase Auth token from request headers and returns user info
 * @param request NextRequest object
 * @returns AuthenticatedUser if valid, null if invalid/missing
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    if (!token) {
      return null;
    }

    const app = getFirebaseAdminApp();
    const auth = getAuth(app);
    
    const decodedToken = await auth.verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      emailVerified: decodedToken.email_verified || false,
    };
  } catch (error) {
    console.error("Failed to verify auth token:", error);
    return null;
  }
}

/**
 * Middleware helper to require authentication for API routes
 * @param request NextRequest object
 * @returns AuthenticatedUser if valid, throws error if invalid
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await verifyAuthToken(request);
  
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  
  return user;
}
