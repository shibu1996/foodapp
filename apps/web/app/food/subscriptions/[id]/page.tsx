'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { FoodHeader } from '@/app/components/FoodHeader';
import { FloatingCart } from '@/app/components/FloatingCart';
import { getFoodImage } from '../../home/utils/images';

const API_BASE_URL = 'http://localhost:5000/api';

interface Subscription {
  _id: string;
  subscriptionNumber: string;
  productId: any;
  productName: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  deliverySlot: string;
  addons: { name: string; price: number }[];
  skipDays: { date: Date; reason?: string }[];
  maxSkipDays: number;
  status: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryCount: number;
  completedDeliveries: number;
  autoRenewal: boolean;
  deliveryAddress?: any;
  createdAt: Date;
}

export default function SubscriptionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);

  // Load user and cart
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (params?.id) {
      fetchSubscriptionDetails();
    }
  }, [params?.id]);

  const fetchSubscriptionDetails = async () => {
    try {
      // For now, use sample data
      setSampleSubscription();
      setLoading(false);
      return;

      // Uncomment when API is ready
      /*
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/subscriptions/${params?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(data.data);
      } else {
        setSampleSubscription();
      }
      */
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSampleSubscription();
    } finally {
      setLoading(false);
    }
  };

  const setSampleSubscription = () => {
    const today = new Date();
    const sample: Subscription = {
      _id: params?.id as string || '1',
      subscriptionNumber: 'SUB001',
      productId: 'prod1',
      productName: 'Dal Makhani',
      duration: 30,
      startDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000),
      deliverySlot: '7:00 AM - 8:00 AM',
      addons: [{ name: 'Extra Rice', price: 20 }],
      skipDays: [
        { date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), reason: 'Holiday' }
      ],
      maxSkipDays: 4,
      status: 'active',
      totalAmount: 2850,
      paidAmount: 2850,
      pendingAmount: 0,
      paymentMethod: 'Online',
      paymentStatus: 'paid',
      deliveryCount: 30,
      completedDeliveries: 5,
      autoRenewal: true,
      deliveryAddress: {
        houseNo: '123',
        street: 'MG Road',
        area: 'Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
        landmark: 'Near Metro Station'
      },
      createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
    };

    setSubscription(sample);
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

  const getRemainingDays = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/food/home');
  };

  const getProgressPercentage = () => {
    if (!subscription) return 0;
    return Math.round((subscription.completedDeliveries / subscription.deliveryCount) * 100);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
          <FoodHeader 
            user={user}
            showLocation={false}
            showSearch={false}
            showCart={true}
            cartCount={cart.length}
            onCartClick={() => setShowCartModal(true)}
            onLogout={handleLogout}
            centerTitle="Subscription Details"
          />
          <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
            <div className="animate-pulse">
              <div className="h-8 rounded w-1/4 mb-6" style={{ backgroundColor: '#F3F4F6' }}></div>
              <div className="h-64 rounded-xl mb-6" style={{ backgroundColor: '#F3F4F6' }}></div>
              <div className="h-96 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!subscription) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
          <FoodHeader 
            user={user}
            showLocation={false}
            showSearch={false}
            showCart={true}
            cartCount={cart.length}
            onCartClick={() => setShowCartModal(true)}
            onLogout={handleLogout}
            centerTitle="Subscription Details"
          />
          <div className="max-w-7xl mx-auto px-8 md:px-12 py-16 text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
              <svg className="w-10 h-10" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#0E1214' }}>Subscription Not Found</h3>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>This subscription does not exist or has been deleted</p>
            <button
              onClick={() => router.push('/food/subscriptions')}
              className="px-6 py-3 rounded-lg font-semibold text-sm transition-all"
              style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
              onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#BE123C'}
              onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#E11D48'}
            >
              Back to Subscriptions
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const statusColor = getStatusColor(subscription.status);
  const progressPercentage = getProgressPercentage();

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <FoodHeader 
          user={user}
          showLocation={false}
          showSearch={false}
          showCart={true}
          cartCount={cart.length}
          onCartClick={() => setShowCartModal(true)}
          onLogout={handleLogout}
          centerTitle="Subscription Details"
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.push('/food/subscriptions')}
            className="flex items-center gap-2 mb-6 text-sm font-semibold transition-all"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e: any) => e.currentTarget.style.color = '#E11D48'}
            onMouseLeave={(e: any) => e.currentTarget.style.color = '#6B7280'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Subscriptions
          </button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Section - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Info Card */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#F3F4F6' }}>
                    <img 
                      src={getFoodImage(subscription.productName)} 
                      alt={subscription.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h1 className="text-xl font-bold mb-1" style={{ color: '#0E1214' }}>
                          {subscription.productName}
                        </h1>
                        <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
                          #{subscription.subscriptionNumber}
                        </p>
                      </div>
                      <span 
                        className="px-3 py-1 rounded-lg text-xs font-bold"
                        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                      >
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: '#6B7280' }}>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold">{subscription.duration} days plan</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
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

              {/* Subscription Details */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <h2 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>Subscription Details</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Start Date</p>
                    <p className="text-sm font-bold" style={{ color: '#0E1214' }}>
                      {new Date(subscription.startDate).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>End Date</p>
                    <p className="text-sm font-bold" style={{ color: '#0E1214' }}>
                      {new Date(subscription.endDate).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
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
                </div>
              </div>

              {/* Add-ons */}
              {subscription.addons.length > 0 && (
                <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                  <h2 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>Add-ons</h2>
                  <div className="space-y-2">
                    {subscription.addons.map((addon, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                            <svg className="w-4 h-4" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: '#0E1214' }}>{addon.name}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#E11D48' }}>+₹{addon.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skip Days */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold" style={{ color: '#0E1214' }}>Skip Days</h2>
                  <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                    {subscription.skipDays.length}/{subscription.maxSkipDays} used
                  </span>
                </div>
                {subscription.skipDays.length > 0 ? (
                  <div className="space-y-2">
                    {subscription.skipDays.map((skip, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" style={{ color: '#D97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-sm font-semibold" style={{ color: '#D97706' }}>
                            {new Date(skip.date).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
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
                  <h2 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>Delivery Address</h2>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF2F2' }}>
                      <svg className="w-5 h-5" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
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
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Section - Payment & Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Payment Summary */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <h2 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>Payment Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#6B7280' }}>Total Amount</span>
                    <span className="font-bold" style={{ color: '#0E1214' }}>₹{subscription.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#6B7280' }}>Paid Amount</span>
                    <span className="font-bold" style={{ color: '#059669' }}>₹{subscription.paidAmount}</span>
                  </div>
                  {subscription.pendingAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#6B7280' }}>Pending Amount</span>
                      <span className="font-bold" style={{ color: '#D97706' }}>₹{subscription.pendingAmount}</span>
                    </div>
                  )}
                  <div className="border-t pt-3" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#6B7280' }}>Payment Method</span>
                      <span className="font-bold" style={{ color: '#0E1214' }}>{subscription.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span style={{ color: '#6B7280' }}>Payment Status</span>
                      <span 
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: subscription.paymentStatus === 'paid' ? '#D1FAE5' : '#FEF3C7',
                          color: subscription.paymentStatus === 'paid' ? '#059669' : '#D97706'
                        }}
                      >
                        {subscription.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-3" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: '#6B7280' }}>Per Day Cost</span>
                      <span className="font-bold" style={{ color: '#E11D48' }}>
                        ₹{Math.round(subscription.totalAmount / subscription.duration)}/day
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <h2 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>Quick Stats</h2>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
                    <p className="text-xs mb-1" style={{ color: '#059669' }}>Completed Deliveries</p>
                    <p className="text-xl font-bold" style={{ color: '#059669' }}>
                      {subscription.completedDeliveries}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#DBEAFE' }}>
                    <p className="text-xs mb-1" style={{ color: '#2563EB' }}>Remaining Deliveries</p>
                    <p className="text-xl font-bold" style={{ color: '#2563EB' }}>
                      {subscription.deliveryCount - subscription.completedDeliveries}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                    <p className="text-xs mb-1" style={{ color: '#D97706' }}>Skip Days Available</p>
                    <p className="text-xl font-bold" style={{ color: '#D97706' }}>
                      {subscription.maxSkipDays - subscription.skipDays.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <h2 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>Need Help?</h2>
                <div className="space-y-3">
                  <button
                    className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                    style={{ backgroundColor: '#F9FAFB', color: '#374151' }}
                    onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                    onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  >
                    <span>Contact Support</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                    style={{ backgroundColor: '#F9FAFB', color: '#374151' }}
                    onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                    onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  >
                    <span>Report Issue</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Cart */}
        <FloatingCart 
          externalShowModal={showCartModal}
          onModalClose={() => setShowCartModal(false)}
          onFloatingButtonClick={() => setShowCartModal(true)}
        />
      </div>
    </ProtectedRoute>
  );
}

