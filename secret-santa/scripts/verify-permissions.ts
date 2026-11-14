import { db } from "../src/lib/db";
import { getListForViewer } from "../src/lib/permissions";
import { addItems, claimItem, ClaimError, parseCsv } from "../src/lib/items";

const tag = `verify-${Date.now()}`;
let failures = 0;

function check(name: string, ok: boolean) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failures++;
}

async function expectClaimError(name: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    check(name, false);
  } catch (e) {
    check(name, e instanceof ClaimError);
  }
}

async function main() {
  const a = await db.user.create({ data: { name: "Alice", email: `a-${tag}@test.local`, passwordHash: "x" } });
  const b = await db.user.create({ data: { name: "Bob", email: `b-${tag}@test.local`, passwordHash: "x" } });
  const c = await db.user.create({ data: { name: "Carol", email: `c-${tag}@test.local`, passwordHash: "x" } });
  try {
    const csv = "Title,Link,Price,Notes\nScarf,https://example.com/scarf,20,blue\nBook,javascript:alert(1),,\n,https://example.com/x,,\n";
    const parsed = parseCsv(csv);
    check("CSV: 2 valid rows, 1 skipped", parsed.items.length === 2);
    check("CSV: javascript: link dropped", parsed.items[1]?.link === null);
    await addItems(a.id, parsed.items);

    const scarf = await db.item.findFirstOrThrow({ where: { ownerId: a.id, title: "Scarf" } });
    await claimItem(b.id, scarf.id);

    const ownerView = await getListForViewer(a.id, a.id);
    const ownerScarf = ownerView.items.find((i) => i.id === scarf.id);
    check("Owner view kind is owner", ownerView.kind === "owner");
    check("Owner sees picked: true", ownerScarf !== undefined && "picked" in ownerScarf && ownerScarf.picked === true);
    const ownerJson = JSON.stringify(ownerView);
    check("Owner payload has no buyer fields", !/buyer/i.test(ownerJson));
    check("Owner payload has no buyer name/id", !ownerJson.includes("Bob") && !ownerJson.includes(b.id));

    const carolView = await getListForViewer(a.id, c.id);
    const carolScarf = carolView.items.find((i) => i.id === scarf.id);
    check("Other buyer sees who is buying", carolScarf !== undefined && "buyerName" in carolScarf && carolScarf.buyerName === "Bob");

    await expectClaimError("Owner cannot claim own item", () => claimItem(a.id, scarf.id));
    await expectClaimError("Second claim rejected", () => claimItem(c.id, scarf.id));
  } finally {
    await db.user.deleteMany({ where: { id: { in: [a.id, b.id, c.id] } } });
    await db.$disconnect();
  }
  console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
