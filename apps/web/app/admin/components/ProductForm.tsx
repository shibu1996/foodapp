'use client';

import { useState, useEffect } from 'react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  subscriptionPrice: number;
  type: 'individual' | 'ready-meal';
  availableFor: string[];
  isVeg: boolean;
  isAvailable: boolean;
  image: string;
  tags: string;
}

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Partial<ProductFormData>;
  loading?: boolean;
}

const API_BASE_URL = 'http://localhost:5000';

export default function ProductForm({
  onSubmit,
  initialData,
  loading = false,
}: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    price: initialData?.price || 0,
    subscriptionPrice: initialData?.subscriptionPrice || 0,
    type: initialData?.type || 'individual',
    availableFor: initialData?.availableFor || ['one-time', 'subscription'],
    isVeg: initialData?.isVeg !== undefined ? initialData.isVeg : true,
    isAvailable:
      initialData?.isAvailable !== undefined ? initialData.isAvailable : true,
    image: initialData?.image || '',
    tags: initialData?.tags || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (formData.subscriptionPrice <= 0) {
      newErrors.subscriptionPrice = 'Subscription price must be greater than 0';
    }
    if (formData.availableFor.length === 0) {
      newErrors.availableFor = 'Select at least one availability option';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number' ? parseFloat(value) || 0 : value,
    }));
    // Clear error for this field
    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleToggle = (field: 'isVeg' | 'isAvailable') => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleAvailableForChange = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      availableFor: prev.availableFor.includes(option)
        ? prev.availableFor.filter((item) => item !== option)
        : [...prev.availableFor, option],
    }));
    if (errors.availableFor) {
      setErrors((prev) => ({ ...prev, availableFor: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Basic Information Card */}
      <div className="rounded-xl border p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#0E1214', fontSize: '1rem' }}>
          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
            <i className="fa-solid fa-file-lines" style={{ color: '#E11D48', fontSize: '1rem' }}></i>
          </span>
          Basic Information
        </h3>
        
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
              Product Name <span style={{ color: '#DC2626' }}>*</span>
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
              placeholder="e.g., Dal Makhani"
            />
            {errors.name && (
              <p className="mt-1.5 flex items-center gap-1" style={{ color: '#DC2626', fontSize: '0.75rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.description 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-slate-200 focus:ring-orange-500'
              }`}
              placeholder="Describe your product in detail..."
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.description}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={loadingCategories}
              className={`w-full px-4 py-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.category 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-slate-200 focus:ring-orange-500'
              }`}
            >
              <option value="">
                {loadingCategories ? 'Loading categories...' : 'Select a category'}
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.category}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">
            💰
          </span>
          Pricing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              One-Time Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="1"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.price 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-slate-200 focus:ring-orange-500'
                }`}
                placeholder="50"
              />
            </div>
            {errors.price && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.price}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subscription Price (per day) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                name="subscriptionPrice"
                value={formData.subscriptionPrice}
                onChange={handleInputChange}
                min="0"
                step="1"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.subscriptionPrice 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-slate-200 focus:ring-orange-500'
                }`}
                placeholder="45"
              />
            </div>
            {errors.subscriptionPrice && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.subscriptionPrice}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Product Options Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm">
            ⚙️
          </span>
          Product Options
        </h3>
        
        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Product Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'individual' }))}
                className={`px-4 py-3 rounded-xl border-2 transition-all ${
                  formData.type === 'individual'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🍛</div>
                  <div className="font-medium text-sm">Individual Item</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'ready-meal' }))}
                className={`px-4 py-3 rounded-xl border-2 transition-all ${
                  formData.type === 'ready-meal'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🍱</div>
                  <div className="font-medium text-sm">Ready Meal</div>
                </div>
              </button>
            </div>
          </div>

          {/* Available For */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Available For <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 transition-all">
                <input
                  type="checkbox"
                  checked={formData.availableFor.includes('one-time')}
                  onChange={() => handleAvailableForChange('one-time')}
                  className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="text-slate-700 font-medium">One-Time Order</span>
              </label>
              <label className="flex-1 flex items-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 transition-all">
                <input
                  type="checkbox"
                  checked={formData.availableFor.includes('subscription')}
                  onChange={() => handleAvailableForChange('subscription')}
                  className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="text-slate-700 font-medium">Subscription</span>
              </label>
            </div>
            {errors.availableFor && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.availableFor}
              </p>
            )}
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-700">🟢 Vegetarian</span>
              <button
                type="button"
                onClick={() => handleToggle('isVeg')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isVeg ? 'bg-green-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isVeg ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-700">✅ Available Now</span>
              <button
                type="button"
                onClick={() => handleToggle('isAvailable')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isAvailable ? 'bg-green-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isAvailable ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media & Additional Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm">
            🖼️
          </span>
          Media & Details
        </h3>
        
        <div className="space-y-4">
          {/* Image Preview & URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Product Image
            </label>
            <div className="flex gap-4">
              {/* Image Preview */}
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <div className="text-3xl mb-1">📷</div>
                    <div className="text-xs">Preview</div>
                  </div>
                )}
              </div>
              
              {/* URL Input */}
              <div className="flex-1">
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  💡 Enter image URL or leave empty for default
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                🏷️
              </span>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="spicy, popular, healthy (comma-separated)"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Separate multiple tags with commas
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-4 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          style={{ 
            backgroundColor: loading ? '#E11D48' : '#E11D48',
            fontSize: '0.875rem'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#BE123C';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#E11D48';
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-spinner fa-spin"></i>
              Saving...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <i className={`fa-solid ${initialData ? 'fa-check' : 'fa-plus'}`}></i>
              {initialData ? 'Update Product' : 'Create Product'}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
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
  );
}
