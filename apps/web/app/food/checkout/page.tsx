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
  recipientName?: string;
  recipientPhone?: string;
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

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState('Sector 18, Noida');
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod' | 'wallet'>('upi');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderFor, setOrderFor] = useState<'myself' | 'someone'>('myself');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [showAllAddresses, setShowAllAddresses] = useState(false);

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
    longitude: defaultCenter.lng,
    recipientName: '',
    recipientPhone: ''
  });

  // Load user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/auth?returnUrl=/food/checkout');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setRecipientName(userData.name || '');
      setRecipientPhone(userData.phone || '');
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, [router]);

  // Auto-fill recipient details when form opens with "myself" selected
  useEffect(() => {
    if (showAddForm && orderFor === 'myself' && user && !editingAddressId) {
      setNewAddress(prev => ({
        ...prev,
        recipientName: user.name || '',
        recipientPhone: user.phone || ''
      }));
    }
  }, [showAddForm, user, orderFor, editingAddressId]);

  // Load cart
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        const validCart = cartData.filter((item: any) => {
          if (item.type === 'subscription') {
            return item.productName || item.name;
          } else {
            return (item.quantity && item.quantity > 0) && (item.name || item.productName);
          }
        });
        
        // Debug log
        console.log('✅ Cart items loaded:', validCart.length);
        validCart.forEach((item: any, index: number) => {
          console.log(`📦 Item ${index + 1}:`, {
            name: item.name || item.productName,
            type: item.type,
            price: item.price,
            subscriptionPrice: item.subscriptionPrice,
            totalPrice: item.totalPrice,
            quantity: item.quantity,
            calculatedDisplay: item.type === 'subscription' 
              ? `₹${item.subscriptionPrice || item.totalPrice || item.price || 0}` 
              : `₹${(item.price || 0) * (item.quantity || 0)}`
          });
        });
        
        setCart(validCart);
        
        if (validCart.length === 0) {
          alert('Your cart is empty!');
          router.push('/food/home');
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    } else {
      alert('Your cart is empty!');
      router.push('/food/home');
    }
  }, [router]);

  // Load saved addresses
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    try {
      setLoading(true);
      const savedAddresses = localStorage.getItem('savedAddresses');
      if (savedAddresses) {
        const parsedAddresses = JSON.parse(savedAddresses);
        setAddresses(parsedAddresses);
        
        const defaultAddr = parsedAddresses.find((addr: Address) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        }
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reverse geocode
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
      if (!newAddress.houseNo || !newAddress.street || !newAddress.area || 
          !newAddress.city || !newAddress.state || !newAddress.pincode) {
        alert('Please fill all required address fields');
        return;
      }

      if (!/^\d{6}$/.test(newAddress.pincode)) {
        alert('Pincode must be 6 digits');
        return;
      }

      if (!newAddress.recipientName || !newAddress.recipientPhone) {
        alert('Please enter recipient name and phone number');
        return;
      }

      if (!/^\d{10}$/.test(newAddress.recipientPhone)) {
        alert('Phone number must be 10 digits');
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
        setSuccessMessage('Address updated successfully!');
      } else {
        // Create new address
        const newAddressWithId: Address = {
          ...newAddress,
          _id: `addr_${Date.now()}`
        };
        
        if (addresses.length === 0 || newAddress.isDefault) {
          newAddressWithId.isDefault = true;
          updatedAddresses = addresses.map((addr: Address) => ({ ...addr, isDefault: false }));
          updatedAddresses = [...updatedAddresses, newAddressWithId];
        } else {
          updatedAddresses = [...addresses, newAddressWithId];
        }
        
        setSelectedAddressId(newAddressWithId._id);
        console.log('✅ Address added');
        setSuccessMessage('Address saved successfully!');
      }
      
      setAddresses(updatedAddresses);
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      
      setShowAddForm(false);
      setEditingAddressId(null);
      setShowAllAddresses(false);
      
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
        longitude: defaultCenter.lng,
        recipientName: '',
        recipientPhone: ''
      });
      setMarkerPosition(defaultCenter);
      setCenter(defaultCenter);
      
      // Show success modal
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address');
    }
  };

  const handleEditAddress = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    
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
      longitude: address.longitude,
      recipientName: address.recipientName || '',
      recipientPhone: address.recipientPhone || ''
    });
    
    setCenter({ lat: address.latitude, lng: address.longitude });
    setMarkerPosition({ lat: address.latitude, lng: address.longitude });
    
    setEditingAddressId(address._id);
    setShowAddForm(true);
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      // Close delete modal
      setShowDeleteModal(false);
      setAddressToDelete(null);
      
      // Show success modal
      setSuccessMessage('Address deleted successfully!');
      setShowSuccessModal(true);
      
      // Auto close after 2 seconds
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

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      if (item.type === 'subscription') {
        return total + (item.subscriptionPrice || item.totalPrice || item.price || 0);
      } else {
        return total + ((item.price || 0) * (item.quantity || 0));
      }
    }, 0);
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    // Dummy coupon validation - replace with actual API call
    const dummyCoupons = [
      { code: 'SAVE10', discount: 10, type: 'percentage' },
      { code: 'FLAT50', discount: 50, type: 'flat' },
      { code: 'WELCOME20', discount: 20, type: 'percentage' },
    ];

    const coupon = dummyCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());

    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponError('');
      setSuccessMessage('Coupon applied successfully!');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address');
      return;
    }

    setPlacingOrder(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      localStorage.removeItem('cart');
      
      alert('Order placed successfully!');
      router.push('/food/home');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/food/home');
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

  const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
  const subtotal = calculateTotal();
  const deliveryFee = 40;
  const tax = Math.round(subtotal * 0.05);
  const couponDiscount = appliedCoupon 
    ? appliedCoupon.type === 'percentage' 
      ? Math.round((subtotal * appliedCoupon.discount) / 100)
      : appliedCoupon.discount
    : 0;
  const total = subtotal + deliveryFee + tax - couponDiscount;

  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB' }}>
      <FoodHeader
        user={user}
        currentLocation={currentLocation}
        showLocation={false}
        showSearch={false}
        showCart={false}
        centerTitle="Checkout"
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Progress Steps */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" 
              style={{ background: '#E11D48', color: '#FFFFFF' }}>
              1
            </div>
            <span className="text-xs font-semibold hidden sm:block" style={{ color: '#E11D48' }}>Address</span>
          </div>
          <div className="w-12 h-0.5" style={{ background: '#E5E7EB' }}></div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" 
              style={{ background: '#E5E7EB', color: '#6B7280' }}>
              2
            </div>
            <span className="text-xs font-semibold hidden sm:block" style={{ color: '#6B7280' }}>Payment</span>
          </div>
          <div className="w-12 h-0.5" style={{ background: '#E5E7EB' }}></div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" 
              style={{ background: '#E5E7EB', color: '#6B7280' }}>
              3
            </div>
            <span className="text-xs font-semibold hidden sm:block" style={{ color: '#6B7280' }}>Confirm</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                  {showAddForm ? (editingAddressId ? 'Edit Address' : 'Add New Address') : 'Delivery Address'}
                </h2>
                {showAddForm && (
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAddressId(null);
                      setShowAllAddresses(false);
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
                        longitude: defaultCenter.lng,
                        recipientName: '',
                        recipientPhone: ''
                      });
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ color: '#6B7280', background: '#F3F4F6' }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Compact Selected Address View */}
              {addresses.length > 0 && !showAddForm && !showAllAddresses && selectedAddressId && (
                <div>
                  <div className="p-4 rounded-xl border-2" style={{ borderColor: '#E11D48', background: '#FEF2F2' }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded" 
                            style={{ background: '#E11D48', color: '#FFFFFF' }}>
                            {selectedAddress?.label || 'Address'}
                          </span>
                          {selectedAddress?.recipientName && (
                            <span className="text-xs font-semibold" style={{ color: '#0E1214' }}>
                              {selectedAddress.recipientName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>
                          {selectedAddress?.houseNo}, {selectedAddress?.street}
                        </p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          {selectedAddress?.area}, {selectedAddress?.city} - {selectedAddress?.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAllAddresses(true)}
                    className="w-full mt-3 py-2.5 rounded-xl font-semibold text-xs transition-all border"
                    style={{ borderColor: '#E5E7EB', color: '#E11D48', background: '#FFFFFF' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                  >
                    Change Address
                  </button>
                </div>
              )}

              {/* All Addresses View (Expanded) */}
              {addresses.length > 0 && !showAddForm && (showAllAddresses || !selectedAddressId) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                      Select an address
                    </p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-all"
                      style={{ background: '#FEF2F2', color: '#E11D48', border: '1px solid #FEE2E2' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#FEF2F2'}
                    >
                      + Add New
                    </button>
                  </div>
                  
                  {/* Saved Addresses List */}
                <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '400px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {addresses.map((address, index) => (
                    <div
                      key={address._id || `address-${index}`}
                      onClick={() => {
                        setSelectedAddressId(address._id);
                        setShowAllAddresses(false);
                      }}
                      className="w-full p-5 rounded-xl border-2 transition-all text-left cursor-pointer"
                      style={{
                        borderColor: selectedAddressId === address._id ? '#E11D48' : '#E5E7EB',
                        background: selectedAddressId === address._id ? '#FEF2F2' : '#FFFFFF'
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                            style={{
                              borderColor: selectedAddressId === address._id ? '#E11D48' : '#D1D5DB',
                              background: selectedAddressId === address._id ? '#E11D48' : 'transparent'
                            }}
                          >
                            {selectedAddressId === address._id && (
                              <svg className="w-3 h-3" fill="none" stroke="#FFFFFF" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold px-2 py-1 rounded" 
                              style={{ background: '#E11D48', color: '#FFFFFF' }}>
                              {address.label || 'Address'}
                            </span>
                            {address.isDefault && (
                              <span className="text-xs font-semibold px-2 py-1 rounded" 
                                style={{ background: '#10B981', color: '#FFFFFF' }}>
                                Default
                              </span>
                            )}
                          </div>
                          {address.recipientName && (
                            <p className="text-sm font-bold mb-1" style={{ color: '#0E1214' }}>
                              {address.recipientName}
                              {address.recipientPhone && <span className="font-normal ml-2" style={{ color: '#6B7280' }}>
                                {address.recipientPhone}
                              </span>}
                            </p>
                          )}
                          <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>
                            {address.houseNo}, {address.street}
                          </p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>
                            {address.area}, {address.city}, {address.state} - {address.pincode}
                          </p>
                          {address.landmark && (
                            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                              Near: {address.landmark}
                            </p>
                          )}
                        </div>
                        {/* Edit and Delete Buttons */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address, e);
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address._id, e);
                            }}
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
                    </div>
                  ))}
                </div>
                </div>
              )}

              {/* No Addresses - Show Add Button */}
              {addresses.length === 0 && !showAddForm && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" 
                    style={{ background: '#FEF2F2' }}>
                    <svg className="w-8 h-8" fill="none" stroke="#E11D48" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    No Delivery Address
                  </p>
                  <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
                    Add your delivery address to continue
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
                    style={{ background: '#E11D48', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#BE123C'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#E11D48'}
                  >
                    Add Address
                  </button>
                </div>
              )}

              {/* Add Address Form */}
              {showAddForm && (
                <div>
                  {/* Order For Selection */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                      Order For
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setOrderFor('myself');
                          setNewAddress({
                            ...newAddress,
                            recipientName: user?.name || '',
                            recipientPhone: user?.phone || ''
                          });
                        }}
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
                          setNewAddress({
                            ...newAddress,
                            recipientName: '',
                            recipientPhone: ''
                          });
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

                  {/* Recipient Details */}
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                        Recipient Name <span style={{ color: '#E11D48' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={orderFor === 'myself' ? (user?.name || '') : newAddress.recipientName}
                        onChange={(e) => setNewAddress({...newAddress, recipientName: e.target.value})}
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
                        value={orderFor === 'myself' ? (user?.phone || '') : newAddress.recipientPhone}
                        onChange={(e) => setNewAddress({...newAddress, recipientPhone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                        disabled={orderFor === 'myself'}
                        maxLength={10}
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                        style={{ borderColor: '#E5E7EB', background: orderFor === 'myself' ? '#F9FAFB' : '#FFFFFF' }}
                      />
                    </div>
                  </div>

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
                          House/Flat No <span style={{ color: '#E11D48' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. A-101"
                          value={newAddress.houseNo}
                          onChange={(e) => setNewAddress({...newAddress, houseNo: e.target.value})}
                          className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                          style={{ borderColor: '#E5E7EB' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                          Street <span style={{ color: '#E11D48' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Street name"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                          className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                          style={{ borderColor: '#E5E7EB' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                        Area/Locality <span style={{ color: '#E11D48' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Area/Locality"
                        value={newAddress.area}
                        onChange={(e) => setNewAddress({...newAddress, area: e.target.value})}
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                        style={{ borderColor: '#E5E7EB' }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                          City <span style={{ color: '#E11D48' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                          style={{ borderColor: '#E5E7EB' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                          State <span style={{ color: '#E11D48' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                          className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                          style={{ borderColor: '#E5E7EB' }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                          Pincode <span style={{ color: '#E11D48' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="6-digit pincode"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                          className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                          style={{ borderColor: '#E5E7EB' }}
                          maxLength={6}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Nearby landmark"
                          value={newAddress.landmark}
                          onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}
                          className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                          style={{ borderColor: '#E5E7EB' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-3" style={{ color: '#374151' }}>
                        Save as
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
                            <span className="text-sm font-medium" style={{ color: '#374151' }}>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setShowAllAddresses(false);
                        }}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
                        style={{ background: '#F3F4F6', color: '#6B7280' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAddress}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
                        style={{ background: '#E11D48', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}
                      >
                        {editingAddressId ? 'Update Address' : 'Save Address'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            {selectedAddress && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
                <h2 className="text-base font-bold mb-5" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                  Payment Method
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'upi', label: 'UPI' },
                    { id: 'card', label: 'Card' },
                    { id: 'cod', label: 'Cash on Delivery' },
                    { id: 'wallet', label: 'Wallet' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className="p-3 rounded-xl border-2 transition-all font-semibold text-sm"
                      style={{
                        borderColor: paymentMethod === method.id ? '#E11D48' : '#E5E7EB',
                        background: paymentMethod === method.id ? '#FEF2F2' : '#FFFFFF',
                        color: paymentMethod === method.id ? '#E11D48' : '#6B7280'
                      }}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24" style={{ border: '1px solid #E5E7EB' }}>
              <h2 className="text-base font-bold mb-4" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-2 mb-5 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {cart.map((item, index) => (
                  <div key={`${item.productId || item.id}-${item.type}-${index}`} className="flex items-start gap-2 pb-2 border-b" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex-1">
                      <p className="text-xs font-bold mb-0.5" style={{ color: '#0E1214' }}>
                        {item.name || item.productName}
                      </p>
                      {item.type === 'subscription' ? (
                        <div className="text-xs" style={{ color: '#6B7280' }}>
                          <p>{item.duration} days • Start: {new Date(item.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                          {item.skipDates && item.skipDates.length > 0 && (
                            <p className="mt-0.5">{item.skipDates.length} skip days</p>
                          )}
                          {item.addons && item.addons.length > 0 && (
                            <p className="mt-0.5">{item.addons.length} add-ons</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          Qty: {item.quantity}
                        </p>
                      )}
                    </div>
                      <span className="text-xs font-bold" style={{ color: '#E11D48' }}>
                        ₹{item.type === 'subscription' ? (item.subscriptionPrice || item.totalPrice || item.price || 0) : (item.price * item.quantity)}
                      </span>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-5">
                {!appliedCoupon ? (
                  <div>
                    <label className="block text-xs font-bold mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                      Have a Coupon Code?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600"
                        style={{ borderColor: couponError ? '#DC2626' : '#E5E7EB' }}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2.5 rounded-xl font-semibold text-xs transition-all"
                        style={{ background: '#E11D48', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#BE123C'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#E11D48'}
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs mt-2" style={{ color: '#DC2626' }}>
                        {couponError}
                      </p>
                    )}

                    {/* Available Coupons - Horizontal Scrollable */}
                    <div className="mt-3">
                      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {[
                          { code: 'SAVE10', discount: '10%' },
                          { code: 'FLAT50', discount: '₹50' },
                          { code: 'WELCOME20', discount: '20%' },
                        ].map((coupon) => (
                          <button
                            key={coupon.code}
                            onClick={() => {
                              setCouponCode(coupon.code);
                              setCouponError('');
                            }}
                            className="flex-shrink-0 px-3 py-2 rounded-lg border transition-all"
                            style={{ 
                              borderColor: couponCode === coupon.code ? '#E11D48' : '#E5E7EB',
                              background: couponCode === coupon.code ? '#FEF2F2' : '#F9FAFB',
                              borderWidth: '1.5px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#E11D48';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = couponCode === coupon.code ? '#E11D48' : '#E5E7EB';
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3 h-3" fill="none" stroke="#E11D48" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                              <span className="text-xs font-bold" style={{ color: '#E11D48' }}>
                                {coupon.code}
                              </span>
                              <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                                {coupon.discount}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border flex items-center justify-between" 
                    style={{ background: '#D1FAE5', borderColor: '#10B981' }}>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-xs font-bold" style={{ color: '#10B981' }}>
                          {appliedCoupon.code} Applied
                        </p>
                        <p className="text-xs" style={{ color: '#059669' }}>
                          You saved ₹{appliedCoupon.type === 'percentage' ? Math.round((subtotal * appliedCoupon.discount) / 100) : appliedCoupon.discount}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-semibold"
                      style={{ color: '#DC2626' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-xs">
                  <span style={{ color: '#6B7280' }}>Subtotal</span>
                  <span className="font-semibold" style={{ color: '#0E1214' }}>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: '#6B7280' }}>Delivery Fee</span>
                  <span className="font-semibold" style={{ color: '#0E1214' }}>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: '#6B7280' }}>Tax (5%)</span>
                  <span className="font-semibold" style={{ color: '#0E1214' }}>₹{tax}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: '#10B981' }}>Coupon Discount</span>
                    <span className="font-semibold" style={{ color: '#10B981' }}>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold pt-2 border-t" style={{ borderColor: '#E5E7EB' }}>
                  <span style={{ color: '#0E1214' }}>Total</span>
                  <span style={{ color: '#E11D48' }}>₹{total}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddressId || placingOrder}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#E11D48', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}
              >
                {placingOrder ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Order...
                  </span>
                ) : (
                  `Place Order (₹${total})`
                )}
              </button>

              <p className="text-xs text-center mt-3" style={{ color: '#9CA3AF' }}>
                By placing order, you agree to our Terms
              </p>
            </div>
          </div>
        </div>
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
            {/* Icon */}
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

            {/* Title */}
            <h3 className="text-xl font-bold text-center mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
              Delete Address?
            </h3>

            {/* Message */}
            <p className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>
              Are you sure you want to delete this address? This action cannot be undone.
            </p>

            {/* Buttons */}
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
            {/* Icon */}
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

            {/* Title */}
            <h3 className="text-xl font-bold text-center mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
              Success!
            </h3>

            {/* Message */}
            <p className="text-sm text-center" style={{ color: '#6B7280' }}>
              {successMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
