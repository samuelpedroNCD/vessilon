import Link from "next/link";

/** Server-rendered prev/next pager that preserves existing query params. */
export default function Pager({
  page,
  perPage,
  total,
  params,
}: {
  page: number;
  perPage: number;
  total: number;
  params: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (total <= perPage) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const q = sp.toString();
    return q ? `?${q}` : "?";
  };

  return (
    <div className="pager">
      <span className="pager-info">{from}–{to} of {total}</span>
      <span className="pager-btns">
        {page > 1 ? <Link href={href(page - 1)} className="btn outline sm">← Prev</Link> : <span className="btn outline sm disabled">← Prev</span>}
        <span className="pager-page">Page {page} / {pages}</span>
        {page < pages ? <Link href={href(page + 1)} className="btn outline sm">Next →</Link> : <span className="btn outline sm disabled">Next →</span>}
      </span>
    </div>
  );
}
