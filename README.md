# 3i1 – punkt 23

Et statisk browserbaseret microforløb til uddybning af udsagnet om sammenhæng mellem arbejdsopgaver, rammer og ressourcer.

## Filer
- `index.html` – selve forløbet
- `styles.css` – visuel stil
- `app.js` – flow, lokal lagring og PDF-generering
- `ai-maerke.png` – det originale lille mærke “Genereret med AI”

## Teknik og data
- Ingen database eller server-side lagring.
- Svar gemmes kun i browserens `localStorage`, mens forløbet udfyldes.
- PDF genereres lokalt i browseren uden ekstern PDF-tjeneste.
- Efter PDF-generering slettes de lokalt gemte svar automatisk.
- Der er ingen AI-analyse af medarbejdernes svar i appen.

## GitHub Pages
Læg alle fire filer i roden af et GitHub-repository og slå GitHub Pages til på repositoryets `main` branch.

## Branding
Der anvendes kun det medfølgende `ai-maerke.png`. Der er ingen andre logoer i løsningen.
