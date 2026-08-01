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
