import { create } from "zustand";
import { ShoppingItemUI, Toast, VoiceState, SearchResult, SuggestionItem } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface ShoppingStore {
  // ─── List State ───────────────────────────────────────────────
  items: ShoppingItemUI[];
  listId: string;
  setItems: (items: ShoppingItemUI[]) => void;
  addItem: (item: ShoppingItemUI) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearItems: () => void;

  // ─── Voice State ──────────────────────────────────────────────
  voiceState: VoiceState;
  transcript: string;
  interimTranscript: string;
  setVoiceState: (state: VoiceState) => void;
  setTranscript: (t: string) => void;
  setInterimTranscript: (t: string) => void;

  // ─── Search ───────────────────────────────────────────────────
  searchOpen: boolean;
  searchResults: SearchResult[];
  searchQuery: string;
  setSearchOpen: (open: boolean) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setSearchQuery: (q: string) => void;

  // ─── Suggestions ──────────────────────────────────────────────
  suggestions: SuggestionItem[];
  setSuggestions: (s: SuggestionItem[]) => void;

  // ─── Toasts ───────────────────────────────────────────────────
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useShoppingStore = create<ShoppingStore>((set) => ({
  // ─── List ─────────────────────────────────────────────────────
  items: [],
  listId: "default-list",
  setItems: (items) => set({ items }),
  addItem: (item) =>
    set((state) => {
      // Optimistic deduplication
      const existingIdx = state.items.findIndex(
        (i) =>
          i.name.toLowerCase() === item.name.toLowerCase() && !i.checked
      );
      if (existingIdx >= 0) {
        const updated = [...state.items];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + item.quantity,
        };
        return { items: updated };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  toggleItem: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      ),
    })),
  updateQuantity: (id, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => i.id !== id)
          : state.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    })),
  clearItems: () => set({ items: [] }),

  // ─── Voice ────────────────────────────────────────────────────
  voiceState: "idle",
  transcript: "",
  interimTranscript: "",
  setVoiceState: (voiceState) => set({ voiceState }),
  setTranscript: (transcript) => set({ transcript }),
  setInterimTranscript: (interimTranscript) => set({ interimTranscript }),

  // ─── Search ───────────────────────────────────────────────────
  searchOpen: false,
  searchResults: [],
  searchQuery: "",
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // ─── Suggestions ──────────────────────────────────────────────
  suggestions: [],
  setSuggestions: (suggestions) => set({ suggestions }),

  // ─── Toasts ───────────────────────────────────────────────────
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: uuidv4() }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
