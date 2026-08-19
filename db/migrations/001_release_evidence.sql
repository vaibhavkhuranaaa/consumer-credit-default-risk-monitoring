CREATE TABLE model_releases (
  release_id uuid PRIMARY KEY,
  released_at timestamptz NOT NULL,
  code_revision text NOT NULL,
  scope text NOT NULL,
  source jsonb NOT NULL,
  split jsonb NOT NULL,
  feature_policy jsonb NOT NULL,
  public_payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE evaluation_metrics (
  release_id uuid NOT NULL REFERENCES model_releases(release_id),
  model_name text NOT NULL,
  metric_name text NOT NULL,
  value numeric NOT NULL,
  confidence_interval jsonb,
  PRIMARY KEY (release_id, model_name, metric_name)
);

CREATE TABLE threshold_tradeoffs (
  release_id uuid NOT NULL REFERENCES model_releases(release_id),
  model_name text NOT NULL,
  threshold numeric NOT NULL,
  review_rate numeric NOT NULL,
  precision numeric NOT NULL,
  recall numeric NOT NULL,
  PRIMARY KEY (release_id, model_name, threshold)
);

CREATE TABLE fairness_diagnostics (
  release_id uuid NOT NULL REFERENCES model_releases(release_id),
  model_name text NOT NULL,
  diagnostic_name text NOT NULL,
  group_label text NOT NULL,
  sample_size integer NOT NULL CHECK (sample_size >= 100),
  default_rate numeric NOT NULL,
  auroc numeric NOT NULL,
  mean_score numeric NOT NULL,
  PRIMARY KEY (release_id, model_name, diagnostic_name, group_label)
);

CREATE TABLE data_quality_checks (
  release_id uuid NOT NULL REFERENCES model_releases(release_id),
  check_name text NOT NULL,
  check_value jsonb NOT NULL,
  PRIMARY KEY (release_id, check_name)
);

CREATE TABLE current_release (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  release_id uuid NOT NULL REFERENCES model_releases(release_id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE VIEW public_release_snapshot AS
SELECT release_id, released_at, code_revision, public_payload
FROM model_releases
WHERE release_id = (SELECT release_id FROM current_release WHERE singleton = true);

CREATE OR REPLACE FUNCTION prevent_release_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Model releases are immutable';
END;
$$;
CREATE TRIGGER immutable_model_releases BEFORE UPDATE OR DELETE ON model_releases FOR EACH ROW EXECUTE FUNCTION prevent_release_mutation();

-- Run as the Neon project owner after creating roles portfolio_api and portfolio_publisher.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
GRANT SELECT ON public_release_snapshot TO portfolio_api;
GRANT INSERT ON model_releases, evaluation_metrics, threshold_tradeoffs, fairness_diagnostics, data_quality_checks, current_release TO portfolio_publisher;
GRANT UPDATE (release_id, updated_at) ON current_release TO portfolio_publisher;
