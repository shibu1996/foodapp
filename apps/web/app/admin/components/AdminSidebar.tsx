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
    router.push('/auth');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-72'
      } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 h-screen flex flex-col transition-all duration-300 ease-in-out relative`}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10 pointer-events-none" />

      {/* Header */}
      <div className="relative p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                FoodApp Admin
              </h1>
              <p className="text-xs text-slate-400 mt-1">Management Panel</p>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="relative p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
              AD
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Admin User</p>
              <p className="text-xs text-slate-400">admin@foodapp.com</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Profile */}
      {isCollapsed && (
        <div className="relative p-4 border-b border-slate-700/50 flex justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
            AD
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
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
                } px-3 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-orange-500/20 to-purple-500/20 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                {/* Active Indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-400 to-purple-500 rounded-r-full" />
                )}

                <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                  <div className={`${active ? 'text-orange-400' : ''} transition-colors`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-orange-500 text-white rounded-full">
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
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-4 animate-fadeIn">
                  {item.submenu!.map((subItem) => (
                    <button
                      key={subItem.path}
                      onClick={() => router.push(subItem.path)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isActive(subItem.path)
                          ? 'bg-slate-700/50 text-orange-400 font-medium'
                          : 'text-slate-400 hover:bg-slate-700/30 hover:text-white'
                      }`}
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
      <div className="relative p-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className={`w-full group flex items-center ${
            isCollapsed ? 'justify-center' : 'gap-3'
          } px-3 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 font-medium`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogoutIcon />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}
