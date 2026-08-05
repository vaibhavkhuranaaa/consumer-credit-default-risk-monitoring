export type MetricSet = { auroc: number; pr_auc: number; brier: number; ece_10_bin: number };
export type Threshold = { threshold: number; review_rate: number; precision: number; recall: number };
export type Group = { group: string; n: number; default_rate: number; auroc: number; mean_score: number };
export type Model = { metrics: MetricSet; confidence_intervals_95: Record<string, [number, number]>; threshold_tradeoffs: Threshold[]; aggregate_fairness_diagnostics?: Record<string, Group[]> };
export type Release = {
  version: 1;
  release_id: string;
  released_at: string;
  code_revision: string;
  scope: string;
  source: { dataset_id: string; license: string; archive_sha256: string; validation: { rows: number; columns: number; missing_cells: number; duplicate_ids: number } };
  split: { method: string; random_state: number; limitation: string };
  feature_policy: { included_count: number; excluded: string[] };
  models: { logistic_baseline: Model; calibrated_hist_gradient_boosting: Model };
};

export type CreditRecord = {
  ID: number;
  LIMIT_BAL: number;
  SEX: number;
  EDUCATION: number;
  MARRIAGE: number;
  AGE: number;
  PAY_0: number;
  PAY_2: number;
  PAY_3: number;
  PAY_4: number;
  PAY_5: number;
  PAY_6: number;
  BILL_AMT1: number;
  BILL_AMT2: number;
  BILL_AMT3: number;
  BILL_AMT4: number;
  BILL_AMT5: number;
  BILL_AMT6: number;
  PAY_AMT1: number;
  PAY_AMT2: number;
  PAY_AMT3: number;
  PAY_AMT4: number;
  PAY_AMT5: number;
  PAY_AMT6: number;
  "default payment next month": number;
};

export type PublicDataset = {
  source: { dataset_id: string; citation: string; license: string; archive_sha256: string; rows: number; columns: string[] };
  records: CreditRecord[];
};
