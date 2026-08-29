# Stav projektu: Karel Robot

> Audit: 2026-08-29 · The Archivist (Sovereign OS) · 100% faktický, z kódu, git historie a běhu příkazů.
> Branch: `feat/karel-saas` · working tree **ahead 2** (2 unpushed commity: `e7609ef` docs ROADMAP, `18cd3bf` docs readme).
> Nejedná se o Next.js — je to **Vite + React 19 SPA** s Vercel serverless funkcemi v `api/`.

## Co je hotové ✅

**Funkční AI e-mailový administrátor (demo)**
- SPA: React 19 + TypeScript, Vite 6, Tailwind v4, Motion (Framer 12), Recharts, lucide-react.
- Dva režimy analýzy: `LocalDemoEmailAnalyzer` (deterministicky, klíčová slova v češtině — výpověď/právní → ESCALATE, výpadek/kompenzace → ACKNOWLEDGE, neznámý odesílatel/admin → DRAFT) a `ApiEmailAnalyzer` (reálný LLM routing přes Ollama Cloud).
- ROI simulátor a dashboard: `calculateSavings`, `savedMinutesWithReview` (zohledňuje lidskou revizi), `calculateExtendedSavings` (denní/týdenní/měsíční/roční), `formatCZK`/`formatMultiplier` (adaptivní přesnost).
- Reálná měřená latence: `aiSeconds` se přepisuje skutečnou latencí API (model podhodnocoval — hlásil 2 s vs. reálných 15 s).
- Cinematic UI: scan beam, particles, energy ring, live terminal readout (`ScanBeam`, `DataParticles`, `DataReadout`, `ProcessingView`), lazy-load dashboard (`React.lazy` → main chunk 734 kB → 390 kB).
- OG image + social meta tagy (1200×630), `public/og-image.png`, `robots.txt`.

**Backend (Vercel serverless)**
- `api/analyze.ts` — POST /api/analyze: Ollama `chat/completions` s fallbackem `generate`, JSON response, **double-check pass** když `confidence < 0.80` (samostatný 20s timeout), mantinely (humanMinutes 0–15, aiSeconds 1–10, hourlyCost 0/400–600, confidence 0–1).
- `api/health.ts` — GET: verze, stav API klíče.
- `api/models.ts` — GET: filtrovaný allowlist modelů z Ollama `/api/tags` (10 modelů).

**Bezpečnost (dobrá)**
- CSP v `vercel.json`: `connect-src 'self' https://ollama.com`; X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy.
- API klíč nikdy neopustí serverless funkci; klient posílá jen `model + input`.
- CORS hlavičky na všech API handlerech.
- `.env.local` **není** v gitu a je správně gitignorován (`.gitignore` má `.env*` + `!.env.example`); obsahuje jen `VERCEL_OIDC_TOKEN` (dev token Vercel CLI).

## Co chybí / je rozbité ⚠️

- **`npm run lint` (tsc --noEmit) FAILUJE** — TypeScript error v `src/components/ResultView.tsx:7`: `React.lazy(() => import('./CompanySavingsDashboard'))` očekává `{ default: ComponentType }`, ale `CompanySavingsDashboard` je **named export** (`export function`). TSC exit code 2. (Build prochází — Vite/esbuild odstraňuje typy bez kontroly, takže to build neblokuje.)
- **Žádné testy** — chybí jakákoli unit/integration sada. Jediný "check" je `tsc --noEmit` (a ten je rozbitý).
- **Reálné e-maily nezapojené** — klasifikace běží na demo vstupech (ruční vložení / deterministické šablony). Žádná IMAP/O365 integrace.
- **`docs/saas-roadmap.md` plán (Milestone 1–3) neimplementován** — Supabase auth/DB, analysis_history, RLS, Stripe, RAG, plugin — vše `[ ]` (jen M0: branch vytvořena `[x]`).
- **Root `ROADMAP.md` tasky vše `[ ]`** — double-check logika, fallback UX, logování (Fáze 1), realistické parametry + graf + CSV export (Fáze 2), reálný e-mail feed (Fáze 3).

## Technický dluh 🧹

- **`metadata.json` stale** — obsahuje `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` (pozůstatek z AI Studio), nepoužívá se. README to sám přiznává.
- **`.env.example` zavádějící komentáře** — popisuje `GEMINI_API_KEY` / `APP_URL` z AI Studia, ale projekt používá `OLLAMA_API_KEY`. Čisté jen `OLLAMA_API_KEY` by stačilo.
- **Nepushnuté commity (ahead 2)** — `e7609ef`, `18cd3bf` (docs: ROADMAP + readme) nejsou na origin.
- **`vercel.json.bak`** — pozůstatek (přestože `.gitignore` má `*.bak`, soubor je v repo rootu; není v tracked files, ale existuje na disku).
- **Duplicita `bun.lock` + `package-lock.json`** — oba lockfile; build používá npm.
- **Větvení stavu dokumentace** — 4 zdroje: README, root `ROADMAP.md`, `docs/saas-roadmap.md`, `dev-docs.md` — částečně překrývající se.

## Pozorování / rizika 🔍

- **Nejzávažnější: lint rozbitý + nula testů.** README tvrdí "`npm run lint` kontroluje jen typy" (jako fungující check), ale reálně typy NENÍ možné ověřit — tsc selže. Jakýkoliv refactor riskuje tiché typové chyby, které build nechytí.
- **Typová chyba v `ResultView`** je triviální fix (dvě možnosti: přidat `export default` do `CompanySavingsDashboard`, nebo změnit lazy import na `({ default }) => ...`), ale patří Builderovi, ne do auditu.
- **Ollama Cloud je jediný LLM provider** — přepnutí na jiného vyžaduje úpravu `api/analyze.ts` (konstanty URL, hlavičky). Vendor lock.
- **Model allowlist** obsahuje potenciálně zastaralé názvy (např. `deepseek-v4-flash` — README i health.ts ho mají jako default; ověřit, že tag existuje na Ollama).
- **`metadata.json` + `.env.example`** ukazují na původ AI Studio původ — čistit při příštím úklidu.
- **CORS `Access-Control-Allow-Origin: *`** na všech API handlerech — OK pro demo (žádné credentials), ale před produkcí zúžit na konkrétní origin.
- **Double-check** volá model podruhé (2× tokeny/cena) jen u `confidence < 0.80` — vědomý náklad.
