import { GoogleGenAI } from "@google/genai";
import { Transaction, Product, Customer } from "../types";

const apiKey = process.env.API_KEY || '';

// Safely initialize the client only if the key exists, handled in the call if missing.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateBusinessInsights = async (
  transactions: Transaction[],
  products: Product[],
  customers: Customer[]
): Promise<string> => {
  if (!ai) {
    return "API Key is missing. Please configure your environment variables to use the AI features.";
  }

  // Summarize data for the prompt to keep tokens efficient
  const totalSales = transactions
    .filter(t => t.type === 'SALE')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalUtang = customers.reduce((acc, curr) => acc + curr.totalDebt, 0);
  
  const lowStockItems = products
    .filter(p => p.stock <= p.lowStockThreshold)
    .map(p => p.name)
    .join(", ");

  const prompt = `
    Act as a smart business consultant for a small Filipino Sari-sari store owner.
    Analyze the following snapshot of their business data:
    
    - Total Recent Sales: ₱${totalSales}
    - Total Expenses: ₱${totalExpenses}
    - Total Customer Debt (Utang): ₱${totalUtang}
    - Low Stock Items: ${lowStockItems || "None"}
    
    Please provide 3 specific, actionable, and encouraging tips (in a mix of English and Tagalog for a friendly tone) to help the owner improve their cash flow and manage their store better. Keep it concise (under 150 words total).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Sorry, I couldn't generate insights right now.";
  } catch (error) {
    console.error("Error generating insights:", error);
    return "An error occurred while connecting to the smart assistant. Please try again later.";
  }
};