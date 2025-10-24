'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@restaurant-app/api-client';

interface SubscriptionCartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    image?: string;
  };
  duration: number;
  deliverySlot: string;
  startDate: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    type: string;
  };
  calculatedAmount: number;
}

export default function SubscriptionCartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      
      // Load from localStorage first
      const localCart = localStorage.getItem('subscriptionCart');
      if (localCart) {
        const parsedCart = JSON.parse(localCart);
        setCart(parsedCart);
        setLoading(false);
        return;
      }

      // Fallback to API
      const response = await apiClient.getSubscriptionCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (error) {
      console.error('Load cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!confirm('Remove this subscription from cart?')) return;

    try {
      // Remove from localStorage
      const localCart = localStorage.getItem('subscriptionCart');
      if (localCart) {
        const parsedCart = JSON.parse(localCart);
        const updatedItems = parsedCart.items.filter((item: any) => item._id !== itemId);
        const updatedCart = {
          items: updatedItems,
          totalAmount: updatedItems.reduce((sum: number, item: any) => sum + (item.totalAmount || 0), 0)
        };
        localStorage.setItem('subscriptionCart', JSON.stringify(updatedCart));
        setCart(updatedCart);
        return;
      }

      // Fallback to API
      const response = await apiClient.removeFromSubscriptionCart(itemId);
      if (response.success) {
        setCart(response.data);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      setCheckingOut(true);
      const response = await apiClient.checkoutSubscriptionCart('cod');
      
      if (response.success) {
        alert(`Successfully created ${response.data.count} subscription(s)!`);
        router.push('/food/subscriptions');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your subscription cart is empty</h2>
          <p className="text-gray-600 mb-6">Add subscriptions to get started</p>
          <button
            onClick={() => router.push('/food/home')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Subscription Cart</h1>
          <p className="text-gray-600">{cart.items.length} subscription(s) in cart</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.items.map((item: any) => (
              <div key={item._id} className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{item.productName || item.product?.name}</h3>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <p><span className="font-medium">Duration:</span> {item.duration} days</p>
                      <p><span className="font-medium">Timeslot:</span> {item.deliverySlot === 'morning' || item.deliverySlot === 'breakfast' ? '🌅 Morning' : item.deliverySlot === 'lunch' ? '☀️ Lunch' : '🌙 Dinner'}</p>
                      <p><span className="font-medium">Start Date:</span> {formatDate(item.startDate)}</p>
                      {item.skipDates && item.skipDates.length > 0 && (
                        <p><span className="font-medium">Skip Days:</span> {item.skipDates.length} day(s)</p>
                      )}
                      {item.addons && item.addons.length > 0 && (
                        <p><span className="font-medium">Add-ons:</span> {item.addons.length} item(s)</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">₹{item.totalAmount || item.calculatedAmount}</p>
                    <p className="text-xs text-gray-500">₹{Math.round((item.totalAmount || item.calculatedAmount) / item.duration)}/day</p>
                  </div>
                </div>

                {item.deliveryAddress && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Delivery Address:</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      {item.deliveryAddress.street}, {item.deliveryAddress.city}, {item.deliveryAddress.state} - {item.deliveryAddress.pincode}
                    </p>
                  </div>
                )}
                {!item.deliveryAddress && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-yellow-600 italic">
                      📍 Address will be collected during checkout
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl p-6 border-2 border-primary sticky top-4">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Cart Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscriptions:</span>
                  <span className="font-medium">{cart.items.length}</span>
                </div>

                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{cart.totalAmount}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {checkingOut ? 'Processing...' : 'Checkout'}
              </button>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-xs text-gray-600">
                  <span className="mr-2">✓</span>
                  <span>Cash on Delivery available</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <span className="mr-2">✓</span>
                  <span>Pause/Cancel anytime</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/food/home')}
                className="w-full mt-4 text-primary border-2 border-primary py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
              >
                Add More Subscriptions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


