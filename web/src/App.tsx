import { useEffect, useMemo, useState } from "react";
import { Badge, Button, FluentProvider, Input, Select, Spinner, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, webDarkTheme, webLightTheme } from "@fluentui/react-components";
import { ArrowLeftRegular, ArrowRightRegular, SearchRegular } from "@fluentui/react-icons";
import { getPublicDataset } from "./api";
import type { CreditRecord, PublicDataset } from "./types";

const PAGE_SIZE = 25;
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("en-US");

function App() {
  const [dataset, setDataset] = useState<PublicDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("all");
  const [sex, setSex] = useState("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<CreditRecord | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getPublicDataset(controller.signal).then(setDataset).catch((reason: Error) => {
      if (reason.name !== "AbortError") setError(reason.message);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;
    const update = () => setDark(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const records = dataset?.records ?? [];
  const filtered = useMemo(() => records.filter((record) => {
    const matchesQuery = !query || String(record.ID).includes(query.trim());
    const matchesOutcome = outcome === "all" || String(record["default payment next month"]) === outcome;
    return matchesQuery && matchesOutcome && (sex === "all" || String(record.SEX) === sex);
  }), [records, outcome, query, sex]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const defaults = records.filter((record) => record["default payment next month"] === 1).length;
  const late = records.filter((record) => record.PAY_0 >= 2).length;
  const medianLimit = useMemo(() => {
    const limits = records.map((record) => record.LIMIT_BAL).sort((left, right) => left - right);
    return limits.length ? limits[Math.floor(limits.length / 2)] : 0;
  }, [records]);

  const resetPage = () => { setPage(0); setSelected(null); };

  return <FluentProvider theme={dark ? webDarkTheme : webLightTheme} className={`app-shell${dark ? " theme-dark" : ""}`}>
    <main className="workspace">
      <header className="workspace-header">
        <div><p className="eyebrow">UCI Default of Credit Card Clients</p><h1>Credit portfolio analyst workspace</h1><p className="subhead">Search all licensed source records. Observed outcomes are historical benchmark labels, not lending decisions.</p></div>
        <div className="source-note"><Badge appearance="filled" color="informative">Full source records</Badge><span>CC BY 4.0</span><span>30,000 rows</span></div>
      </header>

      {error && <State title="Source artifact unavailable" detail={error} />}
      {!error && !dataset && <div className="loading"><Spinner label="Loading full source records" /><p>Preparing the UCI analyst workspace.</p></div>}
      {dataset && <>
        <section className="metrics" aria-label="Portfolio summary">
          <Metric label="Records" value={number.format(records.length)} detail="Full licensed UCI source" />
          <Metric label="Observed defaults" value={`${((defaults / records.length) * 100).toFixed(1)}%`} detail={`${number.format(defaults)} historical labels`} />
          <Metric label="Median credit limit" value={currency.format(medianLimit)} detail="Reported account limit" />
          <Metric label="Current repayment delay" value={`${((late / records.length) * 100).toFixed(1)}%`} detail="PAY_0 status of 2 or higher" />
        </section>

        <section className="analyst-grid">
          <div className="record-panel">
            <div className="panel-heading"><div><h2>Record explorer</h2><p>Filter by source ID, observed outcome, or recorded sex value.</p></div><span>{number.format(filtered.length)} matching</span></div>
            <div className="filters">
              <label>Source ID<Input value={query} onChange={(_, data) => { setQuery(data.value); resetPage(); }} contentBefore={<SearchRegular />} placeholder="Search ID" /></label>
              <label>Observed outcome<Select value={outcome} onChange={(_, data) => { setOutcome(data.value); resetPage(); }}><option value="all">All outcomes</option><option value="0">No observed default</option><option value="1">Observed default</option></Select></label>
              <label>Recorded sex<Select value={sex} onChange={(_, data) => { setSex(data.value); resetPage(); }}><option value="all">All values</option><option value="1">Value 1</option><option value="2">Value 2</option></Select></label>
            </div>
            <div className="table-wrap"><Table size="small" aria-label="UCI credit source records"><TableHeader><TableRow><TableHeaderCell>Source ID</TableHeaderCell><TableHeaderCell>Limit</TableHeaderCell><TableHeaderCell>Age</TableHeaderCell><TableHeaderCell>PAY_0</TableHeaderCell><TableHeaderCell>Latest bill</TableHeaderCell><TableHeaderCell>Observed outcome</TableHeaderCell><TableHeaderCell>Inspect</TableHeaderCell></TableRow></TableHeader><TableBody>{visible.map((record) => <TableRow key={record.ID}><TableCell>{number.format(record.ID)}</TableCell><TableCell>{currency.format(record.LIMIT_BAL)}</TableCell><TableCell>{record.AGE}</TableCell><TableCell>{record.PAY_0}</TableCell><TableCell>{currency.format(record.BILL_AMT1)}</TableCell><TableCell><Badge size="medium" color={record["default payment next month"] ? "danger" : "success"}>{record["default payment next month"] ? "Observed default" : "No observed default"}</Badge></TableCell><TableCell><Button appearance="subtle" onClick={() => setSelected(record)}>Open</Button></TableCell></TableRow>)}</TableBody></Table></div>
            <div className="pager"><span>Page {currentPage + 1} of {pageCount}</span><div><Button icon={<ArrowLeftRegular />} disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</Button><Button icon={<ArrowRightRegular />} iconPosition="after" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Next</Button></div></div>
          </div>
          <aside className="inspector" aria-live="polite">{selected ? <RecordInspector record={selected} onClose={() => setSelected(null)} /> : <div><p className="eyebrow">Record inspection</p><h2>Select a source record</h2><p>Open a row to review every UCI field, including repayment history, billed amounts, payments, demographics, and the observed target.</p></div>}</aside>
        </section>
        <footer><p>{dataset.source.citation}</p><p>Source archive SHA-256: <code>{dataset.source.archive_sha256}</code></p></footer>
      </>}
    </main>
  </FluentProvider>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="metric"><span>{label}</span><strong>{value}</strong><p>{detail}</p></article>; }
function State({ title, detail }: { title: string; detail: string }) { return <section className="state"><h2>{title}</h2><p>{detail}</p></section>; }
function RecordInspector({ record, onClose }: { record: CreditRecord; onClose: () => void }) { return <><div className="inspector-title"><div><p className="eyebrow">Source record {record.ID}</p><h2>Full field inspection</h2></div><Button appearance="subtle" onClick={onClose}>Close</Button></div><dl>{Object.entries(record).map(([field, value]) => <div key={field}><dt>{field}</dt><dd>{typeof value === "number" && (field.includes("AMT") || field === "LIMIT_BAL") ? currency.format(value) : String(value)}</dd></div>)}</dl></> }

export default App;
