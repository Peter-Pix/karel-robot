import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKeySet = !!process.env.OLLAMA_API_KEY;

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    ollama: apiKeySet ? "configured" : "missing_key",
    model: "deepseek-v4-flash",
  });
}
