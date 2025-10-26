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
                                <div className="my-1 border-t" style={{ borderColor: '#E5E7EB' }}></div>
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
                                      // TODO: Implement delete functionality
                                      console.log('Delete category:', category._id);
                                    }
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
    </div>
  );
}

