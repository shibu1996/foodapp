'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE_URL = 'http://localhost:5000/api';

interface Subscription {
  _id: string;
  subscriptionNumber: string;
  productId: any;
  productName: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  deliverySlot: string;
  addons: { name: string; price: number }[];
  skipDays: { date: Date; reason?: string }[];
  maxSkipDays: number;
  status: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryCount: number;
  completedDeliveries: number;
  autoRenewal: boolean;
  createdAt: Date;
}

export default function MySubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, [filter]);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const url = filter === 'all' 
        ? `${API_BASE_URL}/subscriptions/my-subscriptions`
        : `${API_BASE_URL}/subscriptions/my-subscriptions?status=${filter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSubscriptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id: string) => {
    if (!confirm('Are you sure you want to pause this subscription?')) return;

    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subscriptions/${id}/pause`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Paused by user' })
      });

      const data = await response.json();

      if (data.success) {
        alert('Subscription paused successfully');
        fetchSubscriptions();
      } else {
        alert(data.error || 'Failed to pause subscription');
      }
    } catch (error) {
      console.error('Error pausing subscription:', error);
      alert('Failed to pause subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (id: string) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subscriptions/${id}/resume`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Subscription resumed successfully');
        fetchSubscriptions();
      } else {
        alert(data.error || 'Failed to resume subscription');
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
      alert('Failed to resume subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this subscription? This cannot be undone.')) return;

    const reason = prompt('Please provide a reason for cancellation (optional):');

    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subscriptions/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'Cancelled by user' })
      });

      const data = await response.json();

      if (data.success) {
        alert('Subscription cancelled successfully');
        fetchSubscriptions();
      } else {
        alert(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRemainingDays = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/home')}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">My Subscriptions</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {['all', 'active', 'paused', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Subscriptions List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Subscriptions Found</h3>
            <p className="text-gray-600 mb-6">You haven't created any subscriptions yet</p>
            <Link
              href="/home"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
            >
              Subscribe Now
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {subscriptions.map((sub) => (
              <div
                key={sub._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {sub.productName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      #{sub.subscriptionNumber}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sub.status)}`}>
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Duration:</span>
                    <span className="font-medium">{sub.duration} days</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Start Date:</span>
                    <span className="font-medium">
                      {new Date(sub.startDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>End Date:</span>
                    <span className="font-medium">
                      {new Date(sub.endDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  {sub.status === 'active' && (
                    <div className="flex justify-between text-gray-700">
                      <span>Days Remaining:</span>
                      <span className="font-medium text-primary">
                        {getRemainingDays(sub.endDate)} days
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Slot:</span>
                    <span className="font-medium">{sub.deliverySlot}</span>
                  </div>
                  {sub.addons.length > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Add-ons:</span>
                      <span className="font-medium">
                        {sub.addons.map(a => a.name).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span>Skip Days Used:</span>
                    <span className="font-medium">
                      {sub.skipDays.length} / {sub.maxSkipDays}
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-800">
                    <span>Total Amount:</span>
                    <span>₹{sub.totalAmount}</span>
                  </div>
                  {sub.pendingAmount > 0 && (
                    <div className="flex justify-between text-sm text-orange-600 mt-1">
                      <span>Pending:</span>
                      <span>₹{sub.pendingAmount}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/subscriptions/${sub._id}`}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium text-center"
                  >
                    View Details
                  </Link>
                  
                  {sub.status === 'active' && (
                    <>
                      <button
                        onClick={() => handlePause(sub._id)}
                        disabled={actionLoading === sub._id}
                        className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition text-sm font-medium disabled:opacity-50"
                      >
                        Pause
                      </button>
                      <button
                        onClick={() => handleCancel(sub._id)}
                        disabled={actionLoading === sub._id}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {sub.status === 'paused' && (
                    <button
                      onClick={() => handleResume(sub._id)}
                      disabled={actionLoading === sub._id}
                      className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm font-medium disabled:opacity-50"
                    >
                      Resume
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

