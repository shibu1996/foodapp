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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Products']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsCollapsed(collapsed);
  }, []);

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      name: 'Products',
      path: '/products',
      icon: <ProductsIcon />,
      submenu: [
        { name: 'All Products', path: '/products' },
        { name: 'Add New', path: '/products/new' },
      ],
    },
    {
      name: 'Categories',
      path: '/categories',
      icon: <CategoriesIcon />,
    },
    {
      name: 'Orders',
      path: '/orders',
      icon: <OrdersIcon />,
      badge: 12,
    },
    {
      name: 'Subscriptions',
      path: '/subscriptions',
      icon: <SubscriptionsIcon />,
      badge: 5,
      submenu: [
        { name: 'All Subscriptions', path: '/subscriptions' },
        { name: 'Plans', path: '/subscriptions/plans' },
      ],
    },
    {
      name: 'Charges',
      path: '/charges',
      icon: <ChargesIcon />,
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to user app login
    window.location.href = 'http://localhost:3000/auth';
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-72'
      } bg-white border-r shadow-lg h-screen flex flex-col transition-all duration-300 ease-in-out relative`}
      style={{ borderColor: '#E5E7EB', fontFamily: 'Poppins, sans-serif' }}
    >
      {/* Header */}
      <div className="relative p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1">
              <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#0E1214' }}>
                <span>Food</span>
                <span style={{ color: '#E11D48' }}>Admin</span>
              </h1>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Management Dashboard</p>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg transition-all duration-200 border"
            style={{ 
              borderColor: '#E5E7EB', 
              color: '#6B7280'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEF2F2';
              e.currentTarget.style.borderColor = '#E11D48';
              e.currentTarget.style.color = '#E11D48';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.color = '#6B7280';
            }}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="relative p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md"
              style={{ backgroundColor: '#E11D48' }}
            >
              AD
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>Admin User</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>admin@foodapp.com</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Profile */}
      {isCollapsed && (
        <div className="relative p-4 border-b flex justify-center" style={{ borderColor: '#E5E7EB' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md"
            style={{ backgroundColor: '#E11D48' }}
          >
            AD
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative flex-1 overflow-y-auto p-4 space-y-1"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#E5E7EB #FFFFFF'
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
                      // If collapsed, navigate to main path
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
                  backgroundColor: active ? '#FEF2F2' : 'transparent',
                  borderColor: active ? '#E11D48' : 'transparent',
                  color: active ? '#E11D48' : '#6B7280'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.color = '#0E1214';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6B7280';
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
                  style={{ borderColor: '#E5E7EB' }}
                >
                  {item.submenu!.map((subItem) => (
                    <button
                      key={subItem.path}
                      onClick={() => router.push(subItem.path)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200"
                      style={{
                        backgroundColor: isActive(subItem.path) ? '#FEF2F2' : 'transparent',
                        color: isActive(subItem.path) ? '#E11D48' : '#6B7280',
                        fontWeight: isActive(subItem.path) ? 600 : 400
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(subItem.path)) {
                          e.currentTarget.style.backgroundColor = '#F9FAFB';
                          e.currentTarget.style.color = '#0E1214';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(subItem.path)) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#6B7280';
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

      {/* Logout */}
      <div className="relative p-4 border-t" style={{ borderColor: '#E5E7EB' }}>
        <button
          onClick={handleLogout}
          className={`w-full group flex items-center ${
            isCollapsed ? 'justify-center' : 'gap-3'
          } px-3 py-3 rounded-xl transition-all duration-200 font-medium border`}
          style={{
            backgroundColor: '#FEF2F2',
            borderColor: '#E11D48',
            color: '#E11D48'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E11D48';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FEF2F2';
            e.currentTarget.style.color = '#E11D48';
          }}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogoutIcon />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}



