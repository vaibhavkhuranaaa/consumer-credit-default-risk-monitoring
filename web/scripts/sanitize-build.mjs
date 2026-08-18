import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const privateRevisionFields = new Set(["code_revision", "evaluated_revision", "source_sha"]);

function withoutRevisionFields(value) {
  if (typeof value === "string") {
    return value.replace(/(?<![0-9a-f])[0-9a-f]{40}(?![0-9a-f])/g, "historical-release");
  }
  if (Array.isArray(value)) return value.map(withoutRevisionFields);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !privateRevisionFields.has(key))
      .map(([key, item]) => [key, withoutRevisionFields(item)]),
  );
}

const outputDirectory = join(import.meta.dirname, "..", "dist");
const artifactPath = join(outputDirectory, "data", "analyst-workspace.json");
const sourceSha = (
  process.env.SOURCE_SHA ||
  process.env.GITHUB_SHA ||
  process.env.CF_PAGES_COMMIT_SHA ||
  execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim()
).toLowerCase();

if (!/^[0-9a-f]{40}$/.test(sourceSha)) {
  throw new Error("Deployment source SHA must be a full 40-character Git commit.");
}

try {
  const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
  await writeFile(artifactPath, `${JSON.stringify(withoutRevisionFields(artifact))}\n`);
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

await writeFile(
  join(outputDirectory, "source.json"),
  `${JSON.stringify({ schema_version: 1, status: "published", source_sha: sourceSha }, null, 2)}\n`,
);
