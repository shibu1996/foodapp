'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '../../components/ProductForm';
import Toast from '../../components/Toast';

const API_BASE_URL = 'http://localhost:5000';

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

      const response = await fetch(`${API_BASE_URL}/api/food/products`, {
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
        router.push('/admin/products');
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

      <div style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <div className="mb-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="transition-colors"
              style={{ color: '#6B7280', fontSize: '0.875rem' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#E11D48';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6B7280';
              }}
            >
              Dashboard
            </button>
            <span style={{ color: '#D1D5DB', fontSize: '0.875rem' }}>/</span>
            <button
              onClick={() => router.push('/admin/products')}
              className="transition-colors"
              style={{ color: '#6B7280', fontSize: '0.875rem' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#E11D48';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6B7280';
              }}
            >
              Products
            </button>
            <span style={{ color: '#D1D5DB', fontSize: '0.875rem' }}>/</span>
            <span className="font-medium" style={{ color: '#E11D48', fontSize: '0.875rem' }}>Add New</span>
          </nav>

          {/* Header Content */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="mt-1 p-2 rounded-lg transition-all"
                style={{ 
                  color: '#6B7280',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                  e.currentTarget.style.color = '#E11D48';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6B7280';
                }}
                title="Go back"
              >
                <i className="fa-solid fa-arrow-left" style={{ fontSize: '1.25rem' }}></i>
              </button>

              {/* Title Section */}
              <div>
                <h1 className="font-bold mb-2" style={{ color: '#0E1214', fontSize: '1.875rem' }}>
                  Add New Product
                </h1>
                <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                  Create a new product for your restaurant menu
                </p>
              </div>
            </div>

            {/* Icon */}
            <div className="hidden md:block">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <i className="fa-solid fa-utensils" style={{ color: '#E11D48', fontSize: '2rem' }}></i>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div>
          <ProductForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </>
  );
}
