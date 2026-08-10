export type Bindings = {
  NEON_API_DATABASE_URL?: string;
  ALLOWED_ORIGIN?: string;
};

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Permitted-Cross-Domain-Policies": "none",
};

export function originAllowed(request: Request, env: Bindings): boolean {
  const origin = request.headers.get("Origin");
  return !origin || Boolean(env.ALLOWED_ORIGIN && origin === env.ALLOWED_ORIGIN);
}

export function jsonResponse(
  body: unknown,
  status: number,
  request: Request,
  env: Bindings,
  requestId: string,
  cacheControl = "no-store",
): Response {
  const headers = new Headers({
    ...SECURITY_HEADERS,
    "Cache-Control": cacheControl,
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "X-Request-Id": requestId,
  });
  const origin = request.headers.get("Origin");
  if (origin && env.ALLOWED_ORIGIN === origin) headers.set("Access-Control-Allow-Origin", origin);
  return new Response(JSON.stringify(body), { status, headers });
}

export function logFailure(event: string, request: Request, requestId: string, error?: unknown): void {
  console.error(JSON.stringify({
    event,
    request_id: requestId,
    path: new URL(request.url).pathname,
    error: error instanceof Error ? error.name : undefined,
  }));
}
