import { NextRequest } from "next/server";

import { getAdminAuth } from "@/lib/firebase-admin";

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
    
    console.log("🔍 Server: Auth header received:", authHeader ? "Present" : "Missing");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Server: No valid Bearer token");
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    if (!token) {
      console.log("❌ Server: Empty token after Bearer");
      return null;
    }

    console.log("🔑 Server: Token received, length:", token.length);
    console.log("🔑 Server: Token preview:", token.substring(0, 20) + "...");
    
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    console.log("✅ Server: Token verified for user:", decodedToken.uid);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      emailVerified: decodedToken.email_verified || false,
    };
  } catch (error) {
    console.error("❌ Server: Failed to verify auth token:", error);
    console.error("❌ Server: Error details:", error instanceof Error ? error.message : "Unknown error");
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
