import React from 'react';
import { Product } from '../types';
import { AlertTriangle, Package, Plus, Trash2, Edit } from 'lucide-react';
import { CURRENCY } from '../constants';

interface InventoryProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onEditProduct, onDeleteProduct }) => {
  
  const handleDelete = (id: string, name: string) => {
      if (window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
          onDeleteProduct(id);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        <button 
            onClick={onAddProduct}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Product</span>
        </button>
      </div>

      {products.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium text-gray-600">Inventory is empty</p>
              <p className="mb-4">Start by adding your first product.</p>
              <button 
                onClick={onAddProduct}
                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
              >
                + Add Product
              </button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
                const isLowStock = product.stock <= product.lowStockThreshold;
                return (
                    <div key={product.id} className={`bg-white p-5 rounded-xl border ${isLowStock ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100'} shadow-sm transition-shadow hover:shadow-md relative group`}>
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onEditProduct(product)}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                title="Edit"
                            >
                                <Edit size={16} />
                            </button>
                            <button 
                                onClick={() => handleDelete(product.id, product.name)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex justify-between items-start mb-2 pr-16">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isLowStock ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                                    <Package size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 truncate max-w-[150px]">{product.name}</h3>
                                    <p className="text-xs text-gray-500">{product.category}</p>
                                </div>
                            </div>
                            {isLowStock && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center gap-1">
                                    <AlertTriangle size={12} /> Low
                                </span>
                            )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="font-semibold text-gray-800">{CURRENCY}{product.price}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Stock</p>
                                <p className={`font-semibold ${isLowStock ? 'text-orange-600' : 'text-gray-800'}`}>{product.stock} pcs</p>
                            </div>
                        </div>
                    </div>
                )
            })}
          </div>
      )}
    </div>
  );
};