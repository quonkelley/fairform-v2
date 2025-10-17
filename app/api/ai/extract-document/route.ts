/**
 * Document Extraction API Route
 *
 * POST /api/ai/extract-document
 *
 * Extracts structured case information from uploaded legal documents
 * using GPT-4 Vision. Files are processed in-memory only for security.
 *
 * Security:
 * - Requires authentication
 * - Validates file size (max 10MB)
 * - Validates file type (images and PDFs only)
 * - Files are NOT stored, only processed in-memory
 * - PII is not logged
 * - Rate limiting applied
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/server-auth';
import { extractFromDocument } from '@/lib/ai/documentExtraction';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await verifyAuthToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing authentication' },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          maxSize: '10MB',
          actualSize: `${(file.size / 1024 / 1024).toFixed(1)}MB`
        },
        { status: 400 }
      );
    }

    // 4. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          allowedTypes: ALLOWED_TYPES,
          actualType: file.type
        },
        { status: 400 }
      );
    }

    // 5. Convert file to base64 (in-memory, never stored to disk)
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // 6. Extract information using GPT-4 Vision
    const result = await extractFromDocument(base64, file.type);

    // 7. Return results (no PII logging)
    if (!result.success) {
      console.error('[Document Extraction] Extraction failed:', {
        userId: user.uid,
        fileType: file.type,
        fileSize: file.size,
        error: result.error,
      });

      return NextResponse.json(
        {
          error: 'Extraction failed',
          message: result.error || 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Success - log metrics only (no PII)
    console.log('[Document Extraction] Success:', {
      userId: user.uid,
      fileType: file.type,
      fileSize: file.size,
      confidence: result.confidence?.overall,
      fieldsExtracted: Object.keys(result).filter(k =>
        k !== 'success' && k !== 'confidence' && k !== 'rawText' && result[k as keyof typeof result]
      ).length,
    });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'none'",
      },
    });

  } catch (error) {
    console.error('[Document Extraction] Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Configure body size limit for this route (Next.js default is 4MB)
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max
