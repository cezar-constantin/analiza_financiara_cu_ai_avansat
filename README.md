# Analiză financiară și instrumente AI — nivel avansat

Trei instrumente didactice construite pe **populația** de situații financiare depuse la Ministerul
Finanțelor (1.122.150 de firme, exercițiile 2023–2025), nu pe o singură companie. Tot calculul rulează
în browser; nimic nu se trimite pe server. Interfață RO/EN.

Live: https://cezar-constantin.github.io/analiza_financiara_cu_ai_avansat/

| Instrument | Ce face |
|---|---|
| `model.html` — laboratorul de model | Participantul alege definiția evenimentului de risc, alege variabilele și antrenează în browser o regresie logistică pe un eșantion de 120.000 de firme reale: AUC, curbă ROC, coeficienți cu avertisment de semn contraintuitiv, calibrare pe decile. Apoi aplică modelul pe o companie căutată după CUI, alături de un model neliniar de referință. |
| `sector.html` — percentile pe sector | Pentru orice CUI: percentila fiecărei rate în diviziunea CAEN și banda de mărime, distribuția grupului de referință, migrația percentilelor pe trei ani și un explorator care arată ce procent din fiecare sector trece pragurile alese. |
| `anomalii.html` — laboratorul de anomalii | Două lentile: verificări de plauzibilitate pe firma căutată, fiecare afișată alături de frecvența ei în populație și de explicația cea mai probabilă; și corelații & anomalii — radarul de corelații al sectorului (Pearson și Spearman), apoi cele trei niveluri de detecție din curs: praguri simple pe DSO, DIO, ciclu operațional și marjă, deviații statistice (z-score și regula IQR) față de grupul de referință, anomalii pe relații (reziduuri log-log: stoc, creanțe, datorii, numerar și personal față de cifra de afaceri) și un scor de anomalii 0–100 cu primele trei contribuții. |

## Date

Fișierele derivate din `data/` (6,6 MB în total) sunt precalculate cu scripturile din `scripts/`:

| Fișier | Conținut |
|---|---|
| `train.bin.gz` + `train_meta.json` | eșantion de antrenare: 120.000 de firme × 12 variabile (cuantificate pe 16 biți) + 5 etichete + scorurile modelului de referință |
| `refpd.bin.gz` + `refpd_meta.json` | PD-ul modelului de referință pentru 147.699 de firme cu cifră de afaceri peste 1 mil. lei, indexat după CUI |
| `percentiles.json.gz` | 1.013 celule sector × bandă de mărime × an, 10 rate, 21 de percentile |
| `anomalies.json.gz` | frecvențele verificărilor de plauzibilitate în populație; conține și agregate pentru histograma rezultatului la zero și pentru testul Benford, rămase din versiunea anterioară a instrumentului și nefolosite acum |
| `correlations.json.gz` | pe diviziune CAEN și an: matricea de corelații a celor 10 rate (Pearson și Spearman, winsorizate la 1/99), distribuția indicatorilor de anomalie (medie, abatere standard, cuartile) pe diviziune și pe diviziune × bandă de mărime, și relațiile de nivel log-log (pantă, intercept, abaterea reziduurilor) pentru cele cinci mărimi verificate |

**Situațiile financiare pe companie** nu sunt duplicate în acest repo: aplicația citește indexul de CUI
(1.000 de shard-uri, 124 MB) direct din repo-ul nivelului începător,
[`analiza_financiara_cu_ai`](https://github.com/cezar-constantin/analiza_financiara_cu_ai), prin
`raw.githubusercontent.com` (care trimite antetul CORS necesar), cu jsDelivr ca rezervă. Dacă vrei ca
aplicația să fie complet autonomă, copiază `data/manifest.json` și `data/idx/` din celălalt repo aici —
codul verifică întâi calea locală.

## Metodologie și limite

Variabilele modelului se calculează din exercițiul **2024** plus dinamica 2023 → 2024; evenimentul se
observă în **2025**. Nu există suprapunere între fereastra variabilelor și fereastra evenimentului.

Datele publice nu conțin istoric de default, deci evenimentul este un indicator indirect construit din
date contabile; PD-urile afișate nu sunt comparabile cu cele ale unui model intern de bancă. Lipsesc de
asemenea scadența datoriilor, dobânzile și EBITDA, deci acoperirea serviciului datoriei — cea mai
predictivă variabilă într-o bancă — nu poate fi calculată în niciunul din instrumente. O deviere
statistică din laboratorul de anomalii nu indică nici fraudă, nici eroare.

## Structură

```
index.html  model.html  sector.html  anomalii.html
adv.js          – i18n, shell, citirea indexului, antrenarea în browser, graficele SVG
model.js  sector.js  anomalii.js
common.js  styles.css  – preluate din aplicația de nivel începător, ca aspectul să fie identic
data/           – seturile derivate (vezi tabelul de mai sus)
scripts/        – generarea seturilor derivate din indexul complet
```

*Material didactic, necomercial. Sursa datelor: Ministerul Finanțelor · data.gov.ro · situații
financiare anuale (CC-BY 4.0). Nu constituie o evaluare de credit.*
