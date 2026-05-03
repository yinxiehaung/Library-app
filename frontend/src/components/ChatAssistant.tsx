import { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { SmallBookCard } from "./BookCard";
import { IconSparkles, IconX, IconSend } from "./icons";
import { classNames } from "../utils/helpers";
import { tokenize, relevanceScore } from "../utils/search";

function smartSearch(books: any[], q: string, limit = 6) {
  const qs = q.toLowerCase();
  const tokens = tokenize(q);

  const subjectHints: string[] = [];
  if (/(小孩|孩子|親子|教養|躁|焦慮|情緒)/.test(qs)) subjectHints.push("心理", "療癒");
  if (/(學程式|coding|寫程式|軟體|演算法)/.test(qs)) subjectHints.push("Programming", "科技");
  if (/(太空|宇宙|科幻|外星)/.test(qs)) subjectHints.push("科幻", "宇宙");

  const scored = (books || []).map((b: any) => {
    let s = relevanceScore(b, tokens);
    if ((b.subjects || []).some((s2: string) => subjectHints.includes(s2))) s += 4;
    return { b, s };
  });

  const results = scored
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.b.year - a.b.year)
    .slice(0, limit)
    .map((x) => x.b);

  return results.length ? results : (books || []).slice(0, Math.min(6, (books || []).length));
}

export function ChatAssistant({ open, onClose, books, onOpenBook, onOpenResults }: any) {
  const [messages, setMessages] = useState<
    { role: "assistant" | "user"; text: string; items?: any[]; query?: string }[]
  >(() => [
    { role: "assistant", text: "嗨～我可以根據你的需求找書。\n試試：「小孩很躁怎麼辦」、「學習寫程式」、「科幻太空冒險」。" },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!open) setInput("");
  }, [open]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setMessages((ms) => [...ms, { role: "user", text: q }]);
    setInput("");
    const candidates = smartSearch(books, q, 6);
    setMessages((ms) => [
      ...ms,
      {
        role: "assistant",
        text: `我幫你找了幾本可能適合的書，或你也可以用「${q}」直接查看完整搜尋結果。`,
        items: candidates,
        query: q,
      },
    ]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/30" role="dialog" aria-modal="true" onClick={onClose}>
      <aside
        className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-xl border-l border-gray-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold flex items-center gap-2">
            <span className="inline-flex w-8 h-8 rounded-xl bg-orange-500 text-white items-center justify-center">
              <IconSparkles className="w-4 h-4" />
            </span>
            AI 小助手
          </div>
          <button className="p-2 rounded-xl hover:bg-gray-100" onClick={onClose} aria-label="關閉">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={classNames("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={classNames(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-900 rounded-bl-sm",
                )}
              >
                {m.text}
                {m.items && (
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {m.items.map((b: any) => (
                      <SmallBookCard key={b.id} book={b} onOpen={onOpenBook} />
                    ))}
                    {m.query && (
                      <div className="pt-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          onClick={() => onOpenResults?.(m.query)}
                        >
                          用「{m.query}」查看完整結果
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form
          className="p-3 border-t border-gray-200 flex items-center gap-2"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            className="flex-1 h-11 px-3 rounded-2xl border border-gray-300 outline-none"
            placeholder="輸入你想找的關鍵字或描述（例如：小孩很躁怎麼辦）"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" aria-label="送出">
            <IconSend className="w-4 h-4 mr-1" />
            送出
          </Button>
        </form>
      </aside>
    </div>
  );
}

