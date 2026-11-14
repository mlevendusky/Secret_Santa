import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { getListForViewer } from "@/lib/permissions";
import { claimAction, unclaimAction } from "@/lib/actions";

export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { msg } = await searchParams;
  if (id === user.id) redirect("/my-list");

  const owner = await db.user.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!owner) notFound();

  const view = await getListForViewer(owner.id, user.id);
  const items = view.kind === "buyer" ? view.items : [];
  const claimedCount = items.filter((i) => i.buyerId !== null).length;

  return (
    <>
      <Link href="/people" className="back">← All people</Link>
      <div className="page-head">
        <h1>{owner.name}&apos;s list</h1>
        <p>
          {items.length} items · {claimedCount} being bought. {owner.name} only sees that an item is picked, not by whom.
        </p>
      </div>
      {msg && <p className="msg">{msg}</p>}

      {items.length === 0 ? (
        <div className="empty">
          <span className="icon">🎁</span>
          {owner.name} hasn&apos;t added anything yet.
        </div>
      ) : (
        <div className="items">
          {items.map((item) => (
            <div key={item.id} className="item">
              <div className="item-main">
                <div className="item-title">
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      {item.title} <span className="ext">↗</span>
                    </a>
                  ) : (
                    item.title
                  )}
                </div>
                {(item.price || item.notes) && (
                  <div className="item-meta">
                    {item.price && <span className="item-price">{item.price}</span>}
                    {item.notes && <span>{item.notes}</span>}
                  </div>
                )}
              </div>
              <div className="item-side">
                {item.buyerId === null ? (
                  <form action={claimAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="ownerId" value={owner.id} />
                    <button type="submit" className="btn btn-green btn-sm">I&apos;ll buy this</button>
                  </form>
                ) : item.buyerId === user.id ? (
                  <form action={unclaimAction}>
                    <span className="badge badge-green">✓ You&apos;re buying</span>
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="ownerId" value={owner.id} />
                    <button type="submit" className="btn btn-ghost btn-sm">Unclaim</button>
                  </form>
                ) : (
                  <span className="badge badge-gold">🎅 {item.buyerName}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
