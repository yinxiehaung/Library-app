import { Book } from '../types/book';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, BookOpen, User, Hash } from 'lucide-react';

interface BookDetailDialogProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onBorrow: (book: Book) => void;
  onReturn: (bookId: string) => void;
  onViewSimilar: (book: Book) => void;
  isBorrowed: boolean;
  similarBooks: Book[];
}

export function BookDetailDialog({
  book,
  open,
  onClose,
  onBorrow,
  onReturn,
  onViewSimilar,
  isBorrowed,
  similarBooks,
}: BookDetailDialogProps) {
  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{book.title}</DialogTitle>
          <DialogDescription>by {book.author}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[200px_1fr] gap-6">
          <div className="aspect-[2/3] relative overflow-hidden rounded-lg bg-gray-100">
            <ImageWithFallback
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div>
              <Badge>{book.genre}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{book.author}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Published: {book.publishedYear}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Hash className="w-4 h-4" />
                <span>ISBN: {book.isbn}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>
                  Available: {book.availableCopies} of {book.totalCopies} copies
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2">Description</h4>
              <p className="text-sm text-gray-600">{book.description}</p>
            </div>

            <div className="flex gap-2">
              {isBorrowed ? (
                <Button onClick={() => onReturn(book.id)} variant="outline">
                  Return Book
                </Button>
              ) : (
                <Button 
                  onClick={() => onBorrow(book)} 
                  disabled={book.availableCopies === 0}
                >
                  {book.availableCopies === 0 ? 'Not Available' : 'Borrow Book'}
                </Button>
              )}
              <Button onClick={() => onViewSimilar(book)} variant="secondary">
                Find Similar Books
              </Button>
            </div>
          </div>
        </div>

        {similarBooks.length > 0 && (
          <div className="mt-6">
            <Separator className="mb-4" />
            <h4 className="mb-4">Similar Books in {book.genre}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarBooks.map((similarBook) => (
                <div 
                  key={similarBook.id} 
                  className="cursor-pointer group"
                  onClick={() => {
                    onClose();
                    setTimeout(() => onViewSimilar(similarBook), 100);
                  }}
                >
                  <div className="aspect-[2/3] relative overflow-hidden rounded-lg bg-gray-100 mb-2 group-hover:shadow-lg transition-shadow">
                    <ImageWithFallback
                      src={similarBook.coverImage}
                      alt={similarBook.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm line-clamp-1">{similarBook.title}</p>
                  <p className="text-xs text-gray-600 line-clamp-1">{similarBook.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
