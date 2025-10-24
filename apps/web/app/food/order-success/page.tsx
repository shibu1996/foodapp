'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrderSuccessPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    // Generate random order number
    const num = 'ORD' + Date.now().toString().slice(-8);
    setOrderNumber(num);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-md w-full">
        {/* Success Animation */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center border" style={{ borderColor: '#E5E7EB' }}>
          {/* Success Icon */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: '#10B981', opacity: 0.2 }}></div>
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
              <svg className="w-12 h-12 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#0E1214' }}>Order Placed!</h1>
          <p className="text-base mb-6" style={{ color: '#6B7280' }}>
            Your order has been successfully placed. We'll deliver it fresh and hot!
          </p>

          {/* Order Details */}
          <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: '#F9FAFB', border: '1px dashed #E5E7EB' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Order Number</span>
              <span className="font-bold" style={{ color: '#E11D48' }}>{orderNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Estimated Delivery</span>
              <span className="font-bold" style={{ color: '#0E1214' }}>30-40 mins</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#FEF2F2' }}>
                <svg className="w-6 h-6" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#FEF2F2' }}>
                <svg className="w-6 h-6" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Quality Food</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#FEF2F2' }}>
                <svg className="w-6 h-6" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Support 24/7</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/food/orders')}
              className="w-full py-3.5 rounded-xl font-bold transition-all"
              style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
            >
              Track Order
            </button>
            <Link
              href="/food/home"
              className="block w-full py-3.5 rounded-xl font-bold border-2 transition-all text-center"
              style={{ borderColor: '#E5E7EB', color: '#374151' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E11D48';
                e.currentTarget.style.color = '#E11D48';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.color = '#374151';
              }}
            >
              Continue Shopping
            </Link>
          </div>

          {/* Thank You Message */}
          <p className="text-sm mt-6" style={{ color: '#9CA3AF' }}>
            Thank you for choosing us! 🎉
          </p>
        </div>

        {/* Share on Social */}
        <div className="mt-6 text-center">
          <p className="text-sm mb-3" style={{ color: '#6B7280' }}>Share your food experience</p>
          <div className="flex items-center justify-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <svg className="w-5 h-5" style={{ color: '#1877F2' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <svg className="w-5 h-5" style={{ color: '#1DA1F2' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <svg className="w-5 h-5" style={{ color: '#25D366' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

