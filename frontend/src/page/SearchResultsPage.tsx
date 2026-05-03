import { useState, useEffect, useMemo } from "react";
import { classNames, hasAvailable } from "../utils/helpers";
import { tokenize, relevanceScore, makePredicateFromQuery } from "../utils/search";
import { SearchStrip } from "../components/SearchStrip";
import { BookCard } from "../components/BookCard";
import { AvailabilityBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { IconSliders, IconX } from "../components/icons";

export function SearchResultsPage({ books, query, initFilters, onOpenBook, onNewSearch, goAdvanced }: any) {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [page, setPage] = useState(1);

  const safeBooks = Array.isArray(books) ? books : [];

  const allLibs = useMemo(() => Array.from(new Set(safeBooks.flatMap((b: any) => (b.availability || []).map((a: any) => a.lib).filter(Boolean)))), [safeBooks]);
  const allLangs = useMemo(() => Array.from(new Set(safeBooks.map((b: any) => b.language).filter(Boolean))), [safeBooks]);
  const allFormats = useMemo(() => Array.from(new Set(safeBooks.map((b: any) => b.format).filter(Boolean))), [safeBooks]);
  const allSubjects = useMemo(() => Array.from(new Set(safeBooks.flatMap((b: any) => b.subjects || []).filter(Boolean))), [safeBooks]);

  const years = useMemo(() => safeBooks.map((b: any) => b.year).filter((y: any) => typeof y === "number"), [safeBooks]);
  const minYear = years.length ? Math.min(...years) : 1900;
  const maxYear = years.length ? Math.max(...years) : new Date().getFullYear();

  const defaultFilters = { libs: [] as string[], statuses: [] as string[], langs: [] as string[], formats: [] as string[], subjects: [] as string[], year: [minYear, maxYear] as [number, number] };
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => { if (initFilters) setFilters((prev) => ({ ...prev, ...initFilters }) as typeof prev); }, [initFilters]);
  useEffect(() => { setPage(1); }, [query, filters, layout, sortBy]);

  const toggle = (arr: string[], v: string) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const tokens = useMemo(() => typeof query === "string" ? tokenize(query) : tokenize(query?.rows?.map((r: any) => r.term).join(" ") || ""), [query]);
  const predicate = useMemo(() => makePredicateFromQuery(query, tokens), [query, tokens]);

  const filtered = useMemo(() => {
    return safeBooks
      .filter((b: any) => {
        if (!predicate(b)) return false;
        if (filters.libs.length && !(b.availability || []).some((a: any) => filters.libs.includes(a.lib))) return false;
        if (filters.statuses.length && !(b.availability || []).some((a: any) => filters.statuses.includes(a.status))) return false;
        if (filters.langs.length && !filters.langs.includes(b.language)) return false;
        if (filters.formats.length && !filters.formats.includes(b.format)) return false;
        if (filters.subjects.length && !(b.subjects || []).some((s: string) => filters.subjects.includes(s))) return false;
        if (b.year < filters.year[0] || b.year > filters.year[1]) return false;
        return true;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "year") return b.year - a.year;
        if (sortBy === "available") {
          const avA = hasAvailable(a) ? 1 : 0;
          const avB = hasAvailable(b) ? 1 : 0;
          if (avB !== avA) return avB - avA;
          return a.title.localeCompare(b.title, "zh-Hant");
        }
        const sa = relevanceScore(a, tokens);
        const sb = relevanceScore(b, tokens);
        if (sb !== sa) return sb - sa;
        return a.title.localeCompare(b.title, "zh-Hant");
      });
  }, [safeBooks, tokens, filters, sortBy, predicate]);

  const pageSize = layout === "grid" ? 8 : 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const YearSlider = () => (
    <div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>出版年：{filters.year[0]} – {filters.year[1]}</span>
        <button className="text-blue-600" onClick={() => setFilters({ ...filters, year: [minYear, maxYear] })}>重設</button>
      </div>
      <div className="mt-2 space-y-2">
        <input type="range" min={minYear} max={maxYear} value={filters.year[0]} className="w-full"
          onChange={(e) => { const v = Math.min(Number(e.target.value), filters.year[1]); setFilters({ ...filters, year: [v, filters.year[1]] as any }); }} />
        <input type="range" min={minYear} max={maxYear} value={filters.year[1]} className="w-full"
          onChange={(e) => { const v = Math.max(Number(e.target.value), filters.year[0]); setFilters({ ...filters, year: [filters.year[0], v] as any }); }} />
      </div>
    </div>
  );

  const FilterPanel = (
    <div className="border border-gray-200 rounded-2xl p-4 bg-white max-h-[70vh] overflow-auto">
      <h3 className="font-semibold mb-3">篩選</h3>
      <div className="space-y-5 text-sm">
        <div>
          <div className="text-gray-600 mb-2">館別（多選）</div>
          <div className="space-y-2">
            {allLibs.map((l) => (
              <label key={l} className="flex items-center gap-2">
                <input type="checkbox" checked={filters.libs.includes(l)} onChange={() => setFilters({ ...filters, libs: toggle(filters.libs, l) })} />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-gray-600 mb-2">可借狀態</div>
          <div className="grid grid-cols-2 gap-2">
            {["Available", "On shelf", "On hold", "Checked out"].map((s) => (
              <label key={s} className="flex items-center gap-2">
                <input type="checkbox" checked={filters.statuses.includes(s)} onChange={() => setFilters({ ...filters, statuses: toggle(filters.statuses, s) })} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-gray-600 mb-2">語言</div>
          <div className="grid grid-cols-2 gap-2">
            {allLangs.map((l) => (
              <label key={l} className="flex items-center gap-2">
                <input type="checkbox" checked={filters.langs.includes(l)} onChange={() => setFilters({ ...filters, langs: toggle(filters.langs, l) })} />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-gray-600 mb-2">主題</div>
          <div className="flex flex-wrap gap-2">
            {allSubjects.map((s) => (
              <button key={s} onClick={() => setFilters({ ...filters, subjects: toggle(filters.subjects, s) })}
                className={classNames("px-2 py-1 rounded-xl border", filters.subjects.includes(s) ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700")}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <YearSlider />
        <div>
          <div className="text-gray-600 mb-2">格式</div>
          <div className="grid grid-cols-3 gap-2">
            {["紙本", "eBook", "有聲書", ...Array.from(new Set(allFormats.filter((f) => !["紙本", "eBook", "有聲書"].includes(f))))].map((f) => (
              <label key={f} className="flex items-center gap-2">
                <input type="checkbox" checked={filters.formats.includes(f)} onChange={() => setFilters({ ...filters, formats: toggle(filters.formats, f) })} />
                <span>{f}</span>
              </label>
            ))}
          </div>
        </div>
        <Button variant="secondary" className="w-full" onClick={() => setFilters(defaultFilters)}>清除條件</Button>
      </div>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <SearchStrip size="md" onSearch={onNewSearch} onAdvanced={goAdvanced} />
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button className="lg:hidden inline-flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white" onClick={() => setShowFiltersMobile(true)}>
            <IconSliders className="w-4 h-4" /> 篩選
          </button>
          <p className="text-sm text-gray-600">共 {filtered.length} 筆結果</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">排序</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white">
            <option value="relevance">相關性</option>
            <option value="year">出版年</option>
            <option value="available">可借優先</option>
          </select>
          <Button variant={layout === "grid" ? "primary" : "secondary"} size="sm" onClick={() => setLayout("grid")}>卡片</Button>
          <Button variant={layout === "list" ? "primary" : "secondary"} size="sm" onClick={() => setLayout("list")}>清單</Button>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-6">
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 self-start">{FilterPanel}</aside>
        <section className="flex-1 min-w-0">
          <div className={classNames("", layout === "grid" ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3")}>
            {pageItems.length === 0 && (
              <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-600">
                沒有符合的結果，試試其他關鍵字或調整篩選。
              </div>
            )}
            {pageItems.map((b: any) =>
              layout === "grid" ? (
                <BookCard key={b.id} book={b} onOpen={onOpenBook} />
              ) : (
                <div key={b.id} className="border border-gray-200 rounded-2xl p-4 flex gap-4 bg-white">
                  <img src={b.cover} alt="cover" className="w-20 h-28 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold line-clamp-1">{b.title}</div>
                    <div className="text-sm text-gray-600">{b.author} ・ {b.year} ・ {b.language} ・ {b.format}</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(b.subjects || []).map((s: string) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-xl">{s}</span>
                      ))}
                    </div>
                    <div className="mt-2"><AvailabilityBadge status={b.availability?.[0]?.status || "Available"} /></div>
                  </div>
                  <div className="flex items-center"><Button onClick={() => onOpenBook(b)}>詳情</Button></div>
                </div>
              ),
            )}
          </div>
          {filtered.length > pageSize && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>上一頁</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className={classNames("px-3 py-2 rounded-xl text-sm border", n === page ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50")}>
                  {n}
                </button>
              ))}
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>下一頁</Button>
            </div>
          )}
        </section>
      </div>

      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 bg-black/30" role="dialog" aria-modal="true" onClick={() => setShowFiltersMobile(false)}>
          <div className="absolute bottom-0 inset-x-0 bg-white p-4 rounded-t-2xl max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">篩選</div>
              <button onClick={() => setShowFiltersMobile(false)} className="p-2"><IconX className="w-5 h-5" /></button>
            </div>
            <div className="mt-3">{FilterPanel}</div>
            <div className="mt-3 flex gap-2">
              <Button className="flex-1" onClick={() => setShowFiltersMobile(false)}>套用</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setFilters(defaultFilters)}>重設</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
