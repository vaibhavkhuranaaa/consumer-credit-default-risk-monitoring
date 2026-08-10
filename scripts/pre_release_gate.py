#!/usr/bin/env python3
"""Run the local, credential-free quality gate required before a release."""

from __future__ import annotations

import argparse
import hashlib
import subprocess
import sys
from pathlib import Path

from credit_risk.release_contract import read_json, validate_release


ROOT = Path(__file__).resolve().parents[1]


def run(command: list[str], *, cwd: Path = ROOT) -> None:
    print("+", " ".join(command), flush=True)
    subprocess.run(command, cwd=cwd, check=True)


def git_output(*args: str) -> str:
    return subprocess.run(
        ["git", *args], cwd=ROOT, check=True, capture_output=True, text=True
    ).stdout.strip()


def validate_artifact(release_file: Path, revision: str) -> str:
    if not release_file.is_file():
        raise ValueError(f"Release artifact not found: {release_file}")
    expected_revision = git_output("rev-parse", "--verify", f"{revision}^{{commit}}")
    payload = read_json(release_file)
    validate_release(payload)
    if payload["code_revision"] != expected_revision:
        raise ValueError(
            "Release artifact revision does not match --revision: "
            f"{payload['code_revision']} != {expected_revision}"
        )
    artifact_hash = hashlib.sha256(release_file.read_bytes()).hexdigest()
    print(
        "Aggregate artifact: pass "
        f"(release_id={payload['release_id']}, sha256={artifact_hash})"
    )
    return artifact_hash


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate a release artifact and run all required local quality checks."
    )
    parser.add_argument("--revision", required=True, help="Immutable Git commit recorded in the artifact")
    parser.add_argument("--release-file", type=Path, default=Path("artifacts/release.json"))
    parser.add_argument(
        "--allow-dirty",
        action="store_true",
        help="Permit a dry run from a modified worktree; never use for deployment.",
    )
    args = parser.parse_args()

    if not args.allow_dirty and git_output("status", "--porcelain"):
        raise ValueError("Worktree is not clean. Commit or discard changes before a release gate.")

    expected_revision = git_output("rev-parse", "--verify", f"{args.revision}^{{commit}}")
    run(["uv", "run", "python", "scripts/run_evaluation.py", "--revision", expected_revision])
    run(["uv", "run", "python", "scripts/build_release.py", "--revision", expected_revision, "--output", str(args.release_file)])
    run(["uv", "run", "python", "scripts/build_public_dataset.py"])
    validate_artifact((ROOT / args.release_file).resolve(), expected_revision)
    run(["uv", "run", "python", "scripts/validate_public_artifact.py"])
    run(["uv", "run", "pytest", "-q"])
    run(["pnpm", "lint"], cwd=ROOT / "web")
    run(["pnpm", "test"], cwd=ROOT / "web")
    run(["pnpm", "build"], cwd=ROOT / "web")
    run(["uv", "run", "python", "scripts/project_kit.py", "check"])
    print("Pre-release gate: pass")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (subprocess.CalledProcessError, ValueError) as error:
        print(f"pre-release gate: {error}", file=sys.stderr)
        raise SystemExit(1) from error
