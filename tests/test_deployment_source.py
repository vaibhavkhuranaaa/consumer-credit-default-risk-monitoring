import json

import pytest

from scripts.write_deployment_source import write_source_marker


def test_writes_exact_deployment_source_marker(tmp_path) -> None:
    output = tmp_path / "source.json"
    source_sha = "a" * 40

    write_source_marker(output, source_sha)

    assert json.loads(output.read_text()) == {
        "schema_version": 1,
        "status": "published",
        "source_sha": source_sha,
    }


def test_rejects_invalid_deployment_source_sha(tmp_path) -> None:
    with pytest.raises(ValueError, match="40-character"):
        write_source_marker(tmp_path / "source.json", "not-a-commit")
