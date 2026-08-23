import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SearchResult } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") ?? "";
    const category = searchParams.get("category");
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;

    if (!query.trim()) {
      return NextResponse.json({ success: true, data: [] });
    }

    const results = await db.catalogue.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query } },
              { tags: { contains: query.toLowerCase() } },
            ],
          },
          category ? { category } : {},
          maxPrice !== undefined ? { estimatedPrice: { lte: maxPrice } } : {},
        ],
      },
      take: 20,
      orderBy: { name: "asc" },
    });

    const formatted: SearchResult[] = results.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category as SearchResult["category"],
      estimatedPrice: item.estimatedPrice,
      tags: (() => {
        try { return JSON.parse(item.tags) as string[]; } catch { return []; }
      })(),
      inStock: item.inStock,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("[search] Error:", err);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
