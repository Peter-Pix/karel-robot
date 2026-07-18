import type { VercelRequest, VercelResponse } from "@vercel/node";

const OLLAMA_API_URL = "https://ollama.com/api/v1/chat/completions";
const OLLAMA_FALLBACK_URL = "https://ollama.com/api/generate";

const SYSTEM_PROMPT = `You are Karel Robot, an AI email administrator.
Your task is to analyze an incoming customer email and decide on the next step.
You MUST output ONLY valid JSON matching this schema:
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
}

Rules:
- contract termination or legal language results in action "ESCALATE"
- compensation request cannot be automatically approved
- unknown customer cannot receive account-specific information
- normal administrative requests produce "DRAFT"
- sensitive requests remain under human control (ESCALATE)
- The generated output should be professional Czech language.`;

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
    res.json(JSON.parse(resultText));
  } catch (error) {
    console.error("Error running analysis:", error);
    res.status(500).json({ error: "Failed to run analysis" });
  }
}
