/* Shared module for the "Analiză financiară cu AI" teaching tools.
   i18n, number formatting, financial calculations, red flags, SVG charts, data access. */

// ---------------------------------------------------------------- i18n
export const LANGS = ["ro", "en"];

export const I18N = {
  ro: {
    // shell
    "nav.home": "Acasă",
    "nav.tool1": "Atelier 1 · Analiză automată",
    "nav.tool2": "Atelier 2 · Scor & memo de risc",
    "nav.course": "Cursul",
    "lang.label": "Limbă",
    "footer.disclaimer.kicker": "Disclaimer",
    "footer.disclaimer.title": "Exclusiv pentru uz educațional",
    "footer.disclaimer.pill": "Material necomercial",
    "footer.disclaimer.p1":
      "Materialele, modelele, codul, metodologiile, rezultatele și vizualizările puse la dispoziție prin aceste instrumente sunt furnizate exclusiv în scop educațional, de formare și ilustrativ.",
    "footer.disclaimer.p2":
      "Ele nu constituie consultanță juridică, de reglementare, contabilă, de audit, fiscală, de investiții, de risc de credit sau de altă natură profesională și nu trebuie folosite în scopuri de producție, comerciale, către clienți, de reglementare sau critice pentru afacere.",
    "footer.disclaimer.p3":
      "Datele financiare provin din seturile de date deschise publicate de Ministerul Finanțelor pe data.gov.ro (licență CC-BY 4.0) și pot conține erori de raportare. Nu se oferă nicio garanție privind acuratețea sau completitudinea lor.",
    "footer.source": "Sursa datelor: Ministerul Finanțelor · data.gov.ro · Situații financiare anuale",
    "footer.more": "Mai multe informații:",
    "status.ready": "Pregătit",
    "status.waiting": "Se așteaptă date",
    "status.loaded": "Date încărcate",
    "toast.copied": "Copiat în clipboard",
    "toast.sent": "Datele au fost trimise către Atelierul 2",
    "toast.loadedTool1": "Datele din Atelierul 1 au fost preluate",
    "toast.notfound": "CUI negăsit în index. Verifică numărul sau introdu datele manual.",
    "toast.fetchError": "Indexul nu a putut fi citit. Dacă rulezi local, servește fișierele printr-un server web.",
    "toast.csvError": "Fișierul CSV nu a putut fi interpretat. Folosește șablonul.",
    "toast.needData": "Introdu date pentru cel puțin un an.",
    "toast.reset": "Datele au fost șterse",

    // data entry
    "entry.kicker": "Date de intrare",
    "entry.title": "Alege compania și încarcă situațiile financiare",
    "entry.cui.label": "Interogare după CUI",
    "entry.cui.placeholder": "ex. 2816464",
    "entry.cui.button": "Caută",
    "entry.cui.help":
      "Index static construit din situațiile financiare anuale publicate de Ministerul Finanțelor (data.gov.ro). Câmpurile nedisponibile public (datorii pe termen scurt/lung, EBITDA, EBIT) rămân goale și pot fi completate manual.",
    "entry.demo.label": "Companii demo",
    "entry.demo.choose": "Alege o companie…",
    "entry.csv.label": "Import CSV",
    "entry.csv.drop": "Trage aici un fișier CSV sau apasă pentru a alege",
    "entry.csv.hint": "Prima coloană = indicator, următoarele coloane = ani. Descarcă șablonul.",
    "entry.csv.template": "Șablon CSV",
    "entry.manual.title": "Introducere manuală",
    "entry.manual.help": "Valori în lei (RON), fără separatori. Câmpurile marcate * sunt obligatorii pentru calculul de bază.",
    "entry.years": "Ani analizați",
    "entry.company": "Denumire companie",
    "entry.company.placeholder": "ex. Dedeman SRL",
    "entry.caen": "Cod CAEN",
    "entry.employees": "Salariați",
    "entry.analyze": "Analizează",
    "entry.reset": "Resetează",
    "entry.sendTool2": "Trimite către Atelierul 2",
    "entry.loadTool1": "Preia datele din Atelierul 1",
    "entry.balance": "Bilanț",
    "entry.pnl": "Cont de profit și pierdere",
    "entry.assumeST":
      "Dacă datoriile pe termen scurt lipsesc, tratează toate datoriile ca fiind pe termen scurt (ipoteză conservatoare)",
    "entry.proxyEBIT":
      "Dacă EBIT lipsește, folosește profitul brut (înainte de impozitare) ca aproximare",
    "entry.stShare": "Ponderea datoriilor pe termen scurt în datoriile totale (folosită doar când împărțirea lipsește din date)",
    "entry.sourceNote": "Sursă: {source}",
    "entry.source.mfp": "Ministerul Finanțelor · data.gov.ro (index static, actualizat {date})",
    "entry.source.manual": "introducere manuală",
    "entry.source.csv": "fișier CSV",
    "entry.source.demo": "companie demo (date reale MFP)",
    "entry.source.tool1": "Atelierul 1",
    "entry.derived": "derivat",
    "entry.assumed": "ipoteză",
    "entry.missing": "lipsă",

    // fields
    "f.totalAssets": "Active totale",
    "f.fixedAssets": "Active imobilizate",
    "f.currentAssets": "Active curente (circulante)",
    "f.inventories": "Stocuri",
    "f.receivables": "Creanțe",
    "f.cash": "Numerar și echivalente",
    "f.equity": "Capitaluri proprii",
    "f.totalLiabilities": "Datorii totale",
    "f.stLiabilities": "Datorii pe termen scurt",
    "f.ltLiabilities": "Datorii pe termen lung",
    "f.suppliers": "Furnizori",
    "f.revenue": "Cifra de afaceri",
    "f.totalIncome": "Venituri totale",
    "f.totalExpenses": "Cheltuieli totale",
    "f.opex": "Cheltuieli operaționale",
    "f.ebitda": "EBITDA",
    "f.ebit": "EBIT / profit operațional",
    "f.grossProfit": "Profit brut",
    "f.netProfit": "Profit net",
    "f.employees": "Număr mediu salariați",

    // dashboard
    "dash.kicker": "Tablou de bord",
    "dash.stmt": "Situații financiare: structură și dinamică",
    "dash.stmt.sub": "valori absolute, ponderi (analiza structurală) și variații anuale (analiza dinamică)",
    "dash.stmt.structure": "Structură",
    "dash.stmt.dyn": "Dinamică (n / n−1 − 1)",
    "dash.stmt.basis": "100 % = {base}",
    "dash.stmt.note": "∑ = valoare derivată din alte poziții · ≈ = ipoteză (ex. toate datoriile pe termen scurt) · variațiile pentru poziții negative în anul de bază sunt calculate față de valoarea absolută",
    "dash.title": "Ce spun cifrele",
    "dash.kpi.revenue": "Cifra de afaceri",
    "dash.kpi.netProfit": "Profit net",
    "dash.kpi.totalAssets": "Active totale",
    "dash.kpi.equity": "Capitaluri proprii",
    "dash.kpi.vsPrev": "față de anul anterior",
    "dash.assets": "Structura activelor",
    "dash.assets.sub": "% din active totale",
    "dash.financing": "Structura finanțării",
    "dash.financing.sub": "% din total pasive",
    "dash.pnl": "Structura contului de profit și pierdere",
    "dash.pnl.sub": "% din cifra de afaceri",
    "dash.dynamics": "Dinamica principalelor poziții",
    "dash.dynamics.sub": "variație anuală (anul n / anul n-1 − 1)",
    "dash.ratios": "Rate financiare",
    "dash.ratios.sub": "lichiditate, îndatorare, profitabilitate, eficiență",
    "dash.flags": "Semnale de alarmă (red flags)",
    "dash.flags.none": "Nu s-au detectat semnale de alarmă pe baza regulilor definite.",
    "dash.diagnosis": "Diagnostic financiar orientativ",
    "dash.commentary": "Comentariu generat automat",
    "dash.commentary.sub": "generat pe bază de reguli, în browser — fără model LLM; folosește-l ca punct de plecare, nu ca verdict",
    "dash.copy": "Copiază comentariul",
    "dash.print": "Tipărește / salvează PDF",
    "dash.exportCsv": "Exportă indicatorii (CSV)",
    "dash.showTable": "Vezi tabelul",
    "dash.showChart": "Vezi graficul",
    "dash.other": "Alte active",
    "dash.otherLiab": "Alte pasive (provizioane, venituri în avans)",
    "dash.remainder": "Rest (profit / alte elemente)",
    "dash.empty": "Încarcă date pentru a vedea tabloul de bord.",
    "dash.year": "An",
    "dash.indicator": "Indicator",
    "dash.value": "Valoare",
    "dash.status": "Stare",
    "dash.benchmark": "Reper didactic",
    "dash.na": "n/a",
    "dash.legend.fixed": "Active imobilizate",
    "dash.legend.inventories": "Stocuri",
    "dash.legend.receivables": "Creanțe",
    "dash.legend.cash": "Numerar",
    "dash.legend.equity": "Capitaluri proprii",
    "dash.legend.st": "Datorii pe termen scurt",
    "dash.legend.lt": "Datorii pe termen lung",
    "dash.legend.debt": "Datorii totale",
    "dash.legend.expenses": "Cheltuieli totale",
    "dash.legend.net": "Profit net",
    "dash.legend.ebitda": "EBITDA",
    "dash.legend.ebit": "EBIT",
    "dash.legend.opex": "Cheltuieli operaționale",

    // ratios
    "r.currentRatio": "Rata lichidității curente",
    "r.quickRatio": "Rata lichidității rapide",
    "r.cashRatio": "Rata lichidității imediate",
    "r.workingCapital": "Fond de rulment (working capital)",
    "r.debtRatio": "Rata îndatorării (datorii / active)",
    "r.debtToEquity": "Datorii / capitaluri proprii",
    "r.equityRatio": "Rata autonomiei financiare",
    "r.netMargin": "Marja netă",
    "r.roa": "ROA",
    "r.roe": "ROE",
    "r.ebitdaMargin": "Marja EBITDA",
    "r.assetTurnover": "Rotația activelor",
    "r.group.liquidity": "Lichiditate",
    "r.group.leverage": "Îndatorare",
    "r.group.profitability": "Profitabilitate",
    "r.group.efficiency": "Eficiență",
    "r.formula.currentRatio": "Active curente / Datorii curente",
    "r.formula.quickRatio": "(Active curente − Stocuri) / Datorii curente",
    "r.formula.cashRatio": "Numerar / Datorii curente",
    "r.formula.workingCapital": "Active curente − Datorii curente",
    "r.formula.debtRatio": "Datorii totale / Active totale",
    "r.formula.debtToEquity": "Datorii totale / Capitaluri proprii",
    "r.formula.equityRatio": "Capitaluri proprii / Active totale",
    "r.formula.netMargin": "Profit net / Cifra de afaceri",
    "r.formula.roa": "Profit net / Active totale",
    "r.formula.roe": "Profit net / Capitaluri proprii",
    "r.formula.ebitdaMargin": "EBITDA / Cifra de afaceri",
    "r.formula.assetTurnover": "Cifra de afaceri / Active totale",
    "st.good": "bun",
    "st.watch": "atenție",
    "st.weak": "slab",
    "st.na": "indisponibil",

    // dynamics rows
    "d.revenue": "Cifra de afaceri",
    "d.totalAssets": "Active totale",
    "d.totalLiabilities": "Datorii totale",
    "d.equity": "Capitaluri proprii",
    "d.netProfit": "Profit net",
    "d.receivables": "Creanțe",
    "d.inventories": "Stocuri",
    "d.stLiabilities": "Datorii curente",

    // flags
    "flag.negEquity": "Capitaluri proprii negative în {year}",
    "flag.negEquity.why": "Pierderile acumulate au consumat capitalul; creditorii finanțează integral compania.",
    "flag.negProfit": "Profit net negativ în {year}",
    "flag.negProfit.why": "Compania nu își acoperă cheltuielile din venituri.",
    "flag.debtFaster": "Datoriile cresc mai repede decât cifra de afaceri ({year}: datorii {a}, CA {b})",
    "flag.debtFaster.why": "Îndatorarea se acumulează fără o creștere corespunzătoare a activității.",
    "flag.recFaster": "Creanțele cresc mai repede decât cifra de afaceri ({year}: creanțe {a}, CA {b})",
    "flag.recFaster.why": "Posibile probleme de încasare sau vânzări forțate cu termene lungi.",
    "flag.invFaster": "Stocurile cresc mai repede decât cifra de afaceri ({year}: stocuri {a}, CA {b})",
    "flag.invFaster.why": "Posibile stocuri nevandabile sau supra-aprovizionare.",
    "flag.currentBelow1": "Rata lichidității curente sub 1 în {year} ({v})",
    "flag.currentBelow1.why": "Activele curente nu acoperă datoriile scadente sub un an.",
    "flag.highDE": "Datorii / capitaluri proprii ridicat în {year} ({v})",
    "flag.highDE.why": "Structura de finanțare depinde puternic de creditori.",
    "flag.marginDown": "Marja netă în scădere ({year}: {a} → {b})",
    "flag.marginDown.why": "Profitabilitatea se erodează: costuri în creștere sau presiune pe prețuri.",
    "flag.lowCash": "Numerar redus față de datoriile curente în {year} (rata lichidității imediate {v})",
    "flag.lowCash.why": "Rezerve de lichiditate mici; dependență de încasări sau de refinanțare.",
    "flag.revDown": "Cifra de afaceri în scădere în {year} ({v})",
    "flag.revDown.why": "Contracție a activității; verifică dacă este conjuncturală sau structurală.",
    "flag.sev.high": "sever",
    "flag.sev.med": "moderat",
    "flag.sev.low": "de urmărit",

    // diagnosis
    "diag.score": "Scor de alarmă",
    "diag.level.low": "Profil financiar solid",
    "diag.level.mid": "Profil financiar cu vulnerabilități",
    "diag.level.high": "Profil financiar fragil",
    "diag.level.crit": "Semnale de dificultate financiară",
    "diag.note":
      "Diagnostic orientativ bazat pe numărul și severitatea semnalelor de alarmă. Nu înlocuiește o analiză completă (fluxuri de numerar, garanții, context de piață).",

    // commentary headings
    "c.balance": "Ce arată bilanțul",
    "c.pnl": "Ce arată contul de profit și pierdere",
    "c.improved": "Ce s-a îmbunătățit",
    "c.worsened": "Ce s-a deteriorat",
    "c.risks": "Principalele semnale de risc",
    "c.questions": "Întrebări pentru management",
    "c.none": "nimic notabil pe baza datelor disponibile",

    // tool2
    "t2.score.kicker": "Scorecard",
    "t2.score.title": "Construiește scorul financiar",
    "t2.score.help":
      "Fiecare rată primește 1–5 puncte în funcție de praguri, apoi punctele sunt ponderate. Modifică pragurile și ponderile pentru a vedea cum se schimbă scorul.",
    "t2.criterion": "Criteriu",
    "t2.value": "Valoare ({year})",
    "t2.points": "Puncte",
    "t2.weight": "Pondere",
    "t2.thresholds": "Praguri (1 → 5 puncte)",
    "t2.contribution": "Contribuție",
    "t2.total": "Scor total",
    "t2.class": "Clasă de rating orientativă",
    "t2.resetWeights": "Praguri și ponderi implicite",
    "t2.year": "Anul evaluat",
    "t2.qual.kicker": "Ajustare calitativă",
    "t2.qual.title": "Factori calitativi (overlay)",
    "t2.qual.help": "Ajustări în trepte (notches) aplicate clasei cantitative — la fel cum face un analist de credit.",
    "t2.qual.mgmt": "Calitatea managementului și guvernanța",
    "t2.qual.industry": "Perspectiva sectorului",
    "t2.qual.data": "Calitatea informațiilor financiare",
    "t2.qual.opt.neg2": "foarte slabă (−2)",
    "t2.qual.opt.neg1": "slabă (−1)",
    "t2.qual.opt.zero": "neutră (0)",
    "t2.qual.opt.pos1": "bună (+1)",
    "t2.qual.finalClass": "Clasă finală",
    "t2.altman.kicker": "Model de referință",
    "t2.altman.title": "Altman Z''-score (firme private, non-producție)",
    "t2.altman.help":
      "Z'' = 6,56·X1 + 3,26·X2 + 6,72·X3 + 1,05·X4. Zone: > 2,6 sigură · 1,1–2,6 gri · < 1,1 dificultate. Formulă didactică — nu este calibrată pe economia românească.",
    "t2.altman.x1": "X1 = Fond de rulment / Active totale",
    "t2.altman.x2": "X2 = Rezultat reportat (capitaluri − capital social) / Active totale",
    "t2.altman.x3": "X3 = EBIT / Active totale",
    "t2.altman.x4": "X4 = Capitaluri proprii / Datorii totale",
    "t2.altman.zone.safe": "zonă sigură",
    "t2.altman.zone.grey": "zonă gri",
    "t2.altman.zone.distress": "zonă de dificultate",
    "t2.altman.x2note": "X2 aproximat cu (capitaluri proprii − capital social) / active totale; introdu capitalul social pentru o valoare mai exactă.",
    "t2.shareCapital": "Capital social (subscris vărsat)",
    "t2.memo.kicker": "Mini-memo de risc",
    "t2.memo.title": "Memo generat automat",
    "t2.memo.help": "Structură standard de memo de credit, completată din scor, rate și semnale de alarmă. Editează textul înainte de a-l folosi.",
    "t2.memo.copy": "Copiază memo-ul",
    "t2.memo.regen": "Regenerează",
    "t2.memo.download": "Descarcă (.md)",
    "t2.class.A": "A — risc scăzut",
    "t2.class.B": "B — risc moderat-scăzut",
    "t2.class.C": "C — risc mediu",
    "t2.class.D": "D — risc ridicat",
    "t2.class.E": "E — risc foarte ridicat",
    "t2.scale.kicker": "Scala de rating",
    "t2.scale.title": "Mapare scor → clasă",
    "t2.crit.currentRatio": "Lichiditate curentă",
    "t2.crit.equityRatio": "Autonomie financiară",
    "t2.crit.debtToEquity": "Datorii / capitaluri",
    "t2.crit.netMargin": "Marjă netă",
    "t2.crit.roa": "ROA",
    "t2.crit.assetTurnover": "Rotația activelor",
    "t2.crit.revenueGrowth": "Creșterea cifrei de afaceri",
    "t2.crit.cashRatio": "Lichiditate imediată",
    "t2.lower": "mai mic e mai bine",
    "t2.higher": "mai mare e mai bine",
    "t2.empty": "Încarcă date (CUI, demo, CSV, manual sau din Atelierul 1) pentru a construi scorul.",
    "t2.sens.kicker": "Sensibilitate",
    "t2.sens.title": "Cum se schimbă scorul dacă…",
    "t2.sens.help": "Simulează un șoc pe o singură variabilă și vezi efectul asupra scorului și clasei.",
    "t2.sens.var": "Variabilă",
    "t2.sens.shock": "Șoc",
    "t2.sens.result": "Scor / clasă rezultată",
    "t2.sens.base": "scenariu de bază",
    "t2.sens.note": "Șocul pe cifra de afaceri mută proporțional și liniile de profit (marje constante); șocurile pe active curente ajustează și activele totale.",

    "memo.title": "MEMO DE RISC (orientativ)",
    "memo.company": "Companie",
    "memo.period": "Perioada analizată",
    "memo.date": "Data",
    "memo.s1": "1. Concluzie și clasă de rating",
    "memo.s2": "2. Profil financiar",
    "memo.s3": "3. Puncte forte",
    "memo.s4": "4. Puncte slabe și semnale de alarmă",
    "memo.s5": "5. Model de referință (Altman Z'')",
    "memo.s6": "6. Întrebări pentru management / informații suplimentare necesare",
    "memo.s7": "7. Recomandare orientativă",
    "memo.rec.A": "Profil compatibil cu o expunere standard; monitorizare anuală.",
    "memo.rec.B": "Profil acceptabil; se recomandă covenant-uri uzuale și monitorizare semestrială.",
    "memo.rec.C": "Expunere posibilă doar cu structurare atentă (garanții, covenant-uri, limite); monitorizare trimestrială.",
    "memo.rec.D": "Apetit redus; expunere doar cu garanții solide și plan de redresare credibil.",
    "memo.rec.E": "În afara apetitului de risc în lipsa unei restructurări; se recomandă evitarea de expuneri noi.",
    "memo.disclaimer": "Generat automat pe bază de reguli, în scop didactic. Nu constituie o evaluare de credit.",

    // landing
    "home.eyebrow": "Analiză financiară și instrumente AI",
    "home.title": "Ateliere AI pentru analiza financiară",
    "home.text":
      "Două instrumente interactive folosite în curs: transformă situațiile financiare în structuri, trenduri, rate și semnale de alarmă, apoi construiește un scor financiar și un mini-memo de risc. Totul rulează în browser, cu date reale ale companiilor din România.",
    "home.tool1.kicker": "Atelier AI 1",
    "home.tool1.title": "Analiza automată a situațiilor financiare",
    "home.tool1.text": "Structură, trenduri, rate financiare, red flags și comentariu automat pe 2–3 ani de date.",
    "home.tool2.kicker": "Atelier AI 2",
    "home.tool2.title": "Scor financiar și mini-memo de risc",
    "home.tool2.text": "Scorecard cu praguri și ponderi ajustabile, Altman Z''-score și memo de risc generat automat.",
    "home.open": "Deschide instrumentul",
    "home.data.kicker": "Date reale",
    "home.data.title": "Interogare după CUI",
    "home.data.text":
      "Indexul conține indicatorii din situațiile financiare anuale depuse la Ministerul Finanțelor pentru anii {years}, publicate ca date deschise pe data.gov.ro.",
    "home.data.count": "companii în index",
    "home.data.updated": "actualizat",
    "home.qr": "Scanează pentru a deschide",
    "home.qr.caption": "Instrumentele live pe GitHub Pages",
    "home.course": "Cursul pe CorpQuants",

    // tool1 hero
    "t1.eyebrow": "Atelier AI 1",
    "t1.title": "Analiza automată a situațiilor financiare",
    "t1.text":
      "Încarcă 2–3 ani de bilanț și cont de profit și pierdere — după CUI, din CSV sau manual — și obține instant structura, dinamica, ratele financiare, semnalele de alarmă și un comentariu de analiză.",
    "t2.eyebrow": "Atelier AI 2",
    "t2.title": "Scor financiar și mini-memo de risc",
    "t2.text":
      "Construiește pas cu pas un scor din ratele financiare, compară-l cu Altman Z'' și generează un mini-memo de risc pe care îl poți edita.",
    "hero.company": "Companie",
    "hero.years": "Ani",
    "hero.status": "Stare",
    "hero.none": "—",
  },

  en: {
    "nav.home": "Home",
    "nav.tool1": "Workshop 1 · Automated analysis",
    "nav.tool2": "Workshop 2 · Score & risk memo",
    "nav.course": "The course",
    "lang.label": "Language",
    "footer.disclaimer.kicker": "Disclaimer",
    "footer.disclaimer.title": "Educational use only",
    "footer.disclaimer.pill": "Non-commercial material",
    "footer.disclaimer.p1":
      "The materials, models, code, methodologies, outputs, and visualizations made available through these tools are provided solely for educational, training, and illustrative purposes.",
    "footer.disclaimer.p2":
      "They do not constitute legal, regulatory, accounting, audit, tax, investment, credit risk, or any other professional advice, and they must not be relied upon for production, commercial, client-facing, regulatory, or other business-critical use cases.",
    "footer.disclaimer.p3":
      "Financial data comes from the open datasets published by the Romanian Ministry of Finance on data.gov.ro (CC-BY 4.0 licence) and may contain reporting errors. No warranty is given as to accuracy or completeness.",
    "footer.source": "Data source: Ministry of Finance · data.gov.ro · annual financial statements",
    "footer.more": "More information:",
    "status.ready": "Ready",
    "status.waiting": "Waiting for data",
    "status.loaded": "Data loaded",
    "toast.copied": "Copied to clipboard",
    "toast.sent": "Data sent to Workshop 2",
    "toast.loadedTool1": "Data from Workshop 1 loaded",
    "toast.notfound": "CUI not found in the index. Check the number or enter the data manually.",
    "toast.fetchError": "The index could not be read. If running locally, serve the files through a web server.",
    "toast.csvError": "The CSV file could not be parsed. Use the template.",
    "toast.needData": "Enter data for at least one year.",
    "toast.reset": "Data cleared",

    "entry.kicker": "Input data",
    "entry.title": "Pick the company and load the financial statements",
    "entry.cui.label": "Look up by CUI (tax ID)",
    "entry.cui.placeholder": "e.g. 2816464",
    "entry.cui.button": "Search",
    "entry.cui.help":
      "Static index built from the annual financial statements published by the Ministry of Finance (data.gov.ro). Fields that are not public (short/long-term debt, EBITDA, EBIT) stay empty and can be filled in manually.",
    "entry.demo.label": "Demo companies",
    "entry.demo.choose": "Choose a company…",
    "entry.csv.label": "CSV import",
    "entry.csv.drop": "Drop a CSV file here or click to browse",
    "entry.csv.hint": "First column = indicator, next columns = years. Download the template.",
    "entry.csv.template": "CSV template",
    "entry.manual.title": "Manual entry",
    "entry.manual.help": "Values in RON, no separators. Fields marked * are required for the core calculations.",
    "entry.years": "Years analysed",
    "entry.company": "Company name",
    "entry.company.placeholder": "e.g. Dedeman SRL",
    "entry.caen": "CAEN code",
    "entry.employees": "Employees",
    "entry.analyze": "Analyse",
    "entry.reset": "Reset",
    "entry.sendTool2": "Send to Workshop 2",
    "entry.loadTool1": "Load data from Workshop 1",
    "entry.balance": "Balance sheet",
    "entry.pnl": "Income statement",
    "entry.assumeST": "If short-term debt is missing, treat all debt as short-term (conservative assumption)",
    "entry.proxyEBIT": "If EBIT is missing, use pre-tax profit as a proxy",
    "entry.stShare": "Share of short-term liabilities in total liabilities (used only when the split is missing from the data)",
    "entry.sourceNote": "Source: {source}",
    "entry.source.mfp": "Ministry of Finance · data.gov.ro (static index, updated {date})",
    "entry.source.manual": "manual entry",
    "entry.source.csv": "CSV file",
    "entry.source.demo": "demo company (real MoF data)",
    "entry.source.tool1": "Workshop 1",
    "entry.derived": "derived",
    "entry.assumed": "assumed",
    "entry.missing": "missing",

    "f.totalAssets": "Total assets",
    "f.fixedAssets": "Fixed (non-current) assets",
    "f.currentAssets": "Current assets",
    "f.inventories": "Inventories",
    "f.receivables": "Receivables",
    "f.cash": "Cash and equivalents",
    "f.equity": "Equity",
    "f.totalLiabilities": "Total liabilities",
    "f.stLiabilities": "Short-term liabilities",
    "f.ltLiabilities": "Long-term liabilities",
    "f.suppliers": "Trade payables",
    "f.revenue": "Revenue (turnover)",
    "f.totalIncome": "Total income",
    "f.totalExpenses": "Total expenses",
    "f.opex": "Operating expenses",
    "f.ebitda": "EBITDA",
    "f.ebit": "EBIT / operating profit",
    "f.grossProfit": "Pre-tax profit",
    "f.netProfit": "Net profit",
    "f.employees": "Average employees",

    "dash.kicker": "Dashboard",
    "dash.stmt": "Financial statements: structure and dynamics",
    "dash.stmt.sub": "absolute values, shares (structural analysis) and annual changes (dynamic analysis)",
    "dash.stmt.structure": "Structure",
    "dash.stmt.dyn": "Dynamics (n / n−1 − 1)",
    "dash.stmt.basis": "100 % = {base}",
    "dash.stmt.note": "∑ = derived from other items · ≈ = assumption (e.g. all liabilities short-term) · changes for items negative in the base year are computed against the absolute value",
    "dash.title": "What the numbers say",
    "dash.kpi.revenue": "Revenue",
    "dash.kpi.netProfit": "Net profit",
    "dash.kpi.totalAssets": "Total assets",
    "dash.kpi.equity": "Equity",
    "dash.kpi.vsPrev": "vs previous year",
    "dash.assets": "Asset structure",
    "dash.assets.sub": "% of total assets",
    "dash.financing": "Financing structure",
    "dash.financing.sub": "% of total liabilities & equity",
    "dash.pnl": "Income statement structure",
    "dash.pnl.sub": "% of revenue",
    "dash.dynamics": "Dynamics of the main items",
    "dash.dynamics.sub": "annual change (year n / year n-1 − 1)",
    "dash.ratios": "Financial ratios",
    "dash.ratios.sub": "liquidity, leverage, profitability, efficiency",
    "dash.flags": "Red flags",
    "dash.flags.none": "No red flags detected under the defined rules.",
    "dash.diagnosis": "Indicative financial diagnosis",
    "dash.commentary": "Auto-generated commentary",
    "dash.commentary.sub": "rule-based, generated in the browser — no LLM; use it as a starting point, not a verdict",
    "dash.copy": "Copy commentary",
    "dash.print": "Print / save as PDF",
    "dash.exportCsv": "Export indicators (CSV)",
    "dash.showTable": "Show table",
    "dash.showChart": "Show chart",
    "dash.other": "Other assets",
    "dash.otherLiab": "Other (provisions, deferred income)",
    "dash.remainder": "Remainder (profit / other items)",
    "dash.empty": "Load data to see the dashboard.",
    "dash.year": "Year",
    "dash.indicator": "Indicator",
    "dash.value": "Value",
    "dash.status": "Status",
    "dash.benchmark": "Teaching benchmark",
    "dash.na": "n/a",
    "dash.legend.fixed": "Fixed assets",
    "dash.legend.inventories": "Inventories",
    "dash.legend.receivables": "Receivables",
    "dash.legend.cash": "Cash",
    "dash.legend.equity": "Equity",
    "dash.legend.st": "Short-term liabilities",
    "dash.legend.lt": "Long-term liabilities",
    "dash.legend.debt": "Total liabilities",
    "dash.legend.expenses": "Total expenses",
    "dash.legend.net": "Net profit",
    "dash.legend.ebitda": "EBITDA",
    "dash.legend.ebit": "EBIT",
    "dash.legend.opex": "Operating expenses",

    "r.currentRatio": "Current ratio",
    "r.quickRatio": "Quick ratio",
    "r.cashRatio": "Cash ratio",
    "r.workingCapital": "Working capital",
    "r.debtRatio": "Debt ratio",
    "r.debtToEquity": "Debt to equity",
    "r.equityRatio": "Equity ratio",
    "r.netMargin": "Net margin",
    "r.roa": "ROA",
    "r.roe": "ROE",
    "r.ebitdaMargin": "EBITDA margin",
    "r.assetTurnover": "Asset turnover",
    "r.group.liquidity": "Liquidity",
    "r.group.leverage": "Leverage",
    "r.group.profitability": "Profitability",
    "r.group.efficiency": "Efficiency",
    "r.formula.currentRatio": "Current assets / Current liabilities",
    "r.formula.quickRatio": "(Current assets − Inventories) / Current liabilities",
    "r.formula.cashRatio": "Cash / Current liabilities",
    "r.formula.workingCapital": "Current assets − Current liabilities",
    "r.formula.debtRatio": "Total liabilities / Total assets",
    "r.formula.debtToEquity": "Total liabilities / Equity",
    "r.formula.equityRatio": "Equity / Total assets",
    "r.formula.netMargin": "Net profit / Revenue",
    "r.formula.roa": "Net profit / Total assets",
    "r.formula.roe": "Net profit / Equity",
    "r.formula.ebitdaMargin": "EBITDA / Revenue",
    "r.formula.assetTurnover": "Revenue / Total assets",
    "st.good": "good",
    "st.watch": "watch",
    "st.weak": "weak",
    "st.na": "unavailable",

    "d.revenue": "Revenue",
    "d.totalAssets": "Total assets",
    "d.totalLiabilities": "Total liabilities",
    "d.equity": "Equity",
    "d.netProfit": "Net profit",
    "d.receivables": "Receivables",
    "d.inventories": "Inventories",
    "d.stLiabilities": "Current liabilities",

    "flag.negEquity": "Negative equity in {year}",
    "flag.negEquity.why": "Accumulated losses have consumed the capital; creditors fully finance the company.",
    "flag.negProfit": "Net loss in {year}",
    "flag.negProfit.why": "The company does not cover its expenses from income.",
    "flag.debtFaster": "Liabilities growing faster than revenue ({year}: debt {a}, revenue {b})",
    "flag.debtFaster.why": "Leverage builds up without a matching increase in activity.",
    "flag.recFaster": "Receivables growing faster than revenue ({year}: receivables {a}, revenue {b})",
    "flag.recFaster.why": "Possible collection problems or forced sales on long terms.",
    "flag.invFaster": "Inventories growing faster than revenue ({year}: inventories {a}, revenue {b})",
    "flag.invFaster.why": "Possible unsaleable stock or over-purchasing.",
    "flag.currentBelow1": "Current ratio below 1 in {year} ({v})",
    "flag.currentBelow1.why": "Current assets do not cover liabilities due within a year.",
    "flag.highDE": "High debt to equity in {year} ({v})",
    "flag.highDE.why": "The financing structure relies heavily on creditors.",
    "flag.marginDown": "Net margin declining ({year}: {a} → {b})",
    "flag.marginDown.why": "Profitability is eroding: rising costs or price pressure.",
    "flag.lowCash": "Low cash relative to current liabilities in {year} (cash ratio {v})",
    "flag.lowCash.why": "Thin liquidity buffer; dependence on collections or refinancing.",
    "flag.revDown": "Revenue declining in {year} ({v})",
    "flag.revDown.why": "Activity is contracting; check whether cyclical or structural.",
    "flag.sev.high": "severe",
    "flag.sev.med": "moderate",
    "flag.sev.low": "watch",

    "diag.score": "Alert score",
    "diag.level.low": "Solid financial profile",
    "diag.level.mid": "Financial profile with vulnerabilities",
    "diag.level.high": "Fragile financial profile",
    "diag.level.crit": "Signs of financial distress",
    "diag.note":
      "Indicative diagnosis based on the number and severity of red flags. It does not replace a full analysis (cash flows, collateral, market context).",

    "c.balance": "What the balance sheet shows",
    "c.pnl": "What the income statement shows",
    "c.improved": "What improved",
    "c.worsened": "What deteriorated",
    "c.risks": "Main risk signals",
    "c.questions": "Questions for management",
    "c.none": "nothing notable based on the available data",

    "t2.score.kicker": "Scorecard",
    "t2.score.title": "Build the financial score",
    "t2.score.help":
      "Each ratio receives 1–5 points based on thresholds, then the points are weighted. Change thresholds and weights to see how the score moves.",
    "t2.criterion": "Criterion",
    "t2.value": "Value ({year})",
    "t2.points": "Points",
    "t2.weight": "Weight",
    "t2.thresholds": "Thresholds (1 → 5 points)",
    "t2.contribution": "Contribution",
    "t2.total": "Total score",
    "t2.class": "Indicative rating class",
    "t2.resetWeights": "Default thresholds & weights",
    "t2.year": "Year assessed",
    "t2.qual.kicker": "Qualitative overlay",
    "t2.qual.title": "Qualitative factors",
    "t2.qual.help": "Notch adjustments applied to the quantitative class — the way a credit analyst would.",
    "t2.qual.mgmt": "Management quality and governance",
    "t2.qual.industry": "Industry outlook",
    "t2.qual.data": "Quality of financial information",
    "t2.qual.opt.neg2": "very weak (−2)",
    "t2.qual.opt.neg1": "weak (−1)",
    "t2.qual.opt.zero": "neutral (0)",
    "t2.qual.opt.pos1": "good (+1)",
    "t2.qual.finalClass": "Final class",
    "t2.altman.kicker": "Reference model",
    "t2.altman.title": "Altman Z''-score (private, non-manufacturing firms)",
    "t2.altman.help":
      "Z'' = 6.56·X1 + 3.26·X2 + 6.72·X3 + 1.05·X4. Zones: > 2.6 safe · 1.1–2.6 grey · < 1.1 distress. Teaching formula — not calibrated on the Romanian economy.",
    "t2.altman.x1": "X1 = Working capital / Total assets",
    "t2.altman.x2": "X2 = Retained earnings (equity − share capital) / Total assets",
    "t2.altman.x3": "X3 = EBIT / Total assets",
    "t2.altman.x4": "X4 = Book equity / Total liabilities",
    "t2.altman.zone.safe": "safe zone",
    "t2.altman.zone.grey": "grey zone",
    "t2.altman.zone.distress": "distress zone",
    "t2.altman.x2note": "X2 approximated as (equity − share capital) / total assets; enter share capital for a more precise value.",
    "t2.shareCapital": "Share capital (paid-in)",
    "t2.memo.kicker": "Mini risk memo",
    "t2.memo.title": "Auto-generated memo",
    "t2.memo.help": "Standard credit memo structure, filled from the score, ratios and red flags. Edit the text before using it.",
    "t2.memo.copy": "Copy memo",
    "t2.memo.regen": "Regenerate",
    "t2.memo.download": "Download (.md)",
    "t2.class.A": "A — low risk",
    "t2.class.B": "B — moderate-low risk",
    "t2.class.C": "C — medium risk",
    "t2.class.D": "D — high risk",
    "t2.class.E": "E — very high risk",
    "t2.scale.kicker": "Rating scale",
    "t2.scale.title": "Score → class mapping",
    "t2.crit.currentRatio": "Current ratio",
    "t2.crit.equityRatio": "Equity ratio",
    "t2.crit.debtToEquity": "Debt to equity",
    "t2.crit.netMargin": "Net margin",
    "t2.crit.roa": "ROA",
    "t2.crit.assetTurnover": "Asset turnover",
    "t2.crit.revenueGrowth": "Revenue growth",
    "t2.crit.cashRatio": "Cash ratio",
    "t2.lower": "lower is better",
    "t2.higher": "higher is better",
    "t2.empty": "Load data (CUI, demo, CSV, manual or from Workshop 1) to build the score.",
    "t2.sens.kicker": "Sensitivity",
    "t2.sens.title": "How the score changes if…",
    "t2.sens.help": "Shock a single variable and see the effect on the score and class.",
    "t2.sens.var": "Variable",
    "t2.sens.shock": "Shock",
    "t2.sens.result": "Resulting score / class",
    "t2.sens.base": "base case",
    "t2.sens.note": "A revenue shock moves the profit lines proportionally (constant margins); shocks on current-asset items also adjust total assets.",

    "memo.title": "RISK MEMO (indicative)",
    "memo.company": "Company",
    "memo.period": "Period analysed",
    "memo.date": "Date",
    "memo.s1": "1. Conclusion and rating class",
    "memo.s2": "2. Financial profile",
    "memo.s3": "3. Strengths",
    "memo.s4": "4. Weaknesses and red flags",
    "memo.s5": "5. Reference model (Altman Z'')",
    "memo.s6": "6. Questions for management / additional information required",
    "memo.s7": "7. Indicative recommendation",
    "memo.rec.A": "Profile consistent with a standard exposure; annual monitoring.",
    "memo.rec.B": "Acceptable profile; usual covenants and semi-annual monitoring recommended.",
    "memo.rec.C": "Exposure possible only with careful structuring (collateral, covenants, limits); quarterly monitoring.",
    "memo.rec.D": "Low appetite; exposure only against strong collateral and a credible turnaround plan.",
    "memo.rec.E": "Outside risk appetite absent a restructuring; avoid new exposures.",
    "memo.disclaimer": "Generated automatically by rules, for teaching purposes. Not a credit assessment.",

    "home.eyebrow": "Financial analysis and AI tools",
    "home.title": "AI workshops for financial analysis",
    "home.text":
      "Two interactive tools used in the course: turn financial statements into structures, trends, ratios and red flags, then build a financial score and a mini risk memo. Everything runs in the browser, with real data on Romanian companies.",
    "home.tool1.kicker": "AI Workshop 1",
    "home.tool1.title": "Automated financial statement analysis",
    "home.tool1.text": "Structure, trends, financial ratios, red flags and automatic commentary on 2–3 years of data.",
    "home.tool2.kicker": "AI Workshop 2",
    "home.tool2.title": "Financial score and mini risk memo",
    "home.tool2.text": "Scorecard with adjustable thresholds and weights, Altman Z''-score and an auto-generated risk memo.",
    "home.open": "Open the tool",
    "home.data.kicker": "Real data",
    "home.data.title": "Look-up by CUI",
    "home.data.text":
      "The index holds the indicators from the annual financial statements filed with the Ministry of Finance for {years}, published as open data on data.gov.ro.",
    "home.data.count": "companies in the index",
    "home.data.updated": "updated",
    "home.qr": "Scan to open",
    "home.qr.caption": "Live tools on GitHub Pages",
    "home.course": "The course on CorpQuants",

    "t1.eyebrow": "AI Workshop 1",
    "t1.title": "Automated financial statement analysis",
    "t1.text":
      "Load 2–3 years of balance sheet and income statement — by CUI, from CSV or manually — and instantly get the structure, dynamics, financial ratios, red flags and an analytical commentary.",
    "t2.eyebrow": "AI Workshop 2",
    "t2.title": "Financial score and mini risk memo",
    "t2.text":
      "Build a score from financial ratios step by step, compare it with Altman Z'' and generate an editable mini risk memo.",
    "hero.company": "Company",
    "hero.years": "Years",
    "hero.status": "Status",
    "hero.none": "—",
  },
};

let currentLang = "ro";
try {
  const saved = localStorage.getItem("fin.lang");
  if (saved && LANGS.includes(saved)) currentLang = saved;
} catch (e) {}

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  currentLang = lang;
  try {
    localStorage.setItem("fin.lang", lang);
  } catch (e) {}
  document.documentElement.lang = lang;
  applyStaticTranslations();
  document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
}

export function t(key, vars) {
  const dict = I18N[currentLang] || I18N.ro;
  let s = dict[key] ?? I18N.ro[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

export function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll(".lang-switch button").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.lang === currentLang);
    b.setAttribute("aria-pressed", b.dataset.lang === currentLang ? "true" : "false");
  });
}

export function initLangSwitch() {
  document.querySelectorAll(".lang-switch button").forEach((b) => {
    b.addEventListener("click", () => setLang(b.dataset.lang));
  });
  document.documentElement.lang = currentLang;
  applyStaticTranslations();
}

// ---------------------------------------------------------------- formatting
const localeOf = () => (currentLang === "ro" ? "ro-RO" : "en-GB");

export function isNum(v) {
  return typeof v === "number" && Number.isFinite(v);
}

export function fmtMoney(v, opts = {}) {
  if (!isNum(v)) return t("dash.na");
  const abs = Math.abs(v);
  const loc = localeOf();
  const sign = v < 0 ? "−" : "";
  const unitRO = { b: " mld", m: " mil", k: " mii" };
  const unitEN = { b: "bn", m: "m", k: "k" };
  const u = currentLang === "ro" ? unitRO : unitEN;
  const dec = opts.decimals ?? 2;
  if (abs >= 1e9) return sign + (abs / 1e9).toLocaleString(loc, { maximumFractionDigits: dec }) + u.b;
  if (abs >= 1e6) return sign + (abs / 1e6).toLocaleString(loc, { maximumFractionDigits: dec }) + u.m;
  if (abs >= 1e4) return sign + (abs / 1e3).toLocaleString(loc, { maximumFractionDigits: dec }) + u.k;
  return sign + abs.toLocaleString(loc, { maximumFractionDigits: 0 });
}

export function fmtFull(v) {
  if (!isNum(v)) return t("dash.na");
  return v.toLocaleString(localeOf(), { maximumFractionDigits: 0 });
}

export function fmtPct(v, dec = 1) {
  if (!isNum(v)) return t("dash.na");
  const s = (v * 100).toLocaleString(localeOf(), { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return (v < 0 ? "−" : "") + s.replace("-", "") + " %";
}

export function fmtSignedPct(v, dec = 1) {
  if (!isNum(v)) return t("dash.na");
  const s = (Math.abs(v) * 100).toLocaleString(localeOf(), { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return (v < 0 ? "−" : "+") + s + " %";
}

export function fmtRatio(v, dec = 2) {
  if (!isNum(v)) return t("dash.na");
  return (v < 0 ? "−" : "") + Math.abs(v).toLocaleString(localeOf(), { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export function parseNumber(str) {
  if (str == null) return null;
  if (typeof str === "number") return Number.isFinite(str) ? str : null;
  let s = String(str).trim();
  if (!s) return null;
  s = s.replace(/\s/g, "").replace(/lei|ron/gi, "");
  // handle 1.234.567,89 and 1,234,567.89
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (lastComma > -1) {
    const parts = s.split(",");
    if (parts.length === 2 && parts[1].length <= 2) s = s.replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (lastDot > -1) {
    const parts = s.split(".");
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) s = s.replace(/\./g, "");
  }
  const n = Number(s.replace("−", "-"));
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------- data model
export const FIELDS = [
  // balance sheet
  { key: "totalAssets", group: "bs", required: true },
  { key: "fixedAssets", group: "bs", required: true },
  { key: "currentAssets", group: "bs", required: true },
  { key: "inventories", group: "bs" },
  { key: "receivables", group: "bs" },
  { key: "cash", group: "bs" },
  { key: "equity", group: "bs", required: true },
  { key: "totalLiabilities", group: "bs", required: true },
  { key: "stLiabilities", group: "bs" },
  { key: "ltLiabilities", group: "bs" },
  { key: "suppliers", group: "bs" },
  // income statement
  { key: "revenue", group: "pl", required: true },
  { key: "totalIncome", group: "pl" },
  { key: "totalExpenses", group: "pl" },
  { key: "opex", group: "pl" },
  { key: "ebitda", group: "pl" },
  { key: "ebit", group: "pl" },
  { key: "grossProfit", group: "pl" },
  { key: "netProfit", group: "pl", required: true },
];

export const CSV_ALIASES = {
  totalAssets: ["active totale", "total active", "total assets", "totalassets"],
  fixedAssets: ["active imobilizate", "fixed assets", "non-current assets", "fixedassets"],
  currentAssets: ["active curente", "active circulante", "current assets", "currentassets"],
  inventories: ["stocuri", "inventories", "inventory"],
  receivables: ["creante", "creanțe", "receivables"],
  cash: ["numerar", "casa si conturi la banci", "cash", "disponibilitati", "disponibilități"],
  equity: ["capitaluri proprii", "capitaluri", "equity"],
  totalLiabilities: ["datorii totale", "datorii", "total liabilities", "liabilities"],
  stLiabilities: ["datorii pe termen scurt", "datorii curente", "short-term liabilities", "current liabilities"],
  ltLiabilities: ["datorii pe termen lung", "long-term liabilities", "non-current liabilities"],
  suppliers: ["furnizori", "suppliers", "trade payables", "payables"],
  revenue: ["cifra de afaceri", "cifra de afaceri neta", "revenue", "turnover", "sales"],
  totalIncome: ["venituri totale", "total income", "total revenue"],
  totalExpenses: ["cheltuieli totale", "total expenses"],
  opex: ["cheltuieli operationale", "cheltuieli operaționale", "operating expenses", "opex"],
  ebitda: ["ebitda"],
  ebit: ["ebit", "profit operational", "profit operațional", "operating profit"],
  grossProfit: ["profit brut", "pre-tax profit", "profit before tax"],
  netProfit: ["profit net", "rezultat net", "net profit", "net income"],
};

/** Empty dataset skeleton: { company, cui, caen, employees, years:[...], values:{year:{field:number|null}}, meta:{year:{field:'mfp'|'manual'|'derived'|'assumed'}} } */
export function emptyDataset() {
  return { company: "", cui: "", caen: "", employees: {}, years: [], values: {}, meta: {}, source: "manual", shareCapital: {} };
}

/** MFP row [I1..I20] -> field map (RON). */
export function fromMfpRow(row) {
  const g = (i) => (row[i] == null || row[i] === "" ? null : Number(row[i]));
  const fixed = g(0),
    current = g(1),
    inv = g(2),
    rec = g(3),
    cash = g(4),
    prepaid = g(5),
    debts = g(6),
    deferred = g(7),
    provisions = g(8),
    equity = g(9),
    shareCapital = g(10),
    revenue = g(12),
    totalIncome = g(13),
    totalExpenses = g(14),
    grossP = g(15),
    grossL = g(16),
    netP = g(17),
    netL = g(18),
    employees = g(19);
  const totalAssets = (fixed || 0) + (current || 0) + (prepaid || 0);
  const grossProfit = (grossP || 0) - (grossL || 0);
  const netProfit = (netP || 0) - (netL || 0);
  return {
    values: {
      totalAssets,
      fixedAssets: fixed,
      currentAssets: current,
      inventories: inv,
      receivables: rec,
      cash,
      equity,
      totalLiabilities: debts,
      stLiabilities: null,
      ltLiabilities: null,
      suppliers: null,
      revenue,
      totalIncome,
      totalExpenses,
      opex: null,
      ebitda: null,
      ebit: null,
      grossProfit,
      netProfit,
    },
    extra: { prepaid, deferred, provisions, shareCapital, employees },
  };
}

// ---------------------------------------------------------------- data access (CUI index)
const SHARDS = 1000;
let manifestCache = null;

export function dataBase() {
  // works both at repo root and when pages are in the root folder
  return "./data/";
}

export async function loadManifest() {
  if (manifestCache) return manifestCache;
  const r = await fetch(dataBase() + "manifest.json", { cache: "force-cache" });
  if (!r.ok) throw new Error("manifest");
  manifestCache = await r.json();
  return manifestCache;
}

async function fetchShard(shard, manifest) {
  const gz = manifest.format === "json.gz";
  const r = await fetch(dataBase() + "idx/" + shard + (gz ? ".json.gz" : ".json"), { cache: "force-cache" });
  if (!r.ok) throw new Error("shard");
  if (!gz) return r.json();
  const buf = await r.arrayBuffer();
  const bytes = new Uint8Array(buf);
  // Some hosts serve .gz with Content-Encoding: gzip, in which case the browser has already inflated it.
  if (!(bytes[0] === 0x1f && bytes[1] === 0x8b)) return JSON.parse(new TextDecoder().decode(bytes));
  if (typeof DecompressionStream === "undefined") throw new Error("DecompressionStream unsupported");
  const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"));
  return JSON.parse(await new Response(stream).text());
}

export function normalizeCui(input) {
  const digits = String(input || "").replace(/\D/g, "");
  return digits.replace(/^0+/, "");
}

export async function lookupCui(cuiInput) {
  const cui = normalizeCui(cuiInput);
  if (!cui) return null;
  const manifest = await loadManifest();
  const shard = Number(cui) % SHARDS;
  const shardData = await fetchShard(shard, manifest);
  const rec = shardData[cui];
  if (!rec) return null;
  // rec = [name, caen, [rowY1|null, rowY2|null, ...]]
  const ds = emptyDataset();
  ds.cui = cui;
  ds.company = rec[0] || "";
  ds.caen = rec[1] || "";
  ds.source = "mfp";
  ds.sourceDate = manifest.updated;
  manifest.years.forEach((year, i) => {
    const row = rec[2][i];
    if (!row) return;
    const { values, extra } = fromMfpRow(row);
    ds.years.push(year);
    ds.values[year] = values;
    ds.meta[year] = {};
    for (const k of Object.keys(values)) ds.meta[year][k] = values[k] == null ? "missing" : "mfp";
    ds.meta[year].totalAssets = "derived";
    ds.meta[year].grossProfit = "derived";
    ds.meta[year].netProfit = "derived";
    ds.employees[year] = extra.employees;
    ds.shareCapital[year] = extra.shareCapital;
    ds.extra = ds.extra || {};
    ds.extra[year] = extra;
  });
  ds.years.sort((a, b) => a - b);
  return ds;
}

// ---------------------------------------------------------------- shared state between tools
const SHARE_KEY = "fin.shared.dataset";
export function shareDataset(ds) {
  try {
    localStorage.setItem(SHARE_KEY, JSON.stringify(ds));
    return true;
  } catch (e) {
    return false;
  }
}
export function readSharedDataset() {
  try {
    const s = localStorage.getItem(SHARE_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}

// ---------------------------------------------------------------- calculations
const safeDiv = (a, b) => (isNum(a) && isNum(b) && b !== 0 ? a / b : null);
const growth = (cur, prev) => (isNum(cur) && isNum(prev) && prev !== 0 ? cur / Math.abs(prev) - (prev > 0 ? 1 : -1) : null);

/** Resolve a year's values applying assumptions. Returns {v, notes} */
export function resolveYear(ds, year, options = {}) {
  const raw = ds.values[year] || {};
  const v = { ...raw };
  const notes = {};
  if (!isNum(v.totalAssets) && isNum(v.fixedAssets) && isNum(v.currentAssets)) {
    v.totalAssets = v.fixedAssets + v.currentAssets;
    notes.totalAssets = "derived";
  }
  if (!isNum(v.totalLiabilities) && isNum(v.stLiabilities) && isNum(v.ltLiabilities)) {
    v.totalLiabilities = v.stLiabilities + v.ltLiabilities;
    notes.totalLiabilities = "derived";
  }
  if (!isNum(v.stLiabilities) && isNum(v.totalLiabilities) && isNum(v.ltLiabilities)) {
    v.stLiabilities = v.totalLiabilities - v.ltLiabilities;
    notes.stLiabilities = "derived";
  }
  if (!isNum(v.ltLiabilities) && isNum(v.totalLiabilities) && isNum(v.stLiabilities)) {
    v.ltLiabilities = v.totalLiabilities - v.stLiabilities;
    notes.ltLiabilities = "derived";
  }
  const stShare = options.assumeAllShortTerm ? 1 : isNum(options.stShare) ? Math.max(0, Math.min(1, options.stShare)) : null;
  if (!isNum(v.stLiabilities) && isNum(v.totalLiabilities) && stShare != null) {
    v.stLiabilities = v.totalLiabilities * stShare;
    v.ltLiabilities = v.totalLiabilities - v.stLiabilities;
    notes.stLiabilities = "assumed";
    notes.ltLiabilities = "assumed";
    notes.stShare = stShare;
  }
  if (!isNum(v.ebit) && isNum(v.grossProfit) && options.proxyEbit) {
    v.ebit = v.grossProfit;
    notes.ebit = "assumed";
  }
  if (!isNum(v.totalExpenses) && isNum(v.totalIncome) && isNum(v.grossProfit)) {
    v.totalExpenses = v.totalIncome - v.grossProfit;
    notes.totalExpenses = "derived";
  }
  return { v, notes };
}

export const RATIO_DEFS = [
  { key: "currentRatio", group: "liquidity", kind: "ratio", good: [1.5, Infinity], watch: [1, 1.5], higherBetter: true, bench: "> 1,5" },
  { key: "quickRatio", group: "liquidity", kind: "ratio", good: [1, Infinity], watch: [0.7, 1], higherBetter: true, bench: "> 1,0" },
  { key: "cashRatio", group: "liquidity", kind: "ratio", good: [0.3, Infinity], watch: [0.1, 0.3], higherBetter: true, bench: "> 0,3" },
  { key: "workingCapital", group: "liquidity", kind: "money", good: [0, Infinity], watch: [-Infinity, -Infinity], higherBetter: true, bench: "> 0" },
  { key: "debtRatio", group: "leverage", kind: "pct", good: [-Infinity, 0.6], watch: [0.6, 0.8], higherBetter: false, bench: "< 60 %" },
  { key: "debtToEquity", group: "leverage", kind: "ratio", good: [-Infinity, 1.5], watch: [1.5, 3], higherBetter: false, bench: "< 1,5" },
  { key: "equityRatio", group: "leverage", kind: "pct", good: [0.35, Infinity], watch: [0.2, 0.35], higherBetter: true, bench: "> 35 %" },
  { key: "netMargin", group: "profitability", kind: "pct", good: [0.05, Infinity], watch: [0, 0.05], higherBetter: true, bench: "> 5 %" },
  { key: "roa", group: "profitability", kind: "pct", good: [0.05, Infinity], watch: [0, 0.05], higherBetter: true, bench: "> 5 %" },
  { key: "roe", group: "profitability", kind: "pct", good: [0.1, Infinity], watch: [0, 0.1], higherBetter: true, bench: "> 10 %" },
  { key: "ebitdaMargin", group: "profitability", kind: "pct", good: [0.1, Infinity], watch: [0.05, 0.1], higherBetter: true, bench: "> 10 %" },
  { key: "assetTurnover", group: "efficiency", kind: "ratio", good: [1, Infinity], watch: [0.5, 1], higherBetter: true, bench: "> 1,0" },
];

export function ratioStatus(def, value, extra = {}) {
  if (!isNum(value)) return "na";
  // special cases: negative equity makes leverage ratios meaningless
  if ((def.key === "debtToEquity" || def.key === "roe") && extra.equity != null && extra.equity <= 0) return "weak";
  const inRange = (r) => value >= r[0] && value <= r[1];
  if (inRange(def.good)) return "good";
  if (inRange(def.watch)) return "watch";
  return "weak";
}

export function computeRatios(v) {
  const wc = isNum(v.currentAssets) && isNum(v.stLiabilities) ? v.currentAssets - v.stLiabilities : null;
  return {
    currentRatio: safeDiv(v.currentAssets, v.stLiabilities),
    quickRatio: isNum(v.currentAssets) ? safeDiv(v.currentAssets - (v.inventories || 0), v.stLiabilities) : null,
    cashRatio: safeDiv(v.cash, v.stLiabilities),
    workingCapital: wc,
    debtRatio: safeDiv(v.totalLiabilities, v.totalAssets),
    debtToEquity: isNum(v.equity) && v.equity > 0 ? safeDiv(v.totalLiabilities, v.equity) : isNum(v.equity) && isNum(v.totalLiabilities) ? null : null,
    equityRatio: safeDiv(v.equity, v.totalAssets),
    netMargin: safeDiv(v.netProfit, v.revenue),
    roa: safeDiv(v.netProfit, v.totalAssets),
    roe: isNum(v.equity) && v.equity > 0 ? safeDiv(v.netProfit, v.equity) : null,
    ebitdaMargin: safeDiv(v.ebitda, v.revenue),
    assetTurnover: safeDiv(v.revenue, v.totalAssets),
  };
}

export function computeStructure(v) {
  const ta = v.totalAssets;
  const other = isNum(ta) ? ta - (v.fixedAssets || 0) - (v.inventories || 0) - (v.receivables || 0) - (v.cash || 0) : null;
  const otherLiab = isNum(ta) ? ta - (v.equity || 0) - (v.totalLiabilities || 0) : null;
  return {
    assets: {
      fixedAssets: safeDiv(v.fixedAssets, ta),
      currentAssets: safeDiv(v.currentAssets, ta),
      inventories: safeDiv(v.inventories, ta),
      receivables: safeDiv(v.receivables, ta),
      cash: safeDiv(v.cash, ta),
      other: safeDiv(other, ta),
    },
    financing: {
      equity: safeDiv(v.equity, ta),
      totalLiabilities: safeDiv(v.totalLiabilities, ta),
      stLiabilities: safeDiv(v.stLiabilities, ta),
      ltLiabilities: safeDiv(v.ltLiabilities, ta),
      other: safeDiv(otherLiab, ta),
    },
    pnl: {
      totalExpenses: safeDiv(v.totalExpenses, v.revenue),
      opex: safeDiv(v.opex, v.revenue),
      ebitda: safeDiv(v.ebitda, v.revenue),
      ebit: safeDiv(v.ebit, v.revenue),
      netProfit: safeDiv(v.netProfit, v.revenue),
    },
  };
}

export const DYNAMICS_KEYS = ["revenue", "totalAssets", "totalLiabilities", "equity", "netProfit", "receivables", "inventories", "stLiabilities"];

/** Full analysis. Returns { years, resolved:{year:{v,notes}}, ratios:{year}, structure:{year}, dynamics:{year:{key:growth}}, flags:[], diagnosis } */
export function analyze(ds, options = {}) {
  const years = [...ds.years].sort((a, b) => a - b);
  const resolved = {},
    ratios = {},
    structure = {},
    dynamics = {};
  for (const y of years) {
    resolved[y] = resolveYear(ds, y, options);
    ratios[y] = computeRatios(resolved[y].v);
    structure[y] = computeStructure(resolved[y].v);
  }
  for (let i = 1; i < years.length; i++) {
    const y = years[i],
      p = years[i - 1];
    dynamics[y] = {};
    for (const k of DYNAMICS_KEYS) dynamics[y][k] = growth(resolved[y].v[k], resolved[p].v[k]);
  }
  const flags = detectFlags(years, resolved, ratios, dynamics);
  const diagnosis = diagnose(flags);
  return { years, resolved, ratios, structure, dynamics, flags, diagnosis };
}

export function detectFlags(years, resolved, ratios, dynamics) {
  const flags = [];
  const last = years[years.length - 1];
  const push = (key, sev, year, vars = {}) => flags.push({ key, sev, year, vars });
  for (const y of years) {
    const v = resolved[y].v,
      r = ratios[y];
    if (isNum(v.equity) && v.equity < 0) push("negEquity", "high", y);
    if (isNum(v.netProfit) && v.netProfit < 0) push("negProfit", y === last ? "high" : "med", y);
    if (isNum(r.currentRatio) && r.currentRatio < 1) push("currentBelow1", y === last ? "high" : "med", y, { v: fmtRatio(r.currentRatio) });
    if (isNum(r.debtToEquity) && r.debtToEquity > 3) push("highDE", y === last ? "med" : "low", y, { v: fmtRatio(r.debtToEquity) });
    if (isNum(r.cashRatio) && r.cashRatio < 0.1) push("lowCash", y === last ? "med" : "low", y, { v: fmtRatio(r.cashRatio) });
  }
  for (let i = 1; i < years.length; i++) {
    const y = years[i],
      p = years[i - 1],
      d = dynamics[y];
    const gRev = d.revenue;
    if (isNum(gRev) && gRev < -0.05) push("revDown", y === last ? "med" : "low", y, { v: fmtSignedPct(gRev) });
    if (isNum(gRev) && isNum(d.totalLiabilities) && d.totalLiabilities > gRev + 0.05 && d.totalLiabilities > 0)
      push("debtFaster", y === last ? "med" : "low", y, { a: fmtSignedPct(d.totalLiabilities), b: fmtSignedPct(gRev) });
    if (isNum(gRev) && isNum(d.receivables) && d.receivables > gRev + 0.1 && d.receivables > 0)
      push("recFaster", y === last ? "med" : "low", y, { a: fmtSignedPct(d.receivables), b: fmtSignedPct(gRev) });
    if (isNum(gRev) && isNum(d.inventories) && d.inventories > gRev + 0.1 && d.inventories > 0)
      push("invFaster", y === last ? "med" : "low", y, { a: fmtSignedPct(d.inventories), b: fmtSignedPct(gRev) });
    const m1 = ratios[p].netMargin,
      m2 = ratios[y].netMargin;
    if (isNum(m1) && isNum(m2) && m2 < m1 - 0.01) push("marginDown", y === last ? "med" : "low", y, { a: fmtPct(m1), b: fmtPct(m2) });
  }
  const order = { high: 0, med: 1, low: 2 };
  flags.sort((a, b) => order[a.sev] - order[b.sev] || b.year - a.year);
  return flags;
}

export function diagnose(flags) {
  const w = { high: 3, med: 2, low: 1 };
  const score = flags.reduce((s, f) => s + w[f.sev], 0);
  let level = "low";
  if (score >= 12) level = "crit";
  else if (score >= 7) level = "high";
  else if (score >= 3) level = "mid";
  return { score, level };
}

export function flagText(f) {
  return { title: t("flag." + f.key, { year: f.year, ...f.vars }), why: t("flag." + f.key + ".why"), sev: t("flag.sev." + f.sev) };
}

/** Human-readable text of the short-term debt assumption used for a year (or "" if none). */
export function stAssumptionText(notes, ro = currentLang === "ro") {
  if (!notes || notes.stLiabilities !== "assumed") return "";
  const share = isNum(notes.stShare) ? notes.stShare : 1;
  if (share >= 1) return ro ? "ipoteză: toate datoriile pe termen scurt" : "assuming all liabilities are short-term";
  const p = Math.round(share * 100) + " %";
  return ro ? `ipoteză: ${p} din datorii pe termen scurt` : `assuming ${p} of liabilities are short-term`;
}

// ---------------------------------------------------------------- commentary (rule based)
export function buildCommentary(ds, a) {
  const years = a.years;
  const last = years[years.length - 1];
  const first = years[0];
  const prev = years.length > 1 ? years[years.length - 2] : null;
  const v = a.resolved[last].v;
  const r = a.ratios[last];
  const s = a.structure[last];
  const ro = currentLang === "ro";
  const name = ds.company || (ds.cui ? "CUI " + ds.cui : ro ? "Compania" : "The company");
  const sections = [];

  // Balance sheet
  const bs = [];
  if (isNum(s.assets.fixedAssets) && isNum(s.assets.currentAssets)) {
    const heavy = s.assets.fixedAssets > 0.5;
    bs.push(
      ro
        ? `La ${last}, ${name} are active totale de ${fmtMoney(v.totalAssets)}, din care ${fmtPct(s.assets.fixedAssets)} active imobilizate și ${fmtPct(s.assets.currentAssets)} active curente — ${heavy ? "un bilanț „greu”, orientat spre active fixe" : "un bilanț dominat de activele circulante"}.`
        : `In ${last}, ${name} reports total assets of ${fmtMoney(v.totalAssets)}, of which ${fmtPct(s.assets.fixedAssets)} fixed assets and ${fmtPct(s.assets.currentAssets)} current assets — ${heavy ? "an asset-heavy balance sheet" : "a balance sheet dominated by working-capital items"}.`
    );
  }
  if (isNum(s.assets.receivables) || isNum(s.assets.inventories) || isNum(s.assets.cash)) {
    const parts = [];
    if (isNum(s.assets.inventories)) parts.push((ro ? "stocuri " : "inventories ") + fmtPct(s.assets.inventories));
    if (isNum(s.assets.receivables)) parts.push((ro ? "creanțe " : "receivables ") + fmtPct(s.assets.receivables));
    if (isNum(s.assets.cash)) parts.push((ro ? "numerar " : "cash ") + fmtPct(s.assets.cash));
    bs.push((ro ? "În activele curente: " : "Within current assets: ") + parts.join(", ") + (ro ? " din activele totale." : " of total assets."));
  }
  if (isNum(s.financing.equity) && isNum(s.financing.totalLiabilities)) {
    const eq = s.financing.equity;
    const tone = eq < 0 ? (ro ? "capitaluri proprii negative — compania este finanțată integral de creditori" : "negative equity — the company is entirely creditor-financed") : eq < 0.2 ? (ro ? "o autonomie financiară redusă" : "low financial autonomy") : eq < 0.4 ? (ro ? "o autonomie financiară moderată" : "moderate financial autonomy") : ro ? "o autonomie financiară solidă" : "solid financial autonomy";
    bs.push(
      ro
        ? `Finanțarea: capitaluri proprii ${fmtPct(eq)} și datorii ${fmtPct(s.financing.totalLiabilities)} din total pasive, adică ${tone}.`
        : `Financing: equity ${fmtPct(eq)} and liabilities ${fmtPct(s.financing.totalLiabilities)} of total — ${tone}.`
    );
  }
  if (isNum(r.currentRatio)) {
    const note = a.resolved[last].notes.stLiabilities === "assumed" ? ` (${stAssumptionText(a.resolved[last].notes, ro)})` : "";
    const q = r.currentRatio < 1 ? (ro ? "sub pragul de 1 — activele curente nu acoperă datoriile curente" : "below 1 — current assets do not cover current liabilities") : r.currentRatio < 1.5 ? (ro ? "acceptabilă, dar fără o marjă de siguranță confortabilă" : "acceptable but without a comfortable safety margin") : ro ? "confortabilă" : "comfortable";
    bs.push((ro ? `Lichiditatea curentă este ${fmtRatio(r.currentRatio)}${note}, ` : `The current ratio is ${fmtRatio(r.currentRatio)}${note}, `) + q + ".");
  }
  sections.push({ title: t("c.balance"), items: bs });

  // P&L
  const pl = [];
  if (isNum(v.revenue)) {
    const g = prev ? a.dynamics[last].revenue : null;
    pl.push(
      ro
        ? `Cifra de afaceri în ${last}: ${fmtMoney(v.revenue)}${isNum(g) ? ` (${fmtSignedPct(g)} față de ${prev})` : ""}.`
        : `Revenue in ${last}: ${fmtMoney(v.revenue)}${isNum(g) ? ` (${fmtSignedPct(g)} vs ${prev})` : ""}.`
    );
  }
  if (isNum(s.pnl.totalExpenses)) {
    pl.push(
      ro
        ? `Cheltuielile totale reprezintă ${fmtPct(s.pnl.totalExpenses)} din cifra de afaceri${s.pnl.totalExpenses > 1 ? " — peste 100 %, deci compania consumă mai mult decât vinde (verifică veniturile din alte surse)" : ""}.`
        : `Total expenses represent ${fmtPct(s.pnl.totalExpenses)} of revenue${s.pnl.totalExpenses > 1 ? " — above 100 %, so the company spends more than it sells (check other income sources)" : ""}.`
    );
  }
  if (isNum(r.netMargin)) {
    const q = r.netMargin < 0 ? (ro ? "compania este pe pierdere" : "the company is loss-making") : r.netMargin < 0.03 ? (ro ? "o marjă subțire, sensibilă la orice șoc de costuri" : "a thin margin, sensitive to any cost shock") : r.netMargin < 0.1 ? (ro ? "o marjă rezonabilă" : "a reasonable margin") : ro ? "o marjă ridicată" : "a high margin";
    pl.push((ro ? `Marja netă este ${fmtPct(r.netMargin)} — ` : `Net margin is ${fmtPct(r.netMargin)} — `) + q + (isNum(r.roe) ? (ro ? `; rentabilitatea capitalurilor (ROE) ${fmtPct(r.roe)}.` : `; return on equity (ROE) ${fmtPct(r.roe)}.`) : "."));
  }
  if (isNum(s.pnl.ebitda)) pl.push(ro ? `Marja EBITDA: ${fmtPct(s.pnl.ebitda)}.` : `EBITDA margin: ${fmtPct(s.pnl.ebitda)}.`);
  sections.push({ title: t("c.pnl"), items: pl });

  // improved / worsened (compare first vs last on key ratios + growth)
  const improved = [],
    worsened = [];
  if (years.length > 1) {
    const r0 = a.ratios[first];
    const cmp = (key, label, fmt, higherBetter = true, tol = 0.01) => {
      const x0 = r0[key],
        x1 = r[key];
      if (!isNum(x0) || !isNum(x1)) return;
      const diff = x1 - x0;
      if (Math.abs(diff) < tol) return;
      const better = higherBetter ? diff > 0 : diff < 0;
      (better ? improved : worsened).push(`${label}: ${fmt(x0)} (${first}) → ${fmt(x1)} (${last})`);
    };
    cmp("netMargin", t("r.netMargin"), fmtPct, true, 0.005);
    cmp("currentRatio", t("r.currentRatio"), fmtRatio, true, 0.05);
    cmp("equityRatio", t("r.equityRatio"), fmtPct, true, 0.02);
    cmp("debtRatio", t("r.debtRatio"), fmtPct, false, 0.02);
    cmp("roa", t("r.roa"), fmtPct, true, 0.005);
    cmp("assetTurnover", t("r.assetTurnover"), fmtRatio, true, 0.05);
    cmp("cashRatio", t("r.cashRatio"), fmtRatio, true, 0.03);
    const g = a.dynamics[last];
    if (isNum(g.revenue)) (g.revenue > 0 ? improved : worsened).push(`${t("d.revenue")} ${last}: ${fmtSignedPct(g.revenue)}`);
    if (isNum(g.netProfit) && isNum(a.resolved[prev].v.netProfit) && a.resolved[prev].v.netProfit > 0)
      (g.netProfit > 0 ? improved : worsened).push(`${t("d.netProfit")} ${last}: ${fmtSignedPct(g.netProfit)}`);
    if (isNum(g.equity) && isNum(a.resolved[prev].v.equity) && a.resolved[prev].v.equity > 0)
      (g.equity > 0 ? improved : worsened).push(`${t("d.equity")} ${last}: ${fmtSignedPct(g.equity)}`);
  }
  sections.push({ title: t("c.improved"), items: improved.length ? improved : [t("c.none")] });
  sections.push({ title: t("c.worsened"), items: worsened.length ? worsened : [t("c.none")] });

  // risks
  const risks = a.flags.slice(0, 6).map((f) => {
    const ft = flagText(f);
    return `${ft.title} — ${ft.why}`;
  });
  sections.push({ title: t("c.risks"), items: risks.length ? risks : [t("dash.flags.none")] });

  // questions
  const q = buildQuestions(a, ro);
  sections.push({ title: t("c.questions"), items: q });

  return sections;
}

export function buildQuestions(a, ro = currentLang === "ro") {
  const qs = [];
  const has = (k) => a.flags.some((f) => f.key === k);
  const last = a.years[a.years.length - 1];
  const notes = a.resolved[last].notes;
  if (has("recFaster")) qs.push(ro ? "Care este vechimea creanțelor și există clienți concentrați sau restanțieri?" : "What is the ageing of receivables, and are there concentrated or overdue customers?");
  if (has("invFaster")) qs.push(ro ? "Ce parte din stocuri are rotație lentă sau este nevandabilă? Există provizioane pentru depreciere?" : "What share of inventories is slow-moving or unsaleable? Are there impairment provisions?");
  if (has("debtFaster") || has("highDE")) qs.push(ro ? "Care este structura datoriilor (bănci, furnizori, asociați, buget) și scadențarul lor?" : "What is the debt structure (banks, suppliers, shareholders, tax) and its maturity profile?");
  if (has("currentBelow1") || has("lowCash")) qs.push(ro ? "Cum este finanțat deficitul de lichiditate pe termen scurt și există linii de credit neutilizate?" : "How is the short-term liquidity gap financed, and are there undrawn credit lines?");
  if (has("negProfit") || has("marginDown")) qs.push(ro ? "Care sunt cauzele erodării marjei (costuri, prețuri, mix) și ce măsuri corective sunt planificate?" : "What drives the margin erosion (costs, prices, mix) and what corrective actions are planned?");
  if (has("negEquity")) qs.push(ro ? "Există un plan de recapitalizare (aport de capital, conversie a datoriilor către asociați)?" : "Is there a recapitalisation plan (capital injection, conversion of shareholder loans)?");
  if (has("revDown")) qs.push(ro ? "Scăderea cifrei de afaceri este conjuncturală sau structurală (pierdere de clienți, contracte)?" : "Is the revenue decline cyclical or structural (lost customers, contracts)?");
  if (notes.stLiabilities === "assumed") qs.push(ro ? "Care este împărțirea reală a datoriilor între termen scurt și termen lung?" : "What is the actual split of liabilities between short and long term?");
  if (!isNum(a.resolved[last].v.ebitda)) qs.push(ro ? "Care sunt EBITDA și cheltuielile cu dobânzile, pentru a evalua capacitatea de acoperire a serviciului datoriei?" : "What are EBITDA and interest expense, to assess debt-service coverage?");
  qs.push(ro ? "Cum arată fluxul de numerar operațional față de profitul raportat?" : "How does operating cash flow compare with reported profit?");
  return qs.slice(0, 6);
}

export function commentaryToText(sections, ds) {
  const head = (ds.company || "") + (ds.cui ? ` (CUI ${ds.cui})` : "");
  let out = head ? head + "\n\n" : "";
  for (const s of sections) {
    out += s.title.toUpperCase() + "\n";
    for (const it of s.items) out += "• " + it + "\n";
    out += "\n";
  }
  return out.trim();
}

// ---------------------------------------------------------------- SVG charts
export const PALETTE = ["#2b4bc4", "#2f9db7", "#d9720f", "#6f4bb8", "#b0286a"];
export const STATUS_COLORS = { good: "#1b6f3a", watch: "#b7791f", weak: "#b0491b", na: "#8a94ad" };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/** Stacked 100% horizontal bars: rows = [{label, segments:[{key,label,value(0..1)}]}], series = [{key,label,color}] */
export function stackedBars(rows, series, opts = {}) {
  const W = opts.width || 640,
    rowH = 34,
    gap = 12,
    labelW = 64,
    padR = 16;
  const H = rows.length * (rowH + gap) + 8;
  const plotW = W - labelW - padR;
  let svg = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.aria || "")}">`;
  rows.forEach((row, i) => {
    const y = 4 + i * (rowH + gap);
    svg += `<text class="axis-label" x="${labelW - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" font-weight="700">${esc(row.label)}</text>`;
    let x = labelW;
    // background track
    svg += `<rect x="${labelW}" y="${y}" width="${plotW}" height="${rowH}" rx="6" fill="rgba(22,37,84,0.06)"/>`;
    for (const seg of row.segments) {
      const val = isNum(seg.value) ? Math.max(0, Math.min(1, seg.value)) : 0;
      const w = val * plotW;
      if (w <= 0) continue;
      const color = series.find((s) => s.key === seg.key)?.color || "#999";
      svg += `<g class="hover-target"><rect x="${x}" y="${y}" width="${Math.max(0, w - 2)}" height="${rowH}" rx="4" fill="${color}"><title>${esc(row.label)} · ${esc(seg.label)}: ${esc(fmtPct(seg.value))}</title></rect>`;
      if (w > 46) svg += `<text x="${x + w / 2 - 1}" y="${y + rowH / 2 + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" pointer-events="none">${esc(fmtPct(seg.value, 0))}</text>`;
      svg += `</g>`;
      x += w;
    }
  });
  svg += `</svg>`;
  return svg;
}

/** Grouped vertical bars with sign: groups = years, series = [{key,label,color}], data[year][key] = value (fraction). */
export function groupedBars(groups, series, data, opts = {}) {
  const W = opts.width || 640,
    H = opts.height || 260,
    padL = 48,
    padR = 12,
    padT = 14,
    padB = 30;
  const plotW = W - padL - padR,
    plotH = H - padT - padB;
  let vals = [];
  for (const g of groups) for (const s of series) if (isNum(data[g]?.[s.key])) vals.push(data[g][s.key]);
  if (!vals.length) vals = [0];
  let maxV = Math.max(0, ...vals),
    minV = Math.min(0, ...vals);
  const cap = opts.cap ?? 2; // cap extreme growth at +200 %
  maxV = Math.min(maxV, cap);
  minV = Math.max(minV, -1);
  if (maxV === minV) maxV = minV + 0.1;
  {
    const pre = niceTicks(minV, maxV, 4);
    const step = pre.length > 1 ? pre[1] - pre[0] : (maxV - minV) / 4;
    maxV = Math.ceil(maxV / step - 1e-9) * step;
    minV = Math.floor(minV / step + 1e-9) * step;
  }
  const range = maxV - minV;
  const yOf = (v) => padT + (maxV - Math.max(minV, Math.min(maxV, v))) / range * plotH;
  const y0 = yOf(0);
  let svg = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.aria || "")}">`;
  // grid
  const ticks = niceTicks(minV, maxV, 4);
  for (const tv of ticks) {
    const y = yOf(tv);
    svg += `<line class="grid-line" x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}"/>`;
    svg += `<text class="axis-label" x="${padL - 6}" y="${y + 4}" text-anchor="end">${esc(fmtSignedPct(tv, 0))}</text>`;
  }
  svg += `<line class="axis-line" x1="${padL}" x2="${W - padR}" y1="${y0}" y2="${y0}"/>`;
  const groupW = plotW / groups.length;
  const barW = Math.min(28, (groupW - 16) / series.length);
  groups.forEach((g, gi) => {
    const gx = padL + gi * groupW + (groupW - barW * series.length) / 2;
    svg += `<text class="axis-label" x="${padL + gi * groupW + groupW / 2}" y="${H - 10}" text-anchor="middle" font-weight="700">${esc(g)}</text>`;
    series.forEach((s, si) => {
      const v = data[g]?.[s.key];
      if (!isNum(v)) return;
      const y = yOf(v);
      const top = Math.min(y, y0),
        h = Math.abs(y - y0);
      const clipped = v > cap || v < -1;
      svg += `<g class="hover-target"><rect x="${gx + si * barW + 1}" y="${top}" width="${barW - 2}" height="${Math.max(h, 1.5)}" rx="3" fill="${s.color}"${clipped ? ' stroke="#fff" stroke-dasharray="3 2"' : ""}><title>${esc(g)} · ${esc(s.label)}: ${esc(fmtSignedPct(v))}</title></rect></g>`;
    });
  });
  svg += `</svg>`;
  return svg;
}

/** Simple multi-line chart for absolute values (money) across years. series=[{key,label,color}], data[year][key] */
export function lineChart(groups, series, data, opts = {}) {
  const W = opts.width || 640,
    H = opts.height || 240,
    padL = 60,
    padR = 16,
    padT = 14,
    padB = 30;
  const plotW = W - padL - padR,
    plotH = H - padT - padB;
  let vals = [];
  for (const g of groups) for (const s of series) if (isNum(data[g]?.[s.key])) vals.push(data[g][s.key]);
  if (!vals.length) vals = [0, 1];
  let maxV = Math.max(0, ...vals),
    minV = Math.min(0, ...vals);
  if (maxV === minV) maxV = minV + 1;
  const range = maxV - minV;
  const yOf = (v) => padT + ((maxV - v) / range) * plotH;
  const xOf = (i) => padL + (groups.length === 1 ? plotW / 2 : (i / (groups.length - 1)) * plotW);
  let svg = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.aria || "")}">`;
  for (const tv of niceTicks(minV, maxV, 4)) {
    const y = yOf(tv);
    svg += `<line class="grid-line" x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}"/>`;
    svg += `<text class="axis-label" x="${padL - 6}" y="${y + 4}" text-anchor="end">${esc(fmtMoney(tv, { decimals: 1 }))}</text>`;
  }
  groups.forEach((g, i) => {
    svg += `<text class="axis-label" x="${xOf(i)}" y="${H - 10}" text-anchor="middle" font-weight="700">${esc(g)}</text>`;
  });
  for (const s of series) {
    const pts = groups.map((g, i) => (isNum(data[g]?.[s.key]) ? [xOf(i), yOf(data[g][s.key]), data[g][s.key], g] : null)).filter(Boolean);
    if (pts.length > 1) svg += `<polyline fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" points="${pts.map((p) => p[0] + "," + p[1]).join(" ")}"/>`;
    for (const p of pts) svg += `<g class="hover-target"><circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${s.color}" stroke="#fff" stroke-width="2"><title>${esc(p[3])} · ${esc(s.label)}: ${esc(fmtFull(p[2]))}</title></circle></g>`;
    const lastP = pts[pts.length - 1];
    if (lastP) svg += `<text class="axis-label" x="${Math.min(lastP[0], W - 6)}" y="${Math.max(padT + 8, lastP[1] - 9)}" text-anchor="end" font-weight="700" fill="${s.color}">${esc(s.label)}</text>`;
  }
  svg += `</svg>`;
  return svg;
}

function niceTicks(min, max, n) {
  const span = max - min;
  const raw = span / n;
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const norm = raw / mag;
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}

export function legendHtml(series) {
  return `<div class="legend-row">${series.map((s) => `<span class="legend-chip" style="--legend-color:${s.color}">${esc(s.label)}</span>`).join("")}</div>`;
}

/** Horizontal meter for a ratio with status. */
export function meter(value, min, max, status) {
  const pct = isNum(value) ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  return `<div class="meter"><div class="meter-fill" style="width:${(pct * 100).toFixed(1)}%;background:${STATUS_COLORS[status] || STATUS_COLORS.na}"></div></div>`;
}

// ---------------------------------------------------------------- misc UI helpers
let toastTimer;
export function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 3200);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(t("toast.copied"));
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast(t("toast.copied"));
  }
}

export function downloadText(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: mime + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function escapeHtml(s) {
  return esc(s);
}

// ---------------------------------------------------------------- CSV parsing (indicator rows × year columns)
export function parseCsvDataset(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error("csv");
  const delim = [";", ",", "\t"].map((d) => [d, (lines[0].match(new RegExp("\\" + d, "g")) || []).length]).sort((a, b) => b[1] - a[1])[0][0];
  const split = (l) => l.split(delim).map((c) => c.trim().replace(/^"|"$/g, ""));
  const header = split(lines[0]);
  const years = header.slice(1).map((h) => parseInt(String(h).replace(/\D/g, ""), 10)).filter((y) => y > 1990 && y < 2100);
  if (!years.length) throw new Error("csv");
  const ds = emptyDataset();
  ds.source = "csv";
  ds.years = years;
  for (const y of years) {
    ds.values[y] = {};
    ds.meta[y] = {};
  }
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  for (const line of lines.slice(1)) {
    const cells = split(line);
    const label = norm(cells[0] || "");
    if (!label) continue;
    if (["denumire", "companie", "company", "name"].includes(label)) {
      ds.company = cells[1] || "";
      continue;
    }
    if (["cui", "cod fiscal"].includes(label)) {
      ds.cui = normalizeCui(cells[1]);
      continue;
    }
    if (["caen", "cod caen"].includes(label)) {
      ds.caen = cells[1] || "";
      continue;
    }
    if (["salariati", "numar mediu salariati", "employees"].includes(label)) {
      years.forEach((y, i) => (ds.employees[y] = parseNumber(cells[i + 1])));
      continue;
    }
    if (["capital social", "share capital"].includes(label)) {
      years.forEach((y, i) => (ds.shareCapital[y] = parseNumber(cells[i + 1])));
      continue;
    }
    let field = null;
    for (const [k, aliases] of Object.entries(CSV_ALIASES)) {
      if (aliases.map(norm).includes(label)) {
        field = k;
        break;
      }
    }
    if (!field) continue;
    years.forEach((y, i) => {
      const n = parseNumber(cells[i + 1]);
      ds.values[y][field] = n;
      ds.meta[y][field] = n == null ? "missing" : "csv";
    });
  }
  return ds;
}

export function csvTemplate(years = [2023, 2024, 2025]) {
  const ro = currentLang === "ro";
  const rows = [["indicator", ...years]];
  rows.push([ro ? "Denumire" : "Company", ro ? "Exemplu SRL" : "Example Ltd", "", ""]);
  rows.push(["CUI", "12345678", "", ""]);
  rows.push(["CAEN", "4711", "", ""]);
  const labels = ro
    ? {
        totalAssets: "Active totale",
        fixedAssets: "Active imobilizate",
        currentAssets: "Active curente",
        inventories: "Stocuri",
        receivables: "Creante",
        cash: "Numerar",
        equity: "Capitaluri proprii",
        totalLiabilities: "Datorii totale",
        stLiabilities: "Datorii pe termen scurt",
        ltLiabilities: "Datorii pe termen lung",
        suppliers: "Furnizori",
        revenue: "Cifra de afaceri",
        totalIncome: "Venituri totale",
        totalExpenses: "Cheltuieli totale",
        opex: "Cheltuieli operationale",
        ebitda: "EBITDA",
        ebit: "EBIT",
        grossProfit: "Profit brut",
        netProfit: "Profit net",
      }
    : {
        totalAssets: "Total assets",
        fixedAssets: "Fixed assets",
        currentAssets: "Current assets",
        inventories: "Inventories",
        receivables: "Receivables",
        cash: "Cash",
        equity: "Equity",
        totalLiabilities: "Total liabilities",
        stLiabilities: "Short-term liabilities",
        ltLiabilities: "Long-term liabilities",
        suppliers: "Trade payables",
        revenue: "Revenue",
        totalIncome: "Total income",
        totalExpenses: "Total expenses",
        opex: "Operating expenses",
        ebitda: "EBITDA",
        ebit: "EBIT",
        grossProfit: "Pre-tax profit",
        netProfit: "Net profit",
      };
  for (const f of FIELDS) rows.push([labels[f.key], ...years.map(() => "")]);
  rows.push([ro ? "Salariati" : "Employees", ...years.map(() => "")]);
  rows.push([ro ? "Capital social" : "Share capital", ...years.map(() => "")]);
  return rows.map((r) => r.join(";")).join("\n");
}

// ---------------------------------------------------------------- shared shell rendering (header nav + footer)
export function renderShell(active) {
  const nav = document.getElementById("site-nav");
  if (nav) {
    nav.innerHTML = `
      <a class="nav-link${active === "home" ? " is-active" : ""}" href="./index.html" data-i18n="nav.home"></a>
      <a class="nav-link${active === "tool1" ? " is-active" : ""}" href="./tool1.html" data-i18n="nav.tool1"></a>
      <a class="nav-link${active === "tool2" ? " is-active" : ""}" href="./tool2.html" data-i18n="nav.tool2"></a>
      <a class="nav-link" href="https://trainings.corpquants.ro/courses/analiza-financiara-nivel-incepator/" target="_blank" rel="noreferrer" data-i18n="nav.course"></a>
      <div class="lang-switch" role="group" aria-label="Language">
        <button type="button" data-lang="ro">RO</button>
        <button type="button" data-lang="en">EN</button>
      </div>`;
  }
  const footer = document.getElementById("site-footer");
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
        <p class="helper-copy" data-i18n="footer.disclaimer.p2"></p>
        <p class="helper-copy" data-i18n="footer.disclaimer.p3"></p>
        <p class="helper-copy footer-meta"><span data-i18n="footer.source"></span> · <span data-i18n="footer.more"></span> <a href="https://cezar-chirila.com/" target="_blank" rel="noreferrer">www.cezar-chirila.com</a></p>
      </section>`;
  }
  initLangSwitch();
}
