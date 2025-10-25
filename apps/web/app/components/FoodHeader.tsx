'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileDropdown } from '../food/home/components/ProfileDropdown';

interface FoodHeaderProps {
  user?: any;
  currentLocation?: string;
  showLocation?: boolean;
  showSearch?: boolean;
  showCart?: boolean;
  cartCount?: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onLocationClick?: () => void;
  onCartClick?: () => void;
  onLogout?: () => void;
  centerTitle?: string;
}

export function FoodHeader({
  user,
  currentLocation = 'Sector 18, Noida',
  showLocation = true,
  showSearch = true,
  showCart = true,
  cartCount = 0,
  searchQuery = '',
  onSearchChange,
  onLocationClick,
  onCartClick,
  onLogout,
  centerTitle
}: FoodHeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/food/home');
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b shadow-sm" style={{ borderColor: '#E5E7EB' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 lg:px-12 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => router.push('/food/home')}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E11D48' }}>
              <span className="text-white text-base sm:text-lg font-bold">F</span>
            </div>
            <span className="text-lg sm:text-xl font-bold hidden sm:block" style={{ color: '#0E1214' }}>
              Food<span style={{ color: '#E11D48' }}>App</span>
            </span>
          </div>

          {/* Location - All screens */}
          {showLocation && !centerTitle && (
            <div 
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg cursor-pointer transition-all border flex-1 sm:flex-none max-w-[180px] sm:max-w-none"
              style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}
              onClick={onLocationClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E11D48';
                e.currentTarget.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#E11D48' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] sm:text-xs leading-tight" style={{ color: '#6B7280' }}>Deliver to</span>
                <span className="text-[10px] sm:text-xs font-semibold truncate" style={{ color: '#0E1214' }}>{currentLocation}</span>
              </div>
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}

          {/* Center Title (Optional) */}
          {centerTitle && (
            <div className="flex-1 text-center">
              <h1 className="text-sm sm:text-base md:text-lg font-bold truncate" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                {centerTitle}
              </h1>
            </div>
          )}

          {/* Search Bar - Desktop */}
          {showSearch && !centerTitle && (
            <div className="hidden lg:flex flex-1 max-w-2xl">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for dishes, restaurants..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border-2 transition-all focus:outline-none text-sm"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                />
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}

          {/* Spacer for alignment when no search */}
          {!showSearch && !centerTitle && <div className="flex-1"></div>}

          {/* Right Side Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Mobile Search Icon */}
            {showSearch && !centerTitle && (
              <button 
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="lg:hidden p-2 sm:p-2.5 rounded-lg transition-all border"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E11D48';
                  e.currentTarget.style.backgroundColor = '#FEF2F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
            {/* Cart Button */}
            {showCart && (
              <button 
                onClick={() => {
                  if (onCartClick) {
                    onCartClick();
                  } else {
                    router.push('/food/cart');
                  }
                }}
                className="relative p-2 sm:p-2.5 rounded-lg transition-all border"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E11D48';
                  e.currentTarget.style.backgroundColor = '#FEF2F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold shadow-lg"
                    style={{ backgroundColor: '#E11D48' }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 sm:p-2.5 rounded-lg transition-all border"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E11D48';
                  e.currentTarget.style.backgroundColor = '#FEF2F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#E11D48' }}></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)}
                  />
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden"
                    style={{ borderColor: '#E5E7EB', fontFamily: 'Poppins, sans-serif' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' }}>
                      <h3 className="text-sm font-bold" style={{ color: '#0E1214' }}>
                        Notifications
                      </h3>
                      <button 
                        className="text-xs font-medium transition-all"
                        style={{ color: '#E11D48' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#BE123C'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#E11D48'}
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
                      {/* Order Delivered */}
                      <div className="px-4 py-3 border-b hover:bg-gray-50 transition-all cursor-pointer" style={{ borderColor: '#F3F4F6' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#DCFCE7' }}>
                            <span className="text-base" style={{ color: '#16A34A' }}>✓</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold mb-0.5 truncate" style={{ color: '#0E1214' }}>
                              Order Delivered Successfully
                            </p>
                            <p className="text-xs leading-tight mb-1" style={{ color: '#6B7280' }}>
                              Your order has been delivered. Enjoy!
                            </p>
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>2h ago</p>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: '#E11D48' }}></div>
                        </div>
                      </div>

                      {/* Special Offer */}
                      <div className="px-4 py-3 border-b hover:bg-gray-50 transition-all cursor-pointer" style={{ borderColor: '#F3F4F6' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF2F2' }}>
                            <span className="text-base" style={{ color: '#E11D48' }}>%</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold mb-0.5 truncate" style={{ color: '#0E1214' }}>
                              30% OFF on Next Order
                            </p>
                            <p className="text-xs leading-tight mb-1" style={{ color: '#6B7280' }}>
                              Use code SAVE30. Valid till tonight!
                            </p>
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>5h ago</p>
                          </div>
                        </div>
                      </div>

                      {/* Subscription Reminder */}
                      <div className="px-4 py-3 border-b hover:bg-gray-50 transition-all cursor-pointer" style={{ borderColor: '#F3F4F6' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
                            <span className="text-base" style={{ color: '#F59E0B' }}>🔔</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold mb-0.5 truncate" style={{ color: '#0E1214' }}>
                              Subscription Renewal in 2 Days
                            </p>
                            <p className="text-xs leading-tight mb-1" style={{ color: '#6B7280' }}>
                              Dal Makhani subscription renews soon
                            </p>
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>1d ago</p>
                          </div>
                        </div>
                      </div>

                      {/* New Item Added */}
                      <div className="px-4 py-3 border-b hover:bg-gray-50 transition-all cursor-pointer" style={{ borderColor: '#F3F4F6' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E0E7FF' }}>
                            <span className="text-base" style={{ color: '#6366F1' }}>🍽️</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold mb-0.5 truncate" style={{ color: '#0E1214' }}>
                              New Items on Menu
                            </p>
                            <p className="text-xs leading-tight mb-1" style={{ color: '#6B7280' }}>
                              Check out healthy salad collection
                            </p>
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>2d ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            {user && user.name ? (
              <ProfileDropdown userName={user.name} onLogout={handleLogout} />
            ) : (
              <button 
                onClick={() => router.push('/auth')}
                className="p-2 sm:p-2.5 rounded-lg transition-all border"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E11D48';
                  e.currentTarget.style.backgroundColor = '#FEF2F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && !centerTitle && showMobileSearch && (
          <div className="lg:hidden mt-3 pb-1">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border-2 transition-all focus:outline-none text-sm"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

