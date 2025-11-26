import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, ShoppingCart, Users, AlertTriangle } from 'lucide-react';
import { Transaction, Customer, Product, TransactionType } from '../types';
import { StatsCard } from './StatsCard';
import { CURRENCY } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  customers: Customer[];
  products: Product[];
  onQuickAction: (action: 'SALE' | 'EXPENSE' | 'UTANG') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, customers, products, onQuickAction }) => {
  const totalSales = transactions
    .filter(t => t.type === TransactionType.SALE)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalUtang = customers.reduce((sum, c) => sum + c.totalDebt, 0);
  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;

  const data = [
    { name: 'Sales', amount: totalSales },
    { name: 'Expenses', amount: totalExpenses },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Magandang Araw! ☀️</h1>
        <p className="text-gray-500">Here is your store's snapshot for today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Sales" 
          value={`${CURRENCY}${totalSales.toLocaleString()}`} 
          icon={DollarSign} 
          colorClass="bg-emerald-500"
        />
        <StatsCard 
          title="Total Expenses" 
          value={`${CURRENCY}${totalExpenses.toLocaleString()}`} 
          icon={ShoppingCart} 
          colorClass="bg-rose-500" 
        />
        <StatsCard 
          title="Total Utang" 
          value={`${CURRENCY}${totalUtang.toLocaleString()}`} 
          icon={Users} 
          colorClass="bg-amber-500" 
        />
        <StatsCard 
          title="Low Stock Items" 
          value={lowStockCount.toString()} 
          icon={AlertTriangle} 
          colorClass={lowStockCount > 0 ? "bg-orange-500" : "bg-gray-400"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Cash Flow Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   cursor={{fill: 'transparent'}}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
                <button 
                    onClick={() => onQuickAction('SALE')}
                    className="w-full py-3 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                >
                    <DollarSign size={18} /> Record Sale
                </button>
                <button 
                    onClick={() => onQuickAction('UTANG')}
                    className="w-full py-3 bg-amber-50 text-amber-700 font-semibold rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                >
                    <Users size={18} /> Add Utang
                </button>
                <button 
                    onClick={() => onQuickAction('EXPENSE')}
                    className="w-full py-3 bg-rose-50 text-rose-700 font-semibold rounded-lg hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                >
                    <ShoppingCart size={18} /> Log Expense
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};