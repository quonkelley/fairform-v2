import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/lib/firebase-admin", () => ({
  getAdminFirestore: vi.fn(),
}));

import { saveCompletedForm, listByCase } from "@/lib/db/formsRepo";
import { getAdminFirestore } from "@/lib/firebase-admin";

const getAdminFirestoreMock = getAdminFirestore as unknown as Mock;

describe("formsRepo", () => {
  beforeEach(() => {
    getAdminFirestoreMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("saves completed form metadata", async () => {
    const addMock = vi.fn().mockResolvedValue({ id: "doc123" });
    const collectionMock = vi.fn(() => ({ add: addMock }));

    getAdminFirestoreMock.mockReturnValue({
      collection: collectionMock,
    });

    const createdAt = new Date("2024-01-01T00:00:00.000Z");

    const result = await saveCompletedForm({
      formId: "marion-appearance",
      formTitle: "Appearance Form",
      userId: "user-1",
      caseId: "case-1",
      storagePath: "forms/completed/user-1/case-1/form.pdf",
      downloadUrl: "https://example.com/form.pdf",
      fileName: "appearance_form.pdf",
      fields: { case_number: "49D01-2410", empty_value: undefined },
      status: "generated",
      createdAt,
    });

    expect(result).toEqual({ success: true, data: "doc123" });
    expect(collectionMock).toHaveBeenCalledWith("completedForms");
    expect(addMock).toHaveBeenCalledWith({
      formId: "marion-appearance",
      formTitle: "Appearance Form",
      userId: "user-1",
      caseId: "case-1",
      storagePath: "forms/completed/user-1/case-1/form.pdf",
      downloadUrl: "https://example.com/form.pdf",
      fileName: "appearance_form.pdf",
      status: "generated",
      fields: {
        case_number: "49D01-2410",
        empty_value: null,
      },
      createdAt,
    });
  });

  it("lists completed forms by case", async () => {
    const mockDocs = [
      {
        id: "form-1",
        data: () => ({
          formId: "marion-appearance",
          formTitle: "Appearance Form",
          userId: "user-1",
          caseId: "case-1",
          storagePath: "forms/completed/user-1/case-1/form.pdf",
          downloadUrl: "https://example.com/form.pdf",
          fileName: "appearance_form.pdf",
          status: "generated",
          fields: { case_number: "49D01-2410" },
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
        }),
      },
    ];

    const getMock = vi.fn().mockResolvedValue({ docs: mockDocs });
    const orderByMock = vi.fn(() => ({ get: getMock }));

    const queryChain: any = {
      where: vi.fn(),
      orderBy: orderByMock,
    };
    queryChain.where.mockImplementation(() => queryChain);

    const collectionMock = vi.fn(() => queryChain);

    getAdminFirestoreMock.mockReturnValue({
      collection: collectionMock,
    });

    const result = await listByCase("case-1", "user-1");

    expect(collectionMock).toHaveBeenCalledWith("completedForms");
    expect(queryChain.where).toHaveBeenCalledWith("caseId", "==", "case-1");
    expect(queryChain.where).toHaveBeenCalledWith("userId", "==", "user-1");
    expect(orderByMock).toHaveBeenCalledWith("createdAt", "desc");
    expect(getMock).toHaveBeenCalled();

    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual([
      {
        id: "form-1",
        formId: "marion-appearance",
        formTitle: "Appearance Form",
        userId: "user-1",
        caseId: "case-1",
        storagePath: "forms/completed/user-1/case-1/form.pdf",
        downloadUrl: "https://example.com/form.pdf",
        fileName: "appearance_form.pdf",
        status: "generated",
        fields: { case_number: "49D01-2410" },
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    ]);
  });
});
