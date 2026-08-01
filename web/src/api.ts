import type { Release } from "./types";

export async function getCurrentRelease(signal?: AbortSignal): Promise<Release> {
  const response = await fetch("/api/v1/releases/current", { signal, headers: { Accept: "application/json" } });
  if (response.status === 404) throw new Error("No approved public release is available yet.");
  if (!response.ok) throw new Error("Evidence is temporarily unavailable. Please try again shortly.");
  return response.json() as Promise<Release>;
}
