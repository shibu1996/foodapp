'use client';

import { useState, useEffect } from 'react';

interface Expense {
  _id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  recordedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const CATEGORIES = [
  'Raw Materials',
  'Salaries',
  'Rent',
  'Utilities',
  'Marketing',
  'Delivery',
  'Maintenance',
  'Packaging',
  'Other',
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Raw Materials',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const API_BASE_URL = 'http://localhost:5000';
  const userId = '67148b2c8f8e17bbfd9f9ab3'; // Admin user ID

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/food/expenses`);
      const data = await response.json();
      if (data.success) {
        setExpenses(data.data);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingExpense
        ? `${API_BASE_URL}/api/food/expenses/${editingExpense._id}`
        : `${API_BASE_URL}/api/food/expenses`;

      const response = await fetch(url, {
        method: editingExpense ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recordedBy: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        loadExpenses();
        closeModal();
      } else {
        alert(data.message || 'Failed to save expense');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/food/expenses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        loadExpenses();
      } else {
        alert(data.message || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const openModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        name: expense.name,
        amount: expense.amount.toString(),
        category: expense.category,
        date: new Date(expense.date).toISOString().split('T')[0],
        notes: expense.notes || '',
      });
    } else {
      setEditingExpense(null);
      setFormData({
        name: '',
        amount: '',
        category: 'Raw Materials',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      name: '',
      amount: '',
      category: 'Raw Materials',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  // Filtering
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const expenseDate = new Date(expense.date);
    const matchesStartDate = !startDate || expenseDate >= new Date(startDate);
    const matchesEndDate = !endDate || expenseDate <= new Date(endDate);

    return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
            Expense Management
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Track and manage all business expenses
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all"
          style={{ backgroundColor: '#E11D48' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#BE123C')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E11D48')}
        >
          + Add Expense
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm mb-1 opacity-90">Total Expenses (Filtered)</p>
            <p className="text-4xl font-bold mb-2">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </p>
            <p className="text-sm opacity-90">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
            </p>
          </div>
          <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6" style={{ borderColor: '#E5E7EB' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or category..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
            />
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B7280' }}>Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B7280' }}>Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B7280' }}>Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: '#6B7280' }}>Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B7280' }}>Notes</th>
                <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#6B7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#6B7280' }}>
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="border-b" style={{ borderColor: '#E5E7EB' }}>
                    <td className="px-4 py-3 text-sm" style={{ color: '#0E1214' }}>
                      {new Date(expense.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>{expense.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ 
                        backgroundColor: '#FEE2E2',
                        color: '#991B1B'
                      }}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-bold" style={{ color: '#DC2626' }}>
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        {expense.notes || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(expense)}
                          className="p-2 rounded-lg transition-all"
                          style={{ color: '#3B82F6' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-2 rounded-lg transition-all"
                          style={{ color: '#DC2626' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-xl font-bold" style={{ color: '#0E1214' }}>
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                  Expense Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                  placeholder="e.g., Monthly Rent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
                  style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E5E7EB')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-all"
                  style={{ backgroundColor: '#E11D48' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#BE123C')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E11D48')}
                >
                  {editingExpense ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
