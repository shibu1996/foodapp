'use client';

import { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import { useRouter } from 'next/navigation';

interface DashboardOverview {
  today: {
    orders: number;
    revenue: number;
  };
  thisMonth: {
    orders: number;
    revenue: number;
    orderGrowth: number;
    revenueGrowth: number;
  };
  overall: {
    totalCustomers: number;
    totalProducts: number;
    activeSubscriptions: number;
    pendingOrders: number;
  };
}

interface InventoryStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  inStockProducts: number;
  totalStockValue: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  userId: { name: string };
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface PopularProduct {
  productId: string;
  name: string;
  image: string;
  totalOrders: number;
  totalRevenue: number;
}

const API_BASE_URL = 'http://localhost:5000';

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard data
      try {
        const dashboardRes = await fetch(`${API_BASE_URL}/api/food/analytics/dashboard`);
        if (dashboardRes.ok) {
          const dashboard = await dashboardRes.json();
          if (dashboard.success) setDashboardData(dashboard.data);
        } else {
          console.warn('Dashboard API not available:', dashboardRes.status);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      }

      // Fetch inventory stats
      try {
        const inventoryRes = await fetch(`${API_BASE_URL}/api/food/inventory/stats`);
        if (inventoryRes.ok) {
          const inventory = await inventoryRes.json();
          if (inventory.success) setInventoryStats(inventory.data);
        } else {
          console.warn('Inventory API not available:', inventoryRes.status);
        }
      } catch (err) {
        console.error('Error fetching inventory:', err);
      }

      // Fetch recent orders
      try {
        const ordersRes = await fetch(`${API_BASE_URL}/api/food/orders?limit=5`);
        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          if (orders.success) setRecentOrders(orders.data);
        } else {
          console.warn('Orders API not available:', ordersRes.status);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      }

      // Fetch popular products
      try {
        const productsRes = await fetch(`${API_BASE_URL}/api/food/analytics/popular-products?limit=5`);
        if (productsRes.ok) {
          const products = await productsRes.json();
          if (products.success) setPopularProducts(products.data);
        } else {
          console.warn('Popular products API not available:', productsRes.status);
        }
      } catch (err) {
        console.error('Error fetching popular products:', err);
      }

      setError('');
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'active':
        return { bg: '#D1FAE5', color: '#059669' };
      case 'pending':
      case 'confirmed':
        return { bg: '#FEF3C7', color: '#F59E0B' };
      case 'cancelled':
      case 'paused':
        return { bg: '#FEE2E2', color: '#DC2626' };
      default:
        return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0E1214' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
        >
          <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-sync'} mr-2`}></i>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border flex items-center gap-2" style={{ backgroundColor: '#FEF2F2', borderColor: '#DC2626' }}>
          <i className="fa fa-exclamation-triangle" style={{ color: '#DC2626' }}></i>
          <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>{error}</p>
        </div>
      )}

      {/* Today's Stats */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Today's Orders</p>
            <p className="text-4xl font-bold mb-2">{dashboardData.today.orders}</p>
            <p className="text-sm opacity-90">Revenue: {formatCurrency(dashboardData.today.revenue)}</p>
          </div>
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">This Month's Revenue</p>
            <p className="text-4xl font-bold mb-2">{formatCurrency(dashboardData.thisMonth.revenue)}</p>
            <p className="text-sm opacity-90 flex items-center gap-1">
              <i className={`fa fa-arrow-${dashboardData.thisMonth.revenueGrowth >= 0 ? 'up' : 'down'}`}></i>
              {Math.abs(dashboardData.thisMonth.revenueGrowth)}% vs last month
            </p>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Total Customers</p>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                <i className="fa fa-users text-base" style={{ color: '#F59E0B' }}></i>
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#0E1214' }}>{dashboardData.overall.totalCustomers}</p>
          </div>

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Total Products</p>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                <i className="fa fa-box text-base" style={{ color: '#3B82F6' }}></i>
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#0E1214' }}>{dashboardData.overall.totalProducts}</p>
          </div>

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Active Subscriptions</p>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                <i className="fa fa-calendar-check text-base" style={{ color: '#059669' }}></i>
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#0E1214' }}>{dashboardData.overall.activeSubscriptions}</p>
          </div>

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Pending Orders</p>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                <i className="fa fa-clock text-base" style={{ color: '#DC2626' }}></i>
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#DC2626' }}>{dashboardData.overall.pendingOrders}</p>
          </div>
        </div>
      )}

      {/* Inventory & Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Inventory Alerts */}
        {inventoryStats && (
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#0E1214' }}>
                <i className="fa fa-warehouse mr-2" style={{ color: '#E11D48' }}></i>
                Inventory Overview
              </h3>
              <button
                onClick={() => router.push('/admin/inventory')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#F0FDF4' }}>
                <p className="text-xs" style={{ color: '#166534' }}>In Stock</p>
                <p className="text-xl font-bold" style={{ color: '#16A34A' }}>{inventoryStats.inStockProducts}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                <p className="text-xs" style={{ color: '#92400E' }}>Low Stock</p>
                <p className="text-xl font-bold" style={{ color: '#F59E0B' }}>{inventoryStats.lowStockProducts}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                <p className="text-xs" style={{ color: '#991B1B' }}>Out of Stock</p>
                <p className="text-xl font-bold" style={{ color: '#DC2626' }}>{inventoryStats.outOfStockProducts}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#EFF6FF' }}>
                <p className="text-xs" style={{ color: '#1E40AF' }}>Stock Value</p>
                <p className="text-lg font-bold" style={{ color: '#3B82F6' }}>₹{inventoryStats.totalStockValue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: '#0E1214' }}>
              <i className="fa fa-shopping-cart mr-2" style={{ color: '#E11D48' }}></i>
              Recent Orders
            </h3>
            <button
              onClick={() => router.push('/admin/orders')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#9CA3AF' }}>No recent orders</p>
            ) : (
              recentOrders.map((order) => {
                const statusStyle = getStatusColor(order.status);
                return (
                  <div key={order._id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#F3F4F6' }}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>#{order.orderNumber}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{order.userId?.name || 'Guest'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: '#0E1214' }}>{formatCurrency(order.totalAmount)}</p>
                      <span className="text-xs px-2 py-0.5 rounded capitalize" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Popular Products */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: '#0E1214' }}>
            <i className="fa fa-fire mr-2" style={{ color: '#E11D48' }}></i>
            Top Selling Products
          </h3>
          <button
            onClick={() => router.push('/admin/reports')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          >
            View Reports
          </button>
        </div>
        {popularProducts.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: '#9CA3AF' }}>No data available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularProducts.map((product, index) => (
              <div key={product.productId} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" 
                  style={{ backgroundColor: index === 0 ? '#F59E0B' : '#E5E7EB', color: index === 0 ? '#FFFFFF' : '#6B7280' }}>
                  {index + 1}
                </div>
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>{product.name}</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>{product.totalOrders} orders</p>
                </div>
                <p className="text-sm font-bold" style={{ color: '#059669' }}>
                  ₹{product.totalRevenue.toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 p-4 rounded-xl border" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: '#6B7280' }}>QUICK ACTIONS</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push('/admin/products/new')}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
          >
            + Add Product
          </button>
          <button
            onClick={() => router.push('/admin/orders')}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
          >
            <i className="fa fa-shopping-cart mr-2"></i>
            View Orders
          </button>
          <button
            onClick={() => router.push('/admin/inventory')}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}
          >
            <i className="fa fa-chart-bar mr-2"></i>
            Manage Inventory
          </button>
          <button
            onClick={() => router.push('/admin/settings')}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#6B7280', color: '#FFFFFF' }}
          >
            <i className="fa fa-cog mr-2"></i>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}


