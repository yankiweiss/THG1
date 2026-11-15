// client/src/Reports.jsx
import "./css/index.css";
import "./css/reports.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO, startOfDay } from "date-fns";
import Loading from "./Loading";
import { authFetch } from "./authFetch";
import { onDataChanged } from "./utils/reportRefresh";
import { quarterlyRows, toDateRows } from "./utils/CalculatingReturns";

const money = (n) =>
  n === null || n === undefined || Number.isNaN(n)
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(n);

const dateText = (d) => format(d, "MM/dd/yyyy");
// several dates -> one per line (the cell keeps the line breaks)
const dates = (list) => (list?.length ? list.map(dateText).join("\n") : "—");

// jan-1-'25
const shortDate = (d) =>
  `${format(d, "MMM").toLowerCase()}-${d.getDate()}-'${format(d, "yy")}`;
// jan-1-'25 / mar-31-'25   (one date if From and To are the same day)
const spanText = (s) =>
  s.from.getTime() === s.to.getTime()
    ? shortDate(s.from)
    : `${shortDate(s.from)} / ${shortDate(s.to)}`;
const spans = (list) => (list?.length ? list.map(spanText).join("\n") : "—");

const EVENT_OPTIONS = [
  { value: "Investment", label: "Investment" },
  { value: "Capital Call", label: "Capital Call" },
  { value: "Return to Capital", label: "Return to Capital" },
  { value: "Return", label: "Actual Return" },
];

const COMPARE_OPTIONS = [
  { value: "below", label: "Below (A.R. Below Preferred)" },
  { value: "plus", label: "Plus (A.R. Equal or Above Preferred)" },
];

// actual - preferred, compared in whole cents
const cents = (n) => Math.round(n * 100);
const compareKind = (diff) => (cents(diff) >= 0 ? "plus" : "below");
const passesCompare = (diff, selected) =>
  selected.length === 0 ||
  selected.length === COMPARE_OPTIONS.length ||
  selected.includes(compareKind(diff));

/* ---------------- small building blocks ---------------- */

// A dropdown with check boxes. Nothing selected = no filter ("All").
function MultiSelect({ options, value, onChange, placeholder = "All" }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    const esc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const toggle = (v) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  const summary =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? (options.find((o) => o.value === value[0])?.label ?? value[0])
        : `${value.length} selected`;

  return (
    <div className="rp-ms" ref={boxRef}>
      <button
        type="button"
        className={`rp-ms-btn ${value.length ? "" : "rp-ms-empty"}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="rp-ms-text">{summary}</span>
        <span className="rp-ms-caret">▾</span>
      </button>

      {open && (
        <div className="rp-ms-panel">
          <label className="rp-ms-row rp-ms-all">
            <input
              type="checkbox"
              checked={value.length === 0}
              onChange={() => onChange([])}
            />
            <span>All</span>
          </label>
          {options.map((o) => (
            <label key={o.value} className="rp-ms-row">
              <input
                type="checkbox"
                checked={value.includes(o.value)}
                onChange={() => toggle(o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, className = "", children }) {
  return (
    <div className={`rp-field ${className}`}>
      <span className="rp-label">{label}</span>
      {children}
    </div>
  );
}

// Actual vs Preferred cell: equal -> green "Equal", above green, below red
function DiffCell({ diff }) {
  if (diff === null || diff === undefined) return <td>—</td>;
  if (cents(diff) === 0) return <td className="rp-pos">Equal</td>;
  return <td className={diff > 0 ? "rp-pos" : "rp-neg"}>{money(diff)}</td>;
}

/* ---------------- page ---------------- */

function Reports() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("quarterly");

  // nothing is selected until the person selects (empty list = All)
  const [investmentSel, setInvestmentSel] = useState([]);
  const [investorSel, setInvestorSel] = useState([]);
  const [eventSel, setEventSel] = useState([]);
  const [compareSel, setCompareSel] = useState([]);

  const [dateMode, setDateMode] = useState("all"); // all | on | range
  const [onDate, setOnDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await authFetch("/investor");
      if (!res.ok) throw new Error("load failed");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setError("");
    } catch {
      setError("The report data could not be loaded.");
      setRows((prev) => prev ?? []);
    }
  }, []);

  useEffect(() => {
    load();
    return onDataChanged(load);
  }, [load]);

  const all = useMemo(
    () =>
      (rows || [])
        .filter((r) => r.closing_date)
        .map((r) => ({
          ...r,
          events: Array.isArray(r.events) ? r.events : [],
        })),
    [rows],
  );

  // Investment: one list by name, one by ID - both edit the same selection
  const investmentOptions = useMemo(() => {
    const m = new Map();
    all.forEach((r) => m.set(String(r.property_id), r.property_name));
    return [...m.entries()].sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [all]);

  const investorOptions = useMemo(() => {
    const m = new Map();
    all
      .filter(
        (r) =>
          investmentSel.length === 0 ||
          investmentSel.includes(String(r.property_id)),
      )
      .forEach((r) => m.set(String(r.investor_id), r.investor_name));
    return [...m.entries()].sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [all, investmentSel]);

  const changeInvestments = (next) => {
    setInvestmentSel(next);
    // drop investors that are not part of the chosen investments
    setInvestorSel((prev) =>
      prev.filter((id) =>
        all.some(
          (r) =>
            String(r.investor_id) === id &&
            (next.length === 0 || next.includes(String(r.property_id))),
        ),
      ),
    );
  };

  // the Actual vs Preferred filter only exists while Actual Return is shown
  const showActual = eventSel.length === 0 || eventSel.includes("Return");

  const changeEvents = (next) => {
    setEventSel(next);
    if (next.length > 0 && !next.includes("Return")) setCompareSel([]);
  };

  const compare = showActual ? compareSel : [];

  const filtered = useMemo(
    () =>
      all.filter(
        (r) =>
          (investmentSel.length === 0 ||
            investmentSel.includes(String(r.property_id))) &&
          (investorSel.length === 0 ||
            investorSel.includes(String(r.investor_id))),
      ),
    [all, investmentSel, investorSel],
  );

  const range = useMemo(() => {
    const d = (v) => (v ? startOfDay(parseISO(v)) : null);
    if (dateMode === "on") return { from: d(onDate), to: d(onDate) };
    if (dateMode === "range") return { from: d(fromDate), to: d(toDate) };
    return { from: null, to: null };
  }, [dateMode, onDate, fromDate, toDate]);

  const resetFilters = () => {
    setInvestmentSel([]);
    setInvestorSel([]);
    setEventSel([]);
    setCompareSel([]);
    setDateMode("all");
    setOnDate("");
    setFromDate("");
    setToDate("");
  };

  if (rows === null) return <Loading />;

  const idOptions = (list) =>
    list.map(([id]) => ({ value: id, label: `#${id}` }));
  const nameOptions = (list) =>
    list.map(([id, name]) => ({ value: id, label: name }));

  return (
    <div className="right-side">
      <div className="rp-page">
        <h2 className="rp-title">Reports</h2>

        <div className="rp-tabs">
          <button
            type="button"
            className={`rp-tab ${tab === "quarterly" ? "rp-tab-on" : ""}`}
            onClick={() => setTab("quarterly")}
          >
            Quarterly Report
          </button>
          <button
            type="button"
            className={`rp-tab ${tab === "todate" ? "rp-tab-on" : ""}`}
            onClick={() => setTab("todate")}
          >
            To Date Report
          </button>
        </div>

        <div className="rp-filter">
          <div className="rp-filter-head">
            <span className="fw600">FILTER</span>
            <button type="button" className="rp-link" onClick={resetFilters}>
              Reset
            </button>
          </div>

          {/* LINE A */}
          <div className="rp-line">
            <Field label="Investment" className="rp-f-main">
              <MultiSelect
                options={nameOptions(investmentOptions)}
                value={investmentSel}
                onChange={changeInvestments}
              />
            </Field>

            <Field label="By ID #" className="rp-f-small">
              <MultiSelect
                options={idOptions(investmentOptions)}
                value={investmentSel}
                onChange={changeInvestments}
              />
            </Field>

            <Field label="Event" className="rp-f-main">
              <MultiSelect
                options={EVENT_OPTIONS}
                value={eventSel}
                onChange={changeEvents}
              />
            </Field>

            <Field label="Date" className="rp-f-date">
              <div className="rp-date">
                <select
                  value={dateMode}
                  onChange={(e) => setDateMode(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="on">On Date</option>
                  <option value="range">From / To</option>
                </select>

                {dateMode === "on" && (
                  <input
                    type="date"
                    aria-label="On date"
                    value={onDate}
                    onChange={(e) => setOnDate(e.target.value)}
                  />
                )}

                {dateMode === "range" && (
                  <>
                    <label className="rp-date-part">
                      From
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </label>
                    <label className="rp-date-part">
                      To
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </label>
                  </>
                )}
              </div>
            </Field>
          </div>

          {/* LINE B */}
          <div className="rp-line">
            <Field label="Investor" className="rp-f-main">
              <MultiSelect
                options={nameOptions(investorOptions)}
                value={investorSel}
                onChange={setInvestorSel}
              />
            </Field>

            <Field label="By ID #" className="rp-f-small">
              <MultiSelect
                options={idOptions(investorOptions)}
                value={investorSel}
                onChange={setInvestorSel}
              />
            </Field>

            {showActual && (
              <Field label="Actual vs Preferred" className="rp-f-wide">
                <MultiSelect
                  options={COMPARE_OPTIONS}
                  value={compareSel}
                  onChange={setCompareSel}
                />
              </Field>
            )}
          </div>
        </div>

        {error && <p className="pd-error">{error}</p>}

        {tab === "quarterly" ? (
          <QuarterlyReport
            data={filtered}
            range={range}
            eventSel={eventSel}
            compare={compare}
          />
        ) : (
          <ToDateReport
            data={filtered}
            range={range}
            eventSel={eventSel}
            compare={compare}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- Quarterly ---------------- */

function QuarterlyReport({ data, range, eventSel, compare }) {
  const none = eventSel.length === 0;
  const show = {
    ret: none || eventSel.includes("Return"),
    rtc: none || eventSel.includes("Return to Capital"),
    cc:
      none ||
      eventSel.includes("Capital Call") ||
      eventSel.includes("Investment"),
  };
  const colsPerQuarter =
    (show.ret ? 4 : 0) + (show.rtc ? 2 : 0) + (show.cc ? 2 : 0) + 1;

  const groups = useMemo(() => {
    const byProperty = new Map();
    data.forEach((inv) => {
      const key = inv.property_id;
      if (!byProperty.has(key)) byProperty.set(key, { inv, list: [] });
      byProperty.get(key).list.push(inv);
    });
    return [...byProperty.values()];
  }, [data]);

  const thisYear = new Date().getFullYear();

  if (!groups.length)
    return <p className="rp-empty">No investments match the filter.</p>;

  return (
    <div>
      {groups.map(({ inv: first, list }) => (
        <div className="rp-card" key={first.property_id}>
          <h3 className="rp-card-title">
            {first.property_name}
            <span className="rp-muted">
              {" "}
              Investment ID #{first.property_id} · Investment Date{" "}
              {dateText(parseISO(first.closing_date))}
            </span>
          </h3>

          {list.map((inv) => {
            const startYear = parseISO(inv.closing_date).getFullYear();
            const years = [];
            for (let y = startYear; y <= thisYear; y++) {
              if (range.from && y < range.from.getFullYear()) continue;
              if (range.to && y > range.to.getFullYear()) continue;
              years.push(y);
            }
            const rows = quarterlyRows(inv, years)
              .map((r) => ({
                ...r,
                quarters: r.quarters.map((q) => {
                  if (!q) return q;
                  const qs = new Date(r.year, (q.q - 1) * 3, 1);
                  const qe = new Date(r.year, q.q * 3, 0);
                  if (range.from && qe < range.from) return null;
                  if (range.to && qs > range.to) return null;
                  if (show.ret && !passesCompare(q.diff, compare)) return null;
                  return q;
                }),
              }))
              .filter((r) => r.quarters.some(Boolean));

            if (!rows.length) return null;

            return (
              <div
                className="rp-investor"
                key={inv.investment_id ?? `${inv.property_id}-${inv.investor_id}`}
              >
                <div className="rp-investor-head">
                  <strong>{inv.investor_name}</strong>
                  <span className="rp-muted">
                    Investor ID #{inv.investor_id} · Initial investment{" "}
                    {money(Number(inv.invested_amount))} · Preferred{" "}
                    {Number(inv.perf_return)}%
                  </span>
                </div>

                <div className="rp-scroll">
                  <table className="rp-table">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="rp-sticky">
                          Year
                        </th>
                        {[1, 2, 3, 4].map((q) => (
                          <th key={q} colSpan={colsPerQuarter} className="rp-q">
                            Q{q}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {[1, 2, 3, 4].map((q) => (
                          <QuarterHeads key={q} show={show} />
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.year}>
                          <td className="rp-sticky fw600">{r.year}</td>
                          {r.quarters.map((q, i) => (
                            <QuarterCells
                              key={i}
                              q={q}
                              show={show}
                              span={colsPerQuarter}
                            />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function QuarterHeads({ show }) {
  return (
    <>
      {show.ret && (
        <>
          <th>Preferred Return</th>
          <th>Actual Return</th>
          <th>Actual Return Date</th>
          <th>Actual vs Preferred</th>
        </>
      )}
      {show.rtc && (
        <>
          <th>R.T.C. Amount</th>
          <th>R.T.C. Date</th>
        </>
      )}
      {show.cc && (
        <>
          <th>C.C. Amount</th>
          <th>C.C. Date</th>
        </>
      )}
      <th>Investment Amount to Date</th>
    </>
  );
}

function QuarterCells({ q, show, span }) {
  if (!q) {
    return (
      <td colSpan={span} className="rp-na">
        —
      </td>
    );
  }
  return (
    <>
      {show.ret && (
        <>
          <td>{money(q.preferred)}</td>
          <td>{money(q.actual)}</td>
          <td className="rp-dates">{spans(q.actualDates)}</td>
          <DiffCell diff={q.diff} />
        </>
      )}
      {show.rtc && (
        <>
          <td>{q.rtcAmount ? money(q.rtcAmount) : "—"}</td>
          <td className="rp-dates">{dates(q.rtcDates)}</td>
        </>
      )}
      {show.cc && (
        <>
          <td>{q.ccAmount ? money(q.ccAmount) : "—"}</td>
          <td className="rp-dates">{dates(q.ccDates)}</td>
        </>
      )}
      <td className="fw600">{money(q.balance)}</td>
    </>
  );
}

/* ---------------- To Date ---------------- */

function ToDateReport({ data, range, eventSel, compare }) {
  const rows = useMemo(() => {
    let list = toDateRows(data);

    if (eventSel.length > 0) {
      list = list.filter((r) => eventSel.includes(r.eventType));
    }
    if (range.from) list = list.filter((r) => r.date >= range.from);
    if (range.to) list = list.filter((r) => r.date <= range.to);

    // Actual vs Preferred only judges Actual Return rows. With no Event
    // chosen, a chosen comparison shows only the matching Actual Returns.
    if (compare.length > 0) {
      list = list.filter((r) =>
        r.eventType === "Return"
          ? passesCompare(r.actualVsPreferred, compare)
          : eventSel.length > 0,
      );
    }
    return list;
  }, [data, range, eventSel, compare]);

  if (!rows.length)
    return <p className="rp-empty">No events match the filter.</p>;

  const label = (t) => (t === "Return" ? "Actual Return" : t);

  return (
    <div className="rp-card">
      <h3 className="rp-card-title">
        Table To Date <span className="rp-muted">{rows.length} events</span>
      </h3>
      <div className="rp-scroll">
        <table className="rp-table">
          <thead>
            <tr>
              <th>Event Date</th>
              <th>Investment / ID #</th>
              <th>Investment Date</th>
              <th>Event</th>
              <th>Investor</th>
              <th>Investor ID #</th>
              <th>Initial Investment</th>
              <th>Preferred Amount to Date</th>
              <th>Amount</th>
              <th>If Actual Return: Actual vs Preferred</th>
              <th>Investment Amount to Date</th>
              <th>If R.T.C./C.C.: Preferred Going Forward (per year)</th>
              <th>If R.T.C./C.C.: Investment Amount Going Forward</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const cap =
                r.eventType === "Return to Capital" ||
                r.eventType === "Capital Call" ||
                r.eventType === "Investment";
              return (
                <tr key={r.key}>
                  <td>{r.span ? spanText(r.span) : dateText(r.date)}</td>
                  <td>
                    {r.propertyName} · #{r.propertyId}
                  </td>
                  <td>{dateText(r.closingDate)}</td>
                  <td>{label(r.eventType)}</td>
                  <td>{r.investorName}</td>
                  <td>{r.investorId}</td>
                  <td>{money(r.initial)}</td>
                  <td>{money(r.preferredToDate)}</td>
                  <td className="fw600">{money(r.amount)}</td>
                  <DiffCell diff={r.actualVsPreferred} />
                  <td>{money(r.balanceToDate)}</td>
                  <td>{cap ? money(r.preferredPerYear) : "—"}</td>
                  <td>{cap ? money(r.balanceToDate) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;
