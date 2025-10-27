'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
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

interface PopularProduct {
  productId: string;
  name: string;
  image: string;
  category: string;
  totalOrders: number;
  totalQuantity: number;
  totalRevenue: number;
}

interface CustomerInsights {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  retentionRate: number;
  topCustomers: any[];
}

interface RevenueData {
  totalRevenue: number;
  totalOrders: number;
  subscriptionRevenue: number;
  totalSubscriptions: number;
  grandTotal: number;
  paymentMethodBreakdown: any[];
  deliveryTypeBreakdown: any[];
}

interface ExpenseSummary {
  totalExpenses: number;
  expensesByCategory: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
  recentExpenses: any[];
}

type DateFilter = 'daily' | 'monthly' | 'yearly';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsights | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'products' | 'customers' | 'expenses'>('overview');
  const [dateFilter, setDateFilter] = useState<DateFilter>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    // Set default date range based on filter
    const today = new Date();
    let start = new Date();
    
    if (dateFilter === 'daily') {
      start = today;
    } else if (dateFilter === 'monthly') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (dateFilter === 'yearly') {
      start = new Date(today.getFullYear(), 0, 1);
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, [dateFilter]);

  useEffect(() => {
    if (startDate && endDate) {
      loadAllData();
    }
  }, [startDate, endDate]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadDashboardStats(),
        loadPopularProducts(),
        loadCustomerInsights(),
        loadRevenueData(),
        loadExpenseSummary()
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/analytics/dashboard`);
      const data = await response.json();
      if (data.success) {
        setDashboardStats(data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadPopularProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/analytics/popular-products?limit=10`);
      const data = await response.json();
      if (data.success) {
        setPopularProducts(data.data);
      }
    } catch (error) {
      console.error('Error loading popular products:', error);
    }
  };

  const loadCustomerInsights = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/analytics/customer-insights`);
      const data = await response.json();
      if (data.success) {
        setCustomerInsights(data.data);
      }
    } catch (error) {
      console.error('Error loading customer insights:', error);
    }
  };

  const loadRevenueData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/analytics/revenue`);
      const data = await response.json();
      if (data.success) {
        setRevenueData(data.data);
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    }
  };

  const loadExpenseSummary = async () => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate
      });
      const response = await fetch(`${API_BASE_URL}/api/food/expenses/summary?${params}`);
      const data = await response.json();
      if (data.success) {
        setExpenseSummary(data.data);
      }
    } catch (error) {
      console.error('Error loading expense summary:', error);
    }
  };

  const calculateProfitLoss = () => {
    if (!revenueData || !expenseSummary) return { profit: 0, loss: 0, net: 0 };
    
    const totalRevenue = revenueData.grandTotal;
    const totalExpenses = expenseSummary.totalExpenses;
    const net = totalRevenue - totalExpenses;
    
    return {
      totalRevenue,
      totalExpenses,
      net,
      isProfit: net >= 0
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" 
          style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const profitLoss = calculateProfitLoss();

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
              Reports & Analytics
            </h1>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Comprehensive business insights and performance metrics
            </p>
          </div>
          
          {/* Date Filters */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: '#F3F4F6' }}>
              {(['daily', 'monthly', 'yearly'] as DateFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className="px-4 py-2 rounded-md text-sm font-semibold transition-all capitalize"
                  style={{
                    backgroundColor: dateFilter === filter ? '#E11D48' : 'transparent',
                    color: dateFilter === filter ? '#FFFFFF' : '#6B7280'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold" style={{ color: '#6B7280' }}>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold" style={{ color: '#6B7280' }}>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
            />
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {dashboardStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Today's Orders</p>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                  <svg className="w-5 h-5" style={{ color: '#3B82F6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
                {dashboardStats.today.orders}
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                ₹{dashboardStats.today.revenue.toLocaleString('en-IN')} revenue
              </p>
            </div>

            <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>This Month</p>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                  <svg className="w-5 h-5" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
                {dashboardStats.thisMonth.orders}
              </p>
              <p className="text-xs flex items-center gap-1" style={{ color: dashboardStats.thisMonth.orderGrowth >= 0 ? '#059669' : '#DC2626' }}>
                <svg className={`w-3 h-3 ${dashboardStats.thisMonth.orderGrowth < 0 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {Math.abs(dashboardStats.thisMonth.orderGrowth)}% vs last month
              </p>
            </div>

            <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Total Customers</p>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                  <svg className="w-5 h-5" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
                {dashboardStats.overall.totalCustomers}
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Registered users
              </p>
            </div>

            <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Pending Orders</p>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                  <svg className="w-5 h-5" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: '#DC2626' }}>
                {dashboardStats.overall.pendingOrders}
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Needs attention
              </p>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 opacity-90">This Month's Revenue</p>
                <p className="text-4xl font-bold mb-2">
                  ₹{dashboardStats.thisMonth.revenue.toLocaleString('en-IN')}
                </p>
                <p className="text-sm flex items-center gap-1 opacity-90">
                  <svg className={`w-4 h-4 ${dashboardStats.thisMonth.revenueGrowth < 0 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {Math.abs(dashboardStats.thisMonth.revenueGrowth)}% growth from last month
                </p>
              </div>
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Profit/Loss Analysis */}
      {revenueData && expenseSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>Total Revenue</p>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                <svg className="w-5 h-5" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#059669' }}>
              ₹{profitLoss.totalRevenue?.toLocaleString('en-IN') || 0}
            </p>
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
              From all sources
            </p>
          </div>

          <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>Total Expenses</p>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                <svg className="w-5 h-5" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#DC2626' }}>
              ₹{profitLoss.totalExpenses?.toLocaleString('en-IN') || 0}
            </p>
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
              All categories
            </p>
          </div>

          <div className="rounded-xl border p-5" style={{ 
            backgroundColor: profitLoss.isProfit ? '#ECFDF5' : '#FEF2F2',
            borderColor: profitLoss.isProfit ? '#BBF7D0' : '#FECACA'
          }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: profitLoss.isProfit ? '#065F46' : '#991B1B' }}>
                Net {profitLoss.isProfit ? 'Profit' : 'Loss'}
              </p>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                backgroundColor: profitLoss.isProfit ? '#059669' : '#DC2626'
              }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={profitLoss.isProfit ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: profitLoss.isProfit ? '#059669' : '#DC2626' }}>
              ₹{Math.abs(profitLoss.net || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs mt-1" style={{ color: profitLoss.isProfit ? '#065F46' : '#991B1B' }}>
              {profitLoss.isProfit ? 'Revenue - Expenses' : 'Expenses exceed revenue'}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border overflow-hidden mb-6" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex border-b" style={{ borderColor: '#E5E7EB' }}>
          {[
            { id: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { id: 'revenue', label: 'Revenue', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'expenses', label: 'Expenses', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
            { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'customers', label: 'Customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 px-6 py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              style={{
                color: activeTab === tab.id ? '#E11D48' : '#6B7280',
                borderBottom: activeTab === tab.id ? '2px solid #E11D48' : '2px solid transparent'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Popular Products */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>Top Selling Products</h3>
                <div className="space-y-3">
                  {popularProducts.slice(0, 5).map((product, index) => (
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
              </div>

              {/* Customer Insights */}
              {customerInsights && (
                <div>
                  <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>Customer Insights</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                      <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Active Customers</p>
                      <p className="text-xl font-bold" style={{ color: '#0E1214' }}>{customerInsights.activeCustomers}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                      <p className="text-xs mb-1" style={{ color: '#6B7280' }}>New (30 days)</p>
                      <p className="text-xl font-bold" style={{ color: '#0E1214' }}>{customerInsights.newCustomers}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                      <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Repeat Customers</p>
                      <p className="text-xl font-bold" style={{ color: '#0E1214' }}>{customerInsights.repeatCustomers}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
                      <p className="text-xs mb-1" style={{ color: '#065F46' }}>Retention Rate</p>
                      <p className="text-xl font-bold" style={{ color: '#065F46' }}>{customerInsights.retentionRate}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && revenueData && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <p className="text-sm mb-1" style={{ color: '#166534' }}>Orders Revenue</p>
                  <p className="text-2xl font-bold" style={{ color: '#16A34A' }}>
                    ₹{revenueData.totalRevenue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#166534' }}>
                    From {revenueData.totalOrders} orders
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                  <p className="text-sm mb-1" style={{ color: '#1E40AF' }}>Subscription Revenue</p>
                  <p className="text-2xl font-bold" style={{ color: '#3B82F6' }}>
                    ₹{revenueData.subscriptionRevenue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#1E40AF' }}>
                    From {revenueData.totalSubscriptions} subscriptions
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <p className="text-sm mb-1" style={{ color: '#991B1B' }}>Grand Total</p>
                  <p className="text-2xl font-bold" style={{ color: '#DC2626' }}>
                    ₹{revenueData.grandTotal.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#991B1B' }}>
                    Overall revenue
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <div>
                  <h3 className="text-base font-bold mb-3" style={{ color: '#0E1214' }}>By Payment Method</h3>
                  <div className="space-y-2">
                    {revenueData.paymentMethodBreakdown.map((method) => (
                      <div key={method._id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                        <div>
                          <p className="text-sm font-semibold capitalize" style={{ color: '#0E1214' }}>
                            {method._id || 'Not specified'}
                          </p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>{method.count} orders</p>
                        </div>
                        <p className="text-sm font-bold" style={{ color: '#059669' }}>
                          ₹{method.revenue.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Types */}
                <div>
                  <h3 className="text-base font-bold mb-3" style={{ color: '#0E1214' }}>By Delivery Type</h3>
                  <div className="space-y-2">
                    {revenueData.deliveryTypeBreakdown.map((type) => (
                      <div key={type._id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                        <div>
                          <p className="text-sm font-semibold capitalize" style={{ color: '#0E1214' }}>
                            {type._id || 'Not specified'}
                          </p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>{type.count} orders</p>
                        </div>
                        <p className="text-sm font-bold" style={{ color: '#059669' }}>
                          ₹{type.revenue.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>All Popular Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-start gap-3 p-4 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" 
                      style={{ 
                        backgroundColor: index < 3 ? '#F59E0B' : '#E5E7EB', 
                        color: index < 3 ? '#FFFFFF' : '#6B7280' 
                      }}>
                      {index + 1}
                    </div>
                    {product.image && (
                      <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-1" style={{ color: '#0E1214' }}>{product.name}</p>
                      <p className="text-xs mb-2" style={{ color: '#6B7280' }}>{product.category}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span style={{ color: '#6B7280' }}>{product.totalOrders} orders</span>
                        <span style={{ color: '#6B7280' }}>{product.totalQuantity} units</span>
                        <span className="font-bold" style={{ color: '#059669' }}>
                          ₹{product.totalRevenue.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && customerInsights && (
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>Top Customers by Lifetime Value</h3>
              <div className="space-y-3">
                {customerInsights.topCustomers.map((customer, index) => (
                  <div key={customer.userId} className="flex items-center gap-3 p-4 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" 
                      style={{ backgroundColor: index === 0 ? '#E11D48' : '#E5E7EB', color: index === 0 ? '#FFFFFF' : '#6B7280' }}>
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold" 
                      style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}>
                      {customer.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: '#0E1214' }}>{customer.name}</p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: '#059669' }}>
                        ₹{customer.totalSpent.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        {customer.totalOrders} orders • ₹{customer.averageOrderValue.toFixed(0)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && expenseSummary && (
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>Expense Breakdown by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {expenseSummary.expensesByCategory.map((category) => (
                  <div key={category._id} className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold" style={{ color: '#0E1214' }}>{category._id}</p>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                        <svg className="w-4 h-4" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-2xl font-bold mb-1" style={{ color: '#DC2626' }}>
                      ₹{category.total.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {category.count} {category.count === 1 ? 'expense' : 'expenses'}
                    </p>
                  </div>
                ))}
              </div>

              {expenseSummary.recentExpenses && expenseSummary.recentExpenses.length > 0 && (
                <>
                  <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>Recent Expenses</h3>
                  <div className="space-y-3">
                    {expenseSummary.recentExpenses.map((expense: any) => (
                      <div key={expense._id} className="flex items-center gap-3 p-4 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                          <svg className="w-5 h-5" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold mb-1" style={{ color: '#0E1214' }}>{expense.name}</p>
                          <div className="flex items-center gap-3 text-xs" style={{ color: '#6B7280' }}>
                            <span className="px-2 py-1 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                              {expense.category}
                            </span>
                            <span>{new Date(expense.date).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                        <p className="text-lg font-bold" style={{ color: '#DC2626' }}>
                          ₹{expense.amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

