import { neon } from "@neondatabase/serverless";
import { beforeEach, expect, it, vi } from "vitest";
import { onRequestGet } from "./current";

vi.mock("@neondatabase/serverless", () => ({ neon: vi.fn() }));

beforeEach(() => vi.resetAllMocks());

it("returns a cacheable aggregate release without exposing database details", async () => {
  const query = vi.fn().mockResolvedValue([{ public_payload: { version: 1, scope: "aggregate only" } }]);
  vi.mocked(neon).mockReturnValue({ query } as never);
  const response = await onRequestGet({ env: { NEON_API_DATABASE_URL: "postgres://reader" }, request: new Request("https://example.pages.dev/api/v1/releases/current") });
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
  await expect(response.json()).resolves.toEqual({ version: 1, scope: "aggregate only" });
});

it("fails closed when the evidence store is unavailable", async () => {
  vi.mocked(neon).mockImplementation(() => { throw new Error("connection failure"); });
  const response = await onRequestGet({ env: { NEON_API_DATABASE_URL: "postgres://reader" }, request: new Request("https://example.pages.dev/api/v1/releases/current") });
  expect(response.status).toBe(503);
  await expect(response.json()).resolves.toEqual({ error: "Evidence unavailable" });
});
