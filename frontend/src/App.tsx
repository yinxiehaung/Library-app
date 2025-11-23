import React, { useMemo, useState, useEffect } from "react";

/**
 * Hualien United Libraries — OPAC (Frontend)
 * 僅讀者端：基本/進階查詢、結果、詳情、預約、帳戶（無任何後台入口/邏輯）。
 * 初期以 SEED_BOOKS + localStorage 模擬；正式環境改為呼叫後端 Library-app API。
 */

// 後端 API Base URL（可以在 Vite 用 VITE_API_BASE_URL 覆寫）
const API_BASE_URL = "/api";

// Auth（僅會員；無管理員與後台導向）
const USER_KEY = "hul.user";
// 瀏覽紀錄：用來做推薦
const VIEWS_KEY = "hul.views";

// ------------------------------
// Seed DATA（可由 API 取代；示範用）
// ------------------------------
const SEED_BOOKS = [
  {
    id: "bk-001",
    title: "小王子 (The Little Prince)",
    author: "Antoine de Saint-Exupéry",
    isbn: "9789861897280",
    year: 1943,
    language: "繁體中文",
    format: "紙本",
    cover: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400",
    subjects: ["童話", "哲思"],
    description:
      "一位飛行員與來自小行星B-612的小王子的邂逅，關於孤獨、愛與理解。",
    availability: [
      {
        lib: "花蓮總館",
        callno: "882.6 S137",
        floor: "3F A區",
        status: "Available",
        due: null,
      },
      {
        lib: "吉安分館",
        callno: "882.6 S137",
        floor: "2F B區",
        status: "On hold",
        due: "2025-11-05",
      },
      {
        lib: "新城分館",
        callno: "882.6 S137",
        floor: "1F C區",
        status: "Checked out",
        due: "2025-11-12",
      },
    ],
  },
  {
    id: "bk-002",
    title: "解憂雜貨店",
    author: "東野圭吾",
    isbn: "9789863476537",
    year: 2011,
    language: "繁體中文",
    format: "紙本",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400",
    subjects: ["推理", "療癒"],
    description: "寫信到雜貨店的人們，收到了改變人生的回信。",
    availability: [
      {
        lib: "花蓮總館",
        callno: "861.57 H553",
        floor: "4F C區",
        status: "On shelf",
        due: null,
      },
      {
        lib: "壽豐分館",
        callno: "861.57 H553",
        floor: "2F A區",
        status: "Available",
        due: null,
      },
    ],
  },
  {
    id: "bk-003",
    title: "三體",
    author: "劉慈欣",
    isbn: "9789863479101",
    year: 2008,
    language: "繁體中文",
    format: "紙本",
    cover: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400",
    subjects: ["科幻", "宇宙"],
    description: "人類文明在宇宙尺度下的命運與抉擇。",
    availability: [
      {
        lib: "花蓮總館",
        callno: "857.7 L72",
        floor: "3F S區",
        status: "Available",
        due: null,
      },
    ],
  },
  {
    id: "bk-004",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    year: 2008,
    language: "English",
    format: "eBook",
    cover: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=400",
    subjects: ["Programming", "Software"],
    description: "A handbook of agile software craftsmanship.",
    availability: [
      {
        lib: "花蓮總館",
        callno: "005.1 M379",
        floor: "5F IT區",
        status: "Available",
        due: null,
      },
    ],
  },
  {
    id: "bk-005",
    title: "挪威的森林 (Norwegian Wood)",
    author: "村上春樹",
    isbn: "9789861735148",
    year: 1987,
    language: "繁體中文",
    format: "有聲書",
    cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
    subjects: ["文學", "青春"],
    description: "青春、愛與失落的故事。",
    availability: [
      {
        lib: "吉安分館",
        callno: "861.57 M123",
        floor: "2F 文學區",
        status: "On hold",
        due: "2025-11-01",
      },
      {
        lib: "壽豐分館",
        callno: "861.57 M123",
        floor: "2F 文學區",
        status: "Available",
        due: null,
      },
    ],
  },
];

// ------------------------------
// Utilities
// ------------------------------
const classNames = (...xs) => xs.filter(Boolean).join(" ");
const formatDate = (s) => (s ? new Date(s).toLocaleDateString() : "—");

// 可借判斷
const hasAvailable = (b) =>
  (b.availability || []).some(
    (a) => a.status === "Available" || a.status === "On shelf"
  );

// ------------------------------
// Icons (inline SVG)
// ------------------------------
const IconSearch = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="11" cy="11" r="7" strokeWidth="2" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
  </svg>
);
const IconChevronRight = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <polyline points="9 18 15 12 9 6" strokeWidth="2" />
  </svg>
);
const IconX = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
    <line
      x1="6"
      y1="6"
      x2="18"
      y2="6"
      strokeWidth="2"
      transform="rotate(90 12 12)"
    />
  </svg>
);
const IconSliders = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <line x1="4" y1="21" x2="4" y2="14" strokeWidth="2" />
    <line x1="4" y1="10" x2="4" y2="3" strokeWidth="2" />
    <line x1="12" y1="21" x2="12" y2="12" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="3" strokeWidth="2" />
    <line x1="20" y1="21" x2="20" y2="16" strokeWidth="2" />
    <line x1="20" y1="12" x2="20" y2="3" strokeWidth="2" />
    <line x1="1" y1="14" x2="7" y2="14" strokeWidth="2" />
    <line x1="9" y1="8" x2="15" y2="8" strokeWidth="2" />
    <line x1="17" y1="16" x2="23" y2="16" strokeWidth="2" />
  </svg>
);

// ------------------------------
// Core UI atoms
// ------------------------------
function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition";
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
    secondary:
      "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400",
    ghost:
      "bg-transparent text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-600",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
    accent:
      "bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-500",
  };
  return (
    <button
      className={classNames(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-gray-100 text-gray-700 border border-gray-200",
    success: "bg-green-100 text-green-800 border border-green-200",
    warn: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    danger: "bg-red-100 text-red-800 border border-red-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200",
  };
  return (
    <span
      className={classNames(
        "inline-flex items-center px-2 py-1 rounded-xl text-xs",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

function AvailabilityBadge({ status }) {
  switch (status) {
    case "Available":
    case "On shelf":
      return <Badge tone="success">可借 / On shelf</Badge>;
    case "On hold":
      return <Badge tone="warn">預約中 / On hold</Badge>;
    case "Checked out":
      return <Badge tone="danger">借出中 / Checked out</Badge>;
    default:
      return <Badge>未知</Badge>;
  }
}

// ------------------------------
// Common components
// ------------------------------
function SearchField({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = "輸入書名、作者或主題",
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="relative w-full"
      role="search"
      aria-label="全域搜尋"
    >
      <div className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600">
        <IconSearch className="w-5 h-5 text-gray-500" aria-hidden />
        <input
          className="flex-1 bg-transparent outline-none text-sm"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {value && (
          <button
            type="button"
            aria-label="清除搜尋"
            onClick={onClear}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <IconX className="w-4 h-4 text-gray-500" />
          </button>
        )}
        <Button type="submit" size="sm">
          搜尋
        </Button>
      </div>
    </form>
  );
}

function BookCard({ book, onOpen }) {
  return (
    <div className="group border border-gray-200 rounded-3xl overflow-hidden bg-white hover:shadow-sm transition relative">
      <div className="aspect-[2/3] w-full bg-gray-100 overflow-hidden">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="text-base font-semibold line-clamp-2" title={book.title}>
          {book.title}
        </div>
        <div className="text-sm text-gray-600 line-clamp-1">{book.author}</div>
        <div className="flex flex-wrap gap-2 mt-1">
          {(book.subjects || []).slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-xl"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div>
            <AvailabilityBadge
              status={book.availability?.[0]?.status || "Available"}
            />
          </div>
          <Button size="sm" variant="ghost" className="group-hover:translate-x-0.5">
            詳情
            <IconChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <button
          onClick={() => onOpen?.(book)}
          className="absolute inset-0"
          aria-label={`開啟 ${book.title} 詳情`}
        />
      </div>
    </div>
  );
}

function Table({ columns, rows, rowKey }) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-2xl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="text-left font-medium px-4 py-3 whitespace-nowrap"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={rowKey ? r[rowKey] : JSON.stringify(r)}
              className="border-t border-gray-100"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className="px-4 py-3 align-top whitespace-nowrap"
                >
                  {c.cell ? c.cell(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stepper({ steps, current }) {
  return (
    <ol className="flex items-center gap-4" aria-label="流程步驟">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={classNames(
              "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
              i < current
                ? "bg-blue-600 text-white"
                : i === current
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-500"
            )}
          >
            {i + 1}
          </span>
          <span
            className={classNames(
              "text-sm",
              i === current ? "text-blue-700 font-medium" : "text-gray-600"
            )}
          >
            {s}
          </span>
          {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200" />}
        </li>
      ))}
    </ol>
  );
}

// ------------------------------
// Layout（Navbar：不顯示任何管理入口）
// ------------------------------
function Navbar({
  navSearch,
  setNavSearch,
  onSubmit,
  goHome,
  onOpenAccount,
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <button
          onClick={goHome}
          className="flex items-center gap-2 font-bold text-gray-900"
        >
          <span className="inline-flex w-8 h-8 rounded-xl bg-blue-600 text-white items-center justify-center">
            HL
          </span>
          <span className="hidden sm:block">Hualien United Libraries</span>
        </button>
        <div className="flex-1" />
        <div className="w-full max-w-xl">
          <SearchField
            value={navSearch}
            onChange={setNavSearch}
            onClear={() => setNavSearch("")}
            onSubmit={() => onSubmit?.(navSearch)}
          />
        </div>
        <div className="flex-1 hidden md:block" />
        <Button variant="secondary" size="sm" onClick={onOpenAccount}>
          我的帳戶
        </Button>
      </div>
    </header>
  );
}

// ------------------------------
// Basic/Advanced search components
// ------------------------------
const FIELD_OPTIONS = [
  { k: "any", label: "不限欄位" },
  { k: "title", label: "書名" },
  { k: "author", label: "作者" },
  { k: "subject", label: "主題" },
  { k: "isbn", label: "ISBN" },
];
const MODE_OPTIONS = [
  { k: "exact", label: "精確" },
  { k: "fuzzy", label: "模糊" },
];

function SearchStrip({ size = "lg", onSearch, onAdvanced }) {
  const [term, setTerm] = useState("");
  const [field, setField] = useState("any");
  const [mode, setMode] = useState("exact");
  const submit = (e) => {
    e?.preventDefault();
    onSearch?.({ rows: [{ field, term }], mode });
  };
  return (
    <div
      className={classNames(
        "rounded-3xl border bg-white/90 backdrop-blur p-4",
        size === "lg" ? "p-6" : "p-4"
      )}
    >
      <form className="flex gap-3 items-stretch" onSubmit={submit}>
        <input
          className={classNames(
            "flex-1 rounded-2xl border border-gray-300 px-4 outline-none",
            size === "lg" ? "h-12 text-base" : "h-10 text-sm"
          )}
          placeholder="請輸入檢索詞查詢全部館藏"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <select
          className={classNames(
            "rounded-2xl border border-gray-300 bg-white px-3",
            size === "lg" ? "h-12 text-base" : "h-10 text-sm"
          )}
          value={field}
          onChange={(e) => setField(e.target.value)}
        >
          {FIELD_OPTIONS.map((f) => (
            <option key={f.k} value={f.k}>
              {f.label}
            </option>
          ))}
        </select>
        <Button
          variant="accent"
          size={size === "lg" ? "lg" : "md"}
          type="submit"
          className={size === "lg" ? "px-6" : "px-4"}
        >
          <span className="inline-flex items-center gap-2">
            <IconSearch className="w-5 h-5" />
            查詢
          </span>
        </Button>
        <Button
          variant="secondary"
          size={size === "lg" ? "lg" : "md"}
          type="button"
          onClick={() => onAdvanced?.()}
        >
          進階查詢
        </Button>
      </form>
      <div className="mt-3 flex items-center gap-5 text-sm">
        <span className="text-gray-600">查詢模式：</span>
        <div className="flex items-center gap-4">
          {MODE_OPTIONS.map((m) => (
            <label key={m.k} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value={m.k}
                checked={mode === m.k}
                onChange={() => setMode(m.k)}
              />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdvancedSearchPage({ books, onSearch, onCancel }) {
  const [rows, setRows] = useState([{ field: "any", term: "", op: "AND" }]);
  const [mode, setMode] = useState("exact");
  const addRow = () =>
    setRows((rs) => [...rs, { field: "any", term: "", op: "AND" }]);
  const removeRow = (i) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  // 縮小查詢範圍
  const [lang, setLang] = useState("");
  const [type, setType] = useState("");
  const [lib, setLib] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  const years = (books || [])
    .map((b) => b.year)
    .filter((y) => typeof y === "number");
  const minYear = years.length ? Math.min(...years) : 1900;
  const maxYear = years.length
    ? Math.max(...years)
    : new Date().getFullYear();

  const allLangs = Array.from(
    new Set((books || []).map((b) => b.language).filter(Boolean))
  );
  const allFormats = Array.from(
    new Set((books || []).map((b) => b.format).filter(Boolean))
  );
  const allLibs = Array.from(
    new Set(
      (books || []).flatMap((b) =>
        (b.availability || []).map((a) => a.lib).filter(Boolean)
      )
    )
  );

  const clearAll = () => {
    setRows([{ field: "any", term: "", op: "AND" }]);
    setMode("exact");
    setLang("");
    setType("");
    setLib("");
    setYearFrom("");
    setYearTo("");
  };

  const submit = () => {
    const qrows = rows.filter((r) => r.term.trim().length > 0);
    const q = { rows: qrows.length ? qrows : [{ field: "any", term: "" }], mode };
    const initFilters = {
      langs: lang ? [lang] : [],
      formats: type ? [type] : [],
      libs: lib ? [lib] : [],
      year: [
        yearFrom ? Number(yearFrom) : minYear,
        yearTo ? Number(yearTo) : maxYear,
      ],
      statuses: [],
      subjects: [],
    };
    onSearch?.(q, initFilters);
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
                onChange={(e) =>
                  setRows((rs) =>
                    rs.map((x, idx) =>
                      idx === i ? { ...x, op: e.target.value } : x
                    )
                  )
                }
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
              onChange={(e) =>
                setRows((rs) =>
                  rs.map((x, idx) =>
                    idx === i ? { ...x, term: e.target.value } : x
                  )
                )
              }
            />
            <select
              className="rounded-2xl border border-gray-300 bg-white px-3 h-12"
              value={r.field}
              onChange={(e) =>
                setRows((rs) =>
                  rs.map((x, idx) =>
                    idx === i ? { ...x, field: e.target.value } : x
                  )
                )
              }
            >
              {FIELD_OPTIONS.map((f) => (
                <option key={f.k} value={f.k}>
                  {f.label}
                </option>
              ))}
            </select>
            {rows.length > 1 && (
              <Button variant="secondary" onClick={() => removeRow(i)}>
                削除
              </Button>
            )}
            {i === rows.length - 1 && (
              <Button variant="secondary" onClick={addRow}>
                ＋
              </Button>
            )}
          </div>
        ))}

        <div className="mt-2 flex items-center gap-5 text-sm">
          <span className="text-gray-600">查詢模式：</span>
          <div className="flex items-center gap-4">
            {MODE_OPTIONS.map((m) => (
              <label key={m.k} className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="adv-mode"
                  value={m.k}
                  checked={mode === m.k}
                  onChange={() => setMode(m.k)}
                />
                <span>{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-orange-50 p-4">
          <div className="font-medium mb-3">縮小查詢範圍</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">語言</div>
              <select
                className="w-full rounded-2xl border border-gray-300 h-10 px-3 bg-white"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="">請選擇</option>
                {allLangs.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">資料類型</div>
              <select
                className="w-full rounded-2xl border border-gray-300 h-10 px-3 bg-white"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">請選擇</option>
                {allFormats.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">館別</div>
              <select
                className="w-full rounded-2xl border border-gray-300 h-10 px-3 bg-white"
                value={lib}
                onChange={(e) => setLib(e.target.value)}
              >
                <option value="">全部</option>
                {allLibs.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div>
                <div className="text-sm text-gray-600 mb-1">出版年（起）</div>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-gray-300 h-10 px-3"
                  placeholder={String(minYear)}
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                />
              </div>
              <div className="text-center text-gray-500 mt-6">至</div>
              <div>
                <div className="text-sm text-gray-600 mb-1">出版年（迄）</div>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-gray-300 h-10 px-3"
                  placeholder={String(maxYear)}
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button variant="accent" onClick={submit}>
            <span className="inline-flex items-center gap-2">
              <IconSearch className="w-5 h-5" />
              查詢
            </span>
          </Button>
          <Button variant="secondary" onClick={clearAll}>
            清除
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            返回
          </Button>
        </div>
      </div>
    </main>
  );
}

// ------------------------------
// Home Page（讀者端）
// ------------------------------
function HomePage({
  books,
  onPickTopic,
  onOpenBook,
  onBasicSearch,
  onOpenAdvanced,
  onOpenRecommend,
}) {
  const trending = Array.isArray(books) ? books : [];
  const topics = ["文學", "歷史", "科技", "心理", "藝術", "旅遊"];
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <SearchStrip
        size="lg"
        onSearch={onBasicSearch}
        onAdvanced={onOpenAdvanced}
      />
      <section className="mt-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6">
        <h2 className="text-xl font-semibold">快速主題</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => onPickTopic(t)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm backdrop-blur border border-white/20"
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">熱門書籍</h2>
          <Button variant="ghost">查看全部</Button>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {trending.map((b) => (
            <BookCard key={b.id} book={b} onOpen={onOpenBook} />
          ))}
        </div>

        {/* 推薦書按鈕：在熱門書籍下面 */}
        <div className="mt-4 flex justify-center">
          <Button variant="accent" size="md" onClick={onOpenRecommend}>
            為你推薦更多書籍
          </Button>
        </div>
      </section>
    </main>
  );
}

// --- Search helpers ---
function tokenize(q) {
  return q.trim().toLowerCase().split(/\s+/).filter(Boolean);
}
function relevanceScore(book, tokens) {
  if (!tokens.length) return 0;
  let score = 0;
  for (const t of tokens) {
    if (book.title.toLowerCase().includes(t)) score += 5;
    if (book.author.toLowerCase().includes(t)) score += 3;
    if ((book.subjects || []).some((s) => s.toLowerCase().includes(t))) score += 2;
  }
  return score;
}
function fieldText(book, field) {
  switch (field) {
    case "title":
      return book.title || "";
    case "author":
      return book.author || "";
    case "subject":
      return (book.subjects || []).join(" ");
    case "isbn":
      return book.isbn || "";
    default:
      return [
        book.title,
        book.author,
        (book.subjects || []).join(" "),
        book.isbn,
      ].join(" ");
  }
}
function matchTerm(text, term, mode) {
  const t = (text || "").toLowerCase();
  const q = (term || "").trim().toLowerCase();
  if (!q) return true;
  if (mode === "exact") return t.includes(q);
  const parts = q.split(/\s+/).filter(Boolean);
  return parts.some((p) => t.includes(p));
}
function matchRow(book, row, mode) {
  return matchTerm(fieldText(book, row.field), row.term, mode);
}
function makePredicateFromQuery(query, tokens) {
  if (!query || typeof query === "string") {
    return (b) => tokens.length === 0 || relevanceScore(b, tokens) > 0;
  }
  const rows = query.rows?.length ? query.rows : [{ field: "any", term: "" }];
  const mode = query.mode || "exact";
  return (b) => {
    let res = matchRow(b, rows[0], mode);
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const m = matchRow(b, r, mode);
      switch ((r.op || "AND").toUpperCase()) {
        case "OR":
          res = res || m;
          break;
        case "NOT":
          res = res && !m;
          break;
        default:
          res = res && m;
          break;
      }
    }
    return res;
  };
}

// 書籍相似度推薦（同作者 / 主題 / 語言 / 可借）
const getSimilarBooks = (book, books, limit = 8) => {
  if (!book || !Array.isArray(books)) return [];

  const pool = books.filter((b) => b.id !== book.id);

  const scored = pool
    .map((b) => {
      let score = 0;
      if (b.author === book.author) score += 5;
      const overlap = (b.subjects || []).filter((s) =>
        (book.subjects || []).includes(s)
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

  if (scored.length === 0) {
    return pool.slice(0, limit);
  }
  return scored;
};

// ------------------------------
// Search Results Page
// ------------------------------
function SearchResultsPage({
  books,
  query,
  initFilters,
  onOpenBook,
  onNewSearch,
  goAdvanced,
}) {
  const [layout, setLayout] = useState("grid");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [page, setPage] = useState(1);

  const safeBooks = Array.isArray(books) ? books : [];

  // Derived lists
  const allLibs = useMemo(
    () =>
      Array.from(
        new Set(
          safeBooks.flatMap((b) =>
            (b.availability || []).map((a) => a.lib).filter(Boolean)
          )
        )
      ),
    [safeBooks]
  );
  const allStatuses = ["Available", "On shelf", "On hold", "Checked out"];
  const allLangs = useMemo(
    () =>
      Array.from(
        new Set(safeBooks.map((b) => b.language).filter(Boolean))
      ),
    [safeBooks]
  );
  const allFormats = useMemo(
    () =>
      Array.from(
        new Set(safeBooks.map((b) => b.format).filter(Boolean))
      ),
    [safeBooks]
  );
  const allSubjects = useMemo(
    () =>
      Array.from(
        new Set(
          safeBooks.flatMap((b) => b.subjects || []).filter(Boolean)
        )
      ),
    [safeBooks]
  );

  const years = useMemo(
    () =>
      safeBooks
        .map((b) => b.year)
        .filter((y) => typeof y === "number"),
    [safeBooks]
  );
  const minYear = years.length ? Math.min(...years) : 1900;
  const maxYear = years.length
    ? Math.max(...years)
    : new Date().getFullYear();

  const defaultFilters = {
    libs: [],
    statuses: [],
    langs: [],
    formats: [],
    subjects: [],
    year: [minYear, maxYear],
  };
  const [filters, setFilters] = useState(defaultFilters);
  useEffect(() => {
    if (initFilters) setFilters((prev) => ({ ...prev, ...initFilters }));
  }, [initFilters]);
  useEffect(() => {
    setPage(1);
  }, [query, filters, layout, sortBy]);
  const toggle = (arr, v) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const tokens = useMemo(
    () =>
      typeof query === "string"
        ? tokenize(query)
        : tokenize(query?.rows?.map((r) => r.term).join(" ") || ""),
    [query]
  );
  const predicate = useMemo(
    () => makePredicateFromQuery(query, tokens),
    [query, tokens]
  );

  const filtered = useMemo(() => {
    return safeBooks
      .filter((b) => {
        if (!predicate(b)) return false;
        if (
          filters.libs.length &&
          !(b.availability || []).some((a) => filters.libs.includes(a.lib))
        )
          return false;
        if (
          filters.statuses.length &&
          !(b.availability || []).some((a) =>
            filters.statuses.includes(a.status)
          )
        )
          return false;
        if (filters.langs.length && !filters.langs.includes(b.language))
          return false;
        if (filters.formats.length && !filters.formats.includes(b.format))
          return false;
        if (
          filters.subjects.length &&
          !(b.subjects || []).some((s) => filters.subjects.includes(s))
        )
          return false;
        if (b.year < filters.year[0] || b.year > filters.year[1]) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "year") return b.year - a.year;
        if (sortBy === "available") {
          const avA = hasAvailable(a) ? 1 : 0;
          const avB = hasAvailable(b) ? 1 : 0;
          if (avB !== avA) return avB - avA; // 可借優先
          return a.title.localeCompare(b.title, "zh-Hant");
        }
        // relevance
        const sa = relevanceScore(a, tokens);
        const sb = relevanceScore(b, tokens);
        if (sb !== sa) return sb - sa; // 高分排前
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
        <span>
          出版年：{filters.year[0]} – {filters.year[1]}
        </span>
        <button
          className="text-blue-600"
          onClick={() =>
            setFilters({ ...filters, year: [minYear, maxYear] })
          }
        >
          重設
        </button>
      </div>
      <div className="mt-2 space-y-2">
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={filters.year[0]}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), filters.year[1]);
            setFilters({ ...filters, year: [v, filters.year[1]] });
          }}
          className="w-full"
        />
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={filters.year[1]}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), filters.year[0]);
            setFilters({ ...filters, year: [filters.year[0], v] });
          }}
          className="w-full"
        />
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
                <input
                  type="checkbox"
                  checked={filters.libs.includes(l)}
                  onChange={() =>
                    setFilters({
                      ...filters,
                      libs: toggle(filters.libs, l),
                    })
                  }
                />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-gray-600 mb-2">可借狀態</div>
          <div className="grid grid-cols-2 gap-2">
            {allStatuses.map((s) => (
              <label key={s} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.statuses.includes(s)}
                  onChange={() =>
                    setFilters({
                      ...filters,
                      statuses: toggle(filters.statuses, s),
                    })
                  }
                />
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
                <input
                  type="checkbox"
                  checked={filters.langs.includes(l)}
                  onChange={() =>
                    setFilters({
                      ...filters,
                      langs: toggle(filters.langs, l),
                    })
                  }
                />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-gray-600 mb-2">主題</div>
          <div className="flex flex-wrap gap-2">
            {allSubjects.map((s) => (
              <button
                key={s}
                onClick={() =>
                  setFilters({
                    ...filters,
                    subjects: toggle(filters.subjects, s),
                  })
                }
                className={classNames(
                  "px-2 py-1 rounded-xl border",
                  filters.subjects.includes(s)
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-200 text-gray-700"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <YearSlider />
        <div>
          <div className="text-gray-600 mb-2">格式</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              "紙本",
              "eBook",
              "有聲書",
              ...Array.from(
                new Set(safeBooks.map((b) => b.format).filter(Boolean))
              ).filter((f) => !["紙本", "eBook", "有聲書"].includes(f)),
            ].map((f) => (
              <label key={f} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.formats.includes(f)}
                  onChange={() =>
                    setFilters({
                      ...filters,
                      formats: toggle(filters.formats, f),
                    })
                  }
                />
                <span>{f}</span>
              </label>
            ))}
          </div>
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setFilters(defaultFilters)}
        >
          清除條件
        </Button>
      </div>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <SearchStrip size="md" onSearch={onNewSearch} onAdvanced={goAdvanced} />
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden inline-flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white"
            onClick={() => setShowFiltersMobile(true)}
          >
            <IconSliders className="w-4 h-4" /> 篩選
          </button>
          <p className="text-sm text-gray-600">
            共 {filtered.length} 筆結果
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">排序</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white"
          >
            <option value="relevance">相關性</option>
            <option value="year">出版年</option>
            <option value="available">可借優先</option>
          </select>
          <Button
            variant={layout === "grid" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setLayout("grid")}
          >
            卡片
          </Button>
          <Button
            variant={layout === "list" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setLayout("list")}
          >
            清單
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-6">
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 self-start">
          {FilterPanel}
        </aside>
        <section className="flex-1 min-w-0">
          <div
            className={classNames(
              "",
              layout === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-3"
            )}
          >
            {pageItems.length === 0 && (
              <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-600">
                沒有符合的結果，試試其他關鍵字或調整篩選。
              </div>
            )}
            {pageItems.map((b) =>
              layout === "grid" ? (
                <BookCard key={b.id} book={b} onOpen={onOpenBook} />
              ) : (
                <div
                  key={b.id}
                  className="border border-gray-200 rounded-2xl p-4 flex gap-4 bg-white"
                >
                  <img
                    src={b.cover}
                    alt="cover"
                    className="w-20 h-28 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold line-clamp-1">
                      {b.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {b.author} ・ {b.year} ・ {b.language} ・ {b.format}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(b.subjects || []).map((s) => (
                        <span
                          key={s}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-xl"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2">
                      <AvailabilityBadge
                        status={
                          b.availability?.[0]?.status || "Available"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button onClick={() => onOpenBook(b)}>詳情</Button>
                  </div>
                </div>
              )
            )}
          </div>
          {filtered.length > pageSize && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一頁
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={classNames(
                      "px-3 py-2 rounded-xl text-sm border",
                      n === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {n}
                  </button>
                )
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page === totalPages}
              >
                下一頁
              </Button>
            </div>
          )}
        </section>
      </div>
      {showFiltersMobile && (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowFiltersMobile(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-white p-4 rounded-t-2xl max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">篩選</div>
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="p-2"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3">{FilterPanel}</div>
            <div className="mt-3 flex gap-2">
              <Button
                className="flex-1"
                onClick={() => setShowFiltersMobile(false)}
              >
                套用
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setFilters(defaultFilters);
                }}
              >
                重設
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ------------------------------
// Book Detail Page
// ------------------------------
function BookDetailPage({ book, books, onReserve, onOpenBook }) {
  const columns = [
    { key: "lib", header: "館別" },
    { key: "callno", header: "索書號" },
    { key: "floor", header: "樓層/區" },
    {
      key: "status",
      header: "狀態",
      cell: (r) => <AvailabilityBadge status={r.status} />,
    },
    {
      key: "due",
      header: "到期日",
      cell: (r) => formatDate(r.due),
    },
  ];

  const similar = useMemo(
    () => getSimilarBooks(book, Array.isArray(books) ? books : [], 8),
    [book, books]
  );

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <img
            src={book.cover}
            alt={book.title}
            className="w-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{book.title}</h1>
          <p className="text-gray-600 mt-1">{book.author}</p>
          <div className="mt-2 text-sm text-gray-600">
            ISBN：{book.isbn}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {book.year} ・ {book.language} ・ {book.format}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(book.subjects || []).map((s) => (
              <span
                key={s}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-xl"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mt-4 text-gray-800 leading-7">
            {book.description}
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={onReserve}>預約</Button>
            <Button variant="secondary">收藏</Button>
            <Button variant="ghost">分享</Button>
          </div>
        </div>
      </div>
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">館藏與可借狀態</h2>
        <Table columns={columns} rows={book.availability} rowKey="lib" />
        <div className="mt-3 text-sm text-gray-600">
          地圖位置：
          <span className="inline-block align-middle w-24 h-6 bg-gray-200 rounded" />
          （樓層/書架佔位）
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">相似書籍</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {similar.map((b) => (
            <BookCard key={b.id} book={b} onOpen={onOpenBook} />
          ))}
        </div>
      </section>
    </main>
  );
}

// ------------------------------
// Reserve Flow
// ------------------------------
function ReserveFlow({ book, onDone }) {
  const steps = ["選取書館", "選日期", "確認", "成功"];
  const [step, setStep] = useState(0);
  const [lib, setLib] = useState("");
  const [date, setDate] = useState("");
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6">
      <Stepper steps={steps} current={step} />
      <div className="mt-6 border border-gray-200 rounded-2xl bg-white p-6 space-y-4">
        {step === 0 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">請選擇取書館：</div>
            <select
              className="w-full border border-gray-300 rounded-2xl px-3 py-2 bg-white"
              value={lib}
              onChange={(e) => setLib(e.target.value)}
            >
              <option value="">選擇館別</option>
              {(book.availability || []).map((a) => (
                <option key={a.lib} value={a.lib}>
                  {a.lib}
                </option>
              ))}
            </select>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              選擇取書日期：
            </div>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-2xl px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-2 text-sm">
            <div>
              書名：<span className="font-medium">{book.title}</span>
            </div>
            <div>
              取書館：
              <span className="font-medium">
                {lib || "未選擇"}
              </span>
            </div>
            <div>
              日期：
              <span className="font-medium">
                {date || "未選擇"}
              </span>
            </div>
            <div className="pt-2 text-gray-600">
              確認後將發送通知（Email/LINE）。
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="text-center">
            <div
              className="mx-auto w-32 h-32 bg-gray-100 rounded-2xl"
              aria-label="QR code placeholder"
            />
            <p className="mt-3 text-green-700 font-medium">
              預約成功！
            </p>
            <p className="text-sm text-gray-600">
              請於 3 天內到館取書，逾期預約將自動取消（不影響借閱權益）。到館請出示
              QR 碼或條碼。
            </p>
          </div>
        )}
        <div className="pt-2 flex items-center justify-between">
          <Button variant="secondary" onClick={back} disabled={step === 0}>
            上一步
          </Button>
          {step < 2 && (
            <Button onClick={next} disabled={step === 0 && !lib}>
              下一步
            </Button>
          )}
          {step === 2 && (
            <Button onClick={next} disabled={!lib || !date}>
              確認
            </Button>
          )}
          {step === 3 && <Button onClick={onDone}>完成</Button>}
        </div>
      </div>
    </main>
  );
}

// ------------------------------
// 為你推薦 頁面
// ------------------------------
function RecommendationsPage({ books, history, onOpenBook, onPickTopic }) {
  const safeBooks = Array.isArray(books) ? books : [];
  const viewedIds = Array.isArray(history) ? history : [];
  const viewedBooks = safeBooks.filter((b) => viewedIds.includes(b.id));

  // 統計看過的主題 / 語言
  const subjectScores = {};
  const langScores = {};
  viewedBooks.forEach((b) => {
    (b.subjects || []).forEach((s) => {
      subjectScores[s] = (subjectScores[s] || 0) + 1;
    });
    if (b.language) {
      langScores[b.language] = (langScores[b.language] || 0) + 1;
    }
  });

  const favSubjects = Object.keys(subjectScores)
    .sort((a, b) => subjectScores[b] - subjectScores[a])
    .slice(0, 3);

  // 用瀏覽紀錄做簡單推薦
  let recommended = [];
  if (viewedBooks.length) {
    const candidates = safeBooks.filter((b) => !viewedIds.includes(b.id));
    const scored = candidates
      .map((b) => {
        let score = 0;
        (b.subjects || []).forEach((s) => {
          if (subjectScores[s]) score += subjectScores[s] * 3;
        });
        if (langScores[b.language]) score += langScores[b.language] * 2;
        if (hasAvailable(b)) score += 1;
        return { book: b, score };
      })
      .sort((a, b) => b.score - a.score || b.book.year - a.book.year);
    recommended = scored.filter((x) => x.score > 0).map((x) => x.book);
  }

  // 如果還沒有紀錄，就退回熱門 / 新書
  if (!recommended.length) {
    recommended = safeBooks
      .slice()
      .sort((a, b) => b.year - a.year)
      .slice(0, 8);
  } else {
    recommended = recommended.slice(0, 8);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold">為你推薦</h1>
      <p className="mt-2 text-sm text-gray-600">
        根據你最近瀏覽的館藏，推薦可能感興趣的書籍。
      </p>

      {!viewedBooks.length && (
        <div className="mt-4 border border-dashed border-gray-300 rounded-2xl p-4 bg-white text-sm text-gray-700">
          <p>目前還沒有瀏覽紀錄，先到首頁逛逛或用關鍵字搜尋吧！</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onPickTopic && onPickTopic("文學")}
            >
              探索文學主題
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onPickTopic && onPickTopic("科技")}
            >
              看看科技 / 程式書
            </Button>
          </div>
        </div>
      )}

      {viewedBooks.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">最近看過</h2>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {viewedBooks.slice(0, 4).map((b) => (
              <BookCard key={b.id} book={b} onOpen={onOpenBook} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">推薦書籍</h2>
        </div>
        {favSubjects.length > 0 && (
          <div className="mt-2 text-sm text-gray-600 flex flex-wrap items-center gap-2">
            <span>根據你常看的主題：</span>
            {favSubjects.map((s) => (
              <span
                key={s}
                className="inline-flex items-center px-2 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommended.map((b) => (
            <BookCard key={b.id} book={b} onOpen={onOpenBook} />
          ))}
        </div>
      </section>
    </main>
  );
}

// ------------------------------
// 帳戶（登入點）：僅一般會員（Demo 帳密：user@hul / user123）
// ------------------------------
function AccountPage({ user, onLogin, onLogout }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("loans");

  if (!user) {
    const submit = (e) => {
      e.preventDefault();
      const u = onLogin?.(email.trim(), pass);
      if (!u) setErr("帳號或密碼錯誤（demo: user@hul / user123）");
    };
    return (
      <main className="mx-auto max-w-sm px-4 py-10">
        <h1 className="text-2xl font-bold">我的帳戶</h1>
        <form
          onSubmit={submit}
          className="mt-6 grid gap-3 bg-white border border-gray-200 rounded-2xl p-4"
        >
          <input
            className="border rounded-xl px-3 h-11"
            placeholder="Email（user@hul）"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border rounded-xl px-3 h-11"
            placeholder="密碼（user123）"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              登入
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setEmail("");
                setPass("");
                setErr("");
              }}
            >
              清除
            </Button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          已登入：
          <span className="font-medium">{user.email}</span>（一般會員）
        </div>
        <Button variant="secondary" size="sm" onClick={onLogout}>
          登出
        </Button>
      </div>
      <div className="mt-3 flex gap-2">
        {[
          { k: "loans", t: "借閱中" },
          { k: "holds", t: "預約" },
          { k: "fines", t: "罰款" },
          { k: "noti", t: "通知" },
          { k: "settings", t: "設定" },
        ].map(({ k, t }) => (
          <Button
            key={k}
            variant={tab === k ? "primary" : "secondary"}
            size="sm"
            onClick={() => setTab(k)}
          >
            {t}
          </Button>
        ))}
      </div>
      <div className="mt-4 border border-gray-200 bg-white rounded-2xl p-6 min-h-[200px]">
        {tab === "loans" && (
          <div className="text-sm text-gray-700">
            目前沒有借閱中的書籍。
          </div>
        )}
        {tab === "holds" && (
          <div className="text-sm text-gray-700">
            你的預約會顯示在此。
          </div>
        )}
        {tab === "fines" && (
          <div className="text-sm text-gray-700">
            目前沒有罰款紀錄。
          </div>
        )}
        {tab === "noti" && (
          <div className="text-sm text-gray-700">
            通知中心尚無新訊息。
          </div>
        )}
        {tab === "settings" && (
          <form className="space-y-4 text-sm">
            <div>
              <label className="block text-gray-600 mb-1">通知方式</label>
              <select className="border border-gray-300 rounded-2xl px-3 py-2">
                <option>Email</option>
                <option>LINE</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">介面語言</label>
              <select className="border border-gray-300 rounded-2xl px-3 py-2">
                <option>繁體中文</option>
                <option>English</option>
              </select>
            </div>
            <Button>儲存設定</Button>
          </form>
        )}
      </div>
    </main>
  );
}

// ------------------------------
// Main App（僅前台路由；無任何後台頁面/導向）
// ------------------------------
export default function App() {
  const [route, setRoute] = useState({ name: "home" });

  // 書目資料：先從 localStorage，其次 SEED_BOOKS，最後嘗試載入後端 API
  const [books, setBooks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hul.books") || "null");
      if (Array.isArray(saved) && saved.length) {
        return saved;
      }
    } catch {}
    return SEED_BOOKS;
  });

  // 同步到 localStorage（無論是 seed 或 API）
  useEffect(() => {
    try {
      localStorage.setItem("hul.books", JSON.stringify(books));
    } catch {}
  }, [books]);

  // 嘗試從 Library-app 後端載入資料
  useEffect(() => {
    async function fetchBooksFromApi() {
      try {
        const res = await fetch(`${API_BASE_URL}/books`);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          setBooks(data);
        }
      } catch (err) {
        console.error("載入後端書目失敗，暫時使用前端內建資料。", err);
      }
    }
    fetchBooksFromApi();
  }, []);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [viewHistory, setViewHistory] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(VIEWS_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  });
  const [navSearch, setNavSearch] = useState("");

  const recordView = (bookId) => {
    setViewHistory((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const without = arr.filter((id) => id !== bookId);
      const next = [bookId, ...without].slice(0, 50);
      try {
        localStorage.setItem(VIEWS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const openBook = (book) => {
    if (!book) return;
    recordView(book.id);
    setRoute({ name: "detail", book });
  };
  const goHome = () => setRoute({ name: "home" });
  const goResults = (q, initFilters) =>
    setRoute({ name: "results", q, initFilters });

  
  // 登入 (串接後端 API)
  const login = async (email, pass) => {
  try {
    // 1. 發送 POST 請求到您的後端 API
    //    注意：這裡用相對路徑 '/api/...'，會透過 Nginx 轉發
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,  // 您的後端 API 接收的是 'username'
        password: pass    // 您的後端 API 接收的是 'password'
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // 2. 登入成功
      //    後端回傳了 access_token，我們要把它存起來
      const u = { 
        email: email, 
        roles: ["member"], 
        token: data.access_token // 存入 token
      };
      
      // 儲存使用者資訊和 token 到 localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      // 如果您的後端有要求 Bearer Token，建議另外存一個 key
      localStorage.setItem('access_token', data.access_token); 

      setUser(u);
      setRoute({ name: "account" });
      return u;
    } else {
      // 3. 登入失敗 (帳密錯誤)
      alert(data.error || "登入失敗");
      return null;
    }
  }catch (error) {
    console.error("Login Error:", error);
    alert("伺服器連線錯誤");
    return null;
  }
 };
  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('access_token');
    setUser(null);
    goHome();
  };
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <Navbar
        navSearch={navSearch}
        setNavSearch={setNavSearch}
        onSubmit={(s) => s && goResults(s)}
        goHome={goHome}
        onOpenAccount={() => setRoute({ name: "account" })}
      />

      {route.name === "home" && (
        <HomePage
          books={books}
          onPickTopic={(t) => goResults(t)}
          onOpenBook={openBook}
          onBasicSearch={(q) => goResults(q)}
          onOpenAdvanced={() => setRoute({ name: "advanced" })}
          onOpenRecommend={() => setRoute({ name: "recommend" })}
        />
      )}

      {route.name === "advanced" && (
        <AdvancedSearchPage
          books={books}
          onSearch={(q, initFilters) => goResults(q, initFilters)}
          onCancel={goHome}
        />
      )}

      {route.name === "results" && (
        <SearchResultsPage
          books={books}
          query={route.q ?? ""}
          initFilters={route.initFilters}
          onOpenBook={openBook}
          onNewSearch={(q) => goResults(q)}
          goAdvanced={() => setRoute({ name: "advanced" })}
        />
      )}

      {route.name === "detail" && (
        <BookDetailPage
          book={route.book}
          books={books}
          onReserve={() =>
            setRoute({ name: "reserve", book: route.book })
          }
          onOpenBook={openBook}
        />
      )}

      {route.name === "reserve" && (
        <ReserveFlow
          book={route.book}
          onDone={() => setRoute({ name: "account" })}
        />
      )}

      {route.name === "recommend" && (
        <RecommendationsPage
          books={books}
          history={viewHistory}
          onOpenBook={openBook}
          onPickTopic={(t) => goResults(t)}
        />
      )}

      {route.name === "account" && (
        <AccountPage user={user} onLogin={login} onLogout={logout} />
      )}

      <footer className="border-t border-gray-200 mt-10 py-6 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Hualien United Libraries — Demo UI
        (前台)
      </footer>
    </div>
  );
}
