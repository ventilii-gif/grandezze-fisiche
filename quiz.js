/* =========================================================
   Grandezze Fisiche — Motore del quiz
   Espone window.QuizEngine con:
     - buildQuiz(topic, difficulty)  -> array di domande
   Tipi di domanda:
     - { type:'mc', ... }        risposta multipla (teoria)
     - { type:'numeric', ... }   inserimento numerico (equivalenze)
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Utilità ---------- */
  const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[rndInt(0, arr.length - 1)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rndInt(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Formatta un numero "all'italiana" (virgola decimale), evitando code di zeri.
  function fmt(n) {
    if (!isFinite(n)) return String(n);
    let s = Number(n.toPrecision(12)).toString();
    // notazione scientifica per numeri molto grandi/piccoli
    if (Math.abs(n) !== 0 && (Math.abs(n) >= 1e7 || Math.abs(n) < 1e-4)) {
      s = n.toExponential(4).replace(/\.?0+e/, "e");
    }
    return s.replace(".", ",");
  }

  // Converte l'input dell'utente (accetta virgola o punto, spazi, notazione 1e3)
  function parseUser(raw) {
    if (raw == null) return NaN;
    const cleaned = String(raw).trim().replace(/\s+/g, "").replace(",", ".");
    if (cleaned === "") return NaN;
    return Number(cleaned);
  }

  // Confronto con tolleranza relativa (per gli esercizi numerici)
  function isCorrectNumeric(user, expected) {
    if (!isFinite(user)) return false;
    if (expected === 0) return Math.abs(user) < 1e-9;
    return Math.abs(user - expected) / Math.abs(expected) < 1e-4;
  }

  /* =========================================================
     BANCA DI TEORIA (risposta multipla)
     ========================================================= */
  const THEORY = [
    {
      q: "Che cos'è una grandezza fisica?",
      options: [
        "Tutto ciò che si può misurare",
        "Solo un numero molto grande",
        "Un'opinione su un fenomeno",
        "Un colore o una sensazione"
      ],
      correct: 0,
      why: "Una grandezza fisica è una proprietà misurabile: le associamo un numero e un'unità di misura."
    },
    {
      q: "Da quante parti è formata una misura?",
      options: [
        "Da un numero e da un'unità di misura",
        "Solo da un numero",
        "Solo da un'unità",
        "Da tre numeri"
      ],
      correct: 0,
      why: "Ogni misura ha un numero (quante volte) e un'unità (rispetto a cosa): es. 2,5 m."
    },
    {
      q: "Quante sono le grandezze fondamentali del Sistema Internazionale?",
      options: ["7", "3", "5", "10"],
      correct: 0,
      why: "Sono 7: lunghezza, massa, tempo, temperatura, corrente elettrica, quantità di sostanza, intensità luminosa."
    },
    {
      q: "Qual è l'unità di misura della massa nel SI?",
      options: ["chilogrammo (kg)", "grammo (g)", "newton (N)", "litro (L)"],
      correct: 0,
      why: "L'unità fondamentale della massa è il chilogrammo (kg); il grammo è un suo sottomultiplo."
    },
    {
      q: "Il prefisso «chilo» (k) indica un fattore…",
      options: ["1000 (×10³)", "100 (×10²)", "0,001 (×10⁻³)", "1 000 000 (×10⁶)"],
      correct: 0,
      why: "chilo = 1000. Quindi 1 km = 1000 m e 1 kg = 1000 g."
    },
    {
      q: "Il prefisso «milli» (m) indica un fattore…",
      options: ["0,001 (×10⁻³)", "0,01 (×10⁻²)", "1000 (×10³)", "0,1 (×10⁻¹)"],
      correct: 0,
      why: "milli = un millesimo = 0,001. Quindi 1 mm = 0,001 m."
    },
    {
      q: "Passando da un'unità a quella immediatamente più piccola (es. m → dm), il numero…",
      options: [
        "si moltiplica per 10 (diventa più grande)",
        "si divide per 10 (diventa più piccolo)",
        "resta uguale",
        "si moltiplica per 100"
      ],
      correct: 0,
      why: "Unità più piccola ⇒ ne servono di più ⇒ il numero cresce: 1 m = 10 dm."
    },
    {
      q: "Perché per le AREE ogni gradino vale 100 (e non 10)?",
      options: [
        "Perché l'area ha 2 dimensioni: 10 × 10 = 100",
        "Perché gli scienziati hanno deciso a caso",
        "Perché le aree sono sempre grandi",
        "Perché 100 è più facile da ricordare"
      ],
      correct: 0,
      why: "1 m² è un quadrato di lato 1 m = 10 dm, quindi contiene 10×10 = 100 dm²."
    },
    {
      q: "Per i VOLUMI ogni gradino vale…",
      options: ["1000 (10³)", "100 (10²)", "10 (10¹)", "10 000 (10⁴)"],
      correct: 0,
      why: "Il volume ha 3 dimensioni: 10×10×10 = 1000. Quindi 1 m³ = 1000 dm³."
    },
    {
      q: "Quanto vale 1 litro in unità di volume?",
      options: ["1 dm³", "1 cm³", "1 m³", "1 mm³"],
      correct: 0,
      why: "1 L = 1 dm³. Di conseguenza 1 mL = 1 cm³ e 1 m³ = 1000 L."
    },
    {
      q: "Che cos'è una grandezza derivata?",
      options: [
        "Una grandezza ottenuta combinando quelle fondamentali",
        "Una grandezza senza unità di misura",
        "Una grandezza inventata di recente",
        "Una grandezza che non si può misurare"
      ],
      correct: 0,
      why: "Es.: la velocità (spazio/tempo) e la densità (massa/volume) derivano dalle fondamentali."
    },
    {
      q: "Con quale formula si calcola la densità?",
      options: ["d = massa / volume", "d = volume / massa", "d = massa × volume", "d = massa / tempo"],
      correct: 0,
      why: "La densità è massa diviso volume; si misura in kg/m³ o g/cm³."
    },
    {
      q: "L'acqua ha densità di circa…",
      options: ["1 g/cm³ (= 1000 kg/m³)", "10 g/cm³", "0,1 g/cm³", "1000 g/cm³"],
      correct: 0,
      why: "1 g/cm³ = 1000 kg/m³: un litro d'acqua (1 dm³) ha massa di circa 1 kg."
    },
    {
      q: "Come si calcola la velocità?",
      options: ["v = spazio / tempo", "v = tempo / spazio", "v = spazio × tempo", "v = massa / tempo"],
      correct: 0,
      why: "La velocità è spazio percorso diviso tempo impiegato; unità SI: m/s."
    },
    {
      q: "Per passare da m/s a km/h si…",
      options: ["moltiplica per 3,6", "divide per 3,6", "moltiplica per 10", "divide per 1000"],
      correct: 0,
      why: "1 m/s = 3,6 km/h. Da km/h a m/s, invece, si divide per 3,6."
    },
    {
      q: "Quale di queste NON è un'unità di misura del SI corretta per la sua grandezza?",
      options: [
        "La velocità in kg",
        "La lunghezza in metri",
        "Il tempo in secondi",
        "La massa in chilogrammi"
      ],
      correct: 0,
      why: "La velocità si misura in m/s: i kg sono l'unità della massa, non della velocità."
    }
  ];

  /* =========================================================
     GENERATORI DI ESERCIZI NUMERICI
     ========================================================= */

  // --- Prefissi lineari (fattore rispetto all'unità base) ---
  const LINEAR_UNITS = {
    lunghezza: { base: "m", name: "lunghezza" },
    massa: { base: "g", name: "massa" },
    tempo: { base: "s", name: "tempo" },
    capacita: { base: "L", name: "capacità" }
  };
  // simbolo prefisso -> fattore
  const PREFIX = [
    { s: "k", f: 1e3 }, { s: "h", f: 1e2 }, { s: "da", f: 1e1 },
    { s: "", f: 1 },
    { s: "d", f: 1e-1 }, { s: "c", f: 1e-2 }, { s: "m", f: 1e-3 }
  ];
  const PREFIX_WIDE = [
    { s: "M", f: 1e6 }, { s: "k", f: 1e3 }, { s: "h", f: 1e2 }, { s: "da", f: 1e1 },
    { s: "", f: 1 },
    { s: "d", f: 1e-1 }, { s: "c", f: 1e-2 }, { s: "m", f: 1e-3 }, { s: "µ", f: 1e-6 }
  ];

  function genLinear(difficulty) {
    const quantity = pick(Object.keys(LINEAR_UNITS));
    const base = LINEAR_UNITS[quantity].base;

    let table, maxStep, value;
    if (difficulty === "facile") {
      table = PREFIX;
      maxStep = 3;            // salti vicini
      value = pick([2, 3, 5, 10, 25, 4, 8, 12]);
    } else if (difficulty === "medio") {
      table = PREFIX;
      maxStep = 6;
      value = pick([2.5, 3.4, 0.5, 7, 120, 15, 0.25, 45]);
    } else {
      table = PREFIX_WIDE;
      maxStep = table.length - 1;
      value = pick([1250, 0.045, 3.6, 850, 0.008, 7500, 2.75]);
    }

    // scegli due prefissi diversi entro la distanza consentita
    let i = rndInt(0, table.length - 1);
    let j;
    do {
      const lo = Math.max(0, i - maxStep);
      const hi = Math.min(table.length - 1, i + maxStep);
      j = rndInt(lo, hi);
    } while (j === i);

    const from = table[i], to = table[j];
    const result = value * (from.f / to.f);
    const fromU = from.s + base;
    const toU = to.s + base;

    const steps = Math.round(Math.log10(from.f / to.f));
    const dir = steps > 0
      ? `Passi a un'unità più piccola: moltiplichi per 10 ${Math.abs(steps)} volte (× ${fmt(Math.pow(10, steps))}).`
      : `Passi a un'unità più grande: dividi per 10 ${Math.abs(steps)} volte (÷ ${fmt(Math.pow(10, -steps))}).`;

    return {
      type: "numeric",
      tag: "Unità fondamentali",
      prompt: `Converti: <strong>${fmt(value)} ${fromU}</strong> = ? ${toU}`,
      unit: toU,
      answer: result,
      why: `${dir} Risultato: ${fmt(value)} ${fromU} = <strong>${fmt(result)} ${toU}</strong>.`
    };
  }

  // --- Aree e volumi ---
  const AREA_UNITS = ["km²", "hm²", "dam²", "m²", "dm²", "cm²", "mm²"]; // fattore 100 per gradino
  const VOL_UNITS = ["km³", "m³", "dm³", "cm³", "mm³"];               // fattore 1000 (attenzione al salto km³->m³)
  // fattori rispetto a m² / m³
  const AREA_F = { "km²": 1e6, "hm²": 1e4, "dam²": 1e2, "m²": 1, "dm²": 1e-2, "cm²": 1e-4, "mm²": 1e-6 };
  const VOL_F = { "km³": 1e9, "m³": 1, "dm³": 1e-3, "cm³": 1e-6, "mm³": 1e-9 };

  function genAreaVolume(difficulty) {
    // includi anche i litri nel livello medio/difficile
    const useLiters = difficulty !== "facile" && Math.random() < 0.35;

    if (useLiters) {
      // conversioni litri <-> volumi
      const pairs = [
        { a: "L", b: "dm³", f: 1 }, { a: "mL", b: "cm³", f: 1 },
        { a: "L", b: "cm³", f: 1000 }, { a: "m³", b: "L", f: 1000 },
        { a: "L", b: "mL", f: 1000 }
      ];
      const p = pick(pairs);
      const swap = Math.random() < 0.5;
      const from = swap ? p.b : p.a;
      const to = swap ? p.a : p.b;
      const factor = swap ? 1 / p.f : p.f;
      const value = pick([1.5, 2, 0.5, 3, 250, 0.75, 5, 1.2]);
      const result = value * factor;
      return {
        type: "numeric",
        tag: "Aree e volumi",
        prompt: `Converti (capacità/volume): <strong>${fmt(value)} ${from}</strong> = ? ${to}`,
        unit: to,
        answer: result,
        why: `Ricorda: 1 L = 1 dm³, 1 mL = 1 cm³, 1 m³ = 1000 L. Quindi ${fmt(value)} ${from} = <strong>${fmt(result)} ${to}</strong>.`
      };
    }

    const isArea = Math.random() < 0.5;
    const units = isArea ? AREA_UNITS : VOL_UNITS;
    const F = isArea ? AREA_F : VOL_F;
    const perStep = isArea ? 100 : 1000;

    let maxStep, value;
    if (difficulty === "facile") { maxStep = 2; value = pick([2, 3, 5, 4, 1.5]); }
    else if (difficulty === "medio") { maxStep = 3; value = pick([2.5, 3.4, 0.5, 12, 7, 0.25]); }
    else { maxStep = units.length - 1; value = pick([1250, 0.045, 850, 3.6, 0.008]); }

    let i = rndInt(0, units.length - 1), j;
    do {
      const lo = Math.max(0, i - maxStep), hi = Math.min(units.length - 1, i + maxStep);
      j = rndInt(lo, hi);
    } while (j === i);

    const from = units[i], to = units[j];
    const result = value * (F[from] / F[to]);
    const dim = isArea ? "area (fattore 100 per gradino)" : "volume (fattore 1000 per gradino)";

    return {
      type: "numeric",
      tag: "Aree e volumi",
      prompt: `Converti (${isArea ? "area" : "volume"}): <strong>${fmt(value)} ${from}</strong> = ? ${to}`,
      unit: to,
      answer: result,
      why: `Stiamo lavorando con un ${dim}. ${fmt(value)} ${from} = <strong>${fmt(result)} ${to}</strong>.`
    };
  }

  // --- Grandezze derivate ---
  function genDerived(difficulty) {
    const kinds = difficulty === "facile"
      ? ["velocita", "densita", "forza"]
      : ["velocita", "densita", "portata", "pressione", "accelerazione", "forza", "energia", "potenza"];
    const kind = pick(kinds);

    if (kind === "velocita") {
      const toKmh = Math.random() < 0.5;
      const val = difficulty === "facile"
        ? pick([10, 5, 20, 36, 72])
        : pick([15, 25, 90, 8.5, 100, 12.5]);
      if (toKmh) {
        return numericQ("Grandezze derivate",
          `Converti la velocità: <strong>${fmt(val)} m/s</strong> = ? km/h`,
          "km/h", val * 3.6,
          `Da m/s a km/h si moltiplica per 3,6: ${fmt(val)} × 3,6 = <strong>${fmt(val * 3.6)} km/h</strong>.`);
      }
      return numericQ("Grandezze derivate",
        `Converti la velocità: <strong>${fmt(val)} km/h</strong> = ? m/s`,
        "m/s", val / 3.6,
        `Da km/h a m/s si divide per 3,6: ${fmt(val)} ÷ 3,6 = <strong>${fmt(val / 3.6)} m/s</strong>.`);
    }

    if (kind === "densita") {
      // calcolo densità o conversione g/cm³ <-> kg/m³
      if (Math.random() < 0.5 && difficulty !== "facile") {
        const toKg = Math.random() < 0.5;
        const val = pick([2.7, 0.92, 7.8, 1.2, 11.3, 0.5]);
        if (toKg) return numericQ("Grandezze derivate",
          `Converti la densità: <strong>${fmt(val)} g/cm³</strong> = ? kg/m³`,
          "kg/m³", val * 1000,
          `1 g/cm³ = 1000 kg/m³, quindi ${fmt(val)} × 1000 = <strong>${fmt(val * 1000)} kg/m³</strong>.`);
        const val2 = pick([2700, 920, 7800, 1200, 500]);
        return numericQ("Grandezze derivate",
          `Converti la densità: <strong>${fmt(val2)} kg/m³</strong> = ? g/cm³`,
          "g/cm³", val2 / 1000,
          `Si divide per 1000: ${fmt(val2)} ÷ 1000 = <strong>${fmt(val2 / 1000)} g/cm³</strong>.`);
      }
      // d = m / V
      const m = pick([100, 200, 300, 50, 250, 60]);
      const V = pick([10, 20, 25, 40, 50, 5]);
      return numericQ("Grandezze derivate",
        `Un corpo ha massa <strong>${fmt(m)} g</strong> e volume <strong>${fmt(V)} cm³</strong>. Qual è la densità in g/cm³?`,
        "g/cm³", m / V,
        `d = massa ÷ volume = ${fmt(m)} ÷ ${fmt(V)} = <strong>${fmt(m / V)} g/cm³</strong>.`);
    }

    if (kind === "portata") {
      const V = pick([12, 20, 60, 30, 90]);
      const t = pick([2, 3, 4, 5, 6]);
      return numericQ("Grandezze derivate",
        `In una condotta passano <strong>${fmt(V)} L</strong> in <strong>${fmt(t)} s</strong>. Qual è la portata in L/s?`,
        "L/s", V / t,
        `La portata è volume ÷ tempo: ${fmt(V)} ÷ ${fmt(t)} = <strong>${fmt(V / t)} L/s</strong>.`);
    }

    if (kind === "pressione") {
      const F = pick([100, 200, 50, 300, 150]);
      const A = pick([2, 4, 5, 10, 0.5]);
      return numericQ("Grandezze derivate",
        `Una forza di <strong>${fmt(F)} N</strong> agisce su un'area di <strong>${fmt(A)} m²</strong>. Qual è la pressione in Pa?`,
        "Pa", F / A,
        `La pressione è forza ÷ area: ${fmt(F)} ÷ ${fmt(A)} = <strong>${fmt(F / A)} Pa</strong>.`);
    }

    if (kind === "forza") {
      // conversione N <-> kN/daN nei livelli più alti, altrimenti F = m × a
      if (Math.random() < 0.4 && difficulty !== "facile") {
        const toN = Math.random() < 0.5;
        if (toN) {
          const val = pick([2, 3.5, 1.2, 5, 0.8]);
          return numericQ("Grandezze derivate",
            `Converti la forza: <strong>${fmt(val)} kN</strong> = ? N`,
            "N", val * 1000,
            `1 kN = 1000 N, quindi ${fmt(val)} × 1000 = <strong>${fmt(val * 1000)} N</strong>.`);
        }
        const val2 = pick([2000, 3500, 500, 4200, 800]);
        return numericQ("Grandezze derivate",
          `Converti la forza: <strong>${fmt(val2)} N</strong> = ? kN`,
          "kN", val2 / 1000,
          `Si divide per 1000: ${fmt(val2)} ÷ 1000 = <strong>${fmt(val2 / 1000)} kN</strong>.`);
      }
      // F = m × a
      const m = pick([2, 3, 5, 10, 4, 8]);
      const a = difficulty === "facile" ? pick([2, 3, 5, 10]) : pick([2.5, 9.8, 4, 6, 1.5]);
      return numericQ("Grandezze derivate",
        `Un corpo di massa <strong>${fmt(m)} kg</strong> subisce un'accelerazione di <strong>${fmt(a)} m/s²</strong>. Qual è la forza in N?`,
        "N", m * a,
        `La forza è massa × accelerazione: ${fmt(m)} × ${fmt(a)} = <strong>${fmt(m * a)} N</strong>.`);
    }

    if (kind === "energia") {
      // conversione (kJ→J, kcal→cal) oppure lavoro L = F × s
      const r = Math.random();
      if (r < 0.25) {
        const val = pick([2, 3.5, 1.2, 5, 0.75]);
        return numericQ("Grandezze derivate",
          `Converti l'energia: <strong>${fmt(val)} kJ</strong> = ? J`,
          "J", val * 1000,
          `1 kJ = 1000 J, quindi ${fmt(val)} × 1000 = <strong>${fmt(val * 1000)} J</strong>.`);
      }
      if (r < 0.45) {
        const val = pick([2, 1.5, 3, 0.5, 4]);
        return numericQ("Grandezze derivate",
          `Converti l'energia: <strong>${fmt(val)} kcal</strong> = ? cal`,
          "cal", val * 1000,
          `1 kcal = 1000 cal, quindi ${fmt(val)} × 1000 = <strong>${fmt(val * 1000)} cal</strong>.`);
      }
      // L = F × s
      const F = pick([10, 20, 50, 100, 25, 8]);
      const s = pick([2, 3, 4, 5, 10]);
      return numericQ("Grandezze derivate",
        `Una forza di <strong>${fmt(F)} N</strong> sposta un oggetto di <strong>${fmt(s)} m</strong> nella sua direzione. Qual è il lavoro in J?`,
        "J", F * s,
        `Il lavoro è forza × spostamento: ${fmt(F)} × ${fmt(s)} = <strong>${fmt(F * s)} J</strong>.`);
    }

    if (kind === "potenza") {
      // conversione kW→W oppure P = L / t
      if (Math.random() < 0.35) {
        const val = pick([2, 1.5, 3, 0.8, 5]);
        return numericQ("Grandezze derivate",
          `Converti la potenza: <strong>${fmt(val)} kW</strong> = ? W`,
          "W", val * 1000,
          `1 kW = 1000 W, quindi ${fmt(val)} × 1000 = <strong>${fmt(val * 1000)} W</strong>.`);
      }
      // P = L / t
      const L = pick([100, 200, 600, 300, 900, 1200]);
      const t = pick([2, 3, 4, 5, 6]);
      return numericQ("Grandezze derivate",
        `Un motore compie un lavoro di <strong>${fmt(L)} J</strong> in <strong>${fmt(t)} s</strong>. Qual è la potenza in W?`,
        "W", L / t,
        `La potenza è lavoro ÷ tempo: ${fmt(L)} ÷ ${fmt(t)} = <strong>${fmt(L / t)} W</strong>.`);
    }

    // accelerazione
    const dv = pick([10, 20, 30, 15, 6]);
    const t = pick([2, 3, 4, 5]);
    return numericQ("Grandezze derivate",
      `Un'auto passa da 0 a <strong>${fmt(dv)} m/s</strong> in <strong>${fmt(t)} s</strong>. Qual è l'accelerazione in m/s²?`,
      "m/s²", dv / t,
      `L'accelerazione è variazione di velocità ÷ tempo: ${fmt(dv)} ÷ ${fmt(t)} = <strong>${fmt(dv / t)} m/s²</strong>.`);
  }

  function numericQ(tag, prompt, unit, answer, why) {
    return { type: "numeric", tag, prompt, unit, answer, why };
  }

  /* =========================================================
     COSTRUZIONE DEL QUIZ
     ========================================================= */
  const N_QUESTIONS = 8;

  function buildTheory() {
    return shuffle(THEORY).slice(0, N_QUESTIONS).map((t) => {
      // Mescola l'ordine delle opzioni così la risposta corretta
      // non è sempre nella stessa posizione. Usa un flag per essere
      // robusto anche se due opzioni avessero lo stesso testo.
      const opts = shuffle(t.options.map((text, i) => ({ text, correct: i === t.correct })));
      return {
        type: "mc",
        tag: "Teoria",
        prompt: t.q,
        options: opts.map((o) => o.text),
        correct: opts.findIndex((o) => o.correct),
        why: t.why
      };
    });
  }

  function buildQuiz(topic, difficulty) {
    if (topic === "teoria") return buildTheory();

    const generators = {
      fondamentali: genLinear,
      "aree-volumi": genAreaVolume,
      derivate: genDerived
    };

    const out = [];
    if (topic === "misto") {
      const gens = [genLinear, genAreaVolume, genDerived];
      // includi anche qualche domanda di teoria nel misto
      const theory = buildTheory();
      for (let k = 0; k < N_QUESTIONS; k++) {
        if (k % 4 === 3) out.push(theory[k % theory.length]);
        else out.push(pick(gens)(difficulty));
      }
      return out;
    }

    const gen = generators[topic] || genLinear;
    for (let k = 0; k < N_QUESTIONS; k++) out.push(gen(difficulty));
    return out;
  }

  window.QuizEngine = {
    buildQuiz,
    parseUser,
    isCorrectNumeric,
    fmt,
    N_QUESTIONS
  };
})();
