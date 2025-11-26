import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Save, X } from 'lucide-react';

interface ProductEntryProps {
  onSave: (product: Omit<Product, 'id'>) => void;
  onCancel: () => void;
  initialProduct?: Product | null;
}

export const ProductEntry: React.FC<ProductEntryProps> = ({ onSave, onCancel, initialProduct }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialProduct) {
        setName(initialProduct.name);
        setCategory(initialProduct.category);
        setPrice(initialProduct.price.toString());
        setCost(initialProduct.cost.toString());
        setStock(initialProduct.stock.toString());
        setLowStockThreshold(initialProduct.lowStockThreshold.toString());
    }
  }, [initialProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- VALIDATION ---
    if (!name.trim()) {
        setError("Product name is required.");
        return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
        setError("Price cannot be negative.");
        return;
    }
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
        setError("Stock cannot be negative.");
        return;
    }
    // ------------------

    onSave({
      name: name.trim(),
      category: category.trim() || 'General',
      price: numPrice,
      cost: Number(cost) || 0,
      stock: numStock,
      lowStockThreshold: Number(lowStockThreshold),
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-md mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{initialProduct ? 'Edit Product' : 'Add New Product'}</h2>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g., Kopiko Blanca"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g., Coffee"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₱) <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="0.00"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost (₱) <span className="text-gray-400 font-normal">(Opt)</span></label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="0"
              required
              min="0"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
             <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="10"
              min="0"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <Save size={20} />
          {initialProduct ? 'Update Product' : 'Save Product'}
        </button>
      </form>
    </div>
  );
};