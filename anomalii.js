// Anomaly lab: plausibility checks with population frequencies, plus the correlation radar and the
// three levels of anomaly detection from the course lesson (thresholds, z-score/IQR, relationship residuals).
import { t, applyStaticTranslations, escapeHtml as esc, meter } from "./common.js";
import { $, ro, nf, renderAdvShell, wireCompanyEntry, loadGzJson, divName, divOf, bandOf, bandName } from "./adv.js";

const CHECKS = ["balance", "plAccount", "netAboveGross", "componentsExceed", "impossibleNegative", "revenueNoStaff", "bothProfitAndLoss"];
const state = { A: null, C: null, ds: null, cYear: 2025, method: "spearman", l1: null, l2: null, l3: null };

const R = (row, i) => (row && row[i] != null ? Number(row[i]) : 0);
const tol = (b) => Math.max(1000, 0.005 * Math.abs(b));

function runChecks(row) {
  if (!row) return null;
  const ta = R(row, 0) + R(row, 1) + R(row, 5);
  const gross = R(row, 15) - R(row, 16);
  const net = R(row, 17) - R(row, 18);
  return {
    balance: Math.abs(ta - (R(row, 9) + R(row, 6) + R(row, 7) + R(row, 8))) > tol(ta),
    plAccount: Math.abs(R(row, 13) - R(row, 14) - gross) > tol(Math.max(R(row, 13), 1)),
    netAboveGross: gross - net < -tol(Math.max(Math.abs(R(row, 15)), 1)),
    componentsExceed: R(row, 2) + R(row, 3) + R(row, 4) > R(row, 1) + tol(Math.max(R(row, 1), 1)),
    impossibleNegative: [2, 3, 4, 0, 6].some((i) => R(row, i) < 0),
    revenueNoStaff: R(row, 12) > 5e6 && R(row, 19) === 0,
    bothProfitAndLoss: R(row, 15) > 0 && R(row, 16) > 0,
  };
}

function checksPanel() {
  const A = state.A;
  const row = state.ds ? state.ds.raw[2025] || state.ds.raw[state.ds.years[state.ds.years.length - 1]] : null;
  const res = runChecks(row);
  const body = CHECKS.map((k) => {
    const cnt = A.checks.counts[k];
    const pct = (100 * cnt) / A.checks.pop;
    const hit = res ? res[k] : null;
    return `<tr>
      <td>${esc(t("a.check." + k))}</td>
      <td>${hit == null ? "—" : hit ? `<span class="status-dot weak">${esc(t("a.checks.hit"))}</span>` : `<span class="status-dot good">${esc(t("a.checks.ok"))}</span>`}</td>
      <td class="num">${nf(cnt)} · ${nf(pct, 2)} %</td>
      <td><small>${esc(t("a.check." + k + ".x"))}</small></td>
    </tr>`;
  }).join("");
  const neg = A.checks.negativeByField;
  const negText = Object.entries(neg)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${esc(ro() ? { inventories: "stocuri", receivables: "creanțe", cash: "numerar", fixedAssets: "imobilizări", liabilities: "datorii" }[k] : k)}: ${nf(v)}`)
    .join(" · ");
  const btol = A.checks.balanceTolerance;
  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("a.checks.kicker"))}</p><h2>${esc(t("a.checks.title"))}</h2><p class="chart-caption">${esc(t("a.checks.help"))}</p></div>
      <span class="status-pill">${esc(t("a.pop"))}: ${nf(A.checks.pop)}</span></div>
    <div class="table-scroll"><table class="data-table"><thead><tr><th>${esc(t("a.checks.check"))}</th><th>${esc(t("a.checks.company"))}</th><th class="num">${esc(t("a.checks.freq"))}</th><th>${esc(t("a.checks.explain"))}</th></tr></thead><tbody>${body}</tbody></table></div>
    <p class="chart-caption">${esc(ro() ? "Valorile negative imposibile, pe câmp" : "Impossible negative values, by field")}: ${negText}. ${esc(
    ro()
      ? `Bilanțuri care nu se închid, în funcție de toleranță: ${nf(btol["1.0"])} la un leu, ${nf(btol["100.0"])} la 100 lei, ${nf(btol["1000.0"])} la 0,5 %. Discrepanțele sunt de ordinul rotunjirii, nu al erorii contabile.`
      : `Balance sheets that do not balance, by tolerance: ${nf(btol["1.0"])} at one leu, ${nf(btol["100.0"])} at 100 lei, ${nf(btol["1000.0"])} at 0.5 %. The discrepancies are rounding-scale, not accounting errors.`
  )}</p>
  </section>`;
}


// ---------------------------------------------------------------- lens 2: correlations & anomalies
const CORR_RATIOS = ["currentRatio", "quickRatio", "cashRatio", "equityRatio", "debtToEquity",
                     "netMargin", "roa", "assetTurnover", "daysReceivables", "daysInventory"];
const RLAB = {
  ro: ["Lichiditate curentă", "Lichiditate rapidă", "Lichiditate imediată", "Autonomie financiară",
       "Datorii / capitaluri", "Marjă netă", "ROA", "Rotația activelor", "Zile creanțe", "Zile stoc"],
  en: ["Current ratio", "Quick ratio", "Cash ratio", "Equity ratio", "Debt / equity",
       "Net margin", "ROA", "Asset turnover", "Days receivables", "Days inventory"],
};
const RSHORT = ["LC", "LR", "LI", "AF", "D/C", "MN", "ROA", "RA", "ZC", "ZS"];
const rl = (i) => RLAB[ro() ? "ro" : "en"][i];
const PAIRS = (() => {
  const out = [];
  for (let i = 0; i < 10; i++) for (let j = i + 1; j < 10; j++) out.push([i, j]);
  return out;
})();
const REL_ORDER = ["receivablesOnRevenue", "inventoriesOnRevenue", "debtOnAssets", "cashOnRevenue", "staffOnRevenue"];

const fmtDays = (v) => (isFinite(v) ? nf(v, 0) + (ro() ? " zile" : " days") : "—");
const fmtPP = (v) => (isFinite(v) ? (v > 0 ? "+" : "") + nf(100 * v, 2) + " pp" : "—");
const fmtPct2 = (v) => (isFinite(v) ? nf(100 * v, 2) + " %" : "—");
const fmtLei = (v) => (isFinite(v) ? nf(v / 1e6, v > 1e6 ? 2 : 3) + (ro() ? " mil. lei" : "m RON") : "—");
const dot = (tone, text) => `<span class="status-dot ${tone}">${esc(text)}</span>`;

/** Indicators of the company, per year, used by all three levels. */
function companySeries(ds) {
  const out = {};
  for (const y of ds.years) {
    const r = ds.raw[y];
    const rev = R(r, 12);
    if (!(rev > 0)) continue;
    const ta = R(r, 0) + R(r, 1) + R(r, 5);
    const net = R(r, 17) - R(r, 18);
    out[y] = {
      dso: (R(r, 3) / rev) * 365,
      dio: (R(r, 2) / rev) * 365,
      margin: net / rev,
      revenue: rev,
      receivables: R(r, 3),
      inventories: R(r, 2),
      cash: R(r, 4),
      debts: R(r, 6),
      assets: ta,
      staff: R(r, 19),
    };
    out[y].cycle = out[y].dso + out[y].dio;
  }
  return out;
}

function corrCell() {
  const d = divOf(state.ds.caen);
  const C = state.C;
  return C.cells[`${state.cYear}:${d}`] || C.cells[`${state.cYear}:0`] || null;
}
function distCell() {
  const d = divOf(state.ds.caen);
  const s2 = companySeries(state.ds)[state.cYear];
  const band = s2 ? bandOf(s2.revenue) : -1;
  const C = state.C;
  return (
    C.dist[`${state.cYear}:${d}:${band}`] ||
    C.dist[`${state.cYear}:${d}`] ||
    C.dist[`${state.cYear}:0:${band}`] ||
    C.dist[`${state.cYear}:0`] ||
    null
  );
}
function relCell() {
  const d = divOf(state.ds.caen);
  const s2 = companySeries(state.ds)[state.cYear];
  const band = s2 ? bandOf(s2.revenue) : -1;
  const C = state.C;
  // the band cell is the right reference: fitted where the company's own revenue lies, so the
  // relation is not extrapolated across five orders of magnitude
  const tries = [
    [`${state.cYear}:${d}:${band}`, "sectorBand"],
    [`${state.cYear}:${d}`, "sector"],
    [`${state.cYear}:0:${band}`, "marketBand"],
    [`${state.cYear}:0`, "market"],
  ];
  for (const [k, scope] of tries) if (C.rel[k]) return { rel: C.rel[k], scope, band };
  return null;
}

/** Correlation heat map, 10 x 10, blue = together, orange = opposite. */
function corrHeatmap(vals) {
  const n = 10, cell = 44, padL = 52, padT = 52;
  const W = padL + n * cell + 8, H = padT + n * cell + 8;
  const m = Array.from({ length: n }, () => Array(n).fill(1));
  PAIRS.forEach(([i, j], k) => {
    m[i][j] = vals[k];
    m[j][i] = vals[k];
  });
  let svg = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="matrice de corelații">`;
  for (let i = 0; i < n; i++) {
    svg += `<text class="axis-label" x="${padL - 8}" y="${padT + i * cell + cell / 2 + 4}" text-anchor="end" font-weight="700">${esc(RSHORT[i])}</text>`;
    svg += `<text class="axis-label" x="${padL + i * cell + cell / 2}" y="${padT - 10}" text-anchor="middle" font-weight="700">${esc(RSHORT[i])}</text>`;
  }
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const v = m[i][j];
      const a = Math.min(1, Math.abs(v));
      const color = i === j ? "rgba(22,37,84,0.12)" : v >= 0 ? `rgba(43,75,196,${0.10 + 0.8 * a})` : `rgba(217,114,15,${0.10 + 0.8 * a})`;
      svg += `<g class="hover-target"><rect x="${padL + j * cell}" y="${padT + i * cell}" width="${cell - 2}" height="${cell - 2}" rx="4" fill="${color}"><title>${esc(rl(i))} ↔ ${esc(rl(j))}: ${nf(v, 2)}</title></rect>`;
      if (i !== j && a >= 0.35)
        svg += `<text x="${padL + j * cell + (cell - 2) / 2}" y="${padT + i * cell + cell / 2 + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${a > 0.6 ? "#fff" : "#162554"}" pointer-events="none">${nf(v, 2).replace("0,", ",").replace("0.", ".")}</text>`;
      svg += `</g>`;
    }
  svg += `</svg>`;
  return svg;
}

function matrixBlock() {
  const c = corrCell();
  if (!c) return `<p class="chart-caption">${esc(t("c.noCell"))}</p>`;
  const vals = c[state.method];
  const top = PAIRS.map(([i, j], k) => ({ i, j, v: vals[k] }))
    .sort((a, b) => Math.abs(b.v) - Math.abs(a.v))
    .slice(0, 6);
  const rows = top
    .map(
      (p) => `<tr><td>${esc(rl(p.i))} ↔ ${esc(rl(p.j))}</td>
      <td class="num"><strong>${nf(p.v, 2)}</strong></td>
      <td><div class="woe-track" style="min-width:90px"><div class="woe-fill ${p.v >= 0 ? "is-positive" : "is-negative"}" style="${p.v >= 0 ? `left:50%;width:${Math.abs(p.v) * 50}%` : `right:50%;width:${Math.abs(p.v) * 50}%`}"></div></div></td>
      <td><small>${esc(
        p.v >= 0
          ? ro() ? "se mișcă împreună: dacă una crește, de obicei crește și cealaltă" : "move together: if one rises, the other usually rises"
          : ro() ? "se mișcă invers: creșterea uneia merge cu scăderea celeilalte" : "move inversely: one rising goes with the other falling"
      )}</small></td></tr>`
    )
    .join("");
  const methodSel = `<select class="field-input" id="corr-method">${["spearman", "pearson"]
    .map((k) => `<option value="${k}"${state.method === k ? " selected" : ""}>${esc(t("c.matrix." + k))}</option>`)
    .join("")}</select>`;
  return `<section class="panel-section">
    <h3>${esc(t("c.matrix.title"))}</h3>
    <p class="chart-caption">${esc(t("c.matrix.help"))}</p>
    <div class="panel-subgrid two-up">
      <label class="field-card"><span class="field-label">${esc(t("c.matrix.method"))}</span>${methodSel}</label>
      <article class="kpi-tile"><span class="metric-label">${esc(t("ent.sector"))}</span><span><strong>${esc(divName(divOf(state.ds.caen)))}</strong></span><span class="kpi-delta">${nf(c.n)} ${ro() ? "firme în diviziune" : "firms in the division"}</span></article>
    </div>
    <div class="dash-grid"><div>${corrHeatmap(vals)}
      <p class="chart-caption">${RSHORT.map((s2, i) => `<strong>${esc(s2)}</strong> ${esc(rl(i))}`).join(" · ")}</p></div>
      <div><div class="table-scroll"><table class="data-table"><thead><tr><th>${esc(t("c.matrix.pair"))}</th><th class="num">${esc(t("c.matrix.corr"))}</th><th></th><th>${esc(t("c.matrix.reading"))}</th></tr></thead><tbody>${rows}</tbody></table></div></div></div>
    <p class="chart-caption">${esc(t("c.matrix.trap"))}</p>
    <div class="callout-card"><strong>${esc(ro() ? "Capcană vizibilă în matrice" : "A trap visible in the matrix")}</strong><p>${esc(t("c.matrix.signTrap"))}</p></div>
  </section>`;
}

/** Level 1: the lesson's simple thresholds, against the company's own prior years. */
function level1() {
  const S = companySeries(state.ds);
  const cur = S[state.cYear];
  const prior = state.ds.years.filter((y) => y < state.cYear && S[y]);
  const avg = (k) => (prior.length ? prior.reduce((a, y) => a + S[y][k], 0) / prior.length : NaN);
  const RULES = [
    { key: "dso", label: "c.sig.dso", fmt: fmtDays, red: 10, yellow: 5, rule: ro() ? "> normal + 10 zile" : "> normal + 10 days", dir: 1 },
    { key: "dio", label: "c.sig.dio", fmt: fmtDays, red: 10, yellow: 5, rule: ro() ? "> normal + 10 zile" : "> normal + 10 days", dir: 1 },
    { key: "cycle", label: "c.sig.cycle", fmt: fmtDays, red: 15, yellow: 8, rule: ro() ? "> normal + 15 zile" : "> normal + 15 days", dir: 1 },
    { key: "margin", label: "c.sig.margin", fmt: fmtPct2, red: -0.01, yellow: -0.005, rule: ro() ? "scade cu 1 pp sau mai mult" : "falls by 1 pp or more", dir: -1 },
  ];
  const out = [];
  const rows = RULES.map((r) => {
    const v = cur ? cur[r.key] : NaN;
    const nrm = avg(r.key);
    const dev = v - nrm;
    let tone = "good", label = t("c.sig.green");
    if (!isFinite(dev)) {
      tone = "na";
      label = t("c.sig.na");
    } else if (r.dir > 0 ? dev >= r.red : dev <= r.red) {
      tone = "weak";
      label = t("c.sig.red");
    } else if (r.dir > 0 ? dev >= r.yellow : dev <= r.yellow) {
      tone = "watch";
      label = t("c.sig.yellow");
    }
    out.push({ key: r.key, tone });
    const devTxt = !isFinite(dev) ? "—" : r.key === "margin" ? fmtPP(dev) : (dev > 0 ? "+" : "") + nf(dev, 0) + (ro() ? " zile" : " d");
    return `<tr><td>${esc(t(r.label))}</td><td class="num">${esc(r.fmt(v))}</td><td class="num">${esc(r.fmt(nrm))}</td>
      <td class="num"><strong>${esc(devTxt)}</strong></td><td><small>${esc(r.rule)}</small></td><td>${dot(tone, label)}</td></tr>`;
  }).join("");
  const missing = ["dpo", "line"]
    .map((k) => `<tr><td colspan="5">${esc(t("c.score.missing." + k))}</td><td>${dot("na", t("c.sig.na"))}</td></tr>`)
    .join("");
  state.l1 = out;
  return `<section class="panel-section">
    <h3>${esc(t("c.l1.title"))}</h3>
    <p class="chart-caption">${esc(t("c.l1.help"))}</p>
    <div class="table-scroll"><table class="data-table"><thead><tr><th>${esc(t("c.l1.indicator"))}</th><th class="num">${esc(t("c.l1.current"))}</th><th class="num">${esc(t("c.l1.normal"))}</th><th class="num">${esc(t("c.l1.dev"))}</th><th>${esc(t("c.l1.rule"))}</th><th>${esc(t("c.l1.signal"))}</th></tr></thead><tbody>${rows}${missing}</tbody></table></div>
    <p class="chart-caption">${esc(t("c.cycleNote"))}</p>
  </section>`;
}

/** Level 2: z-score and the IQR rule against the sector x size-band distribution. */
function level2() {
  const D = distCell();
  const S = companySeries(state.ds);
  const cur = S[state.cYear];
  if (!D || !cur) return `<section class="panel-section"><h3>${esc(t("c.l2.title"))}</h3><p class="chart-caption">${esc(t("c.noCell"))}</p></section>`;
  const MAP = [
    ["daysReceivables", "dso", "c.sig.dso", fmtDays],
    ["daysInventory", "dio", "c.sig.dio", fmtDays],
    ["operatingCycle", "cycle", "c.sig.cycle", fmtDays],
    ["netMargin", "margin", "c.sig.margin", fmtPct2],
  ];
  const out = [];
  const rows = MAP.map(([dk, ck, lab, fmt]) => {
    const d = D[dk];
    const v = cur[ck];
    if (!d || !isFinite(v)) {
      out.push({ key: ck, z: NaN });
      return `<tr><td>${esc(t(lab))}</td><td class="num">${esc(fmt(v))}</td><td colspan="4">${dot("na", t("c.sig.na"))}</td></tr>`;
    }
    const z = (v - d.mean) / (d.sd || 1);
    const iqr = d.q3 - d.q1;
    const nonNeg = dk !== "netMargin";
    const loRaw = d.q1 - 1.5 * iqr;
    const lo = nonNeg ? Math.max(0, loRaw) : loRaw;
    const hi = d.q3 + 1.5 * iqr;
    const outIqr = v < lo || v > hi;
    const tone = Math.abs(z) > 3 ? "weak" : Math.abs(z) > 2 ? "watch" : outIqr ? "watch" : "good";
    const verdict = Math.abs(z) > 3 ? t("c.l2.severe") : Math.abs(z) > 2 ? t("c.l2.anom") : outIqr ? t("c.l2.outIqr") : t("c.l2.normal");
    out.push({ key: ck, z, outIqr });
    return `<tr><td>${esc(t(lab))}</td><td class="num">${esc(fmt(v))}</td><td class="num">${esc(fmt(d.mean))}</td>
      <td class="num">${esc(fmt(d.sd))}</td><td class="num"><strong>${(z > 0 ? "+" : "") + nf(z, 2)}</strong></td>
      <td class="num">${esc(fmt(lo))} … ${esc(fmt(hi))}</td><td>${dot(tone, verdict)}</td></tr>`;
  }).join("");
  state.l2 = out;
  const n = D.daysReceivables ? D.daysReceivables.n : 0;
  return `<section class="panel-section">
    <h3>${esc(t("c.l2.title"))}</h3>
    <p class="chart-caption">${esc(t("c.l2.help"))} ${nf(n)} ${ro() ? "firme în grupul de referință" : "firms in the reference group"}. ${esc(t("c.l2.fenceNote"))}</p>
    <div class="table-scroll"><table class="data-table"><thead><tr><th>${esc(t("c.l1.indicator"))}</th><th class="num">${esc(t("c.l2.value"))}</th><th class="num">${esc(t("c.l2.mean"))}</th><th class="num">${esc(t("c.l2.sd"))}</th><th class="num">${esc(t("c.l2.z"))}</th><th class="num">${esc(t("c.l2.fences"))}</th><th>${esc(t("c.l2.verdict"))}</th></tr></thead><tbody>${rows}</tbody></table></div>
  </section>`;
}

/** Level 3: residuals from the sector's log-log relationships. */
function level3() {
  const RC = relCell();
  const REL = RC ? RC.rel : null;
  const S = companySeries(state.ds);
  const cur = S[state.cYear];
  if (!REL || !cur) return `<section class="panel-section"><h3>${esc(t("c.l3.title"))}</h3><p class="chart-caption">${esc(t("c.noCell"))}</p></section>`;
  const scopeTxt =
    RC.scope === "sectorBand"
      ? `${divName(divOf(state.ds.caen))} · ${bandName(RC.band)}`
      : RC.scope === "sector"
        ? `${divName(divOf(state.ds.caen))} · ${t("s.peers.sector")}`
        : t("s.peers.market");
  const XY = {
    receivablesOnRevenue: ["receivables", "revenue"],
    inventoriesOnRevenue: ["inventories", "revenue"],
    debtOnAssets: ["debts", "assets"],
    cashOnRevenue: ["cash", "revenue"],
    staffOnRevenue: ["staff", "revenue"],
  };
  const out = [];
  const rows = REL_ORDER.filter((k) => REL[k])
    .map((k) => {
      const p = REL[k];
      const [yk, xk] = XY[k];
      const yv = cur[yk], xv = cur[xk];
      if (!(yv > 0) || !(xv > 0)) {
        out.push({ key: k, z: NaN });
        return `<tr><td>${esc(t("c.rel." + k))}</td><td colspan="5">${dot("na", t("c.sig.na"))}</td></tr>`;
      }
      const predLn = p.slope * Math.log(xv) + p.intercept;
      const pred = Math.exp(predLn);
      const z = (Math.log(yv) - predLn) / (p.sd || 1);
      const tone = Math.abs(z) > 3 ? "weak" : Math.abs(z) > 2 ? "watch" : "good";
      const verdict = Math.abs(z) <= 2 ? t("c.l3.ok") : z > 0 ? t("c.l3.excess") : t("c.l3.short");
      out.push({ key: k, z });
      const f = k === "staffOnRevenue" ? (v) => nf(v, 0) + (ro() ? " pers." : " staff") : fmtLei;
      return `<tr><td>${esc(t("c.rel." + k))}<span class="formula" style="display:block;color:var(--muted);font-size:0.76rem">${esc(t("c.rel." + k + ".r"))}</span></td>
        <td class="num">${esc(f(yv))}</td><td class="num">${esc(f(pred))}</td>
        <td class="num"><strong>${(z > 0 ? "+" : "") + nf(z, 2)}σ</strong></td>
        <td class="num"><small>r = ${nf(p.r, 2)}</small></td><td>${dot(tone, verdict)}</td></tr>`;
    })
    .join("");
  state.l3 = out;
  return `<section class="panel-section">
    <h3>${esc(t("c.l3.title"))}</h3>
    <p class="chart-caption">${esc(t("c.l3.help"))} ${esc(t("c.l3.group"))}: <strong>${esc(scopeTxt)}</strong>.${
      RC.scope === "sectorBand" ? "" : ` ${esc(t("c.l3.wideGroup"))}`
    }</p>
    <div class="table-scroll"><table class="data-table"><thead><tr><th>${esc(t("c.l3.relation"))}</th><th class="num">${esc(t("c.l3.actual"))}</th><th class="num">${esc(t("c.l3.pred"))}</th><th class="num">${esc(t("c.l3.resid"))}</th><th class="num">${esc(t("c.l3.fit"))}</th><th>${esc(t("c.l2.verdict"))}</th></tr></thead><tbody>${rows}</tbody></table></div>
  </section>`;
}

/** The lesson's weighted anomaly score, with the top three contributions. */
function scoreBlock() {
  const l1 = Object.fromEntries((state.l1 || []).map((x) => [x.key, x.tone]));
  const l3 = Object.fromEntries((state.l3 || []).map((x) => [x.key, x.z]));
  const items = [
    { label: t("c.sig.dso"), w: l1.dso === "weak" ? 20 : l1.dso === "watch" ? 10 : 0, max: 20, state: l1.dso },
    { label: t("c.sig.dio"), w: l1.dio === "weak" ? 20 : l1.dio === "watch" ? 10 : 0, max: 20, state: l1.dio },
    { label: t("c.sig.cycle"), w: l1.cycle === "weak" ? 20 : l1.cycle === "watch" ? 10 : 0, max: 20, state: l1.cycle },
    { label: t("c.sig.margin"), w: l1.margin === "weak" ? 10 : l1.margin === "watch" ? 5 : 0, max: 10, state: l1.margin },
    { label: t("c.sig.residInv"), w: l3.inventoriesOnRevenue > 2 ? 20 : 0, max: 20, state: l3.inventoriesOnRevenue > 2 ? "weak" : "good" },
    { label: t("c.sig.residRec"), w: l3.receivablesOnRevenue > 2 ? 20 : 0, max: 20, state: l3.receivablesOnRevenue > 2 ? "weak" : "good" },
  ];
  const score = Math.min(100, items.reduce((a, b) => a + b.w, 0));
  const band = score <= 25 ? "normal" : score <= 55 ? "watch" : "high";
  const tone = band === "normal" ? "good" : band === "watch" ? "watch" : "weak";
  const top = items.filter((i) => i.w > 0).sort((a, b) => b.w - a.w).slice(0, 3);
  const rows = items
    .map(
      (i) => `<tr><td>${esc(i.label)}</td><td class="num">+${i.w} / ${i.max}</td>
      <td>${dot(i.state === "weak" ? "weak" : i.state === "watch" ? "watch" : i.state === "na" ? "na" : "good",
        i.state === "weak" ? t("c.sig.red") : i.state === "watch" ? t("c.sig.yellow") : i.state === "na" ? t("c.sig.na") : t("c.sig.green"))}</td></tr>`
    )
    .join("");
  const missing = ["dpo", "line", "conc", "gross"]
    .map((k) => `<li>${esc(t("c.score.missing." + k))}</li>`)
    .join("");
  return `<section class="panel-section">
    <h3>${esc(t("c.score.title"))}</h3>
    <p class="chart-caption">${esc(t("c.score.help"))}</p>
    <div class="score-hero">
      <article class="kpi-tile"><span class="metric-label">${esc(t("c.score.title"))}</span><span class="score-big">${score}</span>${meter(score, 0, 100, tone)}<span class="kpi-delta">${esc(t("c.score.band." + band))} · 0–25 ${esc(t("c.score.band.normal"))} · 26–55 ${esc(t("c.score.band.watch"))} · 56–100 ${esc(t("c.score.band.high"))}</span></article>
      <article class="kpi-tile" style="grid-column: span 2"><span class="metric-label">${esc(t("c.score.top"))}</span><span>${
        top.length ? top.map((i) => `<strong>${esc(i.label)}</strong> +${i.w}`).join(" · ") : esc(t("c.score.none"))
      }</span></article>
    </div>
    <div class="table-scroll"><table class="data-table"><thead><tr><th>${esc(t("c.score.signal"))}</th><th class="num">${esc(t("c.score.weight"))}</th><th>${esc(t("c.score.state"))}</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="chart-caption"><strong>${esc(t("c.score.missing"))}:</strong></p>
    <ul class="helper-copy">${missing}</ul>
    <p class="chart-caption">${esc(t("c.score.maxNote"))}</p>
  </section>`;
}

function corrPanel() {
  if (!state.ds || !state.C)
    return `<section class="card panel-card">
      <div class="section-heading"><div><p class="section-kicker">${esc(t("c.kicker"))}</p><h2>${esc(t("c.title"))}</h2><p class="chart-caption">${esc(t("c.help"))}</p></div></div>
      <p class="chart-caption">${esc(t("c.needCompany"))}</p></section>`;
  const years = state.ds.years.filter((y) => companySeries(state.ds)[y]);
  if (!years.includes(state.cYear)) state.cYear = years[years.length - 1];
  const yearSel = `<select class="field-input" id="c-year">${years
    .map((y) => `<option value="${y}"${y === state.cYear ? " selected" : ""}>${y}</option>`)
    .join("")}</select>`;
  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("c.kicker"))}</p><h2>${esc(t("c.title"))}</h2><p class="chart-caption">${esc(t("c.help"))}</p></div>
      <label class="field-card" style="padding:8px 12px"><span class="field-label">${esc(t("a.year"))}</span>${yearSel}</label></div>
    ${matrixBlock()}${level1()}${level2()}${level3()}${scoreBlock()}
  </section>`;
}

let entry = null;
function render() {
  const A = state.A;
  $("hero-pop").textContent = nf(A.checks.pop);
  $("hero-issues").textContent = `${nf(A.checks.any)} · ${nf((100 * A.checks.any) / A.checks.pop, 2)} %`;
  $("workspace").innerHTML = checksPanel() + corrPanel();
  applyStaticTranslations();

  const cy = $("c-year");
  if (cy)
    cy.addEventListener("change", (e) => {
      state.cYear = Number(e.target.value);
      render();
    });
  const cm = $("corr-method");
  if (cm)
    cm.addEventListener("change", (e) => {
      state.method = e.target.value;
      render();
    });
}

renderAdvShell("anom");
(async () => {
  [state.A, state.C] = await Promise.all([loadGzJson("./data/anomalies.json.gz"), loadGzJson("./data/correlations.json.gz")]);
  entry = await wireCompanyEntry((ds) => {
    state.ds = ds;
    state.cYear = ds.years[ds.years.length - 1];
    render();
  });
  render();
})();
document.addEventListener("langchange", () => state.A && render());
