import argparse
import subprocess
from pathlib import Path

from credit_risk.pipeline import run


def git_revision(root: Path) -> str:
    return subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=root, check=True, capture_output=True, text=True
    ).stdout.strip()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--revision", help="Exact evaluated Git revision; defaults to HEAD")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    revision = args.revision or git_revision(root)
    command = f"uv run python scripts/run_evaluation.py --revision {revision}"
    results = run(
        root / "data/raw/default of credit card clients.xls",
        root / "artifacts",
        root / "data/derived",
        evaluated_revision=revision,
        command=command,
    )
    print("Evaluation complete:", results["models"]["calibrated_hist_gradient_boosting"]["metrics"])
