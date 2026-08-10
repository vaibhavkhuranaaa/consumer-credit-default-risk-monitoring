import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import App from "./App";

const mocks = vi.hoisted(() => ({ getPublicDataset: vi.fn(), getCurrentRelease: vi.fn(), getHealth: vi.fn() }));
vi.mock("./api", () => ({ getPublicDataset: mocks.getPublicDataset, getCurrentRelease: mocks.getCurrentRelease, getHealth: mocks.getHealth }));

const model = {
  metrics: { auroc: .79, pr_auc: .57, brier: .13, ece_10_bin: .01 },
  confidence_intervals_95: { auroc: [.77, .81], pr_auc: [.5, .6], brier: [.12, .14] },
  threshold_tradeoffs: [.05,.1,.2,.35,.5].map((capacity,index) => ({ capacity, review_rate: capacity, queue_size: index+1, precision: .5, recall: capacity, captured_defaults: index+1, non_default_reviews: 0, lift_vs_random: 2, incremental_yield: index ? .5 : null, confidence_intervals_95: { captured_defaults: [index+1,index+1], non_default_reviews: [0,0], precision: [.4,.6], recall: [capacity,capacity], lift_vs_random: [1.5,2.5], incremental_yield: index ? [.4,.6] : null } })),
  lift_by_decile: Array.from({ length: 10 }, (_, index) => ({ decile: index + 1, n: 10, default_rate: index < 2 ? .5 : .1, lift: index < 2 ? 2.5 : .5 })),
  calibration_curve: [{ bin: "0.1-0.2", n: 100, mean_score: .15, observed_rate: .16, sparse: false, warning: null }],
  calibration_diagnostics: { slope: 1.02, intercept: .01, ideal_slope: 1, ideal_intercept: 0, sparse_bin_threshold: "n < 100", sparse_bins: [], warning: null },
  non_demographic_cohort_robustness: [{ dimension: "credit_limit_band", group: "≤50k", n: 100, observed_defaults: 20, observed_default_rate: .2, sample_size_status: "limited", warning: "Interpret cautiously", metrics: { auroc: .7, pr_auc: .4, brier: .2, ece_10_bin: .02 }, confidence_intervals_95: { pr_auc: [.3,.5] } }],
};

const dataset = {
  version: 4,
  source: {
    dataset_id: "uci",
    citation: "UCI citation",
    license: "CC BY 4.0",
    archive_sha256: "a".repeat(64),
    source_file_sha256: "c".repeat(64),
    evaluation_sha256: "b".repeat(64),
    evaluation_schema_version: 2,
    evaluation_generated_at_utc: "2026-08-10T00:00:00Z",
    evaluated_revision: "abcdef123456",
    rows: 2,
    columns: ["ID", "LIMIT_BAL"],
    selected_model: "calibrated_hist_gradient_boosting",
    rank_method: "score descending; ties by ID",
    protected_attribute_boundary: "local fairness audit only",
  },
  records: [
    { ID: 1, LIMIT_BAL: 50_000, PAY_0: 0, PAY_2: 0, PAY_3: 0, PAY_4: 0, PAY_5: 0, PAY_6: 0, BILL_AMT1: 12_000, BILL_AMT2: 10_000, BILL_AMT3: 8_000, BILL_AMT4: 6_000, BILL_AMT5: 4_000, BILL_AMT6: 2_000, PAY_AMT1: 1_000, PAY_AMT2: 1_000, PAY_AMT3: 1_000, PAY_AMT4: 1_000, PAY_AMT5: 1_000, PAY_AMT6: 1_000, "default payment next month": 0, research_score: .1, research_score_rank: 2, score_band: "Low", utilization_proxy: .2, payment_to_bill_ratio: .1, mean_repayment_status: 0, delinquency_severity: "Current or paid", limit_band: "≤50k" },
    { ID: 2, LIMIT_BAL: 200_000, PAY_0: 2, PAY_2: 2, PAY_3: 1, PAY_4: 0, PAY_5: 0, PAY_6: 0, BILL_AMT1: 100_000, BILL_AMT2: 90_000, BILL_AMT3: 80_000, BILL_AMT4: 70_000, BILL_AMT5: 60_000, BILL_AMT6: 50_000, PAY_AMT1: 500, PAY_AMT2: 500, PAY_AMT3: 500, PAY_AMT4: 500, PAY_AMT5: 500, PAY_AMT6: 500, "default payment next month": 1, research_score: .7, research_score_rank: 1, score_band: "High", utilization_proxy: .5, payment_to_bill_ratio: .01, mean_repayment_status: .83, delinquency_severity: "Delayed", limit_band: "140k–300k" },
  ],
  evidence: {
    schema_version: 2, generated_at_utc: "2026-08-10T00:00:00Z", scope: "research",
    readiness: { verdict: "Usable for retrospective research simulation; not validated for lending use.", supported_uses: ["Retrospective comparison"], prohibited_uses: ["Lending decisions"], limitation: "No out-of-time validation." },
    lineage: { source_sha256: "c".repeat(64), evaluated_revision: "abcdef123456", command: "test command", tool_versions: { python: "3.12" } },
    split: { method: "fixed stratified holdout", random_state: 1, identity: { train: { rows: 1, ids_sha256: "1" }, validation: { rows: 1, ids_sha256: "2" }, development: { rows: 2, ids_sha256: "3" }, holdout: { rows: 2, ids_sha256: "4".repeat(64), frozen: true } }, holdout_policy: "frozen", limitation: "No out-of-time split." },
    feature_policy: { included_count: 19, excluded: ["AGE"] }, selection: { selected_model: "calibrated_hist_gradient_boosting", gate: "validation", eligible_models: [], status: "promoted", locked_before_holdout_audit: true }, baselines: {},
    models: { prevalence_random_baseline: model, repayment_delay_rule: model, logistic_baseline: model, calibrated_hist_gradient_boosting: model, calibrated_extra_trees: model },
    development_evaluation: { method: "2 repeats of 3-fold stratified evaluation", identical_folds_across_models: true, development_n: 2, split_count: 6, models: { calibrated_hist_gradient_boosting: { pr_auc: { mean: .55, range_95: [.5,.6], split_values: [.5] }, brier: { mean: .13, range_95: [.12,.14], split_values: [.13] }, auroc: { mean: .79, range_95: [.77,.81], split_values: [.79] }, ece_10_bin: { mean: .01, range_95: [.01,.02], split_values: [.01] } } }, paired_comparisons: [{ selected_model: "calibrated_hist_gradient_boosting", reference: "calibrated_extra_trees", overall_status: "tie", metrics: { pr_auc: { mean_selected_minus_reference: .004, confidence_interval_95: [-.002,.01], practical_resolution_margin: .01, status: "tie" }, auroc: { mean_selected_minus_reference: .002, confidence_interval_95: [-.001,.004], practical_resolution_margin: .005, status: "tie" }, brier: { mean_selected_minus_reference: -.001, confidence_interval_95: [-.002,.001], practical_resolution_margin: .002, status: "tie" }, ece_10_bin: { mean_selected_minus_reference: 0, confidence_interval_95: [-.002,.002], practical_resolution_margin: .005, status: "tie" } } }], feature_group_ablations: [{ feature_group: "repayment_status", removed_features: ["PAY_0"], overall_status: "reliance_signal", metrics: { pr_auc: { mean_performance_loss_when_removed: .1, confidence_interval_95: [.08,.12], status: "reliance_signal" }, auroc: { mean_performance_loss_when_removed: .05, confidence_interval_95: [.04,.06], status: "reliance_signal" }, brier: { mean_performance_loss_when_removed: .01, confidence_interval_95: [.01,.02], status: "reliance_signal" }, ece_10_bin: { mean_performance_loss_when_removed: 0, confidence_interval_95: [-.01,.01], status: "tie" } }, interpretation_boundary: "reliance only" }], tie_rule: "Tie when unresolved.", limitation: "Development evidence only." },
  },
};

beforeEach(() => {
  mocks.getPublicDataset.mockReset().mockResolvedValue(dataset);
  mocks.getCurrentRelease.mockReset().mockRejectedValue(new Error("local preview"));
  mocks.getHealth.mockReset().mockRejectedValue(new Error("local preview"));
});

it("loads the decision hierarchy and cross-filters to an empty governed cohort", async () => {
  render(<App />);
  expect(await screen.findByText("Portfolio overview")).toBeInTheDocument();
  expect(screen.getByText("50%", { selector: ".primary-kpi strong" })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Research-risk band"), { target: { value: "Elevated" } });
  expect(await screen.findByText("No records match this cohort")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Reset cohort filters" }));
  expect(await screen.findByText("Portfolio overview")).toBeInTheDocument();
});

it("preserves review, governance refusal, and constrained record simulation workflows", async () => {
  const { container } = render(<App />);
  await screen.findByText("Portfolio overview");
  fireEvent.click(screen.getByRole("button", { name: "Capacity" }));
  expect(screen.getByText("Review-capacity analysis")).toBeInTheDocument();
  expect(screen.getByText("Capture lift vs random")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Validation" }));
  expect(screen.getByText("Tie", { selector: "td" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "View governed refusal" }));
  expect(screen.getByText("Request refused by design")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Records" }));
  const recordLayout = container.querySelector<HTMLElement>(".record-layout")!;
  expect(within(recordLayout).queryByText("Reported limit")).not.toBeInTheDocument();
  expect(within(recordLayout).queryByText("Payment / bill")).not.toBeInTheDocument();
  const row = within(recordLayout.querySelector<HTMLElement>(".desktop-record-table")!).getByText("#2").closest("tr")!;
  fireEvent.click(within(row).getByRole("button", { name: "Inspect research simulation for source record 2" }));
  expect(screen.getByText("High research band", { selector: ".record-inspector span" })).toBeInTheDocument();
  expect(screen.getByText("Inside simulated review set", { selector: "h3" })).toBeInTheDocument();
  expect(screen.getByText(/Retrospective research simulation only — not an approval/)).toBeInTheDocument();
});

it("fails closed and recovers through the governed retry", async () => {
  mocks.getPublicDataset.mockRejectedValueOnce(new Error("Evidence unavailable")).mockResolvedValueOnce(dataset);
  render(<App />);
  expect(await screen.findByText("Analyst evidence is unavailable")).toBeInTheDocument();
  expect(screen.getByText(/No record data was exposed/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Retry evidence load" }));
  expect(await screen.findByText("Portfolio overview")).toBeInTheDocument();
});
