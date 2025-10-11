import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";

import { useCaseSteps } from "@/lib/hooks/useCaseSteps";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useCaseSteps", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
        },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should fetch case steps successfully", async () => {
    const mockSteps = [
      {
        id: "step1",
        caseId: "case123",
        name: "File Complaint",
        order: 1,
        dueDate: null,
        isComplete: false,
        completedAt: null,
      },
      {
        id: "step2",
        caseId: "case123",
        name: "Serve Defendant",
        order: 2,
        dueDate: null,
        isComplete: false,
        completedAt: null,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSteps,
    });

    const { result } = renderHook(() => useCaseSteps("case123"), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for success
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSteps);
    expect(mockFetch).toHaveBeenCalledWith("/api/cases/case123/steps");
  });

  it("should handle error when fetch fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ message: "Server error" }),
    });

    const { result } = renderHook(() => useCaseSteps("case123"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("Server error");
  });

  it("should handle error when response is not ok and json fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    const { result } = renderHook(() => useCaseSteps("case123"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("Not Found");
  });

  it("should not fetch when caseId is empty", () => {
    const { result } = renderHook(() => useCaseSteps(""), { wrapper });

    expect(result.current.isFetching).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should use correct query key for cache", async () => {
    const mockSteps = [
      {
        id: "step1",
        caseId: "case456",
        name: "File Complaint",
        order: 1,
        dueDate: null,
        isComplete: false,
        completedAt: null,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSteps,
    });

    const { result } = renderHook(() => useCaseSteps("case456"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check that the query is cached with the correct key
    const cachedData = queryClient.getQueryData(["caseSteps", "case456"]);
    expect(cachedData).toEqual(mockSteps);
  });

  it("should return empty array when no steps exist", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useCaseSteps("case789"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useCaseSteps("case123"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Network error");
  });
});
