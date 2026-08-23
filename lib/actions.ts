"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { inferCategory } from "@/lib/parser";
import { ParsedItem } from "@/types";

const DEFAULT_LIST_ID = "default-list";

// ─── Ensure default list exists ──────────────────────────────────────────────

async function ensureList() {
  return db.shoppingList.upsert({
    where: { id: DEFAULT_LIST_ID },
    update: {},
    create: { id: DEFAULT_LIST_ID, name: "My Shopping List" },
  });
}

// ─── Add Item ────────────────────────────────────────────────────────────────

export async function addItemAction(item: ParsedItem) {
  await ensureList();

  const category = item.category || inferCategory(item.name);

  // Deduplication: increment if already exists
  const existing = await db.shoppingItem.findFirst({
    where: {
      listId: DEFAULT_LIST_ID,
      name: { equals: item.name },
      checked: false,
    },
  });

  if (existing) {
    const updated = await db.shoppingItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + item.quantity },
    });
    // Update history
    await db.itemHistory.upsert({
      where: { name: item.name },
      update: { count: { increment: 1 }, lastUsed: new Date() },
      create: { name: item.name, category, count: 1 },
    });
    revalidatePath("/");
    return { success: true, data: updated, deduplicated: true };
  }

  const created = await db.shoppingItem.create({
    data: {
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category,
      brand: item.brand,
      maxPrice: item.max_price,
      listId: DEFAULT_LIST_ID,
    },
  });

  // Update history
  await db.itemHistory.upsert({
    where: { name: item.name },
    update: { count: { increment: 1 }, lastUsed: new Date() },
    create: { name: item.name, category, count: 1 },
  });

  revalidatePath("/");
  return { success: true, data: created, deduplicated: false };
}

// ─── Remove Item ──────────────────────────────────────────────────────────────

export async function removeItemAction(itemId: string) {
  await db.shoppingItem.delete({ where: { id: itemId } });
  revalidatePath("/");
  return { success: true };
}

// ─── Remove By Name ───────────────────────────────────────────────────────────

export async function removeItemByNameAction(name: string) {
  const item = await db.shoppingItem.findFirst({
    where: { listId: DEFAULT_LIST_ID, name: { equals: name } },
    orderBy: { createdAt: "desc" },
  });

  if (item) {
    await db.shoppingItem.delete({ where: { id: item.id } });
    revalidatePath("/");
    return { success: true, deleted: item };
  }
  return { success: false, error: "Item not found" };
}

// ─── Toggle Item ──────────────────────────────────────────────────────────────

export async function toggleItemAction(itemId: string) {
  const item = await db.shoppingItem.findUnique({ where: { id: itemId } });
  if (!item) return { success: false, error: "Item not found" };

  const updated = await db.shoppingItem.update({
    where: { id: itemId },
    data: { checked: !item.checked },
  });
  revalidatePath("/");
  return { success: true, data: updated };
}

// ─── Update Quantity ──────────────────────────────────────────────────────────

export async function updateQuantityAction(itemId: string, quantity: number) {
  if (quantity <= 0) {
    await db.shoppingItem.delete({ where: { id: itemId } });
    revalidatePath("/");
    return { success: true, deleted: true };
  }

  const updated = await db.shoppingItem.update({
    where: { id: itemId },
    data: { quantity },
  });
  revalidatePath("/");
  return { success: true, data: updated };
}

// ─── Clear List ───────────────────────────────────────────────────────────────

export async function clearListAction() {
  await db.shoppingItem.deleteMany({ where: { listId: DEFAULT_LIST_ID } });
  revalidatePath("/");
  return { success: true };
}

// ─── Get List ─────────────────────────────────────────────────────────────────

export async function getListAction() {
  await ensureList();
  const list = await db.shoppingList.findUnique({
    where: { id: DEFAULT_LIST_ID },
    include: {
      items: { orderBy: [{ category: "asc" }, { createdAt: "asc" }] },
    },
  });
  return { success: true, data: list };
}
