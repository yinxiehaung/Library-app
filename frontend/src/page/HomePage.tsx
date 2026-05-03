import { SearchStrip } from "../components/SearchStrip";
import { BookCard } from "../components/BookCard";
import { Button } from "../components/ui/Button";

const TOPICS = ["文學", "歷史", "科技", "心理", "藝術", "旅遊"];

export function HomePage({ books, onPickTopic, onOpenBook, onBasicSearch, onOpenAdvanced, onOpenRecommend }: any) {
  const trending = Array.isArray(books) ? books : [];
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <SearchStrip size="lg" onSearch={onBasicSearch} onAdvanced={onOpenAdvanced} />

      <section className="mt-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6">
        <h2 className="text-xl font-semibold">快速主題</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => onPickTopic(t)}
              className="px-3 py-1.5 hover:bg-white/20 rounded-xl text-sm backdrop-blur border border-white/20"
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
          {trending.map((b: any) => (
            <BookCard key={b.id} book={b} onOpen={onOpenBook} />
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Button variant="accent" size="md" onClick={onOpenRecommend}>
            為你推薦更多書籍
          </Button>
        </div>
      </section>
    </main>
  );
}
