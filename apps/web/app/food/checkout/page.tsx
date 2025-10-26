'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FoodHeader } from '../../components/FoodHeader';
import { AddressForm } from '../../components/AddressForm';

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

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  
  // Multiple delivery addresses
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [oneTimeAddressId, setOneTimeAddressId] = useState<string>('');
  const [subscriptionAddressId, setSubscriptionAddressId] = useState<string>('');
  
  // Delivery type and distance
  const [deliveryType, setDeliveryType] = useState<'normal' | 'premium'>('normal');
  const [deliveryDistance, setDeliveryDistance] = useState<number>(0);

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
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, [router]);

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

  // Check for addAddress query parameter
  useEffect(() => {
    if (searchParams) {
      const addAddress = searchParams.get('addAddress');
      if (addAddress === 'true') {
        setShowAddForm(true);
        setShowAllAddresses(true);
      }
    }
  }, [searchParams]);

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

  const handleSaveAddress = (addressData: any) => {
    try {
      let updatedAddresses;

      if (editingAddressId) {
        // Update existing address
        updatedAddresses = addresses.map((addr: Address) => {
          if (addr._id === editingAddressId) {
            return {
              ...addressData,
              _id: editingAddressId
            };
          }
          // If new address is set as default, remove default from others
          if (addressData.isDefault) {
            return { ...addr, isDefault: false };
          }
          return addr;
        });
        
        console.log('✅ Address updated');
        setSuccessMessage('Address updated successfully!');
      } else {
        // Create new address
        const newAddressWithId: Address = {
          ...addressData,
          _id: `addr_${Date.now()}`
        };
        
        if (addresses.length === 0 || addressData.isDefault) {
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

  const handleSetDefaultAddress = (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updatedAddresses = addresses.map((addr: Address) => ({
        ...addr,
        isDefault: addr._id === addressId
      }));
      setAddresses(updatedAddresses);
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      console.log('✅ Default address updated');
      setSuccessMessage('Default address updated successfully!');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error('❌ Error setting default address:', error);
      alert('Failed to set default address');
    }
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
    // Validation
    if (useSameAddress) {
      if (!selectedAddressId && !oneTimeAddressId) {
        alert('Please select a delivery address');
        return;
      }
    } else {
      const hasOneTimeItems = cart.some((item: any) => item.type !== 'subscription');
      const hasSubscriptionItems = cart.some((item: any) => item.type === 'subscription');
      
      if (hasOneTimeItems && !oneTimeAddressId) {
        alert('Please select delivery address for one-time items');
        return;
      }
      if (hasSubscriptionItems && !subscriptionAddressId) {
        alert('Please select delivery address for subscription items');
        return;
      }
    }

    setPlacingOrder(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to place order');
        router.push('/auth?returnUrl=/food/checkout');
        return;
      }

      // Debug: Log cart items
      console.log('🛒 Cart items:', cart);
      
      // Separate one-time and subscription items
      const oneTimeItems = cart.filter((item: any) => item.type !== 'subscription').map((item: any) => {
        const productId = item.id || item.productId || item._id;
        console.log('📦 One-time item:', { name: item.name, productId, hasId: !!item.id, hasProductId: !!item.productId, has_id: !!item._id });
        return {
          productId,
          quantity: item.quantity
        };
      });
      
      const subscriptionItems = cart.filter((item: any) => item.type === 'subscription').map((item: any) => {
        console.log('📅 Subscription item:', { name: item.productName, productId: item.productId });
        return {
          productId: item.productId,
          productName: item.productName,
          price: item.basePrice || item.price,
          quantity: 1,
          duration: item.duration,
          startDate: item.startDate,
          endDate: item.endDate,
          deliverySlot: item.deliverySlot,
          skipDates: item.skipDates || [],
          skipEnabled: item.skipEnabled || false,
          addons: item.addons || [],
          addonPrice: item.addonPrice || 0,
          dailyMeals: item.dailyMeals || [],
          total: item.price || item.totalAmount
        };
      });

      // Filter out items with undefined productId
      const validOneTimeItems = oneTimeItems.filter(item => item.productId);
      const validSubscriptionItems = subscriptionItems.filter(item => item.productId);

      console.log(`✅ Valid items: ${validOneTimeItems.length} one-time, ${validSubscriptionItems.length} subscription`);

      if (validOneTimeItems.length === 0 && validSubscriptionItems.length === 0) {
        alert('No valid items in cart. Please add products again.');
        return;
      }

      // Get selected addresses
      const oneTimeAddress = addresses.find(a => a._id === (useSameAddress ? (oneTimeAddressId || selectedAddressId) : oneTimeAddressId));
      const subscriptionAddress = useSameAddress 
        ? oneTimeAddress 
        : addresses.find(a => a._id === subscriptionAddressId);

      // Clean address objects (remove _id and other fields that aren't in schema)
      const cleanAddress = (addr: any) => {
        if (!addr) return null;
        return {
          houseNo: addr.houseNo,
          street: addr.street,
          area: addr.area,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          landmark: addr.landmark || '',
          latitude: addr.latitude || 0,
          longitude: addr.longitude || 0
        };
      };

      const cleanedOneTimeAddress = cleanAddress(oneTimeAddress);
      const cleanedSubscriptionAddress = cleanAddress(subscriptionAddress);

      console.log('📍 Cleaned addresses:', {
        oneTime: cleanedOneTimeAddress,
        subscription: cleanedSubscriptionAddress
      });

      // Prepare order data
      const orderData = {
        oneTimeItems: validOneTimeItems,
        subscriptionItems: validSubscriptionItems,
        oneTimeDeliveryAddress: cleanedOneTimeAddress,
        subscriptionDeliveryAddress: cleanedSubscriptionAddress,
        useSameAddress,
        deliveryType,
        deliveryDistance,
        deliverySlot: '10:00 AM - 12:00 PM', // Default slot
        deliveryDate: new Date().toISOString(),
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
        couponCode: appliedCoupon?.code || '',
        specialInstructions: ''
      };

      console.log('📤 Sending order data:', JSON.stringify(orderData, null, 2));

      const response = await fetch('http://localhost:5000/api/food/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      console.log('📥 Response status:', response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 500));
        throw new Error('Server returned invalid response. Please check console.');
      }

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to place order');
      }

      // Clear cart
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      
      alert(`Order placed successfully! Order Number: ${data.data.orderNumber}`);
      router.push('/food/home');
    } catch (error: any) {
      console.error('Error placing order:', error);
      alert(error.message || 'Failed to place order. Please try again.');
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

  if (loading) {
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
  
  // Calculate delivery fees separately
  const calculateDeliveryFees = () => {
    const hasOneTimeItems = cart.some((item: any) => item.type !== 'subscription');
    const hasSubscriptionItems = cart.some((item: any) => item.type === 'subscription');
    
    let oneTimeFee = 0;
    let subscriptionFee = 0;
    
    if (hasOneTimeItems) {
      if (deliveryType === 'normal') {
        oneTimeFee = 0; // Free for normal delivery
      } else if (deliveryType === 'premium') {
        // Calculate based on distance
        if (deliveryDistance <= 2) oneTimeFee = 20;
        else if (deliveryDistance <= 4) oneTimeFee = 30;
        else if (deliveryDistance <= 6) oneTimeFee = 40;
        else if (deliveryDistance <= 8) oneTimeFee = 50;
        else if (deliveryDistance <= 10) oneTimeFee = 60;
        else oneTimeFee = 70;
      }
    }
    
    // Subscription delivery is always free
    subscriptionFee = 0;
    
    return { oneTimeFee, subscriptionFee, total: oneTimeFee + subscriptionFee };
  };
  
  const { oneTimeFee, subscriptionFee, total: deliveryFee } = calculateDeliveryFees();
  
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
            {/* Delivery Options Section */}
            {(cart.some((item: any) => item.type !== 'subscription') && cart.some((item: any) => item.type === 'subscription')) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
                <h2 className="text-base font-bold mb-4" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                  Delivery Options
                </h2>
                
                {/* Use Same Address Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl mb-4" style={{ background: '#F9FAFB' }}>
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>
                      Use same address for all items
                    </p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      Both one-time and subscription items will be delivered to the same address
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUseSameAddress(!useSameAddress);
                      if (!useSameAddress) {
                        // When toggling ON, sync both addresses with selected one
                        if (selectedAddressId) {
                          setOneTimeAddressId(selectedAddressId);
                          setSubscriptionAddressId(selectedAddressId);
                        }
                      }
                    }}
                    className="relative w-14 h-7 rounded-full transition-all flex-shrink-0"
                    style={{ background: useSameAddress ? '#E11D48' : '#D1D5DB' }}
                  >
                    <div
                      className="absolute top-0.5 w-6 h-6 rounded-full transition-transform bg-white shadow-md"
                      style={{ transform: useSameAddress ? 'translateX(32px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Delivery Type Selector - ONLY show if there are one-time items */}
            {cart.some((item: any) => item.type !== 'subscription') && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: '#0E1214' }}>
                  Delivery Speed
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryType('normal')}
                    className="p-4 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: deliveryType === 'normal' ? '#E11D48' : '#E5E7EB',
                      background: deliveryType === 'normal' ? '#FEF2F2' : '#FFFFFF'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold" style={{ color: '#0E1214' }}>Normal Delivery</span>
                      <span className="text-xs font-bold px-2 py-1 rounded" 
                        style={{ background: '#10B981', color: '#FFFFFF' }}>
                        FREE
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Within 1 hour</p>
                  </button>

                  <button
                    onClick={() => setDeliveryType('premium')}
                    className="p-4 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: deliveryType === 'premium' ? '#E11D48' : '#E5E7EB',
                      background: deliveryType === 'premium' ? '#FEF2F2' : '#FFFFFF'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold" style={{ color: '#0E1214' }}>Premium Delivery</span>
                      <span className="text-xs font-bold px-2 py-1 rounded" 
                        style={{ background: '#F59E0B', color: '#FFFFFF' }}>
                        ₹20-70
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Within 30 minutes</p>
                  </button>
                </div>

                {/* Distance Input (Only show for premium) */}
                {deliveryType === 'premium' && (
                  <div className="mt-3 p-4 rounded-xl" style={{ background: '#FEF2F2' }}>
                    <label className="block text-xs font-semibold mb-2" style={{ color: '#0E1214' }}>
                      Delivery Distance (in km)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={deliveryDistance}
                      onChange={(e) => setDeliveryDistance(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-lg border-2 text-sm font-semibold"
                      style={{ borderColor: '#E11D48', color: '#0E1214' }}
                      placeholder="Enter distance"
                    />
                    <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
                      Fee: ₹{deliveryDistance <= 2 ? 20 : deliveryDistance <= 4 ? 30 : deliveryDistance <= 6 ? 40 : deliveryDistance <= 8 ? 50 : deliveryDistance <= 10 ? 60 : 70}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Address Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                  {useSameAddress ? 'Delivery Address' : 'One-Time Items Address'}
                </h2>
                {showAddForm && (
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAddressId(null);
                      setShowAllAddresses(false);
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
                        if (useSameAddress) {
                          setSelectedAddressId(address._id);
                          setOneTimeAddressId(address._id);
                          setSubscriptionAddressId(address._id);
                        } else {
                          setOneTimeAddressId(address._id);
                        }
                        setShowAllAddresses(false);
                      }}
                      className="w-full p-5 rounded-xl border-2 transition-all text-left cursor-pointer"
                      style={{
                        borderColor: (useSameAddress ? selectedAddressId : oneTimeAddressId) === address._id ? '#E11D48' : '#E5E7EB',
                        background: (useSameAddress ? selectedAddressId : oneTimeAddressId) === address._id ? '#FEF2F2' : '#FFFFFF'
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                            style={{
                              borderColor: (useSameAddress ? selectedAddressId : oneTimeAddressId) === address._id ? '#E11D48' : '#D1D5DB',
                              background: (useSameAddress ? selectedAddressId : oneTimeAddressId) === address._id ? '#E11D48' : 'transparent'
                            }}
                          >
                            {(useSameAddress ? selectedAddressId : oneTimeAddressId) === address._id && (
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
                        {/* Edit, Set Default and Delete Buttons */}
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
                          {!address.isDefault && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefaultAddress(address._id, e);
                              }}
                              className="p-2 rounded-lg transition-all"
                              style={{ background: '#F0FDF4', color: '#10B981' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#DCFCE7';
                                e.currentTarget.style.color = '#059669';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#F0FDF4';
                                e.currentTarget.style.color = '#10B981';
                              }}
                              title="Set as Default"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
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
                <AddressForm
                  initialAddress={editingAddressId ? addresses.find(addr => addr._id === editingAddressId) : undefined}
                  user={user}
                  showOrderFor={true}
                  onSave={handleSaveAddress}
                  onCancel={() => {
                    setShowAddForm(false);
                    setEditingAddressId(null);
                    setShowAllAddresses(false);
                  }}
                />
              )}
            </div>

            {/* Subscription Items Address Section (Only when useSameAddress is false AND there are subscription items) */}
            {!useSameAddress && cart.some((item: any) => item.type === 'subscription') && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
                <h2 className="text-base font-bold mb-4" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                  Subscription Items Address
                </h2>
                
                {addresses.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold mb-3" style={{ color: '#6B7280' }}>
                      Select delivery address for subscription items
                    </p>
                    {addresses.map((address, index) => (
                      <div
                        key={address._id || `sub-address-${index}`}
                        onClick={() => setSubscriptionAddressId(address._id)}
                        className="w-full p-5 rounded-xl border-2 transition-all text-left cursor-pointer"
                        style={{
                          borderColor: subscriptionAddressId === address._id ? '#E11D48' : '#E5E7EB',
                          background: subscriptionAddressId === address._id ? '#FEF2F2' : '#FFFFFF'
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div
                              className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                              style={{
                                borderColor: subscriptionAddressId === address._id ? '#E11D48' : '#D1D5DB',
                                background: subscriptionAddressId === address._id ? '#E11D48' : 'transparent'
                              }}
                            >
                              {subscriptionAddressId === address._id && (
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
                              {subscriptionAddressId === address._id && (
                                <span className="text-xs font-semibold px-2 py-1 rounded" 
                                  style={{ background: '#10B981', color: '#FFFFFF' }}>
                                  FREE Delivery
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold mb-1" style={{ color: '#0E1214' }}>
                              {address.houseNo}, {address.street}
                            </p>
                            <p className="text-xs" style={{ color: '#6B7280' }}>
                              {address.area}, {address.city}, {address.state} - {address.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs mb-3" style={{ color: '#6B7280' }}>
                      No saved addresses
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
              </div>
            )}

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
                
                {/* Delivery Fees - Separate for One-time and Subscription */}
                {cart.some((item: any) => item.type !== 'subscription') && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: '#6B7280' }}>
                      One-Time Delivery ({deliveryType === 'premium' ? `Premium • ${deliveryDistance}km` : 'Normal'})
                    </span>
                    <span className="font-semibold" style={{ color: oneTimeFee === 0 ? '#10B981' : '#0E1214' }}>
                      {oneTimeFee === 0 ? 'FREE' : `₹${oneTimeFee}`}
                    </span>
                  </div>
                )}
                
                {cart.some((item: any) => item.type === 'subscription') && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: '#6B7280' }}>Subscription Delivery</span>
                    <span className="font-semibold" style={{ color: '#10B981' }}>FREE</span>
                  </div>
                )}
                
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
