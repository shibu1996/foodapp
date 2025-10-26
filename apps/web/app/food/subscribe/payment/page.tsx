'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export default function PaymentPage() {
  const router = useRouter();
  const { state } = useSubscription();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'wallet' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!agreeTerms) {
      alert('Please accept terms and conditions');
      return;
    }

    if (paymentMethod === 'upi' && !upiId) {
      alert('Please enter UPI ID');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        alert('Please fill all card details');
        return;
      }
    }

    setProcessing(true);

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to continue');
        router.push('/auth');
        return;
      }

      // Create subscription via API
      const response = await fetch('http://localhost:5000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: state.selectedMeal?.id || '6776859bd4a1e2c1f8c3f001', // Use first product as default if not selected
          duration: state.duration,
          startDate: state.startDate,
          deliverySlot: state.deliverySlot,
          deliveryAddress: state.selectedAddress,
          addons: state.addons.map(addon => ({
            name: addon.name,
            price: addon.price
          })),
          dailyMeals: state.meals || [],
          paymentMethod: paymentMethod === 'upi' ? 'online' : paymentMethod === 'card' ? 'online' : 'wallet',
          couponCode: state.couponCode,
          specialInstructions: '',
          autoRenewal: false,
          maxSkipDays: state.maxSkips,
          maxExtendedDays: state.maxExtendedDays
        })
      });

      const data = await response.json();

      if (data.success) {
        // Subscription created successfully
        setProcessing(false);
        router.push('/food/subscribe/success');
      } else {
        setProcessing(false);
        alert(data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setProcessing(false);
      alert('Failed to create subscription. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step 8 of 9</span>
            <span className="text-sm text-gray-500">Payment</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '88.8%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Payment</h1>
          <p className="text-gray-600">Choose your preferred payment method</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left - Payment Methods */}
          <div className="md:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Select Payment Method</h3>
              
              <div className="space-y-3">
                {/* UPI */}
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    paymentMethod === 'upi' ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      paymentMethod === 'upi' ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'upi' && <div className="w-3 h-3 bg-white rounded-full m-0.5"></div>}
                    </div>
                    <span className="text-2xl">📱</span>
                    <div>
                      <p className="font-semibold text-gray-800">UPI</p>
                      <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
                    </div>
                  </div>
                </button>

                {/* Card */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    paymentMethod === 'card' ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      paymentMethod === 'card' ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'card' && <div className="w-3 h-3 bg-white rounded-full m-0.5"></div>}
                    </div>
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-semibold text-gray-800">Credit / Debit Card</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, Rupay</p>
                    </div>
                  </div>
                </button>

                {/* Wallet */}
                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    paymentMethod === 'wallet' ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      paymentMethod === 'wallet' ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'wallet' && <div className="w-3 h-3 bg-white rounded-full m-0.5"></div>}
                    </div>
                    <span className="text-2xl">👛</span>
                    <div>
                      <p className="font-semibold text-gray-800">Wallets</p>
                      <p className="text-xs text-gray-500">Paytm, PhonePe, Amazon Pay</p>
                    </div>
                  </div>
                </button>

                {/* Net Banking */}
                <button
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    paymentMethod === 'netbanking' ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      paymentMethod === 'netbanking' ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'netbanking' && <div className="w-3 h-3 bg-white rounded-full m-0.5"></div>}
                    </div>
                    <span className="text-2xl">🏦</span>
                    <div>
                      <p className="font-semibold text-gray-800">Net Banking</p>
                      <p className="text-xs text-gray-500">All major banks</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Details Form */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Payment Details</h3>

              {paymentMethod === 'upi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@paytm"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    You will receive a payment request on your UPI app
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.slice(0, 3))}
                        placeholder="123"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">You will be redirected to your wallet app</p>
                  <div className="flex justify-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📱</span>
                    </div>
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Bank
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary">
                    <option>Choose your bank</option>
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <div className="text-sm text-gray-700">
                  I agree to the <a href="#" className="text-primary hover:underline">Terms & Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>. I understand that this is a recurring subscription and will be charged accordingly.
                </div>
              </label>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="md:col-span-1">
            {/* Delivery Address Card */}
            {state.selectedAddress && (
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800">Delivery Address</h3>
                  <button
                    onClick={() => router.push('/food/subscribe/address')}
                    className="text-sm text-primary hover:underline"
                  >
                    Change
                  </button>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-800 mb-1">
                    {state.selectedAddress.label || 'Home'}
                  </p>
                  <p className="text-gray-600">
                    {state.selectedAddress.houseNo}, {state.selectedAddress.street}
                  </p>
                  <p className="text-gray-600">
                    {state.selectedAddress.area}, {state.selectedAddress.city}
                  </p>
                  <p className="text-gray-600">
                    {state.selectedAddress.state} - {state.selectedAddress.pincode}
                  </p>
                  {state.selectedAddress.landmark && (
                    <p className="text-gray-500 mt-1">
                      Landmark: {state.selectedAddress.landmark}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 border-2 border-primary sticky top-4">
              <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{state.duration} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Days</span>
                  <span className="font-medium">{state.duration - state.skipDates.length}</span>
                </div>
                {state.addons.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Add-ons</span>
                    <span className="font-medium">{state.addons.length} items</span>
                  </div>
                )}
                {state.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount Applied</span>
                    <span className="font-bold">- Rs. {state.discount}</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">Rs. {Math.round(state.finalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={!agreeTerms || processing}
                className="w-full bg-primary text-white py-4 rounded-lg font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {processing ? 'Processing...' : `Pay Rs. ${Math.round(state.finalPrice)}`}
              </button>

              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <span>🔒</span>
                  <span>100% Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.back()}
            disabled={processing}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

