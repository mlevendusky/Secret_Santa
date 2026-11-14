import { db } from "@/lib/db";

// The single place that decides what a viewer sees of a list.
// Owner: picked flag only. The buyer is never selected from the DB for the owner.
// Others: who is buying each item.

type BaseItem = {
  id: string;
  title: string;
  link: string | null;
  price: string | null;
  notes: string | null;
};

export type OwnerItemView = BaseItem & { picked: boolean };
export type BuyerItemView = BaseItem & { buyerId: string | null; buyerName: string | null };

export type ListView =
  | { kind: "owner"; items: OwnerItemView[] }
  | { kind: "buyer"; items: BuyerItemView[] };

const baseSelect = { id: true, title: true, link: true, price: true, notes: true } as const;

export async function getListForViewer(ownerId: string, viewerId: string): Promise<ListView> {
  if (ownerId === viewerId) {
    const rows = await db.item.findMany({
      where: { ownerId },
      orderBy: { createdAt: "asc" },
      select: { ...baseSelect, claim: { select: { id: true } } },
    });
    return {
      kind: "owner",
      items: rows.map(({ claim, ...item }) => ({ ...item, picked: claim !== null })),
    };
  }

  const rows = await db.item.findMany({
    where: { ownerId },
    orderBy: { createdAt: "asc" },
    select: {
      ...baseSelect,
      claim: { select: { buyerId: true, buyer: { select: { name: true } } } },
    },
  });
  return {
    kind: "buyer",
    items: rows.map(({ claim, ...item }) => ({
      ...item,
      buyerId: claim?.buyerId ?? null,
      buyerName: claim?.buyer.name ?? null,
    })),
  };
}
