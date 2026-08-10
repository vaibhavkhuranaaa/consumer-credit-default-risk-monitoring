import json

import pytest

from scripts.write_deployment_source import write_source_marker


def test_writes_anonymous_deployment_source_marker(tmp_path) -> None:
    output = tmp_path / "source.json"
    revision = "a" * 40

    write_source_marker(output, revision)

    assert json.loads(output.read_text()) == {
        "schema_version": 1,
        "source_sha": revision,
    }


@pytest.mark.parametrize("revision", ["abcdef1", "A" * 40, "z" * 40])
def test_rejects_noncanonical_revision(tmp_path, revision: str) -> None:
    with pytest.raises(ValueError, match="full lowercase"):
        write_source_marker(tmp_path / "source.json", revision)
