'use client';

import { useState, useEffect } from 'react';

interface Payment {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
  paymentGateway: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  status: string;
  paymentMethod: string;
  refundAmount: number;
  refundReason?: string;
  createdAt: string;
}

interface PaymentStats {
  _id: string;
  count: number;
  totalAmount: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    loadPayments();
  }, [statusFilter, gatewayFilter, searchQuery]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        paymentGateway: gatewayFilter
      });

      const response = await fetch(`${API_BASE_URL}/api/food/payments?${params}`);
      const data = await response.json();

      if (data.success) {
        setPayments(data.data);
        setStats(data.stats || []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const openRefundModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundAmount(payment.amount.toString());
    setRefundReason('');
    setShowRefundModal(true);
  };

  const handleRefund = async () => {
    if (!selectedPayment || !refundAmount) {
      alert('Please enter refund amount');
      return;
    }

    if (parseFloat(refundAmount) > selectedPayment.amount) {
      alert('Refund amount cannot exceed payment amount');
      return;
    }

    setProcessingRefund(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/food/payments/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment._id,
          amount: parseFloat(refundAmount),
          reason: refundReason
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Refund processed successfully!');
        setShowRefundModal(false);
        loadPayments();
      } else {
        alert(data.message || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Failed to process refund');
    } finally {
      setProcessingRefund(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: '#D1FAE5', color: '#059669' };
      case 'pending': return { bg: '#FEF3C7', color: '#F59E0B' };
      case 'failed': return { bg: '#FEE2E2', color: '#DC2626' };
      case 'refunded': return { bg: '#DBEAFE', color: '#3B82F6' };
      default: return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  const getGatewayIcon = (gateway: string) => {
    switch (gateway) {
      case 'razorpay': return '💳';
      case 'stripe': return '💰';
      case 'paytm': return '📱';
      case 'cod': return '💵';
      default: return '💳';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Calculate statistics
  const totalPayments = payments.length;
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const totalRevenue = stats.find(s => s._id === 'completed')?.totalAmount || 0;
  const refundedAmount = stats.find(s => s._id === 'refunded')?.totalAmount || 0;

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" 
          style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
          Payment Management
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          View and manage all payment transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Total Payments</p>
          <p className="text-2xl font-bold" style={{ color: '#0E1214' }}>{totalPayments}</p>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Completed</p>
          <p className="text-2xl font-bold" style={{ color: '#059669' }}>{completedPayments}</p>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Total Revenue</p>
          <p className="text-2xl font-bold" style={{ color: '#0E1214' }}>₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Refunded</p>
          <p className="text-2xl font-bold" style={{ color: '#3B82F6' }}>₹{refundedAmount.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by order number, transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border text-sm"
              style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border text-sm font-semibold"
              style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border text-sm font-semibold"
              style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
            >
              <option value="all">All Gateways</option>
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
              <option value="paytm">Paytm</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F9FAFB' }}>
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Order</th>
                <th className="text-left px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Customer</th>
                <th className="text-center px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Amount</th>
                <th className="text-center px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Gateway</th>
                <th className="text-center px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Method</th>
                <th className="text-center px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Status</th>
                <th className="text-center px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Date</th>
                <th className="text-right px-4 py-3 text-xs font-bold" style={{ color: '#6B7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 rounded-full animate-spin" 
                        style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <p className="text-sm" style={{ color: '#6B7280' }}>No payments found</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const statusStyle = getStatusColor(payment.status);
                  return (
                    <tr key={payment._id} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                          {payment.orderId?.orderNumber || 'N/A'}
                        </p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          {payment.gatewayOrderId?.substring(0, 20)}...
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                          {payment.userId?.name || 'Unknown'}
                        </p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          {payment.userId?.email || ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <p className="text-sm font-bold" style={{ color: '#0E1214' }}>
                          ₹{payment.amount.toLocaleString('en-IN')}
                        </p>
                        {payment.refundAmount > 0 && (
                          <p className="text-xs" style={{ color: '#3B82F6' }}>
                            Refunded: ₹{payment.refundAmount}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-lg">{getGatewayIcon(payment.paymentGateway)}</span>
                        <p className="text-xs capitalize" style={{ color: '#6B7280' }}>
                          {payment.paymentGateway}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <p className="text-sm capitalize" style={{ color: '#6B7280' }}>
                          {payment.paymentMethod || 'N/A'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded text-xs font-semibold capitalize"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          {formatDate(payment.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetailsModal(payment)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                          >
                            Details
                          </button>
                          {payment.status === 'completed' && payment.refundAmount === 0 && (
                            <button
                              onClick={() => openRefundModal(payment)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                              style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Poppins, sans-serif' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>
              Payment Details
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Order Number</p>
                  <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                    {selectedPayment.orderId?.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Amount</p>
                  <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                    ₹{selectedPayment.amount.toLocaleString('en-IN')} {selectedPayment.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Payment Gateway</p>
                  <p className="text-sm font-semibold capitalize" style={{ color: '#0E1214' }}>
                    {selectedPayment.paymentGateway}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Payment Method</p>
                  <p className="text-sm font-semibold capitalize" style={{ color: '#0E1214' }}>
                    {selectedPayment.paymentMethod || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Status</p>
                  <span className="px-2 py-1 rounded text-xs font-semibold capitalize"
                    style={getStatusColor(selectedPayment.status)}>
                    {selectedPayment.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Date</p>
                  <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                    {formatDate(selectedPayment.createdAt)}
                  </p>
                </div>
              </div>

              {selectedPayment.gatewayOrderId && (
                <div>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Gateway Order ID</p>
                  <p className="text-sm font-mono" style={{ color: '#0E1214' }}>
                    {selectedPayment.gatewayOrderId}
                  </p>
                </div>
              )}

              {selectedPayment.gatewayPaymentId && (
                <div>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Gateway Payment ID</p>
                  <p className="text-sm font-mono" style={{ color: '#0E1214' }}>
                    {selectedPayment.gatewayPaymentId}
                  </p>
                </div>
              )}

              {selectedPayment.refundAmount > 0 && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#DBEAFE' }}>
                  <p className="text-xs mb-1" style={{ color: '#1E40AF' }}>Refund Information</p>
                  <p className="text-sm font-semibold" style={{ color: '#1E40AF' }}>
                    Amount: ₹{selectedPayment.refundAmount.toLocaleString('en-IN')}
                  </p>
                  {selectedPayment.refundReason && (
                    <p className="text-xs mt-1" style={{ color: '#1E40AF' }}>
                      Reason: {selectedPayment.refundReason}
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Customer</p>
                <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                  {selectedPayment.userId?.name}
                </p>
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  {selectedPayment.userId?.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-6 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRefundModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" 
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Poppins, sans-serif' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>
              Process Refund
            </h3>
            
            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: '#6B7280' }}>
                Order: <span className="font-semibold" style={{ color: '#0E1214' }}>
                  {selectedPayment.orderId?.orderNumber}
                </span>
              </p>
              <p className="text-sm mb-2" style={{ color: '#6B7280' }}>
                Payment Amount: <span className="font-semibold" style={{ color: '#0E1214' }}>
                  ₹{selectedPayment.amount.toLocaleString('en-IN')}
                </span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                Refund Amount
              </label>
              <input
                type="number"
                min="0"
                max={selectedPayment.amount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                placeholder="Enter refund amount"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                Reason (Optional)
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                placeholder="e.g., Customer requested refund"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRefundModal(false)}
                disabled={processingRefund}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={processingRefund}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
              >
                {processingRefund ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

