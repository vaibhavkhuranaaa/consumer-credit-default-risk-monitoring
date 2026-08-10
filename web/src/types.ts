export type Interval = [number, number];
export type MetricSet = { auroc: number; pr_auc: number; brier: number; ece_10_bin: number };
export type CapacityIntervals = Record<string, Interval | null>;
export type Threshold = {
  capacity: number;
  review_rate: number;
  queue_size: number;
  precision: number;
  recall: number;
  captured_defaults: number;
  non_default_reviews: number;
  lift_vs_random: number;
  incremental_yield: number | null;
  confidence_intervals_95: CapacityIntervals | null;
};
export type Group = { group: string; n: number; default_rate: number; auroc: number; mean_score: number };
export type CalibrationPoint = { bin: string; n: number; mean_score: number; observed_rate: number; sparse: boolean; warning: string | null };
export type RobustnessRow = {
  dimension: string;
  group: string;
  n: number;
  observed_defaults: number;
  observed_default_rate: number;
  sample_size_status: "adequate" | "limited" | "unavailable";
  warning: string | null;
  metrics: MetricSet | null;
  confidence_intervals_95: Record<string, Interval> | null;
};
export type Model = {
  metrics: MetricSet;
  confidence_intervals_95: Record<string, Interval>;
  threshold_tradeoffs: Threshold[];
  lift_by_decile: { decile: number; n: number; default_rate: number; lift: number }[];
  calibration_curve: CalibrationPoint[];
  calibration_diagnostics: { intercept: number; slope: number; ideal_intercept: number; ideal_slope: number; sparse_bin_threshold: string; sparse_bins: string[]; warning: string | null };
  non_demographic_cohort_robustness?: RobustnessRow[];
};
export type PairedMetric = { mean_selected_minus_reference: number; confidence_interval_95: Interval; practical_resolution_margin: number; status: "selected_better" | "reference_better" | "tie" };
export type PairedComparison = { selected_model: string; reference: string; overall_status: "selected_better" | "reference_better" | "tie"; metrics: Record<keyof MetricSet, PairedMetric> };
export type Ablation = { feature_group: string; removed_features: string[]; overall_status: string; metrics: Record<keyof MetricSet, { mean_performance_loss_when_removed: number; confidence_interval_95: Interval; status: string }>; interpretation_boundary: string };
export type DevelopmentEvaluation = {
  method: string;
  identical_folds_across_models: boolean;
  development_n: number;
  split_count: number;
  models: Record<string, Record<keyof MetricSet, { mean: number; range_95: Interval; split_values: number[] }>>;
  paired_comparisons: PairedComparison[];
  feature_group_ablations: Ablation[];
  tie_rule: string;
  limitation: string;
};
export type Evaluation = {
  schema_version: 2;
  generated_at_utc: string;
  scope: string;
  readiness: { verdict: string; supported_uses: string[]; prohibited_uses: string[]; limitation: string };
  lineage: { source_sha256: string; evaluated_revision: string; command: string; tool_versions: Record<string, string> };
  split: {
    method: string;
    random_state: number;
    identity: Record<"train" | "validation" | "development" | "holdout", { rows: number; ids_sha256: string; frozen?: boolean }>;
    holdout_policy: string;
    limitation: string;
  };
  feature_policy: { included_count: number; excluded: string[] };
  selection: { selected_model: string; gate: string; eligible_models: string[]; status: string; locked_before_holdout_audit: true };
  baselines: Record<string, { definition: string; uses_target_for_fitting: boolean; policy_boundary?: string }>;
  models: Record<string, Model>;
  development_evaluation: DevelopmentEvaluation;
};

export type Release = {
  version: 1 | 2;
  release_id: string;
  released_at: string;
  code_revision: string;
  scope: string;
  source: { dataset_id: string; license: string; archive_sha256: string; source_file_sha256?: string; validation: { rows: number; columns: number; missing_cells: number; duplicate_ids: number } };
  split: { method: string; random_state: number; limitation: string };
  feature_policy: { included_count: number; excluded: string[] };
  selection: { selected_model: string; gate: string; eligible_models: string[]; status: string };
  models: Record<string, Model>;
};

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
  research_score_rank: number;
  score_band: string;
  utilization_proxy: number;
  payment_to_bill_ratio: number;
  mean_repayment_status: number;
  delinquency_severity: string;
  limit_band: string;
};

export type PublicDataset = {
  version: 4;
  source: {
    dataset_id: string;
    citation: string;
    license: string;
    archive_sha256: string;
    source_file_sha256: string;
    evaluation_sha256: string;
    evaluation_schema_version: 2;
    evaluation_generated_at_utc: string;
    evaluated_revision: string;
    rows: number;
    columns: string[];
    selected_model: string;
    rank_method: string;
    protected_attribute_boundary: "local fairness audit only";
  };
  records: CreditRecord[];
  evidence: Evaluation;
};

export type Health = {
  status: "ready" | "unavailable";
  checks?: { database?: string; current_release?: string };
  release?: { release_id: string; released_at: string; code_revision: string };
};
