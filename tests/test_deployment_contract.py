from pathlib import Path


def test_deployment_schema_enforces_aggregate_only_role_boundaries() -> None:
    migration = Path("db/migrations/001_release_evidence.sql").read_text()
    for table in ("model_releases", "evaluation_metrics", "threshold_tradeoffs", "fairness_diagnostics", "data_quality_checks"):
        assert f"CREATE TABLE {table}" in migration
    assert "CREATE VIEW public_release_snapshot" in migration
    assert "REVOKE ALL ON ALL TABLES" in migration
    assert "GRANT SELECT ON public_release_snapshot TO portfolio_api" in migration
    assert "GRANT INSERT ON model_releases" in migration


def test_local_pipeline_has_no_duckdb_or_streamlit_runtime_dependency() -> None:
    project = Path("pyproject.toml").read_text().lower()
    pipeline = Path("src/credit_risk/pipeline.py").read_text().lower()
    assert "duckdb" not in project + pipeline
    assert "streamlit" not in project + pipeline
