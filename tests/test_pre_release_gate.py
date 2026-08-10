from pathlib import Path

import pytest

from scripts import pre_release_gate


def public_data_directory(root: Path) -> Path:
    directory = root / "web/public/data"
    directory.mkdir(parents=True)
    return directory


def test_public_deployment_payload_accepts_only_governed_artifact(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    directory = public_data_directory(tmp_path)
    (directory / "analyst-workspace.json").write_text("{}")
    monkeypatch.setattr(pre_release_gate, "ROOT", tmp_path)

    pre_release_gate.validate_public_data_directory()


def test_public_deployment_payload_rejects_unexpected_file(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    directory = public_data_directory(tmp_path)
    (directory / "analyst-workspace.json").write_text("{}")
    (directory / "legacy-records.json").write_text("{}")
    monkeypatch.setattr(pre_release_gate, "ROOT", tmp_path)

    with pytest.raises(ValueError, match="legacy-records.json"):
        pre_release_gate.validate_public_data_directory()
