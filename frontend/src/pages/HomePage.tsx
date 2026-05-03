import { SearchStrip } from "../components/SearchStrip";
import { BookCard } from "../components/BookCard";
import { Button } from "../components/ui/Button";

const TOPICS = ["文學", "歷史", "科技", "心理", "藝術", "旅遊"];

// 🌟 修正：新增 recommendations 參數
export function HomePage({ 
  books, 
  recommendations, // 接收 AI 推薦資料
  onPickTopic, 
  onOpenBook, 
  onBasicSearch, 
  onOpenAdvanced, 
  onOpenRecommend 
}: any) {
  const trending = Array.isArray(books) ? books : [];
  const recs = Array.isArray(recommendations) ? recommendations : [];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* 搜尋列 */}
      <SearchStrip size="lg" onSearch={onBasicSearch} onAdvanced={onOpenAdvanced} />

      {/* 快速主題 */}
      <section className="mt-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold">快速主題</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => onPickTopic(t)}
              className="px-3 py-1.5 hover:bg-white/20 rounded-xl text-sm backdrop-blur border border-white/20 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* 🌟 新增：專屬推薦區塊 */}
      {recs.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              專屬您的 AI 推薦
            </h2>
            <Button variant="ghost" onClick={onOpenRecommend}>探索更多</Button>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recs.slice(0, 6).map((b: any) => (
              <BookCard 
                key={b.id} 
                book={{
                  ...b,
                  // 處理爬蟲回傳的空字串封面
                  cover: b.cover || "https://via.placeholder.com/300x400?text=無封面資料"
                }} 
                onOpen={onOpenBook} 
              />
            ))}
          </div>
        </section>
      )}

      {/* 熱門書籍 */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-2 h-6 bg-gray-300 rounded-full"></span>
            熱門書籍
          </h2>
          <Button variant="ghost" onClick={() => onBasicSearch("")}>查看全部</Button>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {trending.slice(0, 10).map((b: any) => (
            <BookCard key={b.id} book={b} onOpen={onOpenBook} />
          ))}
        </div>
        
        {/* 如果完全沒推薦，顯示這個按鈕引導 */}
        {recs.length === 0 && (
          <div className="mt-8 flex justify-center border-t border-gray-100 pt-8">
            <Button variant="default" size="lg" className="rounded-2xl shadow-md" onClick={onOpenRecommend}>
              為你推薦更多書籍
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
