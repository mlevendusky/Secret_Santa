import { requireUser } from "@/lib/session";
import { getListForViewer } from "@/lib/permissions";
import { addItemAction, deleteItemAction, uploadCsvAction } from "@/lib/actions";

export default async function MyListPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const { msg } = await searchParams;
  const view = await getListForViewer(user.id, user.id);
  const items = view.kind === "owner" ? view.items : [];
  const pickedCount = items.filter((i) => i.picked).length;

  return (
    <>
      <div className="page-head">
        <h1>My list</h1>
        <p>Add what you&apos;d like. You&apos;ll see when something is picked, but not who picked it.</p>
      </div>
      {msg && <p className="msg">{msg}</p>}

      <div className="grid-2">
        <div className="card">
          <h2>Upload CSV</h2>
          <p className="hint">
            Columns: <code>title,link,price,notes</code>. Only title is required. Rows are added to your list.
          </p>
          <form action={uploadCsvAction} className="form">
            <label className="file-drop">
              <span>Choose a .csv file</span>
              <input name="file" type="file" accept=".csv,text/csv" required />
            </label>
            <button type="submit" className="btn btn-primary">Upload</button>
          </form>
        </div>

        <div className="card">
          <h2>Add an item</h2>
          <form action={addItemAction} className="form">
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" required />
            </div>
            <div className="field">
              <label htmlFor="link">Link</label>
              <input id="link" name="link" type="url" placeholder="https://..." />
            </div>
            <div className="row">
              <div className="field">
                <label htmlFor="price">Price</label>
                <input id="price" name="price" />
              </div>
              <div className="field">
                <label htmlFor="notes">Notes</label>
                <input id="notes" name="notes" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Add item</button>
          </form>
        </div>
      </div>

      <div className="section-title">
        <h2>Your items</h2>
        <span>
          {items.length} items · {pickedCount} picked
        </span>
      </div>

      {items.length === 0 ? (
        <div className="empty">
          <span className="icon">🎄</span>
          Your list is empty. Upload a CSV or add an item above.
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
                {item.picked ? (
                  <span className="badge badge-green">✓ Picked</span>
                ) : (
                  <span className="badge badge-muted">Not picked</span>
                )}
                <form action={deleteItemAction}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <button type="submit" className="btn btn-danger btn-sm">Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
