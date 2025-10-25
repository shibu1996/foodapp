'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileDropdownProps {
  userName: string;
  onLogout: () => void;
}

export function ProfileDropdown({ userName, onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'orders':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'subscriptions':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'addresses':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'settings':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'logout':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        );
      default:
        return null;
    }
  };

  const menuItems = [
    { type: 'orders', label: 'My Orders', onClick: () => router.push('/food/orders'), color: '#E11D48' },
    { type: 'subscriptions', label: 'My Subscriptions', onClick: () => router.push('/food/subscriptions'), color: '#6366F1' },
    { type: 'addresses', label: 'Saved Addresses', onClick: () => router.push('/food/saved-addresses'), color: '#F59E0B' },
    { type: 'settings', label: 'Settings', onClick: () => router.push('/settings'), color: '#6B7280' },
    { type: 'logout', label: 'Logout', onClick: onLogout, color: '#EF4444' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg transition-all border"
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
        <div className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs"
          style={{ backgroundColor: '#E11D48' }}
        >
          {getInitials(userName)}
        </div>
        <span className="hidden md:block text-sm font-semibold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
          {userName.split(' ')[0]}
        </span>
        <svg
          className={`w-3 h-3 transition-transform hidden md:block ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden"
            style={{ borderColor: '#E5E7EB', fontFamily: 'Poppins, sans-serif' }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: '#E11D48' }}
                >
                  {getInitials(userName)}
                </div>
                <div>
                  <p className="text-sm font-bold truncate" style={{ color: '#0E1214' }}>{userName}</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>View Profile</p>
                </div>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="py-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: `${item.color}15`,
                      color: item.color 
                    }}
                  >
                    {getIcon(item.type)}
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#0E1214' }}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


