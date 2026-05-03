import { IconSearch, IconX } from "../icons";
import { Button } from "./Button";

export function SearchField({ value, onChange, onClear, onSubmit, placeholder = "輸入書名、作者或主題" }: any) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}
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
          <button type="button" aria-label="清除搜尋" onClick={onClear} className="p-1 hover:bg-gray-100 rounded-full">
            <IconX className="w-4 h-4 text-gray-500" />
          </button>
        )}
        <Button type="submit" size="sm">搜尋</Button>
      </div>
    </form>
  );
}
