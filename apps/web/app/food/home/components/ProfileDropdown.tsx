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

  const menuItems = [
    { icon: '📦', label: 'My Orders', onClick: () => router.push('/food/orders') },
    { icon: '📋', label: 'My Subscriptions', onClick: () => router.push('/food/subscriptions') },
    { icon: '📍', label: 'Saved Addresses', onClick: () => router.push('/addresses') },
    { icon: '⚙️', label: 'Settings', onClick: () => router.push('/settings') },
    { icon: '🚪', label: 'Logout', onClick: onLogout },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all border"
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
        <div className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm"
          style={{ backgroundColor: '#E11D48' }}
        >
          {getInitials(userName)}
        </div>
        <span className="hidden md:block font-medium" style={{ color: '#0E1214' }}>{userName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border py-2 z-50 animate-fadeIn"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: '#F3F4F6' }}>
            <p className="font-semibold" style={{ color: '#0E1214' }}>{userName}</p>
            <p className="text-sm" style={{ color: '#6B7280' }}>Your Account</p>
          </div>
          
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 transition text-left"
              style={{ color: '#374151' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF2F2';
                e.currentTarget.style.color = '#E11D48';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#374151';
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


