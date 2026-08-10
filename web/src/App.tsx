import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_FILTERS,
  DELINQUENCY_LEVELS,
  LIMIT_BANDS,
  LOW_PAYMENT_RATIO,
  SCORE_BANDS,
  bandSummaries,
  cohortMatrix,
  cumulativeGains,
  delinquencySummaries,
  describeFilters,
  distribution,
  filterRecords,
  isDefaultFilters,
  portfolioSummary,
  repaymentComposition,
  reviewScenarios,
  sequenceProfile,
  sortRecords,
  reviewPlacement,
  type Filters,
} from "./analytics";
import {
  BandPopulationChart,
  CalibrationChart,
  ChartFrame,
  CreditLimitBoxPlot,
  DelinquencyChart,
  DistributionChart,
  EmptyChart,
  GainsChart,
  MatrixHeatmap,
  ModelComparisonChart,
  ProfileLines,
  RepaymentHeatmap,
  ReviewFrontier,
  SimpleTable,
} from "./charts";
import { getCurrentRelease, getHealth, getPublicDataset } from "./api";
import type { CreditRecord, Health, Model, PublicDataset, Release } from "./types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const number = new Intl.NumberFormat("en-US");
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const PAGE_SIZE = 20;

type View = "portfolio" | "review" | "cohorts" | "assurance" | "records";
type LoadState = "loading" | "ready" | "error";

const NAVIGATION: { value: View; label: string }[] = [
  { value: "portfolio", label: "Portfolio" },
  { value: "review", label: "Capacity" },
  { value: "cohorts", label: "Cohorts" },
  { value: "assurance", label: "Validation" },
  { value: "records", label: "Records" },
];

export default function App() {
  const [dataset, setDataset] = useState<PublicDataset | null>(null);
  const [release, setRelease] = useState<Release | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [supportUnavailable, setSupportUnavailable] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [view, setView] = useState<View>("portfolio");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [capacity, setCapacity] = useState(.2);

  useEffect(() => {
    const controller = new AbortController();
    setLoadState("loading"); setError(""); setSupportUnavailable(false);
    getPublicDataset(controller.signal)
      .then((payload) => { setDataset(payload); setLoadState("ready"); })
      .catch((reason: Error) => { if (!controller.signal.aborted) { setError(reason.message); setLoadState("error"); } });
    Promise.allSettled([getCurrentRelease(controller.signal), getHealth(controller.signal)]).then(([releaseResult, healthResult]) => {
      if (controller.signal.aborted) return;
      if (releaseResult.status === "fulfilled") setRelease(releaseResult.value);
      if (healthResult.status === "fulfilled") setHealth(healthResult.value);
      setSupportUnavailable(releaseResult.status === "rejected" || healthResult.status === "rejected");
    });
    return () => controller.abort();
  }, [attempt]);

  const records = dataset?.records ?? [];
  const filtered = useMemo(() => filterRecords(records, filters), [records, filters]);
  const selectedModel = dataset ? dataset.evidence.models[dataset.evidence.selection.selected_model] : undefined;

  if (loadState === "loading") return <LoadingState />;
  if (loadState === "error") return <UnavailableState detail={`${error} No record data was exposed.`} onRetry={() => setAttempt((value) => value + 1)} />;
  if (!dataset || !records.length || !selectedModel) return <UnavailableState detail="The artifact is empty or its selected model is unavailable. No record data was exposed." onRetry={() => setAttempt((value) => value + 1)} />;

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to dashboard content</a>
    <header className="masthead">
      <div className="masthead-brand">
        <span className="brand-mark" aria-hidden="true">CR</span>
        <div><strong>Model validation workspace</strong><span>Consumer credit · retrospective benchmark</span></div>
      </div>
      <div className="boundary"><b>Research only</b><span>No approval, denial, pricing, or lending recommendation</span></div>
      <dl className="masthead-meta"><div><dt>Records</dt><dd>{number.format(records.length)}</dd></div><div><dt>Evidence</dt><dd>{dataset.source.evaluation_sha256.slice(0, 8)}</dd></div></dl>
    </header>

    <nav className="question-nav" aria-label="Dashboard views">
      {NAVIGATION.map((item) => <button key={item.value} className={view === item.value ? "active" : ""} aria-current={view === item.value ? "page" : undefined} onClick={() => setView(item.value)}>{item.label}</button>)}
    </nav>

    <FilterBar filters={filters} setFilters={setFilters} capacity={capacity} setCapacity={setCapacity} resultCount={filtered.length} totalCount={records.length} />

    <main id="main-content" className="dashboard" tabIndex={-1}>
      {view === "portfolio" && <PortfolioView records={filtered} filters={filters} setFilters={setFilters} />}
      {view === "review" && <ReviewView model={selectedModel} capacity={capacity} setCapacity={setCapacity} />}
      {view === "cohorts" && <CohortView records={filtered} filters={filters} setFilters={setFilters} />}
      {view === "assurance" && <AssuranceView dataset={dataset} release={release} health={health} supportUnavailable={supportUnavailable} />}
      {view === "records" && <RecordView records={filtered} filterLabels={describeFilters(filters)} capacity={capacity} denominator={records.length} />}
    </main>

    <footer className="site-footer">
      <div><strong>Source and use boundary</strong><p>{dataset.source.citation} Licensed {dataset.source.license}. Academic benchmark records only.</p></div>
      <dl><div><dt>Source checksum</dt><dd><code>{dataset.source.archive_sha256}</code></dd></div><div><dt>Evaluation checksum</dt><dd><code>{dataset.source.evaluation_sha256}</code></dd></div></dl>
    </footer>
  </div>;
}

function FilterBar({ filters, setFilters, capacity, setCapacity, resultCount, totalCount }: { filters: Filters; setFilters: (filters: Filters) => void; capacity: number; setCapacity: (value: number) => void; resultCount: number; totalCount: number }) {
  const active = describeFilters(filters);
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters({ ...filters, [key]: value });
  return <section className="filter-shell" aria-label="Global cohort filters">
    <div className="filter-primary">
      <div className="filter-context"><span>Active cohort</span><strong>{number.format(resultCount)} <small>of {number.format(totalCount)} records</small></strong></div>
      <label>Research-risk band<select value={filters.band} onChange={(event) => update("band", event.target.value)}><option value="all">All bands</option>{SCORE_BANDS.map((band) => <option key={band}>{band}</option>)}</select></label>
      <label>Observed outcome<select value={filters.outcome} onChange={(event) => update("outcome", event.target.value as Filters["outcome"])}><option value="all">All outcomes</option><option value="default">Observed default</option><option value="non-default">No observed default</option></select></label>
      <label>Repayment status<select value={filters.delinquency} onChange={(event) => update("delinquency", event.target.value)}><option value="all">All statuses</option>{DELINQUENCY_LEVELS.map((level) => <option key={level}>{level}</option>)}</select></label>
      <label>Review capacity<select value={capacity} onChange={(event) => setCapacity(Number(event.target.value))}>{[.05,.1,.2,.35,.5].map((value) => <option value={value} key={value}>{percent.format(value)}</option>)}</select></label>
      <button className="reset-button" disabled={isDefaultFilters(filters)} onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</button>
    </div>
    <details className="advanced-filters">
      <summary>Numeric ranges <span>reported limit, payment-to-bill ratio, and research score</span></summary>
      <div className="range-grid">
        <fieldset><legend>Reported credit limit</legend><label>Minimum<input type="number" min="10000" max={filters.limitMax} step="10000" value={filters.limitMin} onChange={(event) => update("limitMin", Number(event.target.value))}/></label><label>Maximum<input type="number" min={filters.limitMin} max="1000000" step="10000" value={filters.limitMax} onChange={(event) => update("limitMax", Number(event.target.value))}/></label></fieldset>
        <fieldset><legend>Payment-to-bill ratio</legend><label>Minimum<input type="number" min="0" max={filters.paymentRatioMax} step="0.05" value={filters.paymentRatioMin} onChange={(event) => update("paymentRatioMin", Number(event.target.value))}/></label><label>Maximum<input type="number" min={filters.paymentRatioMin} max="10" step="0.05" value={filters.paymentRatioMax} onChange={(event) => update("paymentRatioMax", Number(event.target.value))}/></label></fieldset>
        <fieldset><legend>Research score</legend><label>Minimum<input type="number" min="0" max={filters.scoreMax} step="0.05" value={filters.scoreMin} onChange={(event) => update("scoreMin", Number(event.target.value))}/></label><label>Maximum<input type="number" min={filters.scoreMin} max="1" step="0.05" value={filters.scoreMax} onChange={(event) => update("scoreMax", Number(event.target.value))}/></label></fieldset>
      </div>
    </details>
    <div className="filter-tokens" aria-live="polite">{active.length ? active.map((label) => <span key={label}>{label}</span>) : <span className="quiet">No cohort filters applied</span>}</div>
  </section>;
}

function ViewIntro({ title, description, source }: { title: string; description: string; source: string }) {
  return <header className="view-intro"><div><h1>{title}</h1><p>{description}</p></div><span>{source}</span></header>;
}

function PortfolioView({ records, filters, setFilters }: { records: CreditRecord[]; filters: Filters; setFilters: (filters: Filters) => void }) {
  const summary = useMemo(() => portfolioSummary(records), [records]);
  const bands = useMemo(() => bandSummaries(records), [records]);
  const repayment = useMemo(() => delinquencySummaries(records), [records]);
  if (!records.length) return <EmptyCohort onReset={() => setFilters(DEFAULT_FILTERS)} />;
  return <>
    <ViewIntro title="Portfolio overview" description="Observed outcomes, research-score bands, repayment status, and reported-limit concentration for the active cohort." source="Governed 30,000-row analyst artifact" />
    <section className="posture-ledger" aria-label="Filtered portfolio posture KPIs">
      <article className="primary-kpi"><span>Observed default rate</span><strong>{percent.format(summary.defaultRate)}</strong><p>{number.format(summary.defaults)} of {number.format(summary.count)} filtered academic records carry the next-period observed-default label.</p><small>Retrospective outcome · not a forecast</small></article>
      <div className="kpi-ledger">
        <Kpi label="Elevated / high score share" value={percent.format(summary.elevatedShare)} detail={`${number.format(summary.elevatedCount)} records`} tooltip="Share of filtered records in the Elevated or High out-of-fold research-score bands. Bands are analytical groupings, not policy thresholds." />
        <Kpi label="Reported limit total" value={compactMoney.format(summary.limitTotal)} detail={`Median ${money.format(summary.limitMedian)} · mean ${money.format(summary.limitAverage)}`} tooltip="Sum of source LIMIT_BAL values. This is a reported credit-limit amount, not balance, loss, or exposure at default." />
        <Kpi label="Upper-band limit share" value={percent.format(summary.elevatedLimitShare)} detail="Elevated + High score bands" tooltip="Share of summed reported credit limits in the Elevated and High research-score bands within the filtered cohort." />
        <Kpi label="Any repayment delay" value={percent.format(summary.delayedShare)} detail={`${number.format(summary.delayed)} records · severe ${percent.format(summary.severeShare)}`} tooltip="Share whose derived delinquency severity is Delayed or Severe across the six historical statement positions." />
        <Kpi label="Median payment / bill" value={decimal.format(summary.paymentRatioMedian)} detail={`${percent.format(summary.lowRatioShare)} below ${LOW_PAYMENT_RATIO.toFixed(2)}`} tooltip="Median deterministic payment-to-bill ratio. The low-ratio analytical cut is 0.10 and does not indicate affordability." />
      </div>
    </section>
    <section className="analysis-grid two-one">
      <ChartFrame eyebrow="Score concentration" title="Score-band distribution" subtitle={`${number.format(records.length)} records · select a band to cross-filter`} meaning="The bars show cohort size; the rust line shows the observed-default share within each band." decision="Choose a non-demographic score cohort for deeper retrospective comparison." limitation="Out-of-fold research bands describe this academic sample and are not lending thresholds." table={<SimpleTable headers={["Band","Records","Observed defaults","Observed default rate"]} rows={bands.map((row)=>[row.label,number.format(row.count),number.format(row.defaults),percent.format(row.defaultRate)])}/>}>
        <BandPopulationChart data={bands} selected={filters.band} onSelect={(band)=>setFilters({...filters,band})}/>
      </ChartFrame>
      <ChartFrame eyebrow="Repayment posture" title="Repayment-status distribution" subtitle={`${number.format(records.length)} filtered records · select a state to cross-filter`} meaning="Bar length shows population; dot position shows the observed-default share on a common 0–100% scale." decision="Compare current/paid, delayed, and severe historical repayment cohorts." limitation="Statuses summarize six statement positions; they do not form a dated trend." table={<SimpleTable headers={["Repayment state","Records","Observed default rate"]} rows={repayment.map((row)=>[row.label,number.format(row.count),percent.format(row.defaultRate)])}/>}>
        <DelinquencyChart data={repayment} selected={filters.delinquency} onSelect={(delinquency)=>setFilters({...filters,delinquency})}/>
      </ChartFrame>
    </section>
    <section className="analysis-grid one-one">
      <ChartFrame eyebrow="Reported limits" title="Credit-limit distribution by score band" subtitle="Whiskers show min/max; boxes show 25th–75th percentiles; center rule is the median" meaning="Higher score bands can be compared without collapsing reported limits to one average." decision="Identify bands where limit distributions warrant cohort investigation." limitation="Reported credit limit is not current balance, loss, or exposure at default." table={<SimpleTable headers={["Band","Minimum","25th percentile","Median","75th percentile","Maximum"]} rows={bands.map((row)=>[row.label,money.format(row.min),money.format(row.q1),money.format(row.median),money.format(row.q3),money.format(row.max)])}/>}>
        <CreditLimitBoxPlot data={bands}/>
      </ChartFrame>
      <LimitConcentration bands={bands}/>
    </section>
  </>;
}

function LimitConcentration({ bands }: { bands: ReturnType<typeof bandSummaries> }) {
  const ordered = [...bands].sort((a,b)=>b.limitTotal-a.limitTotal); let cumulative=0;
  return <article className="analysis-block concentration-block"><header className="analysis-heading"><div><h2>Reported-limit concentration</h2><p><span>Concentration</span>Filtered cohort · sorted by summed reported limit</p></div></header><div className="pareto-list">{ordered.map((row)=>{cumulative+=row.limitShare;return <div key={row.label}><div><b>{row.label}</b><span>{compactMoney.format(row.limitTotal)} · {percent.format(row.limitShare)}</span></div><i><span style={{width:percent.format(row.limitShare)}}></span></i><small>Cumulative {percent.format(cumulative)}</small></div>})}</div><footer className="analysis-footer"><details className="metric-context"><summary>Metric context</summary><dl><div><dt>Reading</dt><dd>Each bar is the band's share of summed reported limits; cumulative share follows descending concentration.</dd></div><div><dt>Permitted use</dt><dd>Locate non-demographic bands that concentrate reported limit amounts.</dd></div><div><dt>Constraint</dt><dd>Limit amount is not balance, loss, or financial exposure.</dd></div></dl></details><details className="chart-table"><summary>Data table</summary><SimpleTable headers={["Band","Reported limit total","Share","Cumulative share"]} rows={ordered.map((row,index)=>[row.label,compactMoney.format(row.limitTotal),percent.format(row.limitShare),percent.format(ordered.slice(0,index+1).reduce((sum,item)=>sum+item.limitShare,0))])}/></details></footer></article>;
}

function ReviewView({ model, capacity, setCapacity }: { model: Model; capacity: number; setCapacity: (value: number) => void }) {
  const scenarios = reviewScenarios(model); const scenario = scenarios.find((row)=>row.capacity===capacity) ?? scenarios[0]; const gains=cumulativeGains(model);
  return <>
    <ViewIntro title="Review-capacity analysis" description="Prespecified workload, capture, and review-yield points on the fixed 6,000-row holdout. Cohort filters do not alter this evidence." source="Immutable held-out evaluation" />
    <section className="scenario-ribbon" aria-label="Selected review scenario">
      <div className="scenario-capacity"><span>Selected capacity</span><strong>{percent.format(scenario.capacity)}</strong><select aria-label="Selected review capacity" value={capacity} onChange={(event)=>setCapacity(Number(event.target.value))}>{scenarios.map((row)=><option key={row.capacity} value={row.capacity}>{percent.format(row.capacity)}</option>)}</select></div>
      <Kpi label="Historical queue" value={number.format(scenario.queue_size)} detail={`of ${number.format(scenario.sampleSize)} holdout rows · fixed workload`} tooltip="Number of held-out rows in the score-ranked review set at the selected capacity." />
      <Kpi label="Observed defaults captured" value={number.format(scenario.captured_defaults)} detail={`${percent.format(scenario.recall)} of ${number.format(scenario.totalDefaults)}`} tooltip="Observed holdout default labels captured in the selected set; this is recall, not prevented default." />
      <Kpi label="Non-default reviews" value={number.format(scenario.non_default_reviews)} detail={`${formatInterval(scenario.confidence_intervals_95?.non_default_reviews, number.format)} · 95% interval`} tooltip="Reviewed holdout rows without the observed-default label. This measures historical review burden, not an adverse action." />
      <Kpi label="Yield / precision" value={percent.format(scenario.precision)} detail="Observed defaults ÷ reviewed rows" tooltip="Share of reviewed holdout rows carrying the observed-default label." />
      <Kpi label="Capture lift vs random" value={`${scenario.lift_vs_random.toFixed(2)}×`} detail={`Recall ${percent.format(scenario.recall)} · ${formatInterval(scenario.confidence_intervals_95?.recall, percent.format)}`} tooltip="Selected-set precision divided by the holdout observed-default prevalence." />
      <Kpi label="Incremental yield" value={scenario.incremental_yield == null ? "First step" : percent.format(scenario.incremental_yield)} detail={scenario.incremental_yield == null ? "No prior capacity point" : `${formatInterval(scenario.confidence_intervals_95?.incremental_yield, percent.format)} · 95% interval`} tooltip="Marginal historical yield versus the preceding prespecified capacity point." />
    </section>
    <section className="analysis-grid one-one">
      <ChartFrame eyebrow="Holdout capacity" title="Capacity frontier" subtitle="Queue size, precision, and recall · select a point" meaning="More capacity captures more observed defaults while historical review yield declines." decision="Compare a bounded workload point with its documented capture and non-default review burden." limitation="These are fixed holdout results with bootstrap intervals, not a production staffing forecast." table={<SimpleTable headers={["Capacity","Queue","Captured defaults (95% CI)","Non-default reviews (95% CI)","Precision (95% CI)","Recall (95% CI)","Lift","Incremental yield"]} rows={scenarios.map((row)=>[percent.format(row.capacity),number.format(row.queue_size),`${number.format(row.captured_defaults)} (${formatInterval(row.confidence_intervals_95?.captured_defaults,number.format)})`,`${number.format(row.non_default_reviews)} (${formatInterval(row.confidence_intervals_95?.non_default_reviews,number.format)})`,`${percent.format(row.precision)} (${formatInterval(row.confidence_intervals_95?.precision,percent.format)})`,`${percent.format(row.recall)} (${formatInterval(row.confidence_intervals_95?.recall,percent.format)})`,`${row.lift_vs_random.toFixed(2)}×`,row.incremental_yield==null?"—":percent.format(row.incremental_yield)])}/> }>
        <ReviewFrontier data={scenarios} selected={scenario.capacity} onSelect={setCapacity}/>
      </ChartFrame>
      <ChartFrame eyebrow="Holdout ranking" title="Cumulative gains and lift" subtitle="Selected model · held-out score deciles · random diagonal shown" meaning={`The highest ${percent.format(gains[1]?.populationShare ?? .2)} of holdout scores captured ${percent.format(gains[1]?.gain ?? 0)} of observed defaults.`} decision="Assess whether the ranking concentrates historical outcomes early enough for further research." limitation="Deciles are evaluation groups, not individual action recommendations." table={<SimpleTable headers={["Top population share","Cumulative observed defaults captured","Decile lift"]} rows={gains.map((row)=>[percent.format(row.populationShare),percent.format(row.gain),`${row.lift.toFixed(2)}×`])}/>}>
        <GainsChart data={gains}/>
      </ChartFrame>
    </section>
    <div className="boundary-note"><strong>Use boundary</strong><p>“Review” is a retrospective capacity simulation. It does not create a live queue, prioritize a consumer, or authorize a lending action.</p></div>
  </>;
}

function CohortView({ records, filters, setFilters }: { records: CreditRecord[]; filters: Filters; setFilters: (filters: Filters) => void }) {
  const matrix=useMemo(()=>cohortMatrix(records),[records]); const sequence=useMemo(()=>sequenceProfile(records),[records]); const repayment=useMemo(()=>repaymentComposition(records),[records]);
  const scores=useMemo(()=>distribution(records,"research_score",[0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1]),[records]);
  const limits=useMemo(()=>distribution(records,"LIMIT_BAL",[10_000,50_000,140_000,300_000,500_000,1_000_000]),[records]);
  const ratios=useMemo(()=>distribution(records,"payment_to_bill_ratio",[0,.05,.1,.25,.5,1,2,5,10]),[records]);
  if(!records.length) return <EmptyCohort onReset={()=>setFilters(DEFAULT_FILTERS)}/>;
  return <>
    <ViewIntro title="Cohort diagnostics" description="Cross-filter score, repayment, reported-limit, and payment-profile evidence. Historical statement positions are not calendar time." source="Governed artifact · deterministic fields" />
    <section className="analysis-grid full">
      <ChartFrame eyebrow="Cross-filter matrix" title="Score band × repayment severity" subtitle={`${number.format(records.length)} filtered records · observed-default rate and population`} meaning="The matrix reveals combinations where population and historical outcome concentration coexist." decision="Select a score-band and repayment-status intersection for linked analysis and records." limitation="Small or empty filtered cells are unstable; the matrix does not identify causes." table={<SimpleTable headers={["Repayment status","Score band","Records","Observed default rate"]} rows={matrix.map((row)=>[row.delinquency,row.band,number.format(row.count),percent.format(row.defaultRate)])}/>}>
        <MatrixHeatmap data={matrix} selectedBand={filters.band} selectedDelinquency={filters.delinquency} onSelect={(band,delinquency)=>setFilters({...filters,band:filters.band===band&&filters.delinquency===delinquency?"all":band,delinquency:filters.band===band&&filters.delinquency===delinquency?"all":delinquency})}/>
      </ChartFrame>
    </section>
    <section className="analysis-grid one-one">
      <ChartFrame eyebrow="Historical positions" title="Repayment-status composition" subtitle="PAY_0 through PAY_6 are source positions, not calendar dates" meaning="Cells show the share of the filtered cohort in each repayment-status group at each historical position." decision="Compare persistence or movement in descriptive repayment-status composition." limitation="The sequence has no dated calendar axis and must not be read as a portfolio trend." table={<SimpleTable headers={["Status","PAY_0","PAY_2","PAY_3","PAY_4","PAY_5","PAY_6"]} rows={repayment.map((row)=>[row.label,...row.values.map((value)=>percent.format(value.share))])}/>}>
        <RepaymentHeatmap rows={repayment}/>
      </ChartFrame>
      <ChartFrame eyebrow="Historical positions" title="Bill and payment profiles" subtitle="Filtered cohort averages · non-calendar sequence" meaning="The paired lines compare mean source bill amounts with mean payments at aligned historical positions." decision="Inspect whether the filtered cohort's reported bill/payment profile merits record-level review." limitation="Averages can hide dispersion; no cash-flow, affordability, or causal claim is supported." table={<SimpleTable headers={["Historical position","Average bill","Average payment"]} rows={sequence.bills.map((row,index)=>[index+1,money.format(row.value),money.format(sequence.payments[index].value)])}/>}>
        <ProfileLines bills={sequence.bills} payments={sequence.payments}/>
      </ChartFrame>
    </section>
    <section className="analysis-grid three">
      <ChartFrame eyebrow="Distribution" title="Research scores" subtitle="Records and observed-default rate" meaning="Counts and historical outcomes can be compared across equal-width score bins." decision="Narrow the research-score range for cohort analysis." limitation="The score is a retrospective research output, not an operational probability." table={<SimpleTable headers={["Score range","Records","Observed default rate"]} rows={scores.map((row)=>[`${percent.format(row.minimum)}–${percent.format(row.maximum)}`,number.format(row.count),percent.format(row.defaultRate)])}/>}><DistributionChart data={scores} formatLabel={(value)=>`${Math.round(value*100)}%`} onSelect={(minimum,maximum)=>setFilters({...filters,scoreMin:minimum,scoreMax:maximum})}/></ChartFrame>
      <ChartFrame eyebrow="Distribution" title="Reported limits" subtitle="Unequal business-readable bins · lower bounds shown" meaning="The distribution locates records and observed outcomes across reported limit ranges." decision="Narrow the reported-limit range for linked cohort and record analysis." limitation="Bin widths differ and bar height shows counts, not density or financial exposure." table={<SimpleTable headers={["Limit range","Records","Observed default rate"]} rows={limits.map((row)=>[`${money.format(row.minimum)}–${money.format(row.maximum)}`,number.format(row.count),percent.format(row.defaultRate)])}/>}><DistributionChart data={limits} formatLabel={(value)=>compactMoney.format(value)} onSelect={(minimum,maximum)=>setFilters({...filters,limitMin:minimum,limitMax:maximum})}/></ChartFrame>
      <ChartFrame eyebrow="Distribution" title="Payment-to-bill ratio" subtitle="Derived ratio clipped at 10" meaning="The plot separates low-ratio and higher-ratio profiles in the filtered cohort." decision="Narrow ratio evidence for linked cohort and record investigation." limitation="The ratio is descriptive, clipped, and not affordability or income evidence." table={<SimpleTable headers={["Ratio range","Records","Observed default rate"]} rows={ratios.map((row)=>[`${row.minimum.toFixed(2)}–${row.maximum.toFixed(2)}`,number.format(row.count),percent.format(row.defaultRate)])}/>}><DistributionChart data={ratios} formatLabel={(value)=>value.toFixed(2)} onSelect={(minimum,maximum)=>setFilters({...filters,paymentRatioMin:minimum,paymentRatioMax:maximum})}/></ChartFrame>
    </section>
  </>;
}

function AssuranceView({ dataset, release, health, supportUnavailable }: { dataset: PublicDataset; release: Release | null; health: Health | null; supportUnavailable: boolean }) {
  const evidence=dataset.evidence; const selected=evidence.models[evidence.selection.selected_model]; const sampleSize=selected.lift_by_decile.reduce((sum,row)=>sum+row.n,0); const [refusal,setRefusal]=useState(false);
  const development=evidence.development_evaluation; const comparisons=development.paired_comparisons; const ablations=development.feature_group_ablations; const robustness=selected.non_demographic_cohort_robustness ?? [];
  const models=Object.entries(evidence.models).map(([name,model])=>({name:plainModelName(name),prAuc:model.metrics.pr_auc,auroc:model.metrics.auroc,brier:model.metrics.brier,ece:model.metrics.ece_10_bin}));
  return <>
    <ViewIntro title="Model validation" description="Readiness, paired baselines, repeated-fold stability, calibration, cohort robustness, feature-group reliance, and lineage." source="Frozen holdout + repeated development evaluation" />
    <section className="assurance-summary">
      <article><p className="section-label">Readiness verdict</p><h2>{evidence.readiness.verdict}</h2><p>{evidence.readiness.limitation}</p><span>Research simulation only</span></article>
      <Kpi label="Outcome ranking (PR-AUC)" value={selected.metrics.pr_auc.toFixed(4)} detail={`95% interval ${selected.confidence_intervals_95.pr_auc.map((value)=>value.toFixed(4)).join("–")}`} tooltip="Precision-recall area under the curve on the fixed holdout. Higher is better; the interval records bootstrap uncertainty." />
      <Kpi label="Overall ranking (AUROC)" value={selected.metrics.auroc.toFixed(4)} detail={`95% interval ${selected.confidence_intervals_95.auroc.map((value)=>value.toFixed(4)).join("–")}`} tooltip="Area under the receiver operating characteristic curve on the fixed holdout. Higher is better." />
      <Kpi label="Probability error (Brier)" value={selected.metrics.brier.toFixed(4)} detail={`95% interval ${selected.confidence_intervals_95.brier.map((value)=>value.toFixed(4)).join("–")}`} tooltip="Mean squared error between research scores and observed labels on the holdout. Lower is better." />
      <Kpi label="Calibration gap (ECE)" value={selected.metrics.ece_10_bin.toFixed(4)} detail="10-bin expected calibration error" tooltip="Weighted average gap between mean score and observed outcome rate across ten bins. Lower is better." />
    </section>
    <section className="analysis-grid one-one">
      <ChartFrame eyebrow="Holdout comparison" title="Model metric comparison" subtitle="Natural metric direction retained · selected model outlined" meaning="The selected challenger has the strongest recorded PR-AUC and AUROC and the lowest Brier and calibration error among the evaluated models." decision="Confirm the validation-locked model selection is supported by multiple metrics." limitation="Differences are measured on one fixed holdout; overlapping uncertainty should temper comparison." table={<SimpleTable headers={["Model","PR-AUC","AUROC","Brier","Calibration error"]} rows={models.map((model)=>[model.name,model.prAuc.toFixed(4),model.auroc.toFixed(4),model.brier.toFixed(4),model.ece.toFixed(4)])}/>}>
        <ModelComparisonChart models={models} selected={plainModelName(evidence.selection.selected_model)}/>
      </ChartFrame>
      <ChartFrame eyebrow="Calibration" title="Observed rate by score bin" subtitle={`Selected model · ${number.format(sampleSize)} held-out rows · point size reflects bin population`} meaning="Points near the diagonal indicate agreement between mean score and observed-default rate within a bin." decision="Assess whether research scores are calibrated enough for descriptive scenario analysis." limitation="Sparse high-score bins are uncertain; calibration is not verified out of time." table={<SimpleTable headers={["Score bin","Rows","Mean score","Observed default rate"]} rows={selected.calibration_curve.map((row)=>[row.bin,number.format(row.n),percent.format(row.mean_score),percent.format(row.observed_rate)])}/>}>
        {selected.calibration_curve.length?<CalibrationChart data={selected.calibration_curve}/>:<EmptyChart message="Calibration evidence is unavailable; no curve was inferred."/>}
      </ChartFrame>
    </section>
    <section className="calibration-audit" aria-label="Calibration diagnostics"><div><span>Calibration slope</span><strong>{selected.calibration_diagnostics.slope.toFixed(3)}</strong><small>Ideal 1.000</small></div><div><span>Calibration intercept</span><strong>{selected.calibration_diagnostics.intercept.toFixed(3)}</strong><small>Ideal 0.000</small></div><p className={selected.calibration_diagnostics.warning?"warning":""}>{selected.calibration_diagnostics.warning ?? "No sparse calibration bins triggered the governed warning threshold."}</p></section>
    <section className="validation-grid" aria-label="Repeated development validation evidence">
      <EvidencePanel eyebrow="Development evaluation" title="Paired baseline comparison" description={`${development.method} · ${number.format(development.development_n)} development rows · identical folds across models`}>
        {comparisons.length?<SimpleTable headers={["Reference","PR-AUC delta","PR-AUC 95% CI","Brier delta","Brier 95% CI","Verdict"]} rows={comparisons.map((row)=>[plainModelName(row.reference),signed(row.metrics.pr_auc.mean_selected_minus_reference),formatInterval(row.metrics.pr_auc.confidence_interval_95,signed),signed(row.metrics.brier.mean_selected_minus_reference),formatInterval(row.metrics.brier.confidence_interval_95,signed),statusLabel(row.overall_status)])}/>:<EvidenceUnavailable label="Paired comparison evidence"/>}
        <p className="evidence-note">{development.tie_rule} Positive PR-AUC deltas favor the selected model; negative Brier deltas favor it.</p>
      </EvidencePanel>
      <EvidencePanel eyebrow="Development evaluation" title="Repeated-fold stability" description="Shared folds across models · frozen holdout excluded">
        {Object.keys(development.models).length?<SimpleTable headers={["Model","Mean PR-AUC","PR-AUC split range","Mean Brier","Brier split range"]} rows={Object.entries(development.models).map(([name,metrics])=>[plainModelName(name),metrics.pr_auc.mean.toFixed(4),formatInterval(metrics.pr_auc.range_95,(value)=>value.toFixed(4)),metrics.brier.mean.toFixed(4),formatInterval(metrics.brier.range_95,(value)=>value.toFixed(4))])}/>:<EvidenceUnavailable label="Split-stability evidence"/>}
        <p className="evidence-note">{development.limitation}</p>
      </EvidencePanel>
      <EvidencePanel eyebrow="Holdout evaluation" title="Non-demographic cohort robustness" description="Sample sizes, intervals, and sparse-cohort status shown">
        {robustness.length?<SimpleTable headers={["Cohort","n","Observed rate","PR-AUC (95% CI)","Status"]} rows={robustness.map((row)=>[`${cohortLabel(row.dimension)} · ${row.group}`,number.format(row.n),percent.format(row.observed_default_rate),row.metrics?`${row.metrics.pr_auc.toFixed(4)} (${formatInterval(row.confidence_intervals_95?.pr_auc,(value)=>value.toFixed(4))})`:"Unavailable",row.warning ?? statusLabel(row.sample_size_status)])}/>:<EvidenceUnavailable label="Cohort-robustness evidence"/>}
      </EvidencePanel>
      <EvidencePanel eyebrow="Development evaluation" title="Feature-group reliance" description="Groups removed one at a time · model-reliance evidence only">
        {ablations.length?<SimpleTable headers={["Removed group","PR-AUC loss","PR-AUC 95% CI","AUROC loss","AUROC 95% CI","Status"]} rows={ablations.map((row)=>[cohortLabel(row.feature_group),signed(row.metrics.pr_auc.mean_performance_loss_when_removed),formatInterval(row.metrics.pr_auc.confidence_interval_95,signed),signed(row.metrics.auroc.mean_performance_loss_when_removed),formatInterval(row.metrics.auroc.confidence_interval_95,signed),statusLabel(row.overall_status)])}/>:<EvidenceUnavailable label="Feature-group ablation evidence"/>}
        <p className="evidence-note">Model-reliance and stability evidence only — never a cause, consumer explanation, or adverse-action reason.</p>
      </EvidencePanel>
    </section>
    <section className="use-contract" aria-label="Supported and prohibited uses"><div><p className="section-label">Supported uses</p><ul>{evidence.readiness.supported_uses.map((item)=><li key={item}>{item}</li>)}</ul></div><div><p className="section-label">Prohibited uses</p><ul>{evidence.readiness.prohibited_uses.map((item)=><li key={item}>{item}</li>)}</ul></div></section>
    <section className="governance-grid">
      <article className="governance-panel"><p className="section-label">Data quality</p><h3>Artifact contract passed</h3><dl><div><dt>Rows</dt><dd>{number.format(dataset.source.rows)}</dd></div><div><dt>Missing values</dt><dd>{release ? number.format(release.source.validation.missing_cells) : "Verified: 0"}</dd></div><div><dt>Duplicate source IDs</dt><dd>{release ? number.format(release.source.validation.duplicate_ids) : "Verified: 0"}</dd></div><div><dt>Public schema</dt><dd>{dataset.source.columns.length} source columns + derived evidence</dd></div><div><dt>Protected attributes</dt><dd>Excluded from public records</dd></div></dl></article>
      <article className="governance-panel"><p className="section-label">Release lineage</p><h3>{release ? "Immutable release available" : "Local artifact context"}</h3><dl><div><dt>Release ID</dt><dd><code>{release?.release_id ?? "Not returned in local preview"}</code></dd></div><div><dt>Code revision</dt><dd><code>{release?.code_revision ?? "Not returned in local preview"}</code></dd></div><div><dt>Evaluation SHA-256</dt><dd><code>{dataset.source.evaluation_sha256}</code></dd></div><div><dt>Source SHA-256</dt><dd><code>{dataset.source.archive_sha256}</code></dd></div></dl></article>
      <article className="governance-panel"><p className="section-label">Service and use boundary</p><h3>{health?.status === "ready" ? "Read-only evidence service healthy" : "Status not verified in this session"}</h3><dl><div><dt>Database</dt><dd>{health?.checks?.database ?? "Not reported"}</dd></div><div><dt>Current release</dt><dd>{health?.checks?.current_release ?? "Not reported"}</dd></div><div><dt>Support endpoints</dt><dd>{supportUnavailable ? "Partially unavailable; artifact remained governed" : "Available"}</dd></div><div><dt>Evaluation split</dt><dd>{evidence.split.method}</dd></div></dl><p>{evidence.split.limitation}</p></article>
    </section>
    <section className="lineage-strip" aria-label="Evaluation freshness and lineage"><div><span>Evaluation schema</span><strong>v{evidence.schema_version}</strong></div><div><span>Generated UTC</span><strong>{new Date(evidence.generated_at_utc).toISOString()}</strong></div><div><span>Evaluated revision</span><strong><code>{evidence.lineage.evaluated_revision}</code></strong></div><div><span>Frozen holdout identity</span><strong><code>{evidence.split.identity.holdout.ids_sha256.slice(0,16)}</code></strong></div><div><span>Command lineage</span><strong><code>{evidence.lineage.command}</code></strong></div></section>
    <section className="refusal-panel"><div><p className="section-label">Protected and decision-language boundary</p><h3>Why is there no demographic drilldown or individual lending answer?</h3><p>Sex, education, marriage, and age are excluded from model inputs and public individual analytics. Aggregate fairness diagnostics remain local and separate.</p></div><button onClick={()=>setRefusal(!refusal)} aria-expanded={refusal}>{refusal?"Hide boundary detail":"View governed refusal"}</button>{refusal&&<div className="refusal-detail" role="status"><strong>Request refused by design</strong><p>This lab refuses approval, denial, eligibility, pricing, adverse-action, recommendation, and “the model decided” language. The permitted alternative is the record’s deterministic rank and Inside/Outside simulated review set placement.</p></div>}</section>
  </>;
}

function RecordView({ records, filterLabels, capacity, denominator }: { records: CreditRecord[]; filterLabels: string[]; capacity:number; denominator:number }) {
  const [query,setQuery]=useState(""); const [sortKey,setSortKey]=useState<keyof CreditRecord>("ID"); const [direction,setDirection]=useState<"asc"|"desc">("asc"); const [page,setPage]=useState(0); const [selected,setSelected]=useState<CreditRecord|null>(null);
  const searched=useMemo(()=>records.filter((record)=>!query.trim()||String(record.ID).includes(query.trim())),[records,query]); const sorted=useMemo(()=>sortRecords(searched,sortKey,direction),[searched,sortKey,direction]); const pages=Math.max(1,Math.ceil(sorted.length/PAGE_SIZE)); const current=Math.min(page,pages-1); const visible=sorted.slice(current*PAGE_SIZE,(current+1)*PAGE_SIZE);
  useEffect(()=>setPage(0),[records,query,sortKey,direction]);
  const sort=(key:keyof CreditRecord)=>{if(sortKey===key)setDirection(direction==="asc"?"desc":"asc");else{setSortKey(key);setDirection("desc");}};
  return <>
    <ViewIntro title="Record simulation" description="Retrospective score, band, deterministic rank, selected capacity, historical outcome, and simulated placement only." source={`Out-of-fold artifact rank · denominator ${number.format(denominator)}`} />
    <section className="record-layout">
      <div className="record-table-panel">
        <header><div><p className="section-label">Filtered workbench</p><h2>{number.format(searched.length)} research records</h2><p>{filterLabels.length?filterLabels.join(" · "):"All governed records"}</p></div><label>Search source ID<input type="search" inputMode="numeric" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="e.g. 18421"/></label></header>
        {visible.length?<><div className="table-scroll desktop-record-table"><table className="data-table records-table simulation-table"><thead><tr><Sortable label="Source ID" column="ID" current={sortKey} direction={direction} onSort={sort}/><Sortable label="Research score" column="research_score" current={sortKey} direction={direction} onSort={sort}/><Sortable label="Band" column="score_band" current={sortKey} direction={direction} onSort={sort}/><Sortable label="Rank" column="research_score_rank" current={sortKey} direction={direction} onSort={sort}/><Sortable label="Observed outcome" column="default payment next month" current={sortKey} direction={direction} onSort={sort}/><th>Selected capacity</th><th>Simulated placement</th><th><span className="sr-only">Inspect</span></th></tr></thead><tbody>{visible.map((record)=>{const placement=reviewPlacement(record,denominator,capacity);return <tr key={record.ID} className={selected?.ID===record.ID?"selected-row":""}><td className="mono">#{record.ID}</td><td className="mono score-cell">{percent.format(record.research_score)}</td><td><span className={`band-label band-${record.score_band.toLowerCase().replace(" ","-")}`}>{record.score_band}</span></td><td className="mono">{number.format(record.research_score_rank)} / {number.format(denominator)}</td><td>{record["default payment next month"]?"Observed default":"No observed default"}</td><td>{percent.format(capacity)}</td><td><strong className={placement.inside?"placement-in":"placement-out"}>{placement.label}</strong></td><td><button className="text-button" onClick={()=>setSelected(record)} aria-label={`Inspect research simulation for source record ${record.ID}`}>Inspect</button></td></tr>})}</tbody></table></div><div className="mobile-record-list">{visible.map((record)=>{const placement=reviewPlacement(record,denominator,capacity);return <button key={record.ID} className={selected?.ID===record.ID?"selected":""} onClick={()=>setSelected(record)} aria-label={`Inspect research simulation for source record ${record.ID}`}><span className="mobile-record-head"><b>#{record.ID}</b><strong className={placement.inside?"placement-in":"placement-out"}>{placement.label}</strong></span><span className="mobile-record-score"><b>{percent.format(record.research_score)}</b><small>{record.score_band} research band</small></span><span className="mobile-record-meta"><span>Rank {number.format(record.research_score_rank)} / {number.format(denominator)}</span><span>Capacity {percent.format(capacity)}</span><span>{record["default payment next month"]?"Observed default":"No observed default"}</span></span></button>})}</div><div className="pagination"><span>Page {current+1} of {pages}</span><div><button disabled={current===0} onClick={()=>setPage(current-1)}>Previous</button><button disabled={current+1>=pages} onClick={()=>setPage(current+1)}>Next</button></div></div></>:<div className="inline-empty"><strong>No matching source ID</strong><p>Clear the search or reset the global cohort filters.</p></div>}
      </div>
      <RecordInspector record={selected} capacity={capacity} denominator={denominator} onClose={()=>setSelected(null)}/>
    </section>
  </>;
}

function RecordInspector({ record, capacity, denominator, onClose }: { record: CreditRecord|null; capacity:number; denominator:number; onClose:()=>void }) {
  if(!record)return <aside className="record-inspector empty"><p className="section-label">Simulation inspector</p><h2>Select one governed record</h2><p>The inspector shows only the retrospective out-of-fold score, score band, deterministic rank, selected capacity, historical outcome, and simulated review-set placement.</p><p>It refuses lending-decision, eligibility, pricing, adverse-action, recommendation, and “the model decided” language.</p></aside>;
  const placement=reviewPlacement(record,denominator,capacity);
  return <aside className="record-inspector" aria-live="polite"><header><div><p className="section-label">Academic source record</p><h2>#{record.ID}</h2></div><button aria-label="Close record inspector" onClick={onClose}>×</button></header><div className="record-signal"><span>{record.score_band} research band</span><strong>{percent.format(record.research_score)}</strong><p>{record["default payment next month"]?"Observed historical default":"No observed historical default"}</p></div><section className="simulation-placement"><p className="section-label">Selected review capacity</p><strong>{percent.format(capacity)}</strong><dl><div><dt>Deterministic rank</dt><dd>{number.format(record.research_score_rank)} / {number.format(denominator)}</dd></div><div><dt>Historical outcome</dt><dd>{record["default payment next month"]?"Observed default":"No observed default"}</dd></div></dl><h3 className={placement.inside?"placement-in":"placement-out"}>{placement.label}</h3></section><div className="inspector-boundary"><strong>Retrospective research simulation only</strong><p>Retrospective research simulation only — not an approval, denial, price, adverse-action reason, or lending recommendation.</p></div></aside>;
}

function Sortable({ label, column, current, direction, onSort }: { label:string; column:keyof CreditRecord; current:keyof CreditRecord; direction:"asc"|"desc"; onSort:(column:keyof CreditRecord)=>void }) { const active=current===column; return <th aria-sort={active?(direction==="asc"?"ascending":"descending"):"none"}><button onClick={()=>onSort(column)}>{label}<span aria-hidden="true">{active?(direction==="asc"?"↑":"↓"):"↕"}</span></button></th>; }

function EvidencePanel({eyebrow,title,description,children}:{eyebrow:string;title:string;description:string;children:React.ReactNode}){return <article className="evidence-panel"><header><div><h2>{title}</h2><span>{eyebrow}</span></div><p>{description}</p></header>{children}</article>}

function EvidenceUnavailable({label}:{label:string}){return <div className="evidence-unavailable" role="status"><strong>{label} unavailable</strong><p>No value or visual was inferred.</p></div>}

function signed(value:number){return `${value>=0?"+":""}${value.toFixed(4)}`}
function statusLabel(value:string){return value.replaceAll("_"," ").replace(/^./,(letter)=>letter.toUpperCase())}
function cohortLabel(value:string){return value.replaceAll("_"," ").replace(/^./,(letter)=>letter.toUpperCase())}

function Kpi({ label, value, detail, tooltip }: { label:string; value:string; detail:string; tooltip:string }) { return <article className="kpi"><span>{label}<button className="info" aria-label={`${label} definition`} data-tooltip={tooltip}>i</button></span><strong>{value}</strong><p>{detail}</p></article>; }

function formatInterval(interval: [number,number] | null | undefined, format: (value:number)=>string) { return interval ? interval.map(format).join("–") : "Unavailable"; }

function EmptyCohort({onReset}:{onReset:()=>void}){return <section className="empty-cohort" role="status"><span aria-hidden="true">∅</span><div><h1>No records match this cohort</h1><p>The governed artifact remains available, but the active filter intersection is empty. No metric or chart has been inferred.</p><button onClick={onReset}>Reset cohort filters</button></div></section>}

function LoadingState(){return <div className="loading-shell" role="status" aria-live="polite"><div className="loading-mast"><i/><i/><i/></div><div className="loading-grid"><i/><i/><i/><i/><i/></div><div className="loading-charts"><i/><i/></div><p>Loading governed analyst evidence…</p></div>}

function UnavailableState({detail,onRetry}:{detail:string;onRetry:()=>void}){return <main className="unavailable-state"><p className="section-label">Governed unavailable state</p><h1>Analyst evidence is unavailable</h1><p>{detail}</p><div><button onClick={onRetry}>Retry evidence load</button><a href="/api/v1/health">View system status</a></div><small>Protected fields and partial records are never displayed when the public artifact contract fails.</small></main>}

function plainModelName(value:string){return value==="prevalence_random_baseline"?"Prevalence / random":value==="repayment_delay_rule"?"Repayment-delay rule":value==="logistic_baseline"?"Logistic baseline":value==="calibrated_hist_gradient_boosting"?"Calibrated gradient boosting":value==="calibrated_extra_trees"?"Calibrated extra trees":statusLabel(value);}
