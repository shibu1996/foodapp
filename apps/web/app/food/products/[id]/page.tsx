'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'details' | 'reviews'>('details');
  const [addingToCart, setAddingToCart] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const data = await response.json();
        
        if (data.success) {
          setProduct(data.data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    setAddingToCart(true);
    // TODO: Add to cart logic
    setTimeout(() => {
      setAddingToCart(false);
      alert(`Added ${quantity} x ${product?.name} to cart!`);
    }, 1000);
  };

  const handleSubscribe = () => {
    setSubscribing(true);
    const description = encodeURIComponent(product?.description || '');
    const image = encodeURIComponent(product?.image || '');
    router.push(`/food/subscribe/duration?product=${productId}&name=${encodeURIComponent(product?.name || '')}&price=${product?.subscriptionPrice}&description=${description}&image=${image}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4" style={{ borderColor: '#E11D48' }}></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-7xl mb-4">😕</div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0E1214' }}>Product Not Found</h1>
          <p className="mb-6" style={{ color: '#6B7280' }}>The product you're looking for doesn't exist</p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 rounded-xl font-semibold transition-all"
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
    <div className="min-h-screen bg-white">
      {/* Header/Navbar - Same as Home Page */}
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/food/home" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E11D48' }}>
                <span className="text-white text-xl font-bold">F</span>
              </div>
              <span className="text-2xl font-bold hidden sm:block" style={{ color: '#0E1214' }}>
                Food<span style={{ color: '#E11D48' }}>App</span>
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for dishes, restaurants..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                />
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3">
              {/* Cart Button */}
              <Link 
                href="/food/cart"
                className="relative p-2.5 rounded-lg transition-all border"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E11D48';
                  e.currentTarget.style.backgroundColor = '#FEF2F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>

              {/* Notification Bell */}
              <button className="relative p-2.5 rounded-lg transition-all border"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E11D48';
                  e.currentTarget.style.backgroundColor = '#FEF2F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#E11D48' }}></span>
              </button>

              {/* Profile */}
              <Link 
                href="/food/home"
                className="p-2.5 rounded-lg transition-all border hidden md:flex"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E11D48';
                  e.currentTarget.style.backgroundColor = '#FEF2F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b" style={{ borderColor: '#F3F4F6' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="transition-colors" style={{ color: '#6B7280' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#E11D48'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              Home
            </Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <Link href="/food/home" className="transition-colors" style={{ color: '#6B7280' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#E11D48'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              Menu
            </Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span className="font-medium" style={{ color: '#0E1214' }}>{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Product Image */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg sticky top-24 h-fit border"
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
                <div className="absolute top-4 left-4 px-4 py-2 rounded-lg shadow-lg flex items-center gap-1"
                  style={{ backgroundColor: '#0E1214', color: '#FFFFFF' }}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-bold">BEST SELLER</span>
                </div>
              )}

              {/* Discount Badge - Top Right */}
              {product.discount && product.discount > 0 && (
                <div className="absolute top-4 right-4 px-4 py-2 rounded-lg shadow-lg"
                  style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                >
                  <span className="text-sm font-bold">{product.discount}% OFF</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border"
              style={{ borderColor: '#E5E7EB' }}
            >
              {/* Product Title */}
              <h1 className="text-4xl font-bold mb-3" style={{ color: '#0E1214' }}>
                {product.name}
              </h1>

              {/* Category */}
              <div className="text-sm mb-4" style={{ color: '#6B7280' }}>
                Category: <span className="font-semibold" style={{ color: '#E11D48' }}>{product.category}</span>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-0.5 px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: '#FFFBEB' }}
                >
                  <svg className="w-5 h-5 fill-current" style={{ color: '#F59E0B' }} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-bold ml-1" style={{ color: '#92400E' }}>{product.rating}</span>
                </div>
                <button 
                  onClick={() => setSelectedTab('reviews')}
                  className="text-sm underline transition-colors"
                  style={{ color: '#6B7280' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#E11D48'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                >
                  (124 reviews)
                </button>
              </div>

              {/* Description */}
              <p className="leading-relaxed mb-6" style={{ color: '#374151' }}>
                {product.description || 'Delicious and fresh meal prepared with authentic ingredients and traditional recipes. Perfect for a satisfying meal any time of the day.'}
              </p>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border"
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
              <div className="space-y-4 mb-6">
                {/* One-time Price */}
                <div>
                  <div className="text-sm mb-2 font-medium" style={{ color: '#6B7280' }}>One-time Order</div>
                  <div className="flex items-baseline gap-3">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-lg line-through" style={{ color: '#9CA3AF' }}>₹{product.originalPrice}</span>
                    )}
                    <span className="text-4xl font-bold" style={{ color: '#0E1214' }}>₹{product.price}</span>
                    {product.discount && product.discount > 0 && (
                      <span className="px-3 py-1 rounded-lg text-sm font-bold"
                        style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                      >
                        Save {product.discount}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Subscription Price */}
                <div className="rounded-xl p-5 border"
                  style={{
                    backgroundColor: '#FEF2F2',
                    borderColor: '#FEE2E2'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm mb-1 font-semibold flex items-center gap-1.5"
                        style={{ color: '#E11D48' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Subscribe & Save More
                      </div>
                      <div className="text-3xl font-bold" style={{ color: '#E11D48' }}>
                        ₹{product.subscriptionPrice}
                        <span className="text-sm font-normal" style={{ color: '#9CA3AF' }}>/day</span>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-lg text-sm font-bold"
                      style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                    >
                      -15%
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3" style={{ color: '#0E1214' }}>Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all"
                    style={{
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
                    −
                  </button>
                  <span className="text-2xl font-bold w-16 text-center" style={{ color: '#0E1214' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all"
                    style={{
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
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full py-4 rounded-xl font-semibold text-lg transition-all border-2 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: addingToCart ? '#10B981' : '#FFFFFF',
                    color: addingToCart ? '#FFFFFF' : '#0E1214',
                    borderColor: addingToCart ? '#10B981' : '#E5E7EB'
                  }}
                  onMouseEnter={(e) => {
                    if (!addingToCart) {
                      e.currentTarget.style.borderColor = '#E11D48';
                      e.currentTarget.style.color = '#E11D48';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!addingToCart) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#0E1214';
                    }
                  }}
                >
                  {addingToCart ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add {quantity} to Cart - ₹{product.price * quantity}
                    </>
                  )}
                </button>

                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: subscribing ? '#9CA3AF' : '#E11D48', 
                    color: '#FFFFFF',
                    cursor: subscribing ? 'not-allowed' : 'pointer',
                    opacity: subscribing ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => !subscribing && (e.currentTarget.style.backgroundColor = '#BE123C')}
                  onMouseLeave={(e) => !subscribing && (e.currentTarget.style.backgroundColor = '#E11D48')}
                >
                  {subscribing ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Subscribe Now
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.back()}
                  className="w-full py-3 rounded-xl font-semibold border-2 transition-all"
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
                  ← Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden border"
          style={{ borderColor: '#E5E7EB' }}
        >
          {/* Tab Headers */}
          <div className="flex border-b" style={{ borderColor: '#F3F4F6' }}>
            <button
              onClick={() => setSelectedTab('details')}
              className="flex-1 py-5 px-6 font-bold transition-all relative"
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
              className="flex-1 py-5 px-6 font-bold transition-all relative"
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
          <div className="p-8">
            {selectedTab === 'details' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#0E1214' }}>About This Product</h3>
                  <p className="leading-relaxed text-lg" style={{ color: '#374151' }}>
                    {product.description || 'This delicious meal is prepared fresh daily with the finest ingredients. Our chefs follow traditional recipes to bring you authentic flavors that remind you of home-cooked meals.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="rounded-xl p-5 border"
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderColor: '#E5E7EB'
                    }}
                  >
                    <div className="text-sm mb-2 font-medium" style={{ color: '#6B7280' }}>Category</div>
                    <div className="font-bold text-lg" style={{ color: '#0E1214' }}>{product.category}</div>
                  </div>
                  <div className="rounded-xl p-5 border"
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderColor: '#E5E7EB'
                    }}
                  >
                    <div className="text-sm mb-2 font-medium" style={{ color: '#6B7280' }}>Type</div>
                    <div className="font-bold text-lg flex items-center gap-2" style={{ color: '#0E1214' }}>
                      {product.isVeg ? (
                        <>
                          <div className="w-5 h-5 border-2 border-green-600 rounded flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-600"></div>
                          </div>
                          Vegetarian
                        </>
                      ) : 'Non-Vegetarian'}
                    </div>
                  </div>
                  <div className="rounded-xl p-5 border"
                    style={{
                      backgroundColor: '#FFFBEB',
                      borderColor: '#FEF3C7'
                    }}
                  >
                    <div className="text-sm mb-2 font-medium" style={{ color: '#92400E' }}>Rating</div>
                    <div className="font-bold text-lg flex items-center gap-2" style={{ color: '#92400E' }}>
                      <svg className="w-5 h-5 fill-current" style={{ color: '#F59E0B' }} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {product.rating} / 5.0
                    </div>
                  </div>
                  <div className="rounded-xl p-5 border"
                    style={{
                      backgroundColor: '#F0FDF4',
                      borderColor: '#BBF7D0'
                    }}
                  >
                    <div className="text-sm mb-2 font-medium" style={{ color: '#166534' }}>Availability</div>
                    <div className="font-bold text-lg flex items-center gap-2" style={{ color: '#16A34A' }}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      In Stock
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold mb-6" style={{ color: '#0E1214' }}>Customer Reviews</h3>
                
                {/* Sample Reviews */}
                {[
                  { name: 'Rahul Sharma', rating: 5, comment: 'Absolutely delicious! Just like homemade food. Will order again.', date: '2 days ago' },
                  { name: 'Priya Singh', rating: 4, comment: 'Very good taste and quality. Delivery was on time.', date: '1 week ago' },
                  { name: 'Amit Kumar', rating: 5, comment: 'Best food delivery service! Fresh and tasty every time.', date: '2 weeks ago' },
                ].map((review, index) => (
                  <div key={index} className="pb-6 last:pb-0 border-b last:border-0"
                    style={{ borderColor: '#F3F4F6' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-lg"
                          style={{ backgroundColor: '#E11D48' }}
                        >
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold" style={{ color: '#0E1214' }}>{review.name}</div>
                          <div className="text-xs" style={{ color: '#9CA3AF' }}>{review.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg"
                        style={{ backgroundColor: '#FFFBEB' }}
                      >
                        <svg className="w-4 h-4 fill-current" style={{ color: '#F59E0B' }} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-bold ml-0.5" style={{ color: '#92400E' }}>{review.rating}</span>
                      </div>
                    </div>
                    <p className="leading-relaxed ml-15" style={{ color: '#374151' }}>{review.comment}</p>
                  </div>
                ))}

                <button 
                  className="w-full py-3 rounded-xl font-semibold border-2 transition-all"
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
    </div>
  );
}

