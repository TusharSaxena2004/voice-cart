import { VoiceController } from "@/components/VoiceController";
import { ShoppingList } from "@/components/ShoppingList";
import { SuggestionsShelf } from "@/components/SuggestionsShelf";
import { HeaderClient } from "@/components/HeaderClient";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Content layer */}
      <div className="relative z-10">
        <HeaderClient />

        <main className="max-w-lg mx-auto px-4 pb-28">

          {/* ── Hero Voice Section ───────────────────────── */}
          <section className="pt-6 pb-8 flex flex-col items-center">
            {/* Tagline */}
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400/80 mb-4">
              ✦ Voice-Powered Shopping ✦
            </p>

            <VoiceController />
          </section>

          {/* ── Section Divider ─────────────────────────── */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">
              Shopping List
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* ── Shopping List ────────────────────────────── */}
          <section className="mb-10">
            <ShoppingList />
          </section>

          {/* ── Suggestions ─────────────────────────────── */}
          <section className="mb-8">
            <SuggestionsShelf />
          </section>
        </main>
      </div>
    </div>
  );
}
