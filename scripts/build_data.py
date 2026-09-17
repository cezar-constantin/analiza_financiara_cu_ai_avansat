"""Build every derived dataset the advanced app ships.

Outputs into /home/claude/advapp/data:
  train.bin.gz / train_meta.json   – delivered training sample (uint16-quantised features + labels)
  refpd.bin.gz / refpd_meta.json   – reference (bagged GBM) PD per firm, for companies with revenue >= 1 mn lei
  percentiles.json.gz              – ratio percentiles per CAEN division x size band x year
  anomalies.json.gz                – zero-discontinuity histograms, Benford digit counts, plausibility checks
  outliers.json.gz                 – top atypical profiles per division (CUI only, no names)
"""
import gzip, json, os, time
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier

t0 = time.time()
C = "/home/claude/adv/cache"
OUT = "/home/claude/advapp/data"
os.makedirs(OUT, exist_ok=True)
vals = np.load(f"{C}/vals.npy"); caen = np.load(f"{C}/caen.npy"); cui = np.load(f"{C}/cui.npy")
N = len(cui)
FIX, CUR, INV, REC, CASH, PRE, DEBT, DEF, PROV, EQ, SHC, _PR, REV, TI, TE, GP, GL, NP, NL, EMP = range(20)
YEARS = [2023, 2024, 2025]
nz = lambda a: np.nan_to_num(a, nan=0.0)
eps = 1e-9
ratio = lambda a, b: a / np.where(np.abs(b) < eps, np.nan, b)
div = np.where(caen > 0, caen // 100, -1)
g = lambda y, i: nz(vals[:, y, i])
filed = ~np.isnan(vals[:, :, [FIX, CUR, EQ, DEBT, TI, TE]]).all(axis=2)
ta = np.stack([g(y, FIX) + g(y, CUR) + g(y, PRE) for y in range(3)], 1)
net = np.stack([g(y, NP) - g(y, NL) for y in range(3)], 1)
eqt = np.stack([g(y, EQ) for y in range(3)], 1)
rev = np.stack([g(y, REV) for y in range(3)], 1)


def band_of(r):
    b = np.full(len(r), -1, np.int8)
    for i, (lo, hi) in enumerate([(0, 2e6), (2e6, 10e6), (10e6, 50e6), (50e6, 1e18)]):
        b[(r >= lo) & (r < hi)] = i
    return b


# ----------------------------------------------------------------- 1. model dataset
FEATURES = ["currentRatio", "cashRatio", "equityRatio", "debtToAssets", "netMargin", "roa",
            "assetTurnover", "receivablesToRevenue", "inventoryToRevenue", "revenueGrowth",
            "debtChange", "logAssets"]
feat = np.column_stack([
    ratio(g(1, CUR), g(1, DEBT)),
    ratio(g(1, CASH), g(1, DEBT)),
    ratio(eqt[:, 1], ta[:, 1]),
    ratio(g(1, DEBT), ta[:, 1]),
    ratio(net[:, 1], rev[:, 1]),
    ratio(net[:, 1], ta[:, 1]),
    ratio(rev[:, 1], ta[:, 1]),
    ratio(g(1, REC), rev[:, 1]),
    ratio(g(1, INV), rev[:, 1]),
    ratio(rev[:, 1] - rev[:, 0], np.abs(rev[:, 0])),
    ratio(g(1, DEBT) - g(0, DEBT), np.maximum(ta[:, 0], 1)),
    np.log10(np.maximum(ta[:, 1], 1)),
])
base = filed[:, 0] & filed[:, 1] & (ta[:, 1] >= 50_000) & (rev[:, 1] > 0)
LABELS = ["stoppedFiling", "negativeEquity", "twoYearLoss", "equityWipe", "composite"]
lab = np.column_stack([
    base & ~filed[:, 2],
    base & filed[:, 2] & (eqt[:, 2] < 0) & (eqt[:, 1] >= 0),
    base & filed[:, 2] & (net[:, 1] < 0) & (net[:, 2] < 0),
    base & filed[:, 2] & (net[:, 2] < 0) & (np.abs(net[:, 2]) > 0.5 * np.maximum(eqt[:, 1], 1)),
    np.zeros(N, bool),
])
lab[:, 4] = lab[:, 0] | lab[:, 1] | (lab[:, 2] & (rev[:, 2] < 0.5 * rev[:, 1]) & filed[:, 2])
usable = base & np.isfinite(feat).all(1)
idx_all = np.where(usable)[0]
print(f"[{time.time()-t0:.0f}s] baza modelului: {len(idx_all)} firme, rate:",
      {L: round(100 * lab[idx_all, i].mean(), 2) for i, L in enumerate(LABELS)})

lo = np.percentile(feat[idx_all], 1, axis=0)
hi = np.percentile(feat[idx_all], 99, axis=0)
rng = np.random.default_rng(20260917)
SAMPLE = 120_000
perm = rng.permutation(len(idx_all))
idx_s = np.sort(idx_all[perm[:SAMPLE]])              # delivered sample
idx_pool = idx_all[perm[SAMPLE:]]                    # reference-model training pool (disjoint)
print(f"[{time.time()-t0:.0f}s] eșantion livrat {len(idx_s)}, pool pentru modelul de referință {len(idx_pool)}")

# bagged gradient boosting per label, trained ONLY on the pool -> honest out-of-sample scores
Xpool = np.clip(feat[idx_pool], lo, hi)
ref_sample = np.zeros((len(idx_s), len(LABELS)), np.float32)
lookup = base & (rev[:, 1] >= 1e6) & np.isfinite(feat).all(1)
idx_lookup = np.where(lookup)[0]
ref_lookup = np.zeros((len(idx_lookup), len(LABELS)), np.float32)
Xs = np.clip(feat[idx_s], lo, hi)
Xl = np.clip(feat[idx_lookup], lo, hi)
BAGS = 5
for li, L in enumerate(LABELS):
    ypool = lab[idx_pool, li].astype(int)
    for b in range(BAGS):
        sub = np.random.default_rng(100 + b).choice(len(idx_pool), size=min(250_000, len(idx_pool)), replace=False)
        m = HistGradientBoostingClassifier(max_iter=200, learning_rate=0.08, max_leaf_nodes=24,
                                           random_state=b, early_stopping=False)
        m.fit(Xpool[sub], ypool[sub])
        ref_sample[:, li] += m.predict_proba(Xs)[:, 1] / BAGS
        ref_lookup[:, li] += m.predict_proba(Xl)[:, 1] / BAGS
    print(f"[{time.time()-t0:.0f}s] referință {L}: media PD {100*ref_lookup[:,li].mean():.2f} % pe firmele de lookup")

# pack the delivered sample: uint16 features, uint8 label bitmask, int16 division, uint8 band, int32 cui, uint16 ref PD
q = np.clip(np.round((np.clip(feat[idx_s], lo, hi) - lo) / np.maximum(hi - lo, eps) * 65535), 0, 65535).astype("<u2")
bits = np.zeros(len(idx_s), "<u1")
for li in range(len(LABELS)):
    bits |= (lab[idx_s, li].astype("<u1") << li)
blob = (q.tobytes() + bits.tobytes() + div[idx_s].astype("<i2").tobytes()
        + np.maximum(band_of(rev[:, 1])[idx_s], 0).astype("<u1").tobytes()
        + cui[idx_s].astype("<i4").tobytes()
        + np.round(ref_sample * 65535).astype("<u2").tobytes())
with gzip.GzipFile(f"{OUT}/train.bin.gz", "wb", compresslevel=9, mtime=0) as fh:
    fh.write(blob)
json.dump({"n": len(idx_s), "features": FEATURES, "labels": LABELS,
           "lo": [float(x) for x in lo], "hi": [float(x) for x in hi],
           "layout": ["u2 features n*12", "u1 labelBits n", "i2 caenDiv n", "u1 band n", "i4 cui n", "u2 refPd n*5"],
           "rates": {L: float(lab[idx_s, i].mean()) for i, L in enumerate(LABELS)},
           "population": int(len(idx_all)), "featureYear": 2024, "eventYear": 2025},
          open(f"{OUT}/train_meta.json", "w"), indent=1)
print(f"[{time.time()-t0:.0f}s] train.bin.gz {os.path.getsize(f'{OUT}/train.bin.gz')/1e6:.2f} MB")

# reference PD lookup table, sorted by CUI
order = np.argsort(cui[idx_lookup])
blob = (cui[idx_lookup][order].astype("<i4").tobytes()
        + np.round(ref_lookup[order] * 65535).astype("<u2").tobytes())
with gzip.GzipFile(f"{OUT}/refpd.bin.gz", "wb", compresslevel=9, mtime=0) as fh:
    fh.write(blob)
json.dump({"n": int(len(idx_lookup)), "labels": LABELS, "revenueFloor": 1e6,
           "layout": ["i4 cui n (sorted)", "u2 pd n*5"]}, open(f"{OUT}/refpd_meta.json", "w"), indent=1)
print(f"[{time.time()-t0:.0f}s] refpd.bin.gz {os.path.getsize(f'{OUT}/refpd.bin.gz')/1e6:.2f} MB ({len(idx_lookup)} firme)")

# ----------------------------------------------------------------- 2. sector percentiles
RATIOS = ["currentRatio", "quickRatio", "cashRatio", "equityRatio", "debtToEquity", "netMargin",
          "roa", "assetTurnover", "daysReceivables", "daysInventory"]
PCTS = list(range(0, 101, 5))
cells = {}
for yi, year in enumerate(YEARS):
    tay, revy, nety = ta[:, yi], rev[:, yi], net[:, yi]
    R = {
        "currentRatio": ratio(g(yi, CUR), g(yi, DEBT)),
        "quickRatio": ratio(g(yi, CUR) - g(yi, INV), g(yi, DEBT)),
        "cashRatio": ratio(g(yi, CASH), g(yi, DEBT)),
        "equityRatio": ratio(eqt[:, yi], tay),
        "debtToEquity": ratio(g(yi, DEBT), eqt[:, yi]),
        "netMargin": ratio(nety, revy),
        "roa": ratio(nety, tay),
        "assetTurnover": ratio(revy, tay),
        "daysReceivables": ratio(g(yi, REC), revy) * 365,
        "daysInventory": ratio(g(yi, INV), revy) * 365,
    }
    ok = filed[:, yi] & (tay > 0) & (revy > 0) & (div > 0)
    bnd = band_of(revy)
    for d in np.unique(div[ok]):
        for b in (-1, 0, 1, 2, 3):
            m = ok & (div == d) & (bnd == b if b >= 0 else np.ones(N, bool))
            n = int(m.sum())
            if n < 30:
                continue
            cell = {"n": n, "q": {}}
            for rn in RATIOS:
                v = R[rn][m]
                v = v[np.isfinite(v)]
                if len(v) < 30:
                    continue
                cell["q"][rn] = [round(float(x), 4) for x in np.percentile(v, PCTS)]
            cells[f"{year}:{d}:{b}"] = cell
    # whole-market cells
    for b in (-1, 0, 1, 2, 3):
        m = ok & (bnd == b if b >= 0 else np.ones(N, bool))
        cell = {"n": int(m.sum()), "q": {}}
        for rn in RATIOS:
            v = R[rn][m]
            v = v[np.isfinite(v)]
            cell["q"][rn] = [round(float(x), 4) for x in np.percentile(v, PCTS)]
        cells[f"{year}:0:{b}"] = cell
with gzip.GzipFile(f"{OUT}/percentiles.json.gz", "wb", compresslevel=9, mtime=0) as fh:
    fh.write(json.dumps({"ratios": RATIOS, "pcts": PCTS, "years": YEARS, "cells": cells},
                        separators=(",", ":")).encode())
print(f"[{time.time()-t0:.0f}s] percentiles.json.gz {os.path.getsize(f'{OUT}/percentiles.json.gz')/1e6:.2f} MB, {len(cells)} celule")

# ----------------------------------------------------------------- 3. anomaly aggregates
BEN_FIELDS = [FIX, CUR, INV, REC, CASH, DEBT, EQ, REV, TI, TE]
BEN_NOBIZ = [FIX, CUR, INV, REC, CASH, DEBT, EQ]
BINS = np.arange(-0.20, 0.2001, 0.01)


def zero_hist(mask, yi):
    m = mask & filed[:, yi] & (ta[:, yi] > 100_000) & (rev[:, yi] > 100_000)
    r = net[m, yi] / ta[m, yi]
    r = r[np.isfinite(r)]
    h, _ = np.histogram(r, bins=BINS)
    return {"n": int(len(r)), "h": [int(x) for x in h]}


def digits(mask, yi, fields):
    pool = np.concatenate([vals[mask, yi, i] for i in fields])
    a = np.abs(pool)
    a = a[np.isfinite(a) & (a >= 1000)]
    if len(a) < 2000:
        return None
    d1 = (a / 10 ** np.floor(np.log10(a))).astype(np.int64)
    return {"n": int(len(a)), "d": [int(x) for x in np.bincount(d1, minlength=10)[1:10]]}


anom = {"bins": [round(float(x), 3) for x in BINS], "years": YEARS, "zero": {}, "benford": {}, "checks": {}}
all_mask = np.ones(N, bool)
for yi, year in enumerate(YEARS):
    anom["zero"][f"{year}:all"] = zero_hist(all_mask, yi)
    bnd = band_of(rev[:, yi])
    for b in range(4):
        anom["zero"][f"{year}:b{b}"] = zero_hist(bnd == b, yi)
    for d in np.unique(div[div > 0]):
        if (div == d).sum() < 2000:
            continue
        z = zero_hist(div == d, yi)
        if z["n"] >= 1500:
            anom["zero"][f"{year}:d{d}"] = z
    pop = filed[:, yi] & (ta[:, yi] > 0)
    for tag, flds in (("all", BEN_FIELDS), ("nobiz", BEN_NOBIZ)):
        dd = digits(pop, yi, flds)
        if dd:
            anom["benford"][f"{year}:all:{tag}"] = dd
        for b in range(4):
            dd = digits(pop & (bnd == b), yi, flds)
            if dd:
                anom["benford"][f"{year}:b{b}:{tag}"] = dd
        for d in np.unique(div[div > 0]):
            if (pop & (div == d)).sum() < 300:
                continue
            dd = digits(pop & (div == d), yi, flds)
            if dd:
                anom["benford"][f"{year}:d{d}:{tag}"] = dd

# plausibility checks on 2025
yi = 2
pop = filed[:, yi] & (ta[:, yi] > 0)
tol = lambda b: np.maximum(1000.0, 0.005 * np.abs(b))
checks = {
    "balance": np.abs(ta[:, yi] - (g(yi, EQ) + g(yi, DEBT) + g(yi, DEF) + g(yi, PROV))) > tol(ta[:, yi]),
    "plAccount": np.abs((g(yi, TI) - g(yi, TE)) - (g(yi, GP) - g(yi, GL))) > tol(np.maximum(g(yi, TI), 1)),
    "netAboveGross": ((g(yi, GP) - g(yi, GL)) - (g(yi, NP) - g(yi, NL))) < -tol(np.maximum(np.abs(g(yi, GP)), 1)),
    "componentsExceed": (g(yi, INV) + g(yi, REC) + g(yi, CASH)) > g(yi, CUR) + tol(np.maximum(g(yi, CUR), 1)),
    "impossibleNegative": (g(yi, INV) < 0) | (g(yi, REC) < 0) | (g(yi, CASH) < 0) | (g(yi, FIX) < 0) | (g(yi, DEBT) < 0),
    "revenueNoStaff": (rev[:, yi] > 5e6) & (g(yi, EMP) == 0),
    "bothProfitAndLoss": (g(yi, GP) > 0) & (g(yi, GL) > 0),
}
anom["checks"] = {"pop": int(pop.sum()), "counts": {k: int((pop & v).sum()) for k, v in checks.items()},
                  "any": int((pop & np.logical_or.reduce(list(checks.values()))).sum()),
                  "negativeByField": {nm: int((pop & (g(yi, i) < 0)).sum()) for nm, i in
                                      [("inventories", INV), ("receivables", REC), ("cash", CASH),
                                       ("fixedAssets", FIX), ("liabilities", DEBT)]},
                  "balanceTolerance": {str(t): int((pop & (np.abs(ta[:, yi] - (g(yi, EQ) + g(yi, DEBT) + g(yi, DEF) + g(yi, PROV))) > np.maximum(t, r * np.abs(ta[:, yi])))).sum())
                                       for t, r in [(1.0, 0.0), (100.0, 0.001), (1000.0, 0.005)]}}
rnd = {}
for nm, i in [("revenue", REV), ("fixedAssets", FIX), ("equity", EQ), ("liabilities", DEBT), ("inventories", INV)]:
    a = np.abs(g(yi, i))[pop]
    live = a >= 10_000
    rnd[nm] = {"n": int(live.sum()), "k1000": int((live & (a % 1000 == 0)).sum()),
               "k100000": int((live & (a % 100_000 == 0)).sum())}
anom["round"] = rnd
with gzip.GzipFile(f"{OUT}/anomalies.json.gz", "wb", compresslevel=9, mtime=0) as fh:
    fh.write(json.dumps(anom, separators=(",", ":")).encode())
print(f"[{time.time()-t0:.0f}s] anomalies.json.gz {os.path.getsize(f'{OUT}/anomalies.json.gz')/1e6:.2f} MB")

# ----------------------------------------------------------------- 4. atypical profiles per division
OUT_DIMS = ["currentAssets/TA", "inventories/TA", "receivables/TA", "cash/TA", "liabilities/TA",
            "equity/TA", "revenue/TA", "netMargin", "expenses/income"]
yi = 2
F = np.column_stack([
    ratio(g(yi, CUR), ta[:, yi]), ratio(g(yi, INV), ta[:, yi]), ratio(g(yi, REC), ta[:, yi]),
    ratio(g(yi, CASH), ta[:, yi]), ratio(g(yi, DEBT), ta[:, yi]), ratio(eqt[:, yi], ta[:, yi]),
    ratio(rev[:, yi], ta[:, yi]), ratio(net[:, yi], np.maximum(rev[:, yi], 1)),
    ratio(g(yi, TE), np.maximum(g(yi, TI), 1)),
])
out = {"dims": OUT_DIMS, "year": YEARS[yi], "divisions": {}}
pop = filed[:, yi] & (ta[:, yi] > 0)
for d in np.unique(div[div > 0]):
    m = pop & (div == d) & (rev[:, yi] > 10e6)
    ids = np.where(m)[0]
    if len(ids) < 120:
        continue
    X = F[ids]
    ok = np.isfinite(X).all(1)
    ids, X = ids[ok], X[ok]
    if len(ids) < 120:
        continue
    med = np.median(X, 0)
    mad = np.median(np.abs(X - med), 0) * 1.4826 + eps
    Z = np.clip((X - med) / mad, -50, 50)
    cov = np.cov(Z.T) + np.eye(Z.shape[1]) * 1e-3
    d2 = np.einsum("ij,jk,ik->i", Z, np.linalg.inv(cov), Z)
    top = np.argsort(-d2)[:25]
    out["divisions"][str(int(d))] = {
        "n": int(len(ids)),
        "top": [{"cui": int(cui[ids[k]]), "d2": round(float(d2[k]), 1),
                 "z": [[int(j), round(float(Z[k, j]), 1)] for j in np.argsort(-np.abs(Z[k]))[:3]]} for k in top],
    }
with gzip.GzipFile(f"{OUT}/outliers.json.gz", "wb", compresslevel=9, mtime=0) as fh:
    fh.write(json.dumps(out, separators=(",", ":")).encode())
print(f"[{time.time()-t0:.0f}s] outliers.json.gz {os.path.getsize(f'{OUT}/outliers.json.gz')/1e6:.2f} MB, "
      f"{len(out['divisions'])} diviziuni")
print("TOTAL date:", round(sum(os.path.getsize(f"{OUT}/{f}") for f in os.listdir(OUT)) / 1e6, 2), "MB")
