from email.message import Message

import pytest

from scripts.verify_live_release import USER_AGENT, fetch, validate_payloads, validate_security


class _Response:
    def __init__(self) -> None:
        self.headers = Message()
        self.headers["Content-Type"] = "application/json"

    def __enter__(self) -> "_Response":
        return self

    def __exit__(self, *_args: object) -> None:
        return None

    def read(self, _size: int) -> bytes:
        return b"{}"


def _payloads() -> tuple[dict, dict, dict]:
    health = {"status": "ready", "checks": {"database": "reachable", "current_release": "available"}, "release": {"release_id": "release-1", "code_revision": "abcdef1"}}
    release = {"release_id": "release-1", "code_revision": "abcdef1"}
    artifact = {"version": 3, "source": {"rows": 30_000, "protected_attribute_boundary": "local fairness audit only"}, "records": [{"ID": value} for value in range(30_000)]}
    return health, release, artifact


def test_live_contract_aligns_health_release_and_artifact() -> None:
    validate_payloads(*_payloads(), "release-1", "abcdef1")


def test_live_contract_rejects_protected_fields() -> None:
    health, release, artifact = _payloads()
    artifact["records"][0]["AGE"] = 40
    with pytest.raises(ValueError, match="protected attributes"):
        validate_payloads(health, release, artifact, "release-1", "abcdef1")


def test_security_contract_requires_every_header() -> None:
    with pytest.raises(ValueError, match="missing security headers"):
        validate_security({"x-content-type-options": "nosniff"}, "site")


def test_live_fetch_identifies_the_release_verifier(monkeypatch: pytest.MonkeyPatch) -> None:
    def _urlopen(request: object, timeout: int) -> _Response:
        assert request.get_header("User-agent") == USER_AGENT
        assert timeout == 20
        return _Response()

    monkeypatch.setattr("urllib.request.urlopen", _urlopen)

    headers, body = fetch("https://example.com")

    assert headers == {"content-type": "application/json"}
    assert body == b"{}"
