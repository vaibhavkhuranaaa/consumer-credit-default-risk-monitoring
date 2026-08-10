import type { ReactNode } from "react";
import type { BandSummary, ReviewScenario } from "./analytics";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const number = new Intl.NumberFormat("en-US");
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

type ChartFrameProps = {
  title: string;
  eyebrow: string;
  subtitle: string;
  meaning: string;
  decision: string;
  limitation: string;
  children: ReactNode;
  table: ReactNode;
  className?: string;
};

export function ChartFrame({ title, eyebrow, subtitle, meaning, decision, limitation, children, table, className = "" }: ChartFrameProps) {
  return <article className={`analysis-block ${className}`.trim()}>
    <header className="analysis-heading">
      <div><p className="section-label">{eyebrow}</p><h2>{title}</h2><p>{subtitle}</p></div>
    </header>
    <div className="chart-region">{children}</div>
    <dl className="chart-notes">
      <div><dt>What this means</dt><dd>{meaning}</dd></div>
      <div><dt>Decision supported</dt><dd>{decision}</dd></div>
      <div><dt>Limitation</dt><dd>{limitation}</dd></div>
    </dl>
    <details className="chart-table"><summary>View accessible data table</summary>{table}</details>
  </article>;
}

export function EmptyChart({ message = "No records match the active filters." }: { message?: string }) {
  return <div className="chart-empty" role="status"><span aria-hidden="true">∅</span><p>{message}</p></div>;
}

function activate(event: React.KeyboardEvent<SVGGElement>, action?: () => void) {
  if (action && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); action(); }
}

export function BandPopulationChart({ data, selected, onSelect }: { data: BandSummary[]; selected: string; onSelect: (band: string) => void }) {
  const maxCount = Math.max(...data.map((row) => row.count), 1);
  const plotTop = 24; const plotBottom = 226; const barWidth = 72; const gap = 54; const start = 58;
  const points = data.map((row, index) => `${start + index * (barWidth + gap) + barWidth / 2},${plotBottom - row.defaultRate * (plotBottom - plotTop)}`).join(" ");
  return <svg className="chart-svg" viewBox="0 0 680 280" role="img" aria-label="Population bars and observed default rate line by research score band">
    {[0, .25, .5, .75, 1].map((tick) => <g key={tick}><line className="grid-line" x1="48" x2="652" y1={plotBottom - tick * (plotBottom - plotTop)} y2={plotBottom - tick * (plotBottom - plotTop)} /><text className="axis-label" x="42" y={plotBottom - tick * (plotBottom - plotTop) + 4} textAnchor="end">{percent.format(tick)}</text></g>)}
    {data.map((row, index) => {
      const x = start + index * (barWidth + gap); const height = row.count / maxCount * 170;
      const action = () => onSelect(selected === row.label ? "all" : row.label);
      return <g key={row.label} className={`chart-mark clickable${selected === row.label ? " selected" : ""}`} role="button" tabIndex={0} aria-label={`${row.label}: ${number.format(row.count)} records, ${percent.format(row.defaultRate)} observed default rate. Select to filter.`} onClick={action} onKeyDown={(event) => activate(event, action)}>
        <rect className="bar-population" x={x} y={plotBottom - height} width={barWidth} height={height} />
        <circle className="point-default" cx={x + barWidth / 2} cy={plotBottom - row.defaultRate * (plotBottom - plotTop)} r="5" />
        <text className="value-label" x={x + barWidth / 2} y={plotBottom - height - 8} textAnchor="middle">{compact.format(row.count)}</text>
        <text className="axis-label" x={x + barWidth / 2} y="248" textAnchor="middle">{row.label}</text>
      </g>;
    })}
    <polyline className="line-default" points={points} />
    <g className="legend" transform="translate(468 12)"><rect className="bar-population" x="0" y="0" width="14" height="8" /><text x="20" y="8">Records</text><circle className="point-default" cx="90" cy="4" r="4"/><text x="99" y="8">Observed default rate</text></g>
  </svg>;
}

export function CreditLimitBoxPlot({ data }: { data: BandSummary[] }) {
  const max = Math.max(...data.map((row) => row.max), 1); const left = 118; const width = 500;
  return <svg className="chart-svg" viewBox="0 0 680 260" role="img" aria-label="Reported credit limit percentile distribution by score band">
    {[0, .25, .5, .75, 1].map((tick) => <g key={tick}><line className="grid-line" x1={left + tick * width} x2={left + tick * width} y1="18" y2="220"/><text className="axis-label" x={left + tick * width} y="242" textAnchor="middle">{money.format(max * tick)}</text></g>)}
    {data.map((row, index) => { const y = 38 + index * 40; const scale = (value: number) => left + value / max * width; return <g key={row.label}>
      <text className="axis-label strong" x="108" y={y + 4} textAnchor="end">{row.label}</text>
      {row.count ? <><line className="whisker" x1={scale(row.min)} x2={scale(row.max)} y1={y} y2={y}/><line className="whisker" x1={scale(row.min)} x2={scale(row.min)} y1={y - 7} y2={y + 7}/><line className="whisker" x1={scale(row.max)} x2={scale(row.max)} y1={y - 7} y2={y + 7}/><rect className="box-range" x={scale(row.q1)} y={y - 10} width={Math.max(scale(row.q3) - scale(row.q1), 1)} height="20"/><line className="median-line" x1={scale(row.median)} x2={scale(row.median)} y1={y - 11} y2={y + 11}/></> : <text className="axis-label" x={left} y={y + 4}>No records</text>}
    </g>; })}
  </svg>;
}

export function DelinquencyChart({ data, selected, onSelect }: { data: { label: string; count: number; defaultRate: number }[]; selected: string; onSelect: (value: string) => void }) {
  const max = Math.max(...data.map((row) => row.count), 1);
  return <svg className="chart-svg" viewBox="0 0 680 230" role="img" aria-label="Repayment status composition with observed default rate">
    {data.map((row, index) => { const y = 34 + index * 58; const width = row.count / max * 430; const action = () => onSelect(selected === row.label ? "all" : row.label); return <g key={row.label} className={`chart-mark clickable${selected === row.label ? " selected" : ""}`} role="button" tabIndex={0} onClick={action} onKeyDown={(event) => activate(event, action)} aria-label={`${row.label}: ${number.format(row.count)} records and ${percent.format(row.defaultRate)} observed default rate. Select to filter.`}>
      <text className="axis-label strong" x="16" y={y + 5}>{row.label}</text><rect className="bar-neutral" x="154" y={y - 12} width={width} height="24"/><circle className="point-default" cx={154 + row.defaultRate * 430} cy={y} r="6"/><text className="value-label" x={Math.min(160 + width, 615)} y={y + 5}>{compact.format(row.count)}</text><text className="rate-label" x="650" y={y + 5} textAnchor="end">{percent.format(row.defaultRate)}</text>
    </g>; })}
    <text className="axis-label" x="154" y="216">Bar: cohort size · dot position: observed default rate on 0–100% scale</text>
  </svg>;
}

export function ReviewFrontier({ data, selected, onSelect }: { data: ReviewScenario[]; selected: number; onSelect: (capacity: number) => void }) {
  const x = (capacity: number) => 74 + (capacity - .05) / .45 * 550; const y = (value: number) => 218 - value * 178; const queueMax = Math.max(...data.map((row) => row.queue_size), 1);
  const precision = data.map((row) => `${x(row.capacity)},${y(row.precision)}`).join(" "); const recall = data.map((row) => `${x(row.capacity)},${y(row.recall)}`).join(" ");
  return <svg className="chart-svg" viewBox="0 0 680 280" role="img" aria-label="Review capacity frontier with workload bars, precision, and recall">
    {[0, .25, .5, .75, 1].map((tick) => <g key={tick}><line className="grid-line" x1="62" x2="640" y1={y(tick)} y2={y(tick)}/><text className="axis-label" x="54" y={y(tick) + 4} textAnchor="end">{percent.format(tick)}</text></g>)}
    {data.map((row) => { const barHeight = row.queue_size / queueMax * 64; const action = () => onSelect(row.capacity); return <g key={row.capacity} className={`chart-mark clickable${selected === row.capacity ? " selected" : ""}`} role="button" tabIndex={0} onClick={action} onKeyDown={(event) => activate(event, action)} aria-label={`${percent.format(row.capacity)} capacity: ${number.format(row.queue_size)} reviews, ${percent.format(row.precision)} precision, ${percent.format(row.recall)} recall. Select scenario.`}>
      <rect className="bar-workload" x={x(row.capacity) - 20} y={218 - barHeight} width="40" height={barHeight}/><circle className="point-precision" cx={x(row.capacity)} cy={y(row.precision)} r="5"/><circle className="point-recall" cx={x(row.capacity)} cy={y(row.recall)} r="5"/><text className="axis-label strong" x={x(row.capacity)} y="244" textAnchor="middle">{percent.format(row.capacity)}</text><text className="axis-label" x={x(row.capacity)} y="260" textAnchor="middle">{compact.format(row.queue_size)}</text>
    </g>; })}
    <polyline className="line-precision" points={precision}/><polyline className="line-recall" points={recall}/>
    <g className="legend" transform="translate(340 12)"><rect className="bar-workload" x="0" y="0" width="13" height="8"/><text x="19" y="8">Queue</text><circle className="point-precision" cx="86" cy="4" r="4"/><text x="96" y="8">Precision</text><circle className="point-recall" cx="166" cy="4" r="4"/><text x="176" y="8">Recall</text></g>
  </svg>;
}

export function GainsChart({ data }: { data: { decile: number; populationShare: number; gain: number; lift: number }[] }) {
  const x = (value: number) => 58 + value * 570; const y = (value: number) => 226 - value * 186;
  const points = `58,226 ${data.map((row) => `${x(row.populationShare)},${y(row.gain)}`).join(" ")}`;
  return <svg className="chart-svg" viewBox="0 0 680 270" role="img" aria-label="Cumulative gains curve by score decile">
    {[0, .25, .5, .75, 1].map((tick) => <g key={tick}><line className="grid-line" x1="58" x2="628" y1={y(tick)} y2={y(tick)}/><text className="axis-label" x="50" y={y(tick)+4} textAnchor="end">{percent.format(tick)}</text><text className="axis-label" x={x(tick)} y="250" textAnchor="middle">{percent.format(tick)}</text></g>)}
    <line className="ideal-line" x1="58" y1="226" x2="628" y2="40"/><polyline className="line-primary" points={points}/>{data.map((row)=><g key={row.decile}><circle className="point-primary" cx={x(row.populationShare)} cy={y(row.gain)} r="4"/><title>{`Top ${percent.format(row.populationShare)} captured ${percent.format(row.gain)} of observed defaults; decile lift ${row.lift.toFixed(2)}×`}</title></g>)}
    <text className="axis-label" x="343" y="266" textAnchor="middle">Share of held-out records reviewed from highest score</text>
  </svg>;
}

export function CalibrationChart({ data }: { data: { bin: string; n: number; mean_score: number; observed_rate: number }[] }) {
  const x = (value: number) => 64 + value * 560; const y = (value: number) => 224 - value * 184; const points = data.map((row) => `${x(row.mean_score)},${y(row.observed_rate)}`).join(" ");
  return <svg className="chart-svg" viewBox="0 0 680 270" role="img" aria-label="Calibration curve comparing mean research score with observed default rate">
    {[0, .25, .5, .75, 1].map((tick) => <g key={tick}><line className="grid-line" x1="64" x2="624" y1={y(tick)} y2={y(tick)}/><text className="axis-label" x="55" y={y(tick)+4} textAnchor="end">{percent.format(tick)}</text><text className="axis-label" x={x(tick)} y="248" textAnchor="middle">{percent.format(tick)}</text></g>)}
    <line className="ideal-line" x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)}/>{data.length > 1 && <polyline className="line-primary" points={points}/>} {data.map((row)=><g key={row.bin}><circle className="point-primary" cx={x(row.mean_score)} cy={y(row.observed_rate)} r={Math.max(4, Math.min(10, Math.sqrt(row.n)/6))}/><title>{`${row.bin}: mean score ${percent.format(row.mean_score)}, observed ${percent.format(row.observed_rate)}, n=${number.format(row.n)}`}</title></g>)}
    <text className="axis-label" x="344" y="266" textAnchor="middle">Mean research score in calibration bin</text>
  </svg>;
}

export function ModelComparisonChart({ models, selected }: { models: { name: string; prAuc: number; auroc: number; brier: number; ece: number }[]; selected: string }) {
  const metrics = [{ key: "prAuc", label: "PR-AUC", better: "higher" }, { key: "auroc", label: "AUROC", better: "higher" }, { key: "brier", label: "Brier", better: "lower" }, { key: "ece", label: "Calibration error", better: "lower" }] as const;
  return <div className="model-comparison" role="img" aria-label="Compact model comparison for ranking and calibration metrics">{metrics.map((metric) => <section key={metric.key}>
    <header><strong>{metric.label}</strong><span>{metric.better} is better</span></header>
    {models.map((model) => <div className={`model-bar${model.name === selected ? " selected" : ""}`} key={model.name}><span>{model.name}</span><i style={{ width: `${Math.max(model[metric.key] * 100, 2)}%` }}></i><b>{model[metric.key].toFixed(4)}</b></div>)}
  </section>)}</div>;
}

export function MatrixHeatmap({ data, selectedBand, selectedDelinquency, onSelect }: { data: { delinquency: string; band: string; count: number; defaultRate: number }[]; selectedBand: string; selectedDelinquency: string; onSelect: (band: string, delinquency: string) => void }) {
  const bands = [...new Set(data.map((row) => row.band))]; const levels = [...new Set(data.map((row) => row.delinquency))];
  return <div className="matrix" role="grid" aria-label="Observed default rate and population by score band and repayment severity">
    <div className="matrix-corner"/><div className="matrix-headings">{bands.map((band)=><span key={band}>{band}</span>)}</div>
    {levels.map((level) => <div className="matrix-row" key={level}><strong>{level}</strong>{bands.map((band) => { const cell = data.find((row)=>row.band===band&&row.delinquency===level)!; const active = selectedBand === band && selectedDelinquency === level; return <button className={active ? "active" : ""} key={band} style={{ "--heat": cell.defaultRate } as React.CSSProperties} onClick={()=>onSelect(band,level)} aria-label={`${level}, ${band}: ${number.format(cell.count)} records, ${percent.format(cell.defaultRate)} observed default rate`}><b>{cell.count ? percent.format(cell.defaultRate) : "—"}</b><span>{number.format(cell.count)}</span></button>; })}</div>)}
  </div>;
}

export function DistributionChart({ data, formatLabel, onSelect }: { data: { minimum: number; maximum: number; count: number; defaultRate: number }[]; formatLabel: (value: number) => string; onSelect?: (minimum: number, maximum: number) => void }) {
  const max = Math.max(...data.map((row) => row.count), 1); const plotTop=28; const plotBottom=214; const barSpace=570/data.length;
  return <svg className="chart-svg" viewBox="0 0 680 270" role="img" aria-label="Filtered cohort distribution with observed default rate">
    {data.map((row,index)=>{const height=row.count/max*150;const x=60+index*barSpace;const action=onSelect?()=>onSelect(row.minimum,row.maximum):undefined;return <g key={row.minimum} className={action?"chart-mark clickable":"chart-mark"} role={action?"button":undefined} tabIndex={action?0:undefined} onClick={action} onKeyDown={(event)=>activate(event,action)} aria-label={`${formatLabel(row.minimum)} to ${formatLabel(row.maximum)}: ${number.format(row.count)} records, ${percent.format(row.defaultRate)} observed default rate`}><rect className="bar-population" x={x+3} y={plotBottom-height} width={Math.max(barSpace-10,3)} height={height}/><circle className="point-default" cx={x+barSpace/2-2} cy={plotBottom-row.defaultRate*(plotBottom-plotTop)} r="4"/><text className="axis-label" x={x+barSpace/2-2} y="235" textAnchor="middle">{formatLabel(row.minimum)}</text></g>})}
    <line className="baseline" x1="60" x2="630" y1={plotBottom} y2={plotBottom}/><text className="axis-label" x="345" y="260" textAnchor="middle">Bin lower bound · bars show records · dots show observed default rate</text>
  </svg>;
}

export function RepaymentHeatmap({ rows }: { rows: { label: string; values: { status: number; share: number }[] }[] }) {
  return <div className="repayment-heatmap" role="table" aria-label="Repayment status composition across six historical statement positions">
    <div className="heatmap-row heatmap-heading" role="row"><span role="columnheader">Status</span>{rows[0]?.values.map((_,index)=><b role="columnheader" key={index}>{["PAY_0","PAY_2","PAY_3","PAY_4","PAY_5","PAY_6"][index]}</b>)}</div>
    {rows.map((row)=><div className="heatmap-row" role="row" key={row.label}><strong role="rowheader">{row.label}</strong>{row.values.map((value,index)=><span role="cell" key={index} style={{"--heat":value.share} as React.CSSProperties} title={`${row.label}, ${["PAY_0","PAY_2","PAY_3","PAY_4","PAY_5","PAY_6"][index]}: ${percent.format(value.share)}`}>{percent.format(value.share)}</span>)}</div>)}
  </div>;
}

export function ProfileLines({ bills, payments }: { bills: { label: string; value: number }[]; payments: { label: string; value: number }[] }) {
  const maximum=Math.max(...bills.map(r=>r.value),...payments.map(r=>r.value),1);const x=(index:number)=>62+index*108;const y=(value:number)=>214-value/maximum*168;
  return <svg className="chart-svg" viewBox="0 0 680 260" role="img" aria-label="Average reported bill and payment amounts across six historical statement positions">
    {[0,.5,1].map(tick=><g key={tick}><line className="grid-line" x1="62" x2="602" y1={y(maximum*tick)} y2={y(maximum*tick)}/><text className="axis-label" x="55" y={y(maximum*tick)+4} textAnchor="end">{money.format(maximum*tick)}</text></g>)}
    <polyline className="line-primary" points={bills.map((row,index)=>`${x(index)},${y(row.value)}`).join(" ")}/><polyline className="line-secondary" points={payments.map((row,index)=>`${x(index)},${y(row.value)}`).join(" ")}/>
    {bills.map((row,index)=><g key={row.label}><circle className="point-primary" cx={x(index)} cy={y(row.value)} r="4"/><circle className="point-secondary" cx={x(index)} cy={y(payments[index].value)} r="4"/><text className="axis-label" x={x(index)} y="236" textAnchor="middle">{index+1}</text></g>)}
    <g className="legend" transform="translate(438 12)"><circle className="point-primary" cx="4" cy="4" r="4"/><text x="14" y="8">Bill amount</text><circle className="point-secondary" cx="93" cy="4" r="4"/><text x="103" y="8">Payment amount</text></g><text className="axis-label" x="332" y="255" textAnchor="middle">Historical statement position — not calendar time</text>
  </svg>;
}

export function SimpleTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return <div className="table-scroll"><table className="data-table compact"><thead><tr>{headers.map((header)=><th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row,index)=><tr key={index}>{row.map((cell,cellIndex)=><td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
