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
    if (!name || !price || !stock) return;

    onSave({
      name,
      category: category || 'General',
      price: Number(price),
      cost: Number(cost) || 0,
      stock: Number(stock),
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₱)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="0.00"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost (₱) <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="0.00"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
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