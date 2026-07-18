import type { VercelRequest, VercelResponse } from "@vercel/node";

const OLLAMA_API_URL = "https://ollama.com/api/v1/chat/completions";
const OLLAMA_FALLBACK_URL = "https://ollama.com/api/generate";

const SYSTEM_PROMPT = `Jsi Karel Robot, AI e-mailový administrátor.
Tvým úkolem je analyzovat příchozí e-mail od zákazníka a rozhodnout o dalším kroku.

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

## POŽADAVKY NA ČEŠTINU
- **output** musí být přirozená čeština, jako by ji psal rodilý mluvčí
- Žádné strojové fráze, žádné "Děkujeme za Váš e-mail" v každé odpovědi
- Přizpůsob tón podle situace: formální pro reklamace, vstřícný pro dotazy, stručný pro technické problémy
- outputTitle: krátký, výstižný název (max 60 znaků)
- actionLabel: jedna věta co se stane (např. "Připravit návrh odpovědi")
- category: kategorie e-mailu (např. "Reklamace / Technický problém")
- customerStatus: status zákazníka (např. "Registrovaný zákazník", "Neznámý odesílatel")
- recipient: komu předat (např. "Zákaznická podpora", "Technické oddělení")
- reasons: 2–4 důvody proč jsi se tak rozhodl (každý max 100 znaků)

## DVOJITÁ KONTROLA (self-review)
Než odešleš finální JSON, proveď tyto kroky:
1. Zkontroluj, jestli akce odpovídá pravidlům nahoře
2. Zkontroluj, jestli čísla jsou v mantinelech
3. Zkontroluj, jestli čeština v output zní přirozeně (ne strojově)
4. Pokud něco nesedí, oprav to

## VÝSTUPNÍ FORMÁT
Odpověz POUZE validním JSONem podle tohoto schématu:
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const model = req.body?.model || "deepseek-v4-flash";
    const { input } = req.body;
    const apiKey = process.env.OLLAMA_API_KEY;

    if (!input?.subject || !input?.body) {
      return res.status(400).json({ error: "Missing required fields: subject, body" });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const userPrompt = `Email sender: ${input.sender || "unknown"}\nSubject: ${input.subject}\nBody: ${input.body}`;

    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: model || "llama3.1",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        const fallbackResponse = await fetch(OLLAMA_FALLBACK_URL, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: model || "llama3.1",
            prompt: SYSTEM_PROMPT + "\n\n" + userPrompt,
            stream: false,
            format: "json",
          }),
        });
        if (!fallbackResponse.ok) {
          throw new Error(
            `Ollama fallback API returned ${fallbackResponse.status}: ${await fallbackResponse.text()}`
          );
        }
        const data = await fallbackResponse.json();
        return res.json(JSON.parse(data.response));
      }
      throw new Error(`Ollama API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;
    if (!resultText) {
      throw new Error("Empty response from Ollama API");
    }

    // Parse first pass
    const firstPass = JSON.parse(resultText);

    // Double-check: self-review and improve
    const reviewPrompt = `Zkontroluj a vylepši tento výstup analýzy e-mailu.

Původní e-mail:
Odesílatel: ${input.sender || "neznámý"}
Předmět: ${input.subject}
Tělo: ${input.body}

Aktuální výstup:
${JSON.stringify(firstPass, null, 2)}

Pravidla pro kontrolu:
1. Je akce správná podle pravidel? (výpověď→ESCALATE, kompenzace→ACKNOWLEDGE, běžný dotaz→DRAFT)
2. Jsou humanMinutes v rozmezí 0-15?
3. Jsou aiSeconds v rozmezí 1-10?
4. Je hourlyCost 0 nebo 400-600?
5. Je confidence 0.00-1.00?
6. Zní čeština v output přirozeně? (ne strojově, jako rodilý mluvčí)
7. Je outputTitle krátký a výstižný? (max 60 znaků)
8. Jsou reasons relevantní a stručné? (2-4 důvody, každý max 100 znaků)

Pokud něco nesedí, oprav to. Pokud vše sedí, vrať stejný JSON.
Odpověz POUZE validním JSONem.`;

    const reviewResponse = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: model || "deepseek-v4-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Jsi kvalitní kontrolor výstupů AI. Kontroluješ a vylepšuješ analýzy e-mailů. Odpovídáš POUZE validním JSONem." },
          { role: "user", content: reviewPrompt },
        ],
        stream: false,
      }),
    });

    if (reviewResponse.ok) {
      const reviewData = await reviewResponse.json();
      const reviewText = reviewData.choices?.[0]?.message?.content;
      if (reviewText) {
        try {
          const improved = JSON.parse(reviewText);
          res.json(improved);
          return;
        } catch {
          // If review JSON is invalid, fall through to first pass
        }
      }
    }

    // Fallback: return first pass if review failed
    res.json(firstPass);
  } catch (error) {
    console.error("Error running analysis:", error);
    res.status(500).json({ error: "Failed to run analysis" });
  }
}
