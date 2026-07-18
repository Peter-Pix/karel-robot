# Vývojářská dokumentace: AI administrátor Karel

Tato příručka slouží jako kompletní technická dokumentace k projektu **Karel** (AI administrátor e-mailů). Je určena pro vývojáře, architekty a systémové integrátory, kteří se podílejí na dalším rozvoji, úpravách nebo nasazení této platformy.

---

## 1. Architektura a technologický stack

Projekt je navržen jako moderní full-stack webová aplikace v duchu Single Page Application (SPA) s vlastním API serverem zajišťujícím bezpečné napojení na LLM (Large Language Model) služby.

### Klientská část (Frontend)
- **Framework:** React 19 + TypeScript
- **Stylování:** Tailwind CSS v4 (využívá nativní `@import "tailwindcss";` a moderní CSS proměnné)
- **Animace:** `motion` (Framer Motion verze `12.x`) – stará se o plynulé přechody mezi pohledy, animace bento-grid prvků a interaktivních dialogů
- **Vizualizace a grafy:** `recharts` – reaktivní vykreslování kumulovaných úspor a distribuce času v SVG
- **Ikony:** `lucide-react` – kompletní sada moderních, jednotně stylovaných ikon

### Serverová část (Backend & Proxy)
- **Runtime:** Node.js (spouštěno pomocí `tsx` pro bezproblémové zpracování TypeScriptu v reálném čase, v produkci baleno pomocí `esbuild`)
- **Framework:** Express v4 – zajišťuje statické servírování sestavených frontendových souborů a poskytuje API koncové body (`/api/*`)
- **Vite Integration:** Během lokálního vývoje Express hostuje Vite dev server jako middleware s povoleným Hot Module Replacement (HMR) bypass módem pro zjednodušené ladění.

---

## 2. Strukturální uspořádání kódu

Struktura projektu striktně odděluje prezentační logiku od výpočetních jader a backendových integračních vrstev:

```text
├── package.json               # Definice závislostí, dev/build/start skriptů
├── tsconfig.json              # Globální TypeScript konfigurace
├── vite.config.ts             # Konfigurace sestavení klientské části pomocí Vite
├── server.ts                  # Hlavní entrypoint backendu (Express + Vite middleware)
├── dev-docs.md                # Vývojářská dokumentace (tento soubor)
├── user-guide.md              # Uživatelská příručka
├── src/
│   ├── main.tsx               # Vstupní bod React aplikace
│   ├── index.css              # Globální stylopis s nastavením Tailwindu v4 a písem
│   ├── App.tsx                # Hlavní orchestrátor stavů (Form -> Processing -> Result)
│   ├── types.ts               # Typové rozhraní (Analytické výsledky, stavy)
│   ├── components/            # Komponenty uživatelského rozhraní
│   │   ├── AppHeader.tsx               # Hlavička aplikace s volbou modelu
│   │   ├── EmailFormView.tsx           # Formulář pro zadání / výběr šablon zpráv
│   │   ├── ProcessingView.tsx          # Animovaná obrazovka simulující analýzu
│   │   ├── ResultView.tsx              # Detailní pohled na vyhodnocení e-mailu
│   │   ├── SavingsMetrics.tsx          # Dopad zpracování jednoho tiketu
│   │   ├── CompanySavingsDashboard.tsx # Interaktivní ROI simulátor (Dashboard)
│   │   ├── SettingsModal.tsx           # Správa API připojení
│   │   ├── TourGuide.tsx               # Průvodce rozhraním při prvním spuštění
│   │   └── icons/                      # Vektorové ikony
│   └── lib/                   # Výpočetní moduly a pomocné utility
│       ├── emailAnalysis.ts            # Simulovaný analyzátor a lokální demo model
│       ├── savingsCalculator.ts        # Matematický aparát pro výpočet ROI a úspor
│       └── templateGenerator.ts        # Generátor náhodných šablon zpráv pro testování
```

---

## 3. Výpočetní algoritmy (ROI Engine)

Matematický model výpočtu finančních a časových úspor je implementován v modulu `src/lib/savingsCalculator.ts`. Pro výpočet se používají konstanty:
- **Průměrný čas lidského zpracování jednoho e-mailu (`humanMinutes`):** ~4.2 minuty (liší se podle typu požadavku).
- **Hodinová sazba superhrubé mzdy operátora (`HOURLY_COST`):** Standardně nastaveno na 400 Kč/hod (zahrnuje mzdu, odvody, hardwarové a softwarové zázemí).
- **Délka pracovní směny:** 8 hodin.
- **Pracovní dny v měsíci (`WORKING_DAYS_MONTH`):** 21 dní.

### Matematické vzorce

#### A. Úspora na jednom e-mailu (`calculateSavings`)
$$U_{\check{c}as} = T_{lidský} - \frac{T_{AI}}{60}$$
$$U_{finan\check{c}ní} = \frac{U_{\check{c}as}}{60} \times M_{hodinová}$$
$$U_{\%} = \frac{U_{\check{c}as}}{T_{lidský}} \times 100$$

*Kde $T_{lidský}$ je čas člověka v minutách, $T_{AI}$ je čas odezvy AI v sekundách, $M_{hodinová}$ je hodinový náklad firmy na operátora.*

#### B. Agregované měsíční a roční úspory (`calculateExtendedSavings`)
Pro nastavený denní objem e-mailů ($V$):
$$\text{Denní časová úspora (hod)} = \frac{U_{\check{c}as}}{60} \times V$$
$$\text{Denní finanční úspora (Kč)} = \text{Denní časová úspora} \times M_{hodinová}$$
$$\text{Měsíční časová úspora} = \text{Denní časová úspora} \times 21 \text{ dní}$$
$$\text{Měsíční finanční úspora} = \text{Denní finanční úspora} \times 21 \text{ dní}$$
$$\text{Roční časová úspora (dny)} = \frac{\text{Měsíční časová úspora} \times 12}{8 \text{ hod}}$$
$$\text{Roční finanční úspora} = \text{Měsíční finanční úspora} \times 12$$

---

## 4. API Koncové body (Backend Integration)

Server běžící na portu `3000` implementuje proxy endpointy pro ochranu tajných klíčů a eliminaci CORS restrikcí při přímém dotazování LLM služeb z prohlížeče.

### 1. `GET /api/models`
Načte seznam dostupných jazykových modelů z připojeného serveru (např. Ollama).
- **Požadavek:** Bez těla. V hlavičkách může být přiložen `Authorization: Bearer <OLLAMA_API_KEY>`.
- **Odpověď (JSON):**
  ```json
  {
    "models": [
      { "name": "llama3.1:latest", "details": { "parameter_size": "8B" } }
    ]
  }
  ```

### 2. `POST /api/analyze`
Hlavní integrační bod provádějící orchestraci a transformaci nestrukturovaného textu na validní strukturovaný JSON dokument.
- **Tělo požadavku:**
  ```json
  {
    "model": "llama3.1",
    "input": {
      "sender": "Jan Novák <novak@firma.cz>",
      "subject": "Reklamace objednávky 123",
      "body": "Dobrý den, zboží dorazilo poškozené, žádám o vrácení peněz."
    }
  }
  ```

- **Struktura vnitřního systémového promptu:**
  Model je instruován k striktnímu formátování výstupu do JSON schéma, které omezuje halucinace a zajišťuje typovou bezpečnost na frontendu. Využívá se `response_format: { type: "json_object" }` (OpenAI kompatibilní API).
  ```json
  {
    "action": "DRAFT" | "ACKNOWLEDGE" | "ESCALATE",
    "actionLabel": "Návrh pro operátora" | "Potvrzení" | "Eskalace",
    "category": "Reklamace" | "Dotaz" | "Smlouva",
    "customerStatus": "Ověřený zákazník",
    "recipient": "Fakturační / Technická podpora",
    "outputTitle": "Návrh odpovědi",
    "output": "Vážený pane Nováku...",
    "reasons": ["Text obsahuje klíčové slovo poškození", "Vyžadována lidská kontrola financí"],
    "humanMinutes": 4.5,
    "aiSeconds": 1.2,
    "confidence": 94
  }
  ```

---

## 5. Deployment a Sestavení (CI/CD)

Projekt je připraven pro bezproblémové nasazení na moderní kontejnerové platformy (např. Google Cloud Run).

### Produkční sestavení (Build Pipeline)
Spuštěním `npm run build` dojde k:
1. Sestavení frontendových statických souborů do adresáře `/dist` pomocí nástroje `vite`.
2. Bundlování backendového serveru `server.ts` pomocí `esbuild` do formátu CommonJS (`dist/server.cjs`). Tento krok eliminuje složité runtime vyhledávání ESM modulů v Node.js a vytvoří rychlý, samostatný soubor optimalizovaný pro minimalizaci startovacího času kontejneru (Cold Start).

### Spuštění v produkci
Aplikace se v produkčním prostředí spouští pomocí:
```bash
npm run start
```
Server automaticky detekuje `NODE_ENV === "production"`, zakáže Vite middleware a začne servírovat předkompilované statické assets z `/dist`.

### Proměnné prostředí (Environment Variables)
Chování backendu a napojení na modely lze konfigurovat v souboru `.env` (vzor k dispozici v `.env.example`):
- `OLLAMA_API_KEY`: Nepovinný autorizační token pro přístup k vybraným LLM modelům.
- `PORT`: Server je pevně konfigurován tak, aby naslouchal na portu `3000` na rozhraní `0.0.0.0` (vyžadováno reverzním proxy serverem platformy).

---

## 6. Doporučení pro další rozvoj

1. **Integrace s reálným CRM:** V komponentě `ResultView.tsx` lze snadno napojit tlačítko "Odeslat" na koncové body Salesforce, HubSpotu či interního firemního ticketingového systému.
2. **Rozšíření Security Guardrails:** Do systémového promptu v `server.ts` lze přidat validaci na únik citlivých osobních údajů (GDPR filter) předtím, než jsou data odeslána do externích LLM služeb.
3. **A/B Testování modelů:** Endpoint `/api/analyze` podporuje dynamické přepínání modelů. Je možné implementovat logování úspěšnosti jednotlivých modelů na základě zpětné vazby operátorů (palec nahoru/dolů).
