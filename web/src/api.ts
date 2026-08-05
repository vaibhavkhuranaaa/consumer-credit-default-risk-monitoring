import type { PublicDataset, Release } from "./types";

export async function getCurrentRelease(signal?: AbortSignal): Promise<Release> {
  const response = await fetch("/api/v1/releases/current", { signal, headers: { Accept: "application/json" } });
  if (response.status === 404) throw new Error("No approved public release is available yet.");
  if (!response.ok) throw new Error("Evidence is temporarily unavailable. Please try again shortly.");
  return response.json() as Promise<Release>;
}

export async function getPublicDataset(signal?: AbortSignal): Promise<PublicDataset> {
  const response = await fetch("/data/uci-credit-records.json", { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("The full UCI source-record artifact is temporarily unavailable.");
  return response.json() as Promise<PublicDataset>;
}
