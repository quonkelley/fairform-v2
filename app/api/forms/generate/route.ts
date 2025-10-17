import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth/server-auth";
import { getCase } from "@/lib/db/casesRepo";
import { getCompletedFormPath, uploadFile } from "@/lib/db/storageRepo";
import { saveCompletedForm } from "@/lib/db/formsRepo";
import { loadFormTemplate } from "@/lib/forms/formLoader";
import { generatePDF } from "@/lib/forms/pdfGenerator";
import {
  coerceFieldValue,
  validateFormData,
} from "@/lib/forms/validators";
import type { FieldValue, Result } from "@/lib/forms/types";

const GenerateFormRequestSchema = z.object({
  formId: z.string().min(1),
  caseId: z.string().min(1),
  fields: z.record(z.unknown()).default({}),
});

type GenerateFormRequest = z.infer<typeof GenerateFormRequestSchema>;

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const parsed = await parseRequest(request);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: parsed.error,
        },
        { status: 400 }
      );
    }

    const { formId, caseId, fields } = parsed.data;

    const caseRecord = await getCase(caseId);
    if (!caseRecord) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    if (caseRecord.userId !== user.uid) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const templateResult = await loadFormTemplate(formId);
    if (!templateResult.success) {
      return NextResponse.json(
        {
          error: "Template not found",
          message: templateResult.error,
        },
        { status: 404 }
      );
    }

    const template = templateResult.data;
    if (!template.templateUrl) {
      return NextResponse.json(
        {
          error: "Template missing source",
          message: `Form template "${formId}" does not specify a templateUrl`,
        },
        { status: 500 }
      );
    }

    const typedFields = coerceFields(template.fields.map((field) => ({
      id: field.id,
      type: field.type,
    })), fields);

    const validation = validateFormData(template, typedFields);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Form validation failed",
          details: validation.errors,
        },
        { status: 422 }
      );
    }

    const templateUrl = resolveTemplateUrl(template.templateUrl, request);

    const pdfResult = await generatePDF(templateUrl, typedFields, {
      flatten: true,
    });

    if (!pdfResult.success) {
      return NextResponse.json(
        {
          error: "PDF generation failed",
          message: pdfResult.error,
        },
        { status: 500 }
      );
    }

    const pdfBlob = pdfResult.data;
    const fileName = buildFileName({
      formId,
      formTitle: template.title,
      caseNumber: extractCaseNumber(typedFields, caseRecord.caseNumber),
    });

    const storagePath = getCompletedFormPath(user.uid, caseId, formId);
    const pdfFile = new File([pdfBlob], fileName, {
      type: "application/pdf",
    });

    const downloadUrl = await uploadFile(storagePath, pdfFile);

    const metadataResult = await saveCompletedForm({
      formId,
      formTitle: template.title,
      caseId,
      userId: user.uid,
      storagePath,
      downloadUrl,
      fileName,
      fields: typedFields,
    });

    if (!metadataResult.success) {
      return NextResponse.json(
        {
          error: "Metadata persistence failed",
          message: metadataResult.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        formId,
        fileName,
        downloadUrl,
        storagePath,
        recordId: metadataResult.data,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Failed to generate form PDF", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function parseRequest(
  request: NextRequest
): Promise<Result<GenerateFormRequest>> {
  try {
    const body = await request.json();
    const parsed = GenerateFormRequestSchema.safeParse(body);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((issue) => issue.message).join(", "),
      };
    }

    return { success: true, data: parsed.data };
  } catch (error) {
    console.error("Failed to parse generate form request", error);
    return {
      success: false,
      error: "Invalid JSON payload",
    };
  }
}

function coerceFields(
  fieldDefinitions: Array<{ id: string; type: string }>,
  incoming: Record<string, unknown>
): Record<string, FieldValue> {
  const coerced: Record<string, FieldValue> = {};

  for (const { id, type } of fieldDefinitions) {
    let rawValue = incoming[id];
    if (typeof rawValue === "number") {
      rawValue = String(rawValue);
    }
    coerced[id] = coerceFieldValue(rawValue as FieldValue, type);
  }

  for (const [key, value] of Object.entries(incoming)) {
    if (!(key in coerced)) {
      coerced[key] =
        typeof value === "number" ? (String(value) as FieldValue) : (value as FieldValue);
    }
  }

  return coerced;
}

function resolveTemplateUrl(templateUrl: string, request: NextRequest): string {
  if (/^https?:\/\//i.test(templateUrl)) {
    return templateUrl;
  }

  const origin = request.nextUrl.origin;
  return new URL(templateUrl, origin).toString();
}

function buildFileName(input: {
  formId: string;
  formTitle?: string | null;
  caseNumber?: string | FieldValue;
}): string {
  const formSegment = slugify(input.formTitle || input.formId || "form");
  const caseSegment = slugify(
    typeof input.caseNumber === "string"
      ? input.caseNumber
      : (input.caseNumber instanceof Date
          ? input.caseNumber.toISOString()
          : "") || "case"
  );
  const dateSegment = new Date().toISOString().split("T")[0];

  const segments = [formSegment, caseSegment, dateSegment].filter(Boolean);
  return `${segments.join("_")}.pdf`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-+/g, "-");
}

function extractCaseNumber(
  fields: Record<string, FieldValue>,
  fallback?: string
): string | undefined {
  const candidates = [
    fields.case_number,
    fields.caseNumber,
    fields.case_num,
    fields["CaseNumber"],
    fallback,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    if (candidate instanceof Date) {
      continue;
    }
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return undefined;
}
