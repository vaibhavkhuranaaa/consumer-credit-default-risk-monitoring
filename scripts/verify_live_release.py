#!/usr/bin/env python3
"""Verify an explicitly approved deployment without collecting visitor data."""

from __future__ import annotations

import argparse
import json
import re
import socket
import sys
import urllib.error
import urllib.request
from typing import Any
from urllib.parse import urlsplit

MAX_RESPONSE_BYTES = 25 * 1024 * 1024
USER_AGENT = "consumer-credit-release-verifier/1.0"
RETIRED_SURFACE_URL = "https://consumer-credit-default-risk-monitoring.pages.dev"
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


def verify_retired_surface(retired_url: str, canonical_url: str) -> None:
    target = f"{retired_url.rstrip('/')}/data/uci-credit-records.json"
    request = urllib.request.Request(target, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            final_url = response.geturl()
            body = response.read(8192)
    except urllib.error.HTTPError as error:
        if error.code in {404, 410}:
            return
        if error.code == 530 and error.read(64).strip() == b"error code: 1016":
            return
        raise
    except urllib.error.URLError as error:
        if isinstance(error.reason, socket.gaierror):
            return
        raise
    if urlsplit(final_url).netloc == urlsplit(canonical_url).netloc:
        return
    if any(marker in body for marker in (b'"SEX"', b'"EDUCATION"', b'"MARRIAGE"', b'"AGE"')):
        raise ValueError("A superseded public surface still exposes fields outside the current public boundary.")
    raise ValueError("A superseded public surface is still reachable instead of retired or redirected.")


def validate_payloads(
    health: dict[str, Any],
    release: dict[str, Any],
    artifact: dict[str, Any],
    source_marker: dict[str, Any],
    expected_release_id: str,
    expected_source_sha: str,
) -> None:
    if not re.fullmatch(r"[0-9a-f]{40}", expected_source_sha):
        raise ValueError("Expected source SHA must be a full 40-character Git commit.")
    if health.get("status") != "ready" or health.get("checks") != {"database": "reachable", "current_release": "available"}:
        raise ValueError("Health endpoint is not ready.")
    if release.get("release_id") != expected_release_id:
        raise ValueError("Aggregate release does not match the approved deployment.")
    health_release = health.get("release", {})
    if health_release.get("release_id") != expected_release_id:
        raise ValueError("Health and aggregate release disagree.")
    if source_marker != {
        "schema_version": 1,
        "status": "published",
        "source_sha": expected_source_sha,
    }:
        raise ValueError("Deployment marker is invalid.")
    public_text = json.dumps((health, release, artifact)).lower()
    if re.search(r'"(?:code_revision|evaluated_revision|source_sha)"', public_text) or re.search(r"(?<![0-9a-f])[0-9a-f]{40}(?![0-9a-f])", public_text):
        raise ValueError("Public deployment exposes repository revision metadata.")
    if artifact.get("version") not in {3, 4}:
        raise ValueError("Deployed analyst artifact version is unsupported.")
    source = artifact.get("source", {})
    records = artifact.get("records", [])
    if source.get("rows") != 30_000 or len(records) != 30_000:
        raise ValueError("Deployed analyst artifact row count is invalid.")
    if source.get("protected_attribute_boundary") != "local fairness audit only":
        raise ValueError("Deployed protected-attribute boundary is invalid.")
    if any(PROTECTED_FIELDS.intersection(record) for record in records):
        raise ValueError("Deployed analyst artifact exposes protected attributes.")
    if artifact.get("version") == 4:
        if source.get("evaluation_schema_version") != 2:
            raise ValueError("Deployed analyst artifact lacks evaluation freshness metadata.")
        ranks = {record.get("research_score_rank") for record in records}
        if ranks != set(range(1, len(records) + 1)):
            raise ValueError("Deployed analyst artifact rank identity is invalid.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="https://consumer-credit-risk-workbench.pages.dev")
    parser.add_argument("--retired-url", default=RETIRED_SURFACE_URL)
    parser.add_argument("--expected-release-id", required=True)
    parser.add_argument("--expected-source-sha", required=True)
    args = parser.parse_args()
    base = args.base_url.rstrip("/")
    root_headers, _ = fetch(base)
    health_headers, health_bytes = fetch(f"{base}/api/v1/health")
    release_headers, release_bytes = fetch(f"{base}/api/v1/releases/current")
    artifact_headers, artifact_bytes = fetch(f"{base}/data/analyst-workspace.json")
    source_headers, source_bytes = fetch(f"{base}/source.json")
    for label, headers in (("site", root_headers), ("health", health_headers), ("release", release_headers), ("artifact", artifact_headers), ("source", source_headers)):
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
        json.loads(source_bytes),
        args.expected_release_id,
        args.expected_source_sha.lower(),
    )
    verify_retired_surface(args.retired_url, base)
    print("Live availability, security headers, cache policy, lineage, and privacy boundary: pass")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, urllib.error.URLError) as error:
        print(f"Live verification: fail: {error}", file=sys.stderr)
        raise SystemExit(1) from error
