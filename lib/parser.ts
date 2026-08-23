import { z } from "zod";
import { ParsedCommand, ItemCategory } from "@/types";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const VALID_ACTIONS = ["ADD", "REMOVE", "SEARCH", "CLEAR", "RECOMMEND"] as const;
const VALID_CATEGORIES = [
  "Produce", "Dairy", "Bakery", "Meat", "Pantry", "Beverages", "Household", "Other",
] as const;

const ParsedItemSchema = z.object({
  name: z.string().min(1).transform((s) => s.trim()),
  quantity: z.number().positive().default(1),
  unit: z.string().nullable().default(null),
  category: z.enum(VALID_CATEGORIES).default("Other"),
  brand: z.string().nullable().default(null),
  max_price: z.number().nullable().default(null),
});

const ParsedCommandSchema = z.object({
  action: z.enum(VALID_ACTIONS),
  items: z.array(ParsedItemSchema).default([]),
  raw_transcript: z.string().default(""),
  language: z.string().default("en"),
});

// ─── Validation & Sanitization ───────────────────────────────────────────────

export function validateParsedCommand(raw: unknown): ParsedCommand {
  try {
    const result = ParsedCommandSchema.parse(raw);
    return result as ParsedCommand;
  } catch (err) {
    console.error("Command validation failed:", err);
    // Return safe fallback
    return {
      action: "ADD",
      items: [],
      raw_transcript: typeof raw === "object" && raw !== null && "raw_transcript" in raw
        ? String((raw as Record<string, unknown>).raw_transcript)
        : "Unknown command",
      language: "en",
    };
  }
}

// ─── Category Inference (fallback if LLM misses) ─────────────────────────────

const CATEGORY_KEYWORDS: Record<ItemCategory, string[]> = {
  Produce: [
    "apple", "banana", "orange", "grape", "strawberry", "blueberry", "mango",
    "pineapple", "watermelon", "lemon", "lime", "peach", "pear", "cherry",
    "lettuce", "spinach", "kale", "broccoli", "carrot", "tomato", "cucumber",
    "pepper", "onion", "garlic", "potato", "corn", "zucchini", "celery",
    "mushroom", "avocado", "asparagus", "cabbage", "cauliflower",
  ],
  Dairy: [
    "milk", "cheese", "yogurt", "butter", "cream", "egg", "eggs",
    "sour cream", "cottage cheese", "whipped cream", "half and half",
    "almond milk", "oat milk", "soy milk", "coconut milk",
  ],
  Bakery: [
    "bread", "bagel", "muffin", "croissant", "tortilla", "wrap", "pita",
    "sourdough", "baguette", "roll", "bun", "cake", "cookie", "pie",
  ],
  Meat: [
    "chicken", "beef", "pork", "turkey", "lamb", "salmon", "tuna", "shrimp",
    "fish", "steak", "ground beef", "sausage", "bacon", "ham", "tofu",
    "tempeh", "prosciutto",
  ],
  Pantry: [
    "rice", "pasta", "noodle", "flour", "sugar", "salt", "pepper", "oil",
    "vinegar", "sauce", "ketchup", "mustard", "mayo", "syrup", "honey",
    "coffee", "tea", "cereal", "oats", "granola", "almond", "walnut",
    "peanut butter", "almond butter", "jam", "jelly", "canned", "soup",
    "broth", "chips", "crackers", "chocolate", "candy",
  ],
  Beverages: [
    "water", "juice", "soda", "beer", "wine", "kombucha", "energy drink",
    "sports drink", "sparkling water", "lemonade", "tea", "coffee drink",
  ],
  Household: [
    "soap", "detergent", "shampoo", "conditioner", "toothpaste", "toilet paper",
    "paper towel", "trash bag", "sponge", "cleaner", "bleach", "disinfectant",
    "batteries", "lightbulb", "foil", "plastic wrap", "ziplock",
  ],
  Other: [],
};

export function inferCategory(itemName: string): ItemCategory {
  const lower = itemName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category as ItemCategory;
    }
  }
  return "Other";
}

// ─── Deduplication helper ─────────────────────────────────────────────────────

export function normalizeItemName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}
