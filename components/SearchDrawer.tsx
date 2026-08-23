"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Package2, Loader2 } from "lucide-react";
import { useShoppingStore } from "@/store/shoppingStore";
import { useShoppingList } from "@/hooks/useShoppingList";
import { SearchResult, ItemCategory, CATEGORY_META } from "@/types";

export function SearchDrawer() {
  const { searchOpen, searchResults, searchQuery, setSearchOpen, setSearchResults, setSearchQuery } =
    useShoppingStore();
  const { addItem } = useShoppingList();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchOpen || !localQuery.trim()) return;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(localQuery)}`);
        const json = await res.json();
        setSearchResults(json.data ?? []);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localQuery, searchOpen, setSearchResults]);

  const handleClose = () => {
    setSearchOpen(false);
    setSearchResults([]);
    setSearchQuery("");
    setLocalQuery("");
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-h-[85vh] flex flex-col border-t border-white/10"
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 px-6 pb-4 pt-2 border-b border-white/5">
              <Search className="w-5 h-5 text-indigo-400" />
              <input
                autoFocus
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 text-lg font-semibold bg-transparent text-white placeholder:text-white/30 focus:outline-none"
              />
              {isSearching && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
              <button onClick={handleClose} className="p-2 -mr-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {searchResults.length === 0 && !isSearching && localQuery && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Package2 className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-sm font-medium text-white/50">No results for "{localQuery}"</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {searchResults.map((result) => (
                    <SearchResultCard
                      key={result.id}
                      result={result}
                      onAdd={() => {
                        addItem({
                          name: result.name,
                          quantity: 1,
                          unit: null,
                          category: result.category as ItemCategory,
                          brand: null,
                          max_price: null,
                        });
                        handleClose();
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SearchResultCard({ result, onAdd }: { result: SearchResult; onAdd: () => void }) {
  const meta = CATEGORY_META[result.category] ?? CATEGORY_META.Other;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl glass-bright hover:bg-white/10 transition-colors border border-white/5"
    >
      <span className="text-2xl drop-shadow-md">{meta.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-white truncate mb-1">{result.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white/70 uppercase tracking-wider">
            {result.category}
          </span>
          {result.estimatedPrice && (
            <span className="text-xs text-emerald-400 font-bold">
              ~${result.estimatedPrice.toFixed(2)}
            </span>
          )}
          {!result.inStock && (
            <span className="text-xs text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-md">
              Out of stock
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 glow-blue text-white text-sm font-bold transition-all"
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </motion.div>
  );
}
