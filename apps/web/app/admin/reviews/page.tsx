'use client';

import { useState, useEffect } from 'react';

interface Review {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  productId: {
    _id: string;
    name: string;
    image: string;
  };
  rating: number;
  comment: string;
  images: string[];
  deliveryBoyRating?: number;
  deliveryBoyComment?: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  isVerified: boolean;
  isHelpful: number;
  isReported: boolean;
  reportReason?: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, filterRating, filterVerified]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/food/reviews`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      showToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    if (filterRating !== 'all') {
      filtered = filtered.filter(r => r.rating === parseInt(filterRating));
    }

    if (filterVerified !== 'all') {
      filtered = filtered.filter(r => 
        filterVerified === 'verified' ? r.isVerified : !r.isVerified
      );
    }

    setFilteredReviews(filtered);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleRespondClick = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response || '');
    setShowRespondModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/food/reviews/${selectedReview._id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText })
      });

      if (response.ok) {
        showToast('Response added successfully', 'success');
        setShowRespondModal(false);
        setResponseText('');
        setSelectedReview(null);
        await loadReviews();
      } else {
        showToast('Failed to add response', 'error');
      }
    } catch (error) {
      console.error('Error adding response:', error);
      showToast('Failed to add response', 'error');
    }
  };

  const handleToggleVerify = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/reviews/${id}/verify`, {
        method: 'PATCH'
      });

      if (response.ok) {
        showToast('Review verification updated', 'success');
        await loadReviews();
      } else {
        showToast('Failed to update verification', 'error');
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
      showToast('Failed to update verification', 'error');
    }
  };

  const handleDeleteClick = (review: Review) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedReview) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/food/reviews/${selectedReview._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Review deleted successfully', 'success');
        setShowDeleteModal(false);
        setSelectedReview(null);
        await loadReviews();
      } else {
        showToast('Failed to delete review', 'error');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('Failed to delete review', 'error');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className="w-4 h-4"
            fill={star <= rating ? '#F59E0B' : '#E5E7EB'}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Toast Notification */}
      {toast.show && (
        <div
          className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
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

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
          Reviews Management
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Manage customer reviews and ratings
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#6B7280' }}>Rating</label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#6B7280' }}>Status</label>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" 
            style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center" style={{ borderColor: '#E5E7EB' }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
            <svg className="w-10 h-10" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#0E1214' }}>No Reviews Found</h3>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {filterRating !== 'all' || filterVerified !== 'all' 
              ? 'No reviews match your filters' 
              : 'No reviews have been submitted yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-xl border p-4"
              style={{ borderColor: '#E5E7EB' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {/* Product Image */}
                  {review.productId?.image && (
                    <img
                      src={review.productId.image}
                      alt={review.productId.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold" style={{ color: '#0E1214' }}>
                        {review.productId?.name}
                      </h3>
                      {review.isVerified && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: '#D1FAE5', color: '#047857' }}>
                          ✓ Verified
                        </span>
                      )}
                      {review.isReported && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                          ⚠ Reported
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-xs" style={{ color: '#6B7280' }}>
                        by {review.userId?.name} • {formatDate(review.createdAt)}
                      </span>
                    </div>

                    {review.comment && (
                      <p className="text-sm mb-2" style={{ color: '#374151' }}>
                        {review.comment}
                      </p>
                    )}

                    {review.deliveryBoyRating && (
                      <div className="flex items-center gap-2 p-2 rounded-lg mb-2" style={{ backgroundColor: '#F3F4F6' }}>
                        <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>Delivery:</span>
                        {renderStars(review.deliveryBoyRating)}
                        {review.deliveryBoyComment && (
                          <span className="text-xs" style={{ color: '#6B7280' }}>• {review.deliveryBoyComment}</span>
                        )}
                      </div>
                    )}

                    {review.response && (
                      <div className="p-3 rounded-lg mt-2" style={{ backgroundColor: '#DBEAFE', borderLeft: '3px solid #3B82F6' }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: '#1E40AF' }}>Admin Response:</p>
                        <p className="text-xs" style={{ color: '#374151' }}>{review.response}</p>
                        <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                          {review.respondedAt && `Responded on ${formatDate(review.respondedAt)}`}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs" style={{ color: '#6B7280' }}>
                        Order: {review.orderId?.orderNumber}
                      </span>
                      {review.isHelpful > 0 && (
                        <span className="text-xs" style={{ color: '#6B7280' }}>
                          • {review.isHelpful} found helpful
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleVerify(review._id)}
                    className="p-2 rounded-lg transition-all hover:bg-gray-100"
                    title={review.isVerified ? 'Unverify' : 'Verify'}
                  >
                    <svg className="w-5 h-5" style={{ color: review.isVerified ? '#059669' : '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleRespondClick(review)}
                    className="p-2 rounded-lg transition-all hover:bg-gray-100"
                    title="Respond"
                  >
                    <svg className="w-5 h-5" style={{ color: '#3B82F6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDeleteClick(review)}
                    className="p-2 rounded-lg transition-all hover:bg-gray-100"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Respond Modal */}
      {showRespondModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-xl font-bold" style={{ color: '#0E1214' }}>
                Respond to Review
              </h2>
              <button
                onClick={() => {
                  setShowRespondModal(false);
                  setResponseText('');
                  setSelectedReview(null);
                }}
                className="p-2 rounded-lg transition-all hover:bg-gray-100"
              >
                <svg className="w-5 h-5" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(selectedReview.rating)}
                </div>
                <p className="text-sm" style={{ color: '#374151' }}>
                  {selectedReview.comment}
                </p>
              </div>

              <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                Your Response
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none resize-none"
                style={{ borderColor: '#D1D5DB', color: '#0E1214', minHeight: '120px' }}
                placeholder="Write a professional response to this review..."
              />

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowRespondModal(false);
                    setResponseText('');
                    setSelectedReview(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg font-semibold text-sm transition-all"
                  style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  disabled={!responseText.trim()}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
                >
                  Submit Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
              <svg className="w-6 h-6" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: '#0E1214' }}>
              Delete Review?
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedReview(null);
                }}
                className="flex-1 px-4 py-2 border rounded-lg font-semibold text-sm transition-all"
                style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

