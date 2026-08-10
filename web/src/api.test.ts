import { afterEach, expect, it, vi } from "vitest";
import { getPublicDataset } from "./api";

const valid = {
  version: 3,
  source: { evaluation_sha256: "a", protected_attribute_boundary: "local fairness audit only" },
  evidence: { selection: { selected_model: "model" } },
  records: [{ ID: 1, research_score: .2 }],
};

afterEach(() => vi.unstubAllGlobals());

it("accepts the narrowed analyst artifact contract", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(valid), { status: 200 })));
  await expect(getPublicDataset()).resolves.toMatchObject({ version: 3 });
});

it("rejects stale artifacts and protected fields", async () => {
  const unsafe = { ...valid, records: [{ ID: 1, AGE: 30 }] };
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(unsafe), { status: 200 })));
  await expect(getPublicDataset()).rejects.toThrow("failed its public contract");
});
