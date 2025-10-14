import { describe, it, expect, afterEach } from "vitest";
import { GET } from "@/app/api/health/route";

const originalDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE;

describe("/api/health", () => {
  afterEach(() => {
    if (originalDemoMode === undefined) {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;
    } else {
      process.env.NEXT_PUBLIC_DEMO_MODE = originalDemoMode;
    }
  });

  describe("GET /api/health", () => {
    it("should return enriched health metadata in default mode", async () => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE;

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(
        expect.objectContaining({
          ok: true,
          demo: false,
        })
      );
      expect(typeof data.timestamp).toBe("string");
      expect(Number.isNaN(new Date(data.timestamp).getTime())).toBe(false);
    });

    it("should reflect demo mode when enabled", async () => {
      process.env.NEXT_PUBLIC_DEMO_MODE = "true";

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.demo).toBe(true);
      expect(Number.isNaN(new Date(data.timestamp).getTime())).toBe(false);
    });
  });
});
