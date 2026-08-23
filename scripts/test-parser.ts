/**
 * NLP Parser Unit Tests
 * Run: npm run test:parser
 *
 * Tests the LLM parse-voice endpoint with varied inputs.
 * Requires GROQ_API_KEY or OPENAI_API_KEY in environment.
 */

import { parseVoiceCommand } from "../lib/llm";
import { validateParsedCommand } from "../lib/parser";

// Load .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

interface TestCase {
  label: string;
  input: string;
  expectedAction?: string;
  minItems?: number;
  expectedLanguage?: string;
  expectEmpty?: boolean;
}

const testCases: TestCase[] = [
  {
    label: "Multi-item ADD",
    input: "Add 2 apples, a loaf of sourdough, and 3 cans of soda",
    expectedAction: "ADD",
    minItems: 3,
  },
  {
    label: "Quantity modification (REMOVE)",
    input: "Remove 1 bottle of water",
    expectedAction: "REMOVE",
    minItems: 1,
  },
  {
    label: "Search with price filter",
    input: "Find almond butter under 8 dollars",
    expectedAction: "SEARCH",
    minItems: 1,
  },
  {
    label: "Non-English (Spanish ADD)",
    input: "Agrega dos litros de leche a la lista",
    expectedAction: "ADD",
    minItems: 1,
    expectedLanguage: "es",
  },
  {
    label: "Natural phrasing ADD",
    input: "Can you put 2 cartons of almond milk on my list",
    expectedAction: "ADD",
    minItems: 1,
  },
  {
    label: "Clear list",
    input: "Clear my list",
    expectedAction: "CLEAR",
    expectEmpty: true,
  },
  {
    label: "Recommend/suggest",
    input: "What do you suggest I buy?",
    expectedAction: "RECOMMEND",
    expectEmpty: true,
  },
  {
    label: "Complex multi-item with units and brands",
    input: "Add 500g of Barilla pasta, 2 liters of Tropicana orange juice, and organic spinach",
    expectedAction: "ADD",
    minItems: 3,
  },
  {
    label: "French ADD",
    input: "Ajoute deux bouteilles de lait à ma liste",
    expectedAction: "ADD",
    minItems: 1,
  },
  {
    label: "Gibberish / unparseable",
    input: "xkfjlasjdflasdf lk234jl",
    expectedAction: "ADD",
    expectEmpty: false, // Should gracefully return empty items
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────

async function runTests() {
  console.log("\n🧪 VoiceCart NLP Parser Tests\n" + "─".repeat(50));

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    process.stdout.write(`  ${tc.label}... `);

    try {
      const raw = await parseVoiceCommand(tc.input);
      const result = validateParsedCommand(raw);

      const errors: string[] = [];

      if (tc.expectedAction && result.action !== tc.expectedAction) {
        errors.push(`action: expected "${tc.expectedAction}", got "${result.action}"`);
      }

      if (tc.minItems !== undefined && result.items.length < tc.minItems) {
        errors.push(`items: expected ≥${tc.minItems}, got ${result.items.length}`);
      }

      if (tc.expectEmpty && result.items.length > 0) {
        errors.push(`expected empty items, got ${result.items.length}`);
      }

      if (tc.expectedLanguage && result.language !== tc.expectedLanguage) {
        errors.push(`language: expected "${tc.expectedLanguage}", got "${result.language}"`);
      }

      if (errors.length === 0) {
        console.log("✅ PASS");
        if (result.items.length > 0) {
          result.items.forEach((item) => {
            console.log(
              `     → ${item.quantity}${item.unit ? " " + item.unit : ""} ${item.name} [${item.category}]`
            );
          });
        }
        passed++;
      } else {
        console.log("❌ FAIL");
        errors.forEach((e) => console.log(`     ✗ ${e}`));
        console.log(`     Raw transcript: "${result.raw_transcript}"`);
        failed++;
      }
    } catch (err) {
      console.log("💥 ERROR");
      console.log(`     ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  console.log("\n" + "─".repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 All tests passed!\n");
  }
}

runTests();
