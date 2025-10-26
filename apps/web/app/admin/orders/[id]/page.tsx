'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Order {
  _id: string;
  orderNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: {
    productId: {
      _id: string;
      name: string;
      image?: string;
      price: number;
    };
    productName: string;
    price: number;
    quantity: number;
    total: number;
    isSubscription?: boolean;
    duration?: number;
    startDate?: string;
    endDate?: string;
  }[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  oneTimeDeliveryFee: number;
  discount: number;
  totalAmount: number;
  deliveryAddress?: any;
  oneTimeDeliveryAddress?: any;
  deliverySlot: string;
  deliveryDate: string;
  deliveryType: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  couponCode?: string;
  specialInstructions?: string;
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:5000';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/food/orders/admin/${orderId}`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data.data);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to load order details');
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'pending': { bg: '#FEF3C7', text: '#92400E' },
      'confirmed': { bg: '#DBEAFE', text: '#1E40AF' },
      'preparing': { bg: '#E0E7FF', text: '#3730A3' },
      'out_for_delivery': { bg: '#FCE7F3', text: '#9F1239' },
      'delivered': { bg: '#D1FAE5', text: '#059669' },
      'cancelled': { bg: '#FEE2E2', text: '#DC2626' }
    };
    return colors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  const getPaymentColor = (status: string) => {
    const colors: any = {
      'paid': { bg: '#D1FAE5', text: '#059669' },
      'pending': { bg: '#FEF3C7', text: '#92400E' },
      'failed': { bg: '#FEE2E2', text: '#DC2626' }
    };
    return colors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ 
            border: '3px solid #FEF2F2',
            borderTop: '3px solid #E11D48'
          }}></div>
          <p className="mt-4" style={{ color: '#6B7280', fontSize: '0.875rem' }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/orders')}
            className="flex items-center gap-2 transition-all duration-200"
            style={{ color: '#6B7280', fontSize: '0.875rem' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#E11D48'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back to Orders
          </button>
        </div>
        <div className="p-12 text-center rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#FEE2E2' }}>
            <i className="fa-solid fa-exclamation-triangle text-4xl" style={{ color: '#DC2626' }}></i>
          </div>
          <p className="font-semibold mb-2" style={{ color: '#0E1214', fontSize: '1rem' }}>Error</p>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{error || 'Order not found'}</p>
        </div>
      </div>
    );
  }

  const deliveryAddr = order.oneTimeDeliveryAddress || order.deliveryAddress;

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/admin/orders')}
            className="flex items-center gap-2 mb-3 transition-all duration-200"
            style={{ color: '#6B7280', fontSize: '0.875rem' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#E11D48'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back to Orders
          </button>
          <h1 className="font-bold" style={{ color: '#0E1214', fontSize: '1.875rem' }}>
            Order Details
          </h1>
          <p className="mt-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Order #{order.orderNumber}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span
            className="px-4 py-2 rounded-full font-medium capitalize"
            style={{
              backgroundColor: getStatusColor(order.status).bg,
              color: getStatusColor(order.status).text,
              fontSize: '0.875rem'
            }}
          >
            {order.status.replace('_', ' ')}
          </span>
          <span
            className="px-4 py-2 rounded-full font-medium capitalize"
            style={{
              backgroundColor: getPaymentColor(order.paymentStatus).bg,
              color: getPaymentColor(order.paymentStatus).text,
              fontSize: '0.875rem'
            }}
          >
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <i className="fa-solid fa-box" style={{ color: '#E11D48', fontSize: '1rem' }}></i>
              </div>
              <h3 className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Order Items</h3>
            </div>
            
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{ backgroundColor: '#F9FAFB' }}
                >
                  {item.productId?.image && (
                    <img 
                      src={item.productId.image} 
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                        {item.productName}
                      </div>
                      {item.isSubscription && (
                        <span 
                          className="px-2 py-0.5 rounded-full font-medium"
                          style={{ 
                            backgroundColor: '#FEF2F2', 
                            color: '#E11D48',
                            fontSize: '0.65rem'
                          }}
                        >
                          Subscription
                        </span>
                      )}
                    </div>
                    {item.isSubscription ? (
                      <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                        {formatCurrency(item.price)}/day × {item.duration || 0} days
                        {item.startDate && item.endDate && (
                          <div className="mt-1">
                            {new Date(item.startDate).toLocaleDateString('en-IN')} - {new Date(item.endDate).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                        {formatCurrency(item.price)} × {item.quantity}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold" style={{ color: '#E11D48', fontSize: '0.875rem' }}>
                    {formatCurrency(item.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {deliveryAddr && (
            <div className="p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                  <i className="fa-solid fa-location-dot" style={{ color: '#E11D48', fontSize: '1rem' }}></i>
                </div>
                <h3 className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Delivery Address</h3>
              </div>
              
              <div style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: '1.6' }}>
                <p>{deliveryAddr.houseNo}, {deliveryAddr.street}</p>
                <p>{deliveryAddr.area}</p>
                <p>{deliveryAddr.city}, {deliveryAddr.state} - {deliveryAddr.pincode}</p>
                {deliveryAddr.landmark && <p className="mt-2">Landmark: {deliveryAddr.landmark}</p>}
              </div>
            </div>
          )}

          {/* Delivery Details */}
          <div className="p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <i className="fa-solid fa-truck" style={{ color: '#E11D48', fontSize: '1rem' }}></i>
              </div>
              <h3 className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Delivery Details</h3>
            </div>
            
            <div className="space-y-4">
              {/* Current Location */}
              {deliveryAddr && (
                <div>
                  <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Current Location</div>
                  <div style={{ color: '#0E1214', fontSize: '0.875rem', fontWeight: 600 }} className="mt-1">
                    {deliveryAddr.area}, {deliveryAddr.city}
                  </div>
                  <div style={{ color: '#6B7280', fontSize: '0.75rem' }} className="mt-0.5">
                    {deliveryAddr.state} - {deliveryAddr.pincode}
                  </div>
                  {(deliveryAddr.latitude && deliveryAddr.longitude) && (
                    <div className="mt-2 flex items-center gap-2">
                      <span 
                        className="px-2 py-1 rounded-lg font-mono"
                        style={{ 
                          backgroundColor: '#FEF2F2', 
                          color: '#E11D48',
                          fontSize: '0.7rem'
                        }}
                      >
                        📍 {deliveryAddr.latitude.toFixed(6)}, {deliveryAddr.longitude.toFixed(6)}
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${deliveryAddr.latitude},${deliveryAddr.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded-lg font-medium transition-all duration-200"
                        style={{ 
                          backgroundColor: '#E11D48',
                          color: '#FFFFFF',
                          fontSize: '0.7rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
                      >
                        <i className="fa-solid fa-location-arrow"></i> View on Map
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Delivery Type</div>
                  <div style={{ color: '#0E1214', fontSize: '0.875rem', fontWeight: 600 }}>
                    {order.deliveryType === 'normal' ? 'Normal (1 hour)' : 'Premium (30 mins)'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Payment Method</div>
                  <div style={{ color: '#0E1214', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    {order.paymentMethod}
                  </div>
                </div>
              </div>
            </div>

            {order.specialInstructions && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Special Instructions</div>
                <div style={{ color: '#0E1214', fontSize: '0.875rem' }} className="mt-1">
                  {order.specialInstructions}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <i className="fa-solid fa-user" style={{ color: '#E11D48', fontSize: '1rem' }}></i>
              </div>
              <h3 className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Customer</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Name</div>
                <div style={{ color: '#0E1214', fontSize: '0.875rem', fontWeight: 600 }}>
                  {order.userId?.name || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Email</div>
                <div style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                  {order.userId?.email || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Phone</div>
                <div style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                  {order.userId?.phone || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <i className="fa-solid fa-receipt" style={{ color: '#E11D48', fontSize: '1rem' }}></i>
              </div>
              <h3 className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Order Summary</h3>
            </div>
            
            <div className="space-y-3 pb-4 mb-4 border-b" style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}>
              <div className="flex justify-between">
                <span style={{ color: '#6B7280' }}>Subtotal</span>
                <span style={{ color: '#0E1214' }}>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#6B7280' }}>Tax</span>
                <span style={{ color: '#0E1214' }}>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#6B7280' }}>Delivery Fee</span>
                <span style={{ color: '#0E1214' }}>{formatCurrency(order.deliveryFee || order.oneTimeDeliveryFee || 0)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>
                    Discount {order.couponCode && `(${order.couponCode})`}
                  </span>
                  <span style={{ color: '#E11D48' }}>-{formatCurrency(order.discount)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Total Amount</span>
              <span className="font-bold" style={{ color: '#E11D48', fontSize: '1.25rem' }}>
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <i className="fa-solid fa-clock" style={{ color: '#E11D48', fontSize: '1rem' }}></i>
              </div>
              <h3 className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Timeline</h3>
            </div>
            
            <div>
              <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Order Placed</div>
              <div style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                {formatDate(order.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

