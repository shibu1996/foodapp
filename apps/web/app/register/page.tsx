'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@restaurant-app/api-client';
import { FoodHeader } from '../components/FoodHeader';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.completeRegistration({ name, email });
      if (response.success) {
        // Save user data to localStorage (token already saved during OTP verification)
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        // Check if there's a return URL from the auth flow
        const returnUrl = localStorage.getItem('returnUrl');
        if (returnUrl) {
          localStorage.removeItem('returnUrl');
          router.push(returnUrl);
        } else {
          router.push('/food/home');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" 
      style={{ background: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 50%, #FFF1F2 100%)' }}>
      <FoodHeader
        showLocation={false}
        showSearch={false}
        showCart={false}
      />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8" style={{ border: '1px solid #FEE2E2' }}>
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" 
              style={{ background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)', boxShadow: '0 10px 40px rgba(225, 29, 72, 0.3)' }}>
              <svg className="w-8 h-8" fill="none" stroke="#FFFFFF" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
              Welcome Aboard! 🎉
            </h1>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Complete your profile to start ordering
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="#E11D48" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium" style={{ color: '#E11D48' }}>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                Full Name <span style={{ color: '#E11D48' }}>*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none text-sm font-medium transition-all"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0E1214',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E11D48';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(225, 29, 72, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                Email Address <span style={{ color: '#E11D48' }}>*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none text-sm font-medium transition-all"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0E1214',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E11D48';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(225, 29, 72, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="#10B981" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#166534' }}>
                    Just one more step!
                  </p>
                  <p className="text-xs" style={{ color: '#15803D' }}>
                    We'll use this info to personalize your experience and send order updates.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: loading ? '#9CA3AF' : '#E11D48',
                color: '#FFFFFF',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: !loading ? '0 4px 14px rgba(225, 29, 72, 0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#BE123C';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(225, 29, 72, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#E11D48';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(225, 29, 72, 0.4)';
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Completing Registration...
                </span>
              ) : (
                '🚀 Complete Registration'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#9CA3AF' }}>
          Your information is safe with us 🔒
        </p>
      </div>
      </div>
    </div>
  );
}
