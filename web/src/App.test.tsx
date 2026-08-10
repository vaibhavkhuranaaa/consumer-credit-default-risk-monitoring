import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import App from "./App";

const mocks = vi.hoisted(() => ({ getPublicDataset: vi.fn() }));
vi.mock("./api", () => ({ getPublicDataset: mocks.getPublicDataset }));

const model = {
  metrics: { auroc: .79, pr_auc: .57, brier: .13, ece_10_bin: .01 },
  confidence_intervals_95: { pr_auc: [.5, .6] },
  threshold_tradeoffs: [{ capacity: .2, review_rate: .2, precision: .5, recall: .5, captured_defaults: 1 }],
  lift_by_decile: [],
  calibration_curve: [],
};

const dataset = {
  version: 3,
  source: {
    dataset_id: "uci",
    citation: "UCI",
    license: "CC BY 4.0",
    archive_sha256: "a".repeat(64),
    evaluation_sha256: "b".repeat(64),
    rows: 1,
    columns: [],
    selected_model: "calibrated_hist_gradient_boosting",
    protected_attribute_boundary: "local fairness audit only",
  },
  records: [{ ID: 1, LIMIT_BAL: 50_000, PAY_0: 0, PAY_2: 0, PAY_3: 0, PAY_4: 0, PAY_5: 0, PAY_6: 0, BILL_AMT1: 12_000, BILL_AMT2: 0, BILL_AMT3: 0, BILL_AMT4: 0, BILL_AMT5: 0, BILL_AMT6: 0, PAY_AMT1: 0, PAY_AMT2: 0, PAY_AMT3: 0, PAY_AMT4: 0, PAY_AMT5: 0, PAY_AMT6: 0, "default payment next month": 0, research_score: .1, score_band: "Low", utilization_proxy: .2, payment_to_bill_ratio: 0, mean_repayment_status: 0, delinquency_severity: "Current or paid", limit_band: "≤50k" }],
  evidence: { scope: "research", split: { method: "fixed", random_state: 1, limitation: "retrospective" }, feature_policy: { included_count: 19, excluded: [] }, selection: { selected_model: "calibrated_hist_gradient_boosting", gate: "validation", eligible_models: [], status: "promoted" }, models: { logistic_baseline: model, calibrated_hist_gradient_boosting: model, calibrated_extra_trees: model } },
};

beforeEach(() => mocks.getPublicDataset.mockReset());

it("loads executive and analyst views", async () => {
  mocks.getPublicDataset.mockResolvedValue(dataset);
  render(<App />);
  expect(await screen.findByText("Executive overview")).toBeInTheDocument();
  expect(screen.getByText("Observed default rate")).toBeInTheDocument();
  expect(screen.getAllByText("Portfolio workbench").length).toBeGreaterThan(0);
});

it("fails closed and recovers through the governed retry", async () => {
  mocks.getPublicDataset.mockRejectedValueOnce(new Error("Evidence unavailable")).mockResolvedValueOnce(dataset);
  render(<App />);
  expect(await screen.findByText("Analyst artifact unavailable")).toBeInTheDocument();
  expect(screen.getByText(/No record data was exposed/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Retry evidence load" }));
  expect(await screen.findByText("Executive overview")).toBeInTheDocument();
});
