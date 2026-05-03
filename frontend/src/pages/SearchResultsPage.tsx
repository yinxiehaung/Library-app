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

  // 🛡️ 第一道防線：確保 books 永遠是陣列
  const safeBooks = Array.isArray(books) ? books : [];

  // 🛡️ 第二道防線：修正導致崩潰的 allLibs 計算
  // 爬蟲資料的 availability 是字串，傳統資料是陣列，這裡做相容性提取
  const allLibs = useMemo(() => {
    const libs = safeBooks.flatMap((b: any) => {
      if (Array.isArray(b.availability)) {
        return b.availability.map((a: any) => a.lib);
      }
      // 如果是爬蟲回傳的字串，統一歸類到東華圖書館
      if (typeof b.availability === "string") return ["東華大學圖書館"];
      return [];
    });
    return Array.from(new Set(libs.filter(Boolean)));
  }, [safeBooks]);

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

        // 🛡️ 篩選邏輯修正：相容 availability 的陣列與字串格式
        const bLibs = Array.isArray(b.availability) 
          ? b.availability.map((a: any) => a.lib) 
          : (typeof b.availability === "string" ? ["東華大學圖書館"] : []);
        
        if (filters.libs.length && !filters.libs.some(l => bLibs.includes(l))) return false;
        
        // 狀態篩選處理
        if (filters.statuses.length) {
          const isAvail = typeof b.availability === "string" 
            ? b.availability.includes("可借閱") 
            : (b.availability || []).some((a: any) => a.status === "Available" || a.status === "On shelf");
          
          if (filters.statuses.includes("Available") && !isAvail) return false;
        }

        if (filters.langs.length && !filters.langs.includes(b.language)) return false;
        if (filters.formats.length && !filters.formats.includes(b.format)) return false;
        if (filters.subjects.length && !(b.subjects || []).some((s: string) => filters.subjects.includes(s))) return false;
        if (b.year < filters.year[0] || b.year > filters.year[1]) return false;
        return true;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "year") return (b.year || 0) - (a.year || 0);
        if (sortBy === "available") {
          const avA = hasAvailable(a) ? 1 : 0;
          const avB = hasAvailable(b) ? 1 : 0;
          if (avB !== avA) return avB - avA;
        }
        const sa = relevanceScore(a, tokens);
        const sb = relevanceScore(b, tokens);
        if (sb !== sa) return sb - sa;
        return (a.title || "").localeCompare(b.title || "", "zh-Hant");
      });
  }, [safeBooks, tokens, filters, sortBy, predicate]);

  const pageSize = layout === "grid" ? 8 : 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const YearSlider = () => (
    <div className="py-2">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>出版年：{filters.year[0]} – {filters.year[1]}</span>
        <button className="text-blue-600 text-xs" onClick={() => setFilters({ ...filters, year: [minYear, maxYear] })}>重設</button>
      </div>
      <div className="space-y-3 px-1">
        <input type="range" min={minYear} max={maxYear} value={filters.year[0]} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          onChange={(e) => { const v = Math.min(Number(e.target.value), filters.year[1]); setFilters({ ...filters, year: [v, filters.year[1]] as any }); }} />
        <input type="range" min={minYear} max={maxYear} value={filters.year[1]} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          onChange={(e) => { const v = Math.max(Number(e.target.value), filters.year[0]); setFilters({ ...filters, year: [filters.year[0], v] as any }); }} />
      </div>
    </div>
  );

  const FilterPanel = (
    <div className="border border-gray-200 rounded-2xl p-4 bg-white max-h-[75vh] overflow-auto shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <IconSliders className="w-4 h-4" /> 篩選條件
      </h3>
      <div className="space-y-6 text-sm">
        {allLibs.length > 0 && (
          <div>
            <div className="font-medium text-gray-700 mb-2">館別</div>
            <div className="space-y-2">
              {allLibs.map((l) => (
                <label key={l} className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={filters.libs.includes(l)} onChange={() => setFilters({ ...filters, libs: toggle(filters.libs, l) })} />
                  <span>{l}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <div className="font-medium text-gray-700 mb-2">語言</div>
          <div className="grid grid-cols-1 gap-2">
            {allLangs.map((l) => (
              <label key={l} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" checked={filters.langs.includes(l)} onChange={() => setFilters({ ...filters, langs: toggle(filters.langs, l) })} />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </div>

        <YearSlider />

        <Button variant="secondary" className="w-full mt-4" onClick={() => setFilters(defaultFilters)}>重設所有條件</Button>
      </div>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <SearchStrip size="md" onSearch={onNewSearch} onAdvanced={goAdvanced} />
      
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="lg:hidden inline-flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 bg-white shadow-sm" onClick={() => setShowFiltersMobile(true)}>
            <IconSliders className="w-4 h-4" /> 篩選
          </button>
          <p className="text-sm font-medium text-gray-500">找到 <span className="text-blue-600">{filtered.length}</span> 筆結果</p>
        </div>

        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="relevance">相關性</option>
            <option value="year">出版年 (新→舊)</option>
            <option value="available">可借閱優先</option>
          </select>
          <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>
          <Button variant={layout === "grid" ? "default" : "secondary"} size="sm" onClick={() => setLayout("grid")}>網格</Button>
          <Button variant={layout === "list" ? "default" : "secondary"} size="sm" onClick={() => setLayout("list")}>列表</Button>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-8">
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">{FilterPanel}</aside>
        
        <section className="flex-1 min-w-0">
          <div className={classNames("", layout === "grid" ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4")}>
            {pageItems.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                <div className="text-gray-400 mb-2 text-lg">找不到符合條件的書籍</div>
                <p className="text-sm text-gray-500">嘗試更換關鍵字或清除篩選條件</p>
              </div>
            )}
            
            {pageItems.map((b: any) =>
              layout === "grid" ? (
                <BookCard key={b.id} book={b} onOpen={onOpenBook} />
              ) : (
                <div key={b.id} className="group border border-gray-200 rounded-2xl p-4 flex gap-6 bg-white hover:shadow-lg hover:border-blue-200 transition-all">
                  <div className="relative shrink-0 cursor-pointer" onClick={() => onOpenBook(b)}>
                    <img src={b.cover || "/api/placeholder/400/600"} alt={b.title} className="w-24 h-36 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1 cursor-pointer hover:text-blue-600" onClick={() => onOpenBook(b)}>{b.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{b.author} {b.year ? `・ ${b.year}` : ""}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Array.isArray(b.subjects) && b.subjects.slice(0, 3).map((s: string) => (
                          <span key={s} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">#{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <AvailabilityBadge status={
                        typeof b.availability === 'string' 
                          ? (b.availability.includes("可借閱") ? "Available" : "Checked out")
                          : (b.availability?.[0]?.status || "Available")
                      } />
                      <Button size="sm" onClick={() => onOpenBook(b)}>查看詳情</Button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* 分頁控制 */}
          {filtered.length > pageSize && (
            <div className="mt-10 flex items-center justify-center gap-1">
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>上一頁</Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                  // 只顯示當前頁碼附近的頁數，避免頁碼過多
                  if (n === 1 || n === totalPages || (n >= page - 1 && n <= page + 1)) {
                    return (
                      <button key={n} onClick={() => setPage(n)}
                        className={classNames("w-10 h-10 rounded-xl text-sm font-medium transition-colors", n === page ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")}>
                        {n}
                      </button>
                    );
                  }
                  if (n === page - 2 || n === page + 2) return <span key={n} className="px-1 text-gray-400">...</span>;
                  return null;
                })}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>下一頁</Button>
            </div>
          )}
        </section>
      </div>

      {/* 手機版篩選 Drawer */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" onClick={() => setShowFiltersMobile(false)}>
          <div className="absolute bottom-0 inset-x-0 bg-white p-6 rounded-t-[2.5rem] max-h-[85vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="text-xl font-bold">進階篩選</div>
              <button onClick={() => setShowFiltersMobile(false)} className="p-2 bg-gray-100 rounded-full"><IconX className="w-5 h-5" /></button>
            </div>
            {FilterPanel}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button variant="secondary" className="h-12 rounded-2xl" onClick={() => { setFilters(defaultFilters); setShowFiltersMobile(false); }}>全部重設</Button>
              <Button className="h-12 rounded-2xl" onClick={() => setShowFiltersMobile(false)}>套用結果</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
