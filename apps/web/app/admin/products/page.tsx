'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  price: number;
  subscriptionPrice: number;
  type: string;
  isVeg: boolean;
  isAvailable: boolean;
  image: string;
}

const API_BASE_URL = 'http://localhost:5000';

export default function ProductsListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, one-time, subscription
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [vegFilter, setVegFilter] = useState('all'); // all, veg, non-veg

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/food/products`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.data);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Type filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'one-time' && product.type !== 'one-time') return false;
      if (typeFilter === 'subscription' && product.type !== 'subscription') return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && !product.isAvailable) return false;
      if (statusFilter === 'inactive' && product.isAvailable) return false;
    }

    // Veg filter
    if (vegFilter !== 'all') {
      if (vegFilter === 'veg' && !product.isVeg) return false;
      if (vegFilter === 'non-veg' && product.isVeg) return false;
    }

    return true;
  });

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold" style={{ color: '#0E1214', fontSize: '1.875rem' }}>Products</h1>
          <p className="mt-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Manage your restaurant menu items
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/products/new')}
          className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
          style={{ backgroundColor: '#E11D48', fontSize: '0.875rem' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#BE123C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#E11D48';
          }}
        >
          <i className="fa-solid fa-plus"></i>
          Add New Product
        </button>
      </div>

      {/* Filters Section */}
      <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#6B7280', fontSize: '0.875rem' }}></i>
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-200 outline-none"
              style={{ 
                borderColor: '#E5E7EB',
                color: '#0E1214',
                fontSize: '0.875rem'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#E11D48';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            />
          </div>
        </div>

        {/* Type Filter Tabs */}
        <div className="mb-4">
          <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>Product Type</label>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Products', icon: 'fa-border-all' },
              { value: 'one-time', label: 'One-Time', icon: 'fa-shopping-bag' },
              { value: 'subscription', label: 'Subscription', icon: 'fa-calendar-check' }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setTypeFilter(type.value)}
                className="px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border"
                style={{
                  backgroundColor: typeFilter === type.value ? '#FEF2F2' : 'transparent',
                  borderColor: typeFilter === type.value ? '#E11D48' : '#E5E7EB',
                  color: typeFilter === type.value ? '#E11D48' : '#6B7280',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => {
                  if (typeFilter !== type.value) {
                    e.currentTarget.style.borderColor = '#E11D48';
                    e.currentTarget.style.color = '#E11D48';
                  }
                }}
                onMouseLeave={(e) => {
                  if (typeFilter !== type.value) {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.color = '#6B7280';
                  }
                }}
              >
                <i className={`fa-solid ${type.icon}`}></i>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
              style={{ 
                borderColor: '#E5E7EB',
                color: '#0E1214',
                backgroundColor: '#FFFFFF',
                fontSize: '0.875rem'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#E11D48';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Veg/Non-Veg Filter */}
          <div>
            <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>Food Type</label>
            <select
              value={vegFilter}
              onChange={(e) => setVegFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
              style={{ 
                borderColor: '#E5E7EB',
                color: '#0E1214',
                backgroundColor: '#FFFFFF',
                fontSize: '0.875rem'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#E11D48';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <option value="all">All Types</option>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || vegFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
                setVegFilter('all');
              }}
              className="font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              style={{ color: '#E11D48', fontSize: '0.875rem' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <i className="fa-solid fa-filter-circle-xmark"></i>
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: '#FEF2F2', borderColor: '#E11D48' }}>
          <p style={{ color: '#E11D48', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="rounded-xl shadow-sm p-8 text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ 
            border: '3px solid #FEF2F2',
            borderTop: '3px solid #E11D48'
          }}></div>
          <p className="mt-4" style={{ color: '#6B7280', fontSize: '0.875rem' }}>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl shadow-sm p-12 text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#FEF2F2' }}>
            <i className={`fa-solid ${products.length === 0 ? 'fa-box' : 'fa-filter-circle-xmark'} text-4xl`} style={{ color: '#E11D48' }}></i>
          </div>
          <p className="mb-2 font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>
            {products.length === 0 ? 'No products found' : 'No matching products'}
          </p>
          <p className="mb-6" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            {products.length === 0 
              ? 'Start by adding your first product to the menu' 
              : 'Try adjusting your filters or search query'}
          </p>
          {products.length === 0 ? (
            <button
              onClick={() => router.push('/admin/products/new')}
              className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 inline-flex items-center gap-2"
              style={{ backgroundColor: '#E11D48', fontSize: '0.875rem' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#BE123C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E11D48';
              }}
            >
              <i className="fa-solid fa-plus"></i>
              Add Your First Product
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
                setVegFilter('all');
              }}
              className="px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center gap-2 border"
              style={{ 
                color: '#E11D48',
                borderColor: '#E11D48',
                backgroundColor: 'transparent',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <i className="fa-solid fa-filter-circle-xmark"></i>
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        /* Products Table */
        <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Product
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Category
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Type
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Price
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr
                    key={product._id}
                    className="transition-colors"
                    style={{ borderBottom: index !== filteredProducts.length - 1 ? '1px solid #E5E7EB' : 'none' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 rounded-lg object-cover border"
                          style={{ borderColor: '#E5E7EB' }}
                        />
                        <div>
                          <div className="font-medium" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                            {product.name}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <i 
                              className="fa-solid fa-circle" 
                              style={{ color: product.isVeg ? '#10B981' : '#EF4444', fontSize: '0.625rem' }}
                            ></i>
                            <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                              {product.isVeg ? 'Veg' : 'Non-Veg'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                        {product.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                        {product.type ? product.type.replace('-', ' ') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold" style={{ color: '#E11D48', fontSize: '0.875rem' }}>
                        {formatCurrency(product.price)}
                      </div>
                      <div className="mt-1" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                        Sub: {formatCurrency(product.subscriptionPrice)}/day
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1.5 rounded-full font-medium inline-flex items-center gap-1.5"
                        style={{
                          backgroundColor: product.isAvailable ? '#D1FAE5' : '#F3F4F6',
                          color: product.isAvailable ? '#059669' : '#6B7280',
                          fontSize: '0.75rem'
                        }}
                      >
                        <i className={`fa-solid ${product.isAvailable ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                        {product.isAvailable ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === product._id ? null : product._id)}
                          className="p-2 rounded-lg transition-all duration-200"
                          style={{ 
                            color: '#6B7280',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F3F4F6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <i className="fa-solid fa-ellipsis-vertical text-lg"></i>
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdown === product._id && (
                          <>
                            {/* Backdrop */}
                            <div 
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            ></div>
                            
                            {/* Menu */}
                            <div 
                              className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border z-20"
                              style={{ 
                                backgroundColor: '#FFFFFF',
                                borderColor: '#E5E7EB'
                              }}
                            >
                              <div className="py-2">
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    router.push(`/admin/products/${product._id}`);
                                  }}
                                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200"
                                  style={{ color: '#0E1214', fontSize: '0.875rem' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                                    e.currentTarget.style.color = '#E11D48';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#0E1214';
                                  }}
                                >
                                  <i className="fa-solid fa-eye w-4"></i>
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    router.push(`/admin/products/${product._id}/edit`);
                                  }}
                                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200"
                                  style={{ color: '#0E1214', fontSize: '0.875rem' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#CFFAFE';
                                    e.currentTarget.style.color = '#0891B2';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#0E1214';
                                  }}
                                >
                                  <i className="fa-solid fa-pen-to-square w-4"></i>
                                  Edit Product
                                </button>
                                <div className="my-1 border-t" style={{ borderColor: '#E5E7EB' }}></div>
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                                      // TODO: Implement delete functionality
                                      console.log('Delete product:', product._id);
                                    }
                                  }}
                                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200"
                                  style={{ color: '#DC2626', fontSize: '0.875rem' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#FEE2E2';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <i className="fa-solid fa-trash w-4"></i>
                                  Delete Product
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Count */}
      {!loading && products.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-box"></i>
            Showing {filteredProducts.length} of {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
          {filteredProducts.length !== products.length && (
            <div style={{ color: '#E11D48', fontSize: '0.875rem' }}>
              <i className="fa-solid fa-filter"></i> Filters applied
            </div>
          )}
        </div>
      )}
    </div>
  );
}


