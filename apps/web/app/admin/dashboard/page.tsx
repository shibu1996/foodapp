'use client';

import { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';

interface Stats {
  products: { total: number; active: number; inactive: number };
  orders: { total: number; totalRevenue: number; byStatus: any };
  subscriptions: { total: number; totalRevenue: number; byStatus: any };
}

const API_BASE_URL = 'http://localhost:5000';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [productsRes, ordersRes, subscriptionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/products/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/orders/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/subscriptions/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!productsRes.ok || !ordersRes.ok || !subscriptionsRes.ok) {
        throw new Error('Failed to fetch stats');
      }

      const [products, orders, subscriptions] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        subscriptionsRes.json(),
      ]);

      setStats({
        products: products.data,
        orders: orders.data,
        subscriptions: subscriptions.data,
      });
    } catch (err: any) {
      console.error('Error fetching stats:', err);
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening with your restaurant.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Products"
          value={stats?.products.total || 0}
          icon="📦"
          loading={loading}
          subtitle={`${stats?.products.active || 0} active`}
        />
        <StatsCard
          title="Total Orders"
          value={stats?.orders.total || 0}
          icon="🛒"
          loading={loading}
          subtitle="All time orders"
        />
        <StatsCard
          title="Subscriptions"
          value={stats?.subscriptions.total || 0}
          icon="📅"
          loading={loading}
          subtitle={`${stats?.subscriptions.byStatus?.active || 0} active`}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(
            (stats?.orders.totalRevenue || 0) +
              (stats?.subscriptions.totalRevenue || 0)
          )}
          icon="💰"
          loading={loading}
          subtitle="Orders + Subscriptions"
        />
      </div>

      {/* Additional Info Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orders Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Orders by Status
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.orders.byStatus || {}).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-600 capitalize">{status}</span>
                    <span className="font-semibold text-gray-900">{count as number}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Subscriptions Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Subscriptions by Status
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.subscriptions.byStatus || {}).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-600 capitalize">{status}</span>
                    <span className="font-semibold text-gray-900">{count as number}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
}

