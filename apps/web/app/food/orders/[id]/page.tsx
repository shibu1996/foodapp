'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
          alert('Order not found');
          router.push('/food/orders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params && params.id) {
      fetchOrder();
    }
  }, [params, router]);

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
        completed: true,
        icon: '📝'
      },
      {
        label: 'Confirmed',
        time: order.confirmedAt,
        completed: !!order.confirmedAt,
        icon: '✅'
      },
      {
        label: 'Preparing',
        time: order.preparedAt,
        completed: !!order.preparedAt,
        icon: '👨‍🍳'
      },
      {
        label: 'Out for Delivery',
        time: order.outForDeliveryAt,
        completed: !!order.outForDeliveryAt,
        icon: '🚚'
      },
      {
        label: 'Delivered',
        time: order.deliveredAt,
        completed: !!order.deliveredAt,
        icon: '🎉'
      },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const timeline = getStatusTimeline();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/food/orders')}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Order #{order.orderNumber}</h1>
              <p className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Timeline */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-6">Order Status</h2>
            <div className="relative">
              {timeline.map((step, index) => (
                <div key={index} className="flex gap-4 mb-8 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      step.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {step.icon}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className={`w-0.5 h-16 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className={`font-medium ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.label}
                    </h3>
                    {step.time && (
                      <p className="text-sm text-gray-600">
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-red-800 mb-2">Order Cancelled</h2>
            <p className="text-red-600">This order has been cancelled</p>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center pb-4 border-b last:border-0">
                <div>
                  <h3 className="font-medium text-gray-800">{item.productName}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-600">₹{item.price} each</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">₹{item.total}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Details */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Bill Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax (5% GST)</span>
              <span>₹{order.tax}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-lg font-semibold text-gray-800">
              <span>Total Amount</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Delivery Details</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Address:</span><br />
              {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}<br />
              {order.deliveryAddress.area}, {order.deliveryAddress.city}<br />
              {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
              {order.deliveryAddress.landmark && <><br />Landmark: {order.deliveryAddress.landmark}</>}
            </p>
            <p>
              <span className="font-medium">Delivery Date:</span>{' '}
              {new Date(order.deliveryDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p>
              <span className="font-medium">Delivery Slot:</span> {order.deliverySlot}
            </p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Payment Details</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Payment Method:</span>{' '}
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
            </p>
            <p>
              <span className="font-medium">Payment Status:</span>{' '}
              <span className={`font-medium ${
                order.paymentStatus === 'paid' ? 'text-green-600' : 
                order.paymentStatus === 'pending' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <div className="bg-white rounded-lg p-6">
            <button
              onClick={handleCancelOrder}
              disabled={canceling}
              className="w-full bg-red-50 text-red-600 px-6 py-3 rounded-lg hover:bg-red-100 transition font-medium disabled:opacity-50"
            >
              {canceling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


