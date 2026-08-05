"""Build the approved, full-record UCI artifact used by the analyst workspace."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import yaml

from credit_risk.pipeline import load_and_validate


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("web/public/data/uci-credit-records.json"),
    )
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    manifest = yaml.safe_load((root / ".project/data-manifest.yml").read_text())["datasets"][0]
    frame = load_and_validate(root / manifest["extracted_file"])
    artifact = {
        "version": 1,
        "source": {
            "dataset_id": manifest["id"],
            "citation": manifest["citation"],
            "license": manifest["license"],
            "archive_sha256": manifest["archive_sha256"],
            "rows": len(frame),
            "columns": list(frame.columns),
        },
        "records": json.loads(frame.to_json(orient="records")),
    }
    output = (root / args.output).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(artifact, separators=(",", ":")) + "\n")
    digest = hashlib.sha256(output.read_bytes()).hexdigest()
    print(f"Public UCI artifact: {output} ({len(frame)} records, sha256={digest})")


if __name__ == "__main__":
    main()
