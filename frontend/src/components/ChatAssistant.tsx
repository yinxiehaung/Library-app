import React, { useState } from "react";
import ReactMarkdown from "react-markdown"; 
import { Button } from "./ui/Button";
import { SmallBookCard } from "./BookCard";
import { IconSparkles, IconX, IconSend } from "./icons";
import { classNames } from "../utils/helpers";

export function ChatAssistant({ open, onClose, books, onOpenBook, onOpenResults }: any) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([{ 
    role: "assistant", 
    text: "嗨～我是這座圖書館的 AI 導覽員。\n我可以幫你找書，例如：「我想看懸疑推理小說」、「有沒有適合睡前看的故事？」" 
  }]);
  const [isTyping, setIsTyping] = useState(false);

  const send = async () => {
    const q = input.trim();
    if (!q) return;
    
    const newMessages = [...messages, { role: "user", text: q }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      // 🌟 1. 將前端對話紀錄轉成 ai_server.py 看得懂的格式
      const historyForApi = messages.map(m => ({
        role: m.role,
        content: m.text
      }));

      // 🌟 2. 完美對齊 ai_server.py 的 Payload 需求，解決 422 Unprocessable Entity
      const payload = {
        message: q,
        history: historyForApi
      };

      // 🌟 3. 透過 Nginx 的安全暗門打向後端
      const response = await fetch('/ai-api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("API 報錯細節:", errData);
        throw new Error("Chat API Failed");
      }
      
      const data = await response.json();
      
      setMessages([...newMessages, { role: "assistant", text: data.response }]);

    } catch (error) {
      console.error("Chat API 錯誤:", error);
      setMessages([...newMessages, { role: "assistant", text: "抱歉，圖書館大腦有點秀逗了，請確認 AI 伺服器是否已開啟並允許 CORS。" }]);
    } finally {
      setIsTyping(false);
    }
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
          <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors" onClick={onClose} aria-label="關閉">
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
                    ? "bg-blue-600 text-white rounded-br-sm shadow-sm"
                    : "bg-gray-100 text-gray-900 rounded-bl-sm"
                )}
              >
                {/* 🌟 4. 使用 ReactMarkdown 渲染排版 */}
                <ReactMarkdown
                  components={{
                    h2: ({ node, ...props }) => <h2 className="text-[15px] font-bold mt-3 mb-1 text-blue-700" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-[3px] border-gray-300 pl-3 my-2 text-gray-600 bg-white/50 py-1.5 rounded-r-md" {...props} />
                    ),
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
                  }}
                >
                  {m.text}
                </ReactMarkdown>
                
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

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-gray-100 text-gray-500 rounded-bl-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
              </div>
            </div>
          )}
        </div>

        <form
          className="p-3 border-t border-gray-200 flex items-center gap-2 bg-gray-50"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            className="flex-1 h-11 px-4 rounded-2xl border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            placeholder="輸入想找的關鍵字..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <Button type="submit" aria-label="送出" disabled={isTyping || !input.trim()}>
            <IconSend className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">送出</span>
          </Button>
        </form>
      </aside>
    </div>
  );
}
