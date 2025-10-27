'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FoodHeader } from '@/app/components/FoodHeader';
import { FloatingCart } from '@/app/components/FloatingCart';

const API_BASE_URL = 'http://localhost:5000/api';

interface Order {
  _id: string;
  orderNumber: string;
  items: {
    productId: any;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  deliveryAddress: {
    houseNo: string;
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  deliveryDate: Date;
  deliverySlot: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  specialInstructions?: string;
  confirmedAt?: Date;
  preparedAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);

  // Load user and cart on mount
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
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth');
          return;
        }

        if (!params || !params.id) {
          router.push('/food/orders');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/orders/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setOrder(data.data);
        } else {
          // Set sample order if not found
          setSampleOrder();
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        // Set sample order on error
        setSampleOrder();
      } finally {
        setLoading(false);
      }
    };

    if (params && params.id) {
      fetchOrder();
    }
  }, [params, router]);

  const setSampleOrder = () => {
    const sampleOrder: Order = {
      _id: 'sample1',
      orderNumber: 'ORD123456',
      items: [
        { productId: '1', productName: 'Dal Makhani', quantity: 2, price: 120, total: 240 },
        { productId: '2', productName: 'Paneer Butter Masala', quantity: 1, price: 180, total: 180 },
        { productId: '3', productName: 'Naan', quantity: 3, price: 30, total: 90 }
      ],
      subtotal: 510,
      tax: 25,
      deliveryFee: 0,
      discount: 0,
      totalAmount: 535,
      deliveryAddress: {
        houseNo: '123',
        street: 'MG Road',
        area: 'Sector 18',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
        landmark: 'Near Metro Station'
      },
      deliveryDate: new Date('2025-10-24'),
      deliverySlot: '7:00 PM - 9:00 PM',
      status: 'out_for_delivery',
      paymentMethod: 'online',
      paymentStatus: 'paid',
      specialInstructions: 'Please ring the bell twice',
      createdAt: new Date('2025-10-24T10:30:00'),
      confirmedAt: new Date('2025-10-24T10:35:00'),
      preparedAt: new Date('2025-10-24T11:00:00'),
      outForDeliveryAt: new Date('2025-10-24T11:30:00')
    };
    setOrder(sampleOrder);
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    if (!params || !params.id) return;

    setCanceling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${params.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Cancelled by user' })
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
        alert('Order cancelled successfully');
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    } finally {
      setCanceling(false);
    }
  };

  const getStatusTimeline = () => {
    if (!order) return [];

    return [
      {
        label: 'Order Placed',
        time: order.createdAt,
        completed: true
      },
      {
        label: 'Confirmed',
        time: order.confirmedAt,
        completed: !!order.confirmedAt
      },
      {
        label: 'Preparing',
        time: order.preparedAt,
        completed: !!order.preparedAt
      },
      {
        label: 'Out for Delivery',
        time: order.outForDeliveryAt,
        completed: !!order.outForDeliveryAt
      },
      {
        label: 'Delivered',
        time: order.deliveredAt,
        completed: !!order.deliveredAt
      },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
          <p className="text-sm font-medium" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const timeline = getStatusTimeline();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <FoodHeader 
        user={user}
        showLocation={false}
        showSearch={false}
        showCart={true}
        cartCount={cart.length}
        centerTitle={`Order #${order.orderNumber}`}
        onCartClick={() => setShowCartModal(true)}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 md:px-12 py-8">
        {/* Order Info Card */}
        <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Order Date</p>
              <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ 
                backgroundColor: order.status === 'delivered' ? '#DCFCE7' : order.status === 'cancelled' ? '#FEE2E2' : '#E0F2FE',
                color: order.status === 'delivered' ? '#16A34A' : order.status === 'cancelled' ? '#EF4444' : '#0284C7'
              }}
            >
              {order.status === 'out_for_delivery' ? 'Out for Delivery' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
            <h2 className="text-sm font-bold mb-6" style={{ color: '#0E1214' }}>Order Status</h2>
            <div className="relative">
              {timeline.map((step, index) => (
                <div key={index} className="flex gap-4 mb-6 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: step.completed ? '#DCFCE7' : '#F3F4F6',
                        border: step.completed ? '2px solid #16A34A' : '2px solid #E5E7EB'
                      }}
                    >
                      {step.completed ? (
                        <svg className="w-5 h-5" style={{ color: '#16A34A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9CA3AF' }}></div>
                      )}
                    </div>
                    {index < timeline.length - 1 && (
                      <div 
                        className="w-0.5 h-12"
                        style={{ backgroundColor: step.completed ? '#16A34A' : '#E5E7EB' }}
                      ></div>
                    )}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <h3 
                      className="text-xs font-semibold mb-0.5"
                      style={{ color: step.completed ? '#0E1214' : '#9CA3AF' }}
                    >
                      {step.label}
                    </h3>
                    {step.time && (
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        {new Date(step.time).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="rounded-xl border p-6 mb-6" style={{ borderColor: '#FEE2E2', backgroundColor: '#FEE2E2' }}>
            <h2 className="text-sm font-bold mb-1" style={{ color: '#EF4444' }}>Order Cancelled</h2>
            <p className="text-xs" style={{ color: '#DC2626' }}>This order has been cancelled</p>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: '#0E1214' }}>Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start pb-3 border-b last:border-0" style={{ borderColor: '#F3F4F6' }}>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold mb-1" style={{ color: '#0E1214' }}>{item.productName}</h3>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: '#0E1214' }}>₹{item.total}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Details */}
        <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: '#0E1214' }}>Bill Details</h2>
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs">
              <span style={{ color: '#6B7280' }}>Subtotal</span>
              <span style={{ color: '#374151' }}>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#6B7280' }}>Tax (5% GST)</span>
              <span style={{ color: '#374151' }}>₹{order.tax}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#6B7280' }}>Delivery Fee</span>
              <span style={{ color: order.deliveryFee === 0 ? '#16A34A' : '#374151' }}>
                {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-xs">
                <span style={{ color: '#6B7280' }}>Discount</span>
                <span style={{ color: '#16A34A' }}>-₹{order.discount}</span>
              </div>
            )}
            <div className="border-t pt-2.5 flex justify-between text-sm font-bold" style={{ borderColor: '#E5E7EB' }}>
              <span style={{ color: '#0E1214' }}>Total Amount</span>
              <span style={{ color: '#E11D48' }}>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: '#0E1214' }}>Delivery Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Address:</p>
              <p className="text-xs" style={{ color: '#374151' }}>
                {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}<br />
                {order.deliveryAddress.area}, {order.deliveryAddress.city}<br />
                {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                {order.deliveryAddress.landmark && <><br />Landmark: {order.deliveryAddress.landmark}</>}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Delivery Date:</p>
              <p className="text-xs" style={{ color: '#374151' }}>
                {new Date(order.deliveryDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Delivery Slot:</p>
              <p className="text-xs" style={{ color: '#374151' }}>{order.deliverySlot}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: '#0E1214' }}>Payment Details</h2>
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs">
              <span style={{ color: '#6B7280' }}>Payment Method:</span>
              <span style={{ color: '#374151' }}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#6B7280' }}>Payment Status:</span>
              <span 
                className="font-semibold"
                style={{ 
                  color: order.paymentStatus === 'paid' ? '#16A34A' : 
                        order.paymentStatus === 'pending' ? '#F59E0B' : 
                        '#EF4444'
                }}
              >
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
            <button
              onClick={handleCancelOrder}
              disabled={canceling}
              className="w-full px-6 py-3 rounded-lg transition-all text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
              onMouseEnter={(e) => {
                if (!canceling) {
                  e.currentTarget.style.backgroundColor = '#FECACA';
                }
              }}
              onMouseLeave={(e) => {
                if (!canceling) {
                  e.currentTarget.style.backgroundColor = '#FEE2E2';
                }
              }}
            >
              {canceling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}

        {/* Write Review Button for Delivered Orders */}
        {order.status === 'delivered' && (
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
            <button
              onClick={() => router.push(`/food/orders/${order._id}/review`)}
              className="w-full px-6 py-3 rounded-lg transition-all text-sm font-semibold flex items-center justify-center gap-2"
              style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D97706';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F59E0B';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Write a Review
            </button>
          </div>
        )}
      </div>

      {/* Floating Cart */}
      <FloatingCart 
        externalShowModal={showCartModal}
        onModalClose={() => setShowCartModal(false)}
        onFloatingButtonClick={() => setShowCartModal(true)}
      />
    </div>
  );
}


