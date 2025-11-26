import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { Save, X } from 'lucide-react';

interface CustomerEntryProps {
  onSave: (customer: Omit<Customer, 'id' | 'lastTransactionDate'>) => void;
  onCancel: () => void;
  initialCustomer?: Customer | null;
}

export const CustomerEntry: React.FC<CustomerEntryProps> = ({ onSave, onCancel, initialCustomer }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [initialDebt, setInitialDebt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialCustomer) {
        setName(initialCustomer.name);
        setPhoneNumber(initialCustomer.phoneNumber || '');
        setInitialDebt(initialCustomer.totalDebt.toString());
    }
  }, [initialCustomer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- VALIDATION ---
    if (!name.trim()) {
        setError("Customer name is required.");
        return;
    }
    const debtVal = Number(initialDebt);
    if (initialDebt && (isNaN(debtVal) || debtVal < 0)) {
        setError("Initial debt cannot be negative.");
        return;
    }
    if (phoneNumber && !/^[\d\s+\-()]*$/.test(phoneNumber)) {
        setError("Invalid phone number format.");
        return;
    }
    // ------------------

    onSave({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      totalDebt: Number(initialDebt) || 0,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-md mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{initialCustomer ? 'Edit Customer' : 'New Customer'}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-100">
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g., Aling Maria"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="0917..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{initialCustomer ? 'Total Debt Balance (₱)' : 'Initial Utang/Balance (₱)'}</label>
          <input
            type="number"
            value={initialDebt}
            onChange={(e) => setInitialDebt(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="0.00"
            min="0"
          />
          {!initialCustomer && <p className="text-xs text-gray-500 mt-1">Leave blank if starting with zero balance.</p>}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <Save size={20} />
          {initialCustomer ? 'Update Information' : 'Save Customer'}
        </button>
      </form>
    </div>
  );
};