import { useMemo } from "react";
import { formatDate } from "../utils/helpers";
import { getSimilarBooks } from "../utils/search";
import { AvailabilityBadge } from "../components/ui/Badge";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { BookCard } from "../components/BookCard";

export function BookDetailPage({ book, books, onReserve, onOpenBook }: {
  book: any;
  books: any[];
  onReserve: () => void;
  onOpenBook: (b: any) => void;
}) {
  const columns = [
    { key: "lib",    header: "館別" },
    { key: "callno", header: "索書號" },
    { key: "floor",  header: "樓層/區" },
    { key: "status", header: "狀態",  cell: (r: any) => <AvailabilityBadge status={r.status} /> },
    { key: "due",    header: "到期日", cell: (r: any) => formatDate(r.due) },
  ];

  const similar = useMemo(() => getSimilarBooks(book, Array.isArray(books) ? books : [], 8), [book, books]);

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <img src={book.cover} alt={book.title} className="w-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{book.title}</h1>
          <p className="text-gray-600 mt-1">{book.author}</p>
          <div className="mt-2 text-sm text-gray-600">ISBN：{book.isbn}</div>
          <div className="mt-2 text-sm text-gray-600">{book.year} ・ {book.language} ・ {book.format}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(book.subjects || []).map((s: string) => (
              <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-xl">{s}</span>
            ))}
          </div>
          <p className="mt-4 text-gray-800 leading-7">{book.description}</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={onReserve}>預約 / 借閱</Button>
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
          {similar.map((b: any) => <BookCard key={b.id} book={b} onOpen={onOpenBook} />)}
        </div>
      </section>
    </main>
  );
}
