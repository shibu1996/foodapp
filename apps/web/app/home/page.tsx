'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, User } from '../../../../packages/api-client/src';
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
  
  // New state for API data
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.getCurrentUser();
        if (response && response.user) {
          setUser(response.user);
        }
      } catch (error) {
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Load location from localStorage
    const savedLocation = localStorage.getItem('currentLocation');
    if (savedLocation) {
      setCurrentLocation(savedLocation);
    }
  }, [router]);

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

  const addToCart = (product: any) => {
    setCart([...cart, product]);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">FoodApp</span>
            </div>

            {/* Location & Search - Desktop */}
            <div className="hidden md:flex items-center gap-4 flex-1 max-w-3xl">
              <LocationSelector
                currentLocation={currentLocation}
                onLocationChange={() => setShowLocationModal(true)}
              />
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Profile & Cart */}
            <div className="flex items-center gap-4">
              {/* Cart */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Profile */}
              {user && user.name && (
                <ProfileDropdown
                  userName={user.name}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-3">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Carousel */}
        <HeroCarousel userName={user?.name || undefined} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Category Tabs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Browse Menu</h2>
          <CategoryTabs
            categories={categories.length > 0 ? categories : ['All Items']}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {searchQuery ? `Search Results (${filteredProducts.length})` : selectedCategory}
            </h2>
            {filteredProducts.length > 0 && (
              <p className="text-gray-600">{filteredProducts.length} items</p>
            )}
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-orange-50 to-teal-50 rounded-2xl p-8 mt-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '🍽️', title: 'Choose Your Meal', desc: 'Browse our delicious menu' },
              { icon: '📅', title: 'Select Plan', desc: 'Pick duration & schedule' },
              { icon: '⏰', title: 'Set Delivery Time', desc: 'Choose convenient slot' },
              { icon: '😋', title: 'Enjoy Fresh Food', desc: 'Daily at your doorstep' },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white flex items-center justify-center text-4xl shadow-lg">
                  {step.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

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
