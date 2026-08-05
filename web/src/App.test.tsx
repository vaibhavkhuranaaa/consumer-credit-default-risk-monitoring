import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

vi.mock("./api", () => ({
  getPublicDataset: vi.fn(() => Promise.resolve({
    source: { dataset_id: "uci-default-credit-card-clients", citation: "UCI", license: "CC BY 4.0", archive_sha256: "a".repeat(64), rows: 1, columns: [] },
    records: [{ ID: 1, LIMIT_BAL: 50000, SEX: 2, AGE: 31, PAY_0: 0, BILL_AMT1: 12000, "default payment next month": 0 }],
  })),
}));

it("loads the full-record analyst workspace", async () => {
  render(<App />);
  expect(await screen.findByText("Record explorer")).toBeInTheDocument();
  expect(screen.getByText("Full source records")).toBeInTheDocument();
  expect(screen.getByText("1 matching")).toBeInTheDocument();
  expect(screen.getAllByText("No observed default")).toHaveLength(2);
});
