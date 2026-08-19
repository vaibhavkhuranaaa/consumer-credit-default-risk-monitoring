from email.message import Message
from io import BytesIO
import socket
from urllib.error import HTTPError
from urllib.error import URLError

import pytest

from scripts.verify_live_release import (
    USER_AGENT,
    fetch,
    validate_payloads,
    validate_security,
    verify_retired_surface,
)


class _Response:
    def __init__(self, body: bytes = b"{}", url: str = "https://example.com") -> None:
        self.headers = Message()
        self.headers["Content-Type"] = "application/json"
        self.body = body
        self.url = url

    def __enter__(self) -> "_Response":
        return self

    def __exit__(self, *_args: object) -> None:
        return None

    def read(self, _size: int) -> bytes:
        return self.body

    def geturl(self) -> str:
        return self.url


def _payloads() -> tuple[dict, dict, dict, dict]:
    health = {"status": "ready", "checks": {"database": "reachable", "current_release": "available"}, "release": {"release_id": "release-1"}}
    release = {"release_id": "release-1"}
    artifact = {"version": 3, "source": {"rows": 30_000, "protected_attribute_boundary": "local fairness audit only"}, "records": [{"ID": value} for value in range(30_000)]}
    source_marker = {"schema_version": 1, "status": "published", "source_sha": "a" * 40}
    return health, release, artifact, source_marker


def test_live_contract_aligns_health_release_and_artifact() -> None:
    validate_payloads(*_payloads(), "release-1", "a" * 40)


def test_live_contract_rejects_protected_fields() -> None:
    health, release, artifact, source_marker = _payloads()
    artifact["records"][0]["AGE"] = 40
    with pytest.raises(ValueError, match="protected attributes"):
        validate_payloads(health, release, artifact, source_marker, "release-1", "a" * 40)


def test_live_contract_rejects_wrong_deployment_marker() -> None:
    health, release, artifact, source_marker = _payloads()
    source_marker["status"] = "unknown"
    with pytest.raises(ValueError, match="marker"):
        validate_payloads(health, release, artifact, source_marker, "release-1", "a" * 40)


def test_live_contract_rejects_wrong_source_revision() -> None:
    with pytest.raises(ValueError, match="marker"):
        validate_payloads(*_payloads(), "release-1", "b" * 40)


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


def test_retired_surface_rejects_the_superseded_public_boundary(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        "urllib.request.urlopen",
        lambda *_args, **_kwargs: _Response(
            b'{"columns":["ID","SEX","AGE"]}',
            "https://legacy.example/data/uci-credit-records.json",
        ),
    )

    with pytest.raises(ValueError, match="outside the current public boundary"):
        verify_retired_surface("https://legacy.example", "https://canonical.example")


def test_retired_surface_accepts_a_canonical_redirect(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "urllib.request.urlopen",
        lambda *_args, **_kwargs: _Response(b"", "https://canonical.example/"),
    )

    verify_retired_surface("https://legacy.example", "https://canonical.example")


def test_retired_surface_accepts_cloudflare_deleted_hostname(monkeypatch: pytest.MonkeyPatch) -> None:
    error = HTTPError(
        "https://legacy.example/data/uci-credit-records.json",
        530,
        "",
        Message(),
        BytesIO(b"error code: 1016"),
    )
    monkeypatch.setattr("urllib.request.urlopen", lambda *_args, **_kwargs: (_ for _ in ()).throw(error))

    verify_retired_surface("https://legacy.example", "https://canonical.example")


def test_retired_surface_accepts_removed_dns(monkeypatch: pytest.MonkeyPatch) -> None:
    error = URLError(socket.gaierror(8, "not known"))
    monkeypatch.setattr("urllib.request.urlopen", lambda *_args, **_kwargs: (_ for _ in ()).throw(error))

    verify_retired_surface("https://legacy.example", "https://canonical.example")
