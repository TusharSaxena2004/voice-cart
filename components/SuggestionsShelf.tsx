"use client";

import { motion } from "framer-motion";
import { Plus, Sparkles, Leaf, RefreshCw } from "lucide-react";
import { useSuggestions } from "@/hooks/useSuggestions";
import { useShoppingList } from "@/hooks/useShoppingList";
import { SuggestionItem, SuggestionType, ItemCategory } from "@/types";

const TYPE_META: Record<SuggestionType, { label: string; icon: React.ReactNode; color: string; badge: string }> = {
  frequent: {
    label: "Frequent",
    icon: <Sparkles className="w-3 h-3" />,
    color: "from-violet-500/20 to-purple-500/5",
    badge: "text-violet-300 bg-violet-500/20 border-violet-500/30",
  },
  seasonal: {
    label: "Seasonal",
    icon: <Leaf className="w-3 h-3" />,
    color: "from-emerald-500/20 to-teal-500/5",
    badge: "text-emerald-300 bg-emerald-500/20 border-emerald-500/30",
  },
  substitute: {
    label: "Alternative",
    icon: <RefreshCw className="w-3 h-3" />,
    color: "from-amber-500/20 to-orange-500/5",
    badge: "text-amber-300 bg-amber-500/20 border-amber-500/30",
  },
};

function SuggestionCard({ item, onAdd }: { item: SuggestionItem; onAdd: () => void }) {
  const typeMeta = TYPE_META[item.type];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`scroll-snap-item flex-shrink-0 w-44 rounded-2xl border border-white/10 p-4 flex flex-col gap-3 glass bg-gradient-to-br ${typeMeta.color} shadow-lg`}
    >
      {/* Type badge */}
      <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md border w-fit uppercase tracking-wider ${typeMeta.badge}`}>
        {typeMeta.icon}
        {typeMeta.label}
      </div>

      {/* Name */}
      <div className="flex-1">
        <p className="text-sm font-bold text-white leading-snug">{item.name}</p>
        <p className="text-xs text-white/50 mt-1 line-clamp-2">{item.reason}</p>
        {item.estimatedPrice && (
          <p className="text-xs font-bold text-emerald-400 mt-2">
            ~${item.estimatedPrice.toFixed(2)}
          </p>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={onAdd}
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all duration-200 border border-white/5"
      >
        <Plus className="w-4 h-4" />
        Add to list
      </button>
    </motion.div>
  );
}

export function SuggestionsShelf() {
  const { suggestions, isLoading } = useSuggestions();
  const { addItem } = useShoppingList();

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden py-2 px-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-44 h-40 rounded-2xl glass shimmer" />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 px-1">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h2 className="text-sm font-bold tracking-wide text-white uppercase">Suggestions</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scroll-snap-x -mx-4 px-5">
        {suggestions.map((item) => (
          <SuggestionCard
            key={item.id}
            item={item}
            onAdd={() =>
              addItem({
                name: item.name,
                quantity: 1,
                unit: null,
                category: item.category as ItemCategory,
                brand: null,
                max_price: null,
              })
            }
          />
        ))}
      </div>
    </div>
  );
}
