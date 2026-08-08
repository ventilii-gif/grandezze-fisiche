/* =========================================================
   Grandezze Fisiche — Logica dell'interfaccia
   Schede e sottoschede, tema giorno/notte, convertitori,
   esercizi guidati, quiz a feedback immediato e quiz finale.
   ========================================================= */
(function () {
  "use strict";
  const QE = window.QuizEngine;
  const { parseUser, isCorrectNumeric, fmt } = QE;

  /* ---------------- Tema giorno / notte ---------------- */
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = themeToggle.querySelector(".theme-icon");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Passa al tema chiaro (giorno)" : "Passa al tema scuro (notte)"
    );
    try { localStorage.setItem("gf-theme", theme); } catch (e) {}
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("gf-theme"); } catch (e) {}
  if (!savedTheme) {
    savedTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  applyTheme(savedTheme);
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  /* ---------------- Schede principali ---------------- */
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  function showTab(id) {
    tabPanels.forEach((p) => p.classList.toggle("is-active", p.dataset.tab === id));
    tabButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.tab === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  tabButtons.forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
  document.querySelectorAll("[data-goto]").forEach((b) =>
    b.addEventListener("click", () => showTab(b.dataset.goto))
  );

  /* ---------------- Sottoschede ---------------- */
  document.querySelectorAll(".subnav").forEach((nav) => {
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".subnav-btn");
      if (!btn) return;
      const panel = nav.closest(".tab-panel");
      panel.querySelectorAll(".subnav-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
      panel.querySelectorAll(".sub-panel").forEach((p) =>
        p.classList.toggle("is-active", p.dataset.sub === btn.dataset.sub)
      );
    });
  });

  /* ---------------- Convertitori interattivi ---------------- */
  function buildConverter(mountId, config) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    const optionsHtml = config.units.map((u) => `<option value="${u.factor}">${u.label}</option>`).join("");
    mount.innerHTML = `
      <div class="converter-row">
        <div class="converter-field">
          <label for="${mountId}-val">Valore</label>
          <input id="${mountId}-val" type="number" inputmode="decimal" value="1" step="any" />
        </div>
        <div class="converter-field">
          <label for="${mountId}-from">Da</label>
          <select id="${mountId}-from">${optionsHtml}</select>
        </div>
        <span class="converter-equals">=</span>
        <div class="converter-field">
          <label for="${mountId}-to">A</label>
          <select id="${mountId}-to">${optionsHtml}</select>
        </div>
      </div>
      <div class="converter-result" id="${mountId}-out" aria-live="polite"></div>`;
    const valEl = document.getElementById(`${mountId}-val`);
    const fromEl = document.getElementById(`${mountId}-from`);
    const toEl = document.getElementById(`${mountId}-to`);
    const outEl = document.getElementById(`${mountId}-out`);
    fromEl.selectedIndex = config.defaultFrom ?? 0;
    toEl.selectedIndex = config.defaultTo ?? Math.min(1, config.units.length - 1);
    function update() {
      const v = parseFloat(valEl.value);
      const fromF = parseFloat(fromEl.value), toF = parseFloat(toEl.value);
      const fromLabel = fromEl.options[fromEl.selectedIndex].text;
      const toLabel = toEl.options[toEl.selectedIndex].text;
      if (!isFinite(v)) { outEl.textContent = "Inserisci un valore numerico."; return; }
      outEl.innerHTML = `${fmt(v)} ${fromLabel} = <strong>${fmt(v * (fromF / toF))} ${toLabel}</strong>`;
    }
    [valEl, fromEl, toEl].forEach((el) => { el.addEventListener("input", update); el.addEventListener("change", update); });
    update();
  }

  function buildDerivedConverter(mountId, categories) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    const catNames = Object.keys(categories);
    const catOptions = catNames.map((name, i) => `<option value="${i}">${name}</option>`).join("");
    mount.innerHTML = `
      <div class="converter-field converter-category">
        <label for="${mountId}-cat">Grandezza</label>
        <select id="${mountId}-cat">${catOptions}</select>
      </div>
      <div class="converter-row">
        <div class="converter-field">
          <label for="${mountId}-val">Valore</label>
          <input id="${mountId}-val" type="number" inputmode="decimal" value="1" step="any" />
        </div>
        <div class="converter-field">
          <label for="${mountId}-from">Da</label>
          <select id="${mountId}-from"></select>
        </div>
        <span class="converter-equals">=</span>
        <div class="converter-field">
          <label for="${mountId}-to">A</label>
          <select id="${mountId}-to"></select>
        </div>
      </div>
      <div class="converter-result" id="${mountId}-out" aria-live="polite"></div>
      <p class="converter-note" id="${mountId}-note"></p>
      <ul class="unit-legend" id="${mountId}-legend"></ul>`;
    const catEl = document.getElementById(`${mountId}-cat`);
    const valEl = document.getElementById(`${mountId}-val`);
    const fromEl = document.getElementById(`${mountId}-from`);
    const toEl = document.getElementById(`${mountId}-to`);
    const outEl = document.getElementById(`${mountId}-out`);
    const noteEl = document.getElementById(`${mountId}-note`);
    const legendEl = document.getElementById(`${mountId}-legend`);
    function populateUnits() {
      const cat = categories[catNames[catEl.value]];
      const units = cat.units;
      const opts = units.map((u) => `<option value="${u.factor}">${u.label}</option>`).join("");
      fromEl.innerHTML = opts; toEl.innerHTML = opts;
      fromEl.selectedIndex = 0; toEl.selectedIndex = Math.min(1, units.length - 1);
      noteEl.innerHTML = cat.note ? `💡 ${cat.note}` : "";
      legendEl.innerHTML = units.map((u) => `<li><span class="legend-unit">${u.label}</span> ${u.hint || ""}</li>`).join("");
    }
    function update() {
      const v = parseFloat(valEl.value);
      const fromF = parseFloat(fromEl.value), toF = parseFloat(toEl.value);
      const fromLabel = fromEl.options[fromEl.selectedIndex].text;
      const toLabel = toEl.options[toEl.selectedIndex].text;
      if (!isFinite(v)) { outEl.textContent = "Inserisci un valore numerico."; return; }
      outEl.innerHTML = `${fmt(v)} ${fromLabel} = <strong>${fmt(v * (fromF / toF))} ${toLabel}</strong>`;
    }
    catEl.addEventListener("change", () => { populateUnits(); update(); });
    [valEl, fromEl, toEl].forEach((el) => { el.addEventListener("input", update); el.addEventListener("change", update); });
    populateUnits(); update();
  }

  // Configurazioni dei convertitori
  buildConverter("sim-fondamentali", {
    units: [
      { label: "km", factor: 1000 }, { label: "hm", factor: 100 }, { label: "dam", factor: 10 },
      { label: "m", factor: 1 }, { label: "dm", factor: 0.1 }, { label: "cm", factor: 0.01 }, { label: "mm", factor: 0.001 }
    ],
    defaultFrom: 0, defaultTo: 3
  });
  buildConverter("sim-aree", {
    units: [
      { label: "km²", factor: 1e6 }, { label: "hm² (ettaro)", factor: 1e4 }, { label: "dam² (ara)", factor: 1e2 },
      { label: "m²", factor: 1 }, { label: "dm²", factor: 1e-2 }, { label: "cm²", factor: 1e-4 }, { label: "mm²", factor: 1e-6 }
    ],
    defaultFrom: 3, defaultTo: 4
  });
  buildConverter("sim-volumi", {
    units: [
      { label: "m³", factor: 1 }, { label: "dm³", factor: 1e-3 }, { label: "L", factor: 1e-3 },
      { label: "cm³", factor: 1e-6 }, { label: "mL", factor: 1e-6 }, { label: "mm³", factor: 1e-9 }
    ],
    defaultFrom: 0, defaultTo: 2
  });
  buildDerivedConverter("sim-derivate", {
    "Velocità": {
      note: "Velocità = Δspazio ÷ Δtempo (spazio percorso nel tempo). Un pedone cammina a circa 1,4 m/s (5 km/h).",
      units: [
        { label: "m/s", factor: 1, hint: "unità SI: metri percorsi in 1 secondo" },
        { label: "km/h", factor: 1 / 3.6, hint: "chilometri all'ora; ÷ 3,6 per avere i m/s" },
        { label: "cm/s", factor: 0.01, hint: "centimetri al secondo (velocità piccole)" },
        { label: "nodo (kn)", factor: 1852 / 3600, hint: "usato in mare: 1 nodo = 1,852 km/h" }
      ]
    },
    "Densità": {
      note: "Densità = massa ÷ volume. L'acqua vale 1 g/cm³ = 1000 kg/m³.",
      units: [
        { label: "kg/m³", factor: 1, hint: "unità SI" },
        { label: "g/cm³", factor: 1000, hint: "molto usata a scuola: 1 g/cm³ = 1000 kg/m³" },
        { label: "kg/L", factor: 1000, hint: "chilogrammi per litro (= g/cm³)" },
        { label: "g/L", factor: 1, hint: "grammi per litro (= kg/m³)" }
      ]
    },
    "Pressione": {
      note: "Pressione = forza ÷ area. La pressione atmosferica al livello del mare è circa 1 atm ≈ 1013 hPa.",
      units: [
        { label: "Pa", factor: 1, hint: "pascal, unità SI = 1 N/m²" },
        { label: "hPa", factor: 100, hint: "ettopascal, usato in meteorologia" },
        { label: "kPa", factor: 1000, hint: "chilopascal = 1000 Pa" },
        { label: "bar", factor: 100000, hint: "1 bar ≈ pressione atmosferica ≈ 100 000 Pa" },
        { label: "atm", factor: 101325, hint: "atmosfera: pressione media al livello del mare" },
        { label: "mmHg", factor: 133.322, hint: "millimetri di mercurio (pressione del sangue)" }
      ]
    },
    "Portata": {
      note: "Portata = volume ÷ tempo: quanto fluido passa in un certo tempo. Un rubinetto eroga circa 0,1–0,2 L/s.",
      units: [
        { label: "m³/s", factor: 1, hint: "unità SI" },
        { label: "L/s", factor: 0.001, hint: "litri al secondo" },
        { label: "L/min", factor: 0.001 / 60, hint: "litri al minuto" },
        { label: "m³/h", factor: 1 / 3600, hint: "metri cubi all'ora" }
      ]
    },
    "Forza": {
      note: "Forza = massa × accelerazione. La forza-peso di 1 kg sulla Terra è circa 9,8 N.",
      units: [
        { label: "N", factor: 1, hint: "newton, unità SI" },
        { label: "daN", factor: 10, hint: "decanewton ≈ peso di 1 kg (circa 9,8 N)" },
        { label: "kN", factor: 1000, hint: "chilonewton = 1000 N" }
      ]
    },
    "Energia / Lavoro": {
      note: "Energia e lavoro si misurano nella stessa unità. Una barretta di cioccolato ha circa 500 kJ.",
      units: [
        { label: "J", factor: 1, hint: "joule, unità SI" },
        { label: "kJ", factor: 1000, hint: "chilojoule = 1000 J" },
        { label: "cal", factor: 4.186, hint: "caloria: 1 cal = 4,186 J" },
        { label: "kcal", factor: 4186, hint: "chilocaloria (le «Calorie» degli alimenti)" },
        { label: "Wh", factor: 3600, hint: "wattora: energia di 1 W per 1 ora = 3600 J" },
        { label: "kWh", factor: 3.6e6, hint: "chilowattora: bolletta della luce" }
      ]
    },
    "Potenza": {
      note: "Potenza = energia ÷ tempo: quanto lavoro si compie ogni secondo. Una lampadina LED usa circa 10 W.",
      units: [
        { label: "W", factor: 1, hint: "watt, unità SI = 1 J/s" },
        { label: "kW", factor: 1000, hint: "chilowatt = 1000 W" },
        { label: "CV", factor: 735.5, hint: "cavallo vapore: 1 CV ≈ 735,5 W (motori)" },
        { label: "MW", factor: 1e6, hint: "megawatt = 1 000 000 W (centrali)" }
      ]
    },
    "Accelerazione": {
      note: "Accelerazione = Δvelocità ÷ Δtempo (variazione di velocità nel tempo). La gravità terrestre vale g ≈ 9,81 m/s².",
      units: [
        { label: "m/s²", factor: 1, hint: "unità SI: la velocità cambia di 1 m/s ogni secondo" },
        { label: "cm/s²", factor: 0.01, hint: "centimetri al secondo quadrato" },
        { label: "g (gravità)", factor: 9.81, hint: "accelerazione di gravità: 1 g ≈ 9,81 m/s²" }
      ]
    }
  });

  /* ---------------- Feedback incoraggiante ---------------- */
  const PRAISE = ["Bravissimo! 🎉", "Esatto, ottimo lavoro! 💪", "Perfetto! ⭐", "Proprio così, continua così! 🚀", "Grande, hai capito il meccanismo! 👏"];
  const ENCOURAGE = ["Non preoccuparti, si impara sbagliando! 💡", "Quasi! Guarda la spiegazione e riprova. 🌱", "Capita a tutti: leggi il perché, così la prossima la prendi! 🤝", "Nessun problema, ora hai un trucco in più. ✨"];
  const rndFrom = (a) => a[Math.floor(Math.random() * a.length)];

  function feedbackHtml(correct, why) {
    return `<div class="feedback ${correct ? "good" : "bad"}">
        <p class="feedback-head">${correct ? rndFrom(PRAISE) : rndFrom(ENCOURAGE)}</p>
        ${why ? `<p class="feedback-body">${why}</p>` : ""}
      </div>`;
  }

  /* ---------------- Record (localStorage) ---------------- */
  function getBest(key) {
    try { const v = parseInt(localStorage.getItem(key), 10); return isNaN(v) ? null : v; } catch (e) { return null; }
  }
  function setBest(key, value) { try { localStorage.setItem(key, String(value)); } catch (e) {} }

  const LEVEL_LABEL = { facile: "🌱 Facile", medio: "🔥 Medio", difficile: "🚀 Difficile" };

  /* ---------------- Esercizi guidati passo-passo ---------------- */
  function createGuided(mountId, topic) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    let items = [], idx = 0, answered = false, correctCount = 0;

    function renderStart() {
      mount.innerHTML = `
        <div class="quiz-start">
          <h2>Esercizi guidati</h2>
          <p class="quiz-start-desc">Esercizi in ordine crescente di difficoltà. Per ognuno puoi chiedere un <strong>suggerimento</strong> e vedere i <strong>passaggi</strong> della soluzione. Prenditi il tuo tempo: qui si impara il metodo!</p>
          <button class="btn btn-primary btn-lg" data-act="gstart">Inizia gli esercizi guidati →</button>
        </div>`;
      mount.querySelector('[data-act="gstart"]').addEventListener("click", start);
    }
    function start() { items = QE.buildGuided(topic); idx = 0; correctCount = 0; renderItem(); }

    function renderItem() {
      if (idx >= items.length) return finish();
      answered = false;
      const q = items[idx];
      mount.innerHTML = `
        <div class="quiz-topbar">
          <div class="quiz-progress">
            <span>Esercizio ${idx + 1} di ${items.length} · ${LEVEL_LABEL[q.level]}</span>
            <div class="progress-track"><div class="progress-fill" style="width:${(idx / items.length) * 100}%"></div></div>
          </div>
        </div>
        <div class="quiz-card">
          <div class="quiz-question"><span class="q-tag">${q.tag}</span><br>${q.prompt}</div>
          <div class="guided-tools">
            <button class="btn btn-ghost btn-sm" data-act="hint">💡 Suggerimento</button>
            <button class="btn btn-ghost btn-sm" data-act="steps">📖 Mostra i passaggi</button>
          </div>
          <div class="guided-reveal js-hint" hidden><strong>Suggerimento:</strong> ${q.hint}</div>
          <div class="guided-reveal js-steps" hidden><strong>Passaggi:</strong> ${q.steps}</div>
          <div class="answer-numeric">
            <input type="text" inputmode="decimal" class="js-num" placeholder="Scrivi il risultato" autocomplete="off" />
            <span class="unit-label">${q.unit}</span>
            <button class="btn btn-primary js-check">Controlla</button>
          </div>
          <p class="numeric-hint">Puoi usare la virgola e arrotondare alla seconda cifra decimale.</p>
          <div class="feedback-slot"></div>
        </div>
        <div class="quiz-actions">
          <button class="btn btn-ghost" data-act="quit">Termina</button>
          <button class="btn btn-primary js-next" hidden>Prossimo →</button>
        </div>`;
      const hintEl = mount.querySelector(".js-hint");
      const stepsEl = mount.querySelector(".js-steps");
      mount.querySelector('[data-act="hint"]').addEventListener("click", () => { hintEl.hidden = false; });
      mount.querySelector('[data-act="steps"]').addEventListener("click", () => { stepsEl.hidden = false; });
      mount.querySelector('[data-act="quit"]').addEventListener("click", renderStart);
      const input = mount.querySelector(".js-num");
      const check = mount.querySelector(".js-check");
      const next = mount.querySelector(".js-next");
      input.focus();
      function submit() {
        if (answered) return;
        const u = parseUser(input.value);
        if (input.value.trim() === "" || isNaN(u)) { input.focus(); return; }
        answered = true; input.disabled = true; check.disabled = true;
        const correct = isCorrectNumeric(u, q.answer);
        if (correct) correctCount++;
        stepsEl.hidden = false; // svela sempre i passaggi dopo la risposta
        mount.querySelector(".feedback-slot").innerHTML = feedbackHtml(correct, correct ? "" : "Rileggi i passaggi qui sopra: al prossimo esercizio ci riprovi!");
        next.hidden = false;
        next.textContent = idx + 1 >= items.length ? "Concludi →" : "Prossimo →";
        mount.querySelector(".progress-fill").style.width = `${((idx + 1) / items.length) * 100}%`;
        next.focus();
      }
      check.addEventListener("click", submit);
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
      next.addEventListener("click", () => { idx++; renderItem(); });
    }

    function finish() {
      mount.innerHTML = `
        <div class="quiz-summary-inner">
          <div class="summary-emoji">🎓</div>
          <p class="summary-score">${correctCount} / ${items.length}</p>
          <p class="summary-msg">Hai completato gli esercizi guidati! Quando ti senti pronto, prova i <strong>10 quiz</strong> a feedback immediato.</p>
          <div class="summary-actions">
            <button class="btn btn-primary" data-act="grestart">Rifai gli esercizi</button>
          </div>
        </div>`;
      mount.querySelector('[data-act="grestart"]').addEventListener("click", start);
    }

    renderStart();
  }

  /* ---------------- Quiz (feedback immediato o correzione finale) ----------------
     opts = { build:()=>[domande], mode:'immediate'|'end', recordKey, desc, startLabel } */
  function createQuiz(mountId, opts) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    let questions = [], idx = 0, score = 0, answered = false, review = [];
    const immediate = opts.mode === "immediate";

    function renderStart() {
      const best = getBest(opts.recordKey);
      mount.innerHTML = `
        <div class="quiz-start">
          <p class="quiz-start-desc">${opts.desc || ""}</p>
          ${best !== null ? `<p class="record-info">🏅 Il tuo record: <strong>${best} / ${opts.total}</strong></p>` : ""}
          <button class="btn btn-primary btn-lg" data-act="qstart">${opts.startLabel || "Inizia →"}</button>
        </div>`;
      mount.querySelector('[data-act="qstart"]').addEventListener("click", start);
    }
    function start() { questions = opts.build(); idx = 0; score = 0; answered = false; review = []; renderQuestion(); }

    function renderQuestion() {
      if (idx >= questions.length) return finish(false);
      answered = false;
      const q = questions[idx];
      mount.innerHTML = `
        <div class="quiz-topbar">
          <div class="quiz-progress">
            <span>Domanda ${idx + 1} di ${questions.length}</span>
            <div class="progress-track"><div class="progress-fill" style="width:${(idx / questions.length) * 100}%"></div></div>
          </div>
          ${immediate ? `<div class="quiz-score">Punteggio: <strong class="js-score">${score}</strong></div>` : ""}
        </div>
        <div class="quiz-card js-card"></div>
        <div class="quiz-actions">
          <button class="btn btn-ghost" data-act="quit">Termina</button>
          <button class="btn btn-primary js-next" hidden>Prossima →</button>
        </div>`;
      const card = mount.querySelector(".js-card");
      if (q.type === "mc") renderMC(q, card); else renderNum(q, card);
      mount.querySelector('[data-act="quit"]').addEventListener("click", () => finish(true));
      mount.querySelector(".js-next").addEventListener("click", () => { idx++; renderQuestion(); });
    }

    function renderMC(q, card) {
      card.innerHTML = `
        <div class="quiz-question"><span class="q-tag">${q.tag}</span><br>${q.prompt}</div>
        <div class="answer-options">${q.options.map((o, i) => `<button class="answer-btn" data-i="${i}">${o}</button>`).join("")}</div>
        <div class="feedback-slot"></div>`;
      const btns = card.querySelectorAll(".answer-btn");
      btns.forEach((b) => b.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const chosen = parseInt(b.dataset.i, 10);
        const correct = chosen === q.correct;
        if (correct) score++;
        review.push({ q, correct, userText: q.options[chosen] });
        btns.forEach((x, i) => {
          x.disabled = true;
          if (immediate) { if (i === q.correct) x.classList.add("correct"); else if (i === chosen) x.classList.add("wrong"); }
          else if (i === chosen) x.classList.add("chosen");
        });
        if (immediate) card.querySelector(".feedback-slot").innerHTML = feedbackHtml(correct, q.why);
        afterAnswer();
      }));
    }

    function renderNum(q, card) {
      card.innerHTML = `
        <div class="quiz-question"><span class="q-tag">${q.tag}</span><br>${q.prompt}</div>
        <div class="answer-numeric">
          <input type="text" inputmode="decimal" class="js-num" placeholder="Scrivi il risultato" autocomplete="off" />
          <span class="unit-label">${q.unit}</span>
          <button class="btn btn-primary js-check">${immediate ? "Controlla" : "Rispondi"}</button>
        </div>
        <p class="numeric-hint">Puoi usare la virgola e arrotondare alla seconda cifra decimale.</p>
        <div class="feedback-slot"></div>`;
      const input = card.querySelector(".js-num");
      const check = card.querySelector(".js-check");
      input.focus();
      function submit() {
        if (answered) return;
        const u = parseUser(input.value);
        if (input.value.trim() === "" || isNaN(u)) { input.focus(); return; }
        answered = true; input.disabled = true; check.disabled = true;
        const correct = isCorrectNumeric(u, q.answer);
        if (correct) score++;
        review.push({ q, correct, userText: `${input.value.trim()} ${q.unit}` });
        if (immediate) card.querySelector(".feedback-slot").innerHTML = feedbackHtml(correct, q.why);
        afterAnswer();
      }
      check.addEventListener("click", submit);
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
    }

    function afterAnswer() {
      if (immediate) { const s = mount.querySelector(".js-score"); if (s) s.textContent = score; }
      const next = mount.querySelector(".js-next");
      next.hidden = false;
      next.textContent = idx + 1 >= questions.length ? (immediate ? "Vedi risultato →" : "Vedi i risultati →") : "Prossima →";
      mount.querySelector(".progress-fill").style.width = `${((idx + 1) / questions.length) * 100}%`;
      next.focus();
    }

    function finish(early) {
      const denom = early ? review.length : questions.length;
      const totalQ = questions.length;
      const pct = denom > 0 ? Math.round((score / denom) * 100) : 0;

      let emoji, msg;
      if (early) { emoji = "👋"; msg = "Quiz interrotto: torna quando vuoi per allenarti ancora!"; }
      else if (pct === 100) { emoji = "🏆"; msg = "Perfetto! Padroneggi le equivalenze come un vero fisico!"; }
      else if (pct >= 75) { emoji = "🌟"; msg = "Ottimo lavoro! Ti manca davvero poco alla perfezione."; }
      else if (pct >= 50) { emoji = "💪"; msg = "Bel progresso! Ripassa i concetti e riprova: migliorerai di sicuro."; }
      else { emoji = "🌱"; msg = "Ogni esperto è stato principiante. Rileggi la teoria e riprova: ce la farai!"; }

      let recordHtml = "";
      if (!early && denom > 0) {
        const prev = getBest(opts.recordKey);
        const isNew = prev === null || score > prev;
        if (isNew) setBest(opts.recordKey, score);
        const best = isNew ? score : prev;
        recordHtml = isNew
          ? `<p class="summary-record new">🥇 Nuovo record: <strong>${best} / ${totalQ}</strong></p>`
          : `<p class="summary-record">🏅 Record: <strong>${best} / ${totalQ}</strong></p>`;
      }

      // In modalità "end" mostro la correzione completa; in "immediate" solo gli errori.
      const showAll = !immediate;
      const list = review.filter((r) => (showAll ? true : !r.correct));
      let reviewHtml = "";
      if (!early && list.length) {
        const title = showAll ? "Correzione completa" : `Ripassa le domande sbagliate (${list.length})`;
        reviewHtml = `<div class="review-block"><h3 class="review-title">${title}</h3><ul class="review-list">` +
          list.map((r) => `
            <li class="review-item ${r.correct ? "ok" : ""}">
              <p class="review-q"><span class="q-tag">${r.q.tag}</span> ${r.q.prompt}</p>
              <p class="review-your">La tua risposta: <span class="${r.correct ? "ok-text" : "wrong-text"}">${r.userText}</span> ${r.correct ? "✓" : "✗"}</p>
              <p class="review-why">${r.q.why}</p>
            </li>`).join("") + `</ul></div>`;
      } else if (!early && immediate) {
        reviewHtml = `<p class="review-perfect">🎯 Nessun errore: tutte corrette!</p>`;
      }

      mount.innerHTML = `
        <div class="quiz-summary-inner">
          <div class="summary-emoji">${emoji}</div>
          <p class="summary-score">${score} / ${denom}</p>
          <p class="summary-msg">${msg}</p>
          ${recordHtml}
          <div class="summary-actions">
            <button class="btn btn-primary" data-act="qretry">Rifai il quiz</button>
          </div>
          ${reviewHtml}
        </div>`;
      mount.querySelector('[data-act="qretry"]').addEventListener("click", start);
    }

    renderStart();
  }

  /* ---------------- Montaggio componenti ---------------- */
  const TOPICS = ["fondamentali", "aree", "volumi", "derivate"];
  const TOPIC_NAME = { fondamentali: "unità fondamentali", aree: "aree", volumi: "volumi", derivate: "grandezze derivate" };

  TOPICS.forEach((t) => {
    createGuided(`guided-${t}`, t);
    createQuiz(`topicquiz-${t}`, {
      build: () => QE.buildTopicQuiz(t),
      mode: "immediate",
      recordKey: `gf-tq-${t}`,
      total: 10,
      desc: `10 domande sulle ${TOPIC_NAME[t]}, con risposta immediata e spiegazione. Sbagliare fa parte del gioco!`,
      startLabel: "Inizia i 10 quiz →"
    });
  });

  createQuiz("final-quiz", {
    build: () => QE.buildFinalQuiz(15),
    mode: "end",
    recordKey: "gf-final",
    total: 15,
    desc: "15 domande miste su tutti gli argomenti. La correzione appare alla fine.",
    startLabel: "Inizia il quiz finale →"
  });
})();
