"use client";

import { motion } from "framer-motion";
import { useShoppingStore } from "@/store/shoppingStore";

export function AudioHUD() {
  const { voiceState } = useShoppingStore();

  const isListening = voiceState === "listening";
  const isParsing = voiceState === "parsing";

  const barColor = isListening
    ? "bg-red-400"
    : isParsing
    ? "bg-purple-400"
    : "bg-white/20";

  if (!isListening && !isParsing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-center gap-1.5 h-full"
      aria-label={isListening ? "Listening..." : "Parsing command..."}
    >
      {isParsing ? (
        <span className="text-sm font-bold text-purple-400 tracking-widest uppercase animate-pulse">
          Parsing
        </span>
      ) : (
        // Wave bars for listening
        [0, 1, 2, 3, 4].map((i) => {
          const heights = [16, 28, 20, 28, 16];
          return (
            <motion.div
              key={i}
              className={`w-1.5 rounded-full ${barColor}`}
              animate={{
                height: [6, heights[i], 6],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.6 + i * 0.08,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          );
        })
      )}
    </motion.div>
  );
}
