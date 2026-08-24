import Groq from "groq-sdk";
import OpenAI from "openai";
import { ParsedCommand } from "@/types";

// ─── LLM System Prompt ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a multilingual grocery shopping assistant. Parse the user's voice command and return ONLY valid JSON matching this exact schema — no markdown, no explanation, just raw JSON.

Schema:
{
  "action": "ADD" | "REMOVE" | "SEARCH" | "CLEAR" | "RECOMMEND",
  "items": [
    {
      "name": "string (product name, title-cased, in English)",
      "quantity": number (default 1 if unspecified),
      "unit": "string | null (e.g. kg, lbs, cartons, bottles, cans, loaves, packs, liters — null if unspecified)",
      "category": "Produce" | "Dairy" | "Bakery" | "Meat" | "Pantry" | "Beverages" | "Household" | "Other",
      "brand": "string | null",
      "max_price": number | null
    }
  ],
  "raw_transcript": "string (the original user input verbatim)",
  "language": "string (ISO 639-1 language code detected, e.g. en, es, hi, fr)"
}

Rules:
- action CLEAR has empty items array
- action RECOMMEND has empty items array (user wants suggestions)
- For SEARCH, include item constraints (name, max_price) in items
- Translate all item names to English in the name field
- Infer category from context (milk → Dairy, bread → Bakery, etc.)
- Infer quantity from number words (one → 1, a → 1, couple → 2, dozen → 12, half → 0.5)
- If multiple items mentioned, return all in the items array
- For weight/volume measurements (e.g. 250 grams, 1 kg, 500 ml), append the measurement to the item name (e.g., "Paneer 250g") and set the quantity to 1, unless multiple packets are explicitly asked for (e.g. "two 250g packs").
- If input is completely unparseable, return: {"action":"ADD","items":[],"raw_transcript":"...","language":"en"}

Examples:
Input: "Add 2 cartons of almond milk and some sourdough bread"
Output: {"action":"ADD","items":[{"name":"Almond Milk","quantity":2,"unit":"cartons","category":"Dairy","brand":null,"max_price":null},{"name":"Sourdough Bread","quantity":1,"unit":null,"category":"Bakery","brand":null,"max_price":null}],"raw_transcript":"Add 2 cartons of almond milk and some sourdough bread","language":"en"}

Input: "Add 250 grams of paneer"
Output: {"action":"ADD","items":[{"name":"Paneer 250g","quantity":1,"unit":"pack","category":"Dairy","brand":null,"max_price":null}],"raw_transcript":"Add 250 grams of paneer","language":"en"}

Input: "Agrega dos litros de leche a la lista"
Output: {"action":"ADD","items":[{"name":"Milk","quantity":2,"unit":"liters","category":"Dairy","brand":null,"max_price":null}],"raw_transcript":"Agrega dos litros de leche a la lista","language":"es"}

Input: "Find organic apples under 5 dollars"
Output: {"action":"SEARCH","items":[{"name":"Organic Apples","quantity":1,"unit":null,"category":"Produce","brand":null,"max_price":5}],"raw_transcript":"Find organic apples under 5 dollars","language":"en"}

Input: "Remove the bottle of water"
Output: {"action":"REMOVE","items":[{"name":"Water","quantity":1,"unit":"bottle","category":"Beverages","brand":null,"max_price":null}],"raw_transcript":"Remove the bottle of water","language":"en"}

Input: "Clear my list"
Output: {"action":"CLEAR","items":[],"raw_transcript":"Clear my list","language":"en"}`;

// ─── Groq Client ───────────────────────────────────────────────────────────────

let groqClient: Groq | null = null;
let openaiClient: OpenAI | null = null;

function getGroqClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

// ─── Retry with Exponential Backoff ──────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 500
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
    }
  }
  throw new Error("Max retries exceeded");
}

// ─── Main Parse Function ──────────────────────────────────────────────────────

export async function parseVoiceCommand(
  transcript: string
): Promise<ParsedCommand> {
  const groq = getGroqClient();
  const openai = getOpenAIClient();

  if (!groq && !openai) {
    throw new Error(
      "No LLM API key configured. Set GROQ_API_KEY or OPENAI_API_KEY in .env.local"
    );
  }

  const userMessage = `Parse this voice command: "${transcript}"`;

  // Try Groq first (faster)
  if (groq) {
    try {
      return await withRetry(async () => {
        const completion = await groq.chat.completions.create({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          temperature: 0.1,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("Empty response from Groq");
        return JSON.parse(content) as ParsedCommand;
      });
    } catch (groqError) {
      console.warn("Groq failed, falling back to OpenAI:", groqError);
      // Fall through to OpenAI
    }
  }

  // OpenAI fallback
  if (openai) {
    return await withRetry(async () => {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from OpenAI");
      return JSON.parse(content) as ParsedCommand;
    });
  }

  throw new Error("All LLM providers failed");
}
