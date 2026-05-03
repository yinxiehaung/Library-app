import React from "react";
import { BookCard } from "../components/BookCard";
import { Button } from "../components/ui/Button";

// 🌟 修改 Props：接收從 App.tsx 傳進來的 AI 推薦結果
export function RecommendationsPage({ recommendations, history, onOpenBook, onPickTopic, books }: any) {
  // 為了畫面上能顯示「最近看過」，我們保留 history 的比對邏輯
  const safeBooks = Array.isArray(books) ? books : [];
  const viewedIds = Array.isArray(history) ? history : [];
  const viewedBooks = safeBooks.filter((b) => viewedIds.includes(b.id));

  // 🌟 推薦來源改為機器 B 回傳的 recommendations
  const aiRecommended = Array.isArray(recommendations) ? recommendations : [];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900">AI 智能推薦</h1>
        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">Beta</span>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        透過 Sentence Transformer 多語言模型分析，為您在 6 萬筆館藏中尋找最適合的內容。
      </p>

      {/* 第一部分：最近看過 (保留原有的 history 顯示) */}
      {viewedBooks.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800">您最近的興趣</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {viewedBooks.slice(0, 4).map((b: any) => (
              <BookCard key={b.id} book={b} onOpen={onOpenBook} />
            ))}
          </div>
        </section>
      )}

      {/* 第二部分：AI 推薦結果 (顯示機器 B 的運算結果) */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-flex items-center gap-2">
          為您量身打造
        </h2>
        
        {aiRecommended.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {aiRecommended.map((b: any) => (
              <BookCard key={b.id || b.book_id} book={b} onOpen={onOpenBook} />
            ))}
          </div>
        ) : (
          <div className="mt-4 border-2 border-dashed border-gray-200 rounded-3xl p-12 bg-white text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-gray-900 font-medium">AI 正在觀察您的喜好</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
              目前數據不足，請先到首頁瀏覽幾本書籍，AI 就會開始為您計算個人化推薦。
            </p>
            <div className="mt-6">
              <Button onClick={() => onPickTopic?.("科技")}>去看看科技新書</Button>
            </div>
          </div>
        )}
      </section>

      {/* 底部說明 */}
      <div className="mt-16 p-6 bg-gray-50 rounded-2xl border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700">關於此推薦</h4>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          此推薦系統由機器 B (AI Server) 驅動。當您點擊書籍時，系統會將匿名化的書籍編號傳送至伺服器，
          利用 ChromaDB 向量庫進行語意檢索，找出主題、內容與語境最接近的書籍，而非僅依賴簡單的標籤比對。
        </p>
      </div>
    </main>
  );
}
