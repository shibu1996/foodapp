'use client';

import { useRouter } from 'next/navigation';

interface MinimalHeaderProps {
  showBackButton?: boolean;
}

export function MinimalHeader({ showBackButton = false }: MinimalHeaderProps) {
  const router = useRouter();

  return (
    <div className="w-full bg-white border-b" style={{ borderColor: '#FEE2E2' }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                style={{ background: '#F9FAFB' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}
              >
                <svg className="w-5 h-5" fill="none" stroke="#E11D48" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            <button
              onClick={() => router.push('/food/home')}
              className="flex items-center gap-3 transition-all"
            >
              {/* Logo Icon */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="#FFFFFF" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              
              {/* Brand Name */}
              <div className="text-left">
                <h1 className="text-xl font-bold" style={{ color: '#E11D48', fontFamily: 'Poppins, sans-serif' }}>
                  FoodApp
                </h1>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>
                  Delicious meals delivered
                </p>
              </div>
            </button>
          </div>

          {/* Help Section */}
          <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Need help?</span>
          </div>
        </div>
      </div>
    </div>
  );
}

