import { hasAvailable } from "../utils/helpers";
import { BookCard } from "../components/BookCard";
import { Button } from "../components/ui/Button";

export function RecommendationsPage({ books, history, onOpenBook, onPickTopic }: any) {
  const safeBooks = Array.isArray(books) ? books : [];
  const viewedIds = Array.isArray(history) ? history : [];
  const viewedBooks = safeBooks.filter((b) => viewedIds.includes(b.id));

  const subjectScores: Record<string, number> = {};
  const langScores: Record<string, number> = {};
  viewedBooks.forEach((b) => {
    (b.subjects || []).forEach((s: string) => { subjectScores[s] = (subjectScores[s] || 0) + 1; });
    if (b.language) langScores[b.language] = (langScores[b.language] || 0) + 1;
  });

  const favSubjects = Object.keys(subjectScores).sort((a, b) => subjectScores[b] - subjectScores[a]).slice(0, 3);

  let recommended: any[] = [];
  if (viewedBooks.length) {
    const candidates = safeBooks.filter((b) => !viewedIds.includes(b.id));
    const scored = candidates
      .map((b) => {
        let score = 0;
        (b.subjects || []).forEach((s: string) => { if (subjectScores[s]) score += subjectScores[s] * 3; });
        if (langScores[b.language]) score += langScores[b.language] * 2;
        if (hasAvailable(b)) score += 1;
        return { book: b, score };
      })
      .sort((a, b) => b.score - a.score || b.book.year - a.book.year);
    recommended = scored.filter((x) => x.score > 0).map((x) => x.book);
  }

  if (!recommended.length) {
    recommended = safeBooks.slice().sort((a, b) => b.year - a.year).slice(0, 8);
  } else {
    recommended = recommended.slice(0, 8);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold">為你推薦</h1>
      <p className="mt-2 text-sm text-gray-600">根據你最近瀏覽的館藏，推薦可能感興趣的書籍。</p>

      {!viewedBooks.length && (
        <div className="mt-4 border border-dashed border-gray-300 rounded-2xl p-4 bg-white text-sm text-gray-700">
          <p>目前還沒有瀏覽紀錄，先到首頁逛逛或用關鍵字搜尋吧！</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onPickTopic?.("文學")}>探索文學主題</Button>
            <Button size="sm" variant="secondary" onClick={() => onPickTopic?.("科技")}>看看科技 / 程式書</Button>
          </div>
        </div>
      )}

      {viewedBooks.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">最近看過</h2>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {viewedBooks.slice(0, 4).map((b: any) => <BookCard key={b.id} book={b} onOpen={onOpenBook} />)}
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
              <span key={s} className="inline-flex items-center px-2 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs">{s}</span>
            ))}
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommended.map((b: any) => <BookCard key={b.id} book={b} onOpen={onOpenBook} />)}
        </div>
      </section>
    </main>
  );
}
