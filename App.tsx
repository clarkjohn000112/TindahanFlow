import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { UtangManager } from './components/UtangManager';
import { Inventory } from './components/Inventory';
import { SalesEntry } from './components/SalesEntry';
import { ProductEntry } from './components/ProductEntry';
import { CustomerEntry } from './components/CustomerEntry';
import { DebtEntry } from './components/DebtEntry';
import { SmartAssistant } from './components/SmartAssistant';
import { View, Transaction, Customer, Product, TransactionType, PaymentMethod } from './types';
import { Plus, Loader2 } from 'lucide-react';
import { 
  initDB, 
  getTransactions, 
  getCustomers, 
  getProducts, 
  addTransaction, 
  addProduct,
  addCustomer,
  updateCustomerDebt, 
  decrementProductStock,
  updateProduct,
  deleteProduct,
  updateCustomer,
  deleteCustomer,
  resetDatabase,
  refreshCache
} from './services/database';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // App State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Modal States
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomerForDebt, setSelectedCustomerForDebt] = useState<Customer | null>(null);
  
  // Editing State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Config for Sales Modal (for Quick Actions)
  const [salesModalConfig, setSalesModalConfig] = useState<{type: TransactionType, method: PaymentMethod}>({
      type: TransactionType.SALE,
      method: PaymentMethod.CASH
  });

  // Initialize DB and fetch data
  useEffect(() => {
    const initialize = async () => {
        try {
            await initDB();
            loadLocalData();
        } catch (error) {
            console.error("Failed to initialize DB", error);
        } finally {
            setIsLoading(false);
        }
    };
    initialize();
  }, []);

  const loadLocalData = () => {
    setTransactions(getTransactions());
    setCustomers(getCustomers());
    setProducts(getProducts());
  };

  const handleQuickAction = (action: 'SALE' | 'EXPENSE' | 'UTANG') => {
    if (action === 'SALE') {
        setSalesModalConfig({ type: TransactionType.SALE, method: PaymentMethod.CASH });
        setShowSalesModal(true);
    } else if (action === 'EXPENSE') {
        setSalesModalConfig({ type: TransactionType.EXPENSE, method: PaymentMethod.CASH });
        setShowSalesModal(true);
    } else if (action === 'UTANG') {
        setSalesModalConfig({ type: TransactionType.SALE, method: PaymentMethod.CREDIT });
        setShowSalesModal(true);
    }
  };

  const handleReset = async () => {
      if (window.confirm("WARNING: This will delete ALL current data from your Google Sheet.\n\nAre you sure you want to reset?")) {
          setIsLoading(true);
          await resetDatabase();
          loadLocalData();
          setIsLoading(false);
      }
  };

  const handleSaveTransaction = async (newTxData: Omit<Transaction, 'id' | 'date'>) => {
    setIsSaving(true);
    const newTx: Transaction = {
      ...newTxData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };

    try {
        // 1. Save Transaction to Cloud
        await addTransaction(newTx);
        
        // 2. Update Inventory (Specific product decrement)
        if (newTx.productId && newTx.type === TransactionType.SALE) {
            await decrementProductStock(newTx.productId, newTx.quantity || 1);
        }
        
        // 3. Update Utang if applicable
        if (newTx.customerId) {
            if (newTx.type === TransactionType.SALE && newTx.paymentMethod === PaymentMethod.CREDIT) {
                // Borrowing (Adding to debt)
                await updateCustomerDebt(newTx.customerId, newTx.amount, newTx.date);
            } else if (newTx.type === TransactionType.PAYMENT_RECEIVED) {
                // Paying (Reducing debt)
                await updateCustomerDebt(newTx.customerId, -newTx.amount, newTx.date);
            }
        }

        // 4. Refresh UI
        loadLocalData();
        setShowSalesModal(false);
        setSelectedCustomerForDebt(null);
    } catch (e) {
        alert("Failed to save transaction. Please check internet connection.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    setIsSaving(true);
    try {
        if (editingProduct) {
            const updatedProd = { ...productData, id: editingProduct.id };
            await updateProduct(updatedProd);
            setEditingProduct(null);
        } else {
            const newProduct: Product = {
                ...productData,
                id: Math.random().toString(36).substr(2, 9),
            };
            await addProduct(newProduct);
        }
        loadLocalData();
        setShowProductModal(false);
    } catch (e) {
        alert("Failed to save product.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
      if (window.confirm("Are you sure you want to delete this product?")) {
          setIsSaving(true);
          await deleteProduct(id);
          loadLocalData();
          setIsSaving(false);
      }
  };

  const handleSaveCustomer = async (customerData: Omit<Customer, 'id' | 'lastTransactionDate'>) => {
    setIsSaving(true);
    try {
        if (editingCustomer) {
            const updatedCust = { 
                ...customerData, 
                id: editingCustomer.id, 
                lastTransactionDate: editingCustomer.lastTransactionDate 
            };
            await updateCustomer(updatedCust);
            setEditingCustomer(null);
        } else {
            const newCustomer: Customer = {
              ...customerData,
              id: Math.random().toString(36).substr(2, 9),
              lastTransactionDate: customerData.totalDebt > 0 ? new Date().toISOString() : undefined,
            };
            await addCustomer(newCustomer);
        }
        loadLocalData();
        setShowCustomerModal(false);
    } catch (e) {
        alert("Failed to save customer.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
      // Balance check logic is inside UtangManager, this is just the raw delete
      setIsSaving(true);
      await deleteCustomer(id);
      loadLocalData();
      setIsSaving(false);
  }

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <p>Syncing with Google Sheets...</p>
            </div>
        );
    }

    switch (currentView) {
      case 'DASHBOARD':
        return (
            <>
                <SmartAssistant 
                    transactions={transactions} 
                    products={products} 
                    customers={customers} 
                />
                <Dashboard 
                    transactions={transactions} 
                    customers={customers} 
                    products={products} 
                    onQuickAction={handleQuickAction}
                />
            </>
        );
      case 'SALES':
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
                    <button 
                        onClick={() => {
                            setSalesModalConfig({ type: TransactionType.SALE, method: PaymentMethod.CASH });
                            setShowSalesModal(true);
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus size={18} /> New Entry
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                             <p>No transactions recorded yet.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Desc</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-sm text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm font-medium text-gray-800">{t.description}</td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                                t.type === TransactionType.SALE ? 'bg-emerald-100 text-emerald-700' : 
                                                t.type === TransactionType.PAYMENT_RECEIVED ? 'bg-blue-100 text-blue-700' :
                                                'bg-rose-100 text-rose-700'
                                            }`}>
                                                {t.type === TransactionType.PAYMENT_RECEIVED ? 'PAYMENT' : t.type}
                                            </span>
                                        </td>
                                        <td className={`p-4 text-sm font-bold text-right ${
                                            t.type === TransactionType.EXPENSE ? 'text-rose-600' : 'text-emerald-600'
                                        }`}>
                                            {t.type === TransactionType.EXPENSE ? '-' : '+'}₱{t.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        );
      case 'UTANG':
        return (
            <UtangManager 
                customers={customers} 
                onAddCustomer={() => {
                    setEditingCustomer(null);
                    setShowCustomerModal(true);
                }} 
                onManageDebt={(customer) => setSelectedCustomerForDebt(customer)}
                onEditCustomer={(customer) => {
                    setEditingCustomer(customer);
                    setShowCustomerModal(true);
                }}
                onDeleteCustomer={handleDeleteCustomer}
            />
        );
      case 'INVENTORY':
        return <Inventory 
            products={products} 
            onAddProduct={() => {
                setEditingProduct(null);
                setShowProductModal(true);
            }} 
            onEditProduct={(product) => {
                setEditingProduct(product);
                setShowProductModal(true);
            }}
            onDeleteProduct={handleDeleteProduct}
        />;
      default:
        return (
            <Dashboard 
                transactions={transactions} 
                customers={customers} 
                products={products} 
                onQuickAction={handleQuickAction}
            />
        );
    }
  };

  return (
    <Layout 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onReset={handleReset}
    >
        {isSaving && (
            <div className="fixed inset-0 bg-black/20 z-[60] flex items-center justify-center cursor-wait">
                <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
                    <Loader2 className="animate-spin text-indigo-600" />
                    <span className="font-medium text-gray-700">Saving to Cloud...</span>
                </div>
            </div>
        )}

        {showSalesModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center p-4 pt-12 pb-24">
                    <SalesEntry 
                        onSave={handleSaveTransaction} 
                        customers={customers} 
                        products={products}
                        onCancel={() => setShowSalesModal(false)}
                        initialType={salesModalConfig.type}
                        initialPaymentMethod={salesModalConfig.method}
                    />
                </div>
            </div>
        )}
        
        {showProductModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center p-4 pt-12 pb-24">
                    <ProductEntry 
                        onSave={handleSaveProduct} 
                        onCancel={() => setShowProductModal(false)}
                        initialProduct={editingProduct}
                    />
                </div>
            </div>
        )}

        {showCustomerModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center p-4 pt-12 pb-24">
                    <CustomerEntry 
                        onSave={handleSaveCustomer} 
                        onCancel={() => setShowCustomerModal(false)}
                        initialCustomer={editingCustomer}
                    />
                </div>
            </div>
        )}

        {selectedCustomerForDebt && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center p-4 pt-12 pb-24">
                    <DebtEntry 
                        customer={selectedCustomerForDebt}
                        products={products}
                        onSave={handleSaveTransaction} 
                        onCancel={() => setSelectedCustomerForDebt(null)}
                    />
                </div>
            </div>
        )}

        {renderContent()}
    </Layout>
  );
};

export default App;