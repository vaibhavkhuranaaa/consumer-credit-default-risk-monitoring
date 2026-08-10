import { neon } from "@neondatabase/serverless";
import { jsonResponse, logFailure, type Bindings } from "./http";

type ReleaseHealth = { release_id: string; released_at: string; code_revision: string };

function isReleaseHealth(value: unknown): value is ReleaseHealth {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.release_id === "string" && typeof row.released_at === "string" && typeof row.code_revision === "string";
}

export const onRequestGet: PagesFunction<Bindings> = async ({ env, request }) => {
  const requestId = crypto.randomUUID();
  if (!env.NEON_API_DATABASE_URL) {
    logFailure("health_binding_missing", request, requestId);
    return jsonResponse({ status: "unavailable", checks: { database: "misconfigured" } }, 503, request, env, requestId);
  }
  try {
    const sql = neon(env.NEON_API_DATABASE_URL);
    const rows = await sql.query("SELECT release_id, released_at, code_revision FROM public_release_snapshot LIMIT 1");
    if (!isReleaseHealth(rows[0])) {
      logFailure("health_release_missing", request, requestId);
      return jsonResponse({ status: "unavailable", checks: { database: "reachable", current_release: "missing" } }, 503, request, env, requestId);
    }
    return jsonResponse({ status: "ready", checks: { database: "reachable", current_release: "available" }, release: rows[0] }, 200, request, env, requestId);
  } catch (error) {
    logFailure("health_database_unavailable", request, requestId, error);
    return jsonResponse({ status: "unavailable", checks: { database: "unreachable" } }, 503, request, env, requestId);
  }
};
