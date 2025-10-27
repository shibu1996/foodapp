'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FoodHeader } from '@/app/components/FoodHeader';
import { FloatingCart } from '@/app/components/FloatingCart';

const API_BASE_URL = 'http://localhost:5000/api';

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    image: string;
  };
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
}

export default function ReviewOrderPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [deliveryBoyRating, setDeliveryBoyRating] = useState(0);
  const [deliveryBoyHoverRating, setDeliveryBoyHoverRating] = useState(0);
  const [deliveryBoyComment, setDeliveryBoyComment] = useState('');
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedCart) setCart(JSON.parse(savedCart));
    
    checkEligibility();
  }, [params.id]);

  const checkEligibility = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/food/reviews/check/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        if (data.order.items.length > 0) {
          setSelectedProduct(data.order.items[0].productId._id || data.order.items[0].productId);
        }
      } else {
        showToast(data.message || 'Cannot review this order', 'error');
        setTimeout(() => router.push('/food/orders'), 2000);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      showToast('Failed to load order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      showToast('Please select a product', 'error');
      return;
    }

    if (rating === 0) {
      showToast('Please provide a rating', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/food/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: params.id,
          productId: selectedProduct,
          rating,
          comment: comment.trim(),
          deliveryBoyRating: deliveryBoyRating || undefined,
          deliveryBoyComment: deliveryBoyComment.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('Review submitted successfully!', 'success');
        setTimeout(() => router.push('/food/orders'), 2000);
      } else {
        showToast(data.message || 'Failed to submit review', 'error');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (
    currentRating: number,
    hoverValue: number,
    onHover: (value: number) => void,
    onClick: (value: number) => void,
    onLeave: () => void
  ) => {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => onHover(star)}
            onMouseLeave={onLeave}
            onClick={() => onClick(star)}
            className="transition-transform hover:scale-110"
          >
            <svg
              className="w-8 h-8"
              fill={(hoverValue || currentRating) >= star ? '#F59E0B' : '#E5E7EB'}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#F9FAFB' }}>
        <FoodHeader
          user={user}
          cart={cart}
          onCartClick={() => {}}
          onLogout={() => {}}
        />
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" 
            style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB', fontFamily: 'Poppins, sans-serif' }}>
      <FoodHeader
        user={user}
        cart={cart}
        onCartClick={() => {}}
        onLogout={() => {}}
      />

      {/* Toast */}
      {toast.show && (
        <div
          className="fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
          style={{
            backgroundColor: toast.type === 'success' ? '#059669' : '#DC2626',
            color: '#FFFFFF'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {toast.type === 'success' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-sm font-semibold transition-colors"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#E11D48'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6" style={{ border: '1px solid #E5E7EB' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#0E1214' }}>
            Write a Review
          </h1>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
            Order #{order?.orderNumber}
          </p>

          <form onSubmit={handleSubmit}>
            {/* Product Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3" style={{ color: '#0E1214' }}>
                Select Product to Review *
              </label>
              <div className="space-y-2">
                {order?.items.map((item) => (
                  <button
                    key={item.productId._id || item.productId}
                    type="button"
                    onClick={() => setSelectedProduct(item.productId._id || item.productId)}
                    className="w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3"
                    style={{
                      borderColor: selectedProduct === (item.productId._id || item.productId) ? '#E11D48' : '#E5E7EB',
                      backgroundColor: selectedProduct === (item.productId._id || item.productId) ? '#FEF2F2' : '#FFFFFF'
                    }}
                  >
                    {item.productId.image && (
                      <img
                        src={item.productId.image}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <span className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                      {item.productName}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Rating */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3" style={{ color: '#0E1214' }}>
                Rate the Product *
              </label>
              {renderStars(
                rating,
                hoverRating,
                setHoverRating,
                setRating,
                () => setHoverRating(0)
              )}
              <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
                {rating > 0 && `You rated: ${rating} star${rating > 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Product Comment */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                Your Review (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-sm outline-none resize-none"
                style={{ borderColor: '#D1D5DB', color: '#0E1214', minHeight: '120px' }}
                placeholder="Tell us about your experience with this product..."
                maxLength={500}
              />
              <p className="text-xs mt-1 text-right" style={{ color: '#6B7280' }}>
                {comment.length}/500
              </p>
            </div>

            {/* Delivery Rating */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#0E1214' }}>
                Rate Delivery Experience (Optional)
              </label>
              {renderStars(
                deliveryBoyRating,
                deliveryBoyHoverRating,
                setDeliveryBoyHoverRating,
                setDeliveryBoyRating,
                () => setDeliveryBoyHoverRating(0)
              )}
              {deliveryBoyRating > 0 && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={deliveryBoyComment}
                    onChange={(e) => setDeliveryBoyComment(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg text-sm outline-none"
                    style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
                    placeholder="Comment on delivery service..."
                    maxLength={200}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
              onMouseEnter={(e: any) => !submitting && (e.currentTarget.style.backgroundColor = '#BE123C')}
              onMouseLeave={(e: any) => !submitting && (e.currentTarget.style.backgroundColor = '#E11D48')}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <FloatingCart
        cart={cart}
        isOpen={false}
        onClose={() => {}}
        onCartUpdate={() => {}}
      />
    </div>
  );
}

