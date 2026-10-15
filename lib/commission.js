// Tracks the commission owed to Biomarketing (the agency that built this
// store) for every confirmed sale, organized into pay cycles — either
// "quincenal" (1–15 / 16–end of month, the common Colombian payroll split)
// or "mensual" (calendar month) — so there's always a clear "how much, and
// when do I pay it" answer, the same way a payroll/commission tool would.
//
// The commission itself is Biomarketing's markup (see lib/pricing.js):
// every product's "precio final" already includes it on top of Mariangel's
// own price, so the commission on a sale is simply what the customer paid
// minus what Mariangel's own price would have been — never a cut out of
// her own margin.

import { markupPct } from "@/lib/pricing";

const MS_DAY = 86400000;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function cyclePeriod(cycle, date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const monthName = capitalize(date.toLocaleDateString("es-CO", { month: "long" }));

  if (cycle === "quincenal") {
    if (day <= 15) {
      return {
        start: startOfDay(new Date(year, month, 1)),
        end: endOfDay(new Date(year, month, 15)),
        label: `1 – 15 de ${monthName}`,
      };
    }
    return {
      start: startOfDay(new Date(year, month, 16)),
      end: endOfDay(new Date(year, month, lastDay)),
      label: `16 – ${lastDay} de ${monthName}`,
    };
  }

  return {
    start: startOfDay(new Date(year, month, 1)),
    end: endOfDay(new Date(year, month, lastDay)),
    label: `${monthName} ${year}`,
  };
}

function inPeriod(date, period) {
  return date >= period.start && date <= period.end;
}

// How many historical cycles to show in the ledger below the current one.
const HISTORY_CYCLES = 4;

// The commission on one line item: what the customer paid minus Mariangel's
// own pre-markup price. Orders placed before `basePrice` existed don't have
// it, so fall back to reversing the current rate — an approximation, but
// only ever needed for that one-time transition.
function itemCommission(it, pct) {
  const basePrice = it.basePrice ?? it.price / (1 + pct / 100);
  return Math.round((it.price - basePrice) * it.qty);
}

function orderCommission(order, pct) {
  return (order.items || []).reduce((sum, it) => sum + itemCommission(it, pct), 0);
}

export function computeCommission(data) {
  const settings = data.settings || {};
  const pct = markupPct(settings);
  const cycle = settings.commissionCycle === "mensual" ? "mensual" : "quincenal";
  const payee = (settings.commissionPayee || "").trim() || "Juan Carlos";

  const wonOrders = (data.orders || []).filter((o) => o.status === "ganado");
  const saleDate = (o) => new Date(o.wonAt || o.createdAt);

  const now = new Date();
  const period = cyclePeriod(cycle, now);
  const currentOrders = wonOrders.filter((o) => inPeriod(saleDate(o), period));

  // Calendar-day counts, not millisecond ones — period.end carries an
  // end-of-day time (23:59:59.999) so it stays inclusive for the "is this
  // sale in this cycle" check above, but that same fractional day would
  // throw off a day count (e.g. a 1–15 cycle reading as 16 days instead
  // of 15). Normalizing both ends to midnight before diffing avoids that.
  const daysTotal = Math.round((startOfDay(period.end) - period.start) / MS_DAY) + 1;
  const daysElapsed = Math.max(
    1,
    Math.min(daysTotal, Math.floor((startOfDay(now) - period.start) / MS_DAY) + 1)
  );
  const progressPct = Math.max(0, Math.min(100, Math.round((daysElapsed / daysTotal) * 100)));
  const daysUntilPayment = Math.max(
    0,
    Math.round((startOfDay(period.end) - startOfDay(now)) / MS_DAY)
  );

  const history = [];
  let cursor = new Date(period.start.getTime() - MS_DAY);
  for (let i = 0; i < HISTORY_CYCLES; i++) {
    const p = cyclePeriod(cycle, cursor);
    const ordersInCycle = wonOrders.filter((o) => inPeriod(saleDate(o), p));
    const commission = ordersInCycle.reduce((sum, o) => sum + orderCommission(o, pct), 0);
    history.unshift({ label: p.label, sales: ordersInCycle.length, commission });
    cursor = new Date(p.start.getTime() - MS_DAY);
  }

  const totalCommission = wonOrders.reduce((sum, o) => sum + orderCommission(o, pct), 0);
  const currentCycleCommission = currentOrders.reduce(
    (sum, o) => sum + orderCommission(o, pct),
    0
  );

  return {
    payee,
    marginPct: pct,
    avgCommissionPerSale: wonOrders.length > 0 ? Math.round(totalCommission / wonOrders.length) : 0,
    cycle,
    totalSales: wonOrders.length,
    totalCommission,
    currentCycleSales: currentOrders.length,
    currentCycleCommission,
    periodLabel: period.label,
    periodStart: period.start.toISOString(),
    periodEnd: period.end.toISOString(),
    progressPct,
    daysElapsed,
    daysTotal,
    daysUntilPayment,
    nextPaymentDate: period.end.toISOString(),
    recentSales: currentOrders
      .slice()
      .sort((a, b) => saleDate(b) - saleDate(a))
      .slice(0, 8)
      .map((o) => ({
        id: o.id,
        customerName: o.customerName,
        date: saleDate(o).toISOString(),
        total: o.total,
        commission: orderCommission(o, pct),
      })),
    history,
  };
}
