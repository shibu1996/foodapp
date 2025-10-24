'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      // Check if user is logged in
      if (!token || !userStr) {
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/auth?returnUrl=${returnUrl}`);
        return;
      }

      // Check if admin is required
      if (requireAdmin) {
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
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname, requireAdmin]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


