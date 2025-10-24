'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  originalPrice?: number;
  subscriptionPrice: number;
  rating: number;
  isVeg: boolean;
  isBestSeller?: boolean;
  isPopular?: boolean;
  image: string;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  cart?: any[];
}

export function ProductCard({ product, onAddToCart, cart = [] }: ProductCardProps) {
  const router = useRouter();
  const [addingToCart, setAddingToCart] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const productId = product._id || product.id || '';

  // Get quantity from cart (only for one-time items, not subscriptions)
  const cartItem = cart.find(item => {
    const itemId = item._id || item.id;
    return itemId === productId && item.type !== 'subscription';
  });
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product, 1);
  };

  const handleIncreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product, quantity + 1);
  };

  const handleDecreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 0) {
      onAddToCart(product, quantity - 1);
    }
  };

  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSubscribing(true);
    const description = encodeURIComponent(product.description || '');
    const image = encodeURIComponent(product.image || '');
    router.push(`/food/subscribe/duration?product=${productId}&name=${encodeURIComponent(product.name)}&price=${product.subscriptionPrice}&description=${description}&image=${image}`);
  };

  const getTagline = () => {
    if (product.isBestSeller) return "Most loved by customers";
    if (product.isPopular) return "Trending this week";
    if (product.category === 'Thalis') return "Complete balanced meal";
    if (product.category === 'Dal & Curry') return "Healthy homestyle dal";
    if (product.category === 'Rice Dishes') return "Perfectly cooked & fresh";
    return "Delicious & nutritious";
  };

  return (
    <Link 
      href={`/food/products/${productId}`}
      className="group block bg-white rounded-2xl overflow-hidden transition-all duration-300 border relative hover:shadow-xl"
      style={{
        borderColor: '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#E11D48';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Product Image */}
      <div className="relative h-44 overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Discount Badge - Top Right */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-lg shadow-lg"
            style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
          >
            <span className="text-xs font-bold">{product.discount}% OFF</span>
          </div>
        )}
        
        {/* Best Seller - Top Left */}
        {product.isBestSeller && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg shadow-lg flex items-center gap-1"
            style={{ backgroundColor: '#0E1214', color: '#FFFFFF' }}
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold">BEST</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Product Title */}
        <h3 className="text-base font-bold mb-1 line-clamp-1 group-hover:text-crimson transition-colors" style={{ color: '#0E1214' }}>
          {product.name}
        </h3>
        
        {/* Tagline & Rating Combined */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs flex-1 mr-2" style={{ color: '#6B7280' }}>
            {getTagline()}
          </p>
          
          {/* Rating Badge */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert('Reviews modal - Coming soon!');
            }}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ backgroundColor: '#FFFBEB' }}
          >
            <svg className="w-3 h-3 fill-current" style={{ color: '#F59E0B' }} viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold" style={{ color: '#92400E' }}>{product.rating}</span>
          </button>
        </div>

        {/* Pricing Section */}
        <div className="space-y-2 mb-3">
          {/* One-time Price */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs mb-0.5" style={{ color: '#6B7280' }}>One-time</div>
              <div className="flex items-baseline gap-1.5">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs line-through" style={{ color: '#9CA3AF' }}>₹{product.originalPrice}</span>
                )}
                <span className="text-lg font-bold" style={{ color: '#0E1214' }}>₹{product.price}</span>
              </div>
            </div>
        </div>

          {/* Subscription Price */}
          <div className="rounded-lg p-2 border"
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#FEE2E2'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs mb-0.5 font-semibold flex items-center gap-0.5" style={{ color: '#E11D48' }}>
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Subscribe
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold" style={{ color: '#E11D48' }}>₹{product.subscriptionPrice}</span>
                  <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>/day</span>
                </div>
              </div>
              <div className="px-1.5 py-0.5 rounded-md text-xs font-bold" style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}>
                -15%
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Add to Cart Button / Quantity Selector */}
          {quantity > 0 ? (
            <div className="flex-1 flex items-center justify-between py-1.5 px-2.5 rounded-xl border-2 font-semibold text-xs"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E11D48'
              }}
            >
              <button
                onClick={handleDecreaseQuantity}
                className="w-6 h-6 rounded-lg flex items-center justify-center font-bold transition-all text-sm"
                style={{
                  backgroundColor: '#FEF2F2',
                  color: '#E11D48'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
              >
                −
              </button>
              <span className="font-bold text-sm" style={{ color: '#E11D48' }}>{quantity}</span>
              <button
                onClick={handleIncreaseQuantity}
                className="w-6 h-6 rounded-lg flex items-center justify-center font-bold transition-all text-sm"
                style={{
                  backgroundColor: '#E11D48',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
              >
                +
              </button>
            </div>
          ) : (
          <button
            onClick={handleAddToCart}
              className="flex-1 py-2 rounded-xl font-semibold text-xs transition-all duration-200 border-2 flex items-center justify-center gap-1"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0E1214',
                borderColor: '#E5E7EB'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E11D48';
                e.currentTarget.style.color = '#E11D48';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.color = '#0E1214';
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add
          </button>
          )}

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="flex-1 text-white py-2 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1"
            style={{ 
              backgroundColor: subscribing ? '#9CA3AF' : '#E11D48',
              cursor: subscribing ? 'not-allowed' : 'pointer',
              opacity: subscribing ? 0.7 : 1
            }}
            onMouseEnter={(e) => !subscribing && (e.currentTarget.style.backgroundColor = '#BE123C')}
            onMouseLeave={(e) => !subscribing && (e.currentTarget.style.backgroundColor = '#E11D48')}
          >
            {subscribing ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Subscribe
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}


