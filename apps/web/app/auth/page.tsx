'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@restaurant-app/api-client';
import { FoodHeader } from '../components/FoodHeader';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check URL params first
    const url = searchParams?.get('returnUrl');
    if (url) {
      setReturnUrl(decodeURIComponent(url));
    } else {
      // Check localStorage for redirect after login
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        setReturnUrl(redirectUrl);
      }
    }
  }, [searchParams]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.sendOTP(phone);
      if (response.success) {
        setShowOTP(true);
        setResendTimer(30);
        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.verifyOTP(phone, otp);
      if (response.success) {
        // Save token to localStorage
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        // Save user data to localStorage if exists (for existing users)
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        // Redirect based on return URL or registration status
        if (response.needsRegistration) {
          // Save return URL to localStorage for use after registration
          if (returnUrl) {
            localStorage.setItem('returnUrl', returnUrl);
          }
          // Clear redirectAfterLogin
          localStorage.removeItem('redirectAfterLogin');
          router.push('/register');
        } else if (returnUrl) {
          // Clear both redirect keys
          localStorage.removeItem('redirectAfterLogin');
          localStorage.removeItem('returnUrl');
          router.push(returnUrl);
        } else {
          // Clear redirect keys
          localStorage.removeItem('redirectAfterLogin');
          localStorage.removeItem('returnUrl');
          router.push('/food/home');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    setShowOTP(false);
    handleSendOTP({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 50%, #FFF1F2 100%)' }}>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
              Welcome Back!
            </h1>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {!showOTP ? 'Enter your phone number to continue' : 'Enter the OTP sent to your phone'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="#E11D48" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium" style={{ color: '#E11D48' }}>{error}</p>
              </div>
            </div>
          )}

          {!showOTP ? (
            <form onSubmit={handleSendOTP}>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Phone Number <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <div className="flex rounded-xl overflow-hidden border-2 transition-all" 
                  style={{ borderColor: '#E5E7EB' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}>
                  <span className="inline-flex items-center px-4 font-semibold text-sm" 
                    style={{ background: '#F9FAFB', borderRight: '2px solid #E5E7EB', color: '#6B7280' }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="flex-1 px-4 py-3 focus:outline-none text-sm font-medium"
                    style={{ color: '#0E1214' }}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full font-bold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: loading || phone.length !== 10 ? '#9CA3AF' : '#E11D48',
                  color: '#FFFFFF',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: phone.length === 10 && !loading ? '0 4px 14px rgba(225, 29, 72, 0.4)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (phone.length === 10 && !loading) {
                    e.currentTarget.style.background = '#BE123C';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (phone.length === 10 && !loading) {
                    e.currentTarget.style.background = '#E11D48';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  '📱 Send OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Enter OTP <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-center text-2xl tracking-widest font-bold transition-all"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0E1214',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  maxLength={6}
                  required
                />
                <p className="text-xs mt-2 text-center" style={{ color: '#6B7280' }}>
                  OTP sent to <span className="font-semibold" style={{ color: '#E11D48' }}>+91 {phone}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full font-bold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                style={{ 
                  background: loading || otp.length !== 6 ? '#9CA3AF' : '#E11D48',
                  color: '#FFFFFF',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: otp.length === 6 && !loading ? '0 4px 14px rgba(225, 29, 72, 0.4)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (otp.length === 6 && !loading) {
                    e.currentTarget.style.background = '#BE123C';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (otp.length === 6 && !loading) {
                    e.currentTarget.style.background = '#E11D48';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  '✅ Verify OTP'
                )}
              </button>

              <div className="text-center mb-4">
                {resendTimer > 0 ? (
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Resend OTP in <span className="font-bold" style={{ color: '#E11D48' }}>{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm font-semibold transition-all"
                    style={{ color: '#E11D48' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#BE123C'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#E11D48'}
                  >
                    🔄 Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowOTP(false);
                  setOtp('');
                  setError('');
                }}
                className="w-full text-sm font-semibold py-2 rounded-lg transition-all"
                style={{ color: '#6B7280', background: '#F9FAFB' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F3F4F6';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                ← Change Phone Number
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#9CA3AF' }}>
          By continuing, you agree to our{' '}
          <span className="font-semibold" style={{ color: '#E11D48' }}>Terms & Privacy Policy</span>
        </p>
        </div>
      </div>
    </div>
  );
}
