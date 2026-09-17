// Sector percentiles: the company placed inside the real distribution of its CAEN division.
import { t, isNum, applyStaticTranslations, escapeHtml as esc, PALETTE, fmtRatio, fmtPct } from "./common.js";
import {
  $, ro, nf, renderAdvShell, wireCompanyEntry, loadGzJson, divName, bandName, bandOf, divOf,
  percentileBar, histChart, CAEN_DIV,
} from "./adv.js";

const RATIO_LABELS = {
  ro: {
    currentRatio: "Lichiditate curentă", quickRatio: "Lichiditate rapidă", cashRatio: "Lichiditate imediată",
    equityRatio: "Autonomie financiară", debtToEquity: "Datorii / capitaluri", netMargin: "Marjă netă",
    roa: "ROA", assetTurnover: "Rotația activelor", daysReceivables: "Zile de încasare a creanțelor",
    daysInventory: "Zile de stoc",
  },
  en: {
    currentRatio: "Current ratio", quickRatio: "Quick ratio", cashRatio: "Cash ratio",
    equityRatio: "Equity ratio", debtToEquity: "Debt / equity", netMargin: "Net margin",
    roa: "ROA", assetTurnover: "Asset turnover", daysReceivables: "Days receivables",
    daysInventory: "Days inventory",
  },
};
const PCT_RATIOS = ["equityRatio", "netMargin", "roa"];
const DAY_RATIOS = ["daysReceivables", "daysInventory"];
const LOWER_BETTER = ["debtToEquity", "daysReceivables", "daysInventory"];
const rLabel = (k) => RATIO_LABELS[ro() ? "ro" : "en"][k] || k;
const fmtVal = (k, v) =>
  !isNum(v) ? "—" : PCT_RATIOS.includes(k) ? fmtPct(v, 1) : DAY_RATIOS.includes(k) ? nf(v, 0) + (ro() ? " zile" : " days") : fmtRatio(v, 2);

const state = { P: null, ds: null, year: null, peers: "sectorBand", ratio: "currentRatio", threshold: 1.5 };

const R = (row, i) => (row && row[i] != null ? Number(row[i]) : 0);
function companyRatios(row) {
  if (!row) return null;
  const ta = R(row, 0) + R(row, 1) + R(row, 5);
  const rev = R(row, 12);
  const net = R(row, 17) - R(row, 18);
  const d = (a, b) => (b === 0 || !isFinite(a / b) ? null : a / b);
  return {
    currentRatio: d(R(row, 1), R(row, 6)),
    quickRatio: d(R(row, 1) - R(row, 2), R(row, 6)),
    cashRatio: d(R(row, 4), R(row, 6)),
    equityRatio: d(R(row, 9), ta),
    debtToEquity: d(R(row, 6), R(row, 9)),
    netMargin: d(net, rev),
    roa: d(net, ta),
    assetTurnover: d(rev, ta),
    daysReceivables: d(R(row, 3), rev) == null ? null : d(R(row, 3), rev) * 365,
    daysInventory: d(R(row, 2), rev) == null ? null : d(R(row, 2), rev) * 365,
    _ta: ta,
    _rev: rev,
  };
}

function cellKey(year, div, band) {
  return `${year}:${div}:${band}`;
}
function peerCell() {
  const { P, ds, year } = state;
  const div = divOf(ds.caen);
  const row = ds.raw[year];
  const band = bandOf(R(row, 12));
  const keys = {
    sectorBand: cellKey(year, div, band),
    sector: cellKey(year, div, -1),
    market: cellKey(year, 0, -1),
  };
  const key = keys[state.peers];
  const cell = P.cells[key];
  if (cell) return { cell, div, band, key };
  const fb = P.cells[keys.sector] || P.cells[keys.market];
  return { cell: fb, div, band, key: fb ? keys.sector : null, fallback: true };
}

/** Percentile of a value inside a 21-point quantile vector (linear interpolation). */
function pctOf(q, v) {
  if (!q || !isNum(v)) return null;
  if (v <= q[0]) return 0;
  if (v >= q[q.length - 1]) return 100;
  for (let i = 0; i < q.length - 1; i++) {
    if (v >= q[i] && v <= q[i + 1]) {
      const span = q[i + 1] - q[i];
      const f = span === 0 ? 0 : (v - q[i]) / span;
      return (i + f) * 5;
    }
  }
  return null;
}

/** Histogram built from the quantile function: each of the 20 intervals carries 5 % of the mass. */
function histFromQuantiles(q, nBins = 26) {
  const lo = q[1],
    hi = q[19];
  if (!(hi > lo)) return null;
  const w = (hi - lo) / nBins;
  const counts = new Array(nBins).fill(0);
  for (let i = 0; i < q.length - 1; i++) {
    let a = Math.max(q[i], lo),
      b = Math.min(q[i + 1], hi);
    if (!(b > a)) continue;
    const mass = 5;
    const ia = Math.min(nBins - 1, Math.floor((a - lo) / w));
    const ib = Math.min(nBins - 1, Math.floor((b - lo) / w));
    if (ia === ib) counts[ia] += mass;
    else {
      const total = b - a;
      for (let k = ia; k <= ib; k++) {
        const s = Math.max(a, lo + k * w),
          e = Math.min(b, lo + (k + 1) * w);
        if (e > s) counts[k] += (mass * (e - s)) / total;
      }
    }
  }
  return { lo, hi, w, counts, edges: counts.map((_, k) => lo + k * w) };
}

function profilePanel() {
  const { cell, div, band, fallback } = peerCell();
  const rr = companyRatios(state.ds.raw[state.year]);
  if (!cell) return `<section class="card panel-card"><p class="chart-caption">${esc(t("s.noCell"))}</p></section>`;
  const rows = state.P.ratios
    .map((k) => {
      const q = cell.q[k];
      const v = rr[k];
      const p = pctOf(q, v);
      const shown = LOWER_BETTER.includes(k) && p != null ? 100 - p : p;
      return `<div class="woe-row">
        <div class="woe-header"><strong>${esc(rLabel(k))}</strong><span>${esc(fmtVal(k, v))} · ${
        p == null ? "—" : `${ro() ? "percentila" : "percentile"} <strong>${nf(p, 0)}</strong>`
      }${LOWER_BETTER.includes(k) ? ` <small>(${ro() ? "mai mic e mai bine" : "lower is better"})</small>` : ""}</span></div>
        ${q ? percentileBar(q, v, { pct: shown }) : ""}
        <div class="bucket-distribution-meta"><span>${esc(t("s.p25"))}: ${esc(fmtVal(k, q?.[5]))}</span><span>${esc(t("s.median"))}: ${esc(fmtVal(k, q?.[10]))}</span><span>${esc(t("s.p75"))}: ${esc(fmtVal(k, q?.[15]))}</span></div>
      </div>`;
    })
    .join("");
  const peerSel = `<select class="field-input" id="peers-select">${["sectorBand", "sector", "market"]
    .map((k) => `<option value="${k}"${state.peers === k ? " selected" : ""}>${esc(t("s.peers." + k))}</option>`)
    .join("")}</select>`;
  const yearSel = `<select class="field-input" id="year-select">${state.ds.years
    .map((y) => `<option value="${y}"${y === state.year ? " selected" : ""}>${y}</option>`)
    .join("")}</select>`;
  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("s.profile.kicker"))}</p><h2>${esc(t("s.profile.title"))}</h2><p class="chart-caption">${esc(t("s.profile.help"))}</p></div>
      <div class="button-row">
        <label class="field-card" style="padding:8px 12px"><span class="field-label">${esc(t("s.peers"))}</span>${peerSel}</label>
        <label class="field-card" style="padding:8px 12px"><span class="field-label">${esc(t("ent.year"))}</span>${yearSel}</label>
      </div></div>
    <div class="score-hero">
      <article class="kpi-tile"><span class="metric-label">${esc(t("ent.sector"))}</span><span><strong>${esc(divName(div))}</strong></span><span class="kpi-delta">${esc(t("ent.band"))}: ${esc(bandName(band))}</span></article>
      <article class="kpi-tile"><span class="metric-label">${esc(t("s.n"))}</span><span class="score-big">${nf(cell.n)}</span>${fallback ? `<span class="kpi-delta">${esc(t("s.noCell"))}</span>` : ""}</article>
      <article class="kpi-tile"><span class="metric-label">${esc(t("ent.revenue"))}</span><span class="score-big">${nf(R(state.ds.raw[state.year], 12) / 1e6, 1)}</span><span class="kpi-delta">${ro() ? "milioane lei" : "RON million"}</span></article>
    </div>
    <div class="woe-list">${rows}</div>
  </section>`;
}

function distributionPanel() {
  const { cell } = peerCell();
  if (!cell) return "";
  const k = state.ratio;
  const q = cell.q[k];
  const rr = companyRatios(state.ds.raw[state.year]);
  const h = q ? histFromQuantiles(q) : null;
  const v = rr[k];
  const thr = state.threshold;
  const pThr = pctOf(q, thr);
  const idxOf = (val) => (h && isNum(val) ? Math.max(0, Math.min(h.counts.length - 1, Math.floor((val - h.lo) / h.w))) : null);
  const ratioSel = `<select class="field-input" id="ratio-select">${state.P.ratios
    .map((r) => `<option value="${r}"${r === k ? " selected" : ""}>${esc(rLabel(r))}</option>`)
    .join("")}</select>`;
  const chart = h
    ? histChart(h.edges, h.counts, {
        markerIndex: idxOf(thr),
        highlight: idxOf(v),
        binLabel: (i) => `${fmtVal(k, h.edges[i])} – ${fmtVal(k, h.edges[i] + h.w)}`,
        tickLabel: (i) => fmtVal(k, h.edges[i]),
        aria: "distribution",
      })
    : `<p class="chart-caption">${esc(t("s.noCell"))}</p>`;
  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("s.dist.kicker"))}</p><h3>${esc(t("s.dist.title"))}</h3><p class="chart-caption">${esc(t("s.dist.help"))}</p></div></div>
    <div class="panel-subgrid two-up">
      <label class="field-card"><span class="field-label">${esc(t("s.ratio"))}</span>${ratioSel}</label>
      <label class="field-card"><span class="field-label">${esc(t("s.dist.threshold"))}: <strong id="thr-label">${esc(fmtVal(k, thr))}</strong></span>
        <input type="range" id="thr-range" min="0" max="100" step="1" value="${Math.round(((pThr ?? 50) / 100) * 100)}" /></label>
    </div>
    ${chart}
    <div class="legend-row">
      <span class="legend-chip" style="--legend-color:${PALETTE[2]}">${esc(ro() ? "intervalul companiei" : "the company's bin")}</span>
      <span class="legend-chip" style="--legend-color:${PALETTE[4]}">${esc(t("s.dist.threshold"))}</span>
    </div>
    <p class="chart-caption">${esc(t("s.dist.passing"))}: <strong>${pThr == null ? "—" : nf(LOWER_BETTER.includes(k) ? pThr : 100 - pThr, 0) + " %"}</strong> · ${esc(t("s.thr.pctOf"))} <strong>${pThr == null ? "—" : nf(pThr, 0)}</strong></p>
  </section>`;
}

function thresholdPanel() {
  const k = state.ratio,
    thr = state.threshold,
    year = state.year;
  const rows = [];
  const { band } = peerCell();
  const useBand = state.peers === "sectorBand" ? band : -1;
  for (const d of Object.keys(CAEN_DIV).map(Number)) {
    const cell = state.P.cells[cellKey(year, d, useBand)] || (useBand >= 0 ? state.P.cells[cellKey(year, d, -1)] : null);
    const q = cell?.q?.[k];
    if (!q || cell.n < 200) continue;
    const p = pctOf(q, thr);
    if (p == null) continue;
    rows.push({ d, n: cell.n, pass: LOWER_BETTER.includes(k) ? p : 100 - p, med: q[10], p });
  }
  rows.sort((a, b) => a.pass - b.pass);
  const myDiv = divOf(state.ds.caen);
  const body = rows
    .map(
      (r) => `<tr${r.d === myDiv ? ' style="background:rgba(26,53,168,0.06)"' : ""}>
      <td>${esc(divName(r.d))}</td><td class="num">${nf(r.n)}</td><td class="num">${esc(fmtVal(k, r.med))}</td>
      <td class="num">${nf(r.p, 0)}</td>
      <td><div class="comparison-track" style="min-width:120px"><div class="comparison-fill" style="width:${Math.max(1, r.pass)}%"></div></div></td>
      <td class="num"><strong>${nf(r.pass, 0)} %</strong></td></tr>`
    )
    .join("");
  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("s.thr.kicker"))}</p><h3>${esc(t("s.thr.title"))}</h3><p class="chart-caption">${esc(t("s.thr.help"))}</p></div>
      <span class="status-pill">${esc(rLabel(k))} ${LOWER_BETTER.includes(k) ? "≤" : "≥"} ${esc(fmtVal(k, thr))} · ${esc(useBand >= 0 ? bandName(useBand) : t("s.peers.sector"))}</span></div>
    <div class="table-scroll" style="max-height:430px;overflow:auto"><table class="data-table"><thead><tr><th>${esc(t("s.thr.sector"))}</th><th class="num">${esc(t("s.thr.firms"))}</th><th class="num">${esc(t("s.thr.medianCol"))}</th><th class="num">${esc(ro() ? "percentila pragului" : "threshold percentile")}</th><th></th><th class="num">${esc(t("s.thr.pass"))}</th></tr></thead><tbody>${body}</tbody></table></div>
  </section>`;
}

function migrationPanel() {
  const { div, band } = peerCell();
  const rr = state.P.ratios;
  const years = state.ds.years;
  const head = years.map((y) => `<th class="num">${y}</th>`).join("");
  const body = rr
    .map((k) => {
      const cells = years.map((y) => {
        const key = state.peers === "market" ? cellKey(y, 0, -1) : state.peers === "sector" ? cellKey(y, div, -1) : cellKey(y, div, band);
        const cell = state.P.cells[key] || state.P.cells[cellKey(y, div, -1)];
        const q = cell?.q?.[k];
        const v = companyRatios(state.ds.raw[y])?.[k];
        const p = pctOf(q, v);
        const shown = LOWER_BETTER.includes(k) && p != null ? 100 - p : p;
        return shown;
      });
      const first = cells.find((c) => c != null),
        last = [...cells].reverse().find((c) => c != null);
      const drop = first != null && last != null && first - last > 20;
      return `<tr><td>${esc(rLabel(k))}${drop ? ` <span class="status-dot weak">${esc(t("s.mig.drop"))}</span>` : ""}</td>${cells
        .map((c) => `<td class="num">${c == null ? "—" : nf(c, 0)}</td>`)
        .join("")}</tr>`;
    })
    .join("");
  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("s.mig.kicker"))}</p><h3>${esc(t("s.mig.title"))}</h3><p class="chart-caption">${esc(t("s.mig.help"))}</p></div></div>
    <div class="table-scroll"><table class="data-table"><thead><tr><th>${esc(t("s.ratio"))}</th>${head}</tr></thead><tbody>${body}</tbody></table></div>
  </section>`;
}

function render() {
  if (!state.ds) return;
  if (!state.year || !state.ds.years.includes(state.year)) state.year = state.ds.years[state.ds.years.length - 1];
  const { cell, div } = peerCell();
  $("hero-sector").textContent = divName(div);
  $("hero-n").textContent = cell ? nf(cell.n) : "—";
  $("workspace").innerHTML = profilePanel() + `<div class="dash-grid">${distributionPanel()}${migrationPanel()}</div>` + thresholdPanel();
  applyStaticTranslations();

  const ps = $("peers-select");
  if (ps)
    ps.addEventListener("change", (e) => {
      state.peers = e.target.value;
      render();
    });
  const ys = $("year-select");
  if (ys)
    ys.addEventListener("change", (e) => {
      state.year = Number(e.target.value);
      render();
    });
  const rs = $("ratio-select");
  if (rs)
    rs.addEventListener("change", (e) => {
      state.ratio = e.target.value;
      const { cell } = peerCell();
      const q = cell?.q?.[state.ratio];
      state.threshold = q ? q[10] : 1;
      render();
    });
  const tr = $("thr-range");
  if (tr) {
    const apply = (v) => {
      const { cell } = peerCell();
      const q = cell?.q?.[state.ratio];
      if (!q) return;
      const p = Number(v) / 5;
      const i = Math.max(0, Math.min(19, Math.floor(p)));
      const f = p - i;
      state.threshold = q[i] + (q[i + 1] - q[i]) * f;
    };
    tr.addEventListener("input", (e) => {
      apply(e.target.value);
      $("thr-label").textContent = fmtVal(state.ratio, state.threshold);
    });
    tr.addEventListener("change", () => render());
  }
}

renderAdvShell("sector");
(async () => {
  state.P = await loadGzJson("./data/percentiles.json.gz");
  wireCompanyEntry((ds) => {
    state.ds = ds;
    state.year = null;
    const rr = companyRatios(ds.raw[ds.years[ds.years.length - 1]]);
    state.threshold = isNum(rr?.currentRatio) ? 1.5 : 1.5;
    render();
  });
})();
document.addEventListener("langchange", () => state.ds && render());
