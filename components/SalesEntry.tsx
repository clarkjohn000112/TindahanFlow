import React, { useState, useEffect } from 'react';
import { TransactionType, PaymentMethod, Customer, Transaction, Product } from '../types';
import { Save, X, Search } from 'lucide-react';

interface SalesEntryProps {
  onSave: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  customers: Customer[];
  products: Product[];
  onCancel: () => void;
  initialType?: TransactionType;
  initialPaymentMethod?: PaymentMethod;
}

export const SalesEntry: React.FC<SalesEntryProps> = ({ 
  onSave, 
  customers, 
  products,
  onCancel,
  initialType = TransactionType.SALE,
  initialPaymentMethod = PaymentMethod.CASH
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPaymentMethod);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Auto-fill details when a product is selected
  useEffect(() => {
    if (selectedProductId) {
        const product = products.find(p => p.id === selectedProductId);
        if (product) {
            setAmount((product.price * quantity).toString());
            setDescription(`${quantity}x ${product.name}`);
        }
    }
  }, [selectedProductId, quantity, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    onSave({
      type,
      amount: Number(amount),
      description,
      paymentMethod,
      customerId: paymentMethod === PaymentMethod.CREDIT ? selectedCustomerId : undefined,
      productId: selectedProductId || undefined,
      quantity: quantity
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-md mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">New Transaction</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === TransactionType.SALE ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setType(TransactionType.SALE)}
          >
            Sale
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === TransactionType.EXPENSE ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => {
                setType(TransactionType.EXPENSE);
                setPaymentMethod(PaymentMethod.CASH);
                setSelectedProductId('');
            }}
          >
            Expense
          </button>
        </div>

        {type === TransactionType.SALE && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <label className="block text-xs font-bold text-blue-700 mb-2 uppercase">Select Product (Optional)</label>
                <select 
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none"
                >
                    <option value="">-- Generic Sale --</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} ( Stock: {p.stock} )
                        </option>
                    ))}
                </select>
                
                {selectedProductId && (
                     <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1">
                             <label className="block text-xs text-blue-600 mb-1">Quantity</label>
                             <input 
                                type="number" 
                                min="1" 
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full p-2 border border-blue-200 rounded-lg text-sm text-center"
                             />
                        </div>
                        <div className="flex-1 text-right">
                            <span className="block text-xs text-blue-600">Unit Price</span>
                            <span className="font-bold text-blue-800">₱{products.find(p => p.id === selectedProductId)?.price}</span>
                        </div>
                     </div>
                )}
            </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₱)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-bold"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder={type === TransactionType.SALE ? "e.g. 2 Coke, 1 Bread" : "e.g. Electricity Bill"}
            required
          />
        </div>

        {type === TransactionType.SALE && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value={PaymentMethod.CASH}>Cash</option>
                <option value={PaymentMethod.GCASH}>GCash</option>
                <option value={PaymentMethod.CREDIT}>Utang (Credit)</option>
              </select>
            </div>
        )}

        {type === TransactionType.SALE && paymentMethod === PaymentMethod.CREDIT && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <Save size={20} />
          Record Transaction
        </button>
      </form>
    </div>
  );
};