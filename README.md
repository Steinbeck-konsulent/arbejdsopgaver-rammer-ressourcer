# 3i1 – punkt 23

Et lille browserbaseret mikroforløb om sammenhængen mellem arbejdsopgaver, rammer og ressourcer.

## Filer

- `index.html` – selve siden
- `styles.css` – det visuelle design
- `app.js` – flow, lokal lagring og PDF-generering

## Sådan bruges det på GitHub Pages

1. Opret et nyt repository.
2. Upload de tre filer til roden af repository'et.
3. Åbn **Settings → Pages**.
4. Vælg deploy fra `main`-branchens root.
5. GitHub viser derefter adressen til siden.

## Data

- Svar gemmes lokalt i browserens `localStorage`, mens medarbejderen arbejder.
- Siden har ingen database, login, analytics eller AI-kald.
- PDF'en genereres lokalt i browseren af `app.js` og downloades direkte til brugerens enhed.
- Brugeren kan derefter aktivt slette de lokale svar via knappen **Slet mine lokale svar**.
- Appen sender ikke selv PDF eller besvarelser nogen steder.

## Målgruppe

Versionen er lavet til medarbejdere, der har forberedelse eller andet arbejde uden for børnetiden.

## Lokal tilpasning

Siden indeholder bevidst ingen kommune-, institutions- eller personnavne. Den kan derfor genbruges, hvor samme 3i1-punkt anvendes.

## Version 1 – bevidste afgrænsninger

Ingen database, dashboard, AI-analyse, kalenderintegration eller automatisk mailafsendelse.
