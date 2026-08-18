import { neon } from "@neondatabase/serverless";
import { jsonResponse, logFailure, originAllowed, type Bindings } from "../http";

type PublicReleaseRow = { public_payload: Record<string, unknown> };

function isPublicReleaseRow(value: unknown): value is PublicReleaseRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return Boolean(row.public_payload && typeof row.public_payload === "object");
}

const PRIVATE_REVISION_FIELDS = new Set(["code_revision", "evaluated_revision", "source_sha"]);

function withoutRevisionFields(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(/(?<![0-9a-f])[0-9a-f]{40}(?![0-9a-f])/g, "historical-release");
  }
  if (Array.isArray(value)) return value.map(withoutRevisionFields);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !PRIVATE_REVISION_FIELDS.has(key))
      .map(([key, item]) => [key, withoutRevisionFields(item)]),
  );
}

export const onRequestGet: PagesFunction<Bindings> = async ({ env, request }) => {
  const requestId = crypto.randomUUID();
  if (!originAllowed(request, env)) {
    return jsonResponse({ error: "Origin not allowed" }, 403, request, env, requestId);
  }
  if (!env.NEON_API_DATABASE_URL) {
    logFailure("release_binding_missing", request, requestId);
    return jsonResponse({ error: "Evidence unavailable" }, 503, request, env, requestId);
  }
  try {
    const sql = neon(env.NEON_API_DATABASE_URL);
    const rows = await sql.query("SELECT public_payload FROM public_release_snapshot LIMIT 1");
    if (!isPublicReleaseRow(rows[0])) {
      return jsonResponse({ error: "No approved release" }, 404, request, env, requestId);
    }
    return jsonResponse(withoutRevisionFields(rows[0].public_payload), 200, request, env, requestId, "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
  } catch (error) {
    logFailure("release_evidence_unavailable", request, requestId, error);
    return jsonResponse({ error: "Evidence unavailable" }, 503, request, env, requestId);
  }
};
