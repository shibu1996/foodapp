'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Helper function to get food images
const getFoodImage = (name: string): string => {
  const foodImages: { [key: string]: string } = {
    'Rajma Rice': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    'Dal Makhani': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400',
    'Chole Bhature': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400',
    'Veg Thali': 'https://images.unsplash.com/photo-1562159278-1253a58da141?w=400',
  };
  return foodImages[name] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400';
};

interface CartItem {
  _id?: string;
  id?: string;
  name: string;
  image?: string;
  prices?: {
    oneTime: number;
  };
  price?: number;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load cart from home page (you might want to use Context API or localStorage)
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    setLoading(false);

    // Load saved address if exists
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress) {
      try {
        const addr = JSON.parse(savedAddress);
        setFullName(addr.fullName || '');
        setPhone(addr.phone || '');
        setEmail(addr.email || '');
        setAddress(addr.address || '');
        setCity(addr.city || '');
        setPincode(addr.pincode || '');
        setLandmark(addr.landmark || '');
      } catch (error) {
        console.error('Error loading address:', error);
      }
    }
  }, []);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.prices?.oneTime || item.price || 0;
    return sum + (price * (item.quantity || 1));
  }, 0);

  const deliveryFee = subtotal > 500 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    // Validation
    if (!fullName || !phone || !address || !city || !pincode) {
      alert('Please fill all required fields');
      return;
    }

    if (phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    if (pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    setIsProcessing(true);

    // Save address for future use
    const deliveryAddress = {
      fullName,
      phone,
      email,
      address,
      city,
      pincode,
      landmark
    };
    localStorage.setItem('deliveryAddress', JSON.stringify(deliveryAddress));

    // Simulate order placement
    setTimeout(() => {
      localStorage.removeItem('cart');
      router.push('/food/order-success');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200" style={{ borderTopColor: '#E11D48' }}></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="text-center px-4">
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
            <svg className="w-12 h-12" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#0E1214' }}>Your Cart is Empty</h2>
          <p className="mb-6" style={{ color: '#6B7280' }}>Add some delicious items to get started!</p>
          <Link
            href="/food/home"
            className="inline-block px-6 py-3 rounded-xl font-semibold transition-all"
            style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/food/home" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E11D48' }}>
                <span className="text-white text-xl font-bold">F</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: '#0E1214' }}>
                Food<span style={{ color: '#E11D48' }}>App</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="h-1 w-12 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}>2</div>
              <div className="h-1 w-12 rounded-full" style={{ backgroundColor: '#E5E7EB' }}></div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: '#F3F4F6', color: '#9CA3AF' }}>3</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                  <svg className="w-5 h-5" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#0E1214' }}>Delivery Address</h2>
                  <p className="text-sm" style={{ color: '#6B7280' }}>Where should we deliver your order?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                      Full Name <span style={{ color: '#E11D48' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none"
                      style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                      Phone Number <span style={{ color: '#E11D48' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none"
                      style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none"
                    style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    Complete Address <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House No., Building Name, Street Name, Area"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none resize-none"
                    style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                      City <span style={{ color: '#E11D48' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                      className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none"
                      style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                      Pincode <span style={{ color: '#E11D48' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit PIN"
                      className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none"
                      style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none"
                      style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                  <svg className="w-5 h-5" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#0E1214' }}>Payment Method</h2>
                  <p className="text-sm" style={{ color: '#6B7280' }}>Choose your preferred payment option</p>
                </div>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: paymentMethod === 'cod' ? '#E11D48' : '#E5E7EB',
                    backgroundColor: paymentMethod === 'cod' ? '#FEF2F2' : '#FFFFFF'
                  }}
                >
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: paymentMethod === 'cod' ? '#E11D48' : '#D1D5DB' }}
                  >
                    {paymentMethod === 'cod' && (
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E11D48' }}></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: '#0E1214' }}>Cash on Delivery</div>
                    <div className="text-sm" style={{ color: '#6B7280' }}>Pay when you receive</div>
                  </div>
                  <svg className="w-6 h-6" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>

                <div
                  onClick={() => setPaymentMethod('online')}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: paymentMethod === 'online' ? '#E11D48' : '#E5E7EB',
                    backgroundColor: paymentMethod === 'online' ? '#FEF2F2' : '#FFFFFF'
                  }}
                >
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: paymentMethod === 'online' ? '#E11D48' : '#D1D5DB' }}
                  >
                    {paymentMethod === 'online' && (
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E11D48' }}></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: '#0E1214' }}>Online Payment</div>
                    <div className="text-sm" style={{ color: '#6B7280' }}>UPI / Card / Net Banking</div>
                  </div>
                  <svg className="w-6 h-6" style={{ color: '#6366F1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border sticky top-24" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: '#0E1214' }}>Order Summary</h3>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#F3F4F6' }}>
                      <img 
                        src={item.image || getFoodImage(item.name)} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate" style={{ color: '#0E1214' }}>{item.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs" style={{ color: '#6B7280' }}>Qty: {item.quantity}</span>
                        <span className="font-bold text-sm" style={{ color: '#E11D48' }}>
                          ₹{(item.prices?.oneTime || item.price || 0) * (item.quantity || 1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="border-t pt-4 space-y-3" style={{ borderColor: '#F3F4F6' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#6B7280' }}>Subtotal</span>
                  <span className="font-semibold" style={{ color: '#0E1214' }}>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#6B7280' }}>Delivery Fee</span>
                  <span className="font-semibold" style={{ color: deliveryFee === 0 ? '#10B981' : '#0E1214' }}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#6B7280' }}>GST (5%)</span>
                  <span className="font-semibold" style={{ color: '#0E1214' }}>₹{tax}</span>
                </div>
                {deliveryFee === 0 && (
                  <div className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ backgroundColor: '#F0FDF4', color: '#166534' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Yay! Free delivery on orders above ₹500
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                <span className="text-lg font-bold" style={{ color: '#0E1214' }}>Total Amount</span>
                <span className="text-2xl font-bold" style={{ color: '#E11D48' }}>₹{total}</span>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full mt-6 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: isProcessing ? '#9CA3AF' : '#E11D48',
                  color: '#FFFFFF',
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) e.currentTarget.style.backgroundColor = '#BE123C';
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing) e.currentTarget.style.backgroundColor = '#E11D48';
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Place Order
                  </>
                )}
              </button>

              <p className="text-xs text-center mt-4" style={{ color: '#9CA3AF' }}>
                By placing order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

