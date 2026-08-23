"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingCart, Package } from "lucide-react";
import { useShoppingStore } from "@/store/shoppingStore";
import { useShoppingList } from "@/hooks/useShoppingList";
import { CategoryGroup } from "./CategoryGroup";
import { ItemCategory, ShoppingItemUI } from "@/types";

const CATEGORY_ORDER: ItemCategory[] = [
  "Produce", "Dairy", "Bakery", "Meat", "Pantry", "Beverages", "Household", "Other",
];

export function ShoppingList() {
  const { items } = useShoppingStore();
  const { clearList, isLoading } = useShoppingList();

  // Group items by category
  const grouped = CATEGORY_ORDER.reduce<Record<ItemCategory, ShoppingItemUI[]>>(
    (acc, cat) => {
      acc[cat] = items.filter((i) => i.category === cat);
      return acc;
    },
    {} as Record<ItemCategory, ShoppingItemUI[]>
  );

  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.checked).length;
  const progressPct = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl glass shimmer" />
        ))}
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center glass rounded-3xl border border-white/5"
      >
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-5 glow-blue">
          <ShoppingCart className="w-10 h-10 text-white/40" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Your list is empty</h3>
        <p className="text-sm text-white/50 max-w-xs leading-relaxed">
          Tap the mic and say something like{" "}
          <span className="italic text-indigo-400">"Add 2 apples and a loaf of sourdough"</span>
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-white text-sm">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
          {checkedItems > 0 && (
            <span className="text-xs font-semibold text-emerald-400">
              · {checkedItems} checked
            </span>
          )}
        </div>
        <button
          onClick={() => clearList()}
          className="flex items-center gap-1.5 text-xs text-red-400/80 hover:text-red-400 transition-colors font-bold uppercase tracking-wider"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Progress bar */}
      {totalItems > 0 && (
        <div className="h-2 glass rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 progress-glow rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
      )}

      {/* Category groups */}
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {CATEGORY_ORDER.map((category) =>
            grouped[category].length > 0 ? (
              <motion.div
                key={category}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CategoryGroup category={category} items={grouped[category]} />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
