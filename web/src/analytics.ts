import type { CreditRecord, Model, Threshold } from "./types";

export const SCORE_BANDS = ["Very low", "Low", "Moderate", "Elevated", "High"] as const;
export const DELINQUENCY_LEVELS = ["Current or paid", "Delayed", "Severe"] as const;
export const LIMIT_BANDS = ["≤50k", "50k–140k", "140k–300k", ">300k"] as const;
export const STATEMENT_KEYS = ["PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6"] as const;
export const BILL_KEYS = ["BILL_AMT1", "BILL_AMT2", "BILL_AMT3", "BILL_AMT4", "BILL_AMT5", "BILL_AMT6"] as const;
export const PAYMENT_KEYS = ["PAY_AMT1", "PAY_AMT2", "PAY_AMT3", "PAY_AMT4", "PAY_AMT5", "PAY_AMT6"] as const;
export const LOW_PAYMENT_RATIO = 0.1;

export type Filters = {
  band: string;
  outcome: "all" | "default" | "non-default";
  delinquency: string;
  limitMin: number;
  limitMax: number;
  paymentRatioMin: number;
  paymentRatioMax: number;
  scoreMin: number;
  scoreMax: number;
};

export const DEFAULT_FILTERS: Filters = {
  band: "all",
  outcome: "all",
  delinquency: "all",
  limitMin: 10_000,
  limitMax: 1_000_000,
  paymentRatioMin: 0,
  paymentRatioMax: 10,
  scoreMin: 0,
  scoreMax: 1,
};

export function filterRecords(records: CreditRecord[], filters: Filters): CreditRecord[] {
  return records.filter((record) => {
    if (filters.band !== "all" && record.score_band !== filters.band) return false;
    if (filters.outcome === "default" && record["default payment next month"] !== 1) return false;
    if (filters.outcome === "non-default" && record["default payment next month"] !== 0) return false;
    if (filters.delinquency !== "all" && record.delinquency_severity !== filters.delinquency) return false;
    return record.LIMIT_BAL >= filters.limitMin
      && record.LIMIT_BAL <= filters.limitMax
      && record.payment_to_bill_ratio >= filters.paymentRatioMin
      && record.payment_to_bill_ratio <= filters.paymentRatioMax
      && record.research_score >= filters.scoreMin
      && record.research_score <= filters.scoreMax;
  });
}

export function isDefaultFilters(filters: Filters): boolean {
  return JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS);
}

export function describeFilters(filters: Filters): string[] {
  const labels: string[] = [];
  if (filters.band !== "all") labels.push(`Score band: ${filters.band}`);
  if (filters.outcome !== "all") labels.push(`Outcome: ${filters.outcome === "default" ? "Observed default" : "No observed default"}`);
  if (filters.delinquency !== "all") labels.push(`Repayment: ${filters.delinquency}`);
  if (filters.limitMin !== DEFAULT_FILTERS.limitMin || filters.limitMax !== DEFAULT_FILTERS.limitMax) labels.push(`Limit: ${filters.limitMin.toLocaleString()}–${filters.limitMax.toLocaleString()}`);
  if (filters.paymentRatioMin !== DEFAULT_FILTERS.paymentRatioMin || filters.paymentRatioMax !== DEFAULT_FILTERS.paymentRatioMax) labels.push(`Payment / bill: ${filters.paymentRatioMin.toFixed(2)}–${filters.paymentRatioMax.toFixed(2)}`);
  if (filters.scoreMin !== DEFAULT_FILTERS.scoreMin || filters.scoreMax !== DEFAULT_FILTERS.scoreMax) labels.push(`Research score: ${(filters.scoreMin * 100).toFixed(0)}–${(filters.scoreMax * 100).toFixed(0)}%`);
  return labels;
}

function total(records: CreditRecord[], field: keyof CreditRecord): number {
  return records.reduce((sum, record) => sum + Number(record[field]), 0);
}

export function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const ordered = [...values].sort((a, b) => a - b);
  const position = (ordered.length - 1) * p;
  const lower = Math.floor(position);
  const fraction = position - lower;
  return ordered[lower] + (ordered[Math.min(lower + 1, ordered.length - 1)] - ordered[lower]) * fraction;
}

export type PortfolioSummary = ReturnType<typeof portfolioSummary>;

export function portfolioSummary(records: CreditRecord[]) {
  const count = records.length;
  const defaults = records.reduce((sum, record) => sum + record["default payment next month"], 0);
  const elevated = records.filter((record) => record.score_band === "Elevated" || record.score_band === "High");
  const delayed = records.filter((record) => record.delinquency_severity !== "Current or paid").length;
  const severe = records.filter((record) => record.delinquency_severity === "Severe").length;
  const lowRatio = records.filter((record) => record.payment_to_bill_ratio < LOW_PAYMENT_RATIO).length;
  const limitTotal = total(records, "LIMIT_BAL");
  const elevatedLimit = total(elevated, "LIMIT_BAL");
  return {
    count,
    defaults,
    defaultRate: count ? defaults / count : 0,
    elevatedCount: elevated.length,
    elevatedShare: count ? elevated.length / count : 0,
    limitTotal,
    limitMedian: percentile(records.map((record) => record.LIMIT_BAL), 0.5),
    limitAverage: count ? limitTotal / count : 0,
    elevatedLimitShare: limitTotal ? elevatedLimit / limitTotal : 0,
    delayed,
    delayedShare: count ? delayed / count : 0,
    severe,
    severeShare: count ? severe / count : 0,
    paymentRatioMedian: percentile(records.map((record) => record.payment_to_bill_ratio), 0.5),
    lowRatio,
    lowRatioShare: count ? lowRatio / count : 0,
  };
}

export type BandSummary = {
  label: string;
  count: number;
  defaults: number;
  defaultRate: number;
  limitTotal: number;
  limitShare: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
};

export function bandSummaries(records: CreditRecord[]): BandSummary[] {
  const allLimits = total(records, "LIMIT_BAL");
  return SCORE_BANDS.map((label) => {
    const cohort = records.filter((record) => record.score_band === label);
    const defaults = cohort.reduce((sum, record) => sum + record["default payment next month"], 0);
    const limits = cohort.map((record) => record.LIMIT_BAL);
    const limitTotal = limits.reduce((sum, value) => sum + value, 0);
    return {
      label,
      count: cohort.length,
      defaults,
      defaultRate: cohort.length ? defaults / cohort.length : 0,
      limitTotal,
      limitShare: allLimits ? limitTotal / allLimits : 0,
      min: percentile(limits, 0),
      q1: percentile(limits, 0.25),
      median: percentile(limits, 0.5),
      q3: percentile(limits, 0.75),
      max: percentile(limits, 1),
    };
  });
}

export function delinquencySummaries(records: CreditRecord[]) {
  return DELINQUENCY_LEVELS.map((label) => {
    const cohort = records.filter((record) => record.delinquency_severity === label);
    const defaults = cohort.reduce((sum, record) => sum + record["default payment next month"], 0);
    return { label, count: cohort.length, defaults, defaultRate: cohort.length ? defaults / cohort.length : 0 };
  });
}

export function cohortMatrix(records: CreditRecord[]) {
  return DELINQUENCY_LEVELS.flatMap((delinquency) => SCORE_BANDS.map((band) => {
    const cohort = records.filter((record) => record.delinquency_severity === delinquency && record.score_band === band);
    const defaults = cohort.reduce((sum, record) => sum + record["default payment next month"], 0);
    return { delinquency, band, count: cohort.length, defaultRate: cohort.length ? defaults / cohort.length : 0 };
  }));
}

export function distribution(records: CreditRecord[], field: "research_score" | "payment_to_bill_ratio" | "LIMIT_BAL", boundaries: number[]) {
  return boundaries.slice(0, -1).map((minimum, index) => {
    const maximum = boundaries[index + 1];
    const isLast = index === boundaries.length - 2;
    const cohort = records.filter((record) => Number(record[field]) >= minimum && (isLast ? Number(record[field]) <= maximum : Number(record[field]) < maximum));
    const defaults = cohort.reduce((sum, record) => sum + record["default payment next month"], 0);
    return { minimum, maximum, count: cohort.length, defaultRate: cohort.length ? defaults / cohort.length : 0 };
  });
}

export function sequenceProfile(records: CreditRecord[]) {
  const average = (field: keyof CreditRecord) => records.length ? total(records, field) / records.length : 0;
  return {
    repayment: STATEMENT_KEYS.map((field) => ({ label: field, value: average(field) })),
    bills: BILL_KEYS.map((field, index) => ({ label: `Position ${index + 1}`, value: average(field) })),
    payments: PAYMENT_KEYS.map((field, index) => ({ label: `Position ${index + 1}`, value: average(field) })),
  };
}

export function repaymentComposition(records: CreditRecord[]) {
  const groups = [
    { label: "Paid / no consumption", match: (value: number) => value <= -1 },
    { label: "Current", match: (value: number) => value === 0 },
    { label: "1-month delay", match: (value: number) => value === 1 },
    { label: "2-month delay", match: (value: number) => value === 2 },
    { label: "3+ month delay", match: (value: number) => value >= 3 },
  ];
  return groups.map((group) => ({
    label: group.label,
    values: STATEMENT_KEYS.map((field) => {
      const count = records.filter((record) => group.match(record[field])).length;
      return { status: 0, share: records.length ? count / records.length : 0 };
    }),
  }));
}

export type ReviewScenario = Threshold & {
  sampleSize: number;
  queueSize: number;
  totalDefaults: number;
  nonDefaultReviews: number;
  lift: number;
  incrementalYield: number | null;
};

export function reviewScenarios(model: Model): ReviewScenario[] {
  const sampleSize = model.lift_by_decile.reduce((sum, row) => sum + row.n, 0);
  const first = model.threshold_tradeoffs.find((row) => row.recall > 0);
  const totalDefaults = first ? Math.round(first.captured_defaults / first.recall) : 0;
  const prevalence = sampleSize ? totalDefaults / sampleSize : 0;
  return model.threshold_tradeoffs.map((row, index, rows) => {
    const queueSize = Math.round(sampleSize * row.review_rate);
    const previous = rows[index - 1];
    const previousQueue = previous ? Math.round(sampleSize * previous.review_rate) : 0;
    const incrementalYield = previous ? (row.captured_defaults - previous.captured_defaults) / (queueSize - previousQueue) : null;
    return {
      ...row,
      sampleSize,
      queueSize,
      totalDefaults,
      nonDefaultReviews: queueSize - row.captured_defaults,
      lift: prevalence ? row.precision / prevalence : 0,
      incrementalYield,
    };
  });
}

export function cumulativeGains(model: Model) {
  const totalDefaults = model.lift_by_decile.reduce((sum, row) => sum + row.default_rate * row.n, 0);
  let captured = 0;
  return model.lift_by_decile.map((row) => {
    captured += row.default_rate * row.n;
    return { decile: row.decile, populationShare: row.decile / model.lift_by_decile.length, gain: totalDefaults ? captured / totalDefaults : 0, lift: row.lift };
  });
}

export function sortRecords(records: CreditRecord[], key: keyof CreditRecord, direction: "asc" | "desc") {
  return [...records].sort((left, right) => {
    const a = left[key];
    const b = right[key];
    const result = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));
    return direction === "asc" ? result : -result;
  });
}
