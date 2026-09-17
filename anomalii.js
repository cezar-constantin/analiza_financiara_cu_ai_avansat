// Anomaly lab: plausibility, the zero discontinuity, the Benford trap, atypical profiles.
import { t, isNum, applyStaticTranslations, escapeHtml as esc, PALETTE, fmtMoney } from "./common.js";
import {
  $, ro, nf, renderAdvShell, wireCompanyEntry, loadGzJson, divName, bandName, bandOf, divOf,
  histChart, pairedColumns, madVerdict, BENFORD, CAEN_DIV,
} from "./adv.js";

const CHECKS = ["balance", "plAccount", "netAboveGross", "componentsExceed", "impossibleNegative", "revenueNoStaff", "bothProfitAndLoss"];
const DIM_RO = {
  "currentAssets/TA": "active circulante / active totale",
  "inventories/TA": "stocuri / active totale",
  "receivables/TA": "creanțe / active totale",
  "cash/TA": "numerar / active totale",
  "liabilities/TA": "datorii / active totale",
  "equity/TA": "capitaluri / active totale",
  "revenue/TA": "cifra de afaceri / active totale",
  netMargin: "marjă netă",
  "expenses/income": "cheltuieli / venituri",
};
const dimLabel = (d) => (ro() ? DIM_RO[d] || d : d);
const state = { A: null, O: null, ds: null, year: 2025, zScope: "all", bScope: "all", bFields: "all", outDiv: 47 };

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

function zeroScopes() {
  const out = [{ k: "all", label: ro() ? "Toată populația" : "Whole population" }];
  for (let b = 0; b < 4; b++) if (state.A.zero[`${state.year}:b${b}`]) out.push({ k: `b${b}`, label: bandName(b) });
  const divs = Object.keys(state.A.zero)
    .filter((k) => k.startsWith(`${state.year}:d`))
    .map((k) => Number(k.split(":d")[1]))
    .sort((a, b) => a - b);
  for (const d of divs) out.push({ k: `d${d}`, label: divName(d) });
  return out;
}

function zeroPanel() {
  const A = state.A;
  const key = `${state.year}:${state.zScope}`;
  const z = A.zero[key] || A.zero[`${state.year}:all`];
  const bins = A.bins.slice(0, -1);
  const zeroIdx = bins.findIndex((b) => Math.abs(b) < 1e-9);
  const below = z.h[zeroIdx - 1],
    above = z.h[zeroIdx];
  const expBelow = (z.h[zeroIdx - 2] + z.h[zeroIdx + 1]) / 2;
  const ratio = below ? above / below : null;
  const deficit = expBelow ? 100 * (1 - below / expBelow) : null;
  const row = state.ds ? state.ds.raw[state.year] : null;
  let compIdx = null,
    compVal = null;
  if (row) {
    const ta = R(row, 0) + R(row, 1) + R(row, 5);
    const net = R(row, 17) - R(row, 18);
    if (ta > 0) {
      compVal = net / ta;
      const i = bins.findIndex((b, k) => compVal >= b && compVal < bins[k + 1]);
      compIdx = i >= 0 ? i : null;
    }
  }
  const scopeSel = `<select class="field-input" id="z-scope">${zeroScopes()
    .map((s) => `<option value="${s.k}"${state.zScope === s.k ? " selected" : ""}>${esc(s.label)}</option>`)
    .join("")}</select>`;
  const yearSel = `<select class="field-input" id="z-year">${A.years
    .map((y) => `<option value="${y}"${y === state.year ? " selected" : ""}>${y}</option>`)
    .join("")}</select>`;
  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("a.zero.kicker"))}</p><h2>${esc(t("a.zero.title"))}</h2><p class="chart-caption">${esc(t("a.zero.help"))}</p></div></div>
    <div class="panel-subgrid two-up">
      <label class="field-card"><span class="field-label">${esc(t("a.zero.scope"))}</span>${scopeSel}</label>
      <label class="field-card"><span class="field-label">${esc(t("a.year"))}</span>${yearSel}</label>
    </div>
    <div class="score-hero">
      <article class="kpi-tile"><span class="metric-label">${esc(t("a.zero.ratio"))}</span><span class="score-big">${nf(ratio, 2)}×</span><span class="kpi-delta">${esc(t("a.zero.below"))}: ${nf(below)} · ${esc(t("a.zero.above"))}: ${nf(above)}</span></article>
      <article class="kpi-tile"><span class="metric-label">${esc(t("a.zero.deficit"))}</span><span class="score-big">${nf(deficit, 1)} %</span><span class="kpi-delta">${nf(z.n)} ${ro() ? "firme în grup" : "companies in group"}</span></article>
      <article class="kpi-tile"><span class="metric-label">${esc(t("a.zero.companyPos"))}</span><span class="score-big">${compVal == null ? "—" : nf(100 * compVal, 2) + " %"}</span><span class="kpi-delta">${
    compIdx == null ? "" : `${esc(t("a.zero.companyIn"))} ${nf(100 * bins[compIdx], 0)} % … ${nf(100 * (bins[compIdx] + 0.01), 0)} %`
  }</span></article>
    </div>
    ${histChart(bins, z.h, {
      zeroIndex: zeroIdx,
      highlight: compIdx,
      binLabel: (i) => `${nf(100 * bins[i], 0)} % … ${nf(100 * (bins[i] + 0.01), 0)} %`,
      tickLabel: (i) => nf(100 * bins[i], 0) + " %",
      aria: "zero discontinuity",
    })}
    <div class="legend-row">
      <span class="legend-chip" style="--legend-color:${PALETTE[0]}">${esc(ro() ? "primul interval peste zero" : "first bin above zero")}</span>
      <span class="legend-chip" style="--legend-color:${PALETTE[2]}">${esc(ro() ? "intervalul companiei" : "the company's bin")}</span>
    </div>
    <p class="chart-caption">${esc(
      ro()
        ? "Deficitul se calculează față de o interpolare între intervalul −2 %…−1 % și intervalul +1 %…+2 %; intervalul imediat de peste zero nu este folosit ca ancoră, pentru că el este tocmai cel umflat de fenomen."
        : "The deficit is measured against an interpolation between the −2 %…−1 % and +1 %…+2 % bins; the bin just above zero is not used as an anchor, because that is the one the phenomenon inflates."
    )}</p>
    <div class="callout-card"><strong>${esc(t("a.zero.interp"))}</strong><p>${esc(t("a.zero.interpText"))}</p></div>
  </section>`;
}

function benfordPanel() {
  const A = state.A;
  const key = `${state.year}:${state.bScope}:${state.bFields}`;
  const b = A.benford[key];
  const scopes = [{ k: "all", label: ro() ? "Toată populația" : "Whole population" }];
  for (let i = 0; i < 4; i++) if (A.benford[`${state.year}:b${i}:${state.bFields}`]) scopes.push({ k: `b${i}`, label: bandName(i) });
  Object.keys(A.benford)
    .filter((k) => k.startsWith(`${state.year}:d`) && k.endsWith(`:${state.bFields}`))
    .map((k) => Number(k.split(":d")[1].split(":")[0]))
    .sort((x, y) => x - y)
    .forEach((d) => scopes.push({ k: `d${d}`, label: divName(d) }));
  const scopeSel = `<select class="field-input" id="b-scope">${scopes
    .map((s) => `<option value="${s.k}"${state.bScope === s.k ? " selected" : ""}>${esc(s.label)}</option>`)
    .join("")}</select>`;
  const fieldSel = `<select class="field-input" id="b-fields">${["all", "nobiz"]
    .map((f) => `<option value="${f}"${state.bFields === f ? " selected" : ""}>${esc(t("a.ben.fields." + f))}</option>`)
    .join("")}</select>`;
  if (!b)
    return `<section class="card panel-card"><div class="section-heading"><div><p class="section-kicker">${esc(t("a.ben.kicker"))}</p><h2>${esc(t("a.ben.title"))}</h2></div></div>
      <div class="panel-subgrid two-up"><label class="field-card"><span class="field-label">${esc(t("a.zero.scope"))}</span>${scopeSel}</label><label class="field-card"><span class="field-label">${esc(t("a.ben.fields"))}</span>${fieldSel}</label></div>
      <p class="chart-caption">${esc(t("s.noCell"))}</p></section>`;
  const total = b.d.reduce((x, y) => x + y, 0);
  const obs = b.d.map((x) => x / total);
  const mad = obs.reduce((s, p, i) => s + Math.abs(p - BENFORD[i]), 0) / 9;
  const v = madVerdict(mad);
  const trap = state.bScope.startsWith("b") && state.bFields === "all" && mad >= 0.012;
  const rows = obs
    .map(
      (p, i) =>
        `<tr><td>${i + 1}</td><td class="num">${nf(100 * p, 2)} %</td><td class="num">${nf(100 * BENFORD[i], 2)} %</td><td class="num">${(p - BENFORD[i] > 0 ? "+" : "") + nf(100 * (p - BENFORD[i]), 2)} pp</td></tr>`
    )
    .join("");
  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("a.ben.kicker"))}</p><h2>${esc(t("a.ben.title"))}</h2><p class="chart-caption">${esc(t("a.ben.help"))}</p></div>
      <span class="status-pill ${v.tone}">${esc(t(v.key))}</span></div>
    <div class="panel-subgrid two-up">
      <label class="field-card"><span class="field-label">${esc(t("a.zero.scope"))}</span>${scopeSel}</label>
      <label class="field-card"><span class="field-label">${esc(t("a.ben.fields"))}</span>${fieldSel}</label>
    </div>
    <div class="score-hero">
      <article class="kpi-tile"><span class="metric-label">${esc(t("a.ben.mad"))}</span><span class="score-big">${nf(mad, 4)}</span><span class="kpi-delta">${esc(ro() ? "praguri Nigrini: 0,006 · 0,012 · 0,015" : "Nigrini thresholds: 0.006 · 0.012 · 0.015")}</span></article>
      <article class="kpi-tile" style="grid-column: span 2"><span class="metric-label">${esc(t("a.ben.values"))}</span><span class="score-big">${nf(total)}</span><span class="kpi-delta">${esc(t("a.ben.digit"))} · ${esc(t(v.key))}</span></article>
    </div>
    ${pairedColumns(["1", "2", "3", "4", "5", "6", "7", "8", "9"], obs, BENFORD, { aria: "benford", height: 260 })}
    <div class="legend-row"><span class="legend-chip" style="--legend-color:${PALETTE[0]}">${esc(t("a.ben.observed"))}</span><span class="legend-chip" style="--legend-color:${PALETTE[2]}">${esc(t("a.ben.expected"))}</span></div>
    <div class="table-scroll"><table class="data-table"><thead><tr><th>${esc(t("a.ben.digit"))}</th><th class="num">${esc(t("a.ben.observed"))}</th><th class="num">${esc(t("a.ben.expected"))}</th><th class="num">${esc(ro() ? "diferență" : "difference")}</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${trap ? `<div class="callout-card"><strong>${esc(t("a.ben.trap.title"))}</strong><p>${esc(t("a.ben.trap"))}</p></div>` : ""}
  </section>`;
}

function outlierPanel() {
  const O = state.O;
  const divs = Object.keys(O.divisions)
    .map(Number)
    .sort((a, b) => a - b);
  const d = O.divisions[String(state.outDiv)] ? state.outDiv : divs[0];
  const cell = O.divisions[String(d)];
  const sel = `<select class="field-input" id="out-div">${divs
    .map((x) => `<option value="${x}"${x === d ? " selected" : ""}>${esc(divName(x))}</option>`)
    .join("")}</select>`;
  const body = cell
    ? cell.top
        .map(
          (r, i) => `<tr>
        <td class="num">${i + 1}</td>
        <td><code>${r.cui}</code></td>
        <td class="num">${nf(r.d2, 0)}</td>
        <td><small>${r.z.map(([j, z]) => `${esc(dimLabel(O.dims[j]))} <strong>${z > 0 ? "+" : ""}${nf(z, 0)}σ</strong>`).join(" · ")}</small></td>
        <td><button class="ghost-button small-button" data-lookup="${r.cui}" type="button">${esc(t("a.out.lookup"))}</button></td>
      </tr>`
        )
        .join("")
    : "";
  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("a.out.kicker"))}</p><h2>${esc(t("a.out.title"))}</h2><p class="chart-caption">${esc(t("a.out.help"))}</p></div>
      <label class="field-card" style="padding:8px 12px"><span class="field-label">${esc(t("ent.sector"))}</span>${sel}</label></div>
    <div class="callout-card"><strong>⚠</strong><p>${esc(t("a.out.warn"))}</p></div>
    ${cell ? `<div class="table-scroll"><table class="data-table"><thead><tr><th class="num">${esc(t("a.out.rank"))}</th><th>${esc(t("a.out.cui"))}</th><th class="num">${esc(t("a.out.d2"))}</th><th>${esc(t("a.out.dims"))}</th><th></th></tr></thead><tbody>${body}</tbody></table></div>
      <p class="chart-caption">${nf(cell.n)} ${esc(ro() ? "firme cu cifră de afaceri peste 10 mil. lei în diviziune" : "companies above RON 10m revenue in this division")} · ${esc(O.year)}</p>`
      : `<p class="chart-caption">${esc(t("a.out.noDiv"))}</p>`}
  </section>`;
}

let entry = null;
function render() {
  const A = state.A;
  $("hero-pop").textContent = nf(A.checks.pop);
  const z = A.zero[`${state.year}:${state.zScope}`] || A.zero[`${state.year}:all`];
  const bins = A.bins.slice(0, -1);
  const zi = bins.findIndex((b) => Math.abs(b) < 1e-9);
  $("hero-ratio").textContent = z.h[zi - 1] ? nf(z.h[zi] / z.h[zi - 1], 2) + "×" : "—";
  $("workspace").innerHTML = checksPanel() + zeroPanel() + benfordPanel() + outlierPanel();
  applyStaticTranslations();

  const bind = (id, fn) => {
    const el = $(id);
    if (el) el.addEventListener("change", fn);
  };
  bind("z-scope", (e) => {
    state.zScope = e.target.value;
    render();
  });
  bind("z-year", (e) => {
    state.year = Number(e.target.value);
    render();
  });
  bind("b-scope", (e) => {
    state.bScope = e.target.value;
    render();
  });
  bind("b-fields", (e) => {
    state.bFields = e.target.value;
    render();
  });
  bind("out-div", (e) => {
    state.outDiv = Number(e.target.value);
    render();
  });
  $("workspace")
    .querySelectorAll("button[data-lookup]")
    .forEach((b) =>
      b.addEventListener("click", () => {
        $("cui-input").value = b.dataset.lookup;
        if (entry) entry.load(b.dataset.lookup);
      })
    );
}

renderAdvShell("anom");
(async () => {
  [state.A, state.O] = await Promise.all([loadGzJson("./data/anomalies.json.gz"), loadGzJson("./data/outliers.json.gz")]);
  entry = await wireCompanyEntry((ds) => {
    state.ds = ds;
    const d = divOf(ds.caen);
    if (state.O.divisions[String(d)]) state.outDiv = d;
    render();
  });
  render();
})();
document.addEventListener("langchange", () => state.A && render());
