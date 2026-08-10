#!/usr/bin/env python3
"""Write the public source-revision marker after the production build."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


FULL_GIT_SHA = re.compile(r"^[0-9a-f]{40}$")


def write_source_marker(output: Path, revision: str) -> None:
    if not FULL_GIT_SHA.fullmatch(revision):
        raise ValueError("revision must be a full lowercase 40-character Git SHA")
    if not output.parent.is_dir():
        raise ValueError(f"build output directory does not exist: {output.parent}")
    output.write_text(
        json.dumps({"schema_version": 1, "source_sha": revision}, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--revision", required=True)
    parser.add_argument("--output", type=Path, default=Path("web/dist/source.json"))
    args = parser.parse_args()
    write_source_marker(args.output, args.revision)
    print(f"Deployment source marker: {args.revision}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
