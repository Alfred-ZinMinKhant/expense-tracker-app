export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  receiptPhoto?: string;
  foodPhoto?: string;
}

export interface Budget {
  total: number;
  remaining: number;
}
