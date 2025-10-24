'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker, StandaloneSearchBox, useLoadScript } from '@react-google-maps/api';
import { FoodHeader } from '../../components/FoodHeader';

interface Address {
  _id: string;
  houseNo: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  label?: string;
  latitude: number;
  longitude: number;
}

const libraries: ("places" | "geometry")[] = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 28.6139, // Delhi coordinates as default
  lng: 77.2090
};

export default function DeliveryAddressPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState('Sector 18, Noida');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Map state
  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);

  // Load Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAQ3tRqgbbsKDSwC_oGNF6Ocsn01llBRuc',
    libraries,
  });

  // New address form state
  const [newAddress, setNewAddress] = useState({
    houseNo: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    label: 'Home',
    isDefault: false,
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lng
  });

  // Load user data
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Load saved addresses
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth?returnUrl=/food/delivery-address');
        return;
      }

      // Load addresses from localStorage
      const savedAddresses = localStorage.getItem('savedAddresses');
      if (savedAddresses) {
        const parsedAddresses = JSON.parse(savedAddresses);
        setAddresses(parsedAddresses);
        
        // Auto-select default address if exists
        const defaultAddr = parsedAddresses.find((addr: Address) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        }
        
        console.log('✅ Loaded addresses from localStorage:', parsedAddresses.length);
      } else {
        console.log('📭 No saved addresses found');
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new google.maps.Geocoder();
    
    try {
      const result = await geocoder.geocode({
        location: { lat, lng }
      });

      if (result.results[0]) {
        const addressComponents = result.results[0].address_components;
        
        let houseNo = '';
        let street = '';
        let area = '';
        let city = '';
        let state = '';
        let pincode = '';

        addressComponents.forEach(component => {
          const types = component.types;
          
          if (types.includes('street_number')) {
            houseNo = component.long_name;
          }
          if (types.includes('route')) {
            street = component.long_name;
          }
          if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
            area = component.long_name;
          }
          if (types.includes('locality')) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });

        setNewAddress(prev => ({
          ...prev,
          houseNo: houseNo || prev.houseNo,
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

  // Map click handler
  const onMapClick = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setMarkerPosition({ lat, lng });
      await reverseGeocode(lat, lng);
    }
  };

  // Marker drag handler
  const onMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setMarkerPosition({ lat, lng });
      await reverseGeocode(lat, lng);
    }
  };

  // Search box handlers
  const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
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

  // Use current location
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

  const handleSaveAddress = () => {
    try {
      // Validate required fields
      if (!newAddress.houseNo || !newAddress.street || !newAddress.area || 
          !newAddress.city || !newAddress.state || !newAddress.pincode) {
        alert('Please fill all required fields');
        return;
      }

      // Validate pincode
      if (!/^\d{6}$/.test(newAddress.pincode)) {
        alert('Pincode must be 6 digits');
        return;
      }

      let updatedAddresses;

      if (editingAddressId) {
        // Update existing address
        updatedAddresses = addresses.map((addr: Address) => {
          if (addr._id === editingAddressId) {
            return {
              ...newAddress,
              _id: editingAddressId
            };
          }
          // If new address is set as default, remove default from others
          if (newAddress.isDefault) {
            return { ...addr, isDefault: false };
          }
          return addr;
        });
        
        console.log('✅ Address updated');
      } else {
        // Generate unique ID
        const newAddressWithId: Address = {
          ...newAddress,
          _id: `addr_${Date.now()}`
        };
        
        // If this is the first address or isDefault is checked, make it default
        if (addresses.length === 0 || newAddress.isDefault) {
          newAddressWithId.isDefault = true;
          // Remove default from all other addresses
          updatedAddresses = addresses.map((addr: Address) => ({ ...addr, isDefault: false }));
          updatedAddresses = [...updatedAddresses, newAddressWithId];
        } else {
          // Update addresses list
          updatedAddresses = [...addresses, newAddressWithId];
        }
        
        setSelectedAddressId(newAddressWithId._id);
        console.log('✅ Address added');
      }
      
      setAddresses(updatedAddresses);
      
      // Save to localStorage
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      
      setShowAddForm(false);
      setEditingAddressId(null);
      
      // Reset form
      setNewAddress({
        houseNo: '',
        street: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        label: 'Home',
        isDefault: false,
        latitude: defaultCenter.lat,
        longitude: defaultCenter.lng
      });
      setMarkerPosition(defaultCenter);
      setCenter(defaultCenter);
      
      setSuccessMessage(editingAddressId ? 'Address updated successfully!' : 'Address saved successfully!');
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving address:', error);
      setSuccessMessage('Failed to save address');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    }
  };

  const handleEditAddress = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent address selection when clicking edit
    
    // Populate form with address data
    setNewAddress({
      houseNo: address.houseNo,
      street: address.street,
      area: address.area,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      label: address.label || 'Home',
      isDefault: address.isDefault,
      latitude: address.latitude,
      longitude: address.longitude
    });
    
    // Update map position
    setCenter({ lat: address.latitude, lng: address.longitude });
    setMarkerPosition({ lat: address.latitude, lng: address.longitude });
    
    // Set editing mode
    setEditingAddressId(address._id);
    setShowAddForm(true);
    
    // Scroll to form
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteAddress = (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddressToDelete(addressId);
    setShowDeleteModal(true);
  };

  const confirmDeleteAddress = () => {
    if (!addressToDelete) return;

    try {
      const updatedAddresses = addresses.filter((addr: Address) => addr._id !== addressToDelete);

      if (selectedAddressId === addressToDelete) {
        setSelectedAddressId('');
      }

      setAddresses(updatedAddresses);
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      
      console.log('✅ Address deleted');
      
      setShowDeleteModal(false);
      setAddressToDelete(null);
      
      setSuccessMessage('Address deleted successfully!');
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error deleting address:', error);
      setSuccessMessage('Failed to delete address');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    }
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address');
      return;
    }
    
    // Save selected address to localStorage for checkout
    const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
    if (selectedAddress) {
      localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
    }
    
    // Navigate to payment page
    router.push('/food/payment');
  };

  if (loadError) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">Error loading maps</p>
    </div>;
  }

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" 
            style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
          <p className="text-sm" style={{ color: '#6B7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/food/home');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Reusable Header */}
      <FoodHeader
        user={user}
        currentLocation={currentLocation}
        showLocation={false}
        showSearch={false}
        showCart={false}
        centerTitle="Select Delivery Address"
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Saved Addresses */}
        {addresses.length > 0 && !showAddForm && (
          <div className="mb-6">
            <h2 className="text-base font-bold mb-4" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
              Saved Addresses
            </h2>
            <div className="space-y-3">
              {addresses.map((address) => (
                <button
                  key={address._id}
                  onClick={() => setSelectedAddressId(address._id)}
                  className="w-full p-4 rounded-xl border-2 transition-all text-left"
                  style={{
                    borderColor: selectedAddressId === address._id ? '#E11D48' : '#E5E7EB',
                    background: selectedAddressId === address._id ? '#FEF2F2' : '#FFFFFF'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: selectedAddressId === address._id ? '#E11D48' : '#D1D5DB',
                          background: selectedAddressId === address._id ? '#E11D48' : 'transparent'
                        }}
                      >
                        {selectedAddressId === address._id && (
                          <div className="w-2 h-2 rounded-full" style={{ background: '#FFFFFF' }}></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded" 
                          style={{ background: '#E11D48', color: '#FFFFFF' }}>
                          {address.label || 'Address'}
                        </span>
                        {address.isDefault && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded" 
                            style={{ background: '#10B981', color: '#FFFFFF' }}>
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>
                        {address.houseNo}, {address.street}
                      </p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        {address.area}, {address.city}, {address.state} - {address.pincode}
                      </p>
                      {address.landmark && (
                        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                          Landmark: {address.landmark}
                        </p>
                      )}
                    </div>
                    {/* Edit and Delete Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => handleEditAddress(address, e)}
                        className="p-2 rounded-lg transition-all"
                        style={{ background: '#FEF2F2', color: '#E11D48' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#FEF2F2'}
                        title="Edit Address"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteAddress(address._id, e)}
                        className="p-2 rounded-lg transition-all"
                        style={{ background: '#FEF2F2', color: '#DC2626' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#FEE2E2';
                          e.currentTarget.style.color = '#991B1B';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FEF2F2';
                          e.currentTarget.style.color = '#DC2626';
                        }}
                        title="Delete Address"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add New Address Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full p-4 rounded-xl border-2 border-dashed transition-all mb-6"
            style={{ borderColor: '#E11D48', background: '#FFFFFF' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="#E11D48" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-semibold text-sm" style={{ color: '#E11D48', fontFamily: 'Poppins, sans-serif' }}>
                Add New Address
              </span>
            </div>
          </button>
        )}

        {/* Add Address Form with Google Maps */}
        {showAddForm && (
          <div className="bg-white rounded-xl p-5 border mb-6" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAddressId(null);
                  setNewAddress({
                    houseNo: '',
                    street: '',
                    area: '',
                    city: '',
                    state: '',
                    pincode: '',
                    landmark: '',
                    label: 'Home',
                    isDefault: false,
                    latitude: defaultCenter.lat,
                    longitude: defaultCenter.lng
                  });
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ color: '#6B7280', background: '#F3F4F6' }}
              >
                Cancel
              </button>
            </div>

            {/* Google Maps Section */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                Select Location on Map <span style={{ color: '#E11D48' }}>*</span>
              </label>
              
              {/* Search Box */}
              <div className="mb-3">
                {/* @ts-ignore - Google Maps API types not fully compatible with React 19 */}
                <StandaloneSearchBox onLoad={onSearchBoxLoad} onPlacesChanged={onPlacesChanged}>
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                </StandaloneSearchBox>
              </div>

              {/* Use Current Location Button */}
              <button
                type="button"
                onClick={useCurrentLocation}
                className="mb-3 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                style={{ background: '#FEF2F2', color: '#E11D48', border: '1px solid #FEE2E2' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FEF2F2'}
              >
                📍 Use Current Location
              </button>

              {/* Map */}
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

              <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
                📌 Click on the map or drag the marker to select your location
              </p>
            </div>

            {/* Address Form Fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>
                    House/Flat No <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A-101"
                    value={newAddress.houseNo}
                    onChange={(e) => setNewAddress({...newAddress, houseNo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>
                    Street <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Street name"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>
                  Area/Locality <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Area/Locality"
                  value={newAddress.area}
                  onChange={(e) => setNewAddress({...newAddress, area: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E5E7EB' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>
                    City <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>
                    State <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>
                    Pincode <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="6-digit pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: '#E5E7EB' }}
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nearby landmark"
                    value={newAddress.landmark}
                    onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                  Save as <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <div className="flex gap-3">
                  {['Home', 'Work', 'Other'].map(label => (
                    <label key={label} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="label"
                        value={label}
                        checked={newAddress.label === label}
                        onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                        className="mr-2"
                        style={{ accentColor: '#E11D48' }}
                      />
                      <span className="text-sm" style={{ color: '#374151' }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveAddress}
                className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: '#E11D48', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#BE123C'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#E11D48'}
              >
                {editingAddressId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </div>
        )}

        {/* Continue Button */}
        {!showAddForm && addresses.length > 0 && (
          <div className="mt-6">
            <button
              onClick={handleContinue}
              disabled={!selectedAddressId}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#E11D48', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}
              onMouseEnter={(e) => {
                if (selectedAddressId) e.currentTarget.style.background = '#BE123C';
              }}
              onMouseLeave={(e) => {
                if (selectedAddressId) e.currentTarget.style.background = '#E11D48';
              }}
            >
              Continue to Payment
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => {
            setShowDeleteModal(false);
            setAddressToDelete(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleIn 0.2s ease-out' }}
          >
            <div className="flex justify-center mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#FEE2E2' }}
              >
                <svg className="w-8 h-8" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
              Delete Address?
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAddressToDelete(null);
                }}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: '#F3F4F6', color: '#6B7280' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAddress}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: '#DC2626', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#B91C1C'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#DC2626'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all"
            style={{ animation: 'scaleIn 0.2s ease-out' }}
          >
            <div className="flex justify-center mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#D1FAE5' }}
              >
                <svg className="w-8 h-8" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
              Success!
            </h3>
            <p className="text-sm text-center" style={{ color: '#6B7280' }}>
              {successMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
