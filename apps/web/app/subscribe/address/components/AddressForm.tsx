'use client';

import { useState, useEffect } from 'react';
import { Address } from '../../context/SubscriptionContext';

interface AddressFormProps {
  initialAddress?: Partial<Address>;
  onSubmit: (address: Address) => void;
  onCancel: () => void;
}

export function AddressForm({ initialAddress, onSubmit, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState<Partial<Address>>({
    houseNo: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    label: 'Home',
    isDefault: false,
    latitude: 0,
    longitude: 0,
    ...initialAddress
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialAddress) {
      setFormData(prev => ({ ...prev, ...initialAddress }));
    }
  }, [initialAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.houseNo) newErrors.houseNo = 'House/Flat No is required';
    if (!formData.street) newErrors.street = 'Street is required';
    if (!formData.area) newErrors.area = 'Area is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Please select a location on the map';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData as Address);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Save as <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {['Home', 'Work', 'Other'].map(label => (
            <label key={label} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="label"
                value={label}
                checked={formData.label === label}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* House No */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          House/Flat No <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="houseNo"
          value={formData.houseNo}
          onChange={handleChange}
          placeholder="e.g., 123, A-45"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary ${
            errors.houseNo ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.houseNo && <p className="text-red-500 text-sm mt-1">{errors.houseNo}</p>}
      </div>

      {/* Street */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Street/Society <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleChange}
          placeholder="e.g., ABC Society, XYZ Street"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary ${
            errors.street ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
      </div>

      {/* Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Area/Locality <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="area"
          value={formData.area}
          onChange={handleChange}
          placeholder="e.g., Sector 18"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary ${
            errors.area ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
      </div>

      {/* City & State */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary ${
              errors.state ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>
      </div>

      {/* Pincode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pincode <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          placeholder="6-digit pincode"
          maxLength={6}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary ${
            errors.pincode ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
      </div>

      {/* Landmark */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Landmark (Optional)
        </label>
        <input
          type="text"
          name="landmark"
          value={formData.landmark}
          onChange={handleChange}
          placeholder="e.g., Near City Mall"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        />
      </div>

      {/* Set as Default */}
      <div>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault || false}
            onChange={handleChange}
            className="mr-3 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <span className="text-sm text-gray-700">Set as default address</span>
        </label>
      </div>

      {errors.location && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{errors.location}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark"
        >
          Save Address
        </button>
      </div>
    </form>
  );
}

