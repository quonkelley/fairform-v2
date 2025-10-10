import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/cases/route";

// Mock the repository
vi.mock("@/lib/db/casesRepo", () => ({
  listByUser: vi.fn(),
  createCase: vi.fn(),
}));

// Mock the server auth module
vi.mock("@/lib/auth/server-auth", () => ({
  requireAuth: vi.fn(),
}));

describe("/api/cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/cases", () => {
    it("should return cases for authenticated user", async () => {
      const { listByUser } = await import("@/lib/db/casesRepo");
      const { requireAuth } = await import("@/lib/auth/server-auth");
      
      const mockUser = { uid: "user123", email: "test@example.com", emailVerified: true };
      const mockDate = new Date("2025-01-12T10:00:00Z");
      const mockCases = [
        {
          id: "case1",
          userId: "user123",
          caseType: "eviction",
          jurisdiction: "marion_in",
          status: "active" as const,
          progressPct: 0,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      ];

      vi.mocked(requireAuth).mockResolvedValue(mockUser);
      vi.mocked(listByUser).mockResolvedValue(mockCases);

      const request = new NextRequest("http://localhost/api/cases");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCases.map(testCase => ({
        ...testCase,
        createdAt: testCase.createdAt.toISOString(),
        updatedAt: testCase.updatedAt.toISOString(),
      })));
      expect(listByUser).toHaveBeenCalledWith("user123");
    });

    it("should return 500 on repository error", async () => {
      const { listByUser } = await import("@/lib/db/casesRepo");
      const { requireAuth } = await import("@/lib/auth/server-auth");
      
      const mockUser = { uid: "user123", email: "test@example.com", emailVerified: true };
      vi.mocked(requireAuth).mockResolvedValue(mockUser);
      vi.mocked(listByUser).mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost/api/cases");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("POST /api/cases", () => {
    it("should create a case successfully", async () => {
      const { createCase } = await import("@/lib/db/casesRepo");
      const { requireAuth } = await import("@/lib/auth/server-auth");
      
      const mockUser = { uid: "user123", email: "test@example.com", emailVerified: true };
      const mockCase = {
        id: "case123",
        userId: "user123",
        caseType: "eviction",
        jurisdiction: "marion_in",
        status: "active" as const,
        progressPct: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(requireAuth).mockResolvedValue(mockUser);
      vi.mocked(createCase).mockResolvedValue(mockCase);

      const request = new NextRequest("http://localhost/api/cases", {
        method: "POST",
        body: JSON.stringify({
          caseType: "eviction",
          jurisdiction: "marion_in",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.caseId).toBe("case123");
      expect(createCase).toHaveBeenCalledWith({
        caseType: "eviction",
        jurisdiction: "marion_in",
        userId: "user123",
      });
    });

    it("should return 400 for invalid request data", async () => {
      const { requireAuth } = await import("@/lib/auth/server-auth");
      
      const mockUser = { uid: "user123", email: "test@example.com", emailVerified: true };
      vi.mocked(requireAuth).mockResolvedValue(mockUser);

      const request = new NextRequest("http://localhost/api/cases", {
        method: "POST",
        body: JSON.stringify({
          caseType: "", // Invalid: empty string
          jurisdiction: "marion_in",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation error");
    });

    it("should return 500 on repository error", async () => {
      const { createCase } = await import("@/lib/db/casesRepo");
      const { requireAuth } = await import("@/lib/auth/server-auth");
      
      const mockUser = { uid: "user123", email: "test@example.com", emailVerified: true };
      vi.mocked(requireAuth).mockResolvedValue(mockUser);
      vi.mocked(createCase).mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost/api/cases", {
        method: "POST",
        body: JSON.stringify({
          caseType: "eviction",
          jurisdiction: "marion_in",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should return 401 for unauthorized access", async () => {
      const { requireAuth } = await import("@/lib/auth/server-auth");
      
      vi.mocked(requireAuth).mockRejectedValue(new Error("UNAUTHORIZED"));

      const request = new NextRequest("http://localhost/api/cases");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });
});
