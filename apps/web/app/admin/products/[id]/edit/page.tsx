'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API_BASE_URL = 'http://localhost:5000';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    originalPrice: '',
    price: '',
    subscriptionPrice: '',
    isVeg: true,
    image: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setFetching(true);
      const response = await fetch(`${API_BASE_URL}/api/food/products/${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      const product = data.data;
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        originalPrice: product.originalPrice ? String(product.originalPrice) : '',
        price: product.price ? String(product.price) : '',
        subscriptionPrice: product.subscriptionPrice ? String(product.subscriptionPrice) : '',
        isVeg: product.isVeg !== undefined ? product.isVeg : true,
        image: product.image || '',
      });
      
      if (product.image) {
        setImagePreview(product.image);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product details');
      router.push('/admin/products');
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should not exceed 2MB');
      return;
    }

    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, image: base64String });
        setImagePreview(base64String);
        setUploadingImage(false);
      };
      reader.onerror = () => {
        alert('Error reading file');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter product name');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter description');
      return;
    }
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      alert('Please enter valid price');
      return;
    }
    if (!formData.subscriptionPrice || Number(formData.subscriptionPrice) <= 0) {
      alert('Please enter valid subscription price');
      return;
    }
    
    try {
      setLoading(true);

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price),
        price: Number(formData.price),
        subscriptionPrice: Number(formData.subscriptionPrice),
        isVeg: formData.isVeg,
        ...(formData.image && { image: formData.image })
      };

      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/food/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Product updated successfully!');
        router.push('/admin/products');
      } else {
        alert('❌ Failed: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert('❌ Failed to update product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl mb-4" style={{ color: '#E11D48' }}></i>
          <p className="font-medium" style={{ color: '#6B7280' }}>Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
            e.currentTarget.style.color = '#E11D48';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back
        </button>

        <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
          Edit Product
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Update product details for your restaurant menu
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-xl border p-6 bg-white" style={{ borderColor: '#E5E7EB' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#0E1214', fontSize: '1rem' }}>
            Basic Information
          </h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all"
                style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#E11D48')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all"
                style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#E11D48')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all"
                style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#E11D48')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-xl border p-6 bg-white" style={{ borderColor: '#E5E7EB' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#0E1214', fontSize: '1rem' }}>
            <i className="fa-solid fa-indian-rupee-sign" style={{ color: '#E11D48' }}></i>
            Pricing
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Original Price (₹)
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                min="1"
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all"
                style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#E11D48')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              />
            </div>

            <div>
              <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Sale Price (₹) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="1"
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all"
                style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#E11D48')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              />
            </div>

            <div>
              <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Subscription Price (₹/day) *
              </label>
              <input
                type="number"
                value={formData.subscriptionPrice}
                onChange={(e) => setFormData({ ...formData, subscriptionPrice: e.target.value })}
                required
                min="1"
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all"
                style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#E11D48')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="rounded-xl border p-6 bg-white" style={{ borderColor: '#E5E7EB' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#0E1214', fontSize: '1rem' }}>
            <i className="fa-solid fa-image" style={{ color: '#E11D48' }}></i>
            Product Image
          </h3>

          {imagePreview && (
            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: '#6B7280' }}>Current Image:</p>
              <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2" style={{ borderColor: '#E5E7EB' }}>
                <img src={imagePreview} alt="Product" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 rounded-lg text-white"
                  style={{ backgroundColor: '#DC2626' }}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block w-full">
              <span className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Upload New Image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium"
                style={{ 
                  color: '#6B7280',
                  backgroundColor: '#F9FAFB'
                }}
              />
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 text-white rounded-lg font-medium transition-all"
            style={{ backgroundColor: loading ? '#9CA3AF' : '#E11D48' }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#BE123C';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#E11D48';
            }}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg font-medium border transition-all"
            style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

