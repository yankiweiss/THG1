// client/src/utils/CalculatingReturns.js
//
// ONE daily engine used by the investor chart, the top boxes and the Reports.
//  - Preferred amount per day = balance x (rate / 100) / (365 or 366)
//    (366 when that calendar year is a leap year)
//  - Investment / Capital Call raise the balance on their own date.
//  - Return to Capital lowers the balance starting the NEXT day
//    (the payment day still earns on the old balance).
//  - "Return" (actual payment) is spread evenly over its From - To days.
 
import {
  addDays,
  eachDayOfInterval,
  format,
  getQuarter,
  parseISO,
  startOfDay,
  startOfQuarter,
} from "date-fns";
 
export const daysInYear = (year) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
 
const dayKey = (d) => format(d, "yyyy-MM-dd");
const toDay = (v) => startOfDay(typeof v === "string" ? parseISO(v) : v);
const num = (v) => Number(v) || 0;
 
const isAdd = (t) => t === "Investment" || t === "Capital Call";
 
// Date a balance change takes effect (RTC = next day).
const effectiveDay = (ev) => {
  const d = toDay(ev.event_date);
  return ev.event_type === "Return to Capital" ? addDays(d, 1) : d;
};
 
const balanceChanges = (events) =>
  (events || [])
    .filter(
      (e) =>
        e.event_date &&
        (isAdd(e.event_type) || e.event_type === "Return to Capital"),
    )
    .map((e) => ({
      day: effectiveDay(e),
      delta: isAdd(e.event_type) ? num(e.event_amount) : -num(e.event_amount),
    }));
 
// Actual payments spread evenly over From - To  ->  { "yyyy-MM-dd": amount }
const actualByDay = (events) => {
  const map = {};
  (events || [])
    .filter((e) => e.event_type === "Return")
    .forEach((e) => {
      const from = e.from || e.event_date;
      const to = e.to || e.event_date || e.from;
      if (!from || !to) return;
      const days = eachDayOfInterval({ start: toDay(from), end: toDay(to) });
      if (!days.length) return;
      const each = num(e.event_amount) / days.length;
      days.forEach((d) => {
        map[dayKey(d)] = (map[dayKey(d)] || 0) + each;
      });
    });
  return map;
};
 
/**
 * Day by day: [{ date, balance, preferred, actual }] from the closing date
 * (or `from`) up to `to` (default today).
 */
export const dailySeries = ({
  initialInvestment,
  events,
  perfReturn,
  closingDate,
  from,
  to,
}) => {
  const closing = toDay(closingDate);
  const end = startOfDay(to || new Date());
  const start = from && toDay(from) > closing ? toDay(from) : closing;
  if (end < start) return [];
 
  const changes = balanceChanges(events);
  const actual = actualByDay(events);
 
  const rate = num(perfReturn) / 100;
 
  // Changes dated before closing take effect on the closing day
  const byDay = {};
  changes.forEach((c) => {
    const k = dayKey(c.day < closing ? closing : c.day);
    byDay[k] = (byDay[k] || 0) + c.delta;
  });
 
  // Balance at the start of `start` = initial + everything effective before it
  let balance = num(initialInvestment);
  Object.keys(byDay).forEach((k) => {
    if (k < dayKey(start)) balance += byDay[k];
  });
 
  const out = [];
  for (const d of eachDayOfInterval({ start, end })) {
    const k = dayKey(d);
    if (byDay[k] && k >= dayKey(start)) balance += byDay[k];
    out.push({
      date: d,
      balance,
      preferred: (balance * rate) / daysInYear(d.getFullYear()),
      actual: actual[k] || 0,
    });
  }
  return out;
};
 
/* ---------- chart (investor page) ---------- */
 
export const expectedAndActualQuarterReturns = (
  ddYear,
  initialInvestment,
  events,
  perfReturn,
  closingDate,
) => {
  const rows = dailySeries({
    initialInvestment,
    events,
    perfReturn,
    closingDate,
    from: new Date(ddYear, 0, 1),
    to: new Date(Math.min(new Date(ddYear, 11, 31), startOfDay(new Date()))),
  });
 
  const quarters = new Map();
  rows.forEach((r) => {
    const q = startOfQuarter(r.date);
    const k = q.getTime();
    if (!quarters.has(k)) quarters.set(k, { quarter: q, expected: 0, actual: 0 });
    const b = quarters.get(k);
    b.expected += r.preferred;
    b.actual += r.actual;
  });
 
  const chartData = [...quarters.values()];
  return {
    actualReturnData: chartData.map((d) => ({
      x: d.quarter,
      y: Number(d.actual.toFixed(2)),
    })),
    expectedReturnData: chartData.map((d) => ({
      x: d.quarter,
      y: Number(d.expected.toFixed(2)),
    })),
  };
};
 
/* ---------- top boxes (investor page) ---------- */
 
// Balance as of today (a Return to Capital dated today counts from tomorrow)
export const investmentToDate = (initialInvestment, events, asOf) => {
  const end = startOfDay(asOf || new Date());
  let total = num(initialInvestment);
  balanceChanges(events).forEach((c) => {
    if (c.day <= end) total += c.delta;
  });
  return total;
};
 
export const investmentActualReturn = (events) =>
  (events || [])
    .filter((e) => e.event_type === "Return")
    .reduce((acc, e) => acc + num(e.event_amount), 0);
 
export const expectedReturnAmount = (
  closingDate,
  initialInvestment,
  events,
  perfReturn,
) =>
  dailySeries({ initialInvestment, events, perfReturn, closingDate }).reduce(
    (acc, r) => acc + r.preferred,
    0,
  );
 
/* ---------- Reports ---------- */
 
const ev = (events, type) =>
  (events || []).filter((e) => e.event_type === type && e.event_date);
 
/**
 * Quarterly report rows for ONE investment (one investor in one property).
 * Returns [{ year, quarters: [ {q, preferred, actual, actualDates, diff,
 * rtcAmount, rtcDates, ccAmount, ccDates, balance} x4 ] }]
 * Quarters that have not started yet (or are before closing) are null.
 */
export const quarterlyRows = (inv, years) => {
  const today = startOfDay(new Date());
  const closing = toDay(inv.closing_date);
  const series = dailySeries({
    initialInvestment: inv.invested_amount,
    events: inv.events,
    perfReturn: inv.perf_return,
    closingDate: inv.closing_date,
  });
 
  return years.map((year) => {
    const quarters = [1, 2, 3, 4].map((q) => {
      const qStart = new Date(year, (q - 1) * 3, 1);
      const qEnd = new Date(year, q * 3, 0);
      if (qEnd < closing || qStart > today) return null;
      const inQ = (d) => d >= qStart && d <= qEnd;
      const days = series.filter((r) => inQ(r.date));
      const preferred = days.reduce((a, r) => a + r.preferred, 0);
      const actual = days.reduce((a, r) => a + r.actual, 0);
      const pick = (type) => ev(inv.events, type).filter((e) => inQ(toDay(e.event_date)));
      const rets = pick("Return");
      const rtc = pick("Return to Capital");
      const cc = [...pick("Capital Call"), ...pick("Investment")];
      const sum = (l) => l.reduce((a, e) => a + num(e.event_amount), 0);
      const fmt = (l) => l.map((e) => toDay(e.event_date));
      return {
        q,
        preferred,
        actual,
        actualDates: fmt(rets),
        diff: actual - preferred,
        rtcAmount: sum(rtc),
        rtcDates: fmt(rtc),
        ccAmount: sum(cc),
        ccDates: fmt(cc),
        balance: days.length ? days[days.length - 1].balance : null,
      };
    });
    return { year, quarters };
  });
};
 
/**
 * To Date report: one row per event per investor, newest first.
 * Columns follow the sheet: event date, investment, investment date, event,
 * investor, initial amount, preferred to date (up to the event date),
 * amount, actual-vs-preferred (Return rows), investment amount to date
 * (after the event), preferred per year going forward, balance going forward.
 */
export const toDateRows = (investments) => {
  const rows = [];
  investments.forEach((inv) => {
    const rate = num(inv.perf_return);
    (inv.events || []).forEach((e) => {
      if (!e.event_date) return;
      const day = toDay(e.event_date);
      const isRet = e.event_type === "Return";
      const asOf = day > startOfDay(new Date()) ? startOfDay(new Date()) : day;
      const prefToDate = dailySeries({
        initialInvestment: inv.invested_amount,
        events: inv.events,
        perfReturn: inv.perf_return,
        closingDate: inv.closing_date,
        to: asOf,
      }).reduce((a, r) => a + r.preferred, 0);
 
      // After the event: RTC counts from the next day, so look at day+1
      const after = e.event_type === "Return to Capital" ? addDays(day, 1) : day;
      const balanceAfter = investmentToDate(inv.invested_amount, inv.events, after);
 
      let actualToDate = null;
      if (isRet) {
        actualToDate = (inv.events || [])
          .filter(
            (x) =>
              x.event_type === "Return" &&
              x.event_date &&
              toDay(x.event_date) <= day,
          )
          .reduce((a, x) => a + num(x.event_amount), 0);
      }
 
      rows.push({
        key: `${inv.investment_id}-${e.id ?? e.event_date}-${e.event_type}`,
        date: day,
        propertyName: inv.property_name,
        propertyId: inv.property_id,
        closingDate: toDay(inv.closing_date),
        eventType: e.event_type,
        investorName: inv.investor_name,
        investorId: inv.investor_id,
        investmentId: inv.investment_id,
        initial: num(inv.invested_amount),
        preferredToDate: prefToDate,
        amount: num(e.event_amount),
        actualVsPreferred: isRet ? actualToDate - prefToDate : null,
        balanceToDate: balanceAfter,
        preferredPerYear: (balanceAfter * rate) / 100,
      });
    });
  });
  return rows.sort((a, b) => b.date - a.date);
};
 
export const quarterLabel = (d) => `Q${getQuarter(d)} ${d.getFullYear()}`;
 
// kept so older imports do not break
export const AllDealsReturns = (allData) => allData;