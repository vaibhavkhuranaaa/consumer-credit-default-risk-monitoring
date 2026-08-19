"""Paths for inputs that intentionally stay outside the public repository."""

from __future__ import annotations

import os
from pathlib import Path


def data_manifest_path(repo: Path) -> Path:
    """Locate the private data manifest without putting delivery state in Git."""
    configured = os.getenv("CREDIT_RISK_DATA_MANIFEST")
    if configured:
        path = Path(configured).expanduser()
        return path if path.is_absolute() else repo / path
    return repo.parent / f"{repo.name}-ops" / ".project" / "data-manifest.yml"
