import { Transaction, Customer, Product } from '../types';

// The Google Apps Script Web App URL
// IMPORTANT: You must update your Google Apps Script with the Auth code provided!
const API_URL = "https://script.google.com/macros/s/AKfycby49sceNP9u0YrUc7Ch5bMF0V1jJcqVEdqgMhWe7vfYn57aZ5orY8FljYaKWFpU7A5g/exec";

// Local cache of the data to avoid frequent fetches for read operations
let cache = {
    products: [] as Product[],
    customers: [] as Customer[],
    transactions: [] as Transaction[]
};

// Helper to make POST requests to the Google Script
const sendRequest = async (action: string, data?: any) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            mode: "cors", 
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify({ action, data })
        });
        const result = await response.json();
        if (result.status === 'error') {
            throw new Error(result.message);
        }
        return result;
    } catch (e) {
        console.error("API Request Failed:", e);
        throw e;
    }
};

// --- AUTHENTICATION ---

export const loginUser = async (username: string, password: string): Promise<{username: string}> => {
    const result = await sendRequest("LOGIN", { username, password });
    return result.user;
};

export const registerUser = async (username: string, password: string): Promise<{username: string}> => {
    const result = await sendRequest("REGISTER", { username, password });
    return result.user;
};

// --- INITIALIZATION ---

export const initDB = async (): Promise<void> => {
    // Initial fetch to populate cache
    await refreshCache();
};

export const refreshCache = async () => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        cache.products = data.products || [];
        cache.customers = data.customers || [];
        cache.transactions = data.transactions || [];
    } catch (e) {
        console.error("Failed to fetch data from Google Sheets", e);
        // Fallback or empty state
        cache.products = [];
        cache.customers = [];
        cache.transactions = [];
    }
}

export const resetDatabase = async () => {
    await sendRequest("RESET_DB");
    await refreshCache();
};

// --- DATA ACCESS METHODS (READ) ---

export const getProducts = (): Product[] => {
  return [...cache.products];
};

export const getCustomers = (): Customer[] => {
  return [...cache.customers];
};

export const getTransactions = (): Transaction[] => {
  // Sort by date desc
  return [...cache.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// --- DATA MODIFICATION METHODS (WRITE) ---

// PRODUCTS
export const addProduct = async (p: Product) => {
    await sendRequest("ADD_PRODUCT", p);
    cache.products.push(p); 
};

export const updateProduct = async (p: Product) => {
    await sendRequest("UPDATE_PRODUCT", p);
    const index = cache.products.findIndex(prod => prod.id === p.id);
    if (index !== -1) cache.products[index] = p;
};

export const deleteProduct = async (id: string) => {
    await sendRequest("DELETE_PRODUCT", { id });
    cache.products = cache.products.filter(p => p.id !== id);
};

export const updateProductStock = async (id: string, newStock: number) => {
    const product = cache.products.find(p => p.id === id);
    if (product) {
        const updatedProduct = { ...product, stock: newStock };
        await updateProduct(updatedProduct);
    }
};

export const decrementProductStock = async (productId: string, quantity: number) => {
    const product = cache.products.find(p => p.id === productId);
    if (product) {
        const newStock = Math.max(0, product.stock - quantity);
        await updateProductStock(productId, newStock);
    }
}

// CUSTOMERS
export const addCustomer = async (c: Customer) => {
    await sendRequest("ADD_CUSTOMER", c);
    cache.customers.push(c);
};

export const updateCustomer = async (c: Customer) => {
    await sendRequest("UPDATE_CUSTOMER", c);
    const index = cache.customers.findIndex(cust => cust.id === c.id);
    if (index !== -1) cache.customers[index] = c;
};

export const deleteCustomer = async (id: string) => {
    await sendRequest("DELETE_CUSTOMER", { id });
    cache.customers = cache.customers.filter(c => c.id !== id);
};

export const updateCustomerDebt = async (id: string, amountChange: number, date: string) => {
    const customer = cache.customers.find(c => c.id === id);
    if (customer) {
        const updatedCustomer = {
            ...customer,
            totalDebt: customer.totalDebt + amountChange,
            lastTransactionDate: date
        };
        await updateCustomer(updatedCustomer);
    }
}

// TRANSACTIONS
export const addTransaction = async (t: Transaction) => {
    await sendRequest("ADD_TRANSACTION", t);
    cache.transactions.push(t);
};