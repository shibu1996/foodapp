'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

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

  return (
    <div className="flex h-screen" style={{ 
      fontFamily: 'Poppins, sans-serif'
    }}>
      <AdminSidebar />
      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}


