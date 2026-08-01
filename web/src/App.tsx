/*
THESIS: An evidence desk that makes the model boundary more visible than its headline metric.
OWN-WORLD: Cool graphite, paper surfaces, and one cobalt interaction color in a calm operator layout.
STORY: A hiring manager sees data rigor, model governance, and delivery discipline in one read-only release.
FIRST VIEWPORT: The no-decision boundary anchors the page; validated metrics and release lineage follow immediately.
FORM: A responsive operating dashboard with a governance rail and detailed evidence canvas.
*/
import { useEffect, useState } from "react";
import { getCurrentRelease } from "./api";
import type { Release } from "./types";

const metric = (value: number) => value.toFixed(4);

function App() {
  const [release, setRelease] = useState<Release | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    getCurrentRelease(controller.signal).then(setRelease).catch((reason: Error) => {
      if (reason.name !== "AbortError") setError(reason.message);
    });
    return () => controller.abort();
  }, []);

  if (error) return <State title="Evidence unavailable" detail={error} action="The source data and individual account records are never exposed by this application." />;
  if (!release) return <State title="Loading governed evidence" detail="Retrieving the currently approved aggregate release." action="No individual accounts, scores, or lending decisions are shown." />;

  const challenger = release.models.calibrated_hist_gradient_boosting;
  const baseline = release.models.logistic_baseline;
  return <main>
    <header className="masthead"><div><p className="kicker">Consumer credit benchmark</p><h1>Portfolio monitoring evidence</h1></div><p className="release">Release {release.code_revision.slice(0, 10)}<br />{new Date(release.released_at).toLocaleDateString()}</p></header>
    <section className="boundary" aria-label="Decision boundary"><strong>Retrospective benchmark only.</strong> This read-only experience supports aggregate analysis. It does not approve, deny, price, or recommend consumer credit.</section>
    <div className="layout"><section className="evidence">
      <h2>Holdout evidence</h2><p className="lede">Calibrated challenger performance on a fixed retrospective holdout.</p>
      <div className="metric-grid">{[["AUROC", challenger.metrics.auroc], ["PR–AUC", challenger.metrics.pr_auc], ["Brier score", challenger.metrics.brier], ["10-bin ECE", challenger.metrics.ece_10_bin]].map(([label, value]) => <div className="metric" key={String(label)}><span>{label}</span><strong>{metric(Number(value))}</strong></div>)}</div>
      <div className="comparison"><h3>Model comparison</h3><table><thead><tr><th>Model</th><th>AUROC</th><th>PR–AUC</th><th>Brier</th><th>ECE</th></tr></thead><tbody><ModelRow name="Logistic baseline" model={baseline} /><ModelRow name="Calibrated challenger" model={challenger} /></tbody></table></div>
      <section><h2>Review-capacity trade-offs</h2><p className="lede">These thresholds describe retrospective queue capacity—not lending-decision cutoffs.</p><table><thead><tr><th>Threshold</th><th>Review rate</th><th>Precision</th><th>Recall</th></tr></thead><tbody>{challenger.threshold_tradeoffs.map((row) => <tr key={row.threshold}><td>{row.threshold.toFixed(2)}</td><td>{(row.review_rate * 100).toFixed(1)}%</td><td>{metric(row.precision)}</td><td>{metric(row.recall)}</td></tr>)}</tbody></table></section>
      <section><h2>Aggregate fairness diagnostics</h2><p className="lede">Diagnostic group results are withheld from modeling, thresholds, and output. They do not establish legal compliance or causal fairness.</p>{Object.entries(challenger.aggregate_fairness_diagnostics ?? {}).map(([name, groups]) => <details key={name}><summary>{name === "SEX" ? "Sex — diagnostic only" : "Age bands — diagnostic only"}</summary><table><thead><tr><th>Group</th><th>n</th><th>AUROC</th><th>Mean score</th></tr></thead><tbody>{groups.map((group) => <tr key={group.group}><td>{group.group}</td><td>{group.n.toLocaleString()}</td><td>{metric(group.auroc)}</td><td>{metric(group.mean_score)}</td></tr>)}</tbody></table></details>)}</section>
    </section><aside className="rail"><h2>Release governance</h2><dl><dt>Source</dt><dd>UCI benchmark · {release.source.license}</dd><dt>Data quality</dt><dd>{release.source.validation.rows.toLocaleString()} rows · {release.source.validation.missing_cells} missing cells · {release.source.validation.duplicate_ids} duplicate IDs</dd><dt>Feature policy</dt><dd>{release.feature_policy.included_count} financial and repayment-history fields; demographics excluded</dd><dt>Evaluation</dt><dd>{release.split.method}</dd></dl><h3>Known limitation</h3><p>{release.split.limitation}</p><h3>Public-data boundary</h3><p>The deployed API contains only aggregate evaluation evidence. Raw records and model binaries remain local.</p></aside></div>
  </main>;
}

function State({ title, detail, action }: { title: string; detail: string; action: string }) { return <main className="state"><p className="kicker">Portfolio monitoring evidence</p><h1>{title}</h1><p>{detail}</p><p>{action}</p></main>; }
function ModelRow({ name, model }: { name: string; model: Release["models"]["calibrated_hist_gradient_boosting"] }) { return <tr><th>{name}</th><td>{metric(model.metrics.auroc)}</td><td>{metric(model.metrics.pr_auc)}</td><td>{metric(model.metrics.brier)}</td><td>{metric(model.metrics.ece_10_bin)}</td></tr>; }
export default App;
