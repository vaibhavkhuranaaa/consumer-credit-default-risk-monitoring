import { neon } from "@neondatabase/serverless";
import { beforeEach, expect, it, vi } from "vitest";
import { onRequestGet } from "./current";

vi.mock("@neondatabase/serverless", () => ({ neon: vi.fn() }));

beforeEach(() => vi.resetAllMocks());

it("returns a cacheable aggregate release without exposing database details", async () => {
  const query = vi.fn().mockResolvedValue([{ public_payload: { version: 1, scope: "aggregate only" } }]);
  vi.mocked(neon).mockReturnValue({ query } as never);
  const response = await onRequestGet({ env: { NEON_API_DATABASE_URL: "postgres://reader" }, request: new Request("https://example.pages.dev/api/v1/releases/current") } as never);
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
  expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  expect(response.headers.get("X-Request-Id")).toBeTruthy();
  await expect(response.json()).resolves.toEqual({ version: 1, scope: "aggregate only" });
});

it("fails closed when the evidence store is unavailable", async () => {
  vi.mocked(neon).mockImplementation(() => { throw new Error("connection failure"); });
  const response = await onRequestGet({ env: { NEON_API_DATABASE_URL: "postgres://reader" }, request: new Request("https://example.pages.dev/api/v1/releases/current") } as never);
  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  await expect(response.json()).resolves.toEqual({ error: "Evidence unavailable" });
});

it("rejects unapproved cross-origin requests", async () => {
  const response = await onRequestGet({ env: { NEON_API_DATABASE_URL: "postgres://reader", ALLOWED_ORIGIN: "https://allowed.example" }, request: new Request("https://example.pages.dev/api/v1/releases/current", { headers: { Origin: "https://blocked.example" } }) } as never);
  expect(response.status).toBe(403);
  await expect(response.json()).resolves.toEqual({ error: "Origin not allowed" });
});
