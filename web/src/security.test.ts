import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("ships the static security and cache contract", () => {
  const headers = readFileSync("public/_headers", "utf8");
  for (const required of ["Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options", "Permissions-Policy", "/data/*", "must-revalidate"]) {
    expect(headers).toContain(required);
  }
});

it("keeps the Pages configuration within supported fields", () => {
  const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
  expect(config.compatibility_flags).toContain("nodejs_compat");
  expect(config.pages_build_output_dir).toBe("dist");
  expect(config).not.toHaveProperty("observability");
});
