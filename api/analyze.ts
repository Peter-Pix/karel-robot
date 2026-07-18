import type { VercelRequest, VercelResponse } from "@vercel/node";

const OLLAMA_API_URL = "https://ollama.com/api/v1/chat/completions";
const OLLAMA_FALLBACK_URL = "https://ollama.com/api/generate";
const OLLAMA_TIMEOUT_MS = 25000;
const DOUBLE_CHECK_THRESHOLD = 0.80;

const SYSTEM_PROMPT = `Jsi Karel Robot, AI e-mailový administrátor.
Tvým úkolem je analyzovat příchozí e-mail od zákazníka a rozhodnout o dalším kroku.

## KARELŮV HLAS
- Mluv přirozeně, jako zkušený operátor zákaznické podpory
- U běžných dotazů: stručný, vstřícný, občas s lehkým humorem
- U reklamací a problémů: vážný, empatický, profesionální
- Nikdy nepoužívej "Děkujeme za Váš e-mail" — to je strojové
- Místo toho: "Ahoj, mám to tu." nebo "Díky za zprávu, podívám se na to."
- Přizpůsob tón situaci, ne používej šablonu

## PRAVIDLA PRO ROZHODOVÁNÍ
- **Výpověď smlouvy, právní jazyk, hrozba soudem** → akce "ESCALATE"
- **Žádost o kompenzaci, slevu, vrácení peněz** → akce "ACKNOWLEDGE" (nelze schválit automaticky)
- **Neznámý odesílatel** → akce "DRAFT" (nelze poskytnout informace o účtu)
- **Běžný administrativní požadavek** (změna adresy, dotaz na službu) → akce "DRAFT"
- **Citlivé údaje, osobní data, platební informace** → akce "ESCALATE"
- **Technický problém, výpadek, hlášení chyby** → akce "ACKNOWLEDGE"

## MANTINELY PRO ČÍSLA
- **humanMinutes**: 0–15 (reálný odhad, kolik minut by operátor strávil)
- **aiSeconds**: 1–10 (jak dlouho trvala AI analýza)
- **hourlyCost**: 0 nebo 400–600 (0 pro automatické, 400–600 pro eskalaci)
- **confidence**: 0.00–1.00 (jak jsi si jistý svým rozhodnutím)

## POŽADAVKY NA VÝSTUP
- output: přirozená čeština, jako rodilý mluvčí, přizpůsobená situaci
- outputTitle: krátký, výstižný název (max 60 znaků)
- actionLabel: jedna věta co se stane
- category: kategorie e-mailu
- customerStatus: status zákazníka
- recipient: komu předat
- reasons: 2–4 důvody (každý max 100 znaků)

## DVOJITÁ KONTROLA (self-review)
Než odešleš finální JSON:
1. Zkontroluj akci podle pravidel
2. Zkontroluj čísla v mantinelech
3. Zkontroluj jestli čeština zní přirozeně
4. Pokud něco nesedí, oprav to

## VÝSTUPNÍ FORMÁT
Odpověz POUZE validním JSONem:
{
  "action": "DRAFT" | "ACKNOWLEDGE" | "ESCALATE",
  "actionLabel": string,
  "category": string,
  "customerStatus": string,
  "recipient": string,
  "outputTitle": string,
  "output": string,
  "reasons": string[],
  "humanMinutes": number,
  "aiSeconds": number,
  "hourlyCost": number,
  "confidence": number
}`;

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function log(level: string, msg: string, meta: Record<string, unknown> = {}) {
  const entry = { timestamp: new Date().toISOString(), level, msg, ...meta };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

function setCorsHeaders(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    log("warn", "Method not allowed", { requestId, method: req.method });
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const model = req.body?.model || "deepseek-v4-flash";
    const { input } = req.body;
    const apiKey = process.env.OLLAMA_API_KEY;

    if (!input?.subject || !input?.body) {
      log("warn", "Missing required fields", { requestId, hasSubject: !!input?.subject, hasBody: !!input?.body });
      return res.status(400).json({ error: "Missing required fields: subject, body" });
    }

    const ollamaHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      ollamaHeaders["Authorization"] = `Bearer ${apiKey}`;
    }

    const userPrompt = `Email sender: ${input.sender || "unknown"}\nSubject: ${input.subject}\nBody: ${input.body}`;

    log("info", "Calling Ollama API", { requestId, model, inputLength: input.body.length });

    const response = await fetchWithTimeout(
      OLLAMA_API_URL,
      {
        method: "POST",
        headers: ollamaHeaders,
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          stream: false,
        }),
      },
      OLLAMA_TIMEOUT_MS
    );

    if (!response.ok) {
      if (response.status === 404) {
        log("warn", "Model not found, trying fallback", { requestId, model });
        const fallbackResponse = await fetchWithTimeout(
          OLLAMA_FALLBACK_URL,
          {
            method: "POST",
            headers: ollamaHeaders,
            body: JSON.stringify({
              model,
              prompt: SYSTEM_PROMPT + "\n\n" + userPrompt,
              stream: false,
              format: "json",
            }),
          },
          OLLAMA_TIMEOUT_MS
        );
        if (!fallbackResponse.ok) {
          const errText = await fallbackResponse.text();
          log("error", "Fallback API failed", { requestId, status: fallbackResponse.status, error: errText });
          return res.status(503).json({ error: "Služba je dočasně nedostupná. Zkuste to prosím později." });
        }
        const data = await fallbackResponse.json();
        const result = JSON.parse(data.response);
        const latency = Date.now() - startTime;
        log("info", "Analysis complete (fallback)", { requestId, model, latencyMs: latency, action: result.action, confidence: result.confidence });
        return res.json(result);
      }
      const errText = await response.text();
      log("error", "Ollama API error", { requestId, status: response.status, error: errText });
      return res.status(503).json({ error: "Služba je dočasně nedostupná. Zkuste to prosím později." });
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;
    if (!resultText) {
      log("error", "Empty response from Ollama", { requestId });
      return res.status(503).json({ error: "Služba vrátila prázdnou odpověď. Zkuste to prosím znovu." });
    }

    // Parse first pass
    const firstPass = JSON.parse(resultText);

    // Double-check: only if confidence is below threshold
    let finalResult = firstPass;
    if (firstPass.confidence < DOUBLE_CHECK_THRESHOLD) {
      log("info", "Low confidence, running double-check", { requestId, confidence: firstPass.confidence });

      const reviewPrompt = `Zkontroluj a vylepši tento výstup analýzy e-mailu.

Původní e-mail:
Odesílatel: ${input.sender || "neznámý"}
Předmět: ${input.subject}
Tělo: ${input.body}

Aktuální výstup:
${JSON.stringify(firstPass, null, 2)}

Pravidla pro kontrolu:
1. Je akce správná podle pravidel?
2. Jsou humanMinutes v rozmezí 0-15?
3. Jsou aiSeconds v rozmezí 1-10?
4. Je hourlyCost 0 nebo 400-600?
5. Je confidence 0.00-1.00?
6. Zní čeština přirozeně?
7. Je outputTitle max 60 znaků?
8. Jsou reasons 2-4, každý max 100 znaků?

Pokud něco nesedí, oprav to. Odpověz POUZE validním JSONem.`;

      try {
        const reviewResponse = await fetchWithTimeout(
          OLLAMA_API_URL,
          {
            method: "POST",
            headers: ollamaHeaders,
            body: JSON.stringify({
              model,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: "Jsi kvalitní kontrolor výstupů AI. Odpovídáš POUZE validním JSONem." },
                { role: "user", content: reviewPrompt },
              ],
              stream: false,
            }),
          },
          OLLAMA_TIMEOUT_MS
        );

        if (reviewResponse.ok) {
          const reviewData = await reviewResponse.json();
          const reviewText = reviewData.choices?.[0]?.message?.content;
          if (reviewText) {
            try {
              finalResult = JSON.parse(reviewText);
              log("info", "Double-check improved result", { requestId, oldConfidence: firstPass.confidence, newConfidence: finalResult.confidence });
            } catch {
              log("warn", "Double-check returned invalid JSON, using first pass", { requestId });
            }
          }
        }
      } catch {
        log("warn", "Double-check timed out, using first pass", { requestId });
      }
    } else {
      log("info", "High confidence, skipping double-check", { requestId, confidence: firstPass.confidence });
    }

    const latency = Date.now() - startTime;
    log("info", "Analysis complete", { requestId, model, latencyMs: latency, action: finalResult.action, confidence: finalResult.confidence });

    res.json(finalResult);
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    log("error", "Unhandled error", { requestId, latencyMs: latency, error: errorMsg });

    if (error instanceof DOMException && error.name === "AbortError") {
      return res.status(503).json({ error: "Analýza trvala příliš dlouho. Zkuste to prosím znovu s kratším e-mailem." });
    }

    res.status(503).json({ error: "Služba je dočasně nedostupná. Zkuste to prosím později." });
  }
}
