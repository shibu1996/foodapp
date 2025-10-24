'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ComingSoonProps {
  serviceName: string;
  icon: string;
  description: string;
  gradient: string;
}

export default function ComingSoon({ serviceName, icon, description, gradient }: ComingSoonProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to save email for waitlist
    console.log('Email submitted:', email);
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        {/* Coming Soon Card */}
        <div className={`${gradient} rounded-3xl shadow-xl p-12 text-center`}>
          {/* Icon */}
          <div className="text-8xl mb-6 animate-bounce">
            {icon}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {serviceName}
          </h1>
          
          <p className="text-xl text-gray-700 mb-8">
            {description}
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-semibold text-lg mb-8 shadow-lg">
            🚀 Coming Soon!
          </div>

          {/* Notify Me Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Get Notified When We Launch
            </h2>
            <p className="text-gray-600 mb-6">
              Be the first to know when {serviceName} becomes available
            </p>

            {!submitted ? (
              <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none text-lg"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Notify Me
                </button>
              </form>
            ) : (
              <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Thank you! We'll notify you when we launch.
              </div>
            )}
          </div>

          {/* Features Preview */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">Quick service at your doorstep</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl mb-3">💎</div>
              <h3 className="font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-sm text-gray-600">Top-notch products & services</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-sm text-gray-600">Affordable rates for everyone</p>
            </div>
          </div>
        </div>

        {/* Other Services */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Meanwhile, check out our available services
          </p>
          <Link 
            href="/" 
            className="inline-block mt-4 text-orange-600 hover:text-orange-700 font-semibold"
          >
            View All Services →
          </Link>
        </div>
      </div>
    </div>
  );
}


