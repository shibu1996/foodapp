'use client';

import { useState, useEffect } from 'react';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  isOutOfStock: boolean;
  image?: string;
}

interface InventoryStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  inStockProducts: number;
  totalStockValue: number;
}

interface StockHistoryItem {
  _id: string;
  productId: { name: string };
  previousStock: number;
  newStock: number;
  quantity: number;
  type: string;
  reason?: string;
  createdAt: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [stockHistory, setStockHistory] = useState<StockHistoryItem[]>([]);
  const [stockAction, setStockAction] = useState<'add' | 'remove' | 'set'>('add');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockReason, setStockReason] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    loadInventory();
    loadStats();
  }, [stockFilter, searchQuery]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        stockFilter,
        search: searchQuery
      });

      const response = await fetch(`${API_BASE_URL}/api/food/inventory?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/inventory/stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadStockHistory = async (productId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/inventory/${productId}/history`);
      const data = await response.json();

      if (data.success) {
        setStockHistory(data.data);
      }
    } catch (error) {
      console.error('Error loading stock history:', error);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || !stockQuantity) {
      alert('Please enter a quantity');
      return;
    }

    try {
      const quantity = stockAction === 'remove' ? -Math.abs(parseInt(stockQuantity)) : parseInt(stockQuantity);
      const endpoint = stockAction === 'set' 
        ? `${API_BASE_URL}/api/food/inventory/${selectedProduct._id}/set-stock`
        : `${API_BASE_URL}/api/food/inventory/${selectedProduct._id}/update-stock`;

      const body = stockAction === 'set'
        ? { stock: parseInt(stockQuantity), reason: stockReason }
        : { quantity, type: stockAction === 'add' ? 'added' : 'removed', reason: stockReason };

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        alert('Stock updated successfully!');
        setShowStockModal(false);
        setStockQuantity('');
        setStockReason('');
        loadInventory();
        loadStats();
      } else {
        alert(data.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const openStockModal = (product: Product, action: 'add' | 'remove' | 'set') => {
    setSelectedProduct(product);
    setStockAction(action);
    setShowStockModal(true);
  };

  const openHistoryModal = (product: Product) => {
    setSelectedProduct(product);
    loadStockHistory(product._id);
    setShowHistoryModal(true);
  };

  const getStockStatus = (product: Product) => {
    if (product.isOutOfStock || product.stock === 0) {
      return { label: 'Out of Stock', color: '#DC2626', bg: '#FEE2E2' };
    }
    if (product.stock <= product.lowStockThreshold) {
      return { label: 'Low Stock', color: '#F59E0B', bg: '#FEF3C7' };
    }
    return { label: 'In Stock', color: '#059669', bg: '#D1FAE5' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" 
          style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
          Inventory Management
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Manage product stock levels and monitor inventory
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Total Products</p>
            <p className="text-2xl font-bold" style={{ color: '#0E1214' }}>{stats.totalProducts}</p>
          </div>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>In Stock</p>
            <p className="text-2xl font-bold" style={{ color: '#059669' }}>{stats.inStockProducts}</p>
          </div>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Low Stock</p>
            <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{stats.lowStockProducts}</p>
          </div>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Out of Stock</p>
            <p className="text-2xl font-bold" style={{ color: '#DC2626' }}>{stats.outOfStockProducts}</p>
          </div>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Total Value</p>
            <p className="text-2xl font-bold" style={{ color: '#0E1214' }}>₹{stats.totalStockValue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border text-sm"
              style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Products' },
              { value: 'low', label: 'Low Stock' },
              { value: 'out', label: 'Out of Stock' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStockFilter(filter.value)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: stockFilter === filter.value ? '#E11D48' : '#F3F4F6',
                  color: stockFilter === filter.value ? '#FFFFFF' : '#6B7280'
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F9FAFB' }}>
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Product</th>
                <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Category</th>
                <th className="text-center px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Stock</th>
                <th className="text-center px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Alert Level</th>
                <th className="text-center px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Status</th>
                <th className="text-right px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 rounded-full animate-spin" 
                        style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <p className="text-sm" style={{ color: '#6B7280' }}>No products found</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <tr key={product._id} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>{product.name}</p>
                            <p className="text-xs" style={{ color: '#6B7280' }}>₹{product.price}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm" style={{ color: '#6B7280' }}>{product.category}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <p className="text-sm font-bold" style={{ color: '#0E1214' }}>{product.stock}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <p className="text-sm" style={{ color: '#6B7280' }}>{product.lowStockThreshold}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded text-xs font-semibold"
                          style={{ backgroundColor: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openStockModal(product, 'add')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{ backgroundColor: '#059669', color: '#FFFFFF' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                          >
                            Add
                          </button>
                          <button
                            onClick={() => openStockModal(product, 'remove')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => openStockModal(product, 'set')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                          >
                            Set
                          </button>
                          <button
                            onClick={() => openHistoryModal(product)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{ backgroundColor: '#6B7280', color: '#FFFFFF' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4B5563'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6B7280'}
                          >
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Update Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowStockModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" 
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Poppins, sans-serif' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>
              {stockAction === 'add' ? 'Add Stock' : stockAction === 'remove' ? 'Remove Stock' : 'Set Stock'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm font-semibold mb-1" style={{ color: '#6B7280' }}>Product</p>
              <p className="text-base font-bold" style={{ color: '#0E1214' }}>{selectedProduct.name}</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>Current Stock: {selectedProduct.stock}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                {stockAction === 'set' ? 'New Stock Quantity' : 'Quantity'}
              </label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                placeholder="Enter quantity"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                Reason (Optional)
              </label>
              <input
                type="text"
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                placeholder="e.g., New stock arrival"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStockModal(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {showHistoryModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHistoryModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Poppins, sans-serif' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>
              Stock History - {selectedProduct.name}
            </h3>
            
            {stockHistory.length === 0 ? (
              <p className="text-center py-8 text-sm" style={{ color: '#6B7280' }}>No stock history found</p>
            ) : (
              <div className="space-y-3">
                {stockHistory.map((item) => (
                  <div key={item._id} className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="px-2 py-1 rounded text-xs font-semibold capitalize"
                          style={{ 
                            backgroundColor: item.type === 'added' ? '#D1FAE5' : '#FEE2E2',
                            color: item.type === 'added' ? '#059669' : '#DC2626'
                          }}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: '#6B7280' }}>{formatDate(item.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span style={{ color: '#6B7280' }}>
                        {item.previousStock} → <span className="font-bold" style={{ color: '#0E1214' }}>{item.newStock}</span>
                      </span>
                      <span className="font-semibold" style={{ color: item.quantity > 0 ? '#059669' : '#DC2626' }}>
                        {item.quantity > 0 ? '+' : ''}{item.quantity}
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
                        Reason: {item.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full mt-4 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

