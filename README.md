# Karel Robot — AI e-mailový administrátor

Interaktivní webová aplikace, která simuluje AI zaměstnance zpracovávajícího příchozí zákaznické e-maily v českém prostředí. Demo běží na dvou režimech: (a) lokální simulovaný analyzátor (`local-demo`) bez externích závislostí, (b) reálný LLM routing přes Ollama Cloud (modely `deepseek-v4-flash`, `minimax-m3`, `kimi-k2.7-code` apod.) schovaný za Vercel serverless funkcí.

> **Aktuální stav (ověřeno 2026-08-29):** build prochází (`npm run build`), ale **`npm run lint` (tsc --noEmit) FAILUJE** — typová chyba v `src/components/ResultView.tsx:7` (`React.lazy` očekává `default` export, `CompanySavingsDashboard` je named export). Žádné testy. Podrobný faktický stav: [`planner/state.md`](planner/state.md).

## Demo
- URL: <https://karel.petrpiskacek.cloud>
- AI Studio kopie: <https://ai.studio/apps/61077f2a-a585-4d94-bb13-a66711e1f4be>

## Účel
- Třídit příchozí e-maily do akcí `DRAFT` (připravit odpověď), `ACKNOWLEDGE` (potvrdit + eskalovat), `ESCALATE` (předat právnímu/retenčnímu týmu).
- Měřit ekonomický dopad: lidské minuty vs. AI sekundy, úspora Kč/hod, automatizační poměr.
- Poskytnout samoobslužný dashboard (ROI simulátor) pro operátora, který si chce ověřit, zda se AI vyplatí.

## Stack
- **Frontend:** React 19 + TypeScript, Vite 6, Tailwind CSS v4 (nativní `@import "tailwindcss"`), Motion (Framer Motion 12) pro animace, Recharts pro grafy, lucide-react pro ikony.
- **Backend:** Vercel Serverless Functions (TypeScript, `@vercel/node`).
- **LLM:** Ollama Cloud API (`https://ollama.com/api/v1/chat/completions`) s fallbackem na `https://ollama.com/api/generate`. API klíč se čte z `process.env.OLLAMA_API_KEY`.
- **Build:** `vite build` → statický `dist/`. SPA rewrite na `index.html`, API cesty `/api/*`.

## Struktura

```
api/
  analyze.ts      POST /api/analyze — LLM routing + double-check pod confidence 0.80
  health.ts       GET  /api/health   — verze, stav klíče
  models.ts       GET  /api/models    — filtrovaný seznam z Ollama /api/tags
src/
  App.tsx         Orchestrátor stavů: form → processing → result
  types.ts        EmailInput, AnalysisResult, ViewState
  components/     AppHeader, EmailFormView, ProcessingView, ResultView,
                  SavingsMetrics, CompanySavingsDashboard, SettingsModal,
                  TourGuide, DataParticles, DataReadout, ScanBeam, AiEmployeeFeature
  lib/
    emailAnalysis.ts    ApiEmailAnalyzer + LocalDemoEmailAnalyzer
    savingsCalculator.ts calculateSavings / savedMinutesWithReview
    templateGenerator.ts generátor demo šablon (eshop / telco / b2b)
docs/saas-roadmap.md    interní roadmap
dev-docs.md, user-guide.md (CZ dokumentace pro vývojáře a uživatele)
```

## Konfigurace
- `OLLAMA_API_KEY` — povinný pro reálný LLM routing. Demo režim funguje bez klíče.
- Model se vybírá v UI (AppHeader → Settings) ze seznamu povolených v `api/models.ts`. Povolené: `deepseek-v4-flash`, `nemotron-3-nano:30b`, `gemma4:31b`, `minimax-m3`, `minimax-m2.7`, `glm-5.1`, `glm-5.2`, `kimi-k2.6`, `kimi-k2.7-code`, `gpt-oss:20b`.

## Spuštění lokálně

```bash
npm install
npm run dev        # Vite dev server (port 3203)
npm run build      # produkční build do dist/
npm run preview    # statický náhled
npm run lint       # tsc --noEmit
```

API endpointy (`/api/*`) se v dev režimu simulují přes Vite rewrite; pro plný backend spusťte `vercel dev` nebo nasazením na Vercel (viz `vercel.json`).

## Tok dat

1. Uživatel vloží e-mail nebo použije šablonu (Rychle napiš / Vlastní).
2. `App.handleSubmit` vytvoří `ApiEmailAnalyzer` nebo `LocalDemoEmailAnalyzer`.
3. Pro `Api`: `POST /api/analyze` → `api/analyze.ts` zavolá Ollama s `response_format: json_object` a systémovým promptem v češtině (vždy vykání, podpis `S pozdravem, Karel Robot`).
4. Pokud `confidence < 0.80`, běží **double-check** pass se samostatným 20s timeoutem.
5. Výstup se validuje proti mantinelům (humanMinutes 0–15, aiSeconds 1–10, hourlyCost 0/400–600, confidence 0–1) a přepíše se `aiSeconds` skutečnou latencí.
6. `ResultView` zobrazí akci, důvody, ROI a navrhovaný text odpovědi.

## Bezpečnost
- CSP v `vercel.json` povoluje pouze `connect-src 'self' https://ollama.com`.
- API klíč nikdy neopustí serverless funkci; klient posílá jen `model + input`.
- CORS hlavičky (`Access-Control-Allow-*`) na všech API handlerech.
- `api/analyze.ts` loguje `requestId`, model, délku vstupu, akci a confidence. Logy jdou do Vercel stdout.

## Známá omezení
- Demo šablony jsou deterministicky generované (`templateGenerator.ts`), ne z reálné historie.
- Modelová vrstva je svázaná na Ollama Cloud — přepnutí na jiný LLM provider vyžaduje úpravu `api/analyze.ts` (konstanty `OLLAMA_API_URL`, hlavičky).
- Reálné ověření identity odesílatele (`@example.cz` / `@novycloud.cz`) je jen v demo režimu; produkční nasazení vyžaduje integraci s CRM/ticketing systémem.
- `metadata.json` obsahuje pozůstatek z AI Studio (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`), nepoužívá se.

## Další kroky
- Napojení na reálnou e-mailovou schránku (IMAP/O365) místo ručního vkládání.
- Per-klient tenancí klíč + audit log (viz `docs/saas-roadmap.md`).
- Export výsledků do CSV/Jira.
- Testy: chybí unit/integration sada. Navíc `npm run lint` (tsc --noEmit) aktuálně FAILUJE (typová chyba v `ResultView.tsx:7`) — typová kontrola je tak momentálně nepoužitelná, viz [`planner/state.md`](planner/state.md).
