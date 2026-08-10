"""Build the governed non-demographic analyst artifact without model binaries."""
from __future__ import annotations
import argparse, copy, hashlib, json
from pathlib import Path
import yaml
from credit_risk.pipeline import PROTECTED_COLUMNS, TARGET, feature_columns, load_and_validate, out_of_fold_scores

PUBLIC_ARTIFACT_VERSION = 4

def enrich(frame, scores):
    enriched = frame.copy()
    bills = enriched[[f"BILL_AMT{i}" for i in range(1, 7)]].clip(lower=0).sum(axis=1)
    payments = enriched[[f"PAY_AMT{i}" for i in range(1, 7)]].sum(axis=1)
    visible_scores = scores.round(6)
    enriched["research_score"] = visible_scores
    order = __import__("numpy").lexsort((enriched["ID"].to_numpy(), -visible_scores))
    ranks = __import__("numpy").empty(len(enriched), dtype=int)
    ranks[order] = __import__("numpy").arange(1, len(enriched) + 1)
    enriched["research_score_rank"] = ranks
    enriched["score_band"] = __import__("pandas").cut(scores, [-.01, .1, .2, .35, .5, 1], labels=["Very low", "Low", "Moderate", "Elevated", "High"]).astype(str)
    enriched["utilization_proxy"] = (enriched["BILL_AMT1"].clip(lower=0) / enriched["LIMIT_BAL"]).clip(0, 10).round(4)
    enriched["payment_to_bill_ratio"] = (payments / bills.replace(0, 1)).clip(0, 10).round(4)
    enriched["mean_repayment_status"] = enriched[[f"PAY_{i}" for i in (0,2,3,4,5,6)]].mean(axis=1).round(2)
    enriched["delinquency_severity"] = enriched["PAY_0"].map(lambda value: "Severe" if value >= 3 else "Delayed" if value >= 1 else "Current or paid")
    enriched["limit_band"] = __import__("pandas").cut(enriched["LIMIT_BAL"], [0, 50_000, 140_000, 300_000, float("inf")], labels=["≤50k", "50k–140k", "140k–300k", ">300k"]).astype(str)
    return enriched

def public_frame(frame):
    """Narrow the licensed source to the non-demographic public research boundary."""
    return frame.drop(columns=list(PROTECTED_COLUMNS))

def public_evaluation(evaluation):
    """Keep protected-attribute fairness evidence local while serving non-demographic evidence."""
    narrowed = copy.deepcopy(evaluation)
    for model in narrowed.get("models", {}).values():
        model.pop("aggregate_fairness_diagnostics", None)
    return narrowed

def main():
    parser=argparse.ArgumentParser(); parser.add_argument("--output", type=Path, default=Path("web/public/data/analyst-workspace.json")); args=parser.parse_args()
    root=Path(__file__).resolve().parents[1]; manifest=yaml.safe_load((root/".project/data-manifest.yml").read_text())["datasets"][0]
    frame=load_and_validate(root/manifest["extracted_file"]); columns=feature_columns(frame); evaluation_path=root/"artifacts/evaluation.json"; evaluation=json.loads(evaluation_path.read_text()); selected=evaluation["selection"]["selected_model"]
    enriched=enrich(public_frame(frame), out_of_fold_scores(frame, columns, selected))
    artifact={"version":PUBLIC_ARTIFACT_VERSION,"source":{"dataset_id":manifest["id"],"citation":manifest["citation"],"license":manifest["license"],"archive_sha256":manifest["archive_sha256"],"source_file_sha256":manifest["extracted_file_sha256"],"evaluation_sha256":hashlib.sha256(evaluation_path.read_bytes()).hexdigest(),"evaluation_schema_version":evaluation["schema_version"],"evaluation_generated_at_utc":evaluation["generated_at_utc"],"evaluated_revision":evaluation["lineage"]["evaluated_revision"],"rows":len(frame),"columns":[column for column in frame.columns if column not in PROTECTED_COLUMNS],"selected_model":selected,"rank_method":"research_score descending after six-decimal publication rounding; ties by source ID ascending","protected_attribute_boundary":"local fairness audit only"},"records":json.loads(enriched.to_json(orient="records")),"evidence":public_evaluation(evaluation)}
    output=(root/args.output).resolve(); output.parent.mkdir(parents=True, exist_ok=True); output.write_text(json.dumps(artifact,separators=(",",":"))+"\n")
    print(f"Analyst artifact: {output} ({len(frame)} records, sha256={hashlib.sha256(output.read_bytes()).hexdigest()})")
if __name__ == "__main__": main()
