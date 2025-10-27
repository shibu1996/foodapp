'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, User } from '@restaurant-app/api-client';
import { ProfileDropdown } from './components/ProfileDropdown';
import { LocationSelector } from './components/LocationSelector';
import { LocationModal } from '../../components/LocationModal';
import { SearchBar } from './components/SearchBar';
import { HeroCarousel } from './components/HeroCarousel';
import { QuickActions } from './components/QuickActions';
import { CategoryTabs } from './components/CategoryTabs';
import { ProductCard } from './components/ProductCard';
import { getFoodImage } from './utils/images';
import { FloatingCart } from '../../components/FloatingCart';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false); // Track if cart is loaded from localStorage
  
  // New state for API data
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Find nearest saved address based on current coordinates
  const findNearestAddress = (currentLat: number, currentLng: number) => {
    try {
      const savedAddresses = localStorage.getItem('savedAddresses');
      if (!savedAddresses) return null;

      const addresses = JSON.parse(savedAddresses);
      if (!Array.isArray(addresses) || addresses.length === 0) return null;

      // Check if there's a default address
      const defaultAddress = addresses.find((addr: any) => addr.isDefault);
      if (defaultAddress) {
        console.log('🏠 Using default address:', defaultAddress);
        return defaultAddress;
      }

      // Find nearest address
      let nearest = null;
      let minDistance = Infinity;

      addresses.forEach((addr: any) => {
        if (addr.latitude && addr.longitude) {
          const distance = calculateDistance(currentLat, currentLng, addr.latitude, addr.longitude);
          console.log(`📏 Distance to ${addr.label || 'Address'}: ${distance.toFixed(2)} km`);
          if (distance < minDistance) {
            minDistance = distance;
            nearest = addr;
          }
        }
      });

      // Only use nearby address if within 10km
      if (nearest && minDistance < 10) {
        console.log(`✅ Found nearest address (${minDistance.toFixed(2)} km):`, nearest);
        return nearest;
      }

      return null;
    } catch (error) {
      console.error('❌ Error finding nearest address:', error);
      return null;
    }
  };

  // Get current location using browser Geolocation API
  const getCurrentLocation = async () => {
    if ('geolocation' in navigator) {
      console.log('🔄 Requesting location permission...');
      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            console.log('📍 Got Coordinates:', latitude, longitude);
            
            // Check if user has saved addresses nearby
            const nearestAddress = findNearestAddress(latitude, longitude);
            
            if (nearestAddress) {
              // Use nearest saved address
              const locationStr = `${nearestAddress.area}, ${nearestAddress.city}`;
              console.log('🎯 Using nearest saved address:', locationStr);
              setCurrentLocation(locationStr);
              localStorage.setItem('currentLocation', locationStr);
            } else {
              // No saved address nearby, do reverse geocoding
              try {
                const response = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAQ3tRqgbbsKDSwC_oGNF6Ocsn01llBRuc`
                );
                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                  console.log('🗺️ Full Geocode Response:', JSON.stringify(data.results[0], null, 2));
                  const addressComponents = data.results[0].address_components;
                  let area = '';
                  let city = '';
                  
                  // Priority order for area extraction
                  const areaPriority = [
                    'sublocality_level_2',
                    'sublocality_level_1', 
                    'sublocality',
                    'neighborhood',
                    'administrative_area_level_2'
                  ];
                  
                  // Extract city
                  for (const component of addressComponents) {
                    if (component.types.includes('locality')) {
                      city = component.long_name;
                      break;
                    }
                  }
                  
                  // Extract area with priority
                  for (const priority of areaPriority) {
                    for (const component of addressComponents) {
                      if (component.types.includes(priority)) {
                        area = component.long_name;
                        console.log(`✅ Found area using: ${priority} = ${area}`);
                        break;
                      }
                    }
                    if (area) break;
                  }
                  
                  const locationStr = area && city ? `${area}, ${city}` : (city || area || data.results[0].formatted_address);
                  console.log('✅ Final Location:', locationStr);
                  setCurrentLocation(locationStr);
                  localStorage.setItem('currentLocation', locationStr);
                } else {
                  console.error('❌ No results from geocoding');
                }
              } catch (error) {
                console.error('❌ Error reverse geocoding:', error);
              }
            }
          },
          (error) => {
            console.error('❌ Location error:', error.message);
            if (error.code === 1) {
              console.log('User denied location permission');
            } else if (error.code === 2) {
              console.log('Location unavailable');
            } else if (error.code === 3) {
              console.log('Location timeout');
            }
          },
          { 
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      } catch (error) {
        console.error('❌ Geolocation error:', error);
      }
    } else {
      console.log('❌ Geolocation not supported by browser');
    }
  };

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
    } else {
      // Try to get current location using browser geolocation API
      getCurrentLocation();
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        // Filter out invalid items on load
        const validCart = cartData.filter((item: any) => {
          if (item.type === 'subscription') {
            return item.productName || item.name;
          } else {
            return (item.quantity && item.quantity > 0) && (item.name || item.productName);
          }
        });
        setCart(validCart);
        console.log('✅ Loaded cart from localStorage:', validCart.length, 'valid items out of', cartData.length, 'total');
        
        // If we filtered out items, update localStorage
        if (validCart.length !== cartData.length) {
          localStorage.setItem('cart', JSON.stringify(validCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart([]);
      }
    }
    // Mark cart as loaded
    setCartLoaded(true);
  }, []);

  // Listen for cart updates from FloatingCart
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('🔄 Home page - Cart update event received');
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
          console.log('♻️ Reloading cart from localStorage:', validCart.length, 'items');
          setCart(validCart);
        } catch (error) {
          console.error('Error reloading cart:', error);
        }
      } else {
        console.log('♻️ Cart is empty, clearing state');
        setCart([]);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Monitor cart changes and save to localStorage (only after initial load)
  useEffect(() => {
    if (!cartLoaded) {
      // Skip saving on first render before cart is loaded from localStorage
      return;
    }
    
    // Filter out invalid items before saving
    const validCart = cart.filter(item => {
      if (item.type === 'subscription') {
        return item.productName || item.name;
      } else {
        return (item.quantity && item.quantity > 0) && (item.name || item.productName);
      }
    });
    
    console.log('💾 Saving cart to localStorage:', validCart.length, 'valid items', validCart.map(item => ({
      id: item._id || item.id,
      name: item.name || item.productName,
      type: item.type,
      quantity: item.quantity
    })));
    
    // Save valid cart to localStorage
    localStorage.setItem('cart', JSON.stringify(validCart));
    
    // If we filtered out items, update state
    if (validCart.length !== cart.length) {
      setCart(validCart);
    }
  }, [cart, cartLoaded]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/food/categories`);
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
        const response = await fetch(`${API_BASE_URL}/food/products`);
        const data = await response.json();
        
        if (data.success) {
          // ✅ Filter only active products for customers
          const activeProducts = data.data.filter((product: any) => product.isActive !== false);
          setProducts(activeProducts);
          console.log(`✅ Loaded ${activeProducts.length} active products (${data.data.length} total)`);
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
    console.log('🛒 Adding to cart:', { 
      productId: product._id || product.id, 
      productName: product.name, 
      quantity,
      currentCartSize: cart.length 
    });

    // If quantity is 0 or less, remove from cart
    if (quantity <= 0) {
      removeFromCart(product._id || product.id);
      return;
    }

    const productId = product._id || product.id;
    const existingItem = cart.find(item => {
      const itemId = item._id || item.id;
      return itemId === productId && item.type !== 'subscription'; // Don't match subscription items
    });
    
    let newCart;
    if (existingItem) {
      // Update quantity
      console.log('✏️ Updating existing item in cart');
      newCart = cart.map(item => {
        const itemId = item._id || item.id;
        return itemId === productId && item.type !== 'subscription' ? { ...item, quantity: quantity } : item;
      });
    } else {
      // Add new item with type marker
      console.log('➕ Adding new item to cart');
      newCart = [...cart, { ...product, quantity: quantity, type: 'onetime' }];
    }
    
    // Update state and localStorage together
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    // Dispatch event for FloatingCart sync
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (productId: string) => {
    console.log('🗑️ Removing from cart:', productId);
    const newCart = cart.filter(item => {
      const itemId = item._id || item.id;
      return itemId !== productId;
    });
    
    // Update state and localStorage together
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    // Dispatch event for FloatingCart sync
    window.dispatchEvent(new Event('cartUpdated'));
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
                onClick={() => setShowCartModal(true)}
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
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#E11D48' }}></span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden"
                      style={{ borderColor: '#E5E7EB', fontFamily: 'Poppins, sans-serif' }}>
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' }}>
                        <h3 className="text-sm font-bold" style={{ color: '#0E1214' }}>
                          Notifications
                        </h3>
                        <button 
                          className="text-xs font-medium transition-all"
                          style={{ color: '#E11D48' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#BE123C'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#E11D48'}
                        >
                          Clear All
                        </button>
                      </div>

                      {/* Notifications List */}
                      <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
                        {/* Order Delivered */}
                        <div className="px-4 py-3 border-b hover:bg-gray-50 transition-all cursor-pointer" style={{ borderColor: '#F3F4F6' }}>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#DCFCE7' }}>
                              <span className="text-base" style={{ color: '#16A34A' }}>✓</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold mb-0.5 truncate" style={{ color: '#0E1214' }}>
                                Order Delivered Successfully
                              </p>
                              <p className="text-xs leading-tight mb-1" style={{ color: '#6B7280' }}>
                                Your order has been delivered. Enjoy!
                              </p>
                              <p className="text-xs" style={{ color: '#9CA3AF' }}>2h ago</p>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: '#E11D48' }}></div>
                          </div>
                        </div>

                        {/* Special Offer */}
                        <div className="px-4 py-3 border-b hover:bg-gray-50 transition-all cursor-pointer" style={{ borderColor: '#F3F4F6' }}>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF2F2' }}>
                              <span className="text-base" style={{ color: '#E11D48' }}>%</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold mb-0.5 truncate" style={{ color: '#0E1214' }}>
                                30% OFF on Next Order
                              </p>
                              <p className="text-xs leading-tight mb-1" style={{ color: '#6B7280' }}>
                                Use code SAVE30. Valid till tonight!
                              </p>
                              <p className="text-xs" style={{ color: '#9CA3AF' }}>5h ago</p>
                            </div>
                          </div>
                        </div>

                        {/* Subscription Reminder */}
                        <div className="px-4 py-3 border-b hover:bg-gray-50 transition-all cursor-pointer" style={{ borderColor: '#F3F4F6' }}>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
                              <span className="text-base" style={{ color: '#F59E0B' }}>🔔</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold mb-0.5 truncate" style={{ color: '#0E1214' }}>
                                Subscription Renewal in 2 Days
                              </p>
                              <p className="text-xs leading-tight mb-1" style={{ color: '#6B7280' }}>
                                Dal Makhani subscription renews soon
                              </p>
                              <p className="text-xs" style={{ color: '#9CA3AF' }}>1d ago</p>
                            </div>
                          </div>
                        </div>

                        {/* New Item Added */}
                        <div className="px-4 py-3 border-b hover:bg-gray-50 transition-all cursor-pointer" style={{ borderColor: '#F3F4F6' }}>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E0E7FF' }}>
                              <span className="text-base" style={{ color: '#6366F1' }}>🍽️</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold mb-0.5 truncate" style={{ color: '#0E1214' }}>
                                New Items on Menu
                              </p>
                              <p className="text-xs leading-tight mb-1" style={{ color: '#6B7280' }}>
                                Check out healthy salad collection
                              </p>
                              <p className="text-xs" style={{ color: '#9CA3AF' }}>2d ago</p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Success */}
                        <div className="px-4 py-3 hover:bg-gray-50 transition-all cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#DCFCE7' }}>
                              <span className="text-base" style={{ color: '#16A34A' }}>₹</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold mb-0.5 truncate" style={{ color: '#0E1214' }}>
                                Payment of ₹850 Successful
                              </p>
                              <p className="text-xs leading-tight mb-1" style={{ color: '#6B7280' }}>
                                Amount debited from your account
                              </p>
                              <p className="text-xs" style={{ color: '#9CA3AF' }}>3d ago</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-2.5 border-t text-center" style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' }}>
                        <button 
                          className="text-xs font-semibold transition-all"
                          style={{ color: '#E11D48' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#BE123C'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#E11D48'}
                        >
                          View All Notifications
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

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

      {/* Floating Cart Component */}
      <FloatingCart 
        externalShowModal={showCartModal}
        onModalClose={() => setShowCartModal(false)}
        onFloatingButtonClick={() => setShowCartModal(true)}
      />

      {/* Location Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={currentLocation}
        onSelectLocation={(address) => {
          const locationStr = `${address.area}, ${address.city}`;
          setCurrentLocation(locationStr);
          localStorage.setItem('currentLocation', locationStr);
        }}
      />

    </div>
  );
}
