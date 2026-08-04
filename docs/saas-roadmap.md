# 🚀 Karel Robot: SaaS Transformation Roadmap

## 🎯 Vision
Transform Karel from a "Cinematic AI Demo" into a professional "Enterprise Productivity SaaS". 
The goal is to move from **simulated savings** to **documented real-time value**.

> **Stack note (verified 2026-08-05):** Karel is a **Vite + React 19 SPA** with Vercel
> serverless functions in `api/`. **Not** Next.js. Any auth/DB layer must be
> client-side SPA friendly (Supabase Auth + Supabase JS client) — no Next.js
> Server Actions.

---

## 🛠️ Technical Architecture (Proposed)

### 1. Stack
- **Frontend:** Vite + React 19 + Tailwind 4 + Framer Motion (Preserve the "Apple" aesthetic)
- **Auth:** **Supabase Auth** (open-source, free, integrated with our DB — no second service)
- **Database:** **Supabase** (PostgreSQL) - profiles, settings, analysis history.
- **Backend Logic:** Vercel serverless functions (`api/`) + Supabase RLS policies.
- **LLM Layer:** Transition to Enterprise-grade endpoints (Azure OpenAI / AWS Bedrock) for GDPR.
- **Billing (M3):** Stripe (Subscription + usage-based credits).

### 2. Data Model (Initial Schema)

```sql
-- Uživatelský profil + firemní nastavení
create table profiles (
  id uuid primary key references auth.users(id),
  email text unique not null,
  company_name text,
  hourly_rate numeric default 420,
  avg_daily_volume int default 80,
  automation_rate numeric default 0.7,
  plan text default 'free',               -- 'free' | 'pro'
  created_at timestamptz default now()
);

-- Historie analýz (zdroj reálných úspor — „zlatý důl“)
create table analysis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  email_subject text,
  human_minutes numeric not null,
  ai_seconds numeric not null,
  saved_minutes numeric not null,
  confidence numeric,
  created_at timestamptz default now()
);

-- RLS: uživatel vidí jen své řádky
-- (vygenerováno v Supabase SQL editoru)
```

---

## 🗺️ Execution Phases

### Phase 1: The Foundation (Auth & State)
- [x] Branch `feat/karel-saas` created + `docs/saas-roadmap.md`
- [ ] **M1a: Supabase setup** (project, schema, RLS)
- [ ] **M1b: Supabase client + Auth** (login/logout, user context)
- [ ] **M1c: Settings persistence** (profiles table read/write)
- [ ] **M1d: Analysis history** (write `analysis_history` on every run)

### Phase 2: The Value Engine (Real Savings)
- [ ] Rewrite `CompanySavingsDashboard` to fetch from `analysis_history`.
- [ ] Implement "Real vs Simulated" toggle.
- [ ] Bulk Upload feature (CSV/JSON for mass analysis).
- [ ] Basic RAG implementation (uploading company context).

### Phase 3: The Business Layer (Billing)
- [ ] Stripe Integration (Webhooks + Customer Portal).
- [ ] Pricing Tiers: Free (5/day), Pro (Unlimited), Enterprise.
- [ ] Monthly ROI Report generator (PDF).

### Phase 4: The Ecosystem (Integrations)
- [ ] Outlook/Gmail Plugin (In-situ analysis).
- [ ] Auto-drafting responses directly into the mail client.

---

## 📋 MILESTONE 1 — Technical Specification (Auth + State)

### Objective
Let a user create an account, log in, persist their company settings, and record
a history of analyses. No regressions to the current demo UX on `main`.

### Stack decisions (recommended)
| Concern | Choice | Why |
|---|---|---|
| Auth | **Supabase Auth** | Free tier, open-source, one service with DB, SPA-friendly JS client, Google/Email login |
| DB | **Supabase** (PostgreSQL) | Serverless, RLS built-in, realtime optional |
| Client | `@supabase/supabase-js` | Official, typed, works with Vite SPA |
| Env | `.env` + `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Client-side safe (anon key), RLS enforces security |

### Files to create/modify

```
.env                       [NEW]  VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
src/lib/supabase.ts        [NEW]  createClient + typed helpers
src/context/AuthContext.tsx [NEW]  AuthProvider, useAuth() hook
src/lib/history.ts         [NEW]  recordAnalysis(userId, result) → analysis_history
src/App.tsx                [MOD]  wrap in AuthProvider; gate on auth state
src/components/AuthScreen.tsx [NEW] login/register (email + magic link / Google)
```

### Steps

#### M1a — Supabase project & schema
1. Create Supabase project (supabase.com, free tier).
2. Run the SQL above in the SQL editor (tables + RLS policies).
3. Grab `URL` + `anon key` → put into `.env` (add `.env` to `.gitignore`).

#### M1b — Client + Auth
1. `pnpm add @supabase/supabase-js`.
2. Create `src/lib/supabase.ts`:
   ```ts
   import { createClient } from '@supabase/supabase-js';
   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL!,
     import.meta.env.VITE_SUPABASE_ANON_KEY!
   );
   ```
3. `AuthContext.tsx` — `onAuthStateChange`, expose `user`, `loading`, `signIn`, `signOut`.
4. `AuthScreen.tsx` — Apple-minimal login (Google button + email magic link).
5. Gate `App.tsx`: show `AuthScreen` when not logged in; main app when logged in.

#### M1c — Settings persistence
1. On first login, upsert a `profiles` row (email, defaults).
2. Replace the hardcoded `hourlyCost=400` / `avg_daily_volume=80` / `automationRate`
   in the dashboard with values from `profiles` (fallback to defaults when absent).
3. When user edits settings → `profiles.update(...)`.

#### M1d — Analysis history
1. In `App.tsx`, after a successful analysis, call `recordAnalysis(...)`
   with `humanMinutes`, `aiSeconds`, `savedMinutes` (computed), `confidence`.
2. (Phase 2 will read this back to show real cumulative savings.)

### Acceptance criteria (M1)
- [ ] User can sign up / log in (Google or email magic link).
- [ ] Settings persist across sessions (reload → still there).
- [ ] Every analysis is recorded in `analysis_history` for the logged-in user.
- [ ] RLS blocks reading another user's rows.
- [ ] Demo UX / animations unchanged on `main`.

### Risks
| Risk | Mitigation |
|---|---|
| Anon key exposed client-side | It's safe by design — RLS is the real gate; never put `service_role` key in client |
| Supabase free tier limits | 500 MB DB, 50k MAU — plenty for MVP |
| Auth complexity vs value | Supabase Auth is one config, one lib — acceptable for the "hook" |

---

## ⚠️ Critical Constraints
- **Zero Regressions:** No changes to the current production UX on `main`.
- **GDPR First:** Data isolation and explicit consent for AI processing.
- **Vibe Preservation:** All new features must match the "Cinematic / Minimal" style.
