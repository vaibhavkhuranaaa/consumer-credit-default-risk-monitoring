import type { Health, PublicDataset, Release } from "./types";

export async function getCurrentRelease(signal?: AbortSignal): Promise<Release> {
  const response = await fetch("/api/v1/releases/current", { signal, headers: { Accept: "application/json" } });
  if (response.status === 404) throw new Error("No approved public release is available yet.");
  if (!response.ok) throw new Error("Evidence is temporarily unavailable. Please try again shortly.");
  return response.json() as Promise<Release>;
}

export async function getPublicDataset(signal?: AbortSignal): Promise<PublicDataset> {
  const response = await fetch("/data/analyst-workspace.json", { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("The governed UCI research artifact is temporarily unavailable.");
  const payload: unknown = await response.json();
  if (!isPublicDataset(payload)) throw new Error("The analyst artifact failed its public contract.");
  return payload;
}

export async function getHealth(signal?: AbortSignal): Promise<Health> {
  const response = await fetch("/api/v1/health", { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Service status is unavailable.");
  return response.json() as Promise<Health>;
}

function isPublicDataset(value: unknown): value is PublicDataset {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  const source = payload.source;
  const evidence = payload.evidence;
  const records = payload.records;
  if (payload.version !== 3 || !source || typeof source !== "object" || !evidence || typeof evidence !== "object" || !Array.isArray(records) || records.length === 0) return false;
  const sourceObject = source as Record<string, unknown>;
  const evidenceObject = evidence as Record<string, unknown>;
  const selection = evidenceObject.selection;
  const forbidden = new Set(["SEX", "EDUCATION", "MARRIAGE", "AGE"]);
  return sourceObject.protected_attribute_boundary === "local fairness audit only"
    && typeof sourceObject.evaluation_sha256 === "string"
    && Boolean(selection && typeof selection === "object")
    && records.every(record => Boolean(record && typeof record === "object") && !Object.keys(record as object).some(key => forbidden.has(key)));
}
