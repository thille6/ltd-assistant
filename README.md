# LTD Assistant Version 1

Frontend-only webbapp för manuell LTD-analys, liveoperatörsläge, liability/hedge-beräkning, lokal speljournal och JSON-backup.

## Teknisk översikt

- React + TypeScript + Vite
- HashRouter för GitHub Pages
- React Context + `useReducer`
- IndexedDB via `idb` för kandidater, live snapshots och trades
- `localStorage` för modellinställningar
- Zod för validering vid I/O-gränser
- Vitest för enhets- och integrationstester
- Playwright för kritiska E2E-flöden

## Funktioner

- Registrera prematchmatch och odds
- Beräkna marginalfria sannolikheter, overround och LTD-score
- Visa förklaringar, varningar och klassificering
- Spara kandidater lokalt
- Köra liveassistent i operatörsläge med händelselogg och undo
- Visa PLAY, AVVAKTA eller SKIP med tydliga orsaker
- Beräkna liability, lay stake och hedge
- Spara, redigera, duplicera och exportera trades
- Exportera full JSON-backup och återimportera med merge eller replace
- Exportera journal till CSV

## Utveckling

```bash
npm install
npm run dev
```

## Viktiga scripts

```bash
npm run typecheck
npm run test:run
npm run test:integration
npm run test:e2e
npm run build
```

## GitHub Pages

Appen är konfigurerad med Vite `base: /ltd-assistant/` och använder HashRouter för att fungera på GitHub Pages utan serverrewrites.

## Avgränsningar i Version 1

- ingen backend
- inga användarkonton
- ingen extern oddsdata
- ingen scraping
- ingen automatisk spelplacering
- ingen synk mellan enheter
