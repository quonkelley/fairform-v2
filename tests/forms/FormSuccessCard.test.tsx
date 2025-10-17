import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, beforeEach, afterEach, expect, it } from "vitest";
import type { Mock } from "vitest";

import { FormSuccessCard } from "@/components/forms/FormSuccessCard";
import * as AuthContextModule from "@/components/auth/auth-context";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

const mockGetIdToken = vi.fn();
const mockUser = { getIdToken: mockGetIdToken } as unknown;

describe("FormSuccessCard", () => {
  const originalFetch = globalThis.fetch;
  let anchorClickSpy: ReturnType<typeof vi.spyOn>;
  let useAuthSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockGetIdToken.mockReset().mockResolvedValue("test-token");
    useAuthSpy = vi
      .spyOn(AuthContextModule, "useAuth")
      .mockReturnValue({ user: mockUser as any } as any);
    globalThis.fetch = vi.fn();
    anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    anchorClickSpy.mockRestore();
    useAuthSpy.mockRestore();
    vi.clearAllMocks();
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    }
  });

  it("calls generate API and triggers download", async () => {
    const onDownloadComplete = vi.fn();
    (globalThis.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        downloadUrl: "https://example.com/form.pdf",
        fileName: "appearance_case_2024-01-01.pdf",
      }),
    });

    render(
      <FormSuccessCard
        formId="marion-appearance"
        formTitle="Appearance Form"
        caseId="case-123"
        fields={{ case_number: "49D01-2410" }}
        caseNumber="49D01-2410"
        onDownloadComplete={onDownloadComplete}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/forms/generate",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    await waitFor(() => {
      expect(anchorClickSpy).toHaveBeenCalled();
    });

    expect(onDownloadComplete).toHaveBeenCalledWith({
      downloadUrl: "https://example.com/form.pdf",
      fileName: "appearance_case_2024-01-01.pdf",
    });
  });

  it("shows an error message when the API call fails", async () => {
    (globalThis.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
      json: async () => ({ message: "Failed to generate form" }),
    });

    render(
      <FormSuccessCard
        formId="marion-appearance"
        formTitle="Appearance Form"
        caseId="case-123"
        fields={{}}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to generate form");
    });
  });
});
