'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to food home page
    router.push('/food/home');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 50%, #FFF1F2 100%)' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse" 
          style={{ background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)', boxShadow: '0 10px 40px rgba(225, 29, 72, 0.3)' }}>
          <svg className="w-8 h-8" fill="none" stroke="#FFFFFF" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: '#E11D48', fontFamily: 'Poppins, sans-serif' }}>
          Redirecting to FoodApp...
        </p>
        </div>
    </div>
  );
}
