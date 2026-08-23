"use client";

import { ShoppingCart, Search } from "lucide-react";
import { useShoppingStore } from "@/store/shoppingStore";

export function HeaderClient() {
  const { setSearchOpen } = useShoppingStore();

  return (
    <header className="sticky top-0 z-30 glass border-b-0 shadow-xl shadow-black/40">
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-purple float">
            <ShoppingCart className="w-5 h-5 text-white drop-shadow-md" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none mb-1">
              Voice<span className="gradient-text">Cart</span>
            </h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] leading-none">
              AI Assistant
            </p>
          </div>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-bright hover:bg-white/20 transition-colors text-white/90 text-sm font-semibold shadow-lg shadow-black/20"
          aria-label="Search products"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </div>
    </header>
  );
}
