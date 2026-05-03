import { useState } from "react";
import { Button } from "../components/ui/Button";
import { IconSearch } from "../components/icons";
import { FIELD_OPTIONS } from "../components/SearchStrip";

export function AdvancedSearchPage({ books, onSearch, onCancel }: {
  books: any[];
  onSearch: (q: any, filters: any) => void;
  onCancel: () => void;
}) {
  const [rows, setRows] = useState([{ field: "any", term: "", op: "AND" }]);
  const [lang, setLang] = useState("");
  const [type, setType] = useState("");
  const [lib, setLib] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  const years = (books || []).map((b) => b.year).filter((y) => typeof y === "number");
  const minYear = years.length ? Math.min(...years) : 1900;
  const maxYear = years.length ? Math.max(...years) : new Date().getFullYear();

  const allLangs = Array.from(new Set((books || []).map((b) => b.language).filter(Boolean)));
  const allFormats = Array.from(new Set((books || []).map((b) => b.format).filter(Boolean)));
  const allLibs = Array.from(new Set((books || []).flatMap((b) => (b.availability || []).map((a: any) => a.lib).filter(Boolean))));

  const addRow = () => setRows((rs) => [...rs, { field: "any", term: "", op: "AND" }]);
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));
  const clearAll = () => { setRows([{ field: "any", term: "", op: "AND" }]); setLang(""); setType(""); setLib(""); setYearFrom(""); setYearTo(""); };

  const submit = () => {
    const qrows = rows.filter((r) => r.term.trim().length > 0);
    const combinedTerm = qrows.map((r) => r.term).join(" ");
    onSearch?.({ isExternal: true, term: combinedTerm, pages: 3, filters: { lang, type, lib, yearRange: [yearFrom, yearTo] } }, null);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold">進階查詢</h1>
      <div className="mt-4 border border-gray-200 rounded-2xl bg-white p-4">
        {rows.map((r, i) => (
          <div key={i} className="flex items-stretch gap-3 mb-3">
            {i > 0 && (
              <select
                className="rounded-2xl border border-gray-300 bg-white px-3 h-12"
                value={r.op}
                onChange={(e) => setRows((rs) => rs.map((x, idx) => idx === i ? { ...x, op: e.target.value } : x))}
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
                <option value="NOT">NOT</option>
              </select>
            )}
            <input
              className="flex-1 rounded-2xl border border-gray-300 h-12 px-4"
              placeholder="請輸入查詢詞"
              value={r.term}
              onChange={(e) => setRows((rs) => rs.map((x, idx) => idx === i ? { ...x, term: e.target.value } : x))}
            />
            <select
              className="rounded-2xl border border-gray-300 bg-white px-3 h-12"
              value={r.field}
              onChange={(e) => setRows((rs) => rs.map((x, idx) => idx === i ? { ...x, field: e.target.value } : x))}
            >
              {FIELD_OPTIONS.map((f) => <option key={f.k} value={f.k}>{f.label}</option>)}
            </select>
            {rows.length > 1 && <Button variant="secondary" onClick={() => removeRow(i)}>削除</Button>}
            {i === rows.length - 1 && <Button variant="secondary" onClick={addRow}>＋</Button>}
          </div>
        ))}

        <div className="mt-6 rounded-2xl bg-orange-50 p-4">
          <div className="font-medium mb-3">縮小查詢範圍</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">語言</div>
              <select className="w-full rounded-2xl border border-gray-300 h-10 px-3 bg-white" value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="">請選擇</option>
                {allLangs.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">資料類型</div>
              <select className="w-full rounded-2xl border border-gray-300 h-10 px-3 bg-white" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">請選擇</option>
                {allFormats.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">館別</div>
              <select className="w-full rounded-2xl border border-gray-300 h-10 px-3 bg-white" value={lib} onChange={(e) => setLib(e.target.value)}>
                <option value="">全部</option>
                {allLibs.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div>
                <div className="text-sm text-gray-600 mb-1">出版年（起）</div>
                <input type="number" className="w-full rounded-2xl border border-gray-300 h-10 px-3" placeholder={String(minYear)} value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} />
              </div>
              <div className="text-center text-gray-500 mt-6">至</div>
              <div>
                <div className="text-sm text-gray-600 mb-1">出版年（迄）</div>
                <input type="number" className="w-full rounded-2xl border border-gray-300 h-10 px-3" placeholder={String(maxYear)} value={yearTo} onChange={(e) => setYearTo(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button variant="accent" onClick={submit}>
            <span className="inline-flex items-center gap-2"><IconSearch className="w-5 h-5" />查詢</span>
          </Button>
          <Button variant="secondary" onClick={clearAll}>清除</Button>
          <Button variant="ghost" onClick={onCancel}>返回</Button>
        </div>
      </div>
    </main>
  );
}
