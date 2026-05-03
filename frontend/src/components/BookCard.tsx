import { Book } from '../types/book';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BookCardProps {
  book: Book;
  onViewDetails: (book: Book) => void;
  isBorrowed?: boolean;
}

export function BookCard({ book, onViewDetails, isBorrowed = false }: BookCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetails(book)}>
      <div className="aspect-[2/3] relative overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        {book.availableCopies === 0 && !isBorrowed && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="bg-white/90 text-black">Not Available</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="line-clamp-1 mb-1">{book.title}</h3>
        <p className="text-gray-600 text-sm mb-2">{book.author}</p>
        <Badge variant="outline" className="text-xs">{book.genre}</Badge>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(book);
          }}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

export function SmallBookCard({ book, onOpen }: any) {
  return (
    <button
      className="w-full text-left border border-gray-200 rounded-2xl p-3 bg-white hover:shadow-sm transition"
      onClick={() => onOpen?.(book)}
      aria-label={`開啟 ${book.title} 詳情`}
    >
      <div className="flex gap-3">
        <img src={book.cover} alt="cover" className="w-12 h-16 rounded-md object-cover flex-shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-semibold line-clamp-2">{book.title}</div>
          <div className="text-xs text-gray-600 line-clamp-1">{book.author} ・ {book.year}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {(book.subjects || []).slice(0, 2).map((s: string) => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

