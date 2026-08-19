import { neon } from "@neondatabase/serverless";
import { beforeEach, expect, it, vi } from "vitest";
import { onRequestGet } from "./health";

vi.mock("@neondatabase/serverless", () => ({ neon: vi.fn() }));

beforeEach(() => vi.resetAllMocks());

it("proves database connectivity and current-release availability", async () => {
  const query = vi.fn().mockResolvedValue([{ release_id: "release-1", released_at: new Date("2026-08-09T00:00:00Z") }]);
  vi.mocked(neon).mockReturnValue({ query } as never);
  const response = await onRequestGet({ env: { NEON_API_DATABASE_URL: "postgres://reader" }, request: new Request("https://example.pages.dev/api/v1/health") } as never);
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  const payload = await response.json();
  expect(payload).toMatchObject({
    status: "ready",
    checks: { database: "reachable", current_release: "available" },
    release: { released_at: "2026-08-09T00:00:00.000Z" },
  });
  expect(JSON.stringify(payload)).not.toContain("revision");
});

it("fails closed when the database cannot be reached", async () => {
  vi.mocked(neon).mockImplementation(() => { throw new Error("connection failure"); });
  const response = await onRequestGet({ env: { NEON_API_DATABASE_URL: "postgres://reader" }, request: new Request("https://example.pages.dev/api/v1/health") } as never);
  expect(response.status).toBe(503);
  await expect(response.json()).resolves.toMatchObject({ status: "unavailable", checks: { database: "unreachable" } });
});
