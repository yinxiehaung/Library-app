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
