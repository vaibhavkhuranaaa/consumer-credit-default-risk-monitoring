from scripts.publish_release import legacy_tradeoff_values


def test_capacity_tradeoff_maps_to_immutable_evidence_schema() -> None:
    row = {"capacity": 0.2, "review_rate": 0.2, "precision": 0.42, "recall": 0.61, "captured_defaults": 811}

    assert legacy_tradeoff_values(row) == (0.2, 0.2, 0.42, 0.61)
