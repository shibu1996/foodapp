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
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  
  // Multiple delivery addresses
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [oneTimeAddressId, setOneTimeAddressId] = useState<string>('');
  const [subscriptionAddressId, setSubscriptionAddressId] = useState<string>('');
  
  // Delivery type and distance
  const [deliveryType, setDeliveryType] = useState<'express' | 'scheduled' | 'standard'>('standard');
  const [deliveryDistance, setDeliveryDistance] = useState<number>(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  // Bill breakdown accordion
  const [showBillBreakdown, setShowBillBreakdown] = useState(false);
  
  // Charges from API
  const [charges, setCharges] = useState<any>({
    delivery: [],
    platform: [],
    tax: [],
    packaging: []
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
  
  // Load charges from API (reload when cart changes)
  useEffect(() => {
    if (cart.length > 0) {
      loadCharges();
    }
  }, [cart]);

  // Load available coupons
  useEffect(() => {
    if (cart.length > 0) {
      loadAvailableCoupons();
    }
  }, [cart]);
  
  const loadCharges = async () => {
    try {
      // Determine order type based on cart items
      const hasOneTimeItems = cart.some((item: any) => item.type !== 'subscription');
      const hasSubscriptionItems = cart.some((item: any) => item.type === 'subscription');
      
      let orderType = 'both';
      if (hasOneTimeItems && !hasSubscriptionItems) {
        orderType = 'onetime';
      } else if (hasSubscriptionItems && !hasOneTimeItems) {
        orderType = 'subscription';
      }
      
      const response = await fetch(`http://localhost:5000/api/food/charges/active?orderType=${orderType}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCharges(data.data);
          console.log('✅ Charges loaded from API:', data.data);
        }
      }
    } catch (error) {
      console.error('❌ Error loading charges:', error);
      // If API fails, charges will remain empty (all FREE)
    }
  };

  const loadAvailableCoupons = async () => {
    try {
      // Determine order type based on cart items
      const hasSubscription = cart.some(item => item.type === 'subscription');
      const hasOnetime = cart.some(item => item.type !== 'subscription');
      const applicableFor = hasSubscription && !hasOnetime ? 'subscription' : 
                           !hasSubscription && hasOnetime ? 'onetime' : 'all';

      // Get user ID from localStorage
      const userId = localStorage.getItem('userId');

      const response = await fetch(
        `${API_BASE_URL}/api/food/coupons/active?applicableFor=${applicableFor}&userId=${userId || ''}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Show only top 3 coupons
          setAvailableCoupons(data.data.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
      setAvailableCoupons([]);
    }
  };

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      // Determine order type
      const hasSubscription = cart.some(item => item.type === 'subscription');
      const hasOnetime = cart.some(item => item.type !== 'subscription');
      const orderType = hasSubscription && !hasOnetime ? 'subscription' : 
                       !hasSubscription && hasOnetime ? 'onetime' : 'all';

      // Get user ID from localStorage
      const userId = localStorage.getItem('userId');

      // Calculate current order amount
      const orderAmount = calculateSubtotal();

      const response = await fetch(`${API_BASE_URL}/api/food/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          userId: userId || undefined,
          orderType,
          orderAmount
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppliedCoupon({
          ...data.data,
          type: data.data.discountType
        });
        setCouponError('');
        setSuccessMessage(`Coupon applied! You saved ₹${data.data.discountAmount}`);
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Handle quantity change for one-time items
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return; // Don't allow 0 quantity
    
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };
  
  // Handle item removal
  const handleRemoveItem = (index: number) => {
    setItemToRemove(index);
    setShowRemoveModal(true);
  };
  
  const confirmRemoveItem = () => {
    if (itemToRemove !== null) {
      const updatedCart = cart.filter((_, i) => i !== itemToRemove);
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      setShowRemoveModal(false);
      setItemToRemove(null);
      
      // If cart becomes empty, redirect to home
      if (updatedCart.length === 0) {
        setTimeout(() => {
          alert('Your cart is empty!');
          router.push('/food/home');
        }, 300);
      }
    }
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
        couponId: appliedCoupon?.couponId || null,
        couponDiscount: appliedCoupon?.discountAmount || 0,
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
  
  // Calculate delivery fees based on admin charges from API
  const calculateDeliveryFees = () => {
    const hasOneTimeItems = cart.some((item: any) => item.type !== 'subscription');
    const hasSubscriptionItems = cart.some((item: any) => item.type === 'subscription');
    
    let oneTimeFee = 0;
    let subscriptionFee = 0;
    
    // If no delivery charges configured in admin, delivery is FREE
    if (!charges.delivery || charges.delivery.length === 0) {
      return { oneTimeFee: 0, subscriptionFee: 0, total: 0 };
    }
    
    if (hasOneTimeItems) {
      // Find the applicable delivery charge based on delivery type
      let applicableCharge = null;
      
      if (deliveryType === 'express') {
        // Find distance-based charge
        applicableCharge = charges.delivery.find((c: any) => 
          c.name.toLowerCase().includes('express') && 
          c.maxDistance && 
          deliveryDistance <= c.maxDistance
        );
      } else if (deliveryType === 'scheduled') {
        // Find scheduled/free charge
        applicableCharge = charges.delivery.find((c: any) => 
          c.name.toLowerCase().includes('scheduled') || 
          c.name.toLowerCase().includes('shared') ||
          c.amount === 0
        );
      } else {
        // Standard delivery - fixed price
        applicableCharge = charges.delivery.find((c: any) => 
          c.name.toLowerCase().includes('standard')
        );
      }
      
      if (applicableCharge) {
        oneTimeFee = applicableCharge.type === 'percentage' 
          ? Math.round(calculateTotal() * applicableCharge.amount / 100)
          : applicableCharge.amount;
      }
    }
    
    // Subscription delivery is typically FREE, but check if there's a specific charge
    if (hasSubscriptionItems) {
      const subscriptionDeliveryCharge = charges.delivery.find((c: any) => 
        c.applicableFor === 'subscription' || c.applicableFor === 'both'
      );
      
      if (subscriptionDeliveryCharge) {
        subscriptionFee = subscriptionDeliveryCharge.type === 'percentage'
          ? Math.round(calculateTotal() * subscriptionDeliveryCharge.amount / 100)
          : subscriptionDeliveryCharge.amount;
      }
    }
    
    return { oneTimeFee, subscriptionFee, total: oneTimeFee + subscriptionFee };
  };

  // Calculate platform fee from API charges
  const calculatePlatformFee = () => {
    // If no platform fees configured in admin, platform fee is FREE (0)
    if (!charges.platform || charges.platform.length === 0) {
      return 0;
    }
    
    // Use the first active platform fee (typically there's only one)
    const platformCharge = charges.platform[0];
    
    if (platformCharge.type === 'percentage') {
      return Math.round(subtotal * platformCharge.amount / 100);
    } else {
      return platformCharge.amount;
    }
  };

  // Calculate packaging charge from API charges
  const calculatePackagingCharge = () => {
    // If no packaging charges configured in admin, packaging is FREE (0)
    if (!charges.packaging || charges.packaging.length === 0) {
      return 0;
    }
    
    const oneTimeItems = cart.filter((item: any) => item.type !== 'subscription');
    const itemCount = oneTimeItems.reduce((total, item) => total + (item.quantity || 1), 0);
    
    // Use the first active packaging charge
    const packagingCharge = charges.packaging[0];
    
    if (packagingCharge.type === 'percentage') {
      return Math.round(subtotal * packagingCharge.amount / 100);
    } else {
      // Fixed charge per item
      return packagingCharge.amount * itemCount;
    }
  };
  
  // Calculate tax from API charges
  const calculateTax = () => {
    // If no tax configured in admin, tax is FREE (0)
    if (!charges.tax || charges.tax.length === 0) {
      return 0;
    }
    
    // Use the first active tax (typically there's only one)
    const taxCharge = charges.tax[0];
    
    if (taxCharge.type === 'percentage') {
      return Math.round(subtotal * taxCharge.amount / 100);
    } else {
      return taxCharge.amount;
    }
  };
  
  const { oneTimeFee, subscriptionFee, total: deliveryFee } = calculateDeliveryFees();
  const platformFee = calculatePlatformFee();
  const packagingCharge = calculatePackagingCharge();
  const tax = calculateTax();
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const total = subtotal + deliveryFee + platformFee + packagingCharge + tax - couponDiscount;

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
                <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                  <i className="fa fa-truck mr-2" style={{ color: '#E11D48' }}></i>
                  Delivery Options
                </h3>
                
                <div className="space-y-3">
                  {/* Express Delivery */}
                  <button
                    onClick={() => setDeliveryType('express')}
                    className="w-full p-4 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: deliveryType === 'express' ? '#E11D48' : '#E5E7EB',
                      background: deliveryType === 'express' ? '#FEF2F2' : '#FFFFFF'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="fa fa-bolt" style={{ color: '#F59E0B', fontSize: '14px' }}></i>
                          <span className="text-sm font-bold" style={{ color: '#0E1214' }}>Express Delivery</span>
                          {deliveryType === 'express' && deliveryDistance <= 3 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded" 
                              style={{ background: '#10B981', color: '#FFFFFF' }}>
                              FREE
                            </span>
                          )}
                        </div>
                        <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
                          Instant delivery • 30-40 mins
                        </p>
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          <span className="px-2 py-1 rounded" style={{ background: '#D1FAE5', color: '#059669' }}>
                            0-3km: FREE
                          </span>
                          <span className="px-2 py-1 rounded" style={{ background: '#FEF3C7', color: '#D97706' }}>
                            3-5km: ₹20
                          </span>
                          <span className="px-2 py-1 rounded" style={{ background: '#FED7AA', color: '#C2410C' }}>
                            5-10km: ₹30
                          </span>
                          <span className="px-2 py-1 rounded" style={{ background: '#FECACA', color: '#991B1B' }}>
                            10+km: ₹50
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Distance Input for Express */}
                  {deliveryType === 'express' && (
                    <div className="p-4 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                        <i className="fa fa-map-marker-alt mr-1.5" style={{ color: '#E11D48' }}></i>
                        Enter Delivery Distance (km)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={deliveryDistance}
                        onChange={(e) => setDeliveryDistance(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 rounded-lg border-2 text-sm font-semibold focus:outline-none"
                        style={{ borderColor: '#E11D48', color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}
                        placeholder="e.g., 2.5"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                          Delivery Charge:
                        </p>
                        <p className="text-sm font-bold" style={{ color: '#E11D48' }}>
                          {deliveryDistance <= 3 ? 'FREE' : deliveryDistance <= 5 ? '₹20' : deliveryDistance <= 10 ? '₹30' : '₹50'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Scheduled Delivery */}
                  <button
                    onClick={() => setDeliveryType('scheduled')}
                    className="w-full p-4 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: deliveryType === 'scheduled' ? '#E11D48' : '#E5E7EB',
                      background: deliveryType === 'scheduled' ? '#FEF2F2' : '#FFFFFF'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="fa fa-clock" style={{ color: '#10B981', fontSize: '14px' }}></i>
                          <span className="text-sm font-bold" style={{ color: '#0E1214' }}>Scheduled Delivery</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded" 
                            style={{ background: '#10B981', color: '#FFFFFF' }}>
                            FREE
                          </span>
                        </div>
                        <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
                          Choose a time slot • Batched delivery
                        </p>
                        <p className="text-xs" style={{ color: '#F59E0B' }}>
                          <i className="fa fa-info-circle mr-1"></i>
                          Wait time: 2-3 orders batched together
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Time Slots for Scheduled Delivery */}
                  {deliveryType === 'scheduled' && (
                    <div className="p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                        <i className="fa fa-calendar-alt mr-1.5" style={{ color: '#10B981' }}></i>
                        Select Time Slot
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'slot1', time: '12:00-2:00 PM' },
                          { id: 'slot2', time: '2:00-4:00 PM' },
                          { id: 'slot3', time: '4:00-6:00 PM' },
                          { id: 'slot4', time: '6:00-8:00 PM' },
                        ].map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedTimeSlot(slot.id)}
                            className="px-3 py-2 rounded-lg font-semibold text-xs transition-all"
                            style={{
                              background: selectedTimeSlot === slot.id ? '#10B981' : '#FFFFFF',
                              color: selectedTimeSlot === slot.id ? '#FFFFFF' : '#6B7280',
                              border: `1.5px solid ${selectedTimeSlot === slot.id ? '#10B981' : '#D1D5DB'}`
                            }}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standard Delivery */}
                  <button
                    onClick={() => setDeliveryType('standard')}
                    className="w-full p-4 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: deliveryType === 'standard' ? '#E11D48' : '#E5E7EB',
                      background: deliveryType === 'standard' ? '#FEF2F2' : '#FFFFFF'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="fa fa-shipping-fast" style={{ color: '#6366F1', fontSize: '14px' }}></i>
                          <span className="text-sm font-bold" style={{ color: '#0E1214' }}>Standard Delivery</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded" 
                            style={{ background: '#6366F1', color: '#FFFFFF' }}>
                            ₹30
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          Normal delivery • Within 1-2 hours
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
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

            {/* Coupon Section - Moved from Right Side */}
            <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                <i className="fa fa-tags" style={{ color: '#E11D48' }}></i>
                Apply Coupon
              </h3>
              {!appliedCoupon ? (
                <div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      placeholder="ENTER CODE"
                      className="flex-1 px-3 py-2 border-2 rounded-lg text-xs font-semibold focus:outline-none uppercase"
                      style={{ 
                        borderColor: couponError ? '#DC2626' : '#E11D48', 
                        color: '#0E1214',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 rounded-lg font-bold text-xs transition-all"
                      style={{ background: '#E11D48', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#BE123C'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#E11D48'}
                    >
                      <i className="fa fa-check mr-1"></i>
                      APPLY
                    </button>
                  </div>
                  {couponError && (
                    <div className="p-2 rounded flex items-center gap-2 mb-3" style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
                      <i className="fa fa-exclamation-circle" style={{ color: '#DC2626', fontSize: '11px' }}></i>
                      <p className="text-xs font-semibold" style={{ color: '#DC2626' }}>
                        {couponError}
                      </p>
                    </div>
                  )}

                  {/* Available Coupons */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                      <i className="fa fa-sparkles mr-1" style={{ fontSize: '10px' }}></i>
                      Available Offers
                    </p>
                    {availableCoupons.length > 0 ? availableCoupons.map((coupon) => (
                      <button
                        key={coupon._id}
                        onClick={() => {
                          setCouponCode(coupon.code);
                          setCouponError('');
                        }}
                        className="w-full p-2 rounded-lg border transition-all text-left flex items-center justify-between"
                        style={{ 
                          borderColor: couponCode === coupon.code ? '#E11D48' : '#E5E7EB',
                          background: couponCode === coupon.code ? '#FEF2F2' : '#FFFFFF',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: '#E11D48' }}>
                            <i className="fa fa-percent" style={{ color: '#FFFFFF', fontSize: '10px' }}></i>
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-bold block" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                              {coupon.code}
                            </span>
                            <span className="text-xs" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                              {coupon.description}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-bold whitespace-nowrap ml-2" style={{ color: '#E11D48', fontFamily: 'Poppins, sans-serif' }}>
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        </span>
                      </button>
                    )) : (
                      <p className="text-xs text-center py-3" style={{ color: '#9CA3AF' }}>
                        No coupons available
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg flex items-center justify-between" 
                  style={{ background: '#D1FAE5', border: '2px solid #10B981' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#10B981' }}>
                      <i className="fa fa-check" style={{ color: '#FFFFFF', fontSize: '12px' }}></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#10B981', fontFamily: 'Poppins, sans-serif' }}>
                        {appliedCoupon.code}
                      </p>
                      <p className="text-xs font-semibold" style={{ color: '#059669' }}>
                        Saved ₹{appliedCoupon.type === 'percentage' ? Math.round((subtotal * appliedCoupon.discount) / 100) : appliedCoupon.discount}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="px-2 py-1 rounded-lg text-xs font-bold transition-all"
                    style={{ background: '#DC2626', color: '#FFFFFF' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#B91C1C'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#DC2626'}
                  >
                    <i className="fa fa-times mr-1"></i>
                    REMOVE
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Detailed Bill */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm sticky top-24" style={{ border: '1px solid #E5E7EB' }}>
              {/* Bill Header */}
              <div className="p-4 border-b" style={{ borderColor: '#E5E7EB', background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold" style={{ color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
                    <i className="fa fa-file-invoice mr-2"></i>
                    Order Bill
                  </h2>
                  <div className="text-xs font-semibold px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>
                    {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                  </div>
                </div>
              </div>

              {/* Cart Items - Compact View */}
              <div className="p-3">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                  <i className="fa fa-shopping-basket text-sm" style={{ color: '#E11D48' }}></i>
                  Items Ordered
                </h3>
                <div className="space-y-2 mb-3 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E11D48 #F9FAFB' }}>
                  {cart.map((item, index) => (
                    <div key={`${item.productId || item.id}-${item.type}-${index}`} className="p-2.5 rounded-lg" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-bold leading-tight" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                              {item.name || item.productName}
                            </span>
                            {item.type === 'subscription' && (
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#E11D48', color: '#FFFFFF' }}>
                                SUB
                              </span>
                            )}
                          </div>
                          
                          {item.type === 'subscription' ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7280' }}>
                                <i className="fa fa-calendar-check text-xs"></i>
                                <span>{item.duration} days • {new Date(item.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                              </div>
                              {item.skipDates && item.skipDates.length > 0 && (
                                <div className="flex items-center gap-1.5 text-xs" style={{ color: '#F59E0B' }}>
                                  <i className="fa fa-ban text-xs"></i>
                                  <span>{item.skipDates.length} skip days</span>
                                </div>
                              )}
                              {item.addons && item.addons.length > 0 && (
                                <div className="mt-1.5 pt-1.5 border-t" style={{ borderColor: '#E5E7EB' }}>
                                  <div className="space-y-0.5">
                                    {item.addons.map((addon: any, addonIndex: number) => (
                                      <div key={addonIndex} className="flex items-center justify-between text-xs">
                                        <span style={{ color: '#6B7280' }}>
                                          <i className="fa fa-plus-circle mr-1 text-xs" style={{ color: '#10B981' }}></i>
                                          {addon.name}
                                        </span>
                                        <span className="font-bold" style={{ color: '#10B981' }}>+₹{addon.price}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <span style={{ color: '#6B7280' }}>
                                ₹{item.price} each
                              </span>
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                                  style={{ background: '#FEE2E2', color: '#E11D48' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#E11D48';
                                    e.currentTarget.style.color = '#FFFFFF';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#FEE2E2';
                                    e.currentTarget.style.color = '#E11D48';
                                  }}
                                >
                                  <i className="fa fa-minus" style={{ fontSize: '10px' }}></i>
                                </button>
                                <span className="text-sm font-bold w-6 text-center" style={{ color: '#0E1214' }}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                                  style={{ background: '#D1FAE5', color: '#10B981' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#10B981';
                                    e.currentTarget.style.color = '#FFFFFF';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#D1FAE5';
                                    e.currentTarget.style.color = '#10B981';
                                  }}
                                >
                                  <i className="fa fa-plus" style={{ fontSize: '10px' }}></i>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Delete Button - Show for ALL items */}
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                          style={{ background: '#FEE2E2', color: '#E11D48' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#E11D48';
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FEE2E2';
                            e.currentTarget.style.color = '#E11D48';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title="Remove from cart"
                        >
                          <i className="fa fa-trash text-xs"></i>
                        </button>
                      </div>
                      
                      {/* Item Total */}
                      <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t" style={{ borderColor: '#E5E7EB' }}>
                        <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                          Total
                        </span>
                        <span className="text-base font-bold" style={{ color: '#E11D48', fontFamily: 'Poppins, sans-serif' }}>
                          ₹{item.type === 'subscription' ? (item.subscriptionPrice || item.totalPrice || item.price || 0) : (item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Breakdown - Accordion */}
              <div className="px-3 pb-3">
                <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', border: '1px solid #E5E7EB' }}>
                  {/* Accordion Header */}
                  <button
                    onClick={() => setShowBillBreakdown(!showBillBreakdown)}
                    className="w-full flex items-center justify-between mb-2"
                  >
                    <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                      <i className="fa fa-calculator text-sm" style={{ color: '#E11D48' }}></i>
                      Bill Breakdown
                    </h3>
                    <i className={`fa fa-chevron-${showBillBreakdown ? 'up' : 'down'} text-xs transition-transform`} style={{ color: '#E11D48' }}></i>
                  </button>
                  
                  {/* Accordion Content */}
                  {showBillBreakdown && (
                  <div className="space-y-2">
                    {/* Item Total */}
                    <div className="flex justify-between items-center p-1.5 rounded-lg" style={{ background: '#FFFFFF' }}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#FEF2F2' }}>
                          <i className="fa fa-shopping-bag text-xs" style={{ color: '#E11D48' }}></i>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>Item Total</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>₹{subtotal}</span>
                    </div>
                    
                    {/* Delivery Charges */}
                    {cart.some((item: any) => item.type !== 'subscription') && (
                      <div className="flex justify-between items-center p-1.5 rounded-lg" style={{ background: '#FFFFFF' }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded flex items-center justify-center" 
                            style={{ background: oneTimeFee === 0 ? '#D1FAE5' : '#FEF3C7' }}>
                            <i className="fa fa-truck text-xs" style={{ 
                              color: oneTimeFee === 0 ? '#10B981' : '#F59E0B'
                            }}></i>
                          </div>
                          <span className="text-xs font-semibold" style={{ color: '#0E1214' }}>
                            {deliveryType === 'express' ? `Express (${deliveryDistance}km)` : deliveryType === 'scheduled' ? 'Scheduled' : 'Standard'}
                          </span>
                        </div>
                        <span className="text-sm font-bold" style={{ 
                          color: oneTimeFee === 0 ? '#10B981' : '#0E1214',
                          fontFamily: 'Poppins, sans-serif' 
                        }}>
                          {oneTimeFee === 0 ? 'FREE' : `₹${oneTimeFee}`}
                        </span>
                      </div>
                    )}
                    
                    {cart.some((item: any) => item.type === 'subscription') && (
                      <div className="flex justify-between items-center p-1.5 rounded-lg" style={{ background: '#FFFFFF' }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#D1FAE5' }}>
                            <i className="fa fa-calendar-check text-xs" style={{ color: '#10B981' }}></i>
                          </div>
                          <span className="text-xs font-semibold" style={{ color: '#0E1214' }}>Sub Delivery</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#10B981', fontFamily: 'Poppins, sans-serif' }}>FREE</span>
                      </div>
                    )}

                    {/* Platform Fee */}
                    <div className="flex justify-between items-center p-1.5 rounded-lg" style={{ background: '#FFFFFF' }}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#EEF2FF' }}>
                          <i className="fa fa-cogs text-xs" style={{ color: '#6366F1' }}></i>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: '#0E1214' }}>Platform Fee</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: platformFee === 0 ? '#10B981' : '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                        {platformFee === 0 ? 'FREE' : `₹${platformFee}`}
                      </span>
                    </div>

                    {/* Packaging Charge */}
                    {packagingCharge > 0 && (
                      <div className="flex justify-between items-center p-1.5 rounded-lg" style={{ background: '#FFFFFF' }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#FEF3C7' }}>
                            <i className="fa fa-box text-xs" style={{ color: '#F59E0B' }}></i>
                          </div>
                          <span className="text-xs font-semibold" style={{ color: '#0E1214' }}>Packaging</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>₹{packagingCharge}</span>
                      </div>
                    )}
                    
                    {/* GST & Taxes */}
                    <div className="flex justify-between items-center p-1.5 rounded-lg" style={{ background: '#FFFFFF' }}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#FEF2F2' }}>
                          <i className="fa fa-receipt text-xs" style={{ color: '#E11D48' }}></i>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: '#0E1214' }}>GST & Tax</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: tax === 0 ? '#10B981' : '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                        {tax === 0 ? 'FREE' : `₹${tax}`}
                      </span>
                    </div>

                    {/* Coupon Discount */}
                    {appliedCoupon && (
                      <div className="flex justify-between items-center p-1.5 rounded-lg" style={{ background: '#D1FAE5', border: '1px dashed #10B981' }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#10B981' }}>
                            <i className="fa fa-tag text-xs" style={{ color: '#FFFFFF' }}></i>
                          </div>
                          <span className="text-xs font-bold" style={{ color: '#10B981' }}>{appliedCoupon.code}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#10B981', fontFamily: 'Poppins, sans-serif' }}>-₹{couponDiscount}</span>
                      </div>
                    )}

                  </div>
                  )}
                </div>
              </div>

              {/* Place Order Button & Footer */}
              <div className="px-3 pb-3">
                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddressId || placingOrder}
                  className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{ 
                    background: placingOrder ? '#9CA3AF' : 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)', 
                    color: '#FFFFFF', 
                    fontFamily: 'Poppins, sans-serif',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!placingOrder && selectedAddressId) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(225, 29, 72, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.3)';
                  }}
                >
                  {placingOrder ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa fa-check-circle" style={{ fontSize: '12px' }}></i>
                      <span>Place Order • ₹{total}</span>
                    </span>
                  )}
                </button>

                {/* Security & Terms */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-center gap-1.5" style={{ fontSize: '10px', color: '#10B981' }}>
                    <i className="fa fa-shield-alt" style={{ fontSize: '9px' }}></i>
                    <span className="font-semibold">100% Secure Payment</span>
                  </div>
                  <p className="text-center" style={{ color: '#9CA3AF', fontSize: '9px' }}>
                    By placing order, you agree to our Terms
                  </p>
                </div>
              </div>
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

      {/* Remove Item Confirmation Modal */}
      {showRemoveModal && itemToRemove !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => {
            setShowRemoveModal(false);
            setItemToRemove(null);
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
                <i className="fa fa-trash text-3xl" style={{ color: '#DC2626' }}></i>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-center mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
              Remove from Cart?
            </h3>

            {/* Message */}
            <p className="text-sm text-center mb-2" style={{ color: '#6B7280' }}>
              Are you sure you want to remove
            </p>
            <p className="text-base font-bold text-center mb-6" style={{ color: '#E11D48', fontFamily: 'Poppins, sans-serif' }}>
              "{cart[itemToRemove].name || cart[itemToRemove].productName}"
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setItemToRemove(null);
                }}
                className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all"
                style={{ 
                  background: '#F3F4F6', 
                  color: '#6B7280',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E5E7EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F3F4F6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveItem}
                className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)', 
                  color: '#FFFFFF',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
