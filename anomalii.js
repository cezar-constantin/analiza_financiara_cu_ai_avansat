// Anomaly lab: plausibility, the zero discontinuity, the Benford trap, atypical profiles.
import { t, applyStaticTranslations, escapeHtml as esc } from "./common.js";
import { $, ro, nf, renderAdvShell, wireCompanyEntry, loadGzJson, divName, divOf } from "./adv.js";

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
const state = { A: null, O: null, ds: null, outDiv: 47 };

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
  $("hero-issues").textContent = `${nf(A.checks.any)} · ${nf((100 * A.checks.any) / A.checks.pop, 2)} %`;
  $("workspace").innerHTML = checksPanel() + outlierPanel();
  applyStaticTranslations();

  const od = $("out-div");
  if (od)
    od.addEventListener("change", (e) => {
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
