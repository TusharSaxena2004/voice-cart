import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SuggestionItem } from "@/types";

export const dynamic = "force-dynamic";

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const currentItemNames = searchParams.get("items")?.split(",") ?? [];

    const currentSeason = getCurrentSeason();

    // ─── 1. Frequent items (history-based) ────────────────────────
    const historyItems = await db.itemHistory.findMany({
      where: {
        name: { notIn: currentItemNames },
      },
      orderBy: { count: "desc" },
      take: 6,
    });

    // ─── 2. Seasonal items ────────────────────────────────────────
    const seasonalItems = await db.catalogue.findMany({
      where: {
        season: currentSeason,
        name: { notIn: currentItemNames },
        inStock: true,
      },
      take: 5,
    });

    // ─── 3. Substitute suggestions ────────────────────────────────
    const substituteItems = await db.catalogue.findMany({
      where: {
        isSubstituteFor: { not: null },
        name: { notIn: currentItemNames },
        inStock: true,
      },
      take: 4,
    });

    // ─── Combine & format ─────────────────────────────────────────
    const suggestions: SuggestionItem[] = [
      ...historyItems.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category as SuggestionItem["category"],
        type: "frequent" as const,
        reason: `Bought ${item.count} times`,
        estimatedPrice: null,
        substituteFor: null,
        season: null,
        tags: [],
      })),
      ...seasonalItems.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category as SuggestionItem["category"],
        type: "seasonal" as const,
        reason: `In season — ${currentSeason}`,
        estimatedPrice: item.estimatedPrice,
        substituteFor: null,
        season: item.season,
        tags: (() => {
          try { return JSON.parse(item.tags) as string[]; } catch { return []; }
        })(),
      })),
      ...substituteItems.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category as SuggestionItem["category"],
        type: "substitute" as const,
        reason: `Try instead of ${item.isSubstituteFor}`,
        estimatedPrice: item.estimatedPrice,
        substituteFor: item.isSubstituteFor,
        season: null,
        tags: (() => {
          try { return JSON.parse(item.tags) as string[]; } catch { return []; }
        })(),
      })),
    ];

    return NextResponse.json({ success: true, data: suggestions });
  } catch (err) {
    console.error("[suggestions] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load suggestions" },
      { status: 500 }
    );
  }
}
