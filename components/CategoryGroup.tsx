"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ItemCategory, ShoppingItemUI, CATEGORY_META } from "@/types";
import { ShoppingItem } from "./ShoppingItem";
import { useShoppingList } from "@/hooks/useShoppingList";

interface CategoryGroupProps {
  category: ItemCategory;
  items: ShoppingItemUI[];
}

export function CategoryGroup({ category, items }: CategoryGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { removeItem, toggleItem, updateQuantity } = useShoppingList();
  const meta = CATEGORY_META[category];

  const checkedCount = items.filter((i) => i.checked).length;
  const isAllChecked = checkedCount === items.length && items.length > 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-black/20">
      {/* Category Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={`w-full flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/5 ${isAllChecked ? "opacity-60" : ""}`}
      >
        <span className="text-xl drop-shadow-md">{meta.emoji}</span>
        <span className="font-bold text-sm flex-1 text-left text-white tracking-wide">
          {category}
        </span>
        <span className="text-xs font-bold text-white/40 bg-white/5 px-2 py-1 rounded-md">
          {checkedCount}/{items.length}
        </span>
        <span className={`text-white/40 transition-transform ${collapsed ? "" : "rotate-0"}`}>
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* Items */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-px bg-white/5">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <ShoppingItem
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItem(item.id)}
                    onRemove={() => removeItem(item.id, item.name)}
                    onUpdateQty={(qty) => updateQuantity(item.id, qty)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
