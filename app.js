/* =========================================================
   Grandezze Fisiche — Logica dell'interfaccia
   Navigazione, tema chiaro/scuro, convertitori, quiz
   ========================================================= */
(function () {
  "use strict";
  const { buildQuiz, parseUser, isCorrectNumeric, fmt } = window.QuizEngine;

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

  // preferenza salvata > preferenza di sistema > chiaro
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("gf-theme"); } catch (e) {}
  if (!savedTheme) {
    savedTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
  }
  applyTheme(savedTheme);

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  /* ---------------- Navigazione fra sezioni ---------------- */
  const navButtons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".section");

  function showSection(id) {
    sections.forEach((s) => s.classList.toggle("is-active", s.id === id));
    navButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.section === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navButtons.forEach((btn) =>
    btn.addEventListener("click", () => showSection(btn.dataset.section))
  );

  // pulsanti "vai a" all'interno delle sezioni
  document.querySelectorAll("[data-goto]").forEach((btn) =>
    btn.addEventListener("click", () => showSection(btn.dataset.goto))
  );

  /* ---------------- Convertitori interattivi ---------------- */
  function buildConverter(mountId, config) {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    const optionsHtml = config.units
      .map((u) => `<option value="${u.factor}">${u.label}</option>`)
      .join("");

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
      <div class="converter-result" id="${mountId}-out" aria-live="polite"></div>
    `;

    const valEl = document.getElementById(`${mountId}-val`);
    const fromEl = document.getElementById(`${mountId}-from`);
    const toEl = document.getElementById(`${mountId}-to`);
    const outEl = document.getElementById(`${mountId}-out`);

    fromEl.selectedIndex = config.defaultFrom ?? 0;
    toEl.selectedIndex = config.defaultTo ?? Math.min(1, config.units.length - 1);

    function update() {
      const v = parseFloat(valEl.value);
      const fromF = parseFloat(fromEl.value);
      const toF = parseFloat(toEl.value);
      const fromLabel = fromEl.options[fromEl.selectedIndex].text;
      const toLabel = toEl.options[toEl.selectedIndex].text;
      if (!isFinite(v)) {
        outEl.textContent = "Inserisci un valore numerico.";
        return;
      }
      const result = v * (fromF / toF);
      outEl.innerHTML = `${fmt(v)} ${fromLabel} = <strong>${fmt(result)} ${toLabel}</strong>`;
    }

    [valEl, fromEl, toEl].forEach((el) => {
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });
    update();
  }

  // Convertitore lineare (lunghezze — con prefissi principali)
  buildConverter("linear-converter", {
    units: [
      { label: "km", factor: 1000 },
      { label: "hm", factor: 100 },
      { label: "dam", factor: 10 },
      { label: "m", factor: 1 },
      { label: "dm", factor: 0.1 },
      { label: "cm", factor: 0.01 },
      { label: "mm", factor: 0.001 }
    ],
    defaultFrom: 0, // km
    defaultTo: 3    // m
  });

  // Convertitore aree (fattore 100 per gradino) — riferimento: m²
  buildConverter("area-converter", {
    units: [
      { label: "km²", factor: 1e6 },
      { label: "hm² (ettaro)", factor: 1e4 },
      { label: "dam² (ara)", factor: 1e2 },
      { label: "m²", factor: 1 },
      { label: "dm²", factor: 1e-2 },
      { label: "cm²", factor: 1e-4 },
      { label: "mm²", factor: 1e-6 }
    ],
    defaultFrom: 3, // m²
    defaultTo: 4    // dm²
  });

  // Convertitore volumi e litri (fattore 1000 per gradino) — riferimento: m³
  buildConverter("volume-converter", {
    units: [
      { label: "m³", factor: 1 },
      { label: "dm³", factor: 1e-3 },
      { label: "L", factor: 1e-3 },
      { label: "cm³", factor: 1e-6 },
      { label: "mL", factor: 1e-6 },
      { label: "mm³", factor: 1e-9 }
    ],
    defaultFrom: 0, // m³
    defaultTo: 2    // L
  });

  // Convertitore grandezze derivate (velocità + densità)
  buildConverter("derived-converter", {
    units: [
      { label: "m/s", factor: 3.6 },   // rispetto a km/h
      { label: "km/h", factor: 1 }
    ],
    defaultFrom: 0,
    defaultTo: 1
  });

  /* ---------------- QUIZ ---------------- */
  const launcher = document.getElementById("quiz-launcher");
  const runner = document.getElementById("quiz-runner");
  const summary = document.getElementById("quiz-summary");

  const topicRow = document.getElementById("quiz-topic");
  const diffRow = document.getElementById("quiz-difficulty");
  const diffChoice = document.getElementById("difficulty-choice");
  const diffNote = document.getElementById("difficulty-note");

  let selTopic = "teoria";
  let selDiff = "facile";

  function selectChip(row, attr, value) {
    row.querySelectorAll(".chip").forEach((c) =>
      c.classList.toggle("is-active", c.dataset[attr] === value)
    );
  }

  topicRow.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    selTopic = chip.dataset.topic;
    selectChip(topicRow, "topic", selTopic);
    // per la teoria la difficoltà non serve
    const isTheory = selTopic === "teoria";
    diffChoice.style.opacity = isTheory ? 0.5 : 1;
    diffChoice.style.pointerEvents = isTheory ? "none" : "auto";
    diffNote.hidden = !isTheory;
  });

  diffRow.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    selDiff = chip.dataset.diff;
    selectChip(diffRow, "diff", selDiff);
  });

  // stato del quiz corrente
  let questions = [];
  let idx = 0;
  let score = 0;
  let answered = false;

  const counterEl = document.getElementById("quiz-counter");
  const progressEl = document.getElementById("progress-fill");
  const scoreEl = document.getElementById("quiz-score");
  const cardEl = document.getElementById("quiz-card");
  const nextBtn = document.getElementById("next-question");

  const PRAISE = [
    "Bravissimo! 🎉", "Esatto, ottimo lavoro! 💪", "Perfetto! ⭐",
    "Proprio così, continua così! 🚀", "Grande, hai capito il meccanismo! 👏"
  ];
  const ENCOURAGE = [
    "Non preoccuparti, si impara sbagliando! 💡",
    "Quasi! Guarda la spiegazione e riprova al prossimo. 🌱",
    "Capita a tutti: leggi il perché, così la prossima la prendi! 🤝",
    "Nessun problema, ora hai un trucco in più. ✨"
  ];
  const rndFrom = (a) => a[Math.floor(Math.random() * a.length)];

  document.getElementById("start-quiz").addEventListener("click", startQuiz);
  document.getElementById("quit-quiz").addEventListener("click", () => finishQuiz(true));
  nextBtn.addEventListener("click", () => { idx++; renderQuestion(); });

  function startQuiz() {
    questions = buildQuiz(selTopic, selDiff);
    idx = 0; score = 0; answered = false;
    launcher.hidden = true;
    summary.hidden = true;
    runner.hidden = false;
    scoreEl.textContent = "0";
    renderQuestion();
  }

  function renderQuestion() {
    if (idx >= questions.length) return finishQuiz(false);
    answered = false;
    nextBtn.hidden = true;

    const q = questions[idx];
    counterEl.textContent = `Domanda ${idx + 1} di ${questions.length}`;
    progressEl.style.width = `${(idx / questions.length) * 100}%`;

    if (q.type === "mc") renderMultipleChoice(q);
    else renderNumeric(q);
  }

  function renderMultipleChoice(q) {
    const opts = q.options
      .map((opt, i) => `<button class="answer-btn" data-i="${i}">${opt}</button>`)
      .join("");
    cardEl.innerHTML = `
      <div class="quiz-question"><span class="q-tag">${q.tag}</span><br>${q.prompt}</div>
      <div class="answer-options">${opts}</div>
      <div class="feedback-slot"></div>
    `;
    const buttons = cardEl.querySelectorAll(".answer-btn");
    buttons.forEach((b) =>
      b.addEventListener("click", () => {
        if (answered) return;
        const chosen = parseInt(b.dataset.i, 10);
        gradeMultiple(q, chosen, buttons);
      })
    );
  }

  function gradeMultiple(q, chosen, buttons) {
    answered = true;
    const correct = chosen === q.correct;
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) b.classList.add("correct");
      else if (i === chosen) b.classList.add("wrong");
    });
    if (correct) { score++; scoreEl.textContent = score; }
    showFeedback(correct, q.why);
  }

  function renderNumeric(q) {
    cardEl.innerHTML = `
      <div class="quiz-question"><span class="q-tag">${q.tag}</span><br>${q.prompt}</div>
      <div class="answer-numeric">
        <input type="text" inputmode="decimal" id="num-answer"
               placeholder="Scrivi il risultato" autocomplete="off" />
        <span class="unit-label">${q.unit}</span>
        <button class="btn btn-primary" id="check-answer">Controlla</button>
      </div>
      <div class="feedback-slot"></div>
    `;
    const input = document.getElementById("num-answer");
    const checkBtn = document.getElementById("check-answer");
    input.focus();

    function submit() {
      if (answered) return;
      const user = parseUser(input.value);
      if (input.value.trim() === "" || isNaN(user)) {
        input.focus();
        return;
      }
      answered = true;
      input.disabled = true;
      checkBtn.disabled = true;
      const correct = isCorrectNumeric(user, q.answer);
      if (correct) { score++; scoreEl.textContent = score; }
      showFeedback(correct, q.why);
    }

    checkBtn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
  }

  function showFeedback(correct, why) {
    const slot = cardEl.querySelector(".feedback-slot");
    slot.innerHTML = `
      <div class="feedback ${correct ? "good" : "bad"}">
        <p class="feedback-head">${correct ? rndFrom(PRAISE) : rndFrom(ENCOURAGE)}</p>
        <p class="feedback-body">${why}</p>
      </div>
    `;
    nextBtn.hidden = false;
    nextBtn.textContent = idx + 1 >= questions.length ? "Vedi risultato →" : "Prossima →";
    progressEl.style.width = `${((idx + 1) / questions.length) * 100}%`;
    nextBtn.focus();
  }

  function finishQuiz(early) {
    runner.hidden = true;
    const total = early ? idx : questions.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    let emoji, msg;
    if (early) {
      emoji = "👋"; msg = "Quiz interrotto: torna quando vuoi per allenarti ancora!";
    } else if (pct === 100) {
      emoji = "🏆"; msg = "Perfetto! Padroneggi le equivalenze come un vero fisico!";
    } else if (pct >= 75) {
      emoji = "🌟"; msg = "Ottimo lavoro! Ti manca davvero poco alla perfezione.";
    } else if (pct >= 50) {
      emoji = "💪"; msg = "Bel progresso! Ripassa i concetti e riprova: migliorerai di sicuro.";
    } else {
      emoji = "🌱"; msg = "Ogni esperto è stato principiante. Rileggi la teoria e riprova: ce la farai!";
    }

    summary.innerHTML = `
      <div class="summary-emoji">${emoji}</div>
      <p class="summary-score">${score} / ${total}</p>
      <p class="summary-msg">${msg}</p>
      <div class="summary-actions">
        <button class="btn btn-primary" id="retry-quiz">Allenati ancora</button>
        <button class="btn btn-ghost" id="back-launcher">Cambia argomento</button>
      </div>
    `;
    summary.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });

    document.getElementById("retry-quiz").addEventListener("click", startQuiz);
    document.getElementById("back-launcher").addEventListener("click", () => {
      summary.hidden = true;
      launcher.hidden = false;
    });
  }
})();
