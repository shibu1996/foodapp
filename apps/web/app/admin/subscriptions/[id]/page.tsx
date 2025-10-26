'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API_BASE_URL = 'http://localhost:5000';

interface Subscription {
  _id: string;
  subscriptionNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  productId: {
    _id: string;
    name: string;
    image?: string;
  };
  productName: string;
  basePrice: number;
  duration: number;
  startDate: string;
  endDate: string;
  deliverySlot: string;
  deliveryAddress: {
    houseNo: string;
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
  };
  addons: { name: string; price: number }[];
  skipDays: { date: string; reason?: string }[];
  dailyMeals: any[];
  maxSkipDays: number;
  status: string;
  subtotal: number;
  addonsTotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryCount: number;
  completedDeliveries: number;
  autoRenewal: boolean;
  createdAt: string;
}

export default function AdminSubscriptionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (params?.id) {
      // First load with loading state
      fetchSubscriptionDetails(false, false);
    }
    
    // Auto-refresh every 5 seconds in background (silent updates)
    const interval = setInterval(() => {
      if (params?.id) {
        fetchSubscriptionDetails(false, true);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [params?.id]);

  const fetchSubscriptionDetails = async (showRefreshingState = false, isBackgroundRefresh = false) => {
    // Prevent multiple simultaneous requests
    if (isFetching) {
      console.log('Already fetching, skipping...');
      return;
    }

    try {
      setIsFetching(true);
      
      // Only show loading state on first load or manual refresh
      if (showRefreshingState) {
        setRefreshing(true);
      } else if (!isBackgroundRefresh) {
        setLoading(true);
      }
      
      const token = localStorage.getItem('token');
      
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/food/subscriptions/admin/${params?.id}`, { 
        headers,
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch subscription details: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success !== false) {
        setSubscription(data.data || null);
        // Clear error on successful refresh
        if (error) {
          setError('');
        }
      }
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      // Only set error on first load, not on background refresh
      if (!isBackgroundRefresh) {
        setError(err.message || 'Failed to load subscription details');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsFetching(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: { bg: '#D1FAE5', text: '#059669' },
      paused: { bg: '#FEF3C7', text: '#D97706' },
      cancelled: { bg: '#FEE2E2', text: '#DC2626' },
      completed: { bg: '#DBEAFE', text: '#2563EB' },
      expired: { bg: '#F3F4F6', text: '#6B7280' },
    };
    return colors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  const getRemainingDays = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getProgressPercentage = () => {
    if (!subscription) return 0;
    return Math.round((subscription.completedDeliveries / subscription.deliveryCount) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="h-8 rounded w-1/4 mb-6" style={{ backgroundColor: '#F3F4F6' }}></div>
        <div className="h-64 rounded-xl mb-6" style={{ backgroundColor: '#F3F4F6' }}></div>
        <div className="h-96 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}></div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
          <i className="fa-solid fa-circle-exclamation text-4xl" style={{ color: '#DC2626' }}></i>
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: '#0E1214' }}>Subscription Not Found</h3>
        <p className="text-sm mb-6" style={{ color: '#6B7280' }}>{error || 'This subscription does not exist or has been deleted'}</p>
        <button
          onClick={() => router.push('/admin/subscriptions')}
          className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          Back to Subscriptions
        </button>
      </div>
    );
  }

  const statusColor = getStatusColor(subscription.status);
  const progressPercentage = getProgressPercentage();

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
            <button
              onClick={() => router.push('/admin/subscriptions')}
              className="flex items-center gap-2 mb-4 text-sm font-semibold transition-all duration-200"
              style={{ color: '#6B7280' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#E11D48'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              <i className="fa-solid fa-arrow-left"></i>
              Back to Subscriptions
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold" style={{ color: '#0E1214', fontSize: '1.875rem' }}>
                  Subscription Details
                </h1>
                <p className="mt-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                  Complete information about subscription #{subscription.subscriptionNumber}
                </p>
              </div>
              <button
                onClick={() => fetchSubscriptionDetails(true)}
                disabled={refreshing}
                className="px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: '#E11D48', fontSize: '0.75rem' }}
                onMouseEnter={(e) => {
                  if (!refreshing) e.currentTarget.style.backgroundColor = '#BE123C';
                }}
                onMouseLeave={(e) => {
                  if (!refreshing) e.currentTarget.style.backgroundColor = '#E11D48';
                }}
              >
                <i className={`fa-solid fa-rotate ${refreshing ? 'fa-spin' : ''}`}></i>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Section - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Info Card */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: '#F3F4F6' }}>
                    {subscription.productId?.image ? (
                      <img 
                        src={subscription.productId.image} 
                        alt={subscription.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-utensils text-3xl" style={{ color: '#9CA3AF' }}></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h2 className="text-xl font-bold mb-1" style={{ color: '#0E1214' }}>
                          {subscription.productName}
                        </h2>
                        <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
                          #{subscription.subscriptionNumber}
                        </p>
                      </div>
                      <span 
                        className="px-3 py-1 rounded-lg text-xs font-bold uppercase"
                        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                      >
                        {subscription.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: '#6B7280' }}>
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-calendar-days"></i>
                        <span className="font-semibold">{subscription.duration} days plan</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-clock"></i>
                        <span className="font-semibold">{subscription.deliverySlot}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {subscription.status === 'active' && (
                  <div className="mt-6">
                    <div className="flex justify-between text-xs mb-2">
                      <span style={{ color: '#6B7280' }}>Delivery Progress</span>
                      <span className="font-bold" style={{ color: '#E11D48' }}>
                        {subscription.completedDeliveries}/{subscription.deliveryCount} delivered
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          backgroundColor: '#E11D48',
                          width: `${progressPercentage}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs mt-2 text-center font-semibold" style={{ color: '#E11D48' }}>
                      {progressPercentage}% Complete • {getRemainingDays(subscription.endDate)} days remaining
                    </p>
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <h3 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>Customer Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Name</p>
                    <p className="text-sm font-bold" style={{ color: '#0E1214' }}>
                      {subscription.userId?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Phone</p>
                    <p className="text-sm font-bold" style={{ color: '#0E1214' }}>
                      {subscription.userId?.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg md:col-span-2" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Email</p>
                    <p className="text-sm font-bold" style={{ color: '#0E1214' }}>
                      {subscription.userId?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <h3 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>Subscription Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Start Date</p>
                    <p className="text-sm font-bold" style={{ color: '#0E1214' }}>
                      {formatDate(subscription.startDate)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>End Date</p>
                    <p className="text-sm font-bold" style={{ color: '#0E1214' }}>
                      {formatDate(subscription.endDate)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Delivery Time</p>
                    <p className="text-sm font-bold" style={{ color: '#0E1214' }}>
                      {subscription.deliverySlot}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Auto Renewal</p>
                    <p className="text-sm font-bold" style={{ color: '#0E1214' }}>
                      {subscription.autoRenewal ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Base Price</p>
                    <p className="text-sm font-bold" style={{ color: '#E11D48' }}>
                      {formatCurrency(subscription.basePrice)}/day
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Created On</p>
                    <p className="text-sm font-bold" style={{ color: '#0E1214' }}>
                      {formatDate(subscription.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              {subscription.addons && subscription.addons.length > 0 && (
                <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                  <h3 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>Add-ons</h3>
                  <div className="space-y-2">
                    {subscription.addons.map((addon, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                            <i className="fa-solid fa-plus text-sm" style={{ color: '#E11D48' }}></i>
                          </div>
                          <div>
                            <span className="text-sm font-semibold block" style={{ color: '#0E1214' }}>{addon.name}</span>
                            <span className="text-xs" style={{ color: '#6B7280' }}>
                              {formatCurrency(addon.price)}/day × {subscription.duration} days
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#E11D48' }}>
                          +{formatCurrency(addon.price * subscription.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skip Days */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>Skip Days</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                    {subscription.skipDays?.length || 0}/{subscription.maxSkipDays} used
                  </span>
                </div>
                {subscription.skipDays && subscription.skipDays.length > 0 ? (
                  <div className="space-y-2">
                    {subscription.skipDays.map((skip, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-xmark text-sm" style={{ color: '#D97706' }}></i>
                          <span className="text-sm font-semibold" style={{ color: '#D97706' }}>
                            {formatDate(skip.date)}
                          </span>
                        </div>
                        {skip.reason && (
                          <span className="text-xs" style={{ color: '#92400E' }}>{skip.reason}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: '#6B7280' }}>
                    No skip days scheduled
                  </p>
                )}
              </div>

              {/* Delivery Address */}
              {subscription.deliveryAddress && (
                <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                  <h3 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>Delivery Address</h3>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF2F2' }}>
                      <i className="fa-solid fa-location-dot text-lg" style={{ color: '#E11D48' }}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>
                        {subscription.deliveryAddress.houseNo}, {subscription.deliveryAddress.street}
                      </p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        {subscription.deliveryAddress.area}, {subscription.deliveryAddress.city}
                      </p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        {subscription.deliveryAddress.state} - {subscription.deliveryAddress.pincode}
                      </p>
                      {subscription.deliveryAddress.landmark && (
                        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                          Landmark: {subscription.deliveryAddress.landmark}
                        </p>
                      )}
                      {(subscription.deliveryAddress.latitude && subscription.deliveryAddress.longitude) && (
                        <div className="mt-2">
                          <a
                            href={`https://www.google.com/maps?q=${subscription.deliveryAddress.latitude},${subscription.deliveryAddress.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200"
                            style={{ 
                              backgroundColor: '#E11D48',
                              color: '#FFFFFF'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
                          >
                            <i className="fa-solid fa-location-arrow"></i>
                            View on Map
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Section - Payment & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Detailed Payment Bill */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>Payment Bill</h3>
                  <i className="fa-solid fa-receipt" style={{ color: '#E11D48', fontSize: '1.125rem' }}></i>
                </div>
                
                {/* Itemized Breakdown */}
                <div className="space-y-3 mb-4">
                  <div className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>ITEM DETAILS</div>
                  
                  {/* Base Product */}
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <p className="text-xs font-bold" style={{ color: '#0E1214' }}>{subscription.productName}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                          {formatCurrency(subscription.basePrice)} × {subscription.duration} days
                        </p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#0E1214' }}>
                        {formatCurrency(subscription.basePrice * subscription.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Add-ons */}
                  {subscription.addons && subscription.addons.length > 0 && (
                    <>
                      <div className="text-xs font-semibold mt-3 mb-2" style={{ color: '#6B7280' }}>ADD-ONS</div>
                      {subscription.addons.map((addon, index) => (
                        <div key={index} className="p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1">
                              <p className="text-xs font-bold" style={{ color: '#0E1214' }}>{addon.name}</p>
                              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                                {formatCurrency(addon.price)} × {subscription.duration} days
                              </p>
                            </div>
                            <span className="text-sm font-bold" style={{ color: '#E11D48' }}>
                              {formatCurrency(addon.price * subscription.duration)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Skip Days Info */}
                  {subscription.skipDays && subscription.skipDays.length > 0 && (
                    <div className="p-2 rounded-lg text-xs" style={{ backgroundColor: '#FFF7ED', color: '#92400E' }}>
                      <i className="fa-solid fa-info-circle mr-1"></i>
                      {subscription.skipDays.length} day(s) skipped - Subscription extended
                    </div>
                  )}
                </div>

                {/* Calculation Summary */}
                <div className="border-t pt-3 space-y-2 mb-3" style={{ borderColor: '#E5E7EB' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#6B7280' }}>Subtotal</span>
                    <span className="font-bold" style={{ color: '#0E1214' }}>{formatCurrency(subscription.subtotal)}</span>
                  </div>
                  
                  {subscription.addonsTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#6B7280' }}>Add-ons Total</span>
                      <span className="font-bold" style={{ color: '#0E1214' }}>{formatCurrency(subscription.addonsTotal)}</span>
                    </div>
                  )}

                  {subscription.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#059669' }}>Discount Applied</span>
                      <span className="font-bold" style={{ color: '#059669' }}>-{formatCurrency(subscription.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs pt-1">
                    <span style={{ color: '#9CA3AF' }}>Taxes & Charges</span>
                    <span className="font-medium" style={{ color: '#9CA3AF' }}>Included</span>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="border-t border-b py-3 mb-3" style={{ borderColor: '#E5E7EB', backgroundColor: '#FEF2F2' }}>
                  <div className="flex justify-between items-center px-2">
                    <span className="font-bold" style={{ color: '#0E1214', fontSize: '0.875rem' }}>Grand Total</span>
                    <span className="font-bold" style={{ color: '#E11D48', fontSize: '1.25rem' }}>
                      {formatCurrency(subscription.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-2 mt-1">
                    <span className="text-xs" style={{ color: '#6B7280' }}>Per Day Cost</span>
                    <span className="text-xs font-bold" style={{ color: '#E11D48' }}>
                      {formatCurrency(Math.round(subscription.totalAmount / subscription.duration))}/day
                    </span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#6B7280' }}>
                      <i className="fa-solid fa-check-circle mr-1" style={{ color: '#059669' }}></i>
                      Paid Amount
                    </span>
                    <span className="font-bold" style={{ color: '#059669' }}>{formatCurrency(subscription.paidAmount)}</span>
                  </div>
                  
                  {subscription.pendingAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#6B7280' }}>
                        <i className="fa-solid fa-clock mr-1" style={{ color: '#D97706' }}></i>
                        Pending Amount
                      </span>
                      <span className="font-bold" style={{ color: '#D97706' }}>{formatCurrency(subscription.pendingAmount)}</span>
                    </div>
                  )}

                  {subscription.pendingAmount === 0 && subscription.paidAmount > 0 && (
                    <div className="p-2 rounded-lg text-xs text-center font-medium" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                      <i className="fa-solid fa-circle-check mr-1"></i>
                      Fully Paid
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="border-t pt-3 mt-3 space-y-2" style={{ borderColor: '#E5E7EB' }}>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: '#6B7280' }}>Payment Method</span>
                    <span className="font-bold uppercase px-2 py-1 rounded" style={{ 
                      color: '#0E1214',
                      backgroundColor: '#F3F4F6'
                    }}>
                      <i className={`fa-solid ${subscription.paymentMethod === 'online' ? 'fa-credit-card' : 'fa-money-bill-wave'} mr-1`}></i>
                      {subscription.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: '#6B7280' }}>Payment Status</span>
                    <span 
                      className="font-bold px-2 py-1 rounded uppercase text-xs"
                      style={{ 
                        backgroundColor: subscription.paymentStatus === 'paid' ? '#D1FAE5' : subscription.paymentStatus === 'pending' ? '#FEF3C7' : '#FEE2E2',
                        color: subscription.paymentStatus === 'paid' ? '#059669' : subscription.paymentStatus === 'pending' ? '#D97706' : '#DC2626'
                      }}
                    >
                      {subscription.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <h3 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>Quick Stats</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
                    <p className="text-xs mb-1" style={{ color: '#059669' }}>Completed Deliveries</p>
                    <p className="text-2xl font-bold" style={{ color: '#059669' }}>
                      {subscription.completedDeliveries}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#DBEAFE' }}>
                    <p className="text-xs mb-1" style={{ color: '#2563EB' }}>Remaining Deliveries</p>
                    <p className="text-2xl font-bold" style={{ color: '#2563EB' }}>
                      {subscription.deliveryCount - subscription.completedDeliveries}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                    <p className="text-xs mb-1" style={{ color: '#D97706' }}>Skip Days Available</p>
                    <p className="text-2xl font-bold" style={{ color: '#D97706' }}>
                      {subscription.maxSkipDays - (subscription.skipDays?.length || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <h3 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>Admin Actions</h3>
                <div className="space-y-2">
                  {subscription.status === 'active' && (
                    <>
                      <button
                        onClick={() => {
                          // TODO: Implement pause subscription
                          console.log('Pause subscription:', subscription._id);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                        style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDE68A'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEF3C7'}
                      >
                        <span><i className="fa-solid fa-pause mr-2"></i>Pause Subscription</span>
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implement cancel subscription
                          if (confirm('Are you sure you want to cancel this subscription?')) {
                            console.log('Cancel subscription:', subscription._id);
                          }
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                        style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                      >
                        <span><i className="fa-solid fa-ban mr-2"></i>Cancel Subscription</span>
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                      </button>
                    </>
                  )}
                  {subscription.status === 'paused' && (
                    <button
                      onClick={() => {
                        // TODO: Implement resume subscription
                        console.log('Resume subscription:', subscription._id);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                      style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A7F3D0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D1FAE5'}
                    >
                      <span><i className="fa-solid fa-play mr-2"></i>Resume Subscription</span>
                      <i className="fa-solid fa-chevron-right text-xs"></i>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      // TODO: Implement modify subscription
                      console.log('Modify subscription:', subscription._id);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                    style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BFDBFE'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                  >
                    <span><i className="fa-solid fa-pen-to-square mr-2"></i>Modify Details</span>
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement refund
                      console.log('Refund subscription:', subscription._id);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                    style={{ backgroundColor: '#F9FAFB', color: '#374151' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  >
                    <span><i className="fa-solid fa-money-bill-transfer mr-2"></i>Process Refund</span>
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
}

