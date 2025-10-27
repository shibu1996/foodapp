'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API_BASE_URL = 'http://localhost:5000';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/food/categories/${categoryId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }

      const data = await response.json();
      setCategory(data.data);
      setFormData({
        name: data.data.name,
        description: data.data.description || '',
        isActive: data.data.isActive,
      });
    } catch (err: any) {
      console.error('Error fetching category:', err);
      alert(err.message || 'Failed to load category');
      router.push('/admin/categories');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (formData.name.length < 3) newErrors.name = 'Category name must be at least 3 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/food/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update category');
      }

      // Redirect to categories list
      router.push('/admin/categories');
    } catch (err: any) {
      console.error('Error updating category:', err);
      alert(err.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ 
            border: '3px solid #FEF2F2',
            borderTop: '3px solid #E11D48'
          }}></div>
          <p className="mt-4" style={{ color: '#6B7280', fontSize: '0.875rem' }}>Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
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
            onClick={() => router.push('/admin/categories')}
            className="transition-colors"
            style={{ color: '#6B7280', fontSize: '0.875rem' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#E11D48';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            Categories
          </button>
          <span style={{ color: '#D1D5DB', fontSize: '0.875rem' }}>/</span>
          <span className="font-medium" style={{ color: '#E11D48', fontSize: '0.875rem' }}>Edit</span>
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
                Edit Category
              </h1>
              <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Update category information
              </p>
            </div>
          </div>

          {/* Icon */}
          <div className="hidden md:block">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
              <i className="fa-solid fa-pen-to-square" style={{ color: '#E11D48', fontSize: '2rem' }}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="rounded-xl border p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <h3 className="font-semibold mb-5 flex items-center gap-3" style={{ color: '#0E1214', fontSize: '1.125rem' }}>
            <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
              <i className="fa-solid fa-info-circle" style={{ color: '#E11D48', fontSize: '1.125rem' }}></i>
            </span>
            Category Information
          </h3>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                Category Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-xl outline-none transition-all"
                style={{
                  borderColor: errors.name ? '#FCA5A5' : '#E5E7EB',
                  backgroundColor: '#F9FAFB',
                  color: '#0E1214',
                  fontSize: '0.875rem'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = errors.name ? '#DC2626' : '#E11D48';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = errors.name ? '#FCA5A5' : '#E5E7EB';
                }}
                placeholder="e.g., Dal & Curries"
              />
              {errors.name && (
                <p className="mt-1.5 flex items-center gap-1" style={{ color: '#DC2626', fontSize: '0.75rem' }}>
                  <i className="fa-solid fa-circle-exclamation"></i> {errors.name}
                </p>
              )}
            </div>

            {/* Slug (Read-only) */}
            <div>
              <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                Slug (Auto-generated)
              </label>
              <input
                type="text"
                value={category.slug}
                disabled
                className="w-full px-4 py-3 border rounded-xl cursor-not-allowed"
                style={{
                  borderColor: '#E5E7EB',
                  backgroundColor: '#F3F4F6',
                  color: '#9CA3AF',
                  fontSize: '0.875rem'
                }}
              />
              <p className="mt-1.5 flex items-center gap-1" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                <i className="fa-solid fa-info-circle"></i> Slug is auto-generated and cannot be edited
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border rounded-xl outline-none transition-all resize-none"
                style={{
                  borderColor: '#E5E7EB',
                  backgroundColor: '#F9FAFB',
                  color: '#0E1214',
                  fontSize: '0.875rem'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E11D48';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
                placeholder="Describe this category..."
              />
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
              <div>
                <p className="font-medium flex items-center gap-2" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                  <i className="fa-solid fa-toggle-on" style={{ color: formData.isActive ? '#059669' : '#6B7280' }}></i>
                  Active Status
                </p>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  {formData.isActive ? 'Category is visible to customers' : 'Category is hidden from customers'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ backgroundColor: formData.isActive ? '#059669' : '#D1D5DB' }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  style={{ transform: formData.isActive ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-4 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            style={{
              backgroundColor: saving ? '#E11D48' : '#E11D48',
              fontSize: '0.875rem'
            }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = '#BE123C';
            }}
            onMouseLeave={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = '#E11D48';
            }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Saving Changes...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-save"></i>
                Save Changes
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-4 rounded-xl transition-all font-semibold border"
            style={{
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
              borderColor: '#E5E7EB',
              fontSize: '0.875rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E5E7EB';
              e.currentTarget.style.color = '#0E1214';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

