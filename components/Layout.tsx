import React from 'react';
import { View } from '../types';
import { LayoutDashboard, ShoppingCart, Users, Package, RotateCcw } from 'lucide-react';

interface LayoutProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  children: React.ReactNode;
  onReset: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children, onReset }) => {
  const navItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Home' },
    { id: 'SALES', icon: ShoppingCart, label: 'Sales' },
    { id: 'UTANG', icon: Users, label: 'Utang' },
    { id: 'INVENTORY', icon: Package, label: 'Stock' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar - Sticky */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 z-30">
        <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
                Tindahan<span className="text-gray-800">Flow</span>
            </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as View)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        currentView === item.id 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <item.icon size={20} />
                    {item.label}
                </button>
            ))}
        </nav>
        
        <div className="p-4 border-t border-gray-100 space-y-2">
             <button 
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors mt-2"
             >
                 <RotateCcw size={16} />
                 Reset Data
             </button>
        </div>
      </aside>

      {/* Main Content - Flows naturally with body scroll */}
      <main className="flex-1 min-h-screen flex flex-col">
         {/* Mobile Header */}
         <div className="md:hidden bg-white p-4 sticky top-0 z-20 shadow-sm flex items-center justify-between">
            <h1 className="text-xl font-bold text-indigo-700">TindahanFlow</h1>
            <div className="flex gap-1">
                <button 
                    onClick={onReset} 
                    className="text-rose-600 p-2 rounded-full hover:bg-rose-50"
                    title="Reset Data"
                >
                    <RotateCcw size={20} />
                </button>
            </div>
         </div>

         {/* Content Wrapper with bottom padding for mobile nav */}
         <div className="p-4 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8 flex-1">
            {children}
         </div>
      </main>

      {/* Mobile Bottom Nav - Fixed */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
            <button
                key={item.id}
                onClick={() => {
                    setCurrentView(item.id as View);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    currentView === item.id 
                    ? 'text-indigo-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                <item.icon size={24} />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
        ))}
      </nav>
    </div>
  );
};