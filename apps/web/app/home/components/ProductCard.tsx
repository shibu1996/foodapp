'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
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
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = () => {
    setAddingToCart(true);
    onAddToCart(product);
    setTimeout(() => setAddingToCart(false), 1000);
  };

  const handleSubscribe = () => {
    router.push(`/subscribe/duration?product=${product.id}&name=${product.name}&price=${product.subscriptionPrice}`);
  };

  return (
    <div className="group bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isVeg && (
            <div className="w-6 h-6 border-2 border-green-600 rounded flex items-center justify-center bg-white">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
            </div>
          )}
          {product.isBestSeller && (
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
              Best Seller
            </span>
          )}
          {product.isPopular && (
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
              Popular
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition"
        >
          <svg
            className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
            {product.discount}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name & Rating */}
        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600">{product.rating}</span>
        </div>

        {/* Prices */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-sm">Rs. {product.originalPrice}</span>
            )}
            <span className="text-2xl font-bold text-gray-800">Rs. {product.price}</span>
          </div>
          <p className="text-sm text-teal-600 font-medium">Subscribe: Rs. {product.subscriptionPrice}/day</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              addingToCart
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {addingToCart ? '✓ Added' : '+ Add'}
          </button>
          <button
            onClick={handleSubscribe}
            className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}

