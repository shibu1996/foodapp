'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from './components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // TEMPORARILY DISABLED - Admin auth check removed for testing
  useEffect(() => {
    // Auth check disabled - Admin panel accessible without login
    console.log('⚠️ Admin panel running WITHOUT authentication (development mode)');
    
    /* ORIGINAL AUTH CODE - Uncomment to re-enable:
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/auth');
      return;
    }

    // Check if user is admin
    try {
      const user = JSON.parse(userStr);
      if (!user.email || !user.email.includes('admin')) {
        alert('Access denied. Admin only area.');
        router.push('/food/home');
        return;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth');
    }
    
    */
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth');
  };

  // Get page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return 'Dashboard';
    const lastSegment = segments[segments.length - 1];
    return lastSegment.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="flex h-screen" style={{ 
      fontFamily: 'Poppins, sans-serif'
    }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#F9FAFB' }}>
        {/* Top Header Bar */}
        <div className="bg-white border-b px-8 py-4 flex items-center justify-end" style={{ borderColor: '#E5E7EB' }}>
          {/* Profile & Logout */}
          <div className="flex items-center gap-4">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all border"
              style={{
                backgroundColor: '#FEE2E2',
                borderColor: '#FEE2E2',
                color: '#E11D48'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E11D48';
                e.currentTarget.style.borderColor = '#E11D48';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE2E2';
                e.currentTarget.style.borderColor = '#FEE2E2';
                e.currentTarget.style.color = '#E11D48';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
            
            {/* Profile Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg"
                style={{ backgroundColor: '#E11D48' }}
              >
                AD
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>Admin User</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>admin@foodapp.com</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}


