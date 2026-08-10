import { expect, it } from "vitest";
import { DEFAULT_FILTERS, filterRecords, portfolioSummary, reviewScenarios } from "./analytics";
import type { CreditRecord, Model } from "./types";

const base = { ID: 1, LIMIT_BAL: 100_000, PAY_0: 0, PAY_2: 0, PAY_3: 0, PAY_4: 0, PAY_5: 0, PAY_6: 0, BILL_AMT1: 10, BILL_AMT2: 10, BILL_AMT3: 10, BILL_AMT4: 10, BILL_AMT5: 10, BILL_AMT6: 10, PAY_AMT1: 1, PAY_AMT2: 1, PAY_AMT3: 1, PAY_AMT4: 1, PAY_AMT5: 1, PAY_AMT6: 1, "default payment next month": 0, research_score: .1, score_band: "Low", utilization_proxy: .1, payment_to_bill_ratio: .1, mean_repayment_status: 0, delinquency_severity: "Current or paid", limit_band: "50k–140k" } satisfies CreditRecord;
const records = [base, { ...base, ID: 2, LIMIT_BAL: 300_000, "default payment next month": 1, research_score: .7, score_band: "High", payment_to_bill_ratio: .05, delinquency_severity: "Severe" }] satisfies CreditRecord[];

it("computes traceable cohort metrics and applies linked filters", () => {
  expect(portfolioSummary(records)).toMatchObject({ count: 2, defaults: 1, defaultRate: .5, elevatedCount: 1, limitTotal: 400_000, lowRatio: 1 });
  expect(filterRecords(records, { ...DEFAULT_FILTERS, band: "High", outcome: "default" }).map((record) => record.ID)).toEqual([2]);
});

it("derives workload, non-default reviews, lift, and incremental yield from evaluation evidence", () => {
  const model = { metrics: { auroc: .8, pr_auc: .6, brier: .1, ece_10_bin: .01 }, confidence_intervals_95: {}, lift_by_decile: Array.from({ length: 10 }, (_, index) => ({ decile: index + 1, n: 10, default_rate: .2, lift: 1 })), calibration_curve: [], threshold_tradeoffs: [{ capacity: .1, review_rate: .1, precision: .5, recall: .25, captured_defaults: 5 }, { capacity: .2, review_rate: .2, precision: .4, recall: .4, captured_defaults: 8 }] } satisfies Model;
  const scenarios = reviewScenarios(model);
  expect(scenarios[0]).toMatchObject({ sampleSize: 100, queueSize: 10, totalDefaults: 20, nonDefaultReviews: 5, lift: 2.5, incrementalYield: null });
  expect(scenarios[1].incrementalYield).toBeCloseTo(.3);
});
