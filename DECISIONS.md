# Betydelsefulla beslut

## HashRouter

HashRouter används eftersom kravdokumentet kräver GitHub Pages utan serverrewrites. Det gör att klientrouting fungerar i statisk hosting och i det byggda resultatet.

## IndexedDB för journal och huvuddokument

IndexedDB används för kandidater, live snapshots, trades och exportmetadata eftersom datamängden är strukturerad, versionsbar och större än vad som är lämpligt att lägga i `localStorage`.

## localStorage begränsas till inställningar

`localStorage` används endast för modellinställningar och små UI-inställningar eftersom det är enkelt, synkront och lämpligt för små mängder data men inte för journaldokument eller historik.

## Zod vid I/O-gränser

Zod används när data läses från IndexedDB, `localStorage` eller importerad JSON för att skadad eller inkompatibel data ska få begripliga fel i stället för att krascha appen.

## Repository-interface

Ett tydligt `DataRepository`-interface införs så att UI och motor kan arbeta mot ett stabilt kontrakt. Det möjliggör senare byte till API eller Supabase utan att skriva om beräkningslogiken eller större delen av komponenterna.

## Medvetet uppskjutet till Version 2

Följande lämnas medvetet utanför Version 1 enligt kravspecifikationen:

- backend
- Supabase eller Firebase
- autentisering och konton
- odds- eller live-API
- scraping
- automatisk spelplacering
- synk mellan enheter
- maskininlärning
