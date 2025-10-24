'use client';

import { useRouter } from 'next/navigation';

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
  onLogout,
  centerTitle
}: FoodHeaderProps) {
  const router = useRouter();

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
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => router.push('/food/home')}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E11D48' }}>
              <span className="text-white text-lg font-bold">F</span>
            </div>
            <span className="text-xl font-bold hidden sm:block" style={{ color: '#0E1214' }}>
              Food<span style={{ color: '#E11D48' }}>App</span>
            </span>
          </div>

          {/* Location - Desktop */}
          {showLocation && (
            <div 
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all border"
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
              <svg className="w-4 h-4" style={{ color: '#E11D48' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div className="flex flex-col">
                <span className="text-xs" style={{ color: '#6B7280' }}>Deliver to</span>
                <span className="text-xs font-semibold" style={{ color: '#0E1214' }}>{currentLocation}</span>
              </div>
              <svg className="w-3 h-3 ml-1" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}

          {/* Center Title (Optional) */}
          {centerTitle && (
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                {centerTitle}
              </h1>
            </div>
          )}

          {/* Search Bar - Desktop */}
          {showSearch && !centerTitle && (
            <div className="hidden md:flex flex-1 max-w-2xl">
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
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            {showCart && (
              <button 
                onClick={() => router.push('/food/cart')}
                className="relative p-2.5 rounded-lg transition-all border"
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg"
                    style={{ backgroundColor: '#E11D48' }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Notification Bell */}
            <button className="relative p-2.5 rounded-lg transition-all border"
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#E11D48' }}></span>
            </button>

            {/* Profile */}
            {user && user.name ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 rounded-lg transition-all border"
                  style={{ borderColor: '#E5E7EB' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E11D48';
                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" 
                    style={{ background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)' }}>
                    <span className="text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold hidden md:block" style={{ color: '#0E1214' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                  style={{ borderColor: '#E5E7EB' }}>
                  <div className="p-3 border-b" style={{ borderColor: '#E5E7EB' }}>
                    <p className="text-sm font-bold" style={{ color: '#0E1214' }}>{user.name}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-gray-50 transition-all"
                    style={{ color: '#E11D48' }}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => router.push('/auth')}
                className="p-2.5 rounded-lg transition-all border"
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

