"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useShoppingStore } from "@/store/shoppingStore";
import { Mic } from "lucide-react";

export function TranscriptBadge() {
  const { interimTranscript, transcript, voiceState } = useShoppingStore();

  const display = interimTranscript || (voiceState === "parsing" ? transcript : "");
  const isInterim = !!interimTranscript;

  return (
    <AnimatePresence>
      {display && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-bright text-white text-sm shadow-xl shadow-black/20"
        >
          <Mic className={`w-4 h-4 flex-shrink-0 ${isInterim ? 'text-red-400' : 'text-purple-400'}`} />
          <span className={`truncate max-w-[250px] ${isInterim ? "opacity-70" : "font-semibold text-white glow-purple"}`}>
            "{display}"
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
