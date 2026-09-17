# Regenerarea seturilor de date

1. `load_index.py` parsează cele 1.000 de shard-uri `data/idx/*.json.gz` din repo-ul de nivel începător
   în array-uri numpy (cache local).
2. `build_data.py` produce toate fișierele din `data/`: eșantionul de antrenare, PD-urile modelului de
   referință (gradient boosting bagged, antrenat **în afara** eșantionului livrat), tabelele de
   percentile, agregatele de anomalii și profilele atipice.

Necesită `numpy` și `scikit-learn`. Rulare: `python3 load_index.py && python3 build_data.py`.
