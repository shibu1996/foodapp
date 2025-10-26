'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '../../components/ProductForm';
import Toast from '../../components/Toast';

const API_BASE_URL = 'http://localhost:5000';

// Arrow Back Icon
const ArrowBackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');

      // Prepare data for API
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        subscriptionPrice: formData.subscriptionPrice,
        type: formData.type,
        availableFor: formData.availableFor,
        isVeg: formData.isVeg,
        isAvailable: formData.isAvailable,
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        tags: formData.tags
          ? formData.tags.split(',').map((tag: string) => tag.trim())
          : [],
      };

      // Create headers with optional auth token
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      // Success - Show toast and redirect
      setToast({ message: 'Product created successfully! 🎉', type: 'success' });
      setTimeout(() => {
        router.push('/products');
      }, 1500);
    } catch (err: any) {
      console.error('Error creating product:', err);
      setToast({ message: err.message || 'Failed to create product', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Modern Header with Gradient */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 relative overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10" />
          
          <div className="relative max-w-7xl mx-auto px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <span className="text-slate-600">/</span>
              <button
                onClick={() => router.push('/products')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Products
              </button>
              <span className="text-slate-600">/</span>
              <span className="text-white font-medium">Add New</span>
            </nav>

            {/* Header Content */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Back Button */}
                <button
                  onClick={() => router.back()}
                  className="mt-1 p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                  title="Go back"
                >
                  <ArrowBackIcon />
                </button>

                {/* Title Section */}
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    Add New Product
                  </h1>
                  <p className="text-slate-400 text-sm">
                    Create a new product for your restaurant menu
                  </p>
                </div>
              </div>

              {/* Icon */}
              <div className="hidden md:block">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center text-3xl shadow-xl shadow-orange-500/20">
                  🍽️
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-5xl mx-auto px-8 py-8">
          <ProductForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </>
  );
}





