export type MetricSet = { auroc: number; pr_auc: number; brier: number; ece_10_bin: number };
export type Threshold = { capacity: number; review_rate: number; precision: number; recall: number; captured_defaults: number };
export type Group = { group: string; n: number; default_rate: number; auroc: number; mean_score: number };
export type Model = { metrics: MetricSet; confidence_intervals_95: Record<string, [number, number]>; threshold_tradeoffs: Threshold[]; lift_by_decile: { decile: number; n: number; default_rate: number; lift: number }[]; calibration_curve: { bin: string; n: number; mean_score: number; observed_rate: number }[]; aggregate_fairness_diagnostics?: Record<string, Group[]> };
export type Release = {
  version: 1;
  release_id: string;
  released_at: string;
  code_revision: string;
  scope: string;
  source: { dataset_id: string; license: string; archive_sha256: string; validation: { rows: number; columns: number; missing_cells: number; duplicate_ids: number } };
  split: { method: string; random_state: number; limitation: string };
  feature_policy: { included_count: number; excluded: string[] };
  selection: { selected_model: string; gate: string; eligible_models: string[]; status: string };
  models: Record<string, Model>;
};

export type Evaluation = Pick<Release, "scope" | "split" | "feature_policy" | "selection" | "models">;

export type CreditRecord = {
  ID: number;
  LIMIT_BAL: number;
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
  research_score: number;
  score_band: string;
  utilization_proxy: number;
  payment_to_bill_ratio: number;
  mean_repayment_status: number;
  delinquency_severity: string;
  limit_band: string;
};

export type PublicDataset = {
  version: 3;
  source: { dataset_id: string; citation: string; license: string; archive_sha256: string; evaluation_sha256: string; rows: number; columns: string[]; selected_model: string; protected_attribute_boundary: "local fairness audit only" };
  records: CreditRecord[];
  evidence: Evaluation;
};
