'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FoodHeader } from '@/app/components/FoodHeader';
import { FloatingCart } from '@/app/components/FloatingCart';
import { getFoodImage } from '../../home/utils/images';

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  subscriptionPrice: number;
  rating: number;
  isVeg: boolean;
  isBestSeller?: boolean;
  isPopular?: boolean;
  image: string;
  discount?: number;
  tags?: string[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'details' | 'reviews'>('details');
  const [subscribing, setSubscribing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);

  // Load user and cart on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedCart = localStorage.getItem('cart');
      if (updatedCart) {
        setCart(JSON.parse(updatedCart));
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/food/products/${productId}`);
        const data = await response.json();
        
        if (data.success) {
          setProduct(data.data);
        } else {
          // Set sample product
          setSampleProduct();
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Set sample product on error
        setSampleProduct();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const setSampleProduct = () => {
    const sampleProduct: Product = {
      _id: productId || 'sample1',
      name: 'Dal Makhani',
      description: 'Creamy and rich dal makhani cooked with black lentils, butter, and aromatic spices. A perfect comfort food that melts in your mouth.',
      category: 'Main Course',
      price: 120,
      originalPrice: 150,
      subscriptionPrice: 95,
      rating: 4.5,
      isVeg: true,
      isBestSeller: true,
      isPopular: true,
      image: getFoodImage('Dal Makhani'),
      discount: 20,
      tags: ['Popular', 'Comfort Food', 'Rich & Creamy']
    };
    setProduct(sampleProduct);
  };

  // Get current quantity from cart
  const getQuantity = () => {
    if (!product) return 0;
    const cartItem = cart.find(item => {
      const itemId = item._id || item.id || item.productId;
      return itemId === product._id && item.type !== 'subscription';
    });
    return cartItem?.quantity || 0;
  };

  const quantity = getQuantity();

  const handleAddToCart = (newQuantity: number) => {
    if (!product) return;
    
    // Get existing cart
    const savedCart = localStorage.getItem('cart');
    let cartData = savedCart ? JSON.parse(savedCart) : [];
    
    // Check if product already exists
    const existingIndex = cartData.findIndex((item: any) => {
      const itemId = item._id || item.id || item.productId;
      return itemId === product._id && item.type !== 'subscription';
    });
    
    if (newQuantity === 0) {
      // Remove from cart
      if (existingIndex !== -1) {
        cartData.splice(existingIndex, 1);
      }
    } else if (existingIndex !== -1) {
      // Update quantity
      cartData[existingIndex].quantity = newQuantity;
    } else {
      // Add new item
      cartData.push({
        id: product._id,
        _id: product._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: newQuantity,
        image: product.image,
        type: 'one-time'
      });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cartData));
    setCart(cartData);
    
    // Dispatch cart updated event
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleIncreaseQuantity = () => {
    handleAddToCart(quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 0) {
      handleAddToCart(quantity - 1);
    }
  };

  const handleSubscribe = () => {
    setSubscribing(true);
    const description = encodeURIComponent(product?.description || '');
    const image = encodeURIComponent(product?.image || '');
    router.push(`/food/subscribe/duration?product=${productId}&name=${encodeURIComponent(product?.name || '')}&price=${product?.subscriptionPrice}&description=${description}&image=${image}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
          <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
            <svg className="w-10 h-10" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-lg font-bold mb-2" style={{ color: '#0E1214' }}>Product Not Found</h1>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>The product you're looking for doesn't exist</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all"
            style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <FoodHeader 
        user={user}
        showLocation={false}
        showSearch={true}
        showCart={true}
        cartCount={cart.length}
        onCartClick={() => setShowCartModal(true)}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b" style={{ borderColor: '#F3F4F6' }}>
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-2.5">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/" className="transition-colors" style={{ color: '#6B7280' }}
              onMouseEnter={(e: any) => e.currentTarget.style.color = '#E11D48'}
              onMouseLeave={(e: any) => e.currentTarget.style.color = '#6B7280'}
            >
              Home
            </Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <Link href="/food/home" className="transition-colors" style={{ color: '#6B7280' }}
              onMouseEnter={(e: any) => e.currentTarget.style.color = '#E11D48'}
              onMouseLeave={(e: any) => e.currentTarget.style.color = '#6B7280'}
            >
              Menu
            </Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span className="font-semibold" style={{ color: '#0E1214' }}>{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Product Image */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg sticky top-24 h-fit border"
            style={{ borderColor: '#E5E7EB' }}
          >
            <div className="relative aspect-square" style={{ backgroundColor: '#F3F4F6' }}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Best Seller Badge - Top Left */}
              {product.isBestSeller && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1"
                  style={{ backgroundColor: '#0E1214', color: '#FFFFFF' }}
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-bold">BEST SELLER</span>
                </div>
              )}

              {/* Discount Badge - Top Right */}
              {product.discount && product.discount > 0 && (
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg shadow-lg"
                  style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                >
                  <span className="text-xs font-bold">{product.discount}% OFF</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 border"
              style={{ borderColor: '#E5E7EB' }}
            >
              {/* Product Title */}
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#0E1214' }}>
                {product.name}
              </h1>

              {/* Category */}
              <div className="text-xs mb-3" style={{ color: '#6B7280' }}>
                Category: <span className="font-semibold" style={{ color: '#E11D48' }}>{product.category}</span>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg"
                  style={{ backgroundColor: '#FFFBEB' }}
                >
                  <svg className="w-3 h-3 fill-current" style={{ color: '#F59E0B' }} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-bold ml-0.5" style={{ color: '#92400E' }}>{product.rating}</span>
                </div>
                <button 
                  onClick={() => setSelectedTab('reviews')}
                  className="text-xs underline transition-colors"
                  style={{ color: '#6B7280' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#E11D48'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                >
                  (124 reviews)
                </button>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#374151' }}>
                {product.description || 'Delicious and fresh meal prepared with authentic ingredients and traditional recipes. Perfect for a satisfying meal any time of the day.'}
              </p>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-lg text-xs font-medium border"
                      style={{
                        backgroundColor: '#F9FAFB',
                        color: '#374151',
                        borderColor: '#E5E7EB'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Pricing */}
              <div className="space-y-3 mb-5">
                {/* One-time Price */}
                <div>
                  <div className="text-xs mb-1.5 font-medium" style={{ color: '#6B7280' }}>One-time Order</div>
                  <div className="flex items-baseline gap-2">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm line-through" style={{ color: '#9CA3AF' }}>₹{product.originalPrice}</span>
                    )}
                    <span className="text-2xl font-bold" style={{ color: '#0E1214' }}>₹{product.price}</span>
                    {product.discount && product.discount > 0 && (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                        style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                      >
                        Save {product.discount}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Subscription Price */}
                <div className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: '#FEF2F2',
                    borderColor: '#FEE2E2'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs mb-0.5 font-semibold flex items-center gap-1"
                        style={{ color: '#E11D48' }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Subscribe & Save More
                      </div>
                      <div className="text-xl font-bold" style={{ color: '#E11D48' }}>
                        ₹{product.subscriptionPrice}
                        <span className="text-xs font-normal" style={{ color: '#9CA3AF' }}>/day</span>
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded-lg text-xs font-bold"
                      style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                    >
                      -15%
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {/* Add to Cart Button / Quantity Selector */}
                {quantity > 0 ? (
                  <div className="w-full flex items-center justify-between py-2.5 px-4 rounded-lg border-2 font-semibold text-sm"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E11D48'
                    }}
                  >
                    <button
                      onClick={handleDecreaseQuantity}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all text-base"
                      style={{
                        backgroundColor: '#FEF2F2',
                        color: '#E11D48'
                      }}
                      onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                      onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                    >
                      −
                    </button>
                    <span className="font-bold text-base" style={{ color: '#E11D48' }}>{quantity} in cart</span>
                    <button
                      onClick={handleIncreaseQuantity}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all text-base"
                      style={{
                        backgroundColor: '#E11D48',
                        color: '#FFFFFF'
                      }}
                      onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#BE123C'}
                      onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#E11D48'}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(1)}
                    className="w-full py-3 rounded-lg font-semibold text-sm transition-all border-2 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#0E1214',
                      borderColor: '#E5E7EB'
                    }}
                    onMouseEnter={(e: any) => {
                      e.currentTarget.style.borderColor = '#E11D48';
                      e.currentTarget.style.color = '#E11D48';
                    }}
                    onMouseLeave={(e: any) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#0E1214';
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart - ₹{product.price}
                  </button>
                )}

                {/* Subscribe Button */}
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: subscribing ? '#9CA3AF' : '#E11D48', 
                    color: '#FFFFFF',
                    cursor: subscribing ? 'not-allowed' : 'pointer',
                    opacity: subscribing ? 0.7 : 1
                  }}
                  onMouseEnter={(e: any) => !subscribing && (e.currentTarget.style.backgroundColor = '#BE123C')}
                  onMouseLeave={(e: any) => !subscribing && (e.currentTarget.style.backgroundColor = '#E11D48')}
                >
                  {subscribing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Subscribe Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden border"
          style={{ borderColor: '#E5E7EB' }}
        >
          {/* Tab Headers */}
          <div className="flex border-b" style={{ borderColor: '#F3F4F6' }}>
            <button
              onClick={() => setSelectedTab('details')}
              className="flex-1 py-3 px-4 font-semibold text-sm transition-all relative"
              style={{
                color: selectedTab === 'details' ? '#E11D48' : '#6B7280'
              }}
              onMouseEnter={(e) => {
                if (selectedTab !== 'details') {
                  e.currentTarget.style.color = '#0E1214';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTab !== 'details') {
                  e.currentTarget.style.color = '#6B7280';
                }
              }}
            >
              Product Details
              {selectedTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t"
                  style={{ backgroundColor: '#E11D48' }}
                />
              )}
            </button>
            <button
              onClick={() => setSelectedTab('reviews')}
              className="flex-1 py-3 px-4 font-semibold text-sm transition-all relative"
              style={{
                color: selectedTab === 'reviews' ? '#E11D48' : '#6B7280'
              }}
              onMouseEnter={(e) => {
                if (selectedTab !== 'reviews') {
                  e.currentTarget.style.color = '#0E1214';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTab !== 'reviews') {
                  e.currentTarget.style.color = '#6B7280';
                }
              }}
            >
              Reviews (124)
              {selectedTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t"
                  style={{ backgroundColor: '#E11D48' }}
                />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5">
            {selectedTab === 'details' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#0E1214' }}>About This Product</h3>
                  <p className="leading-relaxed text-xs" style={{ color: '#374151' }}>
                    {product.description || 'This delicious meal is prepared fresh daily with the finest ingredients. Our chefs follow traditional recipes to bring you authentic flavors that remind you of home-cooked meals.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="rounded-lg p-3 border"
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderColor: '#E5E7EB'
                    }}
                  >
                    <div className="text-xs mb-1 font-medium" style={{ color: '#6B7280' }}>Category</div>
                    <div className="font-bold text-sm" style={{ color: '#0E1214' }}>{product.category}</div>
                  </div>
                  <div className="rounded-lg p-3 border"
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderColor: '#E5E7EB'
                    }}
                  >
                    <div className="text-xs mb-1 font-medium" style={{ color: '#6B7280' }}>Type</div>
                    <div className="font-bold text-sm flex items-center gap-1.5" style={{ color: '#0E1214' }}>
                      {product.isVeg ? (
                        <>
                          <div className="w-4 h-4 border-2 border-green-600 rounded flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                          </div>
                          Vegetarian
                        </>
                      ) : 'Non-Vegetarian'}
                    </div>
                  </div>
                  <div className="rounded-lg p-3 border"
                    style={{
                      backgroundColor: '#FFFBEB',
                      borderColor: '#FEF3C7'
                    }}
                  >
                    <div className="text-xs mb-1 font-medium" style={{ color: '#92400E' }}>Rating</div>
                    <div className="font-bold text-sm flex items-center gap-1.5" style={{ color: '#92400E' }}>
                      <svg className="w-4 h-4 fill-current" style={{ color: '#F59E0B' }} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {product.rating} / 5.0
                    </div>
                  </div>
                  <div className="rounded-lg p-3 border"
                    style={{
                      backgroundColor: '#F0FDF4',
                      borderColor: '#BBF7D0'
                    }}
                  >
                    <div className="text-xs mb-1 font-medium" style={{ color: '#166534' }}>Availability</div>
                    <div className="font-bold text-sm flex items-center gap-1.5" style={{ color: '#16A34A' }}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      In Stock
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-base font-bold mb-3" style={{ color: '#0E1214' }}>Customer Reviews</h3>
                
                {/* Sample Reviews */}
                {[
                  { name: 'Rahul Sharma', rating: 5, comment: 'Absolutely delicious! Just like homemade food. Will order again.', date: '2 days ago' },
                  { name: 'Priya Singh', rating: 4, comment: 'Very good taste and quality. Delivery was on time.', date: '1 week ago' },
                  { name: 'Amit Kumar', rating: 5, comment: 'Best food delivery service! Fresh and tasty every time.', date: '2 weeks ago' },
                ].map((review, index) => (
                  <div key={index} className="pb-4 last:pb-0 border-b last:border-0"
                    style={{ borderColor: '#F3F4F6' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm"
                          style={{ backgroundColor: '#E11D48' }}
                        >
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm" style={{ color: '#0E1214' }}>{review.name}</div>
                          <div className="text-xs" style={{ color: '#9CA3AF' }}>{review.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg"
                        style={{ backgroundColor: '#FFFBEB' }}
                      >
                        <svg className="w-3 h-3 fill-current" style={{ color: '#F59E0B' }} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs font-bold ml-0.5" style={{ color: '#92400E' }}>{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed ml-11" style={{ color: '#374151' }}>{review.comment}</p>
                  </div>
                ))}

                <button 
                  className="w-full py-2.5 rounded-lg font-semibold text-sm border-2 transition-all"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    color: '#374151'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E11D48';
                    e.currentTarget.style.color = '#E11D48';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.color = '#374151';
                  }}
                >
                  Load More Reviews
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart */}
      <FloatingCart 
        externalShowModal={showCartModal}
        onModalClose={() => setShowCartModal(false)}
        onFloatingButtonClick={() => setShowCartModal(true)}
      />
    </div>
  );
}

