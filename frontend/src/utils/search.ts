import { hasAvailable } from "./helpers";

export function tokenize(q: string) {
  return q.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function relevanceScore(book: any, tokens: string[]) {
  if (!tokens.length) return 0;
  let score = 0;
  for (const t of tokens) {
    if ((book.title || "").toLowerCase().includes(t)) score += 5;
    if ((book.author || "").toLowerCase().includes(t)) score += 3;
    if ((book.description || "").toLowerCase().includes(t)) score += 2;
    if ((book.isbn || "").toLowerCase().includes(t)) score += 2;
    if ((book.subjects || []).some((s: string) => (s || "").toLowerCase().includes(t))) score += 3;
  }
  return score;
}

export function fieldText(book: any, field: string) {
  switch (field) {
    case "title":   return book.title || "";
    case "author":  return book.author || "";
    case "subject": return (book.subjects || []).join(" ");
    case "isbn":    return book.isbn || "";
    default:
      return [book.title, book.author, (book.subjects || []).join(" "), book.isbn, book.description].join(" ");
  }
}

export function matchTerm(text: string, term: string) {
  const t = (text || "").toLowerCase();
  const q = (term || "").trim().toLowerCase();
  if (!q) return true;
  return q.split(/\s+/).filter(Boolean).every((p) => t.includes(p));
}

export function matchRow(book: any, row: any) {
  return matchTerm(fieldText(book, row.field), row.term);
}

export function makePredicateFromQuery(query: any, tokens: string[]) {
  if (!query || typeof query === "string") {
    return (b: any) => tokens.length === 0 || relevanceScore(b, tokens) > 0;
  }
  const rows = query.rows?.length ? query.rows : [{ field: "any", term: "" }];
  return (b: any) => {
    let res = matchRow(b, rows[0]);
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const m = matchRow(b, r);
      switch ((r.op || "AND").toUpperCase()) {
        case "OR":  res = res || m;  break;
        case "NOT": res = res && !m; break;
        default:    res = res && m;  break;
      }
    }
    return res;
  };
}

export const getSimilarBooks = (book: any, books: any[], limit = 8) => {
  if (!book || !Array.isArray(books)) return [];
  const pool = books.filter((b) => b.id !== book.id);
  const scored = pool
    .map((b) => {
      let score = 0;
      if (b.author === book.author) score += 5;
      const overlap = (b.subjects || []).filter((s: string) =>
        (book.subjects || []).includes(s),
      ).length;
      score += overlap * 3;
      if (b.language === book.language) score += 1;
      if (hasAvailable(b)) score += 1;
      return { book: b, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.book.year - a.book.year)
    .slice(0, limit)
    .map((x) => x.book);

  return scored.length === 0 ? pool.slice(0, limit) : scored;
};
