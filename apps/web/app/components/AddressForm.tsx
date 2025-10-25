'use client';

import { useState, useEffect } from 'react';
import { GoogleMap, Marker, StandaloneSearchBox, useLoadScript } from '@react-google-maps/api';

interface AddressFormProps {
  onSave: (address: any) => void;
  onCancel: () => void;
  initialAddress?: any;
  user?: any;
  showOrderFor?: boolean;
}

const libraries: ("places" | "geometry")[] = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

export function AddressForm({ onSave, onCancel, initialAddress, user, showOrderFor = false }: AddressFormProps) {
  // Safely get initial coordinates with proper validation
  const getInitialCoords = () => {
    if (initialAddress?.latitude && initialAddress?.longitude && 
        typeof initialAddress.latitude === 'number' && 
        typeof initialAddress.longitude === 'number' &&
        !isNaN(initialAddress.latitude) && 
        !isNaN(initialAddress.longitude)) {
      return { lat: initialAddress.latitude, lng: initialAddress.longitude };
    }
    return defaultCenter;
  };

  const [center, setCenter] = useState(getInitialCoords());
  const [markerPosition, setMarkerPosition] = useState(getInitialCoords());
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [orderFor, setOrderFor] = useState<'myself' | 'someone'>('myself');

  // Load Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAQ3tRqgbbsKDSwC_oGNF6Ocsn01llBRuc',
    libraries,
  });

  const initialCoords = getInitialCoords();
  const [address, setAddress] = useState({
    houseNo: initialAddress?.houseNo || '',
    street: initialAddress?.street || '',
    area: initialAddress?.area || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    pincode: initialAddress?.pincode || '',
    landmark: initialAddress?.landmark || '',
    label: initialAddress?.label || 'Home',
    isDefault: initialAddress?.isDefault || false,
    latitude: initialCoords.lat,
    longitude: initialCoords.lng,
    recipientName: initialAddress?.recipientName || '',
    recipientPhone: initialAddress?.recipientPhone || ''
  });

  useEffect(() => {
    if (showOrderFor && orderFor === 'myself' && user) {
      setAddress(prev => ({
        ...prev,
        recipientName: user.name || '',
        recipientPhone: user.phone || ''
      }));
    }
  }, [orderFor, user, showOrderFor]);

  const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyAQ3tRqgbbsKDSwC_oGNF6Ocsn01llBRuc`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        let area = '', city = '', state = '', pincode = '', street = '';
        
        addressComponents.forEach((component: any) => {
          if (component.types.includes('route')) {
            street = component.long_name;
          }
          if (component.types.includes('sublocality') || component.types.includes('sublocality_level_1')) {
            area = component.long_name;
          }
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });

        setAddress(prev => ({
          ...prev,
          street: street || prev.street,
          area: area || prev.area,
          city: city || prev.city,
          state: state || prev.state,
          pincode: pincode || prev.pincode,
          latitude: lat,
          longitude: lng
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const onMapClick = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setMarkerPosition({ lat, lng });
      await reverseGeocode(lat, lng);
    }
  };

  const onMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setMarkerPosition({ lat, lng });
      await reverseGeocode(lat, lng);
    }
  };

  const onPlacesChanged = async () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          setCenter({ lat, lng });
          setMarkerPosition({ lat, lng });
          await reverseGeocode(lat, lng);
        }
      }
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setCenter({ lat, lng });
          setMarkerPosition({ lat, lng });
          await reverseGeocode(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please select manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSave = () => {
    if (!address.houseNo || !address.street || !address.area || !address.city || !address.state || !address.pincode) {
      alert('Please fill all required fields');
      return;
    }

    if (showOrderFor && !address.recipientName && !address.recipientPhone) {
      alert('Please enter recipient name and phone number');
      return;
    }

    onSave(address);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-3" 
            style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
          <p className="text-sm" style={{ color: '#6B7280' }}>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Order For Selection (if enabled) */}
      {showOrderFor && (
        <div className="mb-5">
          <label className="block text-xs font-bold mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
            Order For
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setOrderFor('myself')}
              className="flex-1 p-3 rounded-xl border-2 transition-all font-semibold text-sm"
              style={{
                borderColor: orderFor === 'myself' ? '#E11D48' : '#E5E7EB',
                background: orderFor === 'myself' ? '#FEF2F2' : '#FFFFFF',
                color: orderFor === 'myself' ? '#E11D48' : '#6B7280'
              }}
            >
              Myself
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderFor('someone');
                setAddress(prev => ({
                  ...prev,
                  recipientName: '',
                  recipientPhone: ''
                }));
              }}
              className="flex-1 p-3 rounded-xl border-2 transition-all font-semibold text-sm"
              style={{
                borderColor: orderFor === 'someone' ? '#E11D48' : '#E5E7EB',
                background: orderFor === 'someone' ? '#FEF2F2' : '#FFFFFF',
                color: orderFor === 'someone' ? '#E11D48' : '#6B7280'
              }}
            >
              Someone Else
            </button>
          </div>
        </div>
      )}

      {/* Recipient Details (if enabled) */}
      {showOrderFor && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
              Recipient Name <span style={{ color: '#E11D48' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Full Name"
              value={orderFor === 'myself' ? (user?.name || '') : address.recipientName}
              onChange={(e) => setAddress({...address, recipientName: e.target.value})}
              disabled={orderFor === 'myself'}
              className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              style={{ borderColor: '#E5E7EB', background: orderFor === 'myself' ? '#F9FAFB' : '#FFFFFF' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
              Phone Number <span style={{ color: '#E11D48' }}>*</span>
            </label>
            <input
              type="tel"
              placeholder="10-digit number"
              value={orderFor === 'myself' ? (user?.phone || '') : address.recipientPhone}
              onChange={(e) => setAddress({...address, recipientPhone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
              disabled={orderFor === 'myself'}
              maxLength={10}
              className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              style={{ borderColor: '#E5E7EB', background: orderFor === 'myself' ? '#F9FAFB' : '#FFFFFF' }}
            />
          </div>
        </div>
      )}

      {/* Google Maps */}
      <div className="mb-5">
        <label className="block text-xs font-bold mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
          Select Location
        </label>
        {/* @ts-ignore - Google Maps API types not fully compatible with React 19 */}
        <StandaloneSearchBox onLoad={onSearchBoxLoad} onPlacesChanged={onPlacesChanged}>
          <input
            type="text"
            placeholder="Search for a location..."
            className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 mb-3"
            style={{ borderColor: '#E5E7EB' }}
          />
        </StandaloneSearchBox>

        <button
          type="button"
          onClick={useCurrentLocation}
          className="mb-3 px-3 py-2 rounded-lg font-semibold text-xs transition-all"
          style={{ background: '#FEF2F2', color: '#E11D48', border: '1px solid #FEE2E2' }}
        >
          Use Current Location
        </button>

        {/* @ts-ignore - Google Maps API types not fully compatible with React 19 */}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
          onClick={onMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {/* @ts-ignore - Google Maps API types not fully compatible with React 19 */}
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
          />
        </GoogleMap>
      </div>

      {/* Address Form Fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
              House/Flat No. <span style={{ color: '#E11D48' }}>*</span>
            </label>
            <input
              type="text"
              value={address.houseNo}
              onChange={(e) => setAddress({ ...address, houseNo: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
              Street/Road <span style={{ color: '#E11D48' }}>*</span>
            </label>
            <input
              type="text"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
              Area <span style={{ color: '#E11D48' }}>*</span>
            </label>
            <input
              type="text"
              value={address.area}
              onChange={(e) => setAddress({ ...address, area: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
              Landmark
            </label>
            <input
              type="text"
              value={address.landmark}
              onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
              City <span style={{ color: '#E11D48' }}>*</span>
            </label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
              State <span style={{ color: '#E11D48' }}>*</span>
            </label>
            <input
              type="text"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
              Pincode <span style={{ color: '#E11D48' }}>*</span>
            </label>
            <input
              type="text"
              value={address.pincode}
              onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              maxLength={6}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
            Save As
          </label>
          <div className="flex gap-3">
            {['Home', 'Work', 'Other'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setAddress({ ...address, label })}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                style={{
                  backgroundColor: address.label === label ? '#E11D48' : '#F3F4F6',
                  color: address.label === label ? '#FFFFFF' : '#6B7280'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Set as Default */}
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#F9FAFB' }}>
          <input
            type="checkbox"
            id="setDefault"
            checked={address.isDefault}
            onChange={(e) => setAddress({ ...address, isDefault: e.target.checked })}
            className="w-5 h-5 rounded cursor-pointer"
            style={{ accentColor: '#E11D48' }}
          />
          <label htmlFor="setDefault" className="text-sm font-semibold cursor-pointer" style={{ color: '#0E1214' }}>
            Set as default delivery address
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{ backgroundColor: '#E11D48', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
          >
            Save & Use Address
          </button>
        </div>
      </div>
    </div>
  );
}

