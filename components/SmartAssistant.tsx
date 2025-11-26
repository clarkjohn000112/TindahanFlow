import React, { useState, useEffect } from 'react';
import { generateBusinessInsights } from '../services/geminiService';
import { Transaction, Product, Customer } from '../types';
import { Sparkles, RefreshCw, Lightbulb } from 'lucide-react';

interface SmartAssistantProps {
  transactions: Transaction[];
  products: Product[];
  customers: Customer[];
}

export const SmartAssistant: React.FC<SmartAssistantProps> = ({ transactions, products, customers }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const result = await generateBusinessInsights(transactions, products, customers);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    // Fetch initial insight on mount
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
                <Sparkles className="text-yellow-300" size={24} />
                <h2 className="text-xl font-bold">Smart Business Coach</h2>
            </div>
            <button 
                onClick={fetchInsights} 
                disabled={loading}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50"
            >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10 min-h-[100px]">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full py-4 text-indigo-100">
                    <p className="animate-pulse">Analyzing your store data...</p>
                </div>
            ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                    {insight ? (
                        <div className="whitespace-pre-wrap font-medium text-indigo-50 leading-relaxed">
                            {insight}
                        </div>
                    ) : (
                        <p>Click refresh to get AI-powered insights for your business.</p>
                    )}
                </div>
            )}
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-xs text-indigo-200 opacity-80">
            <Lightbulb size={14} />
            <span>Powered by Gemini AI. Tips are based on your current sales and inventory data.</span>
        </div>
      </div>
    </div>
  );
};