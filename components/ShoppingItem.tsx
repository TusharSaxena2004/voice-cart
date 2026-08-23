"use client";

import { motion } from "framer-motion";
import { Trash2, Plus, Minus } from "lucide-react";
import { ShoppingItemUI } from "@/types";

interface ShoppingItemProps {
  item: ShoppingItemUI;
  onToggle: () => void;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}

export function ShoppingItem({ item, onToggle, onRemove, onUpdateQty }: ShoppingItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, height: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={`
        group flex items-center gap-4 px-5 py-3.5 bg-[#0a0a1a]/60
        transition-all duration-200 hover:bg-[#1a1a2e]/80
        ${item.checked ? "opacity-50" : ""}
      `}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        aria-label={item.checked ? "Uncheck item" : "Check item"}
        className="flex-shrink-0"
      >
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
            ${item.checked
              ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
              : "border-white/20 hover:border-indigo-400 bg-black/20"
            }`}
        >
          {item.checked && (
            <svg viewBox="0 0 12 9" fill="none" className="w-3.5 h-3.5">
              <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </button>

      {/* Item Details */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`font-semibold text-white text-sm truncate ${item.checked ? "line-through text-white/50" : ""}`}>
            {item.name}
          </span>
          {item.brand && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-white/10 text-white/70 rounded-md uppercase tracking-wider">
              {item.brand}
            </span>
          )}
          {item.maxPrice && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-green-500/20 text-green-400 rounded-md">
              ≤${item.maxPrice}
            </span>
          )}
        </div>
        {item.unit && (
          <p className="text-[11px] text-white/40 font-medium">{item.unit}</p>
        )}
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center gap-2 flex-shrink-0 bg-black/40 rounded-full p-1 border border-white/5">
        <button
          onClick={() => onUpdateQty(item.quantity - 1)}
          className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5 text-white/70" />
        </button>
        <span className="w-6 text-center text-sm font-bold text-white">
          {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1)}
        </span>
        <button
          onClick={() => onUpdateQty(item.quantity + 1)}
          className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5 text-white/70" />
        </button>
      </div>

      {/* Delete */}
      <button
        onClick={onRemove}
        aria-label="Remove item"
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-full ml-1"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
