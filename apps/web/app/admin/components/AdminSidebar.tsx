'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

// SVG Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

const ProductsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const CategoriesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const OrdersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const SubscriptionsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChargesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const OutletsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const CouponsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const ReviewsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const CustomersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const InventoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const PaymentsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ExpensesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ChevronDownIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 transition-transform ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  submenu?: { name: string; path: string }[];
}

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Products', 'Subscriptions']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsCollapsed(collapsed);
  }, []);

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: <DashboardIcon />,
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: <ProductsIcon />,
      submenu: [
        { name: 'All Products', path: '/admin/products' },
        { name: 'Add New', path: '/admin/products/new' },
      ],
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: <CategoriesIcon />,
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: <OrdersIcon />,
      badge: 12,
    },
    {
      name: 'Subscriptions',
      path: '/admin/subscriptions',
      icon: <SubscriptionsIcon />,
      badge: 5,
      submenu: [
        { name: 'All Subscriptions', path: '/admin/subscriptions' },
        { name: 'Plans', path: '/admin/subscriptions/plans' },
        { name: 'Time Slots', path: '/admin/subscriptions/time-slots' },
        { name: 'Delivery Boy', path: '/admin/subscriptions/delivery-boy' },
      ],
    },
    {
      name: 'Charges',
      path: '/admin/charges',
      icon: <ChargesIcon />,
    },
    {
      name: 'Coupons',
      path: '/admin/coupons',
      icon: <CouponsIcon />,
    },
    {
      name: 'Reviews',
      path: '/admin/reviews',
      icon: <ReviewsIcon />,
    },
    {
      name: 'Customers',
      path: '/admin/customers',
      icon: <CustomersIcon />,
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: <ReportsIcon />,
    },
    {
      name: 'Expenses',
      path: '/admin/expenses',
      icon: <ExpensesIcon />,
    },
    {
      name: 'Inventory',
      path: '/admin/inventory',
      icon: <InventoryIcon />,
    },
    {
      name: 'Payments',
      path: '/admin/payments',
      icon: <PaymentsIcon />,
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <SettingsIcon />,
    },
    {
      name: 'Outlets',
      path: '/admin/outlets',
      icon: <OutletsIcon />,
    },
  ];

  const toggleMenu = (menuName: string) => {
    if (isCollapsed) return; // Don't toggle submenu when sidebar is collapsed
    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-72'
      } border-r h-screen flex flex-col transition-all duration-300 ease-in-out relative`}
      style={{ 
        backgroundColor: '#0E1214',
        borderColor: '#1F2937',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      {/* Header */}
      <div className="relative p-6 border-b" style={{ borderColor: '#1F2937' }}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1">
              <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
                <span>Food</span>
                <span style={{ color: '#E11D48' }}>Admin</span>
              </h1>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Management Dashboard</p>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg transition-all duration-200 border"
            style={{ 
              borderColor: '#374151', 
              color: '#9CA3AF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(225, 29, 72, 0.1)';
              e.currentTarget.style.borderColor = '#E11D48';
              e.currentTarget.style.color = '#E11D48';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#374151';
              e.currentTarget.style.color = '#9CA3AF';
            }}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 overflow-y-auto p-4 space-y-1"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#374151 #0E1214'
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenus.includes(item.name);

          return (
            <div key={item.name}>
              {/* Main Menu Item */}
              <button
                onClick={() => {
                  if (hasSubmenu) {
                    if (isCollapsed) {
                      router.push(item.path);
                    } else {
                      toggleMenu(item.name);
                    }
                  } else {
                    router.push(item.path);
                  }
                }}
                className={`w-full group relative flex items-center ${
                  isCollapsed ? 'justify-center' : 'justify-between'
                } px-3 py-3 rounded-xl transition-all duration-200 border`}
                style={{
                  backgroundColor: active ? 'rgba(225, 29, 72, 0.1)' : 'transparent',
                  borderColor: active ? '#E11D48' : 'transparent',
                  color: active ? '#E11D48' : '#9CA3AF'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#9CA3AF';
                  }
                }}
                title={isCollapsed ? item.name : ''}
              >
                {/* Active Indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                    style={{ backgroundColor: '#E11D48' }}
                  />
                )}

                <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                  <div className="transition-colors">
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold text-white rounded-full shadow-sm"
                        style={{ backgroundColor: '#E11D48' }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {hasSubmenu && (
                      <ChevronDownIcon
                        className={isExpanded ? 'rotate-180' : ''}
                      />
                    )}
                  </div>
                )}
              </button>

              {/* Submenu */}
              {hasSubmenu && !isCollapsed && isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 pl-4 animate-fadeIn"
                  style={{ borderColor: '#374151' }}
                >
                  {item.submenu!.map((subItem) => (
                    <button
                      key={subItem.path}
                      onClick={() => router.push(subItem.path)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200"
                      style={{
                        backgroundColor: isActive(subItem.path) ? 'rgba(225, 29, 72, 0.1)' : 'transparent',
                        color: isActive(subItem.path) ? '#E11D48' : '#9CA3AF',
                        fontWeight: isActive(subItem.path) ? 600 : 400
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(subItem.path)) {
                          e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(subItem.path)) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#9CA3AF';
                        }
                      }}
                    >
                      {subItem.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
