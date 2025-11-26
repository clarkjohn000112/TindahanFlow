import React, { useState, useEffect } from 'react';
import { Customer, Transaction, TransactionType, PaymentMethod, Product } from '../types';
import { Save, X, ArrowUpRight, ArrowDownLeft, ShoppingBag, Banknote } from 'lucide-react';
import { CURRENCY } from '../constants';

interface DebtEntryProps {
  customer: Customer;
  products: Product[];
  onSave: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  onCancel: () => void;
}

type ActionType = 'BORROW' | 'PAY';
type InputMode = 'MANUAL' | 'PRODUCT';

export const DebtEntry: React.FC<DebtEntryProps> = ({ customer, products, onSave, onCancel }) => {
  const [action, setAction] = useState<ActionType>('BORROW');
  const [mode, setMode] = useState<InputMode>('PRODUCT'); // Default to product for easier stock tracking
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // Product Selection State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Reset state when action changes
  useEffect(() => {
     if (action === 'PAY') {
         setMode('MANUAL');
         setAmount('');
         setDescription('');
         setSelectedProductId('');
     } else {
        // If switching back to borrow, default to Product
        setMode('PRODUCT');
        setAmount('');
        setDescription('');
     }
  }, [action]);

  // Auto-calculate amount and description when product/quantity changes
  useEffect(() => {
    if (action === 'BORROW' && mode === 'PRODUCT' && selectedProductId) {
        const product = products.find(p => p.id === selectedProductId);
        if (product) {
            const total = product.price * quantity;
            setAmount(total.toString());
            // Auto-generate description
            setDescription(`${quantity}x ${product.name}`);
        }
    }
  }, [selectedProductId, quantity, mode, products, action]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    if (action === 'BORROW') {
        // Borrowing means a Credit Sale
        onSave({
            type: TransactionType.SALE,
            amount: Number(amount),
            description: description || 'Added to Utang',
            paymentMethod: PaymentMethod.CREDIT,
            customerId: customer.id,
            // Only attach product ID if we are in PRODUCT mode
            productId: (mode === 'PRODUCT' && selectedProductId) ? selectedProductId : undefined,
            quantity: (mode === 'PRODUCT' && selectedProductId) ? quantity : undefined
        });
    } else {
        // Paying means Payment Received
        onSave({
            type: TransactionType.PAYMENT_RECEIVED,
            amount: Number(amount),
            description: description || 'Utang Payment',
            paymentMethod: PaymentMethod.CASH,
            customerId: customer.id
        });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-md mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-xl font-bold text-gray-800">Manage Utang</h2>
            <p className="text-sm text-gray-500">for {customer.name}</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex justify-between items-center">
          <span className="text-gray-600 font-medium">Current Balance</span>
          <span className={`text-xl font-bold ${customer.totalDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
             {CURRENCY}{customer.totalDebt.toLocaleString()}
          </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Action Toggles */}
        <div className="grid grid-cols-2 gap-3 mb-4">
            <button
                type="button"
                onClick={() => setAction('BORROW')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    action === 'BORROW' 
                    ? 'border-amber-500 bg-amber-50 text-amber-700' 
                    : 'border-gray-200 text-gray-500 hover:border-amber-200'
                }`}
            >
                <ArrowUpRight size={24} />
                <span className="font-bold text-sm">Add Utang</span>
            </button>
            <button
                type="button"
                onClick={() => setAction('PAY')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    action === 'PAY' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'border-gray-200 text-gray-500 hover:border-emerald-200'
                }`}
            >
                <ArrowDownLeft size={24} />
                <span className="font-bold text-sm">Pay Utang</span>
            </button>
        </div>

        {/* Input Mode Toggle (Only for Borrowing) */}
        {action === 'BORROW' && (
            <div className="flex rounded-md bg-gray-100 p-1 mb-4">
                <button
                    type="button"
                    onClick={() => { setMode('PRODUCT'); setSelectedProductId(''); setAmount(''); setDescription(''); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                        mode === 'PRODUCT' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                    }`}
                >
                    <ShoppingBag size={14} /> Select Item
                </button>
                <button
                    type="button"
                    onClick={() => { setMode('MANUAL'); setAmount(''); setDescription(''); setSelectedProductId(''); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                        mode === 'MANUAL' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                    }`}
                >
                    <Banknote size={14} /> Manual Amount
                </button>
            </div>
        )}

        {/* Product Selection Inputs */}
        {action === 'BORROW' && mode === 'PRODUCT' && (
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 space-y-3">
                 <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1 uppercase">Select Item</label>
                    <select 
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full p-2 border border-amber-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                        required
                    >
                        <option value="">-- Choose from Inventory --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} - {CURRENCY}{p.price} (Stock: {p.stock})
                            </option>
                        ))}
                    </select>
                 </div>
                 {selectedProductId && (
                     <div className="flex items-center gap-3">
                        <div className="flex-1">
                             <label className="block text-xs text-amber-700 mb-1">Quantity</label>
                             <input 
                                type="number" 
                                min="1" 
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full p-2 border border-amber-200 rounded-lg text-sm text-center font-bold text-gray-800"
                             />
                        </div>
                        <div className="flex-1 text-right">
                            <span className="block text-xs text-amber-700">Unit Price</span>
                            <span className="font-bold text-amber-900">₱{products.find(p => p.id === selectedProductId)?.price}</span>
                        </div>
                     </div>
                 )}
            </div>
        )}

        {/* Amount Input (Read-only for Product Mode, Editable for Manual) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
             {mode === 'PRODUCT' && action === 'BORROW' ? 'Total Amount (Auto-calculated)' : 'Amount (₱)'}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            readOnly={mode === 'PRODUCT' && action === 'BORROW'}
            className={`w-full p-3 border rounded-lg outline-none text-lg font-bold ${
                mode === 'PRODUCT' && action === 'BORROW' 
                ? 'bg-gray-100 border-gray-200 text-gray-600' 
                : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500'
            }`}
            placeholder="0.00"
            required
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
             readOnly={mode === 'PRODUCT' && action === 'BORROW'} // Auto-filled
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder={action === 'BORROW' ? "Items bought..." : "Partial payment..."}
          />
        </div>

        <button
          type="submit"
          className={`w-full py-3 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-4 ${
              action === 'BORROW' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          <Save size={20} />
          {action === 'BORROW' ? 'Record Utang' : 'Record Payment'}
        </button>
      </form>
    </div>
  );
};