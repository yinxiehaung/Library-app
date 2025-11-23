export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverImage: string;
  isbn: string;
  publishedYear: number;
  availableCopies: number;
  totalCopies: number;
}

export interface BorrowedBook extends Book {
  borrowedDate: Date;
  dueDate: Date;
}
