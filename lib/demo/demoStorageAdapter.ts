/**
 * Demo mode storage adapter
 * Simulates Firebase Storage operations without making real API calls
 * All data is stored in-memory and cleared on page reload
 */

const demoStorage = new Map<string, Blob>();

export class DemoStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoStorageError";
  }
}

/**
 * Upload a file to demo storage (in-memory)
 * @param path - Storage path
 * @param file - File or Blob to upload
 * @returns Demo download URL
 */
export async function uploadFile(path: string, file: File | Blob): Promise<string> {
  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Store in memory
  demoStorage.set(path, file);

  // Return demo URL
  return `/demo/storage/${path}`;
}

/**
 * Get download URL for a demo file
 * @param path - Storage path
 * @returns Download URL (blob URL or public path)
 */
export async function getDownloadUrl(path: string): Promise<string> {
  // Check if it's a template (public file)
  if (path.startsWith("forms/templates/")) {
    const fileName = path.split("/").pop();
    return `/demo/forms/${fileName}`;
  }

  // Check in-memory storage
  const blob = demoStorage.get(path);
  if (!blob) {
    throw new DemoStorageError(`File not found in demo storage: ${path}`);
  }

  // Create blob URL
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}

/**
 * Delete a file from demo storage
 * @param path - Storage path
 */
export async function deleteFile(path: string): Promise<void> {
  const blob = demoStorage.get(path);
  if (!blob) {
    throw new DemoStorageError(`File not found in demo storage: ${path}`);
  }

  demoStorage.delete(path);
}

/**
 * Clear all demo storage (called on demo reset)
 */
export function clearDemoStorage(): void {
  // Clear all stored blobs
  // Note: Blob URLs are created on-demand in getDownloadUrl,
  // so no URL cleanup needed here
  demoStorage.clear();
}

/**
 * Get all stored file paths (for debugging)
 */
export function getStoredPaths(): string[] {
  return Array.from(demoStorage.keys());
}

/**
 * Check if a file exists in demo storage
 */
export function hasFile(path: string): boolean {
  return demoStorage.has(path);
}
