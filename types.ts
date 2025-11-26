export enum TransactionType {
  SALE = 'SALE',
  EXPENSE = 'EXPENSE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  GCASH = 'GCASH',
  CREDIT = 'CREDIT' // Utang
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
  paymentMethod: PaymentMethod;
  customerId?: string; // If linked to a specific customer (utang)
  productId?: string; // If linked to inventory
  quantity?: number; // Quantity of items sold
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber?: string;
  totalDebt: number;
  lastTransactionDate?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  category: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  balance: number; // Amount we owe them
}

export type View = 'DASHBOARD' | 'SALES' | 'UTANG' | 'INVENTORY';