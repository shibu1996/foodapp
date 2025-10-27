'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:5000';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null
  });
  const [deleting, setDeleting] = useState(false);
  
  // Delete all state
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/food/categories`);

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.category) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/food/categories/${deleteModal.category._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }

      // Remove category from list
      setCategories(categories.filter(c => c._id !== deleteModal.category!._id));
      
      // Close modal
      setDeleteModal({ isOpen: false, category: null });
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert(err.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = !category.isActive;
      
      const response = await fetch(`${API_BASE_URL}/api/food/categories/${category._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      // Update category in list
      setCategories(categories.map(c => 
        c._id === category._id ? { ...c, isActive: newStatus } : c
      ));
    } catch (err: any) {
      console.error('Error toggling status:', err);
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeletingAll(true);
      
      const response = await fetch(`${API_BASE_URL}/api/food/categories/admin/delete-all-categories`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete all categories');
      }

      // Clear categories list
      setCategories([]);
      
      // Close modal
      setShowDeleteAllModal(false);
      
      // Show success message
      alert(`Successfully deleted ${data.deletedCount} categories!`);
    } catch (err: any) {
      console.error('Error deleting all categories:', err);
      alert(err.message || 'Failed to delete all categories');
    } finally {
      setDeletingAll(false);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter((category) => {
    // Search filter
    if (searchQuery && !category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && !category.isActive) return false;
      if (statusFilter === 'inactive' && category.isActive) return false;
    }

    return true;
  });

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold" style={{ color: '#0E1214', fontSize: '1.875rem' }}>Categories</h1>
          <p className="mt-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Manage product categories for your restaurant menu
          </p>
        </div>
        <div className="flex items-center gap-3">
          {categories.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 border"
              style={{ 
                backgroundColor: 'transparent',
                borderColor: '#DC2626',
                color: '#DC2626',
                fontSize: '0.875rem' 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE2E2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Delete all categories"
            >
              <i className="fa-solid fa-trash-can"></i>
              Delete All
            </button>
          )}
          <button
            onClick={() => router.push('/admin/categories/new')}
            className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
            style={{ backgroundColor: '#E11D48', fontSize: '0.875rem' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#BE123C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E11D48';
            }}
          >
            <i className="fa-solid fa-plus"></i>
            Add New Category
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#6B7280', fontSize: '0.875rem' }}></i>
            <input
              type="text"
              placeholder="Search categories by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-200 outline-none"
              style={{ 
                borderColor: '#E5E7EB',
                color: '#0E1214',
                fontSize: '0.875rem'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#E11D48';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-64 px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
            style={{ 
              borderColor: '#E5E7EB',
              color: '#0E1214',
              backgroundColor: '#FFFFFF',
              fontSize: '0.875rem'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#E11D48';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchQuery || statusFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              style={{ color: '#E11D48', fontSize: '0.875rem' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <i className="fa-solid fa-filter-circle-xmark"></i>
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: '#FEF2F2', borderColor: '#E11D48' }}>
          <p style={{ color: '#E11D48', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="rounded-xl shadow-sm p-8 text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ 
            border: '3px solid #FEF2F2',
            borderTop: '3px solid #E11D48'
          }}></div>
          <p className="mt-4" style={{ color: '#6B7280', fontSize: '0.875rem' }}>Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-xl shadow-sm p-12 text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#FEF2F2' }}>
            <i className={`fa-solid ${categories.length === 0 ? 'fa-layer-group' : 'fa-filter-circle-xmark'} text-4xl`} style={{ color: '#E11D48' }}></i>
          </div>
          <p className="mb-2 font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>
            {categories.length === 0 ? 'No categories found' : 'No matching categories'}
          </p>
          <p className="mb-6" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            {categories.length === 0 
              ? 'Start by adding your first category' 
              : 'Try adjusting your filters or search query'}
          </p>
          {categories.length === 0 ? (
            <button
              onClick={() => router.push('/admin/categories/new')}
              className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 inline-flex items-center gap-2"
              style={{ backgroundColor: '#E11D48', fontSize: '0.875rem' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#BE123C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E11D48';
              }}
            >
              <i className="fa-solid fa-plus"></i>
              Add Your First Category
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center gap-2 border"
              style={{ 
                color: '#E11D48',
                borderColor: '#E11D48',
                backgroundColor: 'transparent',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <i className="fa-solid fa-filter-circle-xmark"></i>
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        /* Categories Table */
        <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Category Name
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Description
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category, index) => (
                  <tr
                    key={category._id}
                    className="transition-colors"
                    style={{ borderBottom: index !== filteredCategories.length - 1 ? '1px solid #E5E7EB' : 'none' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                          <i className="fa-solid fa-layer-group" style={{ color: '#E11D48' }}></i>
                        </div>
                        <div className="font-medium" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                          {category.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                        {category.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                        {category.description || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1.5 rounded-full font-medium inline-flex items-center gap-1.5"
                        style={{
                          backgroundColor: category.isActive ? '#D1FAE5' : '#F3F4F6',
                          color: category.isActive ? '#059669' : '#6B7280',
                          fontSize: '0.75rem'
                        }}
                      >
                        <i className={`fa-solid ${category.isActive ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === category._id ? null : category._id)}
                          className="p-2 rounded-lg transition-all duration-200"
                          style={{ 
                            color: '#6B7280',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F3F4F6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <i className="fa-solid fa-ellipsis-vertical text-lg"></i>
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdown === category._id && (
                          <>
                            {/* Backdrop */}
                            <div 
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            ></div>
                            
                            {/* Menu */}
                            <div 
                              className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border z-20"
                              style={{ 
                                backgroundColor: '#FFFFFF',
                                borderColor: '#E5E7EB'
                              }}
                            >
                              <div className="py-2">
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    router.push(`/admin/categories/${category._id}`);
                                  }}
                                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200"
                                  style={{ color: '#0E1214', fontSize: '0.875rem' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                                    e.currentTarget.style.color = '#E11D48';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#0E1214';
                                  }}
                                >
                                  <i className="fa-solid fa-eye w-4"></i>
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    router.push(`/admin/categories/${category._id}/edit`);
                                  }}
                                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200"
                                  style={{ color: '#0E1214', fontSize: '0.875rem' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#CFFAFE';
                                    e.currentTarget.style.color = '#0891B2';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#0E1214';
                                  }}
                                >
                                  <i className="fa-solid fa-pen-to-square w-4"></i>
                                  Edit Category
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handleToggleStatus(category);
                                  }}
                                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200"
                                  style={{ color: '#0E1214', fontSize: '0.875rem' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = category.isActive ? '#FEF3C7' : '#D1FAE5';
                                    e.currentTarget.style.color = category.isActive ? '#92400E' : '#065F46';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#0E1214';
                                  }}
                                >
                                  <i className={`fa-solid ${category.isActive ? 'fa-eye-slash' : 'fa-eye'} w-4`}></i>
                                  {category.isActive ? 'Mark Inactive' : 'Mark Active'}
                                </button>
                                <div className="my-1 border-t" style={{ borderColor: '#E5E7EB' }}></div>
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    setDeleteModal({ isOpen: true, category });
                                  }}
                                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200"
                                  style={{ color: '#DC2626', fontSize: '0.875rem' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#FEE2E2';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <i className="fa-solid fa-trash w-4"></i>
                                  Delete Category
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Count */}
      {!loading && categories.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-layer-group"></i>
            Showing {filteredCategories.length} of {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </div>
          {filteredCategories.length !== categories.length && (
            <div style={{ color: '#E11D48', fontSize: '0.875rem' }}>
              <i className="fa-solid fa-filter"></i> Filters applied
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.category && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 transition-opacity"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => !deleting && setDeleteModal({ isOpen: false, category: null })}
          ></div>

          {/* Modal */}
          <div 
            className="relative rounded-2xl shadow-2xl max-w-md w-full"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FEE2E2' }}>
                  <i className="fa-solid fa-trash-can text-xl" style={{ color: '#DC2626' }}></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: '#0E1214' }}>
                    Delete Category
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
                <i className="fa-solid fa-circle-exclamation mt-0.5" style={{ color: '#DC2626' }}></i>
                <div>
                  <p className="font-medium mb-1" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                    Are you sure you want to delete?
                  </p>
                  <p className="font-bold mb-2" style={{ color: '#DC2626', fontSize: '0.9375rem' }}>
                    "{deleteModal.category.name}"
                  </p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    This will permanently remove the category and cannot be recovered.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
              <button
                onClick={() => setDeleteModal({ isOpen: false, category: null })}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all"
                style={{ 
                  backgroundColor: '#F3F4F6',
                  color: '#6B7280',
                  opacity: deleting ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!deleting) e.currentTarget.style.backgroundColor = '#E5E7EB';
                }}
                onMouseLeave={(e) => {
                  if (!deleting) e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: deleting ? '#9CA3AF' : '#DC2626',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (!deleting) e.currentTarget.style.backgroundColor = '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  if (!deleting) e.currentTarget.style.backgroundColor = '#DC2626';
                }}
              >
                {deleting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash-can"></i>
                    Delete Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 transition-opacity"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => !deletingAll && setShowDeleteAllModal(false)}
          ></div>

          {/* Modal */}
          <div 
            className="relative rounded-2xl shadow-2xl max-w-md w-full"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FEE2E2' }}>
                  <i className="fa-solid fa-triangle-exclamation text-xl" style={{ color: '#DC2626' }}></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: '#0E1214' }}>
                    Delete All Categories
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
                    ⚠️ This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
                <i className="fa-solid fa-circle-exclamation mt-0.5" style={{ color: '#DC2626' }}></i>
                <div>
                  <p className="font-bold mb-2" style={{ color: '#DC2626', fontSize: '0.9375rem' }}>
                    WARNING: You are about to delete ALL categories!
                  </p>
                  <p className="text-sm mb-2" style={{ color: '#0E1214' }}>
                    This will permanently delete <strong>{categories.length} categories</strong> from the database.
                  </p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    This action is irreversible. All data will be lost forever.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
              <button
                onClick={() => setShowDeleteAllModal(false)}
                disabled={deletingAll}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all"
                style={{ 
                  backgroundColor: '#F3F4F6',
                  color: '#6B7280',
                  opacity: deletingAll ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!deletingAll) e.currentTarget.style.backgroundColor = '#E5E7EB';
                }}
                onMouseLeave={(e) => {
                  if (!deletingAll) e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deletingAll}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: deletingAll ? '#9CA3AF' : '#DC2626',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (!deletingAll) e.currentTarget.style.backgroundColor = '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  if (!deletingAll) e.currentTarget.style.backgroundColor = '#DC2626';
                }}
              >
                {deletingAll ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Deleting All...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash-can"></i>
                    Yes, Delete All {categories.length} Categories
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

