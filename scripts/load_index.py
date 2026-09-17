"""Parse the 1000 CUI-index shards into compact numpy arrays and cache them."""
import glob, gzip, json, os
import numpy as np

OUT = "/home/claude/adv/cache"
os.makedirs(OUT, exist_ok=True)

cuis, caens, names, rows = [], [], [], []
files = sorted(glob.glob("/home/claude/adv/idx/*.json.gz"))
for n, f in enumerate(files):
    with gzip.open(f, "rt", encoding="utf-8") as fh:
        d = json.load(fh)
    for cui, rec in d.items():
        name, caen, years = rec[0], rec[1], rec[2]
        cuis.append(int(cui))
        names.append(name or "")
        try:
            caens.append(int(caen))
        except (TypeError, ValueError):
            caens.append(-1)
        flat = []
        for y in years or []:
            if y is None:
                flat.extend([np.nan] * 20)
            else:
                flat.extend([np.nan if v is None else v for v in y])
        # pad to 3 years x 20 fields
        while len(flat) < 60:
            flat.append(np.nan)
        rows.append(flat[:60])
    if n % 200 == 0:
        print(n, len(cuis), flush=True)

cui = np.array(cuis, dtype=np.int64)
caen = np.array(caens, dtype=np.int32)
vals = np.array(rows, dtype=np.float32).reshape(-1, 3, 20)
np.save(f"{OUT}/cui.npy", cui)
np.save(f"{OUT}/caen.npy", caen)
np.save(f"{OUT}/vals.npy", vals)
with open(f"{OUT}/names.txt", "w", encoding="utf-8") as fh:
    fh.write("\n".join(names))
print("firms", len(cui), "vals", vals.shape, "bytes", vals.nbytes)
print("years present per firm:", np.bincount((~np.isnan(vals[:, :, 12])).sum(1)))
