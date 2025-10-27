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
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.image || '');
  const [fileType, setFileType] = useState<'image' | 'video' | 'gif' | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Set initial preview if image exists
    if (initialData?.image) {
      setPreviewUrl(initialData.image);
      const url = initialData.image.toLowerCase();
      if (url.includes('.gif') || url.startsWith('data:image/gif')) {
        setFileType('gif');
      } else if (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.startsWith('data:video')) {
        setFileType('video');
      } else {
        setFileType('image');
      }
    }
  }, [initialData]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileTypeCheck = file.type.split('/')[0];
    const isImage = fileTypeCheck === 'image';
    const isVideo = fileTypeCheck === 'video';
    const isGif = file.type === 'image/gif';

    if (!isImage && !isVideo) {
      alert('Please upload an image, video, or GIF file');
      return;
    }

    // Check file size (max 5MB for images, 10MB for videos)
    const maxSize = isVideo ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    const maxSizeLabel = isVideo ? '10MB' : '5MB';
    
    if (file.size > maxSize) {
      alert(`File size should not exceed ${maxSizeLabel}`);
      return;
    }

    try {
      setUploadingFile(true);

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFileType(isGif ? 'gif' : isVideo ? 'video' : 'image');

      // Convert to base64 for storing in database
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          image: base64String,
        }));
        setUploadingFile(false);
      };
      reader.onerror = () => {
        alert('Error reading file');
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setPreviewUrl('');
    setFileType(null);
    setFormData((prev) => ({
      ...prev,
      image: '',
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Basic Information Card */}
      <div className="rounded-xl border p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <h3 className="font-semibold mb-5 flex items-center gap-3" style={{ color: '#0E1214', fontSize: '1.125rem' }}>
          <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
            <i className="fa-solid fa-info-circle" style={{ color: '#E11D48', fontSize: '1.125rem' }}></i>
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
            <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
              Description <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border rounded-xl outline-none transition-all resize-none"
              style={{
                borderColor: errors.description ? '#FCA5A5' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#0E1214',
                fontSize: '0.875rem'
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = errors.description ? '#DC2626' : '#E11D48';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.borderColor = errors.description ? '#FCA5A5' : '#E5E7EB';
              }}
              placeholder="Describe your product in detail..."
            />
            {errors.description && (
              <p className="mt-1.5 flex items-center gap-1" style={{ color: '#DC2626', fontSize: '0.75rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {errors.description}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
              Category <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={loadingCategories}
              className="w-full px-4 py-3 border rounded-xl outline-none transition-all"
              style={{
                borderColor: errors.category ? '#FCA5A5' : '#E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#0E1214',
                fontSize: '0.875rem'
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = errors.category ? '#DC2626' : '#E11D48';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.borderColor = errors.category ? '#FCA5A5' : '#E5E7EB';
              }}
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
              <p className="mt-1.5 flex items-center gap-1" style={{ color: '#DC2626', fontSize: '0.75rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {errors.category}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="rounded-xl border p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <h3 className="font-semibold mb-5 flex items-center gap-3" style={{ color: '#0E1214', fontSize: '1.125rem' }}>
          <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
            <i className="fa-solid fa-indian-rupee-sign" style={{ color: '#059669', fontSize: '1.125rem' }}></i>
          </span>
          Pricing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
              One-Time Price <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium" style={{ color: '#6B7280' }}>
                ₹
              </span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="1"
                className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all"
                style={{
                  borderColor: errors.price ? '#FCA5A5' : '#E5E7EB',
                  backgroundColor: '#F9FAFB',
                  color: '#0E1214',
                  fontSize: '0.875rem'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = errors.price ? '#DC2626' : '#E11D48';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = errors.price ? '#FCA5A5' : '#E5E7EB';
                }}
                placeholder="50"
              />
            </div>
            {errors.price && (
              <p className="mt-1.5 flex items-center gap-1" style={{ color: '#DC2626', fontSize: '0.75rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {errors.price}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
              Subscription Price (per day) <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium" style={{ color: '#6B7280' }}>
                ₹
              </span>
              <input
                type="number"
                name="subscriptionPrice"
                value={formData.subscriptionPrice}
                onChange={handleInputChange}
                min="0"
                step="1"
                className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all"
                style={{
                  borderColor: errors.subscriptionPrice ? '#FCA5A5' : '#E5E7EB',
                  backgroundColor: '#F9FAFB',
                  color: '#0E1214',
                  fontSize: '0.875rem'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = errors.subscriptionPrice ? '#DC2626' : '#E11D48';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = errors.subscriptionPrice ? '#FCA5A5' : '#E5E7EB';
                }}
                placeholder="45"
              />
            </div>
            {errors.subscriptionPrice && (
              <p className="mt-1.5 flex items-center gap-1" style={{ color: '#DC2626', fontSize: '0.75rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {errors.subscriptionPrice}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Product Options Card */}
      <div className="rounded-xl border p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <h3 className="font-semibold mb-5 flex items-center gap-3" style={{ color: '#0E1214', fontSize: '1.125rem' }}>
          <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
            <i className="fa-solid fa-sliders" style={{ color: '#3B82F6', fontSize: '1.125rem' }}></i>
          </span>
          Product Options
        </h3>
        
        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="block font-medium mb-3" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
              Product Type <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'individual' }))}
                className="px-4 py-3 rounded-xl border-2 transition-all"
                style={{
                  borderColor: formData.type === 'individual' ? '#E11D48' : '#E5E7EB',
                  backgroundColor: formData.type === 'individual' ? '#FEF2F2' : '#FFFFFF',
                  color: formData.type === 'individual' ? '#E11D48' : '#6B7280'
                }}
                onMouseEnter={(e) => {
                  if (formData.type !== 'individual') {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.type !== 'individual') {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }
                }}
              >
                <div className="text-center">
                  <i className="fa-solid fa-bowl-food mb-2" style={{ fontSize: '1.5rem' }}></i>
                  <div className="font-medium text-sm">Individual Item</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'ready-meal' }))}
                className="px-4 py-3 rounded-xl border-2 transition-all"
                style={{
                  borderColor: formData.type === 'ready-meal' ? '#E11D48' : '#E5E7EB',
                  backgroundColor: formData.type === 'ready-meal' ? '#FEF2F2' : '#FFFFFF',
                  color: formData.type === 'ready-meal' ? '#E11D48' : '#6B7280'
                }}
                onMouseEnter={(e) => {
                  if (formData.type !== 'ready-meal') {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.type !== 'ready-meal') {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }
                }}
              >
                <div className="text-center">
                  <i className="fa-solid fa-plate-wheat mb-2" style={{ fontSize: '1.5rem' }}></i>
                  <div className="font-medium text-sm">Ready Meal</div>
                </div>
              </button>
            </div>
          </div>

          {/* Available For */}
          <div>
            <label className="block font-medium mb-3" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
              Available For <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all"
                style={{ borderColor: '#E5E7EB' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FCA5A5'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}>
                <input
                  type="checkbox"
                  checked={formData.availableFor.includes('one-time')}
                  onChange={() => handleAvailableForChange('one-time')}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: '#E11D48' }}
                />
                <span className="font-medium" style={{ color: '#0E1214', fontSize: '0.875rem' }}>One-Time Order</span>
              </label>
              <label className="flex-1 flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all"
                style={{ borderColor: '#E5E7EB' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FCA5A5'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}>
                <input
                  type="checkbox"
                  checked={formData.availableFor.includes('subscription')}
                  onChange={() => handleAvailableForChange('subscription')}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: '#E11D48' }}
                />
                <span className="font-medium" style={{ color: '#0E1214', fontSize: '0.875rem' }}>Subscription</span>
              </label>
            </div>
            {errors.availableFor && (
              <p className="mt-1.5 flex items-center gap-1" style={{ color: '#DC2626', fontSize: '0.75rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {errors.availableFor}
              </p>
            )}
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
              <span className="font-medium flex items-center gap-2" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                <i className="fa-solid fa-leaf" style={{ color: '#059669' }}></i>
                Vegetarian
              </span>
              <button
                type="button"
                onClick={() => handleToggle('isVeg')}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ backgroundColor: formData.isVeg ? '#059669' : '#D1D5DB' }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  style={{ transform: formData.isVeg ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
              <span className="font-medium flex items-center gap-2" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#059669' }}></i>
                Available Now
              </span>
              <button
                type="button"
                onClick={() => handleToggle('isAvailable')}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ backgroundColor: formData.isAvailable ? '#059669' : '#D1D5DB' }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  style={{ transform: formData.isAvailable ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media & Additional Details Card */}
      <div className="rounded-xl border p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <h3 className="font-semibold mb-5 flex items-center gap-3" style={{ color: '#0E1214', fontSize: '1.125rem' }}>
          <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
            <i className="fa-solid fa-image" style={{ color: '#E11D48', fontSize: '1.125rem' }}></i>
          </span>
          Media & Details
        </h3>
        
        <div className="space-y-4">
          {/* File Upload Section */}
          <div>
            <label className="block font-medium mb-3" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
              Product Media (Image, Video, GIF)
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Upload Area */}
              <div className="md:col-span-1">
                <label
                  htmlFor="file-upload"
                  className="relative block w-full h-48 rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all"
                  style={{ 
                    borderColor: uploadingFile ? '#E11D48' : '#D1D5DB', 
                    backgroundColor: uploadingFile ? '#FEF2F2' : '#F9FAFB' 
                  }}
                  onMouseEnter={(e) => {
                    if (!uploadingFile) e.currentTarget.style.borderColor = '#E11D48';
                  }}
                  onMouseLeave={(e) => {
                    if (!uploadingFile) e.currentTarget.style.borderColor = '#D1D5DB';
                  }}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,video/*,.gif"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingFile}
                  />
                  
                  {uploadingFile ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <i className="fa-solid fa-spinner fa-spin text-4xl mb-3" style={{ color: '#E11D48' }}></i>
                      <p className="font-medium" style={{ color: '#E11D48', fontSize: '0.875rem' }}>Uploading...</p>
                    </div>
                  ) : previewUrl ? (
                    <div className="relative h-full group">
                      {fileType === 'video' ? (
                        <video
                          src={previewUrl}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFile();
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <i className="fa-solid fa-cloud-arrow-up text-4xl mb-3" style={{ color: '#9CA3AF' }}></i>
                      <p className="font-medium mb-1" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                        Click to upload
                      </p>
                      <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                        Image, Video or GIF
                      </p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.625rem' }} className="mt-2">
                        Max 5MB (images) / 10MB (videos)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* URL Input Alternative */}
              <div className="md:col-span-2">
                <div className="h-full flex flex-col">
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Or Enter Media URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (e.target.value) {
                        setPreviewUrl(e.target.value);
                        // Detect type from URL
                        const url = e.target.value.toLowerCase();
                        if (url.includes('.gif')) {
                          setFileType('gif');
                        } else if (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')) {
                          setFileType('video');
                        } else {
                          setFileType('image');
                        }
                      }
                    }}
                    className="w-full px-4 py-3 border rounded-xl outline-none transition-all"
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
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#EFF6FF' }}>
                    <p className="flex items-start gap-2 mb-2" style={{ color: '#1E40AF', fontSize: '0.75rem' }}>
                      <i className="fa-solid fa-circle-info mt-0.5"></i>
                      <span>Supported formats:</span>
                    </p>
                    <div className="flex flex-wrap gap-2 ml-5 mb-2">
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
                        JPG, PNG, WEBP
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
                        GIF
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
                        MP4, WEBM
                      </span>
                    </div>
                    <p className="text-xs ml-5" style={{ color: '#1E40AF' }}>
                      <i className="fa-solid fa-lightbulb mr-1"></i>
                      For larger files, use URL option instead
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
              Tags
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                <i className="fa-solid fa-tags"></i>
              </span>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all"
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
                placeholder="spicy, popular, healthy (comma-separated)"
              />
            </div>
            <p className="mt-1.5" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
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
