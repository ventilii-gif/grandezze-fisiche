# Grandezze Fisiche 📏

Web app didattica in italiano per ragazzi di ~15 anni, per imparare:

- **il concetto di grandezza fisica** e le 7 unità fondamentali del Sistema Internazionale;
- **multipli e sottomultipli** e le equivalenze «lineari» (fattore 10);
- **aree e volumi**, capendo *perché* i gradini valgono ×100 e ×1000 (e il legame con i litri);
- **grandezze derivate**: densità e velocità (più forza, pressione, portata, accelerazione).

Include una **sezione quiz di allenamento** con feedback incoraggianti:

- **Teoria** — domande a risposta multipla con richiamo dei concetti chiave;
- **Esercizi graduati** (facile / medio / difficile) sulle equivalenze nelle tre aree:
  unità fondamentali, aree e volumi, grandezze derivate;
- **Misto** — un po' di tutto.

Gli esercizi numerici sono **generati casualmente**, quindi l'allenamento è praticamente infinito.

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
