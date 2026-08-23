// ─────────────────────────────────────────────────────────────
// Shared TypeScript types for Voice Command Shopping Assistant
// ─────────────────────────────────────────────────────────────

export type CommandAction = "ADD" | "REMOVE" | "SEARCH" | "CLEAR" | "RECOMMEND";

export type ItemCategory =
  | "Produce"
  | "Dairy"
  | "Bakery"
  | "Meat"
  | "Pantry"
  | "Beverages"
  | "Household"
  | "Other";

export interface ParsedItem {
  name: string;
  quantity: number;
  unit: string | null;
  category: ItemCategory;
  brand: string | null;
  max_price: number | null;
}

export interface ParsedCommand {
  action: CommandAction;
  items: ParsedItem[];
  raw_transcript: string;
  language: string;
}

// ─── Shopping List UI Types ────────────────────────────────────

export interface ShoppingItemUI {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  category: ItemCategory;
  brand: string | null;
  maxPrice: number | null;
  estimatedPrice: number | null;
  checked: boolean;
  listId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingListUI {
  id: string;
  name: string;
  items: ShoppingItemUI[];
  createdAt: Date;
}

// ─── Suggestions ──────────────────────────────────────────────

export type SuggestionType = "frequent" | "seasonal" | "substitute";

export interface SuggestionItem {
  id: string;
  name: string;
  category: ItemCategory;
  type: SuggestionType;
  reason: string;
  estimatedPrice: number | null;
  substituteFor: string | null;
  season: string | null;
  tags: string[];
}

// ─── Search ───────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  name: string;
  category: ItemCategory;
  estimatedPrice: number | null;
  tags: string[];
  inStock: boolean;
}

export interface SearchQuery {
  query: string;
  category?: ItemCategory;
  maxPrice?: number;
}

// ─── Voice Recognition ────────────────────────────────────────

export type VoiceState = "idle" | "listening" | "parsing" | "error";

export interface VoiceError {
  code:
    | "NOT_SUPPORTED"
    | "PERMISSION_DENIED"
    | "NETWORK"
    | "NO_SPEECH"
    | "ABORTED"
    | "AUDIO_CAPTURE"
    | "SERVICE_NOT_ALLOWED"
    | "PARSE_ERROR"
    | "UNKNOWN";
  message: string;
}

// ─── Toast ────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// ─── API Responses ────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// ─── Category Meta ────────────────────────────────────────────

export const CATEGORY_META: Record<
  ItemCategory,
  { emoji: string; color: string; bgColor: string }
> = {
  Produce: { emoji: "🥦", color: "text-green-700", bgColor: "bg-green-50" },
  Dairy: { emoji: "🧀", color: "text-yellow-700", bgColor: "bg-yellow-50" },
  Bakery: { emoji: "🍞", color: "text-amber-700", bgColor: "bg-amber-50" },
  Meat: { emoji: "🥩", color: "text-red-700", bgColor: "bg-red-50" },
  Pantry: { emoji: "🥫", color: "text-orange-700", bgColor: "bg-orange-50" },
  Beverages: { emoji: "🧃", color: "text-blue-700", bgColor: "bg-blue-50" },
  Household: { emoji: "🧹", color: "text-purple-700", bgColor: "bg-purple-50" },
  Other: { emoji: "📦", color: "text-gray-700", bgColor: "bg-gray-50" },
};
