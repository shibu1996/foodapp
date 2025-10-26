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
      
      // Create headers with optional auth token
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const [productsRes, ordersRes, subscriptionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/food/products/admin/stats`, { headers }),
        fetch(`${API_BASE_URL}/api/food/orders/admin/stats`, { headers }),
        fetch(`${API_BASE_URL}/api/food/subscriptions/admin/stats`, { headers }),
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
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bold" style={{ color: '#0E1214', fontSize: '1.875rem' }}>Dashboard</h1>
        <p className="mt-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Welcome back! Here's what's happening with your restaurant.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: '#FEF2F2', borderColor: '#E11D48' }}>
          <p style={{ color: '#E11D48', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Products"
          value={stats?.products.total || 0}
          icon="fa-solid fa-box"
          loading={loading}
          subtitle={`${stats?.products.active || 0} active`}
        />
        <StatsCard
          title="Total Orders"
          value={stats?.orders.total || 0}
          icon="fa-solid fa-shopping-cart"
          loading={loading}
          subtitle="All time orders"
        />
        <StatsCard
          title="Subscriptions"
          value={stats?.subscriptions.total || 0}
          icon="fa-solid fa-calendar-check"
          loading={loading}
          subtitle={`${stats?.subscriptions.byStatus?.active || 0} active`}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(
            (stats?.orders.totalRevenue || 0) +
              (stats?.subscriptions.totalRevenue || 0)
          )}
          icon="fa-solid fa-indian-rupee-sign"
          loading={loading}
          subtitle="Orders + Subscriptions"
        />
      </div>

      {/* Additional Info Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orders Breakdown */}
          <div className="rounded-xl shadow-sm p-6 border" style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E5E7EB'
          }}>
            <h3 className="font-semibold mb-4" style={{ color: '#0E1214', fontSize: '1rem' }}>
              Orders by Status
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.orders.byStatus || {}).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="capitalize" style={{ color: '#6B7280', fontSize: '0.875rem' }}>{status}</span>
                    <span className="font-semibold" style={{ color: '#E11D48', fontSize: '0.875rem' }}>{count as number}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Subscriptions Breakdown */}
          <div className="rounded-xl shadow-sm p-6 border" style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E5E7EB'
          }}>
            <h3 className="font-semibold mb-4" style={{ color: '#0E1214', fontSize: '1rem' }}>
              Subscriptions by Status
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.subscriptions.byStatus || {}).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="capitalize" style={{ color: '#6B7280', fontSize: '0.875rem' }}>{status}</span>
                    <span className="font-semibold" style={{ color: '#E11D48', fontSize: '0.875rem' }}>{count as number}</span>
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
          className="px-6 py-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          style={{ 
            backgroundColor: '#E11D48',
            fontSize: '0.875rem'
          }}
          onMouseEnter={(e: any) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#BE123C';
          }}
          onMouseLeave={(e: any) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#E11D48';
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
}


