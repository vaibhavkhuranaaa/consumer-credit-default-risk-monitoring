"""Reproducible retrospective evaluation for the UCI benchmark."""

from __future__ import annotations

import hashlib
import json
import platform
from dataclasses import dataclass
from datetime import UTC, datetime
from importlib.metadata import version
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import pyarrow.parquet as pq
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import ExtraTreesClassifier, HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, brier_score_loss, roc_auc_score
from sklearn.model_selection import RepeatedStratifiedKFold, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

TARGET = "default payment next month"
ID_COLUMN = "ID"
PROTECTED_COLUMNS = ("SEX", "EDUCATION", "MARRIAGE", "AGE")
EXPECTED_COLUMNS = (
    "ID", "LIMIT_BAL", "SEX", "EDUCATION", "MARRIAGE", "AGE", "PAY_0", "PAY_2", "PAY_3",
    "PAY_4", "PAY_5", "PAY_6", "BILL_AMT1", "BILL_AMT2", "BILL_AMT3", "BILL_AMT4",
    "BILL_AMT5", "BILL_AMT6", "PAY_AMT1", "PAY_AMT2", "PAY_AMT3", "PAY_AMT4",
    "PAY_AMT5", "PAY_AMT6", TARGET,
)
RANDOM_STATE = 20260801
CAPACITIES = (.05, .10, .20, .35, .50)
EVALUATION_SCHEMA_VERSION = 2
DEVELOPMENT_FOLDS = 3
DEVELOPMENT_REPEATS = 2
BOOTSTRAP_ITERATIONS = 300
RESOLUTION_MARGINS = {"auroc": .005, "pr_auc": .01, "brier": .002, "ece_10_bin": .005}
FEATURE_GROUPS = {
    "reported_limit": ["LIMIT_BAL"],
    "repayment_status": [f"PAY_{period}" for period in (0, 2, 3, 4, 5, 6)],
    "bill_amounts": [f"BILL_AMT{period}" for period in range(1, 7)],
    "payment_amounts": [f"PAY_AMT{period}" for period in range(1, 7)],
}


@dataclass(frozen=True)
class SplitData:
    train: pd.DataFrame
    validation: pd.DataFrame
    test: pd.DataFrame


def load_and_validate(source: Path) -> pd.DataFrame:
    frame = pd.read_excel(source, header=1)
    if tuple(frame.columns) != EXPECTED_COLUMNS or len(frame) != 30_000 or frame[ID_COLUMN].duplicated().any():
        raise ValueError("Unexpected source schema, row count, or duplicate IDs.")
    if frame.isna().any().any() or set(frame[TARGET].unique()) != {0, 1}:
        raise ValueError("Missing values or invalid target values.")
    if not frame["LIMIT_BAL"].between(10_000, 1_000_000).all() or not frame["AGE"].between(21, 79).all():
        raise ValueError("Observed source range changed.")
    repayment = frame[[f"PAY_{period}" for period in (0, 2, 3, 4, 5, 6)]]
    if not repayment.apply(lambda column: column.between(-2, 8).all()).all():
        raise ValueError("Observed repayment-status range changed.")
    return frame


def split_frame(frame: pd.DataFrame) -> SplitData:
    train, temporary = train_test_split(
        frame, test_size=.40, stratify=frame[TARGET], random_state=RANDOM_STATE
    )
    validation, test = train_test_split(
        temporary, test_size=.50, stratify=temporary[TARGET], random_state=RANDOM_STATE
    )
    return SplitData(train.copy(), validation.copy(), test.copy())


def feature_columns(frame: pd.DataFrame) -> list[str]:
    columns = [column for column in frame.columns if column not in {ID_COLUMN, TARGET, *PROTECTED_COLUMNS}]
    if len(columns) != 19:
        raise ValueError("Feature policy violation.")
    return columns


def model_factories() -> dict[str, Any]:
    return {
        "logistic_baseline": lambda: Pipeline([
            ("scale", StandardScaler()),
            ("model", LogisticRegression(C=.5, max_iter=2_000, random_state=RANDOM_STATE)),
        ]),
        "calibrated_hist_gradient_boosting": lambda: CalibratedClassifierCV(
            HistGradientBoostingClassifier(
                max_iter=350, learning_rate=.045, max_leaf_nodes=15,
                l2_regularization=.5, random_state=RANDOM_STATE,
            ),
            method="sigmoid", cv=3,
        ),
        "calibrated_extra_trees": lambda: CalibratedClassifierCV(
            ExtraTreesClassifier(
                n_estimators=300, min_samples_leaf=8, max_features=.8,
                n_jobs=-1, random_state=RANDOM_STATE,
            ),
            method="sigmoid", cv=3,
        ),
    }


def expected_calibration_error(y: pd.Series | np.ndarray, probabilities: np.ndarray, bins: int = 10) -> float:
    y_array = np.asarray(y)
    bucket = np.minimum((probabilities * bins).astype(int), bins - 1)
    return float(sum(
        abs(y_array[bucket == index].mean() - probabilities[bucket == index].mean())
        * (bucket == index).mean()
        for index in range(bins)
        if (bucket == index).any()
    ))


def metric_values(y: pd.Series | np.ndarray, probabilities: np.ndarray) -> dict[str, float]:
    y_array = np.asarray(y)
    return {
        "auroc": float(roc_auc_score(y_array, probabilities)),
        "pr_auc": float(average_precision_score(y_array, probabilities)),
        "brier": float(brier_score_loss(y_array, probabilities)),
        "ece_10_bin": expected_calibration_error(y_array, probabilities),
    }


def rounded_metrics(metrics: dict[str, float]) -> dict[str, float]:
    return {key: round(value, 4) for key, value in metrics.items()}


def metric_summary(y: pd.Series | np.ndarray, probabilities: np.ndarray) -> dict[str, float]:
    return rounded_metrics(metric_values(y, probabilities))


def _quantile_interval(values: list[float]) -> list[float]:
    return [round(float(np.quantile(values, .025)), 4), round(float(np.quantile(values, .975)), 4)]


def confidence_intervals(
    y: pd.Series | np.ndarray,
    probabilities: np.ndarray,
    iterations: int = BOOTSTRAP_ITERATIONS,
) -> dict[str, list[float]]:
    rng, y_array = np.random.default_rng(RANDOM_STATE), np.asarray(y)
    values: dict[str, list[float]] = {key: [] for key in ("auroc", "pr_auc", "brier", "ece_10_bin")}
    for _ in range(iterations):
        index = rng.integers(0, len(y_array), len(y_array))
        if len(np.unique(y_array[index])) > 1:
            sample = metric_values(y_array[index], probabilities[index])
            for key in values:
                values[key].append(sample[key])
    return {key: _quantile_interval(value) for key, value in values.items()}


def deterministic_order(probabilities: np.ndarray, ids: np.ndarray) -> np.ndarray:
    """Rank descending full-precision evaluation score and break ties by source row ID."""
    return np.lexsort((ids, -probabilities))


def _capacity_rows(y: np.ndarray, probabilities: np.ndarray, ids: np.ndarray) -> list[dict[str, Any]]:
    # Preserve the frozen audit's original NumPy ordering so verified point estimates do not drift.
    order = np.argsort(-probabilities)
    total = int(y.sum())
    prevalence = float(y.mean())
    rows: list[dict[str, Any]] = []
    for capacity in CAPACITIES:
        take = max(1, round(len(y) * capacity))
        hits = int(y[order[:take]].sum())
        previous = rows[-1] if rows else None
        incremental = None
        if previous:
            incremental = (hits - previous["captured_defaults"]) / (take - previous["queue_size"])
        rows.append({
            "capacity": capacity,
            "review_rate": round(take / len(y), 4),
            "queue_size": take,
            "captured_defaults": hits,
            "non_default_reviews": take - hits,
            "precision": round(hits / take, 4),
            "recall": round(hits / total, 4),
            "lift_vs_random": round((hits / take) / prevalence, 4),
            "incremental_yield": None if incremental is None else round(incremental, 4),
        })
    return rows


def capacity_table(
    y: pd.Series | np.ndarray,
    probabilities: np.ndarray,
    ids: pd.Series | np.ndarray | None = None,
    iterations: int = BOOTSTRAP_ITERATIONS,
) -> list[dict[str, Any]]:
    y_array = np.asarray(y)
    id_array = np.arange(len(y_array)) if ids is None else np.asarray(ids)
    rows = _capacity_rows(y_array, probabilities, id_array)
    samples: list[list[dict[str, Any]]] = []
    rng = np.random.default_rng(RANDOM_STATE + 17)
    for _ in range(iterations):
        index = rng.integers(0, len(y_array), len(y_array))
        if y_array[index].sum() and y_array[index].sum() < len(y_array):
            # Bootstrap positions become the deterministic final tie-breaker when source IDs repeat.
            sample_ids = id_array[index] * (len(y_array) + 1) + np.arange(len(y_array))
            samples.append(_capacity_rows(y_array[index], probabilities[index], sample_ids))
    interval_fields = (
        "captured_defaults", "non_default_reviews", "precision", "recall",
        "lift_vs_random", "incremental_yield",
    )
    for position, row in enumerate(rows):
        intervals: dict[str, list[float] | None] = {}
        for field in interval_fields:
            values = [sample[position][field] for sample in samples if sample[position][field] is not None]
            intervals[field] = _quantile_interval(values) if values else None
        row["confidence_intervals_95"] = intervals
    return rows


def random_capacity_table(y: pd.Series | np.ndarray) -> list[dict[str, Any]]:
    """Analytic expected random-selection reference; no holdout ordering is fitted or selected."""
    y_array = np.asarray(y)
    total = int(y_array.sum())
    prevalence = float(y_array.mean())
    rows = []
    for capacity in CAPACITIES:
        take = max(1, round(len(y_array) * capacity))
        hits = round(total * take / len(y_array))
        rows.append({
            "capacity": capacity,
            "review_rate": round(take / len(y_array), 4),
            "queue_size": take,
            "captured_defaults": hits,
            "non_default_reviews": take - hits,
            "precision": round(prevalence, 4),
            "recall": round(capacity, 4),
            "lift_vs_random": 1.0,
            "incremental_yield": None if not rows else round(prevalence, 4),
            "confidence_intervals_95": None,
        })
    return rows


def lift_table(y: pd.Series | np.ndarray, probabilities: np.ndarray, ids: np.ndarray) -> list[dict[str, float]]:
    y_array = np.asarray(y)
    order, baseline = np.argsort(-probabilities), float(y_array.mean())
    rows = []
    for index, values in enumerate(np.array_split(y_array[order], 10), 1):
        rate = float(values.mean())
        rows.append({"decile": index, "n": int(len(values)), "default_rate": round(rate, 4), "lift": round(rate / baseline, 3)})
    return rows


def calibration_table(y: pd.Series | np.ndarray, probabilities: np.ndarray) -> list[dict[str, Any]]:
    y_array = np.asarray(y)
    rows = []
    for index in range(10):
        lower, upper = index / 10, (index + 1) / 10
        mask = (probabilities >= lower) & (probabilities < upper if index < 9 else probabilities <= upper)
        if mask.any():
            count = int(mask.sum())
            positives = int(y_array[mask].sum())
            sparse = count < 100 or positives < 20 or count - positives < 20
            rows.append({
                "bin": f"{lower:.1f}-{upper:.1f}",
                "n": count,
                "mean_score": round(float(probabilities[mask].mean()), 4),
                "observed_rate": round(float(y_array[mask].mean()), 4),
                "sparse": sparse,
                "warning": "Sparse bin: fewer than 100 rows or 20 rows in one outcome class." if sparse else None,
            })
    return rows


def calibration_diagnostics(y: pd.Series | np.ndarray, probabilities: np.ndarray) -> dict[str, Any]:
    clipped = np.clip(probabilities, 1e-6, 1 - 1e-6)
    logit = np.log(clipped / (1 - clipped)).reshape(-1, 1)
    model = LogisticRegression(C=1e6, solver="lbfgs", max_iter=2_000, random_state=RANDOM_STATE)
    model.fit(logit, np.asarray(y))
    curve = calibration_table(y, probabilities)
    warnings = [row["bin"] for row in curve if row["sparse"]]
    return {
        "intercept": round(float(model.intercept_[0]), 4),
        "slope": round(float(model.coef_[0][0]), 4),
        "ideal_intercept": 0.0,
        "ideal_slope": 1.0,
        "sparse_bin_threshold": "n < 100 or either outcome class n < 20",
        "sparse_bins": warnings,
        "warning": f"Sparse calibration evidence in {', '.join(warnings)}." if warnings else None,
    }


def fairness_diagnostics(test: pd.DataFrame, probabilities: np.ndarray) -> dict[str, Any]:
    audit = test[["SEX", "AGE", TARGET]].copy()
    audit["age_band"] = pd.cut(audit["AGE"], bins=[20, 29, 39, 49, 59, 100])
    audit["score"] = probabilities
    result: dict[str, Any] = {}
    for grouping in ("SEX", "age_band"):
        result[grouping] = [
            {
                "group": str(label), "n": int(len(group)),
                "default_rate": round(float(group[TARGET].mean()), 4),
                "auroc": round(float(roc_auc_score(group[TARGET], group.score)), 4),
                "mean_score": round(float(group.score.mean()), 4),
            }
            for label, group in audit.groupby(grouping, observed=True)
            if len(group) >= 100 and group[TARGET].nunique() == 2
        ]
    return result


def repayment_delay_rule(frame: pd.DataFrame) -> np.ndarray:
    """Fixed target-free reference using only historical repayment-delay fields."""
    status = frame[[f"PAY_{period}" for period in (0, 2, 3, 4, 5, 6)]]
    current = frame["PAY_0"]
    maximum = status.max(axis=1)
    return np.select(
        [current >= 2, maximum >= 2, maximum >= 1],
        [.70, .45, .25],
        default=.10,
    ).astype(float)


def _paired_interval(values: list[float], seed: int) -> list[float]:
    rng = np.random.default_rng(seed)
    array = np.asarray(values)
    means = [float(array[rng.integers(0, len(array), len(array))].mean()) for _ in range(2_000)]
    return _quantile_interval(means)


def _paired_status(metric: str, interval: list[float]) -> str:
    lower, upper = interval
    margin = RESOLUTION_MARGINS[metric]
    higher_is_better = metric in {"auroc", "pr_auc"}
    selected_better = lower > margin if higher_is_better else upper < -margin
    reference_better = upper < -margin if higher_is_better else lower > margin
    if not selected_better and not reference_better:
        return "tie"
    return "selected_better" if selected_better else "reference_better"


def repeated_development_evaluation(
    development: pd.DataFrame,
    columns: list[str],
    selected: str,
) -> dict[str, Any]:
    splitter = RepeatedStratifiedKFold(
        n_splits=DEVELOPMENT_FOLDS,
        n_repeats=DEVELOPMENT_REPEATS,
        random_state=RANDOM_STATE,
    )
    factories = model_factories()
    model_names = ["prevalence_random_baseline", "repayment_delay_rule", *factories]
    fold_metrics = {name: [] for name in model_names}
    ablation_metrics = {name: [] for name in FEATURE_GROUPS}
    split_rows = []
    for split_index, (train_index, test_index) in enumerate(
        splitter.split(development[columns], development[TARGET])
    ):
        train = development.iloc[train_index]
        test = development.iloc[test_index]
        scores: dict[str, np.ndarray] = {
            "prevalence_random_baseline": np.full(len(test), float(train[TARGET].mean())),
            "repayment_delay_rule": repayment_delay_rule(test),
        }
        for name, factory in factories.items():
            model = factory()
            model.fit(train[columns], train[TARGET])
            scores[name] = model.predict_proba(test[columns])[:, 1]
        for name in model_names:
            fold_metrics[name].append(metric_values(test[TARGET], scores[name]))
        for group, removed in FEATURE_GROUPS.items():
            kept = [column for column in columns if column not in removed]
            model = factories[selected]()
            model.fit(train[kept], train[TARGET])
            ablated = metric_values(test[TARGET], model.predict_proba(test[kept])[:, 1])
            full = fold_metrics[selected][-1]
            ablation_metrics[group].append({
                metric: full[metric] - ablated[metric] if metric in {"auroc", "pr_auc"}
                else ablated[metric] - full[metric]
                for metric in full
            })
        split_rows.append({
            "repeat": split_index // DEVELOPMENT_FOLDS + 1,
            "fold": split_index % DEVELOPMENT_FOLDS + 1,
            "train_n": len(train),
            "validation_n": len(test),
            "validation_ids_sha256": _ids_checksum(test),
        })
    summaries = {}
    for name, rows in fold_metrics.items():
        summaries[name] = {
            metric: {
                "mean": round(float(np.mean([row[metric] for row in rows])), 4),
                "range_95": _quantile_interval([row[metric] for row in rows]),
                "split_values": [round(row[metric], 4) for row in rows],
            }
            for metric in rows[0]
        }
    comparisons = []
    for reference_index, reference in enumerate(name for name in model_names if name != selected):
        deltas = {}
        statuses = []
        for metric_index, metric in enumerate(fold_metrics[selected][0]):
            values = [
                chosen[metric] - baseline[metric]
                for chosen, baseline in zip(fold_metrics[selected], fold_metrics[reference], strict=True)
            ]
            interval = _paired_interval(values, RANDOM_STATE + reference_index * 20 + metric_index)
            status = _paired_status(metric, interval)
            statuses.append(status)
            deltas[metric] = {
                "mean_selected_minus_reference": round(float(np.mean(values)), 4),
                "confidence_interval_95": interval,
                "practical_resolution_margin": RESOLUTION_MARGINS[metric],
                "status": status,
            }
        comparisons.append({
            "selected_model": selected,
            "reference": reference,
            "overall_status": "tie" if "tie" in statuses else (
                "selected_better" if statuses.count("selected_better") > statuses.count("reference_better")
                else "reference_better"
            ),
            "metrics": deltas,
        })
    ablations = []
    for group_index, (group, rows) in enumerate(ablation_metrics.items()):
        metrics = {}
        for metric_index, metric in enumerate(rows[0]):
            values = [row[metric] for row in rows]
            interval = _paired_interval(values, RANDOM_STATE + 100 + group_index * 20 + metric_index)
            status = "tie" if interval[0] <= 0 <= interval[1] else (
                "reliance_signal" if interval[0] > 0 else "improved_without_group"
            )
            metrics[metric] = {
                "mean_performance_loss_when_removed": round(float(np.mean(values)), 4),
                "confidence_interval_95": interval,
                "status": status,
            }
        ablations.append({
            "feature_group": group,
            "removed_features": FEATURE_GROUPS[group],
            "overall_status": metrics["pr_auc"]["status"],
            "primary_summary_metric": "pr_auc",
            "metrics": metrics,
            "interpretation_boundary": "Model-reliance and stability evidence only; not a cause or adverse-action reason.",
        })
    return {
        "method": f"{DEVELOPMENT_REPEATS} repeats of {DEVELOPMENT_FOLDS}-fold stratified evaluation",
        "identical_folds_across_models": True,
        "development_n": len(development),
        "split_count": DEVELOPMENT_FOLDS * DEVELOPMENT_REPEATS,
        "splits": split_rows,
        "models": summaries,
        "paired_comparisons": comparisons,
        "tie_rule": "Tie when the paired 95% interval does not clear the prespecified practical-resolution margin in the better direction.",
        "feature_group_ablations": ablations,
        "limitation": "Repeated development folds measure stability; they do not replace the frozen holdout or create out-of-time evidence.",
    }


def _cohort_metric_row(name: str, group: str, y: pd.Series, scores: np.ndarray) -> dict[str, Any]:
    positives = int(y.sum())
    negatives = len(y) - positives
    adequate = len(y) >= 500 and positives >= 50 and negatives >= 50
    row: dict[str, Any] = {
        "dimension": name,
        "group": group,
        "n": len(y),
        "observed_defaults": positives,
        "observed_default_rate": round(float(y.mean()), 4),
        "sample_size_status": "adequate" if adequate else "limited",
        "warning": None if adequate else "Interpret cautiously: n < 500 or one outcome class has fewer than 50 rows.",
    }
    if positives and negatives:
        row["metrics"] = metric_summary(y, scores)
        row["confidence_intervals_95"] = confidence_intervals(y, scores, iterations=200)
    else:
        row["metrics"] = None
        row["confidence_intervals_95"] = None
        row["sample_size_status"] = "unavailable"
        row["warning"] = "Both historical outcome classes are required for ranking metrics."
    return row


def cohort_robustness(test: pd.DataFrame, scores: np.ndarray) -> list[dict[str, Any]]:
    bills = test[[f"BILL_AMT{i}" for i in range(1, 7)]].clip(lower=0).sum(axis=1)
    payments = test[[f"PAY_AMT{i}" for i in range(1, 7)]].sum(axis=1)
    profiles = pd.DataFrame(index=test.index)
    profiles["credit_limit_band"] = pd.cut(
        test["LIMIT_BAL"], [0, 50_000, 140_000, 300_000, float("inf")],
        labels=["≤50k", "50k–140k", "140k–300k", ">300k"],
    )
    profiles["delinquency_severity"] = test["PAY_0"].map(
        lambda value: "Severe" if value >= 3 else "Delayed" if value >= 1 else "Current or paid"
    )
    ratio = (payments / bills.replace(0, 1)).clip(0, 10)
    profiles["payment_to_bill_profile"] = pd.cut(
        ratio, [-.001, .10, .50, float("inf")],
        labels=["Low (≤0.10)", "Middle (0.10–0.50)", "Higher (>0.50)"],
        include_lowest=True,
    )
    rows = []
    score_series = pd.Series(scores, index=test.index)
    for dimension in profiles:
        for label, indexes in profiles.groupby(dimension, observed=True).groups.items():
            rows.append(_cohort_metric_row(
                dimension, str(label), test.loc[indexes, TARGET], score_series.loc[indexes].to_numpy()
            ))
    return rows


def out_of_fold_scores(frame: pd.DataFrame, columns: list[str], model_name: str) -> np.ndarray:
    scores = np.zeros(len(frame))
    factory = model_factories()[model_name]
    for train, test in StratifiedKFold(
        n_splits=5, shuffle=True, random_state=RANDOM_STATE
    ).split(frame[columns], frame[TARGET]):
        model = factory()
        model.fit(frame.iloc[train][columns], frame.iloc[train][TARGET])
        scores[test] = model.predict_proba(frame.iloc[test][columns])[:, 1]
    return scores


def _ids_checksum(frame: pd.DataFrame) -> str:
    ids = ",".join(str(value) for value in sorted(frame[ID_COLUMN].tolist()))
    return hashlib.sha256(ids.encode()).hexdigest()


def split_identity(splits: SplitData) -> dict[str, Any]:
    development = pd.concat([splits.train, splits.validation])
    return {
        "train": {"rows": len(splits.train), "ids_sha256": _ids_checksum(splits.train)},
        "validation": {"rows": len(splits.validation), "ids_sha256": _ids_checksum(splits.validation)},
        "development": {"rows": len(development), "ids_sha256": _ids_checksum(development)},
        "holdout": {"rows": len(splits.test), "ids_sha256": _ids_checksum(splits.test), "frozen": True},
    }


def _model_evidence(
    y: pd.Series,
    scores: np.ndarray,
    ids: pd.Series,
    *,
    random_reference: bool = False,
) -> dict[str, Any]:
    return {
        "metrics": metric_summary(y, scores),
        "confidence_intervals_95": confidence_intervals(y, scores),
        "threshold_tradeoffs": random_capacity_table(y) if random_reference else capacity_table(y, scores, ids),
        "lift_by_decile": lift_table(y, scores, ids.to_numpy()),
        "calibration_curve": calibration_table(y, scores),
        "calibration_diagnostics": calibration_diagnostics(y, scores),
    }


def run(
    source: Path,
    output_dir: Path,
    derived_dir: Path,
    *,
    evaluated_revision: str = "uncommitted",
    command: str = "uv run python scripts/run_evaluation.py",
) -> dict[str, Any]:
    frame = load_and_validate(source)
    columns = feature_columns(frame)
    splits = split_frame(frame)
    derived_dir.mkdir(parents=True, exist_ok=True)
    analysis = frame.drop(columns=list(PROTECTED_COLUMNS))
    analysis.to_parquet(derived_dir / "analytical_table.parquet", index=False)
    if pq.read_metadata(derived_dir / "analytical_table.parquet").num_rows != len(frame):
        raise ValueError("Derived row count mismatch.")

    validation_scores: dict[str, np.ndarray] = {}
    fitted: dict[str, Any] = {}
    for name, factory in model_factories().items():
        fitted[name] = factory()
        fitted[name].fit(splits.train[columns], splits.train[TARGET])
        validation_scores[name] = fitted[name].predict_proba(splits.validation[columns])[:, 1]
    baseline = metric_summary(splits.validation[TARGET], validation_scores["logistic_baseline"])
    eligible = [
        name for name, scores in validation_scores.items()
        if name != "logistic_baseline"
        and metric_summary(splits.validation[TARGET], scores)["pr_auc"] > baseline["pr_auc"]
        and metric_summary(splits.validation[TARGET], scores)["brier"] <= baseline["brier"]
    ]
    selected = max(
        eligible or ["logistic_baseline"],
        key=lambda name: metric_summary(splits.validation[TARGET], validation_scores[name])["pr_auc"],
    )
    identity = split_identity(splits)
    results: dict[str, Any] = {
        "schema_version": EVALUATION_SCHEMA_VERSION,
        "generated_at_utc": datetime.now(UTC).isoformat(),
        "scope": "Validated retrospective academic credit-risk simulation; not a lending decision system.",
        "readiness": {
            "verdict": "Usable for retrospective research simulation; not validated for lending use.",
            "supported_uses": [
                "Retrospective model-family comparison",
                "Historical review-capacity simulation",
                "Non-demographic cohort robustness review",
            ],
            "prohibited_uses": [
                "Lending approval or denial", "Eligibility", "Pricing",
                "Adverse-action reasons", "Lending recommendations",
            ],
            "limitation": "Single historical academic population with no temporal, external, prospective, drift, or operational validation.",
        },
        "lineage": {
            "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
            "evaluated_revision": evaluated_revision,
            "command": command,
            "tool_versions": {
                "python": platform.python_version(),
                "numpy": version("numpy"),
                "pandas": version("pandas"),
                "scikit_learn": version("scikit-learn"),
            },
        },
        "split": {
            "method": "fixed stratified 60/20/20 with validation-locked model selection",
            "random_state": RANDOM_STATE,
            "identity": identity,
            "holdout_policy": "The 6,000-row holdout is frozen and excluded from further model or hyperparameter selection.",
            "limitation": "No calendar-time or true out-of-time split is possible because the source has one target horizon.",
        },
        "feature_policy": {"included_count": len(columns), "excluded": [ID_COLUMN, *PROTECTED_COLUMNS, TARGET]},
        "selection": {
            "selected_model": selected,
            "gate": "higher validation PR-AUC than logistic baseline and no worse validation Brier score",
            "eligible_models": eligible,
            "status": "promoted" if selected != "logistic_baseline" else "baseline_retained",
            "locked_before_holdout_audit": True,
        },
        "baselines": {
            "prevalence_random_baseline": {
                "definition": "Constant development-fold prevalence for probability metrics; analytic random selection with expected lift 1.0 for capacity comparison.",
                "uses_target_for_fitting": False,
            },
            "logistic_baseline": {
                "definition": "Standardized logistic regression using the same 19 approved non-demographic features.",
                "uses_target_for_fitting": True,
            },
            "repayment_delay_rule": {
                "definition": "Fixed scores: 0.70 when PAY_0 ≥ 2; 0.45 when any repayment field ≥ 2; 0.25 when any repayment field ≥ 1; otherwise 0.10.",
                "uses_target_for_fitting": False,
                "policy_boundary": "Research reference only; not an eligibility, pricing, adverse-action, or lending rule.",
            },
        },
        "models": {},
    }
    holdout_y = splits.test[TARGET]
    holdout_ids = splits.test[ID_COLUMN]
    holdout_scores: dict[str, np.ndarray] = {
        "prevalence_random_baseline": np.full(len(splits.test), float(splits.train[TARGET].mean())),
        "repayment_delay_rule": repayment_delay_rule(splits.test),
    }
    for name, model in fitted.items():
        holdout_scores[name] = model.predict_proba(splits.test[columns])[:, 1]
    for name, scores in holdout_scores.items():
        item = _model_evidence(
            holdout_y, scores, holdout_ids,
            random_reference=name == "prevalence_random_baseline",
        )
        if name == selected:
            item["aggregate_fairness_diagnostics"] = fairness_diagnostics(splits.test, scores)
            item["non_demographic_cohort_robustness"] = cohort_robustness(splits.test, scores)
        results["models"][name] = item

    development = pd.concat([splits.train, splits.validation]).sort_values(ID_COLUMN).reset_index(drop=True)
    results["development_evaluation"] = repeated_development_evaluation(development, columns, selected)

    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "evaluation.json").write_text(json.dumps(results, indent=2) + "\n")
    chosen = results["models"][selected]["metrics"]
    closest = next(
        comparison for comparison in results["development_evaluation"]["paired_comparisons"]
        if comparison["reference"] == "calibrated_extra_trees"
    )
    (output_dir / "evaluation.md").write_text(
        "# Retrospective evaluation\n\n"
        f"Generated: **{results['generated_at_utc']}**. Evaluated revision: `{evaluated_revision}`.\n\n"
        f"Selected model: **{selected}**. Development comparison with calibrated Extra Trees: "
        f"**{closest['overall_status']}**.\n\n"
        "| Metric | Frozen holdout |\n| --- | ---: |\n"
        f"| AUROC | {chosen['auroc']:.4f} |\n| PR-AUC | {chosen['pr_auc']:.4f} |\n"
        f"| Brier | {chosen['brier']:.4f} |\n| ECE | {chosen['ece_10_bin']:.4f} |\n\n"
        "Usable for retrospective research simulation; not validated for lending use.\n"
    )
    (output_dir / "model-card.md").write_text(
        "# Model card\n\nNineteen financial and repayment fields are used. ID and demographic fields are excluded. "
        "Feature-group ablations describe model reliance only, never causes or adverse-action reasons. "
        "The frozen holdout has 6,000 rows. The source has no out-of-time horizon; results are retrospective benchmark evidence only.\n"
    )
    return results
