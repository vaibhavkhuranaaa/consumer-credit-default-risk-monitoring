import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("ships the static security and cache contract", () => {
  const headers = readFileSync("public/_headers", "utf8");
  for (const required of ["Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options", "Permissions-Policy", "/data/*", "must-revalidate"]) {
    expect(headers).toContain(required);
  }
});

it("enables bounded native Workers observability", () => {
  const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
  expect(config.compatibility_flags).toContain("nodejs_compat");
  expect(config.observability.logs.head_sampling_rate).toBeLessThanOrEqual(.1);
  expect(config.observability.traces.head_sampling_rate).toBeLessThanOrEqual(.01);
});
