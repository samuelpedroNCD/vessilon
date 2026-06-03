"use client";

import { useRouter, usePathname } from "next/navigation";

type Filter = { name: string; label: string; options: { value: string; label: string }[] };

export default function Toolbar({
  searchPlaceholder,
  filters = [],
  current,
}: {
  searchPlaceholder?: string;
  filters?: Filter[];
  current: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function buildUrl(name: string, value: string): string {
    const next = new URLSearchParams();
    Object.entries(current).forEach(([k, v]) => {
      if (v) next.set(k, v);
    });
    if (value) next.set(name, value);
    else next.delete(name);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const hasFilters = Object.values(current).some(Boolean);

  return (
    <div className="toolbar">
      <div className="search">
        <svg viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
          <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          defaultValue={current.q ?? ""}
          placeholder={searchPlaceholder ?? "Search…"}
          onKeyDown={(e) => {
            if (e.key === "Enter") router.push(buildUrl("q", (e.target as HTMLInputElement).value));
          }}
        />
      </div>
      {filters.map((f) => (
        <select
          key={f.name}
          value={current[f.name] ?? ""}
          onChange={(e) => router.push(buildUrl(f.name, e.target.value))}
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      <span className="spacer" />
      {hasFilters && (
        <a className="clear" style={{ cursor: "pointer" }} onClick={() => router.push(pathname)}>
          Clear
        </a>
      )}
    </div>
  );
}
