export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  route: string;
  isAvailable: boolean;
  comingSoon?: boolean;
}

export const services: Service[] = [
  {
    id: 'food',
    name: 'Food Delivery',
    description: 'Fresh homemade meals & tiffin services',
    icon: '🍱',
    color: 'from-orange-500 to-red-600',
    gradient: 'bg-gradient-to-br from-orange-50 to-red-50',
    route: '/food/home',
    isAvailable: true,
    comingSoon: false,
  },
  {
    id: 'grocery',
    name: 'Grocery',
    description: 'Daily essentials delivered to your door',
    icon: '🛒',
    color: 'from-green-500 to-emerald-600',
    gradient: 'bg-gradient-to-br from-green-50 to-emerald-50',
    route: '/grocery',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'dairy',
    name: 'Dairy Products',
    description: 'Fresh milk, curd & dairy products',
    icon: '🥛',
    color: 'from-blue-500 to-cyan-600',
    gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    route: '/dairy',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'laundry',
    name: 'Laundry',
    description: 'Quick & reliable laundry services',
    icon: '👕',
    color: 'from-purple-500 to-pink-600',
    gradient: 'bg-gradient-to-br from-purple-50 to-pink-50',
    route: '/laundry',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'pg-finder',
    name: 'PG Finder',
    description: 'Find your perfect paying guest accommodation',
    icon: '🏠',
    color: 'from-indigo-500 to-blue-600',
    gradient: 'bg-gradient-to-br from-indigo-50 to-blue-50',
    route: '/pg-finder',
    isAvailable: false,
    comingSoon: true,
  },
];






