# Projekt: karel-robot

> Roadmapa: The Strategist (Sovereign OS) · 2026-08-31 · vstup: `planner/state.md` (Archivist)
> Cíl: opravit lint, přidat testy, zpevnit LLM routing, dotáhnout ROI dashboard.

## Fáze A: Základ — opravit lint + přidat testy

- [x] Opravit lint — `src/components/ResultView.tsx:7`: změnit lazy import na `({ default }) => import(...)` NEBO přidat `export default` do `CompanySavingsDashboard` (5 min)
- [x] Ověřit lint — `npm run lint` (tsc --noEmit) musí projít bez chyb (5 min)
- [x] Přidat test runner — `vitest` do devDependencies + `"test": "vitest run"` do package.json (5 min)
- [x] Přidat smoke test pro `LocalDemoEmailAnalyzer` — ověřit klasifikaci (výpověď→ESCALATE, výpadek→ACKNOWLEDGE, neznámý→DRAFT) (5 min)
- [ ] Přidat test pro `savingsCalculator` — ověřit `calculateSavings` + `savedMinutesWithReview` (5 min)
- [ ] Ověřit build + testy — `npm run build` + `npm test` (5 min)

## Fáze B: Funkce — zpevnit routing + dashboard

- [ ] Ověřit double-check logiku — `api/analyze.ts`: potvrdit, že `confidence < 0.80` spouští druhé volání (5 min)
- [ ] Fallback UX — když Ollama Cloud selže, zobrazit jasnou chybu v UI, ne špatnou klasifikaci (5 min)
- [ ] Logovat klasifikace — přidat log do `api/analyze.ts` (requestId, model, akce, confidence) (5 min)
- [ ] CSV export — přidat tlačítko pro export klasifikací do CSV v `ResultView` (5 min)
- [ ] Ověřit build + testy — `npm run build` + `npm test` (5 min)

## Fáze C: Marketing — vnímání projektu

- [ ] Ověřit OG image — `public/og-image.png` (1200×630) se správně načítá (5 min)
- [ ] Ověřit SEO — `robots.txt` + meta tagy v `index.html` (5 min)
- [ ] Doplnit landing copy — jasná hodnota na homepage (co AI ušetří, pro koho) (5 min)
- [ ] Ověřit build — `npm run build` (5 min)

## Fáze D: Dokumentace + úklid

- [ ] Doplnit README — sekce "Testy" (jak spustit, co pokrývají) (5 min)
- [ ] Vyčistit `.env.example` — odstranit zavádějící `GEMINI_API_KEY`/`APP_URL` komentáře, nechat jen `OLLAMA_API_KEY` (5 min)
- [ ] Vyčistit `metadata.json` — odstranit `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` (AI Studio pozůstatek) (5 min)
- [ ] Ověřit finální build + testy — `npm run build` + `npm test` (5 min)

## Blokery
- Fáze A item 1 (lint fix) je triviální, ale blokuje typovou kontrolu — bez něj nelze bezpečně refaktorovat.
- Fáze B (reálný e-mail feed) — reálné e-maily nejsou zapojené, klasifikace běží na demo vstupech. Produkční nasazení vyžaduje IMAP/O365 integraci (mimo tuto roadmapu).
- Fáze D (deploy) — aplikace je na Vercel (karel.petrpiskacek.cloud), nikdy nenasadit bez explicitního povolení.
