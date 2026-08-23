"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useShoppingStore } from "@/store/shoppingStore";
import {
  getListAction,
  addItemAction,
  removeItemAction,
  toggleItemAction,
  updateQuantityAction,
  clearListAction,
} from "@/lib/actions";
import { ParsedItem, ShoppingItemUI } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function useShoppingList() {
  const queryClient = useQueryClient();
  const { setItems, addItem, removeItem, toggleItem, updateQuantity, clearItems, addToast } =
    useShoppingStore();

  // ─── Fetch list ────────────────────────────────────────────────
  const { isLoading } = useQuery({
    queryKey: ["shopping-list"],
    queryFn: async () => {
      const result = await getListAction();
      if (result.data?.items) {
        const mapped: ShoppingItemUI[] = result.data.items.map((i) => ({
          ...i,
          category: i.category as ShoppingItemUI["category"],
          maxPrice: i.maxPrice ?? null,
          estimatedPrice: i.estimatedPrice ?? null,
          unit: i.unit ?? null,
          brand: i.brand ?? null,
        }));
        setItems(mapped);
        return mapped;
      }
      return [];
    },
    staleTime: 30_000,
  });

  // ─── Add mutation ──────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (item: ParsedItem) => {
      // Optimistic add
      const optimisticItem: ShoppingItemUI = {
        id: `optimistic-${uuidv4()}`,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        brand: item.brand,
        maxPrice: item.max_price,
        estimatedPrice: null,
        checked: false,
        listId: "default-list",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addItem(optimisticItem);

      const result = await addItemAction(item);
      if (!result.success) throw new Error("Failed to add item");
      return result;
    },
    onSuccess: (_, item) => {
      addToast({ type: "success", message: `✅ Added ${item.name} to your list` });
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    },
    onError: (err, item) => {
      addToast({ type: "error", message: `Failed to add ${item.name}. Try again.` });
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    },
  });

  // ─── Remove mutation ───────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      removeItem(id); // Optimistic
      const result = await removeItemAction(id);
      if (!result.success) throw new Error("Failed to remove item");
      return { name };
    },
    onSuccess: ({ name }) => {
      addToast({ type: "info", message: `🗑️ Removed ${name}` });
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    },
  });

  // ─── Toggle mutation ───────────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      toggleItem(id); // Optimistic
      const result = await toggleItemAction(id);
      if (!result.success) throw new Error("Failed to toggle item");
      return result;
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    },
  });

  // ─── Update quantity mutation ──────────────────────────────────
  const updateQtyMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      updateQuantity(id, quantity); // Optimistic
      const result = await updateQuantityAction(id, quantity);
      if (!result.success) throw new Error("Failed to update quantity");
      return result;
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    },
  });

  // ─── Clear mutation ────────────────────────────────────────────
  const clearMutation = useMutation({
    mutationFn: async () => {
      clearItems(); // Optimistic
      const result = await clearListAction();
      if (!result.success) throw new Error("Failed to clear list");
      return result;
    },
    onSuccess: () => {
      addToast({ type: "info", message: "🧹 List cleared" });
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    },
  });

  return {
    isLoading,
    addItem: useCallback((item: ParsedItem) => addMutation.mutate(item), [addMutation]),
    removeItem: useCallback(
      (id: string, name: string) => removeMutation.mutate({ id, name }),
      [removeMutation]
    ),
    toggleItem: useCallback((id: string) => toggleMutation.mutate(id), [toggleMutation]),
    updateQuantity: useCallback(
      (id: string, quantity: number) => updateQtyMutation.mutate({ id, quantity }),
      [updateQtyMutation]
    ),
    clearList: useCallback(() => clearMutation.mutate(), [clearMutation]),
  };
}
