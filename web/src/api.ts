import type { Health, PublicDataset, Release } from "./types";

const DATASET_TIMEOUT_MS = 20_000;

export async function getCurrentRelease(signal?: AbortSignal): Promise<Release> {
  const response = await fetch("/api/v1/releases/current", { signal, headers: { Accept: "application/json" } });
  if (response.status === 404) throw new Error("No approved public release is available yet.");
  if (!response.ok) throw new Error("Evidence is temporarily unavailable. Please try again shortly.");
  const payload: unknown = await response.json();
  if (!isRelease(payload)) throw new Error("The release API returned an invalid contract.");
  return payload;
}

export async function getPublicDataset(signal?: AbortSignal): Promise<PublicDataset> {
  const timeout = AbortSignal.timeout(DATASET_TIMEOUT_MS);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let response: Response;
  try {
    response = await fetch("/data/analyst-workspace.json", { signal: requestSignal, headers: { Accept: "application/json" } });
  } catch {
    if (timeout.aborted) throw new Error("The governed analyst artifact took longer than 20 seconds to load. Check your connection and retry.");
    throw new Error("The governed analyst artifact could not be reached. Check your connection and retry.");
  }
  if (!response.ok) throw new Error("The governed UCI research artifact is temporarily unavailable.");
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The analyst artifact returned an unreadable response.");
  }
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
  if (payload.version !== 4 || !source || typeof source !== "object" || !evidence || typeof evidence !== "object" || !Array.isArray(records) || records.length === 0) return false;
  const sourceObject = source as Record<string, unknown>;
  const evidenceObject = evidence as Record<string, unknown>;
  const selection = evidenceObject.selection;
  const development = evidenceObject.development_evaluation;
  const forbidden = new Set(["SEX", "EDUCATION", "MARRIAGE", "AGE"]);
  return sourceObject.protected_attribute_boundary === "local fairness audit only"
    && typeof sourceObject.evaluation_sha256 === "string"
    && sourceObject.evaluation_schema_version === 2
    && typeof sourceObject.evaluation_generated_at_utc === "string"
    && Boolean(selection && typeof selection === "object")
    && Boolean(development && typeof development === "object")
    && sourceObject.rows === records.length
    && records.every(record => {
      if (!record || typeof record !== "object" || Object.keys(record).some(key => forbidden.has(key))) return false;
      const item = record as Record<string, unknown>;
      return Number.isInteger(item.research_score_rank) && Number(item.research_score_rank) >= 1 && Number(item.research_score_rank) <= records.length;
    });
}

function isRelease(value: unknown): value is Release {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return (payload.version === 1 || payload.version === 2)
    && typeof payload.release_id === "string"
    && Boolean(payload.source && typeof payload.source === "object")
    && Boolean(payload.models && typeof payload.models === "object");
}
