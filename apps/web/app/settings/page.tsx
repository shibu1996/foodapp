'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { FoodHeader } from '@/app/components/FoodHeader';
import { FloatingCart } from '@/app/components/FloatingCart';

interface UserSettings {
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletters: boolean;
    sms: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    theme: string;
  };
  privacy: {
    shareData: boolean;
    personalizedAds: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      orderUpdates: true,
      promotions: true,
      newsletters: false,
      sms: true,
    },
    preferences: {
      language: 'English',
      currency: 'INR',
      theme: 'Light',
    },
    privacy: {
      shareData: false,
      personalizedAds: true,
    },
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load user and cart
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    const savedSettings = localStorage.getItem('userSettings');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/food/home');
  };

  const handleToggle = (category: keyof UserSettings, key: string) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: !(settings[category] as any)[key],
      },
    };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    
    setSuccessMessage('Settings updated successfully!');
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const handleSelectChange = (category: keyof UserSettings, key: string, value: string) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    
    setSuccessMessage('Preference updated successfully!');
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

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
          centerTitle="Settings"
        />

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-8">
          {/* Profile Section */}
          <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: '#E11D48' }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-1" style={{ color: '#0E1214' }}>
                  {user?.name || 'User'}
                </h2>
                <p className="text-sm mb-2" style={{ color: '#6B7280' }}>
                  {user?.email || 'user@example.com'}
                </p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>
                  Member since {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => router.push('/food/home')}
                className="px-4 py-2 rounded-lg font-semibold text-xs transition-all border"
                style={{ backgroundColor: '#F9FAFB', color: '#374151', borderColor: '#E5E7EB' }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <svg className="w-5 h-5" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>Notifications</h3>
                <p className="text-xs" style={{ color: '#6B7280' }}>Manage your notification preferences</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>Order Updates</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Get notified about your order status</p>
                </div>
                <button
                  onClick={() => handleToggle('notifications', 'orderUpdates')}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: settings.notifications.orderUpdates ? '#E11D48' : '#D1D5DB' }}
                >
                  <div
                    className="absolute w-4 h-4 rounded-full bg-white top-1 transition-transform"
                    style={{ left: settings.notifications.orderUpdates ? '28px' : '4px' }}
                  ></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>Promotions & Offers</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Receive updates on special deals</p>
                </div>
                <button
                  onClick={() => handleToggle('notifications', 'promotions')}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: settings.notifications.promotions ? '#E11D48' : '#D1D5DB' }}
                >
                  <div
                    className="absolute w-4 h-4 rounded-full bg-white top-1 transition-transform"
                    style={{ left: settings.notifications.promotions ? '28px' : '4px' }}
                  ></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>Newsletters</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Weekly updates and tips</p>
                </div>
                <button
                  onClick={() => handleToggle('notifications', 'newsletters')}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: settings.notifications.newsletters ? '#E11D48' : '#D1D5DB' }}
                >
                  <div
                    className="absolute w-4 h-4 rounded-full bg-white top-1 transition-transform"
                    style={{ left: settings.notifications.newsletters ? '28px' : '4px' }}
                  ></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>SMS Notifications</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Get text messages for orders</p>
                </div>
                <button
                  onClick={() => handleToggle('notifications', 'sms')}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: settings.notifications.sms ? '#E11D48' : '#D1D5DB' }}
                >
                  <div
                    className="absolute w-4 h-4 rounded-full bg-white top-1 transition-transform"
                    style={{ left: settings.notifications.sms ? '28px' : '4px' }}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
                <svg className="w-5 h-5" style={{ color: '#6366F1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>Preferences</h3>
                <p className="text-xs" style={{ color: '#6B7280' }}>Customize your app experience</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <label className="text-sm font-semibold mb-2 block" style={{ color: '#0E1214' }}>Language</label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => handleSelectChange('preferences', 'language', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm font-medium"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                  <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                  <option value="Telugu">తెలుగు (Telugu)</option>
                </select>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <label className="text-sm font-semibold mb-2 block" style={{ color: '#0E1214' }}>Currency</label>
                <select
                  value={settings.preferences.currency}
                  onChange={(e) => handleSelectChange('preferences', 'currency', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm font-medium"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                </select>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <label className="text-sm font-semibold mb-2 block" style={{ color: '#0E1214' }}>Theme</label>
                <select
                  value={settings.preferences.theme}
                  onChange={(e) => handleSelectChange('preferences', 'theme', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm font-medium"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                >
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                  <option value="Auto">Auto (System)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                <svg className="w-5 h-5" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>Privacy & Security</h3>
                <p className="text-xs" style={{ color: '#6B7280' }}>Control your data and privacy</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>Share Usage Data</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Help us improve the app</p>
                </div>
                <button
                  onClick={() => handleToggle('privacy', 'shareData')}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: settings.privacy.shareData ? '#E11D48' : '#D1D5DB' }}
                >
                  <div
                    className="absolute w-4 h-4 rounded-full bg-white top-1 transition-transform"
                    style={{ left: settings.privacy.shareData ? '28px' : '4px' }}
                  ></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>Personalized Ads</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>See relevant advertisements</p>
                </div>
                <button
                  onClick={() => handleToggle('privacy', 'personalizedAds')}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: settings.privacy.personalizedAds ? '#E11D48' : '#D1D5DB' }}
                >
                  <div
                    className="absolute w-4 h-4 rounded-full bg-white top-1 transition-transform"
                    style={{ left: settings.privacy.personalizedAds ? '28px' : '4px' }}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                <svg className="w-5 h-5" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>Account</h3>
                <p className="text-xs" style={{ color: '#6B7280' }}>Manage your account settings</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => alert('Change password functionality coming soon!')}
                className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                style={{ backgroundColor: '#F9FAFB', color: '#374151' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              >
                <span>Change Password</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => alert('Download data functionality coming soon!')}
                className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                style={{ backgroundColor: '#F9FAFB', color: '#374151' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              >
                <span>Download My Data</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    alert('Delete account functionality coming soon!');
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#FECACA'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
              >
                <span>Delete Account</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
                <svg className="w-5 h-5" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>About</h3>
                <p className="text-xs" style={{ color: '#6B7280' }}>App information and support</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/food/home')}
                className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                style={{ backgroundColor: '#F9FAFB', color: '#374151' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              >
                <span>Help & Support</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => router.push('/food/home')}
                className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                style={{ backgroundColor: '#F9FAFB', color: '#374151' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              >
                <span>Terms of Service</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => router.push('/food/home')}
                className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm font-semibold"
                style={{ backgroundColor: '#F9FAFB', color: '#374151' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              >
                <span>Privacy Policy</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#F9FAFB' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#0E1214' }}>App Version</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>v1.0.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          >
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                <svg className="w-8 h-8" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base font-bold text-center" style={{ color: '#0E1214' }}>
                {successMessage}
              </p>
            </div>
          </div>
        )}

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

