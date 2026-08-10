import { afterEach, expect, it, vi } from "vitest";
import { getPublicDataset } from "./api";

const valid = {
  version: 4,
  source: { rows: 1, evaluation_sha256: "a", evaluation_schema_version: 2, evaluation_generated_at_utc: "2026-08-10T00:00:00Z", evaluated_revision: "abcdef1", protected_attribute_boundary: "local fairness audit only" },
  evidence: { selection: { selected_model: "model" }, development_evaluation: {} },
  records: [{ ID: 1, research_score: .2, research_score_rank: 1 }],
};

afterEach(() => vi.unstubAllGlobals());

it("accepts the narrowed analyst artifact contract", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(valid), { status: 200 })));
  await expect(getPublicDataset()).resolves.toMatchObject({ version: 4 });
});

it("rejects stale artifacts and protected fields", async () => {
  const unsafe = { ...valid, records: [{ ID: 1, AGE: 30 }] };
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(unsafe), { status: 200 })));
  await expect(getPublicDataset()).rejects.toThrow("failed its public contract");
});
