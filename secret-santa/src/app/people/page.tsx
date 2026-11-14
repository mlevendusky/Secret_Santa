import Link from "next/link";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";

export default async function PeoplePage() {
  const user = await requireUser();
  const people = await db.user.findMany({
    where: { id: { not: user.id } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, _count: { select: { items: true } } },
  });

  return (
    <>
      <div className="page-head">
        <h1>People</h1>
        <p>Pick someone to see their list and what&apos;s already being bought.</p>
      </div>
      {people.length === 0 ? (
        <div className="empty">
          <span className="icon">🎅</span>
          No one else has registered yet.
        </div>
      ) : (
        <div className="people">
          {people.map((p) => (
            <Link key={p.id} href={`/people/${p.id}`} className="person">
              <span className="avatar">{p.name.charAt(0).toUpperCase()}</span>
              <div>
                <div className="person-name">{p.name}</div>
                <div className="person-count">
                  {p._count.items} {p._count.items === 1 ? "item" : "items"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
