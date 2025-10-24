'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, User } from '@restaurant-app/api-client';
import { ProfileDropdown } from './components/ProfileDropdown';
import { LocationSelector } from './components/LocationSelector';
import { LocationModal } from './components/LocationModal';
import { SearchBar } from './components/SearchBar';
import { HeroCarousel } from './components/HeroCarousel';
import { QuickActions } from './components/QuickActions';
import { CategoryTabs } from './components/CategoryTabs';
import { ProductCard } from './components/ProductCard';
import { getFoodImage } from './utils/images';

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState('Sector 18, Noida');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  
  // New state for API data
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    setLoading(false);

    // Load location from localStorage
    const savedLocation = localStorage.getItem('currentLocation');
    if (savedLocation) {
      setCurrentLocation(savedLocation);
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        setCart(cartData);
        console.log('Loaded cart from localStorage:', cartData);
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Monitor cart changes and save to localStorage
  useEffect(() => {
    console.log('Cart updated:', cart.length, 'items', cart.map(item => ({
      id: item._id || item.id,
      name: item.name,
      quantity: item.quantity
    })));
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        
        if (data.success) {
          // Add "All Items" at the beginning
          const categoryNames = ['All Items', ...data.data.map((cat: any) => cat.name)];
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories
        setCategories(['All Items', 'Dal & Curry', 'Rice Dishes', 'Breads', 'Thalis', 'Snacks']);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const handleLogout = () => {
    apiClient.clearToken();
    router.push('/auth');
  };

  const addToCart = (product: any, quantity: number = 1) => {
    console.log('Adding to cart:', { 
      productId: product._id || product.id, 
      productName: product.name, 
      quantity,
      currentCartSize: cart.length 
    });

    // If quantity is 0, remove from cart
    if (quantity <= 0) {
      removeFromCart(product._id || product.id);
      return;
    }

    const productId = product._id || product.id;
    const existingItem = cart.find(item => {
      const itemId = item._id || item.id;
      return itemId === productId;
    });
    
    if (existingItem) {
      // Update quantity
      console.log('Updating existing item in cart');
      setCart(cart.map(item => {
        const itemId = item._id || item.id;
        return itemId === productId ? { ...item, quantity: quantity } : item;
      }));
    } else {
      // Add new item
      console.log('Adding new item to cart');
      setCart([...cart, { ...product, quantity: quantity }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => {
      const itemId = item._id || item.id;
      return itemId !== productId;
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All Items' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar - Redesigned White Background */}
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E11D48' }}>
                <span className="text-white text-lg font-bold">F</span>
              </div>
              <span className="text-xl font-bold hidden sm:block" style={{ color: '#0E1214' }}>
                Food<span style={{ color: '#E11D48' }}>App</span>
              </span>
            </div>

            {/* Location - Desktop */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all border"
              style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}
              onClick={() => setShowLocationModal(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E11D48';
                e.currentTarget.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
            >
              <svg className="w-4 h-4" style={{ color: '#E11D48' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div className="flex flex-col">
                <span className="text-xs" style={{ color: '#6B7280' }}>Deliver to</span>
                <span className="text-xs font-semibold" style={{ color: '#0E1214' }}>{currentLocation}</span>
              </div>
              <svg className="w-3 h-3 ml-1" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for dishes, restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border-2 transition-all focus:outline-none text-sm"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                />
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3">
              {/* Cart Button */}
              <button 
                onClick={() => router.push('/food/cart')}
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
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg"
                    style={{ backgroundColor: '#E11D48' }}
                  >
                    {cart.length}
                  </span>
                )}
              </button>

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
              {user && user.name ? (
                <ProfileDropdown
                  userName={user.name}
                  onLogout={handleLogout}
                />
              ) : (
                <button className="p-2.5 rounded-lg transition-all border"
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
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border-2 transition-all focus:outline-none text-sm"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Mobile Location */}
          <div className="lg:hidden mt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all border"
              style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}
              onClick={() => setShowLocationModal(true)}
            >
              <svg className="w-3 h-3" style={{ color: '#E11D48' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs" style={{ color: '#6B7280' }}>Deliver to:</span>
              <span className="text-xs font-semibold" style={{ color: '#0E1214' }}>{currentLocation}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Carousel - Full Width, No Space */}
      <HeroCarousel userName={user?.name || undefined} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 md:px-12 py-6">

        {/* Browse Menu Section - Redesigned */}
        <div className="mt-8">
          {/* Section Header - White Background */}
          <div className="text-center mb-6">
            <div className="inline-block mb-2">
              <span className="text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: '#FEF2F2',
                  color: '#E11D48'
                }}
              >
                Our Menu
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#0E1214' }}>
              Browse Our Delicious Menu
            </h2>
            <p className="text-sm max-w-2xl mx-auto" style={{ color: '#6B7280' }}>
              Fresh meals prepared daily with authentic ingredients
            </p>
            <div className="mt-4 flex items-center justify-center gap-1.5">
              <div className="h-0.5 w-16 rounded-full" style={{ backgroundColor: '#E11D48' }}></div>
              <div className="h-1 w-1 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
              <div className="h-0.5 w-6 rounded-full" style={{ backgroundColor: '#F43F5E' }}></div>
            </div>
          </div>
          
          {/* Category Tabs - Redesigned */}
          <div className="mb-8">
          <CategoryTabs
            categories={categories.length > 0 ? categories : ['All Items']}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

          {/* Products Count & Filter Info */}
          {!loadingProducts && filteredProducts.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg border"
                  style={{ 
                    backgroundColor: '#F9FAFB',
                    borderColor: '#E5E7EB'
                  }}
                >
                  <span className="text-xs font-medium" style={{ color: '#6B7280' }}>
                    Showing
                  </span>
                  <span className="text-sm font-bold ml-1.5" style={{ color: '#E11D48' }}>
                    {filteredProducts.length}
                  </span>
                  <span className="text-xs font-medium ml-1" style={{ color: '#6B7280' }}>
                    {filteredProducts.length === 1 ? 'Product' : 'Products'}
                  </span>
                </div>
                {searchQuery && (
                  <div className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 border"
                    style={{ 
                      backgroundColor: '#FEF2F2',
                      borderColor: '#FEE2E2'
                    }}
                  >
                    <svg className="w-3 h-3" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: '#E11D48' }}>
                      "{searchQuery}"
                    </span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:opacity-70"
                      style={{ color: '#E11D48' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {selectedCategory !== 'All Items' && (
                <div className="px-3 py-1.5 rounded-lg border"
                  style={{ 
                    backgroundColor: '#FFFBEB',
                    borderColor: '#FEF3C7'
                  }}
                >
                  <span className="text-xs font-medium" style={{ color: '#92400E' }}>
                    Category: {selectedCategory}
                  </span>
                </div>
            )}
          </div>
          )}

          {/* Products Grid - 4 Columns */}
          <div>
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="bg-white rounded-xl p-4 animate-pulse border"
                    style={{ borderColor: '#E5E7EB' }}
                  >
                    <div className="w-full h-48 rounded-lg mb-3" style={{ backgroundColor: '#F3F4F6' }}></div>
                    <div className="h-5 rounded w-3/4 mb-2" style={{ backgroundColor: '#E5E7EB' }}></div>
                    <div className="h-4 rounded w-full mb-3" style={{ backgroundColor: '#F3F4F6' }}></div>
                    <div className="h-8 rounded w-1/2" style={{ backgroundColor: '#E5E7EB' }}></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border-2"
                style={{
                  backgroundColor: '#FAFAFA',
                  borderColor: '#E5E7EB'
                }}
              >
                <div className="text-5xl mb-3">🍽️</div>
                <p className="text-xl font-bold mb-1" style={{ color: '#0E1214' }}>No products found</p>
                <p className="text-sm mt-1 mb-4" style={{ color: '#6B7280' }}>Try adjusting your search or category</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Items');
                  }}
                  className="px-6 py-2 rounded-xl font-semibold transition-all text-sm"
                  style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
                >
                  Clear All Filters
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onAddToCart={addToCart}
                  cart={cart}
                />
              ))}
            </div>
          )}
        </div>
        </div>
      </main>

      {/* Floating Cart - Crimson Jet Theme */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowCartModal(true)}
            className="text-white px-5 py-3 rounded-lg transition-all duration-300 flex items-center gap-2.5 relative"
            style={{ 
              backgroundColor: '#E11D48',
              boxShadow: '0 20px 50px rgba(0,0,0,0.35)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#BE123C';
              e.currentTarget.style.boxShadow = '0 25px 60px rgba(0,0,0,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E11D48';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.35)';
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div className="text-left">
              <div className="text-xs font-medium">{cart.length} items</div>
              <div className="text-sm font-bold">View Cart</div>
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg border-2"
              style={{
                backgroundColor: '#F59E0B',
                color: '#0E1214',
                borderColor: '#F59E0B'
              }}
            >
              {cart.length}
            </div>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowCartModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                  <svg className="w-4 h-4" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold" style={{ color: '#0E1214' }}>Your Cart</h2>
                  <p className="text-xs" style={{ color: '#6B7280' }}>{cart.length} items</p>
                </div>
              </div>
              <button
                onClick={() => setShowCartModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FEE2E2';
                  e.currentTarget.style.color = '#E11D48';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="overflow-y-auto max-h-[50vh] px-5 py-3">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-3 py-3 border-b last:border-0" style={{ borderColor: '#F3F4F6' }}>
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: '#F3F4F6' }}>
                    <img
                      src={item.image || getFoodImage(item.name)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-0.5" style={{ color: '#0E1214' }}>{item.name}</h3>
                    <p className="text-xs mb-2" style={{ color: '#6B7280' }}>{item.tagline || item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-base" style={{ color: '#E11D48' }}>
                        ₹{item.prices?.oneTime || item.price}
                      </div>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const newQuantity = (item.quantity || 1) - 1;
                            if (newQuantity === 0) {
                              removeFromCart(item._id || item.id);
                            } else {
                              addToCart(item, newQuantity);
                            }
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-all"
                          style={{ backgroundColor: '#FEF2F2', color: '#E11D48' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                        >
                          −
                        </button>
                        <span className="font-bold min-w-[20px] text-center text-sm" style={{ color: '#0E1214' }}>
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => addToCart(item, (item.quantity || 1) + 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-all"
                          style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item._id || item.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ backgroundColor: '#FEF2F2', color: '#E11D48' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEE2E2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEF2F2';
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
              </div>
            ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm" style={{ color: '#6B7280' }}>Total Amount:</span>
                <span className="font-bold text-lg" style={{ color: '#E11D48' }}>
                  ₹{cart.reduce((sum, item) => sum + ((item.prices?.oneTime || item.price) * (item.quantity || 1)), 0)}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowCartModal(false);
                  // Check if user is logged in
                  const token = localStorage.getItem('token');
                  if (token && user) {
                    // User is logged in, proceed to checkout
                    router.push('/food/checkout');
                  } else {
                    // User not logged in, redirect to login
                    localStorage.setItem('redirectAfterLogin', '/food/checkout');
                    router.push('/auth');
                  }
                }}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={currentLocation}
        onLocationSelect={(location) => setCurrentLocation(location)}
      />

      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
