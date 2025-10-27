'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://localhost:5000';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  }, []);

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should not exceed 2MB');
      return;
    }

    try {
      setUploadingImage(true);

      // Convert to base64
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
    
    // Validate form
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

      // Find category name from ID
      const selectedCategory = categories.find(cat => cat._id === formData.category);
      const categoryName = selectedCategory?.name || formData.category;

      // Prepare product data matching the Product model
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: categoryName, // Category NAME (string)
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price), // MRP/Regular price
        price: Number(formData.price), // Sale price
        subscriptionPrice: Number(formData.subscriptionPrice),
        isVeg: formData.isVeg,
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        tags: [],
        stock: 100,
        rating: 4.0,
        isBestSeller: false,
        isPopular: false,
        isActive: true,
      };

      console.log('=== SENDING PRODUCT DATA ===');
      console.log('Name:', productData.name);
      console.log('Description:', productData.description);
      console.log('Category:', productData.category);
      console.log('Image length:', productData.image.length);
      console.log('Image type:', productData.image.startsWith('data:') ? 'Base64' : 'URL');
      console.log('Full data:', productData);

      const response = await fetch(`${API_BASE_URL}/api/food/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      console.log('=== API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response:', data);

      if (data.success) {
        alert('✅ Product created successfully!');
        router.push('/admin/products');
      } else {
        alert('❌ Failed: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('=== ERROR ===');
      console.error('Error:', error);
      alert('❌ Failed to create product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
          Add New Product
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Create a new product for your restaurant menu
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
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
                placeholder="e.g., Dal Makhani"
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
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all resize-none"
                style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                placeholder="Describe your product..."
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
            {/* Original Price (MRP) */}
            <div>
              <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Original Price (₹)
                <span className="ml-1 text-xs" style={{ color: '#9CA3AF' }}>(Optional)</span>
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                min="1"
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all"
                style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                placeholder="100"
                onFocus={(e) => (e.currentTarget.style.borderColor = '#E11D48')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              />
              <p className="mt-1.5 text-xs" style={{ color: '#9CA3AF' }}>
                MRP/Regular price (will show strikethrough)
              </p>
            </div>

            {/* Sale Price */}
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
                placeholder="90"
                onFocus={(e) => (e.currentTarget.style.borderColor = '#E11D48')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              />
              <p className="mt-1.5 text-xs" style={{ color: '#9CA3AF' }}>
                One-time order price
              </p>
            </div>

            {/* Subscription Price */}
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
                placeholder="87"
                onFocus={(e) => (e.currentTarget.style.borderColor = '#E11D48')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              />
              <p className="mt-1.5 text-xs" style={{ color: '#9CA3AF' }}>
                Daily subscription price
              </p>
            </div>
          </div>

          {/* Pricing Info Card */}
          {formData.originalPrice && formData.price && Number(formData.originalPrice) > Number(formData.price) && (
            <div className="mt-4 p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: '#D1FAE5' }}>
              <i className="fa-solid fa-circle-info mt-0.5" style={{ color: '#059669' }}></i>
              <div>
                <p className="text-xs font-medium" style={{ color: '#059669' }}>
                  Discount: {Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}% on one-time orders
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#047857' }}>
                  Subscription saves: {Math.round(((Number(formData.price) - Number(formData.subscriptionPrice)) / Number(formData.price)) * 100)}% more than sale price
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pure Veg Restaurant Info */}
        <div className="rounded-xl border p-6 bg-white" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#059669' }}>
              <i className="fa-solid fa-leaf text-white" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1" style={{ color: '#059669', fontSize: '1rem' }}>
                Pure Vegetarian Restaurant
              </h3>
              <p className="text-sm" style={{ color: '#047857' }}>
                All products are automatically marked as vegetarian. We serve 100% pure veg food.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="px-3 py-1.5 rounded-full font-bold text-xs" style={{ backgroundColor: '#059669', color: '#FFFFFF' }}>
                VEG ONLY
              </span>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="rounded-xl border p-6 bg-white" style={{ borderColor: '#E5E7EB' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#0E1214', fontSize: '1rem' }}>
            <i className="fa-solid fa-image" style={{ color: '#E11D48' }}></i>
            Product Image
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div>
              <label className="block font-medium mb-3" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Upload Image
              </label>
              
              <div className="relative">
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border-2" style={{ borderColor: '#E5E7EB' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2 rounded-lg text-white transition-all"
                        style={{ backgroundColor: '#DC2626' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B91C1C')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="block w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-rose-600"
                    style={{ borderColor: '#D1D5DB' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <div className="flex flex-col items-center justify-center h-full">
                      {uploadingImage ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin text-4xl mb-3" style={{ color: '#E11D48' }}></i>
                          <p className="font-medium" style={{ color: '#E11D48', fontSize: '0.875rem' }}>Uploading...</p>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up text-4xl mb-3" style={{ color: '#9CA3AF' }}></i>
                          <p className="font-medium mb-1" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                            Click to upload image
                          </p>
                          <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                            PNG, JPG, WEBP up to 2MB
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* URL Input Section */}
            <div>
              <label className="block font-medium mb-3" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Or Enter Image URL
              </label>
              
              <input
                type="url"
                value={formData.image.startsWith('data:') ? '' : formData.image}
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.value });
                  setImagePreview(e.target.value);
                }}
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all"
                style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                placeholder="https://example.com/image.jpg"
                onFocus={(e) => (e.currentTarget.style.borderColor = '#E11D48')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              />
              
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <p className="flex items-start gap-2 mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                  <i className="fa-solid fa-circle-info mt-0.5" style={{ color: '#3B82F6' }}></i>
                  <span>You can either upload an image or paste a URL</span>
                </p>
                <p className="ml-5" style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                  If left empty, a default image will be used
                </p>
              </div>

              {/* Preview from URL */}
              {formData.image && !formData.image.startsWith('data:') && (
                <div className="mt-4">
                  <p className="font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Preview
                  </p>
                  <img
                    src={formData.image}
                    alt="URL Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                    style={{ borderColor: '#E5E7EB' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              )}
            </div>
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
            {loading ? 'Creating...' : 'Create Product'}
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
