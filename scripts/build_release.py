"""Build a validated aggregate release artifact; this command does not access the cloud."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import yaml

from credit_risk.paths import data_manifest_path
from credit_risk.release_contract import build_release, read_json


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--revision", required=True, help="Immutable Git revision intended for release")
    parser.add_argument("--output", type=Path, default=Path("artifacts/release.json"))
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    release = build_release(
        read_json(root / "artifacts/evaluation.json"),
        yaml.safe_load(data_manifest_path(root).read_text()),
        args.revision,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(release, indent=2) + "\n")
    print(f"Validated aggregate release: {release['release_id']}")


if __name__ == "__main__":
    main()
