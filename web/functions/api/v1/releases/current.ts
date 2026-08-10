import { neon } from "@neondatabase/serverless";
import { jsonResponse, logFailure, originAllowed, type Bindings } from "../http";

type PublicReleaseRow = { public_payload: Record<string, unknown> };

function isPublicReleaseRow(value: unknown): value is PublicReleaseRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return Boolean(row.public_payload && typeof row.public_payload === "object");
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
    return jsonResponse(rows[0].public_payload, 200, request, env, requestId, "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
  } catch (error) {
    logFailure("release_evidence_unavailable", request, requestId, error);
    return jsonResponse({ error: "Evidence unavailable" }, 503, request, env, requestId);
  }
};
