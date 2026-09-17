// Model lab: train a PD model in the browser on the delivered sample of real Romanian companies.
import { t, getLang, isNum, applyStaticTranslations, escapeHtml as esc, PALETTE, meter, toast, downloadText } from "./common.js";
import {
  $, ro, nf, renderAdvShell, wireCompanyEntry, loadJson, loadGzBuffer, divName, bandOf, divOf,
  trainLogit, predictLogit, auc, rocCurve, decileCalibration, rocChart, pairedColumns, CAEN_DIV,
} from "./adv.js";

const SCORECARD_FEATURES = ["currentRatio", "cashRatio", "equityRatio", "netMargin", "roa", "assetTurnover", "revenueGrowth"];
// sign we expect on a standardised coefficient: -1 = more of it should LOWER risk, +1 = should RAISE risk
const EXPECTED_SIGN = {
  currentRatio: -1, cashRatio: -1, equityRatio: -1, debtToAssets: +1, netMargin: -1, roa: -1,
  assetTurnover: -1, receivablesToRevenue: +1, inventoryToRevenue: +1, revenueGrowth: -1,
  debtChange: +1, logAssets: 0,
};
const FEATURE_LABELS = {
  ro: {
    currentRatio: "Lichiditate curentă", cashRatio: "Lichiditate imediată", equityRatio: "Autonomie financiară",
    debtToAssets: "Datorii / active", netMargin: "Marjă netă", roa: "ROA", assetTurnover: "Rotația activelor",
    receivablesToRevenue: "Creanțe / cifra de afaceri", inventoryToRevenue: "Stocuri / cifra de afaceri",
    revenueGrowth: "Creșterea cifrei de afaceri", debtChange: "Variația datoriilor / active",
    logAssets: "Mărimea (log active)",
  },
  en: {
    currentRatio: "Current ratio", cashRatio: "Cash ratio", equityRatio: "Equity ratio",
    debtToAssets: "Debt / assets", netMargin: "Net margin", roa: "ROA", assetTurnover: "Asset turnover",
    receivablesToRevenue: "Receivables / revenue", inventoryToRevenue: "Inventories / revenue",
    revenueGrowth: "Revenue growth", debtChange: "Change in debt / assets", logAssets: "Size (log assets)",
  },
};
const fLabel = (k) => FEATURE_LABELS[ro() ? "ro" : "en"][k] || k;

const state = {
  meta: null, F: null, labels: null, div: null, band: null, cui: null, refPd: null,
  label: 4, use: null, l2: 0.003, sector: 0, model: null, res: null, company: null, training: false,
};

// ------------------------------------------------------------------ data
async function loadSample() {
  const meta = await loadJson("./data/train_meta.json");
  const buf = await loadGzBuffer("./data/train.bin.gz");
  const n = meta.n,
    nf12 = meta.features.length,
    nl = meta.labels.length;
  let off = 0;
  const q = new Uint16Array(buf, off, n * nf12);
  off += n * nf12 * 2;
  const bits = new Uint8Array(buf, off, n);
  off += n;
  const div = new Int16Array(buf, off, n);
  off += n * 2;
  const band = new Uint8Array(buf, off, n);
  off += n;
  const cui = new Int32Array(buf, off, n);
  off += n * 4;
  const ref = new Uint16Array(buf, off, n * nl);
  // de-quantise features back to their winsorised values
  const F = new Float64Array(n * nf12);
  for (let j = 0; j < nf12; j++) {
    const lo = meta.lo[j],
      span = meta.hi[j] - meta.lo[j];
    for (let i = 0; i < n; i++) F[i * nf12 + j] = lo + (q[i * nf12 + j] / 65535) * span;
  }
  const labels = [];
  for (let li = 0; li < nl; li++) {
    const a = new Uint8Array(n);
    for (let i = 0; i < n; i++) a[i] = (bits[i] >> li) & 1;
    labels.push(a);
  }
  const refPd = [];
  for (let li = 0; li < nl; li++) {
    const a = new Float64Array(n);
    for (let i = 0; i < n; i++) a[i] = ref[i * nl + li] / 65535;
    refPd.push(a);
  }
  state.meta = meta;
  state.F = F;
  state.labels = labels;
  state.div = div;
  state.band = band;
  state.cui = cui;
  state.refPd = refPd;
  state.use = meta.features.map(() => true);
}

// ------------------------------------------------------------------ training
function rowsForSector() {
  const n = state.meta.n;
  if (!state.sector) return null; // all rows
  const out = [];
  for (let i = 0; i < n; i++) if (state.div[i] === state.sector) out.push(i);
  return out;
}

function train() {
  const meta = state.meta,
    nF = meta.features.length;
  const sel = [];
  state.use.forEach((u, j) => u && sel.push(j));
  if (sel.length < 2) {
    toast(t("m.warn.fewFeat"));
    return;
  }
  const rows = rowsForSector();
  const all = rows || Array.from({ length: meta.n }, (_, i) => i);
  const y = state.labels[state.label];
  const tr = [],
    ho = [];
  for (let k = 0; k < all.length; k++) (k % 10 < 7 ? tr : ho).push(all[k]);
  const k = sel.length;
  // standardise on training rows
  const mu = new Float64Array(k),
    sd = new Float64Array(k);
  for (let j = 0; j < k; j++) {
    let s = 0;
    for (const i of tr) s += state.F[i * nF + sel[j]];
    mu[j] = s / tr.length;
    let v = 0;
    for (const i of tr) {
      const d = state.F[i * nF + sel[j]] - mu[j];
      v += d * d;
    }
    sd[j] = Math.sqrt(v / tr.length) || 1;
  }
  const build = (idx) => {
    const X = new Float64Array(idx.length * k);
    const yy = new Float64Array(idx.length);
    idx.forEach((i, r) => {
      for (let j = 0; j < k; j++) X[r * k + j] = (state.F[i * nF + sel[j]] - mu[j]) / sd[j];
      yy[r] = y[i];
    });
    return { X, y: yy };
  };
  const A = build(tr),
    B = build(ho);
  const model = trainLogit(A.X, A.y, k, { l2: state.l2, iters: 220, lr: 0.9 });
  const pTr = predictLogit(model, A.X, k, tr.length);
  const pHo = predictLogit(model, B.X, k, ho.length);
  const refHo = ho.map((i) => state.refPd[state.label][i]);
  const yHo = Array.from(B.y);
  state.model = { ...model, sel, mu, sd, k };
  state.res = {
    aucTrain: auc(Array.from(pTr), Array.from(A.y)),
    aucHold: auc(Array.from(pHo), yHo),
    aucRef: auc(refHo, yHo),
    roc: rocCurve(Array.from(pHo), yHo),
    rocRef: rocCurve(refHo, yHo),
    calib: decileCalibration(Array.from(pHo), yHo),
    nTrain: tr.length,
    nHold: ho.length,
    rate: yHo.reduce((a, b) => a + b, 0) / yHo.length,
    pHoldSorted: Array.from(pHo).sort((a, b) => a - b),
    pMean: Array.from(pHo).reduce((a, b) => a + b, 0) / pHo.length,
  };
}

// ------------------------------------------------------------------ company features
const R = (row, i) => (row && row[i] != null ? Number(row[i]) : 0);
function companyFeatures(ds) {
  const y = ds.years;
  const y24 = y.includes(2024) ? ds.raw[2024] : null;
  const y23 = y.includes(2023) ? ds.raw[2023] : null;
  if (!y24) return null;
  const ta = (r) => R(r, 0) + R(r, 1) + R(r, 5);
  const net = (r) => R(r, 17) - R(r, 18);
  const d = (a, b) => (b === 0 || !isFinite(a / b) ? null : a / b);
  const ta24 = ta(y24),
    rev24 = R(y24, 12),
    rev23 = y23 ? R(y23, 12) : null;
  const v = {
    currentRatio: d(R(y24, 1), R(y24, 6)),
    cashRatio: d(R(y24, 4), R(y24, 6)),
    equityRatio: d(R(y24, 9), ta24),
    debtToAssets: d(R(y24, 6), ta24),
    netMargin: d(net(y24), rev24),
    roa: d(net(y24), ta24),
    assetTurnover: d(rev24, ta24),
    receivablesToRevenue: d(R(y24, 3), rev24),
    inventoryToRevenue: d(R(y24, 2), rev24),
    revenueGrowth: y23 && rev23 ? d(rev24 - rev23, Math.abs(rev23)) : null,
    debtChange: y23 ? d(R(y24, 6) - R(y23, 6), Math.max(ta(y23), 1)) : null,
    logAssets: Math.log10(Math.max(ta24, 1)),
  };
  return v;
}

function applyModel(vals) {
  const { sel, mu, sd, k, w, b } = state.model;
  const meta = state.meta;
  let z = b;
  const contrib = [];
  for (let j = 0; j < k; j++) {
    const key = meta.features[sel[j]];
    let x = vals[key];
    if (!isNum(x)) return null;
    x = Math.min(Math.max(x, meta.lo[sel[j]]), meta.hi[sel[j]]);
    const zz = (x - mu[j]) / sd[j];
    z += w[j] * zz;
    contrib.push({ key, value: x, z: zz, c: w[j] * zz });
  }
  return { pd: 1 / (1 + Math.exp(-z)), contrib };
}

// ------------------------------------------------------------------ render
function labelPanel() {
  const meta = state.meta;
  const cards = meta.labels
    .map((L, i) => {
      const rate = meta.rates[L];
      const cnt = Math.round(rate * meta.n);
      return `<label class="feature-option${state.label === i ? " is-active" : ""}">
        <input type="radio" name="label" value="${i}"${state.label === i ? " checked" : ""} />
        <span>
          <strong>${esc(t("m.label." + L))}</strong>
          <small>${esc(t("m.label." + L + ".d"))}</small>
          <span class="inline-badge">${esc(t("m.label.rate"))}: <strong>${nf(100 * rate, 2)} %</strong> · ${nf(cnt)} ${esc(t("m.label.count"))}</span>
        </span>
      </label>`;
    })
    .join("");
  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("m.label.kicker"))}</p><h2>${esc(t("m.label.title"))}</h2><p class="chart-caption">${esc(t("m.label.help"))}</p></div>
      <span class="status-pill">${esc(t("m.dataPill"))}</span></div>
    <div class="feature-list">${cards}</div>
  </section>`;
}

function corrPairs() {
  // correlation between selected features, on a 12k subsample for speed
  const meta = state.meta,
    nF = meta.features.length;
  const sel = [];
  state.use.forEach((u, j) => u && sel.push(j));
  const step = Math.max(1, Math.floor(meta.n / 12000));
  const idx = [];
  for (let i = 0; i < meta.n; i += step) idx.push(i);
  const k = sel.length;
  const mu = new Float64Array(k),
    sd = new Float64Array(k);
  for (let j = 0; j < k; j++) {
    let s = 0;
    for (const i of idx) s += state.F[i * nF + sel[j]];
    mu[j] = s / idx.length;
    let v = 0;
    for (const i of idx) {
      const d = state.F[i * nF + sel[j]] - mu[j];
      v += d * d;
    }
    sd[j] = Math.sqrt(v / idx.length) || 1;
  }
  const out = [];
  for (let a = 0; a < k; a++)
    for (let b = a + 1; b < k; b++) {
      let c = 0;
      for (const i of idx) c += ((state.F[i * nF + sel[a]] - mu[a]) / sd[a]) * ((state.F[i * nF + sel[b]] - mu[b]) / sd[b]);
      c /= idx.length;
      if (Math.abs(c) >= 0.8) out.push([meta.features[sel[a]], meta.features[sel[b]], c]);
    }
  return out;
}

function featurePanel() {
  const meta = state.meta;
  const boxes = meta.features
    .map(
      (k, j) => `<label class="check-row"><input type="checkbox" data-feat="${j}"${state.use[j] ? " checked" : ""} /><span>${esc(fLabel(k))}</span></label>`
    )
    .join("");
  const pairs = corrPairs();
  const warn = pairs.length
    ? `${esc(t("m.feat.corrWarn"))} ${pairs.map(([a, b, c]) => `${esc(fLabel(a))} ↔ ${esc(fLabel(b))} (${nf(c, 2)})`).join("; ")}`
    : esc(t("m.feat.noCorr"));
  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("m.feat.kicker"))}</p><h3>${esc(t("m.feat.title"))}</h3><p class="chart-caption">${esc(t("m.feat.help"))}</p></div>
      <div class="button-row">
        <button class="ghost-button small-button" id="feat-all" type="button">${esc(t("m.feat.all"))}</button>
        <button class="ghost-button small-button" id="feat-sc" type="button">${esc(t("m.feat.scorecard"))}</button>
      </div></div>
    <div class="qual-grid">${boxes}</div>
    <p class="chart-caption">${warn}</p>
  </section>`;
}

function trainPanel() {
  const meta = state.meta;
  const divs = Object.keys(CAEN_DIV)
    .map(Number)
    .sort((a, b) => a - b);
  const sectorSel = `<select class="field-input" id="sector-select"><option value="0">${esc(t("m.train.allSectors"))}</option>${divs
    .map((d) => `<option value="${d}"${state.sector === d ? " selected" : ""}>${esc(divName(d))}</option>`)
    .join("")}</select>`;
  const res = state.res;
  const leak =
    meta.labels[state.label] === "twoYearLoss" && (state.use[4] || state.use[5])
      ? `<div class="callout-card"><strong>${esc(t("m.warn.leak.title"))}</strong><p>${esc(t("m.warn.leak"))}</p></div>`
      : "";
  const kpis = res
    ? `<div class="score-hero">
        <article class="kpi-tile"><span class="metric-label">${esc(t("m.auc"))}</span><span class="score-big">${nf(res.aucHold, 3)}</span>${meter(res.aucHold ?? 0.5, 0.5, 1, res.aucHold > 0.8 ? "good" : res.aucHold > 0.65 ? "watch" : "weak")}</article>
        <article class="kpi-tile"><span class="metric-label">${esc(t("m.auc.ref"))}</span><span class="score-big">${nf(res.aucRef, 3)}</span><span class="kpi-delta">${esc(t("m.auc.train"))}: ${nf(res.aucTrain, 3)} · ${esc(t("m.auc.gap"))}: ${nf(res.aucTrain - res.aucHold, 3)}</span></article>
        <article class="kpi-tile"><span class="metric-label">${esc(t("m.label.rate"))}</span><span class="score-big">${nf(100 * res.rate, 2)} %</span><span class="kpi-delta">${nf(res.nTrain)} + ${nf(res.nHold)} ${ro() ? "firme (antrenare + holdout)" : "companies (train + holdout)"}</span></article>
      </div>`
    : "";
  const roc = res
    ? `<div class="line-chart"><div class="legend-row">
        <span class="legend-chip" style="--legend-color:${PALETTE[0]}">${esc(ro() ? "modelul tău" : "your model")} · AUC ${nf(res.aucHold, 3)}</span>
        <span class="legend-chip" style="--legend-color:${PALETTE[2]}">${esc(ro() ? "model neliniar (referință)" : "non-linear (reference)")} · AUC ${nf(res.aucRef, 3)}</span>
      </div>${rocChart([
        { points: res.roc, color: PALETTE[0], width: 2.6 },
        { points: res.rocRef, color: PALETTE[2], width: 2, dash: "6 4" },
      ], { aria: "ROC" })}<p class="chart-caption">${esc(t("m.roc.title"))} · ${ro() ? "rata de alarme false (orizontal) față de rata de evenimente prinse (vertical)" : "false-positive rate (x) against true-positive rate (y)"}</p></div>`
    : "";
  const coefRows = state.model
    ? state.model.sel
        .map((j, i) => {
          const key = meta.features[j];
          const c = state.model.w[i];
          const max = Math.max(...state.model.w.map(Math.abs)) || 1;
          const exp = EXPECTED_SIGN[key];
          const bad = exp !== 0 && Math.sign(c) !== Math.sign(exp) && Math.abs(c) > 0.005;
          return `<div class="woe-row">
            <div class="woe-header"><strong>${esc(fLabel(key))}</strong><span>${c > 0 ? "+" : ""}${nf(c, 3)} · ${esc(c > 0 ? t("m.coef.riskUp") : t("m.coef.riskDown"))}${bad ? ` · <span style="color:#b0491b">⚠ ${esc(t("m.coef.warn"))}</span>` : ""}</span></div>
            <div class="woe-track"><div class="woe-fill ${c > 0 ? "is-positive" : "is-negative"}" style="${c > 0 ? `left:50%;width:${(Math.abs(c) / max) * 50}%` : `right:50%;width:${(Math.abs(c) / max) * 50}%`}"></div></div>
          </div>`;
        })
        .join("")
    : "";
  const calib = res
    ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>${esc(t("m.calib.decile"))}</th><th class="num">${esc(t("m.calib.predicted"))}</th><th class="num">${esc(t("m.calib.observed"))}</th><th class="num">${esc(t("m.calib.n"))}</th></tr></thead><tbody>${res.calib
        .map(
          (d) =>
            `<tr><td>${d.decile}</td><td class="num">${nf(100 * d.predicted, 2)} %</td><td class="num">${nf(100 * d.observed, 2)} %</td><td class="num">${nf(d.n)}</td></tr>`
        )
        .join("")}</tbody></table></div>
      ${pairedColumns(
        res.calib.map((d) => String(d.decile)),
        res.calib.map((d) => d.observed),
        res.calib.map((d) => d.predicted),
        { aria: "calibration", height: 240 }
      )}
      <div class="legend-row"><span class="legend-chip" style="--legend-color:${PALETTE[0]}">${esc(t("m.calib.observed"))}</span><span class="legend-chip" style="--legend-color:${PALETTE[2]}">${esc(t("m.calib.predicted"))}</span></div>
      <p class="chart-caption">${esc(t("m.calib.help"))}</p>`
    : "";

  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("m.train.kicker"))}</p><h2>${esc(t("m.train.title"))}</h2><p class="chart-caption">${esc(t("m.train.help"))}</p></div>
      <div class="button-row"><button class="primary-button" id="train-button" type="button">${esc(state.res ? t("m.train.retrain") : t("m.train.button"))}</button>${state.res ? `<button class="ghost-button small-button" id="export-button" type="button">${esc(t("m.export"))}</button>` : ""}</div></div>
    ${leak}
    <div class="panel-subgrid two-up">
      <label class="field-card"><span class="field-label">${esc(t("m.train.sector"))}</span>${sectorSel}</label>
      <label class="field-card"><span class="field-label">${esc(t("m.train.reg"))}: <strong id="l2-label">${nf(state.l2, 3)}</strong></span><input type="range" id="l2-range" min="0" max="100" step="1" value="${Math.round(Math.sqrt(state.l2 / 0.3) * 100)}" /></label>
    </div>
    ${kpis}
    ${res ? `<div class="dash-grid"><section class="panel-section">${roc}</section><section class="panel-section"><h3>${esc(t("m.coef.title"))}</h3><div class="woe-list">${coefRows}</div></section></div>` : ""}
    ${res ? `<section class="panel-section"><h3>${esc(t("m.calib.title"))}</h3>${calib}</section>` : ""}
  </section>`;
}

function applyPanel() {
  const ds = state.company;
  let body = `<p class="chart-caption">${esc(t(state.model ? "m.apply.needCompany" : "m.apply.needTrain"))}</p>`;
  if (ds && state.model) {
    const vals = companyFeatures(ds);
    const r = vals ? applyModel(vals) : null;
    if (!r) {
      body = `<p class="chart-caption">${esc(ro() ? "Compania nu are date complete pentru 2023 și 2024, deci modelul nu poate fi aplicat." : "This company lacks complete 2023 and 2024 data, so the model cannot be applied.")}</p>`;
    } else {
      const pct = 100 * (state.res.pHoldSorted.filter((p) => p < r.pd).length / state.res.pHoldSorted.length);
      const maxC = Math.max(...r.contrib.map((c) => Math.abs(c.c))) || 1;
      const bars = r.contrib
        .slice()
        .sort((a, b) => Math.abs(b.c) - Math.abs(a.c))
        .map(
          (c) => `<div class="woe-row">
            <div class="woe-header"><strong>${esc(fLabel(c.key))}</strong><span>${nf(c.value, 2)} · ${c.c > 0 ? "+" : ""}${nf(c.c, 2)}</span></div>
            <div class="woe-track"><div class="woe-fill ${c.c > 0 ? "is-positive" : "is-negative"}" style="${c.c > 0 ? `left:50%;width:${(Math.abs(c.c) / maxC) * 50}%` : `right:50%;width:${(Math.abs(c.c) / maxC) * 50}%`}"></div></div>
          </div>`
        )
        .join("");
      body = `<div class="score-hero">
          <article class="kpi-tile"><span class="metric-label">${esc(t("m.apply.pd"))}</span><span class="score-big">${nf(100 * r.pd, 2)} %</span><span class="kpi-delta">${esc(t("m.apply.pct"))}: ${nf(pct, 0)} · ${esc(t("m.apply.avg"))}: ${nf(100 * state.res.pMean, 2)} %</span></article>
          <article class="kpi-tile"><span class="metric-label">${esc(t("m.apply.pdRef"))}</span><span class="score-big">${state.refValue == null ? "—" : nf(100 * state.refValue, 2) + " %"}</span><span class="kpi-delta">${state.refValue == null ? esc(t("m.apply.noRef")) : esc(ro() ? "model neliniar bagged, antrenat în afara eșantionului" : "bagged non-linear model, trained out of sample")}</span></article>
          <article class="kpi-tile"><span class="metric-label">${esc(t("ent.sector"))}</span><span><strong>${esc(divName(divOf(ds.caen)))}</strong></span><span class="kpi-delta">${esc(ds.company || "")}</span></article>
        </div>
        <section class="panel-section"><h3>${esc(t("m.apply.contrib"))}</h3><div class="woe-list">${bars}</div>
        <p class="chart-caption">${esc(ro() ? "Contribuția este coeficientul înmulțit cu valoarea standardizată a variabilei; suma lor plus interceptul dă scorul din care rezultă PD-ul." : "A contribution is the coefficient times the standardised variable value; their sum plus the intercept is the score behind the PD.")}</p></section>`;
    }
  }
  return `<section class="card panel-card">
    <div class="section-heading"><div><p class="section-kicker">${esc(t("m.apply.kicker"))}</p><h2>${esc(t("m.apply.title"))}</h2><p class="chart-caption">${esc(t("m.apply.help"))}</p></div>
      <span class="status-pill" id="entry-status" data-i18n="status.waiting"></span></div>
    <div class="panel-subgrid two-up">
      <label class="field-card" for="cui-input"><span class="field-label">${esc(t("entry.cui.label"))}</span>
        <div class="cui-row"><input class="field-input" id="cui-input" type="text" inputmode="numeric" value="${esc(state.company ? state.company.cui : "")}" placeholder="${esc(t("entry.cui.placeholder"))}" /><button class="primary-button" id="cui-button" type="button">${esc(t("entry.cui.button"))}</button></div>
        <small>${esc(t("ent.help"))}</small></label>
      <label class="field-card" for="demo-select"><span class="field-label">${esc(t("entry.demo.label"))}</span><select class="field-input" id="demo-select"></select></label>
    </div>
    ${body}
  </section>`;
}

// reference PD lookup (sorted CUI table)
let refTable = null;
async function loadRef() {
  if (refTable) return refTable;
  const meta = await loadJson("./data/refpd_meta.json");
  const buf = await loadGzBuffer("./data/refpd.bin.gz");
  const cui = new Int32Array(buf, 0, meta.n);
  const pd = new Uint16Array(buf, meta.n * 4, meta.n * meta.labels.length);
  refTable = { meta, cui, pd };
  return refTable;
}
function findCui(c) {
  if (!refTable) return -1;
  const a = refTable.cui;
  let lo = 0,
    hi = a.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] === c) return mid;
    if (a[mid] < c) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

function render() {
  $("workspace").innerHTML = labelPanel() + featurePanel() + trainPanel() + applyPanel();
  applyStaticTranslations();
  $("hero-rate").textContent = nf(100 * state.meta.rates[state.meta.labels[state.label]], 2) + " %";
  $("hero-auc").textContent = state.res ? nf(state.res.aucHold, 3) : "—";
  $("hero-status").textContent = state.res ? t("status.ready") : t("status.waiting");
  if (state.company) {
    const st = $("entry-status");
    if (st) {
      st.textContent = t("ent.loaded");
      st.className = "status-pill good";
      st.removeAttribute("data-i18n");
    }
  }
  wire();
}

function wire() {
  $("workspace")
    .querySelectorAll('input[name="label"]')
    .forEach((r) =>
      r.addEventListener("change", () => {
        state.label = Number(r.value);
        state.res = null;
        state.model = null;
        render();
      })
    );
  $("workspace")
    .querySelectorAll("input[data-feat]")
    .forEach((c) =>
      c.addEventListener("change", () => {
        state.use[Number(c.dataset.feat)] = c.checked;
        state.res = null;
        state.model = null;
        render();
      })
    );
  $("feat-all").addEventListener("click", () => {
    state.use = state.use.map(() => true);
    state.res = null;
    render();
  });
  $("feat-sc").addEventListener("click", () => {
    state.use = state.meta.features.map((k) => SCORECARD_FEATURES.includes(k));
    state.res = null;
    render();
  });
  $("sector-select").addEventListener("change", (e) => {
    state.sector = Number(e.target.value);
    state.res = null;
    render();
  });
  const l2r = $("l2-range");
  l2r.addEventListener("input", (e) => {
    state.l2 = 0.3 * Math.pow(Number(e.target.value) / 100, 2);
    $("l2-label").textContent = nf(state.l2, 3);
  });
  $("train-button").addEventListener("click", () => {
    const btn = $("train-button");
    btn.textContent = t("m.train.training");
    btn.disabled = true;
    setTimeout(() => {
      try {
        train();
      } catch (e) {
        toast(String(e.message || e));
      }
      render();
      if (state.company) refreshCompany();
    }, 30);
  });
  const ex = $("export-button");
  if (ex)
    ex.addEventListener("click", () => {
      const meta = state.meta,
        res = state.res;
      const lines = [
        `# ${ro() ? "Laboratorul de model" : "Model lab"}`,
        `${ro() ? "etichetă" : "label"};${meta.labels[state.label]}`,
        `${ro() ? "rata evenimentului" : "event rate"};${(100 * res.rate).toFixed(2)}%`,
        `${ro() ? "sector" : "sector"};${state.sector ? divName(state.sector) : t("m.train.allSectors")}`,
        `AUC holdout;${res.aucHold.toFixed(4)}`,
        `AUC ${ro() ? "antrenare" : "train"};${res.aucTrain.toFixed(4)}`,
        `AUC ${ro() ? "referință" : "reference"};${res.aucRef.toFixed(4)}`,
        "",
        `${ro() ? "variabilă" : "variable"};${ro() ? "coeficient" : "coefficient"}`,
        ...state.model.sel.map((j, i) => `${meta.features[j]};${state.model.w[i].toFixed(4)}`),
        "",
        `${ro() ? "decilă" : "decile"};${ro() ? "prezis" : "predicted"};${ro() ? "observat" : "observed"};n`,
        ...res.calib.map((d) => `${d.decile};${(100 * d.predicted).toFixed(2)}%;${(100 * d.observed).toFixed(2)}%;${d.n}`),
      ];
      downloadText(`model_${meta.labels[state.label]}.csv`, lines.join("\n"));
    });
  wireCompanyEntry(async (ds) => {
    state.company = ds;
    await refreshCompany();
  });
}

async function refreshCompany() {
  state.refValue = null;
  try {
    await loadRef();
    const i = findCui(Number(state.company.cui));
    if (i >= 0) state.refValue = refTable.pd[i * refTable.meta.labels.length + state.label] / 65535;
  } catch (e) {
    /* reference table optional */
  }
  render();
}

// ------------------------------------------------------------------ boot
renderAdvShell("model");
(async () => {
  try {
    await loadSample();
    render();
  } catch (e) {
    $("workspace").innerHTML = `<section class="card panel-card"><div class="empty-state"><strong>${esc(t("m.eyebrow"))}</strong><p>${esc(String(e.message || e))}</p></div></section>`;
  }
})();
document.addEventListener("langchange", () => state.meta && render());
