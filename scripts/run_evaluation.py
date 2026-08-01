from pathlib import Path

from credit_risk.pipeline import run


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    results = run(
        root / "data/raw/default of credit card clients.xls",
        root / "artifacts",
        root / "data/derived",
    )
    print("Evaluation complete:", results["models"]["calibrated_hist_gradient_boosting"]["metrics"])
