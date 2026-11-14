import Papa from "papaparse";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type ItemInput = { title: string; link: string | null; price: string | null; notes: string | null };

function clean(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

// Only http(s) links are kept so a list cannot inject javascript: URLs.
export function safeLink(v: unknown): string | null {
  const s = clean(v);
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function parseCsv(text: string): { items: ItemInput[]; errors: string[] } {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });
  const errors = result.errors.map((e) => `Row ${(e.row ?? 0) + 2}: ${e.message}`);
  const items: ItemInput[] = [];
  result.data.forEach((row, i) => {
    const title = clean(row.title);
    if (!title) {
      errors.push(`Row ${i + 2}: missing title, skipped`);
      return;
    }
    const link = safeLink(row.link);
    if (clean(row.link) && !link) errors.push(`Row ${i + 2}: link is not http(s), dropped`);
    items.push({ title, link, price: clean(row.price), notes: clean(row.notes) });
  });
  return { items, errors };
}

export async function addItems(ownerId: string, items: ItemInput[]) {
  if (items.length === 0) return 0;
  const res = await db.item.createMany({ data: items.map((i) => ({ ...i, ownerId })) });
  return res.count;
}

export async function deleteItem(ownerId: string, itemId: string) {
  // Claim cascades with the item.
  await db.item.deleteMany({ where: { id: itemId, ownerId } });
}

export class ClaimError extends Error {}

export async function claimItem(buyerId: string, itemId: string) {
  const item = await db.item.findUnique({ where: { id: itemId }, select: { ownerId: true } });
  if (!item) throw new ClaimError("Item not found");
  if (item.ownerId === buyerId) throw new ClaimError("You cannot claim your own item");
  try {
    await db.claim.create({ data: { itemId, buyerId } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new ClaimError("Already claimed");
    }
    throw e;
  }
}

export async function unclaimItem(buyerId: string, itemId: string) {
  await db.claim.deleteMany({ where: { itemId, buyerId } });
}
