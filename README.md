# Grandezze Fisiche

Web app didattica in italiano per il liceo (biennio): le basi della misura in fisica.
Pubblicata su **grandezze-fisiche.ventilii.ai**.

## Architettura

- **Un unico file `index.html`** autocontenuto (HTML + CSS + JS inline), senza build.
- Formule in **KaTeX** (via CDN), tema **chiaro e scuro** con interruttore e senza flash.
- Palette blu/ambra accessibile ai daltonici (nessuna coppia rosso/verde), stati corretto/errato
  anche con icone ✓/✕.

## Schede

1. **Introduzione** — grandezza fisica, 7 unità del SI, nota storica.
2. **Unità fondamentali** — multipli/sottomultipli ed equivalenze (fattore 10).
3. **Aree** — fattore ×100.
4. **Volumi** — fattore ×1000 e litri.
5. **Grandezze derivate** — densità, velocità, forza, pressione, portata, energia, potenza, accelerazione.
6. **Notazione scientifica** — \(a\times10^n\).
7. **Ordine di grandezza** — la potenza di 10 più vicina.
8. **Misura e incertezze** — \(x=(V\pm\Delta V)\), errore assoluto/relativo/percentuale.
9. **Strumenti di misura** — portata, sensibilità, incertezza.
10. **Errori nelle misure** — errori casuali/sistematici, misure dirette e indirette, **propagazione**
    (somma/differenza: errori assoluti; prodotto/quoziente: errori relativi).
11. **Quiz finale** — 15 domande miste con correzione alla fine.

## Le quattro sotto-schede (schede 2–10)

- **Teoria** — concetti ed esempi.
- **Simulazione** — strumento interattivo (convertitore, calcolatrice di propagazione, righello, ecc.).
- **Esercizi guidati** — esercizi graduati con suggerimento e passaggi.
- **Quiz** — dieci domande a risposta immediata, con navigazione «Precedente» (le domande già
  risposte restano bloccate in sola lettura).

Gli esercizi numerici sono generati casualmente e accettano la risposta esatta o quella
arrotondata alla seconda cifra decimale. I record vengono salvati nel browser.
