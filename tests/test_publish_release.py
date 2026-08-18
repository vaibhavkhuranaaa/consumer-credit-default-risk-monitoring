from scripts.publish_release import legacy_tradeoff_values


def test_capacity_tradeoff_maps_to_immutable_evidence_schema() -> None:
    row = {"capacity": 0.2, "review_rate": 0.2, "precision": 0.42, "recall": 0.61, "captured_defaults": 811, "queue_size": 1200, "non_default_reviews": 389, "lift_vs_random": 1.9, "incremental_yield": 0.3, "confidence_intervals_95": {}}

    assert legacy_tradeoff_values(row) == (0.2, 0.2, 0.42, 0.61)
