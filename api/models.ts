import type { VercelRequest, VercelResponse } from "@vercel/node";

// Curated allowlist of cost-effective models. Filters out expensive/huge
// models (e.g. mistral-large-3:675b, qwen3.5:397b, gpt-oss:120b) that are
// slow and overkill for e-mail triage. Keeps fast, good-value options.
const ALLOWED_MODELS = [
  "deepseek-v4-flash",
  "nemotron-3-nano:30b",
  "gemma4:31b",
  "minimax-m3",
  "minimax-m2.7",
  "glm-5.1",
  "glm-5.2",
  "kimi-k2.6",
  "kimi-k2.7-code",
  "gpt-oss:20b",
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.OLLAMA_API_KEY;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch("https://ollama.com/api/tags", { headers });

    if (!response.ok) {
      throw new Error(
        `Ollama API returned ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    // Filter to the curated allowlist only
    const models = (data.models || []).filter((m: { name: string }) =>
      ALLOWED_MODELS.includes(m.name)
    );
    res.json({ ...data, models });
  } catch (error) {
    console.error("Error fetching Ollama models:", error);
    res.status(500).json({ error: "Failed to fetch models" });
  }
}
