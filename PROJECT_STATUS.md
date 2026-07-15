# LTD Assistant Version 1

## Aktuellt mål

Slutverifierad frontend-only Version 1 enligt kravdokumentet, med fungerande beräkningsmotor, lokal datalagring, liveassistent, speljournal, backup/export, tester och GitHub Pages-kompatibel deployment.

## Gap-analys

### Redan färdigt

- Kravspecifikationen är genomläst i sin helhet.
- React + TypeScript + Vite-bas finns i projektroten.
- Samtliga obligatoriska huvudfunktioner för Version 1 är implementerade.

### Delvis färdigt

- Inga delar återstår i delvis färdigt läge.

### Saknas

- Inga obligatoriska Version 1-delar saknas enligt nuvarande verifiering.

### Blockerande problem

- Ingen tidigare kodbas eller `package.json` fanns i projektroten vid start, så jämförelsen mot befintlig implementation gav en tom baslinje.
- Därför byggdes Version 1 från grunden i rätt fasordning.

### Rekommenderad genomförandeordning

1. Projektgrund, scripts, router, layout och felhantering.
2. Domänmodeller, scheman och gemensamma konstanter.
3. Ren beräkningsmotor med tester.
4. Lagring, repository och migreringsramverk.
5. Appstate och dataflöden.
6. Sidor för dashboard, ny match och matchanalys.
7. Liveassistent och livehistorik.
8. Trading, journal, backup och inställningar.
9. Integrationstester, E2E, CI och slutverifiering.

## Genomförda faser

- Läsning av kravspecifikation.
- Inspektion av projektmappen.
- Projektgrund och beroenden.
- Domänmodeller och Zod-validering.
- Oddsnormalisering, LTD-score och livebeslutsmotor.
- Liability-, lay stake- och hedgeberäkningar.
- IndexedDB-repository, `localStorage`-inställningar och migreringsramverk.
- Appstate med Context och reducer.
- Dashboard, ny match, matchanalys, liveassistent, journal, settings och backup.
- CSV-export, JSON-backup och importpreview.
- Enhetstester, integrationstester och Playwright-E2E.
- GitHub Actions för CI och GitHub Pages.
- README, DECISIONS och slutlig statusdokumentation.

## Pågående fas

Ingen. Samtliga obligatoriska faser för Version 1 är genomförda och verifierade.

## Kvarvarande faser

Inga obligatoriska faser återstår.

## Viktiga beslut

- Den tomma projektmappen behandlas som en giltig startpunkt och appen byggs därför från grunden utan att utöka omfattningen.
- Implementationen följer den föreslagna mappseparationen mellan UI, domän, motor, lagring och validering.
- HashRouter och Vite base `/ltd-assistant/` används konsekvent för GitHub Pages.
- All användardata hålls lokalt via IndexedDB och `localStorage`.

## Identifierade risker

- Framtida schemaändringar kräver uppdaterade migreringar innan import av nyare dataformat.
- All matchdata matas in manuellt, vilket gör användarinmatning fortsatt till den största felkällan.

## Kända begränsningar

- Ingen backend eller extern oddsdata kommer att införas i Version 1.
- All match- och livedata matas in manuellt enligt specifikationen.
- Ingen synkronisering mellan olika enheter finns.
- Ingen automatisk spelplacering finns.

## Verifiering

- `npm run typecheck`: passerar
- `npm run test:run`: passerar
- `npm run test:integration`: passerar
- `npm run test:e2e`: 9 passerade, 1 mobilspec som medvetet skippar desktop-körning
- `npm run build`: passerar

## Stoppkriterier

- [x] appen startar lokalt
- [x] TypeScript-kontrollen passerar
- [x] enhetstesterna passerar
- [x] integrationstesterna passerar
- [x] de kritiska Playwright-testerna passerar
- [x] produktionsbuilden passerar
- [x] GitHub Pages-workflow finns
- [x] inga backendberoenden finns
- [x] inga API-nycklar finns i frontend
- [x] en kandidat kan skapas och sparas
- [x] liveassistenten fungerar
- [x] PLAY, AVVAKTA och SKIP ger tydliga orsaker
- [x] liability beräknas korrekt
- [x] hedge beräknas korrekt
- [x] en trade kan sparas och redigeras
- [x] journalstatistik visas
- [x] data finns kvar efter omladdning
- [x] JSON-backup kan exporteras och återställas
- [x] CSV-journal kan exporteras
- [x] appen fungerar i mobil viewport
- [x] README är uppdaterad
- [x] `PROJECT_STATUS.md` visar att samtliga obligatoriska faser är klara
