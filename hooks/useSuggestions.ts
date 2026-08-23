"use client";

import { useQuery } from "@tanstack/react-query";
import { useShoppingStore } from "@/store/shoppingStore";
import { SuggestionItem } from "@/types";

export function useSuggestions() {
  const { items, setSuggestions, suggestions } = useShoppingStore();
  const currentItemNames = items.map((i) => i.name).join(",");

  const { isLoading } = useQuery({
    queryKey: ["suggestions", currentItemNames],
    queryFn: async (): Promise<SuggestionItem[]> => {
      const params = currentItemNames
        ? `?items=${encodeURIComponent(currentItemNames)}`
        : "";
      const res = await fetch(`/api/suggestions${params}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSuggestions(json.data);
        return json.data;
      }
      return [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return { suggestions, isLoading };
}
