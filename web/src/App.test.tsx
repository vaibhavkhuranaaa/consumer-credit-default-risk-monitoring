import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

vi.mock("./api", () => ({ getCurrentRelease: vi.fn(() => Promise.reject(new Error("Evidence is temporarily unavailable. Please try again shortly."))) }));

it("fails closed when the public evidence endpoint is unavailable", async () => {
  render(<App />);
  expect(await screen.findByText("Evidence unavailable")).toBeInTheDocument();
  expect(screen.getByText(/individual account records are never exposed/i)).toBeInTheDocument();
});
