'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  name: string;
  path: string;
  icon: string;
  submenu?: { name: string; path: string }[];
}

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Products']);

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: '📊',
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: '📦',
      submenu: [
        { name: 'All Products', path: '/admin/products' },
        { name: 'Add New', path: '/admin/products/new' },
      ],
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: '📂',
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: '🛒',
    },
    {
      name: 'Subscriptions',
      path: '/admin/subscriptions',
      icon: '📅',
    },
  ];

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-orange-600">FoodApp Admin</h1>
        <p className="text-xs text-gray-500 mt-1">Management Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {navItems.map((item) => (
          <div key={item.name} className="mb-2">
            <button
              onClick={() => {
                if (item.submenu) {
                  toggleMenu(item.name);
                } else {
                  router.push(item.path);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                pathname === item.path
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </div>
              {item.submenu && (
                <span className="text-gray-400">
                  {expandedMenus.includes(item.name) ? '▼' : '▶'}
                </span>
              )}
            </button>

            {/* Submenu */}
            {item.submenu && expandedMenus.includes(item.name) && (
              <div className="ml-4 mt-1 space-y-1">
                {item.submenu.map((subItem) => (
                  <button
                    key={subItem.path}
                    onClick={() => router.push(subItem.path)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      pathname === subItem.path
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {subItem.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

