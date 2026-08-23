"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square, Keyboard } from "lucide-react";
import { useShoppingStore } from "@/store/shoppingStore";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { AudioHUD } from "./AudioHUD";
import { TranscriptBadge } from "./TranscriptBadge";
import { ParsedCommand } from "@/types";

export function VoiceController() {
  const { voiceState, setVoiceState, addToast, setSearchOpen, setSearchResults, setSearchQuery } =
    useShoppingStore();
  const { addItem, clearList } = useShoppingList();

  const handleFinalTranscript = useCallback(
    async (transcript: string) => {
      setVoiceState("parsing");
      try {
        const res = await fetch("/api/parse-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Parse failed");
        }

        const { data }: { data: ParsedCommand } = await res.json();

        switch (data.action) {
          case "ADD":
            if (data.items.length === 0) {
              addToast({ type: "warning", message: "Couldn't understand the item. Try again." });
              break;
            }
            for (const item of data.items) {
              await addItem(item);
            }
            break;

          case "REMOVE":
            addToast({ type: "info", message: `Removing: ${data.items.map((i) => i.name).join(", ")}` });
            break;

          case "SEARCH":
            if (data.items.length > 0) {
              const q = data.items[0];
              const params = new URLSearchParams({ q: q.name });
              if (q.max_price) params.set("maxPrice", String(q.max_price));
              if (q.category) params.set("category", q.category);

              const searchRes = await fetch(`/api/search?${params}`);
              const searchJson = await searchRes.json();
              setSearchResults(searchJson.data ?? []);
              setSearchQuery(q.name);
              setSearchOpen(true);
            }
            break;

          case "CLEAR":
            await clearList();
            break;

          case "RECOMMEND":
            addToast({ type: "info", message: "💡 Check the suggestions below!" });
            break;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI parsing failed";
        addToast({ type: "error", message: `⚠️ ${message}` });
      } finally {
        setVoiceState("idle");
      }
    },
    [addItem, clearList, setVoiceState, addToast, setSearchOpen, setSearchResults, setSearchQuery]
  );

  const { start, stop, isListening, isSupported } = useVoiceRecognition(handleFinalTranscript);

  const handleMicClick = () => {
    if (voiceState === "parsing") return;
    if (isListening) {
      stop();
    } else {
      start();
    }
  };

  const isParsing = voiceState === "parsing";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      {/* Transcript Badge */}
      <div className="h-10 flex items-end justify-center">
        <TranscriptBadge />
      </div>

      {/* Mic Button */}
      <div className="relative flex items-center justify-center mt-2">
        {/* Ripple rings when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                key="ring1"
                className="absolute rounded-full border border-red-500/50"
                initial={{ width: 90, height: 90, opacity: 1 }}
                animate={{ width: 200, height: 200, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                key="ring2"
                className="absolute rounded-full border border-red-500/50"
                initial={{ width: 90, height: 90, opacity: 1 }}
                animate={{ width: 200, height: 200, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
              <motion.div
                key="ring3"
                className="absolute rounded-full border border-red-500/50"
                initial={{ width: 90, height: 90, opacity: 1 }}
                animate={{ width: 200, height: 200, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 1.0 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleMicClick}
          disabled={isParsing || !isSupported}
          aria-label={isListening ? "Stop listening" : "Start listening"}
          className={`
            relative z-10 w-24 h-24 rounded-full flex items-center justify-center
            transition-all duration-300 focus:outline-none 
            ${isListening
              ? "bg-red-500 glow-red"
              : isParsing
              ? "bg-purple-500 glow-purple cursor-wait"
              : isSupported
              ? "bg-gradient-to-br from-sky-400 to-indigo-500 glow-blue hover:brightness-110"
              : "bg-white/10 cursor-not-allowed"
            }
          `}
        >
          {isListening ? (
            <Square className="w-8 h-8 text-white drop-shadow-md" fill="white" />
          ) : isParsing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white"
            />
          ) : isSupported ? (
            <Mic className="w-10 h-10 text-white drop-shadow-md" />
          ) : (
            <MicOff className="w-10 h-10 text-white/30" />
          )}
        </motion.button>
      </div>

      {/* AudioHUD */}
      <div className="h-8">
        <AudioHUD />
      </div>

      {/* Status label */}
      <motion.p
        key={voiceState}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-semibold tracking-wide text-white/50 text-center uppercase"
      >
        {!isSupported
          ? "Voice not supported"
          : isListening
          ? "Listening... Tap to stop"
          : isParsing
          ? "AI Processing..."
          : "Tap mic to add items"}
      </motion.p>

      {/* Manual input fallback */}
      {!isSupported && (
        <ManualInput onSubmit={handleFinalTranscript} />
      )}
    </div>
  );
}

function ManualInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const text = fd.get("cmd") as string;
    if (text?.trim()) {
      onSubmit(text.trim());
      e.currentTarget.reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full mt-4">
      <div className="relative flex-1">
        <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          name="cmd"
          type="text"
          placeholder='Type "Add 2 apples"'
          className="w-full pl-10 pr-4 py-3 rounded-xl glass-bright text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
      </div>
      <button
        type="submit"
        className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 glow-purple text-white text-sm font-bold transition-all"
      >
        Go
      </button>
    </form>
  );
}
