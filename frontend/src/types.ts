export interface AuthUser {
  email: string;
  roles: string[];
}

export interface Loan {
  id: string | number;
  book_title?: string;
  title?: string;
  book_isbn?: string;
  isbn?: string;
  loan_date?: string;
  start_date?: string;
  due_date?: string;
}

