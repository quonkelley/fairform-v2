import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";

export class StorageRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageRepositoryError";
  }
}

/**
 * Upload a file to Firebase Storage
 * @param path - Storage path (e.g., "forms/completed/userId/caseId/form.pdf")
 * @param file - File or Blob to upload
 * @returns Download URL for the uploaded file
 */
export async function uploadFile(path: string, file: File | Blob): Promise<string> {
  try {
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, path);

    const uploadSource =
      typeof Blob !== "undefined" && file instanceof Blob
        ? new Uint8Array(await file.arrayBuffer())
        : file;

    const metadata =
      typeof File !== "undefined" && file instanceof File
        ? {
            contentType: file.type,
            customMetadata: { fileName: file.name },
          }
        : undefined;

    const snapshot = await uploadBytes(storageRef, uploadSource, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  } catch (error) {
    console.error("Failed to upload file", { path, error });
    throw new StorageRepositoryError("Unable to upload file");
  }
}

/**
 * Get download URL for a file in Firebase Storage
 * @param path - Storage path
 * @returns Download URL
 */
export async function getDownloadUrl(path: string): Promise<string> {
  try {
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, path);

    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Failed to get download URL", { path, error });
    throw new StorageRepositoryError("Unable to get download URL");
  }
}

/**
 * Delete a file from Firebase Storage
 * @param path - Storage path
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, path);

    await deleteObject(storageRef);
  } catch (error) {
    console.error("Failed to delete file", { path, error });
    throw new StorageRepositoryError("Unable to delete file");
  }
}

/**
 * Get storage path for a form template
 * @param jurisdiction - Jurisdiction (e.g., "marion")
 * @param formType - Form type (e.g., "appearance")
 * @returns Storage path
 */
export function getTemplatePath(jurisdiction: string, formType: string): string {
  return `forms/templates/${jurisdiction}/${formType}-template.pdf`;
}

/**
 * Get storage path for a completed form
 * @param userId - User ID
 * @param caseId - Case ID
 * @param formId - Form ID
 * @returns Storage path
 */
export function getCompletedFormPath(userId: string, caseId: string, formId: string): string {
  const timestamp = Date.now();
  return `forms/completed/${userId}/${caseId}/${formId}_${timestamp}.pdf`;
}
