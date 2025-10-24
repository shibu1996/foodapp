'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFoodImage } from '../food/home/utils/images';

export function FloatingCart() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          // Filter out invalid items (quantity 0 or missing essential fields)
          const validCart = cartData.filter((item: any) => {
            if (item.type === 'subscription') {
              return item.productName || item.name; // Must have a name
            } else {
              return (item.quantity && item.quantity > 0) && (item.name || item.productName); // Must have quantity > 0 and name
            }
          });
          console.log('🔄 FloatingCart loaded:', validCart.length, 'valid items out of', cartData.length, 'total');
          setCart(validCart);
          
          // If we filtered out items, update localStorage
          if (validCart.length !== cartData.length) {
            localStorage.setItem('cart', JSON.stringify(validCart));
          }
        } catch (error) {
          console.error('Error loading cart:', error);
          setCart([]);
        }
      }
    };

    // Load initially
    loadCart();

    // Listen for storage events (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        loadCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom cart update events (same-tab sync)
    const handleCartUpdate = () => {
      loadCart();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => {
      const itemId = item._id || item.id;
      return itemId !== productId;
    });
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    // Dispatch custom event for same-tab sync
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (product: any, newQuantity: number) => {
    console.log('🔢 Updating quantity:', { productId: product._id || product.id, newQuantity });
    
    if (newQuantity <= 0) {
      removeFromCart(product._id || product.id);
      return;
    }

    const productId = product._id || product.id;
    const newCart = cart.map(item => {
      const itemId = item._id || item.id;
      return itemId === productId && item.type !== 'subscription' 
        ? { ...item, quantity: newQuantity } 
        : item;
    }).filter(item => {
      // Filter out items with invalid quantity
      if (item.type === 'subscription') return true;
      return item.quantity && item.quantity > 0;
    });
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    // Dispatch custom event for same-tab sync
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      if (item.type === 'subscription') {
        return sum + (item.totalAmount || 0);
      } else {
        return sum + ((item.prices?.oneTime || item.price) * (item.quantity || 1));
      }
    }, 0);
  };

  if (cart.length === 0) {
    return null; // Don't show if cart is empty
  }

  return (
    <>
      {/* Floating Cart Button */}
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
                      src={item.image || item.productImage || getFoodImage(item.name || item.productName)}
                      alt={item.name || item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-bold text-sm" style={{ color: '#0E1214' }}>{item.name || item.productName}</h3>
                      {item.type === 'subscription' && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: '#FEF2F2', color: '#E11D48' }}>
                          📅
                        </span>
                      )}
                    </div>
                    
                    {item.type === 'subscription' ? (
                      <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
                        {item.duration} days plan • Starts: {item.startDate ? new Date(item.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'}
                      </p>
                    ) : (
                      <p className="text-xs mb-2" style={{ color: '#6B7280' }}>{item.tagline || item.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-base" style={{ color: '#E11D48' }}>
                          ₹{item.type === 'subscription' ? item.totalAmount : (item.prices?.oneTime || item.price)}
                        </div>
                        {item.type === 'subscription' && item.duration && (
                          <div className="text-xs" style={{ color: '#6B7280' }}>
                            ₹{Math.round(item.totalAmount / item.duration)}/day
                          </div>
                        )}
                      </div>
                      
                      {/* Quantity Selector (only for one-time items) */}
                      {item.type !== 'subscription' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item, (item.quantity || 1) - 1)}
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
                            onClick={() => updateQuantity(item, (item.quantity || 1) + 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-all"
                            style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
                          >
                            +
                          </button>
                        </div>
                      )}
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
                  ₹{calculateTotal()}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowCartModal(false);
                  router.push('/food/checkout');
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
    </>
  );
}

