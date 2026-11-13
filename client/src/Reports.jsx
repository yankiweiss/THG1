// client/src/Reports.jsx
import "./css/index.css";
import "./css/reports.css";
import { useCallback, useEffect, useMemo, useState } from "react";
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
const dates = (list) => (list?.length ? list.map(dateText).join(", ") : "—");

const EVENT_FILTERS = [
  { value: "all", label: "All" },
  { value: "Investment", label: "Investment" },
  { value: "Capital Call", label: "Capital Call" },
  { value: "Return to Capital", label: "Return to Capital" },
  { value: "Return", label: "Actual Return" },
];

const COMPARE_FILTERS = [
  { value: "all", label: "All" },
  { value: "preferred", label: "Preferred (actual below or equal)" },
  { value: "plus", label: "Plus (actual above preferred)" },
];

function Reports() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("quarterly");

  const [investmentF, setInvestmentF] = useState("all");
  const [investorF, setInvestorF] = useState("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [eventF, setEventF] = useState("all");
  const [compareF, setCompareF] = useState("all");

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

  const investmentOptions = useMemo(() => {
    const m = new Map();
    all.forEach((r) => m.set(String(r.property_id), r.property_name));
    return [...m.entries()];
  }, [all]);

  const investorOptions = useMemo(() => {
    const m = new Map();
    all
      .filter((r) => investmentF === "all" || String(r.property_id) === investmentF)
      .forEach((r) => m.set(String(r.investor_id), r.investor_name));
    return [...m.entries()];
  }, [all, investmentF]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((r) => {
      if (investmentF !== "all" && String(r.property_id) !== investmentF)
        return false;
      if (investorF !== "all" && String(r.investor_id) !== investorF)
        return false;
      if (q) {
        const hay = `${r.property_name} ${r.investor_name} ${r.property_id} ${r.investor_id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [all, investmentF, investorF, search]);

  const range = useMemo(
    () => ({
      from: fromDate ? startOfDay(parseISO(fromDate)) : null,
      to: toDate ? startOfDay(parseISO(toDate)) : null,
    }),
    [fromDate, toDate],
  );

  const clearFilters = () => {
    setInvestmentF("all");
    setInvestorF("all");
    setSearch("");
    setFromDate("");
    setToDate("");
    setEventF("all");
    setCompareF("all");
  };

  if (rows === null) return <Loading />;

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
            <button type="button" className="rp-link" onClick={clearFilters}>
              Reset
            </button>
          </div>
          <div className="rp-filter-grid">
            <label>
              Investment
              <select
                value={investmentF}
                onChange={(e) => {
                  setInvestmentF(e.target.value);
                  setInvestorF("all");
                }}
              >
                <option value="all">All</option>
                {investmentOptions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name} (ID #{id})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Investor
              <select
                value={investorF}
                onChange={(e) => setInvestorF(e.target.value)}
              >
                <option value="all">All</option>
                {investorOptions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name} (ID #{id})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Search name / ID #
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. North or 110"
              />
            </label>

            <label>
              From
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </label>

            <label>
              To
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </label>

            <label>
              Event
              <select value={eventF} onChange={(e) => setEventF(e.target.value)}>
                {EVENT_FILTERS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Actual vs Preferred
              <select
                value={compareF}
                onChange={(e) => setCompareF(e.target.value)}
              >
                {COMPARE_FILTERS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error && <p className="pd-error">{error}</p>}

        {tab === "quarterly" ? (
          <QuarterlyReport
            data={filtered}
            range={range}
            eventF={eventF}
            compareF={compareF}
          />
        ) : (
          <ToDateReport
            data={filtered}
            range={range}
            eventF={eventF}
            compareF={compareF}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- Quarterly ---------------- */

function QuarterlyReport({ data, range, eventF, compareF }) {
  const show = {
    ret: eventF === "all" || eventF === "Return",
    rtc: eventF === "all" || eventF === "Return to Capital",
    cc:
      eventF === "all" || eventF === "Capital Call" || eventF === "Investment",
  };
  const colsPerQuarter =
    (show.ret ? 4 : 0) + (show.rtc ? 2 : 0) + (show.cc ? 2 : 0) + 1;

  const groups = useMemo(() => {
    const byProperty = new Map();
    data.forEach((inv) => {
      const key = inv.property_id;
      if (!byProperty.has(key)) byProperty.set(key, { inv: inv, list: [] });
      byProperty.get(key).list.push(inv);
    });
    return [...byProperty.values()];
  }, [data]);

  const thisYear = new Date().getFullYear();

  if (!groups.length) return <p className="rp-empty">No investments match the filter.</p>;

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
                  if (compareF === "preferred" && !(q.diff <= 0)) return null;
                  if (compareF === "plus" && !(q.diff > 0)) return null;
                  return q;
                }),
              }))
              .filter((r) => r.quarters.some(Boolean));

            if (!rows.length) return null;

            return (
              <div className="rp-investor" key={inv.investment_id ?? inv.investor_id}>
                <div className="rp-investor-head">
                  <strong>{inv.investor_name}</strong>
                  <span className="rp-muted">
                    ID #{inv.investor_id} · Initial investment{" "}
                    {money(Number(inv.invested_amount))} · Preferred{" "}
                    {Number(inv.perf_return)}%
                  </span>
                </div>

                <div className="rp-scroll">
                  <table className="rp-table">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="rp-sticky">Year</th>
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
                            <QuarterCells key={i} q={q} show={show} span={colsPerQuarter} />
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
    return <td colSpan={span} className="rp-na">—</td>;
  }
  return (
    <>
      {show.ret && (
        <>
          <td>{money(q.preferred)}</td>
          <td>{money(q.actual)}</td>
          <td>{dates(q.actualDates)}</td>
          <td className={q.diff >= 0 ? "rp-pos" : "rp-neg"}>{money(q.diff)}</td>
        </>
      )}
      {show.rtc && (
        <>
          <td>{q.rtcAmount ? money(q.rtcAmount) : "—"}</td>
          <td>{dates(q.rtcDates)}</td>
        </>
      )}
      {show.cc && (
        <>
          <td>{q.ccAmount ? money(q.ccAmount) : "—"}</td>
          <td>{dates(q.ccDates)}</td>
        </>
      )}
      <td className="fw600">{money(q.balance)}</td>
    </>
  );
}

/* ---------------- To Date ---------------- */

function ToDateReport({ data, range, eventF, compareF }) {
  const rows = useMemo(() => {
    let list = toDateRows(data);
    if (eventF !== "all") list = list.filter((r) => r.eventType === eventF);
    if (range.from) list = list.filter((r) => r.date >= range.from);
    if (range.to) list = list.filter((r) => r.date <= range.to);
    if (compareF !== "all") {
      list = list.filter(
        (r) =>
          r.actualVsPreferred !== null &&
          (compareF === "plus"
            ? r.actualVsPreferred > 0
            : r.actualVsPreferred <= 0),
      );
    }
    return list;
  }, [data, range, eventF, compareF]);

  if (!rows.length) return <p className="rp-empty">No events match the filter.</p>;

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
                  <td>{dateText(r.date)}</td>
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
                  <td
                    className={
                      r.actualVsPreferred === null
                        ? ""
                        : r.actualVsPreferred >= 0
                          ? "rp-pos"
                          : "rp-neg"
                    }
                  >
                    {r.actualVsPreferred === null ? "—" : money(r.actualVsPreferred)}
                  </td>
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
