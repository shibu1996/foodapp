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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products`);

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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#0E1214' }}>Products</h1>
          <p className="mt-2" style={{ color: '#6B7280' }}>
            Manage your restaurant menu items
          </p>
        </div>
        <button
          onClick={() => router.push('/products/new')}
          className="px-6 py-3 text-white rounded-xl transition-all font-medium"
          style={{ backgroundColor: '#E11D48' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
        >
          + Add New Product
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }}>
          <p style={{ color: '#E11D48' }}>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border" style={{ borderColor: '#E5E7EB' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#E11D48' }}></div>
          <p className="mt-4" style={{ color: '#6B7280' }}>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border" style={{ borderColor: '#E5E7EB' }}>
          <p className="mb-4" style={{ color: '#6B7280' }}>No products found</p>
          <button
            onClick={() => router.push('/products/new')}
            className="px-6 py-3 text-white rounded-xl transition-all font-medium"
            style={{ backgroundColor: '#E11D48' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        /* Products Table */
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid #E5E7EB' }}>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid #F3F4F6' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium" style={{ color: '#0E1214' }}>
                            {product.name}
                          </div>
                          <div className="text-sm" style={{ color: '#9CA3AF' }}>
                            {product.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: '#6B7280' }}>
                        {product.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize" style={{ color: '#6B7280' }}>
                        {product.type ? product.type.replace('-', ' ') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium" style={{ color: '#0E1214' }}>
                        {formatCurrency(product.price)}
                      </div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>
                        Sub: {formatCurrency(product.subscriptionPrice)}/day
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: product.isAvailable ? '#DCFCE7' : '#F3F4F6',
                          color: product.isAvailable ? '#16A34A' : '#6B7280'
                        }}
                      >
                        {product.isAvailable ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          router.push(`/products/${product._id}`)
                        }
                        className="font-medium text-sm transition-colors"
                        style={{ color: '#E11D48' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#BE123C'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#E11D48'}
                      >
                        View Details
                      </button>
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
        <div className="mt-4 text-sm" style={{ color: '#6B7280' }}>
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}



