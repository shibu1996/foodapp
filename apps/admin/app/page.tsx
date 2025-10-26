'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}





