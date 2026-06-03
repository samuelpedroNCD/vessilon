/**
 * Make a raw user search term safe to interpolate into a PostgREST `.or()`
 * filter string. Those filters are comma/parenthesis delimited and treat
 * `*` as the wildcard, so an unescaped term (e.g. `a,b` or `(x)`) breaks the
 * query or changes its meaning. We strip the filter metacharacters and the
 * SQL-LIKE wildcards, then trim — leaving a plain literal for an ilike match.
 */
export function sanitizeSearch(q: string | undefined | null): string | null {
  if (!q) return null;
  const cleaned = q
    .replace(/[(),*:\\%_]/g, " ") // PostgREST + LIKE metacharacters
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return cleaned || null;
}
