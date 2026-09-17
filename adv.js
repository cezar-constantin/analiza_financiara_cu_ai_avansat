// Shared module for the advanced level: i18n additions, shell, remote CUI lookup,
// binary dataset loaders, logistic-regression trainer and SVG chart helpers.
// Visual language is inherited unchanged from styles.css / common.js of the beginner app.
import {
  I18N, t, getLang, initLangSwitch, applyStaticTranslations, isNum, fmtRatio, fmtPct, fmtMoney,
  emptyDataset, fromMfpRow, normalizeCui, PALETTE, escapeHtml as esc,
} from "./common.js";

export const CAEN_DIV = {
  1: "Agricultură", 2: "Silvicultură", 3: "Pescuit și acvacultură", 5: "Extracția cărbunelui",
  6: "Extracția petrolului și gazelor", 7: "Extracția minereurilor", 8: "Alte activități extractive",
  9: "Servicii pentru extracție", 10: "Industria alimentară", 11: "Băuturi", 12: "Tutun",
  13: "Textile", 14: "Confecții", 15: "Piele și încălțăminte", 16: "Prelucrarea lemnului",
  17: "Hârtie și carton", 18: "Tipărire", 19: "Prelucrarea produselor petroliere", 20: "Industria chimică",
  21: "Produse farmaceutice", 22: "Cauciuc și mase plastice", 23: "Materiale de construcții",
  24: "Metalurgie", 25: "Construcții metalice", 26: "Calculatoare și produse electronice",
  27: "Echipamente electrice", 28: "Mașini și utilaje", 29: "Autovehicule", 30: "Alte mijloace de transport",
  31: "Mobilă", 32: "Alte industrii prelucrătoare", 33: "Reparații de echipamente",
  35: "Energie electrică, gaze, termoficare", 36: "Captarea și tratarea apei", 37: "Canalizare",
  38: "Colectarea deșeurilor", 39: "Depoluare", 41: "Construcții de clădiri",
  42: "Lucrări de construcții civile", 43: "Lucrări speciale de construcții", 45: "Comerț cu autovehicule",
  46: "Comerț cu ridicata", 47: "Comerț cu amănuntul", 49: "Transporturi terestre",
  50: "Transporturi pe apă", 51: "Transporturi aeriene", 52: "Depozitare și servicii auxiliare",
  53: "Poștă și curierat", 55: "Hoteluri și alte cazări", 56: "Restaurante și alimentație",
  58: "Editare", 59: "Film, video, televiziune", 60: "Radio și televiziune", 61: "Telecomunicații",
  62: "Programare și consultanță IT", 63: "Servicii informatice", 64: "Intermedieri financiare",
  65: "Asigurări", 66: "Activități auxiliare financiare", 68: "Tranzacții imobiliare",
  69: "Activități juridice și de contabilitate", 70: "Consultanță de management",
  71: "Arhitectură și inginerie", 72: "Cercetare-dezvoltare", 73: "Publicitate și studii de piață",
  74: "Alte activități profesionale", 75: "Activități veterinare", 77: "Închirieri și leasing",
  78: "Resurse umane", 79: "Agenții de turism", 80: "Securitate și investigații",
  81: "Servicii pentru clădiri și peisagistică", 82: "Servicii de suport pentru afaceri",
  84: "Administrație publică", 85: "Învățământ", 86: "Sănătate", 87: "Asistență medicală cu cazare",
  88: "Asistență socială fără cazare", 90: "Activități culturale", 91: "Biblioteci și muzee",
  92: "Jocuri de noroc", 93: "Sport și recreere", 94: "Organizații și asociații",
  95: "Reparații de bunuri", 96: "Alte servicii pentru populație",
};

export const BANDS_RO = ["micro (sub 2 mil. lei)", "mică (2–10 mil.)", "medie (10–50 mil.)", "mare (peste 50 mil.)"];
export const BANDS_EN = ["micro (below RON 2m)", "small (2–10m)", "medium (10–50m)", "large (above 50m)"];

// ------------------------------------------------------------------ i18n additions
const RO = {
  "nav.home": "Acasă",
  "nav.model": "Laboratorul de model",
  "nav.sector": "Percentile pe sector",
  "nav.anom": "Laboratorul de anomalii",
  "nav.basic": "Nivelul început",
  "adv.level": "Nivel avansat",
  "adv.populationPill": "1.122.150 de firme · 2023–2025",
  "home.eyebrow": "Analiză financiară și instrumente AI · nivel avansat",
  "home.title": "Trei instrumente construite pe populația de firme, nu pe o singură companie",
  "home.text":
    "La nivelul început analizăm o companie cu praguri alese de noi. Aici referința este întreaga populație de bilanțuri depuse la Ministerul Finanțelor: antrenezi un model de risc pe firme reale, măsori pragurile băncii tale în distribuția sectorului și investighezi comportamentul de raportare. Totul rulează în browser; nimic nu se salvează pe server.",
  "home.pick": "Alege un instrument",
  "home.model.title": "Laboratorul de model",
  "home.model.text":
    "Alegi definiția evenimentului de risc, alegi variabilele, antrenezi o regresie logistică pe 120.000 de firme reale și primești AUC, curba ROC, coeficienți și calibrare. Apoi aplici modelul pe o companie, după CUI.",
  "home.sector.title": "Percentile pe sector",
  "home.sector.text":
    "Pentru orice CUI: în ce percentilă a sectorului și a benzii de mărime cade fiecare rată, cum s-a mișcat în trei ani și ce procent din fiecare sector trece pragurile tale.",
  "home.anom.title": "Laboratorul de anomalii",
  "home.anom.text":
    "Două lentile pe depunerile publice: verificări de plauzibilitate cu frecvența lor în populație și profile atipice în interiorul sectorului, calculate pe 1,12 milioane de depuneri.",
  "home.open": "Deschide",
  "home.note.kicker": "Ce trebuie știut înainte",
  "home.note.title": "Trei avertismente onest formulate",
  "home.note.p1":
    "Datele publice nu conțin istoric de default. Evenimentul pe care îl prezice modelul este un indicator indirect construit din date contabile (nedepunere, capitaluri negative, pierdere repetată), deci probabilitățile afișate nu sunt comparabile cu PD-ul unui model intern de bancă.",
  "home.note.p2":
    "Lipsesc din datele publice scadența datoriilor, dobânzile și EBITDA. Cea mai predictivă variabilă într-o bancă — acoperirea serviciului datoriei — nu poate fi calculată aici, în niciunul din cele trei instrumente.",
  "home.note.p3":
    "O deviere statistică nu este nici fraudă, nici eroare. Instrumentul de anomalii produce întrebări pentru analist, nu verdicte despre companii.",
  // ---- entry
  "ent.kicker": "Companie",
  "ent.title": "Alege compania de lucru",
  "ent.help": "Datele se citesc din indexul de situații financiare al nivelului început (Ministerul Finanțelor, 2023–2025).",
  "ent.loading": "se încarcă indexul…",
  "ent.notFound": "CUI-ul nu a fost găsit în index.",
  "ent.loaded": "Date încărcate",
  "ent.sector": "Sector (diviziune CAEN)",
  "ent.band": "Bandă de mărime",
  "ent.revenue": "Cifra de afaceri",
  "ent.year": "Anul",
  // ---- model tool
  "m.eyebrow": "Laboratorul de model",
  "m.title": "De la scorecard la probabilitate de default",
  "m.text":
    "Antrenezi un model de risc pe 120.000 de firme reale: variabile din 2024 plus dinamica 2023 → 2024, evenimentul observat în 2025. Nicio suprapunere între fereastra variabilelor și fereastra evenimentului — exact situația analistului care are situațiile până în anul t și decide pentru t+1.",
  "m.dataPill": "eșantion livrat: 120.000 de firme",
  "m.def.kicker": "Referință",
  "m.def.title": "Definițiile variabilelor",
  "m.def.help":
    "Aceleași rate ca la nivelul început, dar reperul nu mai este un prag din manual: este distribuția reală a celor 120.000 de firme din eșantion. Mediana și intervalul intercuartilic spun ce este normal în populație, nu ce ar fi bine.",
  "m.def.window": "variabile din 2024 · eveniment în 2025",
  "m.def.variable": "Variabilă și formulă",
  "m.def.measures": "Ce măsoară",
  "m.def.effect": "Efect așteptat",
  "m.def.median": "Mediana eșantionului",
  "m.def.winsor": "Interval de lucru (p1 – p99)",
  "m.def.iqr": "p25 – p75",
  "m.def.lowers": "mai mult → risc mai mic",
  "m.def.raises": "mai mult → risc mai mare",
  "m.def.neutral": "fără semn așteptat",
  "m.def.note1":
    "Coloana „Efect așteptat” este teoria, nu rezultatul: ea spune ce semn ar trebui să aibă coeficientul dacă modelul se comportă economic rezonabil. După antrenare, instrumentul compară semnul obținut cu această așteptare și marchează abaterile — de acolo vine avertismentul „semn contraintuitiv”.",
  "m.def.note2":
    "Două precizări care schimbă interpretarea. Datele publice nu împart datoriile pe scadență, deci la numitorul ratelor de lichiditate stau datoriile totale — aceeași ipoteză conservatoare ca la nivelul început, cu cursorul pe 100 %. Iar valorile sunt winsorizate la percentilele 1 și 99 calculate pe toată populația, ca o singură firmă cu o rată de 4.000 să nu dicteze coeficienții; intervalul de lucru din ultima coloană este exact acest decupaj.",
  "m.label.kicker": "Pasul 1",
  "m.label.title": "Constructorul de etichetă",
  "m.label.help":
    "Nu avem istoric de default, deci evenimentul se definește din date contabile. Fiecare definiție este o alegere — iar alegerea contează mai mult decât algoritmul.",
  "m.label.stoppedFiling": "Nu mai depune situații financiare în 2025",
  "m.label.stoppedFiling.d": "Eveniment de ieșire. Poate fi insolvență, poate fi firmă dormantă, poate fi doar întârziere la depunere.",
  "m.label.negativeEquity": "Capitalurile proprii devin negative în 2025",
  "m.label.negativeEquity.d": "Eveniment contabil clar și verificabil, cu o rată de bază mică.",
  "m.label.twoYearLoss": "Pierdere netă în 2024 și în 2025",
  "m.label.twoYearLoss.d": "Atenție: pierderea din 2024 este deja în variabile. Vezi ce se întâmplă cu AUC-ul.",
  "m.label.equityWipe": "Pierdere care șterge peste 50 % din capitaluri",
  "m.label.equityWipe.d": "Eveniment de severitate, nu de formă juridică.",
  "m.label.composite": "Compus: ieșire sau capitaluri negative sau pierdere cu colaps de cifră",
  "m.label.composite.d": "Definiția implicită a instrumentului. Acoperă mai multe forme de distres, cu prețul zgomotului.",
  "m.label.rate": "Rata de bază în eșantion",
  "m.label.count": "firme cu eveniment",
  "m.feat.kicker": "Pasul 2",
  "m.feat.title": "Variabilele modelului",
  "m.feat.help":
    "Bifează variabilele. Corelațiile mari între variabile sunt cauza obișnuită a coeficienților cu semn absurd — instrumentul te avertizează, nu te oprește.",
  "m.feat.all": "Toate",
  "m.feat.scorecard": "Doar cele din scorecardul nivelului început",
  "m.feat.none": "Niciuna",
  "m.feat.corrWarn": "corelații peste 0,80:",
  "m.feat.noCorr": "nicio pereche de variabile cu corelație peste 0,80",
  "m.train.kicker": "Pasul 3",
  "m.train.title": "Antrenare și diagnostic",
  "m.train.help":
    "Regresie logistică antrenată în browser pe 70 % din eșantion, evaluată pe restul de 30 %. Linia punctată este un model neliniar (gradient boosting bagged) antrenat de mine pe firme din afara eșantionului livrat.",
  "m.train.button": "Antrenează modelul",
  "m.train.retrain": "Antrenează din nou",
  "m.train.training": "se antrenează…",
  "m.train.reg": "Regularizare (L2)",
  "m.train.sector": "Restrânge antrenarea la un sector",
  "m.train.allSectors": "Toate sectoarele",
  "m.auc": "AUC pe holdout",
  "m.auc.train": "AUC pe eșantionul de antrenare",
  "m.auc.ref": "AUC model neliniar (referință)",
  "m.auc.gap": "Diferența antrenare − holdout",
  "m.roc.title": "Curba ROC",
  "m.coef.title": "Coeficienți (standardizați)",
  "m.coef.variable": "Variabilă",
  "m.coef.coef": "Coeficient",
  "m.coef.effect": "Efect",
  "m.coef.warn": "semn contraintuitiv",
  "m.coef.riskUp": "crește riscul",
  "m.coef.riskDown": "scade riscul",
  "m.calib.title": "Calibrare pe decile",
  "m.calib.decile": "Decilă",
  "m.calib.predicted": "Prezis",
  "m.calib.observed": "Observat",
  "m.calib.n": "Firme",
  "m.calib.help":
    "Ordonarea (AUC) și nivelul (calibrarea) sunt două calități diferite. Un model poate ordona corect și totuși să greșească nivelul.",
  "m.apply.kicker": "Pasul 4",
  "m.apply.title": "Aplică modelul pe o companie",
  "m.apply.help": "Modelul tău, aplicat unei firme căutate după CUI, alături de modelul de referință și de contribuția fiecărei variabile.",
  "m.apply.pd": "PD după modelul tău",
  "m.apply.pdRef": "PD după modelul de referință",
  "m.apply.pct": "Percentila în eșantion",
  "m.apply.avg": "Media eșantionului",
  "m.apply.contrib": "Contribuția variabilelor la scorul firmei",
  "m.apply.noRef": "Modelul de referință este livrat doar pentru firmele cu cifră de afaceri peste 1 mil. lei.",
  "m.apply.needTrain": "Antrenează mai întâi un model (pasul 3).",
  "m.apply.needCompany": "Caută o companie după CUI.",
  "m.warn.leak.title": "De ce sare AUC-ul",
  "m.warn.leak":
    "Ai ales „pierdere în 2024 și în 2025”. Pierderea din 2024 este în variabile (marja netă și ROA din 2024 sunt negative), deci modelul prezice parțial ceva ce deja știe. Scoate marja netă și ROA din variabile și vei vedea cât din AUC era scurgere de informație.",
  "m.warn.fewFeat": "Selectează cel puțin două variabile.",
  "m.export": "Exportă rezultatele (CSV)",
  // ---- sector tool
  "s.eyebrow": "Percentile pe sector",
  "s.title": "Clientul în distribuția lui, nu în pragurile noastre",
  "s.text":
    "Aceeași rată înseamnă lucruri diferite în sectoare diferite. Aici fiecare rată a companiei este așezată în distribuția reală a diviziunii CAEN și a benzii de mărime, iar pragurile tale sunt măsurate pe populație.",
  "s.profile.kicker": "Profil relativ",
  "s.profile.title": "Unde stă compania în sectorul ei",
  "s.profile.help": "Bara arată intervalul de la percentila 10 la percentila 90 al grupului de referință, cu mediana marcată și poziția companiei.",
  "s.peers": "Grup de referință",
  "s.peers.sectorBand": "Sectorul și banda de mărime",
  "s.peers.sector": "Tot sectorul",
  "s.peers.market": "Toată piața",
  "s.n": "firme în grup",
  "s.ratio": "Rată",
  "s.value": "Valoarea companiei",
  "s.pct": "Percentila",
  "s.median": "Mediana grupului",
  "s.p25": "Percentila 25",
  "s.p75": "Percentila 75",
  "s.dist.kicker": "Distribuție",
  "s.dist.title": "Distribuția sectorului și pragul tău",
  "s.dist.help": "Histograma grupului de referință pe rata selectată, cu poziția companiei și pragul tău.",
  "s.dist.threshold": "Pragul tău",
  "s.dist.passing": "Firme care trec pragul",
  "s.thr.kicker": "Explorator de praguri",
  "s.thr.title": "Cât din fiecare sector trece pragurile tale",
  "s.thr.help":
    "Pune pragurile pe care le folosești în practică și vezi ce procent din firmele fiecărui sector le-ar trece. Un prag „prudent” poate respinge 36 % dintr-un sector și 86 % din altul.",
  "s.thr.sector": "Sector",
  "s.thr.firms": "Firme",
  "s.thr.pass": "Trec pragul",
  "s.thr.medianCol": "Mediana",
  "s.thr.pctOf": "Pragul cade în percentila",
  "s.mig.kicker": "Migrație",
  "s.mig.title": "Cum s-a mișcat percentila în trei ani",
  "s.mig.help": "Percentila companiei în același grup de referință, pe fiecare an disponibil. O scădere de peste 20 de puncte este marcată.",
  "s.mig.drop": "scădere de peste 20 de puncte",
  "s.noCell": "Grupul de referință nu are suficiente firme pentru percentile (minimum 30). Încearcă „tot sectorul”.",
  // ---- anomaly tool
  "a.eyebrow": "Laboratorul de anomalii",
  "a.title": "Ce nu se vede în cifre",
  "a.text":
    "Două lentile pe 1,12 milioane de depuneri. Prima verifică plauzibilitatea unei firme, dar întotdeauna alături de frecvența problemei în populație — fără ea, orice verificare produce alarme false. A doua caută firme a căror structură nu seamănă cu a vecinilor lor de sector.",
  "a.checks.kicker": "Lentila 1",
  "a.checks.title": "Plauzibilitate",
  "a.checks.help":
    "Verificări pe compania căutată, fiecare cu frecvența ei în populație și cu explicația cea mai probabilă. Fără frecvență, orice verificare produce alarme false.",
  "a.checks.check": "Verificare",
  "a.checks.company": "Compania",
  "a.checks.freq": "Frecvența în populație",
  "a.checks.explain": "Explicația obișnuită",
  "a.checks.ok": "în regulă",
  "a.checks.hit": "atenție",
  "a.check.balance": "Bilanțul nu se închide (activ ≠ pasiv)",
  "a.check.balance.x": "Practic inexistent: depunerile sunt validate electronic. Discrepanțele rămase sunt de ordinul rotunjirii.",
  "a.check.plAccount": "Venituri − cheltuieli ≠ rezultat brut",
  "a.check.plAccount.x": "Zero cazuri în populație. Cine caută fraudă în aritmetică pierde timpul.",
  "a.check.netAboveGross": "Rezultatul net este mai mare decât cel brut",
  "a.check.netAboveGross.x": "De obicei impozit amânat sau o corecție de raportare; rar, o eroare reală.",
  "a.check.componentsExceed": "Stocuri + creanțe + numerar depășesc activele circulante",
  "a.check.componentsExceed.x": "Inconsistență de completare a formularului.",
  "a.check.impossibleNegative": "Valori negative imposibile",
  "a.check.impossibleNegative.x": "Dominat de numerar negativ, aproape sigur un descoperit de cont trecut pe linia de trezorerie — convenție de raportare, nu imposibilitate.",
  "a.check.revenueNoStaff": "Cifră de afaceri peste 5 mil. lei cu zero salariați",
  "a.check.revenueNoStaff.x": "Firmă care externalizează complet, vehicul de grup, sau salariați raportați la altă entitate.",
  "a.check.bothProfitAndLoss": "Profit brut și pierdere brută raportate simultan",
  "a.check.bothProfitAndLoss.x": "Imposibil prin construcția formularului; zero cazuri.",
  "a.zero.kicker": "Lentila 2",
  "a.zero.title": "Discontinuitatea la zero",
  "a.zero.help":
    "Histograma rezultatului net raportat la active, cu pas de un punct procentual. Distribuția urcă lin dinspre pierderi, sare la trecerea peste zero și coboară lin după.",
  "a.zero.ratio": "Raport peste zero / sub zero",
  "a.zero.deficit": "Deficit de pierderi mici",
  "a.zero.below": "Firme în intervalul −1 %…0",
  "a.zero.above": "Firme în intervalul 0…+1 %",
  "a.zero.interp": "Interpretare",
  "a.zero.interpText":
    "Când rezultatul iese ușor negativ, se găsește o ajustare care îl aduce ușor pozitiv (Burgstahler-Dichev, 1997). Consecința pentru analist: un profit raportat de 0,5 % din active nu este o informație; distanța de la zero este.",
  "a.zero.scope": "Grup analizat",
  "a.zero.companyPos": "Poziția companiei căutate",
  "a.zero.companyIn": "compania se află în intervalul",
  "a.ben.kicker": "Lentila 3",
  "a.ben.title": "Testul Benford — și capcana lui",
  "a.ben.help":
    "Distribuția primei cifre a valorilor raportate, comparată cu legea Benford, cu indicatorul MAD al lui Nigrini. Schimbă selectoarele și urmărește ce se întâmplă.",
  "a.ben.fields": "Câmpuri incluse",
  "a.ben.fields.all": "Toate (inclusiv cifra de afaceri, venituri, cheltuieli)",
  "a.ben.fields.nobiz": "Doar poziții de bilanț (fără cifra de afaceri, venituri, cheltuieli)",
  "a.ben.digit": "Prima cifră",
  "a.ben.observed": "Observat",
  "a.ben.expected": "Benford",
  "a.ben.mad": "MAD",
  "a.ben.values": "valori analizate",
  "a.ben.conf.close": "conformitate strânsă",
  "a.ben.conf.acceptable": "conformitate acceptabilă",
  "a.ben.conf.marginal": "conformitate marginală",
  "a.ben.conf.non": "neconformitate",
  "a.ben.trap.title": "Citește rezultatul înainte să-l crezi",
  "a.ben.trap":
    "Dacă ai filtrat pe o bandă de mărime cu toate câmpurile incluse, MAD-ul indică neconformitate. Nu ai găsit nimic: banda de mărime este definită prin cifra de afaceri, deci ai comprimat intervalul de valori al variabilei pe care apoi o testezi, iar testul Benford presupune valori întinse pe mai multe ordine de mărime. Trece pe „doar poziții de bilanț” și deviația dispare.",
  "a.out.kicker": "Lentila 2",
  "a.out.title": "Profile atipice în sector",
  "a.out.help":
    "Distanță Mahalanobis robustă pe nouă structuri de bilanț și de rezultat, calculată în interiorul diviziunii CAEN, pentru firmele cu cifră de afaceri peste 10 mil. lei. Se afișează CUI-ul și dimensiunile devierii; numele apare doar dacă îl cauți tu.",
  "a.out.warn":
    "O deviere statistică nu indică nici fraudă, nici eroare. Indică o firmă care merită întrebări — și, de multe ori, o explicație perfect banală.",
  "a.out.rank": "Loc",
  "a.out.cui": "CUI",
  "a.out.d2": "Distanță",
  "a.out.dims": "Dimensiunile devierii",
  "a.out.lookup": "Caută acest CUI",
  "a.out.noDiv": "Pentru diviziunea aceasta nu sunt suficiente firme mari ca să calculăm profile atipice.",
  "a.anyIssue": "Firme cu cel puțin o problemă",
  "a.pop": "Populația analizată",
  "a.year": "Anul",
};

const EN = {
  "nav.home": "Home",
  "nav.model": "Model lab",
  "nav.sector": "Sector percentiles",
  "nav.anom": "Anomaly lab",
  "nav.basic": "Beginner level",
  "adv.level": "Advanced level",
  "adv.populationPill": "1,122,150 companies · 2023–2025",
  "home.eyebrow": "Financial analysis and AI tools · advanced level",
  "home.title": "Three tools built on the population of companies, not on a single one",
  "home.text":
    "At beginner level we analyse one company against thresholds we chose ourselves. Here the reference is the whole population of filings at the Romanian Ministry of Finance: you train a risk model on real companies, measure your bank's thresholds inside the sector distribution, and investigate reporting behaviour. Everything runs in the browser; nothing is stored on a server.",
  "home.pick": "Pick a tool",
  "home.model.title": "Model lab",
  "home.model.text":
    "Choose the definition of the risk event, choose the variables, train a logistic regression on 120,000 real companies and get AUC, the ROC curve, coefficients and calibration. Then apply the model to a company by its tax ID.",
  "home.sector.title": "Sector percentiles",
  "home.sector.text":
    "For any tax ID: which percentile of its sector and size band each ratio falls into, how it moved over three years, and what share of each sector passes your thresholds.",
  "home.anom.title": "Anomaly lab",
  "home.anom.text":
    "Two lenses on public filings: plausibility checks with their frequency in the population, and atypical profiles inside a sector, computed over 1.12 million filings.",
  "home.open": "Open",
  "home.note.kicker": "Before you start",
  "home.note.title": "Three honest warnings",
  "home.note.p1":
    "Public data carries no default history. The event the model predicts is a proxy built from accounting data (stopped filing, negative equity, repeated loss), so the probabilities shown are not comparable with a bank's internal PD.",
  "home.note.p2":
    "Debt maturity, interest expense and EBITDA are absent from public data. The most predictive variable in a bank — debt service coverage — cannot be computed in any of these three tools.",
  "home.note.p3":
    "A statistical deviation is neither fraud nor error. The anomaly tool produces questions for the analyst, not verdicts about companies.",
  "ent.kicker": "Company",
  "ent.title": "Choose the company to work with",
  "ent.help": "Data is read from the beginner level's filing index (Ministry of Finance, 2023–2025).",
  "ent.loading": "loading the index…",
  "ent.notFound": "That tax ID is not in the index.",
  "ent.loaded": "Data loaded",
  "ent.sector": "Sector (CAEN division)",
  "ent.band": "Size band",
  "ent.revenue": "Revenue",
  "ent.year": "Year",
  "m.eyebrow": "Model lab",
  "m.title": "From scorecard to probability of default",
  "m.text":
    "You train a risk model on 120,000 real companies: variables from 2024 plus 2023 → 2024 dynamics, the event observed in 2025. No overlap between the variable window and the event window — exactly the analyst's situation, holding statements up to year t and deciding for t+1.",
  "m.dataPill": "delivered sample: 120,000 companies",
  "m.def.kicker": "Reference",
  "m.def.title": "Variable definitions",
  "m.def.help":
    "The same ratios as at beginner level, but the reference is no longer a textbook threshold: it is the actual distribution of the 120,000 companies in the sample. The median and the interquartile range say what is normal in the population, not what would be good.",
  "m.def.window": "variables from 2024 · event in 2025",
  "m.def.variable": "Variable and formula",
  "m.def.measures": "What it measures",
  "m.def.effect": "Expected effect",
  "m.def.median": "Sample median",
  "m.def.winsor": "Working range (p1 – p99)",
  "m.def.iqr": "p25 – p75",
  "m.def.lowers": "more → lower risk",
  "m.def.raises": "more → higher risk",
  "m.def.neutral": "no expected sign",
  "m.def.note1":
    "The “expected effect” column is theory, not result: it states the sign the coefficient should carry if the model behaves in an economically sensible way. After training, the tool compares the sign obtained against this expectation and flags the deviations — that is where the “counter-intuitive sign” warning comes from.",
  "m.def.note2":
    "Two clarifications that change the reading. Public data does not split liabilities by maturity, so the denominator of the liquidity ratios is total liabilities — the same conservative assumption as at beginner level, with the slider at 100 %. And the values are winsorised at the 1st and 99th percentiles computed on the whole population, so that a single company with a ratio of 4,000 cannot dictate the coefficients; the working range in the last column is exactly that clipping.",
  "m.label.kicker": "Step 1",
  "m.label.title": "Label builder",
  "m.label.help":
    "There is no default history, so the event has to be defined from accounting data. Every definition is a choice — and the choice matters more than the algorithm.",
  "m.label.stoppedFiling": "Stops filing financial statements in 2025",
  "m.label.stoppedFiling.d": "An exit event. It can be insolvency, a dormant company, or merely a late filing.",
  "m.label.negativeEquity": "Equity turns negative in 2025",
  "m.label.negativeEquity.d": "A clear, verifiable accounting event with a low base rate.",
  "m.label.twoYearLoss": "Net loss in both 2024 and 2025",
  "m.label.twoYearLoss.d": "Careful: the 2024 loss is already among the variables. Watch what happens to AUC.",
  "m.label.equityWipe": "A loss wiping out more than 50 % of equity",
  "m.label.equityWipe.d": "An event of severity rather than of legal form.",
  "m.label.composite": "Composite: exit, or negative equity, or loss with revenue collapse",
  "m.label.composite.d": "The tool's default. It covers several forms of distress, at the price of noise.",
  "m.label.rate": "Base rate in the sample",
  "m.label.count": "companies with the event",
  "m.feat.kicker": "Step 2",
  "m.feat.title": "Model variables",
  "m.feat.help":
    "Tick the variables. High correlation between them is the usual cause of absurd coefficient signs — the tool warns you, it does not stop you.",
  "m.feat.all": "All",
  "m.feat.scorecard": "Only the beginner-level scorecard ones",
  "m.feat.none": "None",
  "m.feat.corrWarn": "correlations above 0.80:",
  "m.feat.noCorr": "no pair of variables correlates above 0.80",
  "m.train.kicker": "Step 3",
  "m.train.title": "Training and diagnostics",
  "m.train.help":
    "Logistic regression trained in the browser on 70 % of the sample and evaluated on the other 30 %. The dashed line is a non-linear model (bagged gradient boosting) I trained on companies outside the delivered sample.",
  "m.train.button": "Train the model",
  "m.train.retrain": "Train again",
  "m.train.training": "training…",
  "m.train.reg": "Regularisation (L2)",
  "m.train.sector": "Restrict training to one sector",
  "m.train.allSectors": "All sectors",
  "m.auc": "Holdout AUC",
  "m.auc.train": "Training AUC",
  "m.auc.ref": "Non-linear model AUC (reference)",
  "m.auc.gap": "Training − holdout gap",
  "m.roc.title": "ROC curve",
  "m.coef.title": "Coefficients (standardised)",
  "m.coef.variable": "Variable",
  "m.coef.coef": "Coefficient",
  "m.coef.effect": "Effect",
  "m.coef.warn": "counter-intuitive sign",
  "m.coef.riskUp": "raises risk",
  "m.coef.riskDown": "lowers risk",
  "m.calib.title": "Calibration by decile",
  "m.calib.decile": "Decile",
  "m.calib.predicted": "Predicted",
  "m.calib.observed": "Observed",
  "m.calib.n": "Companies",
  "m.calib.help":
    "Ranking (AUC) and level (calibration) are two different qualities. A model can rank correctly and still get the level wrong.",
  "m.apply.kicker": "Step 4",
  "m.apply.title": "Apply the model to a company",
  "m.apply.help": "Your model applied to a company looked up by tax ID, next to the reference model and each variable's contribution.",
  "m.apply.pd": "PD from your model",
  "m.apply.pdRef": "PD from the reference model",
  "m.apply.pct": "Percentile in the sample",
  "m.apply.avg": "Sample average",
  "m.apply.contrib": "Variable contributions to this company's score",
  "m.apply.noRef": "The reference model is delivered only for companies with revenue above RON 1 million.",
  "m.apply.needTrain": "Train a model first (step 3).",
  "m.apply.needCompany": "Look up a company by tax ID.",
  "m.warn.leak.title": "Why AUC jumps",
  "m.warn.leak":
    "You picked “net loss in 2024 and 2025”. The 2024 loss is among the variables (2024 net margin and ROA are negative), so the model partly predicts something it already knows. Remove net margin and ROA from the variables to see how much of that AUC was leakage.",
  "m.warn.fewFeat": "Select at least two variables.",
  "m.export": "Export results (CSV)",
  "s.eyebrow": "Sector percentiles",
  "s.title": "The client inside its own distribution, not inside our thresholds",
  "s.text":
    "The same ratio means different things in different sectors. Here every ratio of the company is placed in the real distribution of its CAEN division and size band, and your thresholds are measured against the population.",
  "s.profile.kicker": "Relative profile",
  "s.profile.title": "Where the company sits in its sector",
  "s.profile.help": "The bar shows the peer group's 10th-to-90th percentile range, with the median marked and the company's position.",
  "s.peers": "Peer group",
  "s.peers.sectorBand": "Sector and size band",
  "s.peers.sector": "Whole sector",
  "s.peers.market": "Whole market",
  "s.n": "companies in the group",
  "s.ratio": "Ratio",
  "s.value": "Company value",
  "s.pct": "Percentile",
  "s.median": "Group median",
  "s.p25": "25th percentile",
  "s.p75": "75th percentile",
  "s.dist.kicker": "Distribution",
  "s.dist.title": "The sector distribution and your threshold",
  "s.dist.help": "Histogram of the peer group for the selected ratio, with the company's position and your threshold.",
  "s.dist.threshold": "Your threshold",
  "s.dist.passing": "Companies passing",
  "s.thr.kicker": "Threshold explorer",
  "s.thr.title": "How much of each sector passes your thresholds",
  "s.thr.help":
    "Set the thresholds you use in practice and see what share of each sector's companies would pass them. A “prudent” threshold can reject 36 % of one sector and 86 % of another.",
  "s.thr.sector": "Sector",
  "s.thr.firms": "Companies",
  "s.thr.pass": "Pass",
  "s.thr.medianCol": "Median",
  "s.thr.pctOf": "The threshold sits at percentile",
  "s.mig.kicker": "Migration",
  "s.mig.title": "How the percentile moved over three years",
  "s.mig.help": "The company's percentile in the same peer group, for every available year. A drop of more than 20 points is flagged.",
  "s.mig.drop": "drop of more than 20 points",
  "s.noCell": "This peer group has too few companies for percentiles (minimum 30). Try “whole sector”.",
  "a.eyebrow": "Anomaly lab",
  "a.title": "What the numbers do not show",
  "a.text":
    "Two lenses on 1.12 million filings. The first checks a company's plausibility, always next to how frequent the issue is in the population — without that, any check produces false alarms. The second looks for companies whose structure does not resemble their sector peers.",
  "a.checks.kicker": "Lens 1",
  "a.checks.title": "Plausibility",
  "a.checks.help":
    "Checks on the company you looked up, each with its frequency in the population and its most likely explanation. Without the frequency, any check produces false alarms.",
  "a.checks.check": "Check",
  "a.checks.company": "This company",
  "a.checks.freq": "Frequency in the population",
  "a.checks.explain": "The usual explanation",
  "a.checks.ok": "clear",
  "a.checks.hit": "flagged",
  "a.check.balance": "The balance sheet does not balance",
  "a.check.balance.x": "Practically non-existent: filings are validated electronically. What remains is rounding-scale.",
  "a.check.plAccount": "Income − expenses ≠ gross result",
  "a.check.plAccount.x": "Zero cases in the population. Looking for fraud in the arithmetic is a waste of time.",
  "a.check.netAboveGross": "Net result larger than gross result",
  "a.check.netAboveGross.x": "Usually deferred tax or a reporting correction; rarely a genuine error.",
  "a.check.componentsExceed": "Inventories + receivables + cash exceed current assets",
  "a.check.componentsExceed.x": "A form-filling inconsistency.",
  "a.check.impossibleNegative": "Impossible negative values",
  "a.check.impossibleNegative.x": "Dominated by negative cash, almost certainly an overdraft booked on the treasury line — a reporting convention, not an impossibility.",
  "a.check.revenueNoStaff": "Revenue above RON 5m with zero employees",
  "a.check.revenueNoStaff.x": "Fully outsourced company, a group vehicle, or staff reported under another entity.",
  "a.check.bothProfitAndLoss": "Gross profit and gross loss reported together",
  "a.check.bothProfitAndLoss.x": "Impossible by the form's construction; zero cases.",
  "a.zero.kicker": "Lens 2",
  "a.zero.title": "The discontinuity at zero",
  "a.zero.help":
    "Histogram of net result over total assets, in one-percentage-point bins. The distribution rises smoothly from the loss side, jumps as it crosses zero, and falls smoothly after.",
  "a.zero.ratio": "Above zero / below zero ratio",
  "a.zero.deficit": "Missing small losses",
  "a.zero.below": "Companies in −1 %…0",
  "a.zero.above": "Companies in 0…+1 %",
  "a.zero.interp": "Interpretation",
  "a.zero.interpText":
    "When the result comes out slightly negative, an adjustment is found that brings it slightly positive (Burgstahler-Dichev, 1997). The consequence for an analyst: a reported profit of 0.5 % of assets is not information; the distance from zero is.",
  "a.zero.scope": "Group analysed",
  "a.zero.companyPos": "Position of the company looked up",
  "a.zero.companyIn": "the company falls in the bin",
  "a.ben.kicker": "Lens 3",
  "a.ben.title": "The Benford test — and its trap",
  "a.ben.help":
    "The first-digit distribution of reported values against Benford's law, with Nigrini's MAD statistic. Change the selectors and watch what happens.",
  "a.ben.fields": "Fields included",
  "a.ben.fields.all": "All (including revenue, income, expenses)",
  "a.ben.fields.nobiz": "Balance-sheet items only (no revenue, income, expenses)",
  "a.ben.digit": "First digit",
  "a.ben.observed": "Observed",
  "a.ben.expected": "Benford",
  "a.ben.mad": "MAD",
  "a.ben.values": "values analysed",
  "a.ben.conf.close": "close conformity",
  "a.ben.conf.acceptable": "acceptable conformity",
  "a.ben.conf.marginal": "marginal conformity",
  "a.ben.conf.non": "non-conformity",
  "a.ben.trap.title": "Read the result before believing it",
  "a.ben.trap":
    "If you filtered on a size band with all fields included, MAD indicates non-conformity. You have found nothing: the size band is defined by revenue, so you compressed the range of the very variable you are testing, and the Benford test assumes values spread over several orders of magnitude. Switch to “balance-sheet items only” and the deviation disappears.",
  "a.out.kicker": "Lens 2",
  "a.out.title": "Atypical profiles in a sector",
  "a.out.help":
    "Robust Mahalanobis distance over nine balance-sheet and income structures, computed inside the CAEN division, for companies with revenue above RON 10 million. The tax ID and the deviating dimensions are shown; the name appears only if you look it up yourself.",
  "a.out.warn":
    "A statistical deviation indicates neither fraud nor error. It indicates a company worth asking questions about — and, often, a perfectly ordinary explanation.",
  "a.out.rank": "Rank",
  "a.out.cui": "Tax ID",
  "a.out.d2": "Distance",
  "a.out.dims": "Deviating dimensions",
  "a.out.lookup": "Look this one up",
  "a.out.noDiv": "This division does not have enough large companies to compute atypical profiles.",
  "a.anyIssue": "Companies with at least one issue",
  "a.pop": "Population analysed",
  "a.year": "Year",
};
Object.assign(I18N.ro, RO);
Object.assign(I18N.en, EN);

export const $ = (id) => document.getElementById(id);
export const ro = () => getLang() === "ro";
export const nf = (v, d = 0) =>
  isNum(v) ? v.toLocaleString(ro() ? "ro-RO" : "en-GB", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

export function divName(d) {
  const n = CAEN_DIV[Number(d)];
  return n ? `${String(d).padStart(2, "0")} · ${n}` : String(d).padStart(2, "0");
}
export function bandName(b) {
  return (ro() ? BANDS_RO : BANDS_EN)[b] || "—";
}
export function bandOf(revenue) {
  if (!isNum(revenue)) return -1;
  if (revenue < 2e6) return 0;
  if (revenue < 10e6) return 1;
  if (revenue < 50e6) return 2;
  return 3;
}
export function divOf(caen) {
  const n = Number(String(caen || "").replace(/\D/g, ""));
  return n > 0 ? Math.floor(n / 100) : 0;
}

// ------------------------------------------------------------------ shell
export function renderAdvShell(active) {
  const nav = $("site-nav");
  if (nav) {
    const link = (key, href, id) =>
      `<a class="nav-link${active === id ? " is-active" : ""}" href="${href}" data-i18n="nav.${key}"></a>`;
    nav.innerHTML =
      link("home", "./index.html", "home") +
      link("model", "./model.html", "model") +
      link("sector", "./sector.html", "sector") +
      link("anom", "./anomalii.html", "anom") +
      `<a class="nav-link" href="https://cezar-constantin.github.io/analiza_financiara_cu_ai/" target="_blank" rel="noreferrer" data-i18n="nav.basic"></a>
      <div class="lang-switch" role="group" aria-label="Language">
        <button type="button" data-lang="ro">RO</button>
        <button type="button" data-lang="en">EN</button>
      </div>`;
  }
  const footer = $("site-footer");
  if (footer) {
    footer.innerHTML = `
      <section class="card disclaimer-card">
        <div class="section-heading">
          <div>
            <p class="section-kicker" data-i18n="footer.disclaimer.kicker"></p>
            <h2 data-i18n="footer.disclaimer.title"></h2>
          </div>
          <span class="status-pill" data-i18n="footer.disclaimer.pill"></span>
        </div>
        <p class="helper-copy" data-i18n="footer.disclaimer.p1"></p>
        <p class="helper-copy" data-i18n="home.note.p1"></p>
        <p class="helper-copy" data-i18n="home.note.p2"></p>
        <p class="helper-copy footer-meta"><span data-i18n="footer.source"></span> · <span data-i18n="footer.more"></span> <a href="https://cezar-chirila.com/" target="_blank" rel="noreferrer">www.cezar-chirila.com</a></p>
      </section>`;
  }
  initLangSwitch();
  applyStaticTranslations();
}

// ------------------------------------------------------------------ remote CUI index (from the beginner repo)
const INDEX_BASES = [
  "./data/idx/",
  "https://raw.githubusercontent.com/cezar-constantin/analiza_financiara_cu_ai/main/data/idx/",
  "https://cdn.jsdelivr.net/gh/cezar-constantin/analiza_financiara_cu_ai@main/data/idx/",
];
const MANIFEST_BASES = [
  "./data/manifest.json",
  "https://raw.githubusercontent.com/cezar-constantin/analiza_financiara_cu_ai/main/data/manifest.json",
  "https://cdn.jsdelivr.net/gh/cezar-constantin/analiza_financiara_cu_ai@main/data/manifest.json",
];
let manifest = null,
  baseIdx = 0;

async function inflateJson(res) {
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  if (!(bytes[0] === 0x1f && bytes[1] === 0x8b)) return JSON.parse(new TextDecoder().decode(bytes));
  const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"));
  return JSON.parse(await new Response(stream).text());
}

export async function loadIndexManifest() {
  if (manifest) return manifest;
  for (let i = 0; i < MANIFEST_BASES.length; i++) {
    try {
      const r = await fetch(MANIFEST_BASES[i], { cache: "force-cache" });
      if (!r.ok) continue;
      manifest = await r.json();
      baseIdx = i;
      return manifest;
    } catch (e) {
      /* try the next base */
    }
  }
  throw new Error("index manifest unavailable");
}

/** Look up a company in the (possibly remote) MFP index; returns a dataset shaped like common.js's. */
export async function lookupCompany(cuiInput) {
  const cui = normalizeCui(cuiInput);
  if (!cui) return null;
  const man = await loadIndexManifest();
  const shard = Number(cui) % 1000;
  const gz = man.format === "json.gz";
  let data = null;
  for (let i = baseIdx; i < INDEX_BASES.length && !data; i++) {
    try {
      const r = await fetch(INDEX_BASES[i] + shard + (gz ? ".json.gz" : ".json"), { cache: "force-cache" });
      if (!r.ok) continue;
      data = gz ? await inflateJson(r) : await r.json();
      baseIdx = i;
    } catch (e) {
      /* try the next base */
    }
  }
  if (!data) throw new Error("index shard unavailable");
  const rec = data[cui];
  if (!rec) return null;
  const ds = emptyDataset();
  ds.cui = cui;
  ds.company = rec[0] || "";
  ds.caen = rec[1] || "";
  ds.source = "mfp";
  ds.sourceDate = man.updated;
  ds.raw = {};
  man.years.forEach((year, i) => {
    const row = rec[2][i];
    if (!row) return;
    const { values, extra } = fromMfpRow(row);
    ds.years.push(year);
    ds.values[year] = values;
    ds.employees[year] = extra.employees;
    ds.shareCapital[year] = extra.shareCapital;
    ds.raw[year] = row;
  });
  ds.years.sort((a, b) => a - b);
  return ds;
}

// ------------------------------------------------------------------ binary / gz dataset loaders
const cache = new Map();
export async function loadGzJson(path) {
  if (cache.has(path)) return cache.get(path);
  const p = (async () => {
    const r = await fetch(path, { cache: "force-cache" });
    if (!r.ok) throw new Error(path);
    return inflateJson(r);
  })();
  cache.set(path, p);
  return p;
}
export async function loadGzBuffer(path) {
  if (cache.has(path)) return cache.get(path);
  const p = (async () => {
    const r = await fetch(path, { cache: "force-cache" });
    if (!r.ok) throw new Error(path);
    const buf = await r.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (!(bytes[0] === 0x1f && bytes[1] === 0x8b)) return buf;
    const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).arrayBuffer();
  })();
  cache.set(path, p);
  return p;
}
export async function loadJson(path) {
  if (cache.has(path)) return cache.get(path);
  const p = fetch(path, { cache: "force-cache" }).then((r) => {
    if (!r.ok) throw new Error(path);
    return r.json();
  });
  cache.set(path, p);
  return p;
}

// ------------------------------------------------------------------ logistic regression (in-browser)
/** Full-batch gradient descent with momentum on standardised features. */
export function trainLogit(X, y, nFeat, opts = {}) {
  const n = y.length;
  const l2 = opts.l2 ?? 1e-3;
  const iters = opts.iters ?? 250;
  const w = new Float64Array(nFeat);
  const v = new Float64Array(nFeat);
  let b = 0,
    vb = 0;
  let lr = opts.lr ?? 0.9;
  const mom = 0.9;
  const g = new Float64Array(nFeat);
  for (let it = 0; it < iters; it++) {
    g.fill(0);
    let gb = 0;
    for (let i = 0; i < n; i++) {
      const o = i * nFeat;
      let z = b;
      for (let j = 0; j < nFeat; j++) z += w[j] * X[o + j];
      const p = 1 / (1 + Math.exp(-z));
      const d = p - y[i];
      for (let j = 0; j < nFeat; j++) g[j] += d * X[o + j];
      gb += d;
    }
    for (let j = 0; j < nFeat; j++) {
      const grad = g[j] / n + l2 * w[j];
      v[j] = mom * v[j] - lr * grad;
      w[j] += v[j];
    }
    vb = mom * vb - lr * (gb / n);
    b += vb;
    if (it === Math.floor(iters * 0.6)) lr *= 0.35;
    if (it === Math.floor(iters * 0.85)) lr *= 0.35;
  }
  return { w: Array.from(w), b };
}

export function predictLogit(model, X, nFeat, n) {
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * nFeat;
    let z = model.b;
    for (let j = 0; j < nFeat; j++) z += model.w[j] * X[o + j];
    out[i] = 1 / (1 + Math.exp(-z));
  }
  return out;
}

/** Rank-based AUC (handles ties by average rank). */
export function auc(scores, labels) {
  const n = scores.length;
  const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => scores[a] - scores[b]);
  const rank = new Float64Array(n);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && scores[idx[j + 1]] === scores[idx[i]]) j++;
    const r = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) rank[idx[k]] = r;
    i = j + 1;
  }
  let sumPos = 0,
    nPos = 0;
  for (let k = 0; k < n; k++)
    if (labels[k] === 1) {
      sumPos += rank[k];
      nPos++;
    }
  const nNeg = n - nPos;
  if (!nPos || !nNeg) return null;
  return (sumPos - (nPos * (nPos + 1)) / 2) / (nPos * nNeg);
}

/** ROC curve points, thinned to at most `steps` points. */
export function rocCurve(scores, labels, steps = 120) {
  const n = scores.length;
  const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => scores[b] - scores[a]);
  let nPos = 0;
  for (const l of labels) if (l === 1) nPos++;
  const nNeg = n - nPos;
  const pts = [[0, 0]];
  let tp = 0,
    fp = 0;
  const every = Math.max(1, Math.floor(n / steps));
  for (let k = 0; k < n; k++) {
    if (labels[idx[k]] === 1) tp++;
    else fp++;
    if (k % every === 0) pts.push([fp / nNeg, tp / nPos]);
  }
  pts.push([1, 1]);
  return pts;
}

export function decileCalibration(scores, labels, bins = 10) {
  const n = scores.length;
  const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => scores[a] - scores[b]);
  const out = [];
  for (let d = 0; d < bins; d++) {
    const lo = Math.floor((d * n) / bins),
      hi = Math.floor(((d + 1) * n) / bins);
    let p = 0,
      o = 0;
    for (let k = lo; k < hi; k++) {
      p += scores[idx[k]];
      o += labels[idx[k]];
    }
    const m = hi - lo;
    out.push({ decile: d + 1, predicted: m ? p / m : null, observed: m ? o / m : null, n: m });
  }
  return out;
}

// ------------------------------------------------------------------ charts (same visual language as common.js)
const E = (s) => esc(String(s));

export function rocChart(series, opts = {}) {
  const W = opts.width || 520,
    H = opts.height || 340,
    padL = 44,
    padR = 14,
    padT = 14,
    padB = 34;
  const pw = W - padL - padR,
    ph = H - padT - padB;
  const xf = (x) => padL + x * pw,
    yf = (y) => padT + (1 - y) * ph;
  let svg = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${E(opts.aria || "ROC")}">`;
  for (let g = 0; g <= 4; g++) {
    const y = padT + (g / 4) * ph,
      x = padL + (g / 4) * pw;
    svg += `<line class="grid-line" x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}"/>`;
    svg += `<line class="grid-line" x1="${x}" x2="${x}" y1="${padT}" y2="${padT + ph}"/>`;
    svg += `<text class="axis-label" x="${padL - 6}" y="${y + 4}" text-anchor="end">${nf(100 - g * 25)}%</text>`;
    svg += `<text class="axis-label" x="${x}" y="${H - 12}" text-anchor="middle">${nf(g * 25)}%</text>`;
  }
  svg += `<line class="axis-line" x1="${padL}" x2="${W - padR}" y1="${padT + ph}" y2="${padT + ph}"/>`;
  svg += `<line class="axis-line" x1="${padL}" x2="${padL}" y1="${padT}" y2="${padT + ph}"/>`;
  svg += `<line x1="${xf(0)}" y1="${yf(0)}" x2="${xf(1)}" y2="${yf(1)}" stroke="rgba(22,37,84,0.35)" stroke-width="1" stroke-dasharray="4 3"/>`;
  for (const s of series) {
    if (!s.points || s.points.length < 2) continue;
    const d = s.points.map(([x, y], i) => `${i ? "L" : "M"}${xf(x).toFixed(1)},${yf(y).toFixed(1)}`).join("");
    svg += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.4}"${s.dash ? ` stroke-dasharray="${s.dash}"` : ""} stroke-linejoin="round"/>`;
  }
  svg += `</svg>`;
  return svg;
}

/** Vertical histogram with an optional highlighted bin and a marker line. */
export function histChart(bins, counts, opts = {}) {
  const W = opts.width || 660,
    H = opts.height || 300,
    padL = 52,
    padR = 12,
    padT = 14,
    padB = 36;
  const pw = W - padL - padR,
    ph = H - padT - padB;
  const max = Math.max(1, ...counts);
  const bw = pw / counts.length;
  let svg = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${E(opts.aria || "")}">`;
  for (let g = 0; g <= 4; g++) {
    const y = padT + (g / 4) * ph;
    svg += `<line class="grid-line" x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}"/>`;
    svg += `<text class="axis-label" x="${padL - 6}" y="${y + 4}" text-anchor="end">${nf((max * (4 - g)) / 4)}</text>`;
  }
  counts.forEach((c, i) => {
    const h = (c / max) * ph;
    const x = padL + i * bw;
    const hl = opts.highlight === i;
    const zero = opts.zeroIndex === i;
    const color = hl ? PALETTE[2] : zero ? PALETTE[0] : bins[i] < 0 ? "#9aa7c7" : PALETTE[1];
    svg += `<g class="hover-target"><rect x="${x + 0.8}" y="${padT + ph - h}" width="${Math.max(1, bw - 1.6)}" height="${Math.max(h, 0.6)}" rx="2" fill="${color}"${hl ? ' stroke="#162554" stroke-width="1.5"' : ""}><title>${E(opts.binLabel ? opts.binLabel(i) : bins[i])}: ${nf(c)}</title></rect></g>`;
  });
  if (opts.markerIndex != null) {
    const x = padL + (opts.markerIndex + 0.5) * bw;
    svg += `<line x1="${x}" x2="${x}" y1="${padT}" y2="${padT + ph}" stroke="${PALETTE[4]}" stroke-width="2" stroke-dasharray="4 3"/>`;
  }
  const step = Math.max(1, Math.round(counts.length / 10));
  bins.forEach((b, i) => {
    if (i % step) return;
    svg += `<text class="axis-label" x="${padL + i * bw}" y="${H - 12}" text-anchor="middle">${E(opts.tickLabel ? opts.tickLabel(i) : b)}</text>`;
  });
  svg += `<line class="axis-line" x1="${padL}" x2="${W - padR}" y1="${padT + ph}" y2="${padT + ph}"/>`;
  svg += `</svg>`;
  return svg;
}

/** Observed-vs-expected paired columns (used for Benford). */
export function pairedColumns(labels, obs, exp, opts = {}) {
  const W = opts.width || 660,
    H = opts.height || 280,
    padL = 48,
    padR = 12,
    padT = 14,
    padB = 34;
  const pw = W - padL - padR,
    ph = H - padT - padB;
  const max = Math.max(...obs, ...exp) * 1.12;
  const gw = pw / labels.length;
  let svg = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${E(opts.aria || "")}">`;
  for (let g = 0; g <= 4; g++) {
    const y = padT + (g / 4) * ph;
    svg += `<line class="grid-line" x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}"/>`;
    svg += `<text class="axis-label" x="${padL - 6}" y="${y + 4}" text-anchor="end">${nf((100 * max * (4 - g)) / 4, 0)}%</text>`;
  }
  labels.forEach((l, i) => {
    const x = padL + i * gw;
    const bw = (gw - 10) / 2;
    const ho = (obs[i] / max) * ph,
      he = (exp[i] / max) * ph;
    svg += `<g class="hover-target"><rect x="${x + 4}" y="${padT + ph - ho}" width="${bw}" height="${ho}" rx="3" fill="${PALETTE[0]}"><title>${E(l)} · ${E(t("a.ben.observed"))}: ${nf(100 * obs[i], 2)}%</title></rect></g>`;
    svg += `<g class="hover-target"><rect x="${x + 6 + bw}" y="${padT + ph - he}" width="${bw}" height="${he}" rx="3" fill="${PALETTE[2]}" opacity="0.85"><title>${E(l)} · ${E(t("a.ben.expected"))}: ${nf(100 * exp[i], 2)}%</title></rect></g>`;
    svg += `<text class="axis-label" x="${x + gw / 2}" y="${H - 12}" text-anchor="middle" font-weight="700">${E(l)}</text>`;
  });
  svg += `<line class="axis-line" x1="${padL}" x2="${W - padR}" y1="${padT + ph}" y2="${padT + ph}"/></svg>`;
  return svg;
}

/** Percentile position bar: p10–p90 range, median tick, company marker. */
export function percentileBar(q, value, opts = {}) {
  // q = 21 percentile values (0,5,...,100)
  const lo = q[2],
    hi = q[18],
    med = q[10];
  const span = hi - lo || 1;
  const pos = (v) => Math.max(0, Math.min(100, ((v - lo) / span) * 100));
  const pct = opts.pct;
  const col = pct == null ? "#8a94ad" : pct >= 60 ? "#1b6f3a" : pct >= 30 ? "#b7791f" : "#b0491b";
  return `<div class="woe-track" style="background:linear-gradient(90deg, rgba(176,73,27,0.12), rgba(183,121,31,0.10) 50%, rgba(27,111,58,0.12))">
      <div style="position:absolute;left:${pos(med)}%;top:0;bottom:0;width:2px;background:rgba(22,37,84,0.55)"></div>
      ${isNum(value) ? `<div style="position:absolute;left:calc(${pos(value)}% - 6px);top:50%;transform:translateY(-50%);width:12px;height:12px;border-radius:999px;background:${col};border:2px solid #fff;box-shadow:0 1px 4px rgba(22,37,84,0.35)"></div>` : ""}
    </div>`;
}

export function pill(text, tone = "") {
  return `<span class="status-pill${tone ? " " + tone : ""}">${E(text)}</span>`;
}

export function madVerdict(mad) {
  if (mad < 0.006) return { key: "a.ben.conf.close", tone: "good" };
  if (mad < 0.012) return { key: "a.ben.conf.acceptable", tone: "good" };
  if (mad < 0.015) return { key: "a.ben.conf.marginal", tone: "watch" };
  return { key: "a.ben.conf.non", tone: "weak" };
}

export const BENFORD = [0.30103, 0.176091, 0.124939, 0.09691, 0.079181, 0.066947, 0.057992, 0.051153, 0.045757];

// ------------------------------------------------------------------ company entry panel
/** Wires the shared CUI/demo entry panel. Calls onLoad(ds) whenever a company is loaded. */
export async function wireCompanyEntry(onLoad) {
  const sel = $("demo-select");
  if (sel) {
    sel.innerHTML = `<option value="">${esc(t("entry.demo.choose"))}</option>`;
    try {
      const list = await loadJson("./data/demo_companies.json");
      for (const c of list) {
        const o = document.createElement("option");
        o.value = c.cui;
        o.textContent = `${c.name} · ${c.cui}`;
        sel.appendChild(o);
      }
    } catch (e) {
      /* demo list optional */
    }
  }
  const status = (key, tone) => {
    const el = $("entry-status");
    if (!el) return;
    // drop data-i18n first: applyStaticTranslations() runs on every re-render and would
    // otherwise overwrite the status we just set with the initial "waiting" text
    el.removeAttribute("data-i18n");
    el.textContent = typeof key === "string" && key.includes(" ") ? key : t(key);
    el.className = "status-pill" + (tone ? " " + tone : "");
  };
  async function load(cui) {
    status("ent.loading");
    try {
      const ds = await lookupCompany(cui);
      if (!ds) {
        status("ent.notFound", "weak");
        return;
      }
      status("ent.loaded", "good");
      const hc = $("hero-company");
      if (hc) hc.textContent = ds.company || ds.cui;
      onLoad(ds);
    } catch (e) {
      status(t("ent.notFound"), "weak");
    }
  }
  const btn = $("cui-button");
  if (btn) btn.addEventListener("click", () => load($("cui-input").value));
  const inp = $("cui-input");
  if (inp)
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") load(inp.value);
    });
  if (sel)
    sel.addEventListener("change", () => {
      if (sel.value) {
        $("cui-input").value = sel.value;
        load(sel.value);
      }
    });
  return { load };
}
