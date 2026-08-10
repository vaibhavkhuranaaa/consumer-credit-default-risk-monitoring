import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import App from "./App";

const mocks = vi.hoisted(() => ({ getPublicDataset: vi.fn(), getCurrentRelease: vi.fn(), getHealth: vi.fn() }));
vi.mock("./api", () => ({ getPublicDataset: mocks.getPublicDataset, getCurrentRelease: mocks.getCurrentRelease, getHealth: mocks.getHealth }));

const model = {
  metrics: { auroc: .79, pr_auc: .57, brier: .13, ece_10_bin: .01 },
  confidence_intervals_95: { auroc: [.77, .81], pr_auc: [.5, .6], brier: [.12, .14] },
  threshold_tradeoffs: [
    { capacity: .05, review_rate: .05, precision: .7, recall: .2, captured_defaults: 1 },
    { capacity: .2, review_rate: .2, precision: .5, recall: .5, captured_defaults: 2 },
  ],
  lift_by_decile: Array.from({ length: 10 }, (_, index) => ({ decile: index + 1, n: 10, default_rate: index < 2 ? .5 : .1, lift: index < 2 ? 2.5 : .5 })),
  calibration_curve: [{ bin: "0.1-0.2", n: 100, mean_score: .15, observed_rate: .16 }],
};

const dataset = {
  version: 3,
  source: {
    dataset_id: "uci",
    citation: "UCI citation",
    license: "CC BY 4.0",
    archive_sha256: "a".repeat(64),
    evaluation_sha256: "b".repeat(64),
    rows: 2,
    columns: ["ID", "LIMIT_BAL"],
    selected_model: "calibrated_hist_gradient_boosting",
    protected_attribute_boundary: "local fairness audit only",
  },
  records: [
    { ID: 1, LIMIT_BAL: 50_000, PAY_0: 0, PAY_2: 0, PAY_3: 0, PAY_4: 0, PAY_5: 0, PAY_6: 0, BILL_AMT1: 12_000, BILL_AMT2: 10_000, BILL_AMT3: 8_000, BILL_AMT4: 6_000, BILL_AMT5: 4_000, BILL_AMT6: 2_000, PAY_AMT1: 1_000, PAY_AMT2: 1_000, PAY_AMT3: 1_000, PAY_AMT4: 1_000, PAY_AMT5: 1_000, PAY_AMT6: 1_000, "default payment next month": 0, research_score: .1, score_band: "Low", utilization_proxy: .2, payment_to_bill_ratio: .1, mean_repayment_status: 0, delinquency_severity: "Current or paid", limit_band: "≤50k" },
    { ID: 2, LIMIT_BAL: 200_000, PAY_0: 2, PAY_2: 2, PAY_3: 1, PAY_4: 0, PAY_5: 0, PAY_6: 0, BILL_AMT1: 100_000, BILL_AMT2: 90_000, BILL_AMT3: 80_000, BILL_AMT4: 70_000, BILL_AMT5: 60_000, BILL_AMT6: 50_000, PAY_AMT1: 500, PAY_AMT2: 500, PAY_AMT3: 500, PAY_AMT4: 500, PAY_AMT5: 500, PAY_AMT6: 500, "default payment next month": 1, research_score: .7, score_band: "High", utilization_proxy: .5, payment_to_bill_ratio: .01, mean_repayment_status: .83, delinquency_severity: "Delayed", limit_band: "140k–300k" },
  ],
  evidence: { scope: "research", split: { method: "fixed stratified holdout", random_state: 1, limitation: "No out-of-time split." }, feature_policy: { included_count: 19, excluded: ["AGE"] }, selection: { selected_model: "calibrated_hist_gradient_boosting", gate: "validation", eligible_models: [], status: "promoted" }, models: { logistic_baseline: model, calibrated_hist_gradient_boosting: model, calibrated_extra_trees: model } },
};

beforeEach(() => {
  mocks.getPublicDataset.mockReset().mockResolvedValue(dataset);
  mocks.getCurrentRelease.mockReset().mockRejectedValue(new Error("local preview"));
  mocks.getHealth.mockReset().mockRejectedValue(new Error("local preview"));
});

it("loads the decision hierarchy and cross-filters to an empty governed cohort", async () => {
  render(<App />);
  expect(await screen.findByText("Where is historical risk concentrated?")).toBeInTheDocument();
  expect(screen.getByText("50%", { selector: ".primary-kpi strong" })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Research-risk band"), { target: { value: "Elevated" } });
  expect(await screen.findByText("No records match this cohort")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Reset cohort filters" }));
  expect(await screen.findByText("Where is historical risk concentrated?")).toBeInTheDocument();
});

it("preserves review, governance refusal, and record inspection workflows", async () => {
  render(<App />);
  await screen.findByText("Where is historical risk concentrated?");
  fireEvent.click(screen.getByRole("button", { name: /Review planning/ }));
  expect(screen.getByText("What workload buys the strongest historical capture?")).toBeInTheDocument();
  expect(screen.getByText("Capture lift vs random")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Model assurance/ }));
  fireEvent.click(screen.getByRole("button", { name: "View governed refusal" }));
  expect(screen.getByText("Request refused by design")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Record review/ }));
  const row = screen.getByText("#2").closest("tr")!;
  fireEvent.click(within(row).getByRole("button", { name: "Inspect source record 2" }));
  expect(screen.getByText("High research band")).toBeInTheDocument();
  expect(screen.getByText("Research evidence, not a decision")).toBeInTheDocument();
});

it("fails closed and recovers through the governed retry", async () => {
  mocks.getPublicDataset.mockRejectedValueOnce(new Error("Evidence unavailable")).mockResolvedValueOnce(dataset);
  render(<App />);
  expect(await screen.findByText("Analyst evidence is unavailable")).toBeInTheDocument();
  expect(screen.getByText(/No record data was exposed/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Retry evidence load" }));
  expect(await screen.findByText("Where is historical risk concentrated?")).toBeInTheDocument();
});
