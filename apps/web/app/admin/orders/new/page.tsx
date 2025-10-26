'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  isVeg: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

const API_BASE_URL = 'http://localhost:5000';

export default function NewOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Order form data
  const [userId, setUserId] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState({
    houseNo: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    latitude: 0,
    longitude: 0
  });
  const [deliverySlot, setDeliverySlot] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryType, setDeliveryType] = useState<'normal' | 'premium'>('normal');
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online' | 'wallet'>('online');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'>('pending');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  // Product selector state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Fetch products
      const productsRes = await fetch(`${API_BASE_URL}/api/food/products`, { headers });
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.data || []);
      }

      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/api/auth/users`, { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || selectedQuantity <= 0) return;
    
    const product = products.find(p => p._id === selectedProduct);
    if (!product) return;

    const price = product.discountPrice || product.price;
    const newItem: OrderItem = {
      productId: product._id,
      productName: product.name,
      price,
      quantity: selectedQuantity,
      total: price * selectedQuantity
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProduct('');
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    
    // Calculate delivery fee based on type
    let deliveryFee = 0;
    if (deliveryType === 'normal') {
      deliveryFee = 0; // Free normal delivery
    } else if (deliveryType === 'premium') {
      // Premium delivery: ₹20-70 based on distance
      deliveryFee = Math.min(70, Math.max(20, deliveryDistance * 10));
    }

    const taxAmount = tax || (subtotal * 0.05); // 5% tax if not specified
    const totalAmount = subtotal + taxAmount + deliveryFee - discount;

    return {
      subtotal: Math.round(subtotal),
      deliveryFee: Math.round(deliveryFee),
      tax: Math.round(taxAmount),
      discount: Math.round(discount),
      totalAmount: Math.round(totalAmount)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError('Please select a customer');
      return;
    }

    if (orderItems.length === 0) {
      setError('Please add at least one product');
      return;
    }

    if (!deliveryDate || !deliverySlot) {
      setError('Please select delivery date and time slot');
      return;
    }

    if (!deliveryAddress.houseNo || !deliveryAddress.street || !deliveryAddress.area || 
        !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
      setError('Please fill in all delivery address fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const totals = calculateTotals();
      
      // Format items as API expects (oneTimeItems format)
      const formattedItems = orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      
      const orderData = {
        oneTimeItems: formattedItems,
        subscriptionItems: [],
        deliveryAddress,
        oneTimeDeliveryAddress: deliveryAddress,
        useSameAddress: true,
        deliveryType,
        deliveryDistance,
        deliverySlot,
        deliveryDate: new Date(deliveryDate).toISOString(),
        paymentMethod,
        couponCode: couponCode || undefined,
        specialInstructions: specialInstructions || undefined
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/food/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      // Success - redirect to orders list
      router.push('/admin/orders');
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ 
            border: '3px solid #FEF2F2',
            borderTop: '3px solid #E11D48'
          }}></div>
          <p className="mt-4" style={{ color: '#6B7280', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => router.push('/admin/orders')}
          className="transition-all duration-200"
          style={{ color: '#6B7280', fontSize: '0.875rem' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#E11D48';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          Orders
        </button>
        <span style={{ color: '#D1D5DB', fontSize: '0.875rem' }}>/</span>
        <span style={{ color: '#E11D48', fontSize: '0.875rem' }}>Create New Order</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="p-3 rounded-xl transition-all duration-200"
            style={{ color: '#6B7280', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6';
              e.currentTarget.style.color = '#E11D48';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '1.25rem' }}></i>
          </button>
          <div>
            <h1 className="font-bold" style={{ color: '#0E1214', fontSize: '1.875rem' }}>
              Create New Order
            </h1>
            <p className="mt-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              Add a new order to the system
            </p>
          </div>
        </div>
        
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
          <i className="fa-solid fa-shopping-cart" style={{ color: '#E11D48', fontSize: '2rem' }}></i>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: '#FEF2F2', borderColor: '#E11D48' }}>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation" style={{ color: '#E11D48' }}></i>
            <p style={{ color: '#E11D48', fontSize: '0.875rem' }}>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <div className="p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                  <i className="fa-solid fa-user" style={{ color: '#E11D48', fontSize: '1rem' }}></i>
                </div>
                <h3 className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Customer Details</h3>
              </div>
              
              <div>
                <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                  Select Customer <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                  style={{ 
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#0E1214',
                    fontSize: '0.875rem'
                  }}
                  required
                >
                  <option value="">Choose a customer</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Selection */}
            <div className="p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                  <i className="fa-solid fa-box" style={{ color: '#E11D48', fontSize: '1rem' }}></i>
                </div>
                <h3 className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Order Items</h3>
              </div>

              {/* Add Product */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Select Product
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">Choose a product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ₹{product.discountPrice || product.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Quantity
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                      className="flex-1 px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                      style={{ 
                        borderColor: '#E5E7EB',
                        backgroundColor: '#F9FAFB',
                        color: '#0E1214',
                        fontSize: '0.875rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
                      style={{ 
                        backgroundColor: '#E11D48',
                        color: '#FFFFFF',
                        fontSize: '0.875rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#BE123C';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#E11D48';
                      }}
                    >
                      <i className="fa-solid fa-plus mr-2"></i>
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {orderItems.length > 0 ? (
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border flex items-center justify-between"
                      style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}
                    >
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                          {item.productName}
                        </div>
                        <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                          ₹{item.price} × {item.quantity} = ₹{item.total}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 rounded-lg transition-all duration-200"
                        style={{ color: '#DC2626', backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#FEE2E2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                  <i className="fa-solid fa-box-open text-4xl mb-3" style={{ color: '#D1D5DB' }}></i>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>No items added yet</p>
                </div>
              )}
            </div>

            {/* Delivery Address */}
            <div className="p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                  <i className="fa-solid fa-location-dot" style={{ color: '#E11D48', fontSize: '1rem' }}></i>
                </div>
                <h3 className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Delivery Address</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    House/Flat No. <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.houseNo}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, houseNo: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Street <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Area <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.area}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, area: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    City <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    State <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.state}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Pincode <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    pattern="[0-9]{6}"
                    value={deliveryAddress.pincode}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                    placeholder="123456"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.landmark}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                  <i className="fa-solid fa-truck" style={{ color: '#E11D48', fontSize: '1rem' }}></i>
                </div>
                <h3 className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Delivery Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Delivery Date <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Time Slot <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                    required
                  >
                    <option value="">Select time slot</option>
                    <option value="breakfast">🌅 Breakfast (7:00 AM - 9:00 AM)</option>
                    <option value="lunch">☀️ Lunch (12:00 PM - 2:00 PM)</option>
                    <option value="dinner">🌙 Dinner (7:00 PM - 9:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Delivery Type <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as 'normal' | 'premium')}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="normal">Normal (1 hour, Free)</option>
                    <option value="premium">Premium (30 mins, ₹20-70)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={deliveryDistance}
                    onChange={(e) => setDeliveryDistance(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                  <i className="fa-solid fa-note-sticky" style={{ color: '#E11D48', fontSize: '1rem' }}></i>
                </div>
                <h3 className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Additional Information</h3>
              </div>

              <div>
                <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                  style={{ 
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#0E1214',
                    fontSize: '0.875rem',
                    resize: 'none'
                  }}
                  placeholder="Any special instructions for the delivery..."
                />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary & Status */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="p-6 rounded-xl border sticky top-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <h3 className="font-semibold mb-4" style={{ color: '#0E1214', fontSize: '1rem' }}>Order Summary</h3>
              
              <div className="space-y-3 pb-4 mb-4 border-b" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex justify-between" style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: '#6B7280' }}>Subtotal</span>
                  <span style={{ color: '#0E1214' }}>₹{totals.subtotal}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: '#6B7280' }}>Tax (5%)</span>
                  <span style={{ color: '#0E1214' }}>₹{totals.tax}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: '#6B7280' }}>Delivery Fee</span>
                  <span style={{ color: '#0E1214' }}>₹{totals.deliveryFee}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between" style={{ fontSize: '0.875rem' }}>
                    <span style={{ color: '#6B7280' }}>Discount</span>
                    <span style={{ color: '#E11D48' }}>-₹{totals.discount}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>Total Amount</span>
                <span className="font-bold" style={{ color: '#E11D48', fontSize: '1.25rem' }}>₹{totals.totalAmount}</span>
              </div>

              {/* Discount */}
              <div className="mb-6">
                <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                  Coupon Code (Optional)
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                  style={{ 
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#0E1214',
                    fontSize: '0.875rem'
                  }}
                  placeholder="SAVE10"
                />
                
                <div className="mt-2">
                  <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#0E1214',
                      fontSize: '0.875rem'
                    }}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Order Status */}
              <div className="mb-6">
                <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                  Order Status <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                  style={{ 
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#0E1214',
                    fontSize: '0.875rem'
                  }}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                  Payment Method <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                  style={{ 
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#0E1214',
                    fontSize: '0.875rem'
                  }}
                  required
                >
                  <option value="online">Online Payment</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>

              {/* Payment Status */}
              <div className="mb-6">
                <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                  Payment Status <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
                  style={{ 
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#0E1214',
                    fontSize: '0.875rem'
                  }}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={submitting || orderItems.length === 0}
                  className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: (submitting || orderItems.length === 0) ? '#D1D5DB' : '#E11D48',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    cursor: (submitting || orderItems.length === 0) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting && orderItems.length > 0) {
                      e.currentTarget.style.backgroundColor = '#BE123C';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting && orderItems.length > 0) {
                      e.currentTarget.style.backgroundColor = '#E11D48';
                    }
                  }}
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      Create Order
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/admin/orders')}
                  className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 border"
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
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

