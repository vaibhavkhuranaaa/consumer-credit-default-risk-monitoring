#!/usr/bin/env python3
"""Verify an explicitly approved deployment without collecting visitor data."""

from __future__ import annotations

import argparse
import json
import urllib.request
from typing import Any

MAX_RESPONSE_BYTES = 25 * 1024 * 1024
USER_AGENT = "consumer-credit-release-verifier/1.0"
PROTECTED_FIELDS = {"SEX", "EDUCATION", "MARRIAGE", "AGE"}
SECURITY_HEADERS = {
    "content-security-policy",
    "permissions-policy",
    "referrer-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
}


def fetch(url: str) -> tuple[dict[str, str], bytes]:
    request = urllib.request.Request(
        url,
        headers={"Accept": "application/json, text/html", "User-Agent": USER_AGENT},
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        body = response.read(MAX_RESPONSE_BYTES + 1)
        if len(body) > MAX_RESPONSE_BYTES:
            raise ValueError(f"Response exceeds {MAX_RESPONSE_BYTES} bytes: {url}")
        return {key.lower(): value for key, value in response.headers.items()}, body


def validate_security(headers: dict[str, str], label: str) -> None:
    missing = SECURITY_HEADERS.difference(headers)
    if missing:
        raise ValueError(f"{label} is missing security headers: {sorted(missing)}")


def validate_payloads(
    health: dict[str, Any],
    release: dict[str, Any],
    artifact: dict[str, Any],
    expected_release_id: str,
    expected_revision: str,
) -> None:
    if health.get("status") != "ready" or health.get("checks") != {"database": "reachable", "current_release": "available"}:
        raise ValueError("Health endpoint is not ready.")
    if release.get("release_id") != expected_release_id or release.get("code_revision") != expected_revision:
        raise ValueError("Aggregate release lineage does not match the approved deployment.")
    health_release = health.get("release", {})
    if health_release.get("release_id") != expected_release_id or health_release.get("code_revision") != expected_revision:
        raise ValueError("Health and aggregate release lineage disagree.")
    if artifact.get("version") != 3:
        raise ValueError("Deployed analyst artifact version is not 3.")
    source = artifact.get("source", {})
    records = artifact.get("records", [])
    if source.get("rows") != 30_000 or len(records) != 30_000:
        raise ValueError("Deployed analyst artifact row count is invalid.")
    if source.get("protected_attribute_boundary") != "local fairness audit only":
        raise ValueError("Deployed protected-attribute boundary is invalid.")
    if any(PROTECTED_FIELDS.intersection(record) for record in records):
        raise ValueError("Deployed analyst artifact exposes protected attributes.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="https://consumer-credit-default-risk-monitoring.pages.dev")
    parser.add_argument("--expected-release-id", required=True)
    parser.add_argument("--expected-revision", required=True)
    args = parser.parse_args()
    base = args.base_url.rstrip("/")
    root_headers, _ = fetch(base)
    health_headers, health_bytes = fetch(f"{base}/api/v1/health")
    release_headers, release_bytes = fetch(f"{base}/api/v1/releases/current")
    artifact_headers, artifact_bytes = fetch(f"{base}/data/analyst-workspace.json")
    for label, headers in (("site", root_headers), ("health", health_headers), ("release", release_headers), ("artifact", artifact_headers)):
        validate_security(headers, label)
    if "no-store" not in health_headers.get("cache-control", ""):
        raise ValueError("Health endpoint must not be cached.")
    if "s-maxage" not in release_headers.get("cache-control", ""):
        raise ValueError("Aggregate release needs an edge-cache contract.")
    if "must-revalidate" not in artifact_headers.get("cache-control", ""):
        raise ValueError("Analyst artifact needs a revalidation contract.")
    validate_payloads(
        json.loads(health_bytes),
        json.loads(release_bytes),
        json.loads(artifact_bytes),
        args.expected_release_id,
        args.expected_revision,
    )
    print("Live availability, security headers, cache policy, lineage, and privacy boundary: pass")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
