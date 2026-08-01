interface Env { NEON_API_DATABASE_URL?: string; }
type PagesContext<T> = { env: T };
export const onRequestGet = async ({ env }: PagesContext<Env>) => new Response(JSON.stringify({ status: env.NEON_API_DATABASE_URL ? "configured" : "misconfigured" }), { status: env.NEON_API_DATABASE_URL ? 200 : 503, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
