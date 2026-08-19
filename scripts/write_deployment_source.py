#!/usr/bin/env python3
"""Write the public deployment marker after the production build."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

SOURCE_SHA_PATTERN = re.compile(r"^[0-9a-f]{40}$")


def write_source_marker(output: Path, source_sha: str) -> None:
    if not output.parent.is_dir():
        raise ValueError(f"build output directory does not exist: {output.parent}")
    normalized_source_sha = source_sha.lower()
    if not SOURCE_SHA_PATTERN.fullmatch(normalized_source_sha):
        raise ValueError("source SHA must be a full 40-character Git commit")
    output.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "status": "published",
                "source_sha": normalized_source_sha,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-sha", required=True)
    parser.add_argument("--output", type=Path, default=Path("web/dist/source.json"))
    args = parser.parse_args()
    write_source_marker(args.output, args.source_sha)
    print(f"Deployment source marker: {args.source_sha.lower()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
