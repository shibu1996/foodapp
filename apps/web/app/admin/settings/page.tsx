'use client';

import { useState, useEffect } from 'react';

interface Settings {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
  razorpayEnabled: boolean;
  minOrderValue: number;
  maxDeliveryRadius: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'payment' | 'business' | 'order'>('payment');
  const [showSuccess, setShowSuccess] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/food/settings`);
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/food/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        loadSettings(); // Reload to get masked values
      } else {
        alert(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/settings/test-payment-gateway`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gateway: 'razorpay' })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Razorpay connection successful!');
      } else {
        alert('❌ ' + (data.message || 'Connection failed'));
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('❌ Connection test failed');
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" 
          style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
          Settings
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Configure your application settings
        </p>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#D1FAE5', borderLeft: '4px solid #059669' }}>
          <p className="text-sm font-semibold" style={{ color: '#065F46' }}>
            ✅ Settings saved successfully!
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border overflow-hidden mb-6" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex border-b" style={{ borderColor: '#E5E7EB' }}>
          {[
            { id: 'payment', label: 'Payment Gateway', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
            { id: 'business', label: 'Business Info', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { id: 'order', label: 'Order Settings', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 px-6 py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              style={{
                color: activeTab === tab.id ? '#E11D48' : '#6B7280',
                borderBottom: activeTab === tab.id ? '2px solid #E11D48' : '2px solid transparent'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Payment Gateway Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>
                  Razorpay Configuration
                </h3>
                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                  Configure your Razorpay payment gateway credentials. Get your API keys from{' '}
                  <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" 
                    className="underline" style={{ color: '#E11D48' }}>
                    Razorpay Dashboard
                  </a>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                      Key ID
                    </label>
                    <input
                      type="text"
                      value={settings.razorpayKeyId}
                      onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm"
                      style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                      placeholder="rzp_test_..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                      Key Secret
                    </label>
                    <input
                      type="password"
                      value={settings.razorpayKeySecret}
                      onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm"
                      style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                      placeholder="Enter secret key"
                    />
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                      Stored securely. Only last 4 characters visible after saving.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                      Webhook Secret (Optional)
                    </label>
                    <input
                      type="password"
                      value={settings.razorpayWebhookSecret}
                      onChange={(e) => setSettings({ ...settings, razorpayWebhookSecret: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm"
                      style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                      placeholder="Enter webhook secret"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.razorpayEnabled}
                        onChange={(e) => setSettings({ ...settings, razorpayEnabled: e.target.checked })}
                        className="w-5 h-5 rounded"
                        style={{ accentColor: '#E11D48' }}
                      />
                      <span className="ml-3 text-sm font-semibold" style={{ color: '#0E1214' }}>
                        Enable Razorpay Payments
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleTestConnection}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                  >
                    Test Connection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Business Info Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>
                Business Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                    placeholder="Food Delivery App"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={settings.businessEmail}
                    onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                    placeholder="contact@foodapp.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.businessPhone}
                    onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Order Settings Tab */}
          {activeTab === 'order' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>
                Order Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.minOrderValue}
                    onChange={(e) => setSettings({ ...settings, minOrderValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Max Delivery Radius (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.maxDeliveryRadius}
                    onChange={(e) => setSettings({ ...settings, maxDeliveryRadius: parseFloat(e.target.value) || 10 })}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: '#E5E7EB' }}>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-8 py-3 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#BE123C')}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = '#E11D48')}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

