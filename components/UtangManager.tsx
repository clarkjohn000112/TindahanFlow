import React from 'react';
import { Customer } from '../types';
import { Users, Phone, Calendar, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { CURRENCY } from '../constants';

interface UtangManagerProps {
  customers: Customer[];
  onAddCustomer: () => void;
  onManageDebt: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export const UtangManager: React.FC<UtangManagerProps> = ({ customers, onAddCustomer, onManageDebt, onEditCustomer, onDeleteCustomer }) => {
  
  const handleDelete = (id: string, name: string, debt: number) => {
      // Use a small threshold (0.5) to handle floating point math errors (e.g. 0.000001)
      // If debt is effectively zero, allow delete.
      if (debt > 0.5) {
          alert(`Unable to delete ${name}.\n\nCurrent Balance: ${CURRENCY}${debt.toLocaleString()}\n\nPlease settle the payment to 0 before removing this record.`);
          return;
      }
      if (window.confirm(`Are you sure you want to delete ${name}'s record?\nThis action cannot be undone.`)) {
          onDeleteCustomer(id);
      }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Utang Ledger</h1>
        <button 
            onClick={onAddCustomer}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
        >
            <Users size={18} /> New Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {customers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No customers recorded yet.</p>
            </div>
        ) : (
            <ul className="divide-y divide-gray-100">
                {customers.map((customer) => (
                    <li key={customer.id} className="p-4 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                                    {customer.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-800">{customer.name}</h3>
                                        <button 
                                            onClick={() => onEditCustomer(customer)}
                                            className="text-gray-400 hover:text-indigo-600 p-1 rounded-full transition-colors"
                                            title="Edit Info"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(customer.id, customer.name, customer.totalDebt)}
                                            className="text-gray-400 hover:text-rose-600 p-1 rounded-full transition-colors"
                                            title="Delete Record"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Phone size={12}/> {customer.phoneNumber || 'No #'}</span>
                                        <span className="flex items-center gap-1"><Calendar size={12}/> Last: {customer.lastTransactionDate ? new Date(customer.lastTransactionDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs text-gray-500">Balance</p>
                                    <p className={`font-bold ${customer.totalDebt > 0.5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {CURRENCY}{customer.totalDebt.toLocaleString()}
                                    </p>
                                </div>
                                
                                <button 
                                    onClick={() => onManageDebt(customer)}
                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <Edit3 size={16} />
                                    <span className="hidden sm:inline">Manage</span>
                                </button>
                            </div>
                        </div>
                        {/* Mobile Balance View */}
                         <div className="mt-2 sm:hidden flex justify-between items-center border-t border-gray-100 pt-2">
                             <span className="text-xs text-gray-500">Current Utang:</span>
                             <span className={`font-bold ${customer.totalDebt > 0.5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {CURRENCY}{customer.totalDebt.toLocaleString()}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        )}
      </div>
    </div>
  );
};