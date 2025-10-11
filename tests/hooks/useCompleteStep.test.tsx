import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { useCompleteStep } from "@/lib/hooks/useCompleteStep";
import type { CaseStep } from "@/lib/validation";

// Create wrapper for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useCompleteStep", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it("should successfully complete a step", async () => {
    const mockResponse = {
      success: true,
      step: {
        id: "step123",
        caseId: "case456",
        name: "File Complaint",
        order: 1,
        dueDate: null,
        isComplete: true,
        completedAt: new Date("2025-10-10"),
      },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useCompleteStep(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ stepId: "step123", caseId: "case456" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith("/api/steps/step123/complete", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isComplete: true }),
    });

    expect(result.current.data).toEqual(mockResponse);
  });

  it("should handle error responses", async () => {
    const errorResponse = {
      error: "Forbidden",
      message: "You do not have permission to complete this step",
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => errorResponse,
    } as Response);

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useCompleteStep(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ stepId: "step123", caseId: "case456" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("You do not have permission to complete this step");
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should handle network errors", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useCompleteStep(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ stepId: "step123", caseId: "case456" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Network error");

    consoleErrorSpy.mockRestore();
  });

  it("should optimistically update the cache", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const mockSteps: CaseStep[] = [
      {
        id: "step123",
        caseId: "case456",
        name: "File Complaint",
        order: 1,
        dueDate: null,
        isComplete: false,
        completedAt: null,
      },
      {
        id: "step124",
        caseId: "case456",
        name: "Serve Defendant",
        order: 2,
        dueDate: null,
        isComplete: false,
        completedAt: null,
      },
    ];

    // Set initial cache data
    queryClient.setQueryData(["caseSteps", "case456"], mockSteps);

    vi.mocked(global.fetch).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  success: true,
                  step: { ...mockSteps[0], isComplete: true },
                }),
              } as Response),
            100
          )
        )
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCompleteStep(), { wrapper });

    result.current.mutate({ stepId: "step123", caseId: "case456" });

    // Check optimistic update happened immediately
    await waitFor(() => {
      const cacheData = queryClient.getQueryData<CaseStep[]>(["caseSteps", "case456"]);
      expect(cacheData?.[0].isComplete).toBe(true);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("should rollback cache on error", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const mockSteps: CaseStep[] = [
      {
        id: "step123",
        caseId: "case456",
        name: "File Complaint",
        order: 1,
        dueDate: null,
        isComplete: false,
        completedAt: null,
      },
    ];

    // Set initial cache data
    queryClient.setQueryData(["caseSteps", "case456"], mockSteps);

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Internal server error" }),
    } as Response);

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCompleteStep(), { wrapper });

    result.current.mutate({ stepId: "step123", caseId: "case456" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Cache should be rolled back to original state
    const cacheData = queryClient.getQueryData<CaseStep[]>(["caseSteps", "case456"]);
    expect(cacheData?.[0].isComplete).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("should invalidate queries on success", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        step: {
          id: "step123",
          caseId: "case456",
          name: "File Complaint",
          order: 1,
          dueDate: null,
          isComplete: true,
          completedAt: new Date(),
        },
      }),
    } as Response);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCompleteStep(), { wrapper });

    result.current.mutate({ stepId: "step123", caseId: "case456" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["caseSteps", "case456"],
    });

    // Should also invalidate cases query for dashboard progress update
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["cases"],
    });

    invalidateSpy.mockRestore();
  });

  it("should show pending state during mutation", async () => {
    vi.mocked(global.fetch).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ success: true, step: {} }),
              } as Response),
            100
          )
        )
    );

    const { result } = renderHook(() => useCompleteStep(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);

    result.current.mutate({ stepId: "step123", caseId: "case456" });

    // Wait for pending state to become true
    await waitFor(() => expect(result.current.isPending).toBe(true));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isPending).toBe(false);
  });
});
