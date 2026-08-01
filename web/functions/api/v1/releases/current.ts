import { neon } from "@neondatabase/serverless";

interface Env { NEON_API_DATABASE_URL: string; ALLOWED_ORIGIN?: string; }
type PagesContext<T> = { env: T; request: Request };

export const onRequestGet = async ({ env, request }: PagesContext<Env>) => {
  const origin = request.headers.get("Origin");
  if (origin && env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) return new Response("Origin not allowed", { status: 403 });
  try {
    const sql = neon(env.NEON_API_DATABASE_URL);
    const rows = await sql.query("SELECT public_payload FROM public_release_snapshot LIMIT 1");
    if (!rows.length) return json({ error: "No approved release" }, 404, origin, env);
    return json(rows[0].public_payload, 200, origin, env);
  } catch {
    return json({ error: "Evidence unavailable" }, 503, origin, env);
  }
};

function json(body: unknown, status: number, origin: string | null, env: Env): Response {
  const headers = new Headers({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin" });
  if (origin && env.ALLOWED_ORIGIN === origin) headers.set("Access-Control-Allow-Origin", origin);
  return new Response(JSON.stringify(body), { status, headers });
}
