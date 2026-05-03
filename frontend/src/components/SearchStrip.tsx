import { useState } from "react";
import { classNames } from "../utils/helpers";
import { Button } from "./ui/Button";
import { IconSearch } from "./icons";

export const FIELD_OPTIONS = [
  { k: "any",     label: "不限欄位" },
  { k: "title",   label: "書名" },
  { k: "author",  label: "作者" },
  { k: "subject", label: "主題" },
  { k: "isbn",    label: "ISBN" },
];

export function SearchStrip({
  size = "lg",
  onSearch,
  onAdvanced,
}: {
  size?: "lg" | "md";
  onSearch: (q: any) => void;
  onAdvanced: () => void;
}) {
  const [term, setTerm] = useState("");
  const [field, setField] = useState("any");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (field === "any") {
      onSearch?.({ isExternal: true, term });
    } else {
      onSearch?.({ rows: [{ field, term }] });
    }
  };

  return (
    <div className={classNames("rounded-3xl border bg-white/90 backdrop-blur p-4", size === "lg" ? "p-6" : "p-4")}>
      <form className="flex gap-3 items-stretch" onSubmit={submit}>
        <input
          className={classNames("flex-1 rounded-2xl border border-gray-300 px-4 outline-none", size === "lg" ? "h-12 text-base" : "h-10 text-sm")}
          placeholder="請輸入檢索詞查詢全部館藏"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <select
          className={classNames("rounded-2xl border border-gray-300 bg-white px-3", size === "lg" ? "h-12 text-base" : "h-10 text-sm")}
          value={field}
          onChange={(e) => setField(e.target.value)}
        >
          {FIELD_OPTIONS.map((f) => (
            <option key={f.k} value={f.k}>{f.label}</option>
          ))}
        </select>
        <Button variant="accent" size={size === "lg" ? "lg" : "md"} type="submit" className={size === "lg" ? "px-6" : "px-4"}>
          <span className="inline-flex items-center gap-2">
            <IconSearch className="w-5 h-5" />
            查詢
          </span>
        </Button>
        <Button variant="secondary" size={size === "lg" ? "lg" : "md"} type="button" onClick={() => onAdvanced?.()}>
          進階查詢
        </Button>
      </form>
    </div>
  );
}

