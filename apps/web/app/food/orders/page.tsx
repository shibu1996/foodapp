'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { FoodHeader } from '@/app/components/FoodHeader';
import { FloatingCart } from '@/app/components/FloatingCart';

const API_BASE_URL = 'http://localhost:5000/api';

interface Order {
  _id: string;
  orderNumber: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  totalAmount: number;
  status: string;
  deliveryDate: Date;
  deliverySlot: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
  isSubscription?: boolean;
  review?: {
    products: {
      productName: string;
      rating: number;
    }[];
    comment: string;
  };
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [productRatings, setProductRatings] = useState<{ [key: string]: number }>({});
  const [reviewComment, setReviewComment] = useState<string>('');

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
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth');
          return;
        }

        const url = `${API_BASE_URL}/orders/my-orders`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success && data.data.length > 0) {
          // Filter out subscription orders and sort by most recent first
          const oneTimeOrders = data.data.filter((order: Order) => !order.isSubscription);
          const sortedOrders = oneTimeOrders.sort((a: Order, b: Order) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sortedOrders);
        } else {
          // Set sample orders if no orders found
          setSampleOrders();
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Set sample orders on error
        setSampleOrders();
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  // Filter and search orders
  useEffect(() => {
    let result = [...orders];

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(order => order.status === filter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      result = result.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredOrders(result);
  }, [orders, filter, searchQuery]);

  const setSampleOrders = () => {
    const sampleOrders: Order[] = [
      {
        _id: 'sample1',
        orderNumber: 'ORD123458',
        items: [
          { productName: 'Chicken Biryani', quantity: 1, price: 250, total: 250 },
          { productName: 'Raita', quantity: 1, price: 40, total: 40 }
        ],
        totalAmount: 290,
        status: 'out_for_delivery',
        deliveryDate: new Date('2025-10-25'),
        deliverySlot: '12:00 PM - 2:00 PM',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        createdAt: new Date('2025-10-25T14:00:00'),
        isSubscription: false
      },
      {
        _id: 'sample2',
        orderNumber: 'ORD123457',
        items: [
          { productName: 'Paneer Tikka', quantity: 2, price: 150, total: 300 }
        ],
        totalAmount: 300,
        status: 'preparing',
        deliveryDate: new Date('2025-10-25'),
        deliverySlot: '7:00 PM - 9:00 PM',
        paymentMethod: 'online',
        paymentStatus: 'paid',
        createdAt: new Date('2025-10-25T12:30:00'),
        isSubscription: false
      },
      {
        _id: 'sample3',
        orderNumber: 'ORD123456',
        items: [
          { productName: 'Dal Makhani', quantity: 2, price: 120, total: 240 },
          { productName: 'Paneer Butter Masala', quantity: 1, price: 180, total: 180 },
          { productName: 'Naan', quantity: 3, price: 30, total: 90 }
        ],
        totalAmount: 510,
        status: 'delivered',
        deliveryDate: new Date('2025-10-24'),
        deliverySlot: '7:00 PM - 9:00 PM',
        paymentMethod: 'online',
        paymentStatus: 'paid',
        createdAt: new Date('2025-10-24T10:30:00'),
        isSubscription: false,
        review: {
          products: [
            { productName: 'Dal Makhani', rating: 5 },
            { productName: 'Paneer Butter Masala', rating: 4 },
            { productName: 'Naan', rating: 5 }
          ],
          comment: 'Excellent food quality and fast delivery!'
        }
      },
      {
        _id: 'sample4',
        orderNumber: 'ORD123455',
        items: [
          { productName: 'Chole Bhature', quantity: 1, price: 130, total: 130 }
        ],
        totalAmount: 130,
        status: 'delivered',
        deliveryDate: new Date('2025-10-23'),
        deliverySlot: '8:00 AM - 10:00 AM',
        paymentMethod: 'cod',
        paymentStatus: 'paid',
        createdAt: new Date('2025-10-23T08:15:00'),
        isSubscription: false
      }
    ];
    setOrders(sampleOrders);
  };

  const handleOpenReview = (order: Order) => {
    setReviewingOrder(order);
    
    // Initialize product ratings
    const ratings: { [key: string]: number } = {};
    if (order.review) {
      order.review.products.forEach(p => {
        ratings[p.productName] = p.rating;
      });
    } else {
      order.items.forEach(item => {
        ratings[item.productName] = 0;
      });
    }
    setProductRatings(ratings);
    setReviewComment(order.review?.comment || '');
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    if (!reviewingOrder) return;

    // Check if at least one product is rated
    const hasRatings = Object.values(productRatings).some(rating => rating > 0);
    if (!hasRatings) {
      alert('Please rate at least one item');
      return;
    }

    // Update order with review
    const updatedOrders = orders.map(order => 
      order._id === reviewingOrder._id
        ? {
            ...order,
            review: {
              products: Object.entries(productRatings).map(([productName, rating]) => ({
                productName,
                rating
              })).filter(p => p.rating > 0),
              comment: reviewComment
            }
          }
        : order
    );

    setOrders(updatedOrders);
    setShowReviewModal(false);
    setReviewingOrder(null);
    setProductRatings({});
    setReviewComment('');
  };

  const getAverageRating = (review?: Order['review']) => {
    if (!review || review.products.length === 0) return 0;
    const sum = review.products.reduce((acc, p) => acc + p.rating, 0);
    return Math.round((sum / review.products.length) * 10) / 10;
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: { bg: '#FEF3C7', text: '#F59E0B' },
      confirmed: { bg: '#E0E7FF', text: '#6366F1' },
      preparing: { bg: '#FEF2F2', text: '#E11D48' },
      out_for_delivery: { bg: '#E0F2FE', text: '#0284C7' },
      delivered: { bg: '#DCFCE7', text: '#16A34A' },
      cancelled: { bg: '#FEE2E2', text: '#EF4444' },
    };
    return colors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  const getStatusText = (status: string) => {
    const texts: any = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return texts[status] || status;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <FoodHeader 
        user={user}
        showLocation={false}
        showSearch={false}
        showCart={true}
        cartCount={cart.length}
        centerTitle="My Orders"
        onCartClick={() => setShowCartModal(true)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
              style={{ color: '#9CA3AF' }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            <input
              type="text"
              placeholder="Search by order number or item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border text-sm font-medium"
              style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
            />
      </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none w-full md:w-48 pl-4 pr-10 py-3 rounded-lg border text-sm font-medium cursor-pointer"
              style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <svg 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" 
              style={{ color: '#6B7280' }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl p-6 animate-pulse border" style={{ borderColor: '#E5E7EB' }}>
                <div className="h-4 rounded w-1/4 mb-4" style={{ backgroundColor: '#E5E7EB' }}></div>
                <div className="h-4 rounded w-1/2 mb-2" style={{ backgroundColor: '#E5E7EB' }}></div>
                <div className="h-4 rounded w-1/3" style={{ backgroundColor: '#E5E7EB' }}></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
              <svg className="w-10 h-10" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#0E1214' }}>No Orders Found</h3>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              {searchQuery || filter !== 'all' ? 'No orders match your search or filter' : 'You haven\'t placed any orders yet'}
            </p>
            <Link
              href="/food/home"
              className="inline-block px-6 py-2.5 rounded-lg transition-all text-sm font-semibold"
              style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border hover:shadow-lg transition-all p-6"
                style={{ borderColor: '#E5E7EB' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-bold mb-1" style={{ color: '#0E1214' }}>
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span 
                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{ 
                      backgroundColor: getStatusColor(order.status).bg,
                      color: getStatusColor(order.status).text
                    }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Items */}
                <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>Items:</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span style={{ color: '#374151' }}>
                          {item.productName} <span style={{ color: '#9CA3AF' }}>x {item.quantity}</span>
                        </span>
                        <span className="font-semibold" style={{ color: '#0E1214' }}>₹{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="border-t pt-4 flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
                  <div className="space-y-1">
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      <span className="font-semibold" style={{ color: '#0E1214' }}>Total:</span> ₹{order.totalAmount}
                    </p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      <span className="font-semibold" style={{ color: '#0E1214' }}>Payment:</span>{' '}
                      {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                      {' '}({order.paymentStatus})
                    </p>
                    {order.deliverySlot && (
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        <span className="font-semibold" style={{ color: '#0E1214' }}>Delivery:</span>{' '}
                        {new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {order.deliverySlot}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {order.status === 'delivered' && (
                      <>
                        {order.review && (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg 
                                key={star}
                                className="w-4 h-4" 
                                fill={star <= getAverageRating(order.review) ? '#F59E0B' : 'none'}
                                stroke="#F59E0B"
                                strokeWidth={1.5}
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                            <span className="text-xs font-bold ml-1" style={{ color: '#D97706' }}>
                              {getAverageRating(order.review)}
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => handleOpenReview(order)}
                          className="px-3 py-2 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5"
                          style={{ 
                            backgroundColor: order.review ? '#FEF3C7' : '#FEF2F2', 
                            color: order.review ? '#D97706' : '#E11D48',
                            border: `1px solid ${order.review ? '#F59E0B' : '#E11D48'}`
                          }}
                          onMouseEnter={(e: any) => {
                            e.currentTarget.style.backgroundColor = order.review ? '#FDE68A' : '#FEE2E2';
                          }}
                          onMouseLeave={(e: any) => {
                            e.currentTarget.style.backgroundColor = order.review ? '#FEF3C7' : '#FEF2F2';
                          }}
                        >
                          <svg className="w-3.5 h-3.5" fill={order.review ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          {order.review ? 'Edit' : 'Rate'}
                        </button>
                      </>
                    )}
                    <Link
                      href={`/food/orders/${order._id}`}
                      className="px-4 py-2 rounded-lg transition-all text-xs font-medium"
                      style={{ backgroundColor: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}
                    >
                      View Details
                    </Link>
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button
                        className="px-4 py-2 rounded-lg transition-all text-xs font-medium"
                        style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
                        onClick={() => alert('Cancel order functionality coming soon!')}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && reviewingOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowReviewModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>
              Rate Your Order
            </h3>
            
            {/* Order Details */}
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>
                Order #{reviewingOrder.orderNumber}
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                {reviewingOrder.items.map(item => item.productName).join(', ')}
              </p>
            </div>

            {/* Product Ratings */}
            <div className="mb-4 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <label className="text-sm font-semibold mb-3 block" style={{ color: '#0E1214' }}>
                Rate Each Item
              </label>
              <div className="space-y-4">
                {reviewingOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: '#0E1214' }}>
                      {item.productName}
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setProductRatings(prev => ({
                            ...prev,
                            [item.productName]: star
                          }))}
                          className="transition-all transform hover:scale-110"
                        >
                          <svg 
                            className="w-7 h-7" 
                            fill={star <= (productRatings[item.productName] || 0) ? '#F59E0B' : 'none'}
                            stroke={star <= (productRatings[item.productName] || 0) ? '#F59E0B' : '#D1D5DB'}
                            strokeWidth={1.5}
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      ))}
                      <span className="text-xs ml-2 self-center" style={{ color: '#6B7280' }}>
                        {(productRatings[item.productName] || 0) === 0 && 'Tap to rate'}
                        {(productRatings[item.productName] || 0) === 1 && 'Poor'}
                        {(productRatings[item.productName] || 0) === 2 && 'Below Avg'}
                        {(productRatings[item.productName] || 0) === 3 && 'Average'}
                        {(productRatings[item.productName] || 0) === 4 && 'Good'}
                        {(productRatings[item.productName] || 0) === 5 && 'Excellent'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="text-sm font-semibold mb-2 block" style={{ color: '#0E1214' }}>
                Share your experience (Optional)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Tell us what you liked or what could be improved..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border text-sm resize-none"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all border"
                style={{ backgroundColor: '#FFFFFF', color: '#6B7280', borderColor: '#E5E7EB' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all"
                style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#BE123C'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#E11D48'}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart */}
      <FloatingCart 
        externalShowModal={showCartModal}
        onModalClose={() => setShowCartModal(false)}
        onFloatingButtonClick={() => setShowCartModal(true)}
      />
    </div>
    </ProtectedRoute>
  );
}


