# Grandezze Fisiche 📏

Web app didattica in italiano per ragazzi di ~15 anni, organizzata in **schede e sottoschede**.

## Schede

1. **Introduzione** — che cos'è una grandezza fisica, le 7 unità fondamentali del SI e una **nota storica** (dal metro della Rivoluzione francese alle unità definite dalle costanti della natura nel 2019).
2. **Unità fondamentali** — multipli/sottomultipli ed equivalenze «lineari» (fattore 10).
3. **Aree** — perché i gradini valgono ×100.
4. **Volumi** — perché i gradini valgono ×1000, e il legame con i litri.
5. **Grandezze derivate** — densità, velocità, e altre (forza, pressione, portata, energia, potenza, accelerazione).
6. **Quiz riepilogativo finale** — 15 domande miste su tutto, con **correzione alla fine** (come una verifica).

## Le 4 sottoschede (schede 2–5)

- **Teoria** — i concetti spiegati con esempi.
- **Simulazione** — un convertitore interattivo per «giocare» con le equivalenze.
- **Esercizi guidati** — esercizi graduati (facile→difficile) con **suggerimento** e **passaggi** svelabili.
- **10 quiz** — dieci domande con **risposta immediata e incoraggiante** e spiegazione.

Gli esercizi numerici sono **generati casualmente** (allenamento praticamente infinito) e accettano
la risposta esatta o quella **arrotondata alla seconda cifra decimale**. Il miglior punteggio di ogni
quiz viene salvato nel browser.

## Tema chiaro e scuro 🌙☀️

Lo studente sceglie la modalità **giorno** (chiara) o **notte** (scura) con il pulsante in alto
a destra. La preferenza viene ricordata e, al primo avvio, viene rispettata l'impostazione
del sistema operativo.

## Come si usa

È un sito statico: nessuna installazione, nessun server necessario.

- Apri direttamente il file `index.html` con un browser, **oppure**
- pubblicalo con GitHub Pages (Settings → Pages → branch → `/root`).

## Struttura del progetto

| File | Contenuto |
|------|-----------|
| `index.html` | Struttura e contenuti didattici delle sezioni |
| `styles.css` | Stile e temi giorno/notte (variabili CSS) |
| `quiz.js` | Motore del quiz: banca di teoria e generatori di esercizi |
| `app.js` | Navigazione, tema, convertitori interattivi, logica quiz |

Tutto in italiano, senza dipendenze esterne.
