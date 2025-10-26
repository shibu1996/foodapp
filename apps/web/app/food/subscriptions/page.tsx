'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { FoodHeader } from '@/app/components/FoodHeader';
import { FloatingCart } from '@/app/components/FloatingCart';
import { getFoodImage } from '../home/utils/images';

const API_BASE_URL = 'http://localhost:5000/api';

interface Subscription {
  _id: string;
  subscriptionNumber: string;
  productId: any;
  productName: string;
  productImage?: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  deliverySlot: string;
  addons: { name: string; price: number }[];
  skipDays: { date: Date; reason?: string }[];
  maxSkipDays: number;
  maxExtendedDays: number;
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
  type?: 'meal-plan' | 'regular';
  dailyMenu?: {
    date: Date;
    defaultItems: string[];
    selectedItems?: string[];
  }[];
  deliveryProgress: {
    date: Date;
    status: 'pending' | 'completed' | 'skipped';
    meal?: string[];
    addonsForDay?: { name: string; price: number }[];
  }[];
  availableAddons?: {
    name: string;
    price: number;
  }[];
  slotChangeDeadline?: string;
  paidAddons?: {
    name: string;
    price: number;
    days: number;
    paidAt: Date;
  }[];
}

export default function MySubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  
  // Modal states
  const [showMealModal, setShowMealModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showDeliveryDetailsModal, setShowDeliveryDetailsModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  
  // Toast notification
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  
  // Meal selection
  const [selectedMealItems, setSelectedMealItems] = useState<string[]>([]);
  const [maxMealItems, setMaxMealItems] = useState(4);
  
  // Slot change
  const [newSlot, setNewSlot] = useState<string>('');
  const [slotChangeScope, setSlotChangeScope] = useState<'tomorrow' | 'all'>('tomorrow');
  
  // Addons
  const [selectedAddons, setSelectedAddons] = useState<{[key: string]: number}>({});
  const [addonDays, setAddonDays] = useState<number>(1);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'active' | 'cancelled' | 'completed' | 'payment-failed'>('active');

  // Toast helper function
  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  // Load user and cart
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, user not logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/food/subscriptions/my-subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        // Transform API data to match frontend interface
        const transformedData = data.data.map((sub: any) => ({
          ...sub,
          productImage: sub.productId?.image || undefined,
          type: sub.productName?.toLowerCase().includes('meal') ? 'meal-plan' : 'regular',
          // Generate delivery progress from actual dates
          deliveryProgress: generateProgressFromSubscription(sub),
          // Daily menu for meal-plan types
          dailyMenu: sub.type === 'meal-plan' ? generateDailyMenu(sub) : undefined,
          // Available add-ons (static for now)
          availableAddons: [
            { name: 'Extra Rice', price: 20 },
            { name: 'Papad', price: 15 },
            { name: 'Raita', price: 30 },
            { name: 'Sweet Dish', price: 50 },
            { name: 'Salad', price: 25 }
          ],
          slotChangeDeadline: '3:30 AM',
          paidAddons: sub.paidAddons || []
        }));
        
        setSubscriptions(transformedData);
      } else {
        // If no subscriptions from API, show sample data for testing
        console.log('No subscriptions found from API, showing sample data');
        setSampleSubscriptions();
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      // Show sample subscriptions on error for testing
      setSampleSubscriptions();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate delivery progress from subscription data
  const generateProgressFromSubscription = (sub: any) => {
    const progress = [];
    const startDate = new Date(sub.startDate);
    const skipDays = sub.skipDays || [];
    
    for (let i = 0; i < sub.duration; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      let status: 'pending' | 'completed' | 'skipped' = 'pending';
      if (i < sub.completedDeliveries) {
        status = 'completed';
      }
      if (skipDays.some((skip: any) => 
        new Date(skip.date).toDateString() === date.toDateString()
      )) {
        status = 'skipped';
      }
      
      progress.push({
        date,
        status,
        meal: sub.productName?.toLowerCase().includes('meal') ? ['Dal Makhani', 'Jeera Rice', 'Roti', 'Salad'] : undefined,
        addonsForDay: []
      });
    }
    
    return progress;
  };

  // Helper function to generate daily menu for meal-plan subscriptions
  const generateDailyMenu = (sub: any) => {
    const menu = [];
    const startDate = new Date(sub.startDate);
    const defaultMenus = [
      ['Dal Makhani', 'Jeera Rice', 'Roti (2 pcs)', 'Salad'],
      ['Rajma', 'Steamed Rice', 'Roti (3 pcs)', 'Raita'],
      ['Chole', 'Jeera Rice', 'Roti (2 pcs)', 'Pickle'],
      ['Paneer Curry', 'Pulao', 'Roti (2 pcs)', 'Salad'],
      ['Mixed Veg', 'Plain Rice', 'Roti (3 pcs)', 'Curd'],
      ['Kadhi Pakora', 'Jeera Rice', 'Roti (2 pcs)', 'Onion'],
      ['Aloo Gobi', 'Steamed Rice', 'Roti (3 pcs)', 'Salad']
    ];
    
    for (let i = 0; i < sub.duration; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      menu.push({
        date,
        defaultItems: defaultMenus[i % defaultMenus.length],
        selectedItems: sub.dailyMeals?.find((m: any) => 
          new Date(m.date).toDateString() === date.toDateString()
        )?.selectedItems || undefined
      });
    }
    
    return menu;
  };

  const setSampleSubscriptions = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Generate delivery progress for 30 days
    const generateProgress = (startDate: Date, completedCount: number, skipDates: Date[], productType: 'meal-plan' | 'regular') => {
      const progress = [];
      
      // Sample meals for meal-plan type
      const sampleMeals = [
        ['Dal Makhani', 'Jeera Rice', 'Roti (2 pcs)', 'Salad'],
        ['Rajma', 'Steamed Rice', 'Roti (3 pcs)', 'Raita'],
        ['Chole', 'Jeera Rice', 'Roti (2 pcs)', 'Pickle'],
        ['Paneer Curry', 'Pulao', 'Roti (2 pcs)', 'Salad'],
        ['Mixed Veg', 'Plain Rice', 'Roti (3 pcs)', 'Curd']
      ];
      
      // Sample add-ons
      const sampleAddons = [
        [{ name: 'Extra Rice', price: 20 }],
        [{ name: 'Papad', price: 15 }, { name: 'Raita', price: 30 }],
        [],
        [{ name: 'Sweet Dish', price: 50 }],
        [{ name: 'Extra Rice', price: 20 }]
      ];
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        let status: 'pending' | 'completed' | 'skipped' = 'pending';
        if (i < completedCount) {
          status = 'completed';
        }
        if (skipDates.some(skipDate => 
          skipDate.toDateString() === date.toDateString()
        )) {
          status = 'skipped';
        }
        
        // Add meal and addons info for completed deliveries
        const progressItem: any = { date, status };
        
        if (status === 'completed') {
          if (productType === 'meal-plan') {
            progressItem.meal = sampleMeals[i % sampleMeals.length];
          } else {
            progressItem.meal = ['Regular Meal'];
          }
          progressItem.addonsForDay = sampleAddons[i % sampleAddons.length];
        }
        
        progress.push(progressItem);
      }
      return progress;
    };

    const samples: Subscription[] = [
      {
        _id: '1',
        subscriptionNumber: 'SUB001',
        productId: 'prod1',
        productName: 'Daily Meal Plan',
        productImage: getFoodImage('Daily Meal Plan'),
        duration: 30,
        startDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000),
        deliverySlot: '7:00 AM - 8:00 AM',
        addons: [{ name: 'Extra Rice', price: 20 }],
        skipDays: [{ date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), reason: 'Holiday' }],
        maxSkipDays: 4,
        maxExtendedDays: 5,
        status: 'active',
        totalAmount: 2850,
        paidAmount: 2850,
        pendingAmount: 0,
        paymentMethod: 'Online',
        paymentStatus: 'paid',
        deliveryCount: 30,
        completedDeliveries: 5,
        autoRenewal: true,
        createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        type: 'meal-plan',
        dailyMenu: [
          {
            date: tomorrow,
            defaultItems: ['Dal Makhani', 'Jeera Rice', 'Roti (2 pcs)', 'Salad', 'Raita', 'Papad', 'Pickle'],
            selectedItems: ['Dal Makhani', 'Jeera Rice', 'Roti (2 pcs)', 'Salad']
          }
        ],
        deliveryProgress: generateProgress(
          new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
          5,
          [new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)],
          'meal-plan'
        ),
        availableAddons: [
          { name: 'Extra Rice', price: 20 },
          { name: 'Papad', price: 15 },
          { name: 'Raita', price: 30 },
          { name: 'Sweet Dish', price: 50 }
        ],
        slotChangeDeadline: '6:00 PM'
      },
      {
        _id: '3',
        subscriptionNumber: 'SUB003',
        productId: 'prod3',
        productName: 'Chole Bhature',
        productImage: getFoodImage('Chole Bhature'),
        duration: 7,
        startDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        deliverySlot: '8:00 AM - 9:00 AM',
        addons: [
          { name: 'Extra Chole', price: 30 },
          { name: 'Lassi', price: 40 }
        ],
        skipDays: [],
        maxSkipDays: 1,
        maxExtendedDays: 2,
        status: 'active',
        totalAmount: 665,
        paidAmount: 400,
        pendingAmount: 265,
        paymentMethod: 'Online',
        paymentStatus: 'partial',
        deliveryCount: 7,
        completedDeliveries: 3,
        autoRenewal: false,
        createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        type: 'regular',
        deliveryProgress: generateProgress(
          new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
          3,
          [],
          'regular'
        ),
        availableAddons: [
          { name: 'Extra Chole', price: 30 },
          { name: 'Lassi', price: 40 },
          { name: 'Pickle', price: 20 }
        ],
        slotChangeDeadline: '6:00 PM'
      },
      {
        _id: '2',
        subscriptionNumber: 'SUB002',
        productId: 'prod2',
        productName: 'Paneer Butter Masala',
        productImage: getFoodImage('Paneer Butter Masala'),
        duration: 15,
        startDate: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        deliverySlot: '12:00 PM - 1:00 PM',
        addons: [],
        skipDays: [],
        maxSkipDays: 2,
        maxExtendedDays: 3,
        status: 'completed',
        totalAmount: 1425,
        paidAmount: 1425,
        pendingAmount: 0,
        paymentMethod: 'Cash',
        paymentStatus: 'paid',
        deliveryCount: 15,
        completedDeliveries: 15,
        autoRenewal: false,
        createdAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
        type: 'regular',
        deliveryProgress: generateProgress(
          new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
          15,
          [],
          'regular'
        ),
        availableAddons: [],
        slotChangeDeadline: '6:00 PM'
      },
      {
        _id: '4',
        subscriptionNumber: 'SUB004',
        productId: 'prod4',
        productName: 'Chicken Biryani',
        productImage: getFoodImage('Biryani'),
        duration: 10,
        startDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        deliverySlot: '1:00 PM - 2:00 PM',
        addons: [{ name: 'Raita', price: 30 }],
        skipDays: [],
        maxSkipDays: 2,
        maxExtendedDays: 3,
        status: 'cancelled',
        totalAmount: 1200,
        paidAmount: 1200,
        pendingAmount: 0,
        paymentMethod: 'Online',
        paymentStatus: 'refund-pending',
        deliveryCount: 10,
        completedDeliveries: 6,
        autoRenewal: false,
        createdAt: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        type: 'regular',
        deliveryProgress: generateProgress(
          new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
          6,
          [],
          'regular'
        ),
        availableAddons: [],
        slotChangeDeadline: '6:00 PM'
      },
      {
        _id: '5',
        subscriptionNumber: 'SUB005',
        productId: 'prod5',
        productName: 'South Indian Thali',
        productImage: getFoodImage('Thali'),
        duration: 20,
        startDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000),
        deliverySlot: '8:00 AM - 9:00 AM',
        addons: [],
        skipDays: [],
        maxSkipDays: 3,
        maxExtendedDays: 4,
        status: 'payment-failed',
        totalAmount: 1900,
        paidAmount: 0,
        pendingAmount: 1900,
        paymentMethod: 'Online',
        paymentStatus: 'failed',
        deliveryCount: 20,
        completedDeliveries: 0,
        autoRenewal: false,
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        type: 'regular',
        deliveryProgress: generateProgress(
          new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
          0,
          [],
          'regular'
        ),
        availableAddons: [],
        slotChangeDeadline: '6:00 PM'
      }
    ];

    // Sort: Active first, then completed
    const sorted = samples.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setSubscriptions(sorted);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/food/home');
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: { bg: '#D1FAE5', text: '#059669' },
      paused: { bg: '#FEF3C7', text: '#D97706' },
      cancelled: { bg: '#FEE2E2', text: '#DC2626' },
      completed: { bg: '#DBEAFE', text: '#2563EB' },
      expired: { bg: '#F3F4F6', text: '#6B7280' },
    };
    return colors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  const getRemainingDays = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getProgressPercentage = (sub: Subscription) => {
    return Math.round((sub.completedDeliveries / sub.deliveryCount) * 100);
  };

  // Meal Selection Modal
  const handleOpenMealModal = (sub: Subscription) => {
    setSelectedSubscription(sub);
    const tomorrow = sub.dailyMenu?.[0];
    if (tomorrow) {
      setSelectedMealItems(tomorrow.selectedItems || tomorrow.defaultItems);
      setMaxMealItems(4); // User can select 4 items from 7
    }
    setShowMealModal(true);
  };

  const handleMealItemToggle = (item: string, isChecked: boolean) => {
    if (isChecked) {
      if (selectedMealItems.length >= maxMealItems) {
        showToastMessage(`You can only select up to ${maxMealItems} items`, 'warning');
        return;
      }
      setSelectedMealItems([...selectedMealItems, item]);
    } else {
      setSelectedMealItems(selectedMealItems.filter(i => i !== item));
    }
  };

  const handleSaveMeal = async () => {
    if (!selectedSubscription) return;
    
    if (selectedMealItems.length !== maxMealItems) {
      showToastMessage(`Please select exactly ${maxMealItems} items`, 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Please login first', 'error');
        return;
      }

      // Call backend API to update meal selection
      const response = await fetch(`${API_BASE_URL}/food/subscriptions/${selectedSubscription._id}/modify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mealSelection: selectedMealItems // Backend needs to support this field
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update meal selection');
      }

      // Refresh subscription data
      await fetchSubscriptions();
      setShowMealModal(false);
      showToastMessage('Meal selection updated for tomorrow!', 'success');
    } catch (error: any) {
      console.error('Error updating meal:', error);
      showToastMessage(error.message || 'Failed to update meal selection', 'error');
    }
  };

  // Skip Day Modal
  const handleOpenSkipModal = (sub: Subscription) => {
    if (sub.skipDays.length >= sub.maxSkipDays) {
      showToastMessage('You have reached your skip limit!', 'warning');
      return;
    }
    setSelectedSubscription(sub);
    setShowSkipModal(true);
  };

  const handleConfirmSkip = () => {
    if (!selectedSubscription) return;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Extend end date by 1 day
    const newEndDate = new Date(selectedSubscription.endDate);
    newEndDate.setDate(newEndDate.getDate() + 1);
    
    // Add new extended day to delivery progress
    const newExtendedDate = new Date(selectedSubscription.deliveryProgress[selectedSubscription.deliveryProgress.length - 1].date);
    newExtendedDate.setDate(newExtendedDate.getDate() + 1);
    
    const updated = subscriptions.map(sub => 
      sub._id === selectedSubscription._id
        ? {
            ...sub,
            skipDays: [...sub.skipDays, { date: tomorrow, reason: 'User requested' }],
            endDate: newEndDate,
            deliveryProgress: [
              ...sub.deliveryProgress.map(p => 
                p.date.toDateString() === tomorrow.toDateString()
                  ? { ...p, status: 'skipped' as const }
                  : p
              ),
              // Add new extended day
              { date: newExtendedDate, status: 'pending' as const }
            ]
          }
        : sub
    );
    
    setSubscriptions(updated);
    setSelectedSubscription(updated.find(s => s._id === selectedSubscription._id) || null);
    setShowSkipModal(false);
    showToastMessage('Tomorrow\'s delivery has been skipped! Subscription extended by 1 day.', 'success');
  };

  // Slot Change Modal
  const handleOpenSlotModal = (sub: Subscription) => {
    // Check 3:30 AM deadline for today's slot change
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextPendingDelivery = sub.deliveryProgress.find(d => 
      d.status === 'pending' && new Date(d.date) >= today
    );
    
    if (nextPendingDelivery) {
      const deliveryDate = new Date(nextPendingDelivery.date);
      deliveryDate.setHours(0, 0, 0, 0);
      const isToday = deliveryDate.getTime() === today.getTime();
      
      if (isToday) {
        const now = new Date();
        const deadlineTime = new Date(deliveryDate);
        deadlineTime.setHours(3, 30, 0, 0);
        
        if (now >= deadlineTime) {
          showToastMessage('Slot change deadline has passed for today (3:30 AM)', 'warning');
          return;
        }
      }
    }
    
    setSelectedSubscription(sub);
    setNewSlot(sub.deliverySlot);
    setSlotChangeScope('tomorrow'); // Reset to default
    setShowSlotModal(true);
  };

  const handleSaveSlot = async () => {
    if (!selectedSubscription || !newSlot) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Please login first', 'error');
        return;
      }

      // Call backend API to update delivery slot
      const response = await fetch(`${API_BASE_URL}/food/subscriptions/${selectedSubscription._id}/modify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deliverySlot: newSlot
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update delivery slot');
      }

      // Refresh subscription data
      await fetchSubscriptions();
      setShowSlotModal(false);
      
      const message = slotChangeScope === 'tomorrow' 
        ? 'Delivery slot updated for tomorrow!' 
        : 'Delivery slot updated for all remaining days!';
      showToastMessage(message, 'success');
    } catch (error: any) {
      console.error('Error updating slot:', error);
      showToastMessage(error.message || 'Failed to update delivery slot', 'error');
    }
  };

  // Addons Modal
  const handleOpenAddonsModal = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setSelectedAddons({});
    setAddonDays(1);
    setShowAddonsModal(true);
  };

  const handleAddonQuantityChange = (addonName: string, change: number) => {
    setSelectedAddons(prev => {
      const current = prev[addonName] || 0;
      const newQty = Math.max(0, current + change);
      if (newQty === 0) {
        const { [addonName]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [addonName]: newQty };
    });
  };

  const calculateAddonTotal = () => {
    if (!selectedSubscription?.availableAddons) return 0;
    
    let total = 0;
    Object.entries(selectedAddons).forEach(([name, qty]) => {
      const addon = selectedSubscription.availableAddons?.find(a => a.name === name);
      if (addon) {
        total += addon.price * qty * addonDays;
      }
    });
    return total;
  };

  const handlePayAddons = async () => {
    if (!selectedSubscription) return;
    
    const total = calculateAddonTotal();
    if (total === 0) {
      showToastMessage('Please select at least one add-on', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Please login first', 'error');
        return;
      }

      // Create addons array for backend
      const addonsToAdd = Object.entries(selectedAddons).flatMap(([name, qty]) => {
        const addon = selectedSubscription.availableAddons?.find(a => a.name === name);
        if (!addon) return [];
        
        return Array.from({ length: qty }, () => ({
          name: addon.name,
          price: addon.price
        }));
      });

      // Call backend API to add addons
      const response = await fetch(`${API_BASE_URL}/food/subscriptions/${selectedSubscription._id}/modify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addons: [...(selectedSubscription.addons || []), ...addonsToAdd]
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to add add-ons');
      }

      // Refresh subscription data
      await fetchSubscriptions();
      setShowAddonsModal(false);
      showToastMessage(`Payment of ₹${total} successful! Add-ons will be added to your next ${addonDays} ${addonDays === 1 ? 'delivery' : 'deliveries'}.`, 'success');
    } catch (error: any) {
      console.error('Error adding addons:', error);
      showToastMessage(error.message || 'Failed to add add-ons', 'error');
    }
  };

  // Full Calendar Modal
  const handleOpenCalendar = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setShowCalendarModal(true);
  };

  // Skip Day - Call Backend API
  const handleSkipDayAPI = async (date: Date) => {
    if (!selectedSubscription) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Please login first', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/food/subscriptions/${selectedSubscription._id}/skip-day`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: date.toISOString(),
          reason: 'User requested'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to skip day');
      }

      // Refresh subscription data
      await fetchSubscriptions();
      showToastMessage('Day skipped successfully! Your subscription has been extended by 1 day.', 'success');
    } catch (error: any) {
      console.error('Error skipping day:', error);
      showToastMessage(error.message || 'Failed to skip day', 'error');
    }
  };

  // Undo Skip - Call Backend API
  const handleUndoSkip = async (dateToUndo: Date) => {
    if (!selectedSubscription) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Please login first', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/food/subscriptions/${selectedSubscription._id}/undo-skip`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: dateToUndo.toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to undo skip');
      }

      // Refresh subscription data
      await fetchSubscriptions();
      showToastMessage('Skip cancelled! Delivery will resume for this day and subscription shortened by 1 day.', 'success');
    } catch (error: any) {
      console.error('Error undoing skip:', error);
      showToastMessage(error.message || 'Failed to undo skip', 'error');
    }
  };

  // Toggle Skip from Calendar
  const handleCalendarDateClick = async (date: Date) => {
    if (!selectedSubscription) return;
    
    const delivery = selectedSubscription.deliveryProgress.find(
      p => p.date.toDateString() === date.toDateString()
    );
    
    if (!delivery) return;
    
    // Show details for completed deliveries
    if (delivery.status === 'completed') {
      if (delivery.meal || (delivery.addonsForDay && delivery.addonsForDay.length > 0)) {
        setSelectedDelivery(delivery);
        setShowDeliveryDetailsModal(true);
      }
      return;
    }
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      showToastMessage('Cannot modify past dates', 'warning');
      return;
    }
    
    // Toggle skip
    if (delivery.status === 'skipped') {
      handleUndoSkip(date);
    } else {
      // Skip this date
      if (selectedSubscription.skipDays.length >= selectedSubscription.maxSkipDays) {
        showToastMessage('You have reached your skip limit!', 'warning');
        return;
      }
      
      // Call API to skip day
      await handleSkipDayAPI(date);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <FoodHeader 
          user={user}
          showLocation={false}
          showSearch={false}
          showCart={true}
          cartCount={cart.length}
          onCartClick={() => setShowCartModal(true)}
          onLogout={handleLogout}
          centerTitle="My Subscriptions"
        />

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2].map((n) => (
                <div key={n} className="bg-white rounded-xl p-6 animate-pulse border" style={{ borderColor: '#E5E7EB' }}>
                  <div className="h-4 rounded w-1/4 mb-4" style={{ backgroundColor: '#F3F4F6' }}></div>
                  <div className="h-32 rounded mb-4" style={{ backgroundColor: '#F3F4F6' }}></div>
                  <div className="h-4 rounded w-1/2" style={{ backgroundColor: '#F3F4F6' }}></div>
                </div>
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border" style={{ borderColor: '#E5E7EB' }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <svg className="w-10 h-10" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: '#0E1214' }}>No Subscriptions Found</h3>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>You haven't created any subscriptions yet</p>
              <Link
                href="/food/home"
                className="inline-block px-6 py-2.5 rounded-lg font-semibold text-sm transition-all"
                style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#BE123C'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#E11D48'}
              >
                Subscribe Now
              </Link>
            </div>
          ) : (
            <>
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <button
                  onClick={() => setActiveFilter('active')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: activeFilter === 'active' ? '#E11D48' : '#FFFFFF',
                    color: activeFilter === 'active' ? '#FFFFFF' : '#6B7280',
                    border: `1.5px solid ${activeFilter === 'active' ? '#E11D48' : '#E5E7EB'}`
                  }}
                  onMouseEnter={(e: any) => {
                    if (activeFilter !== 'active') {
                      e.currentTarget.style.borderColor = '#E11D48';
                      e.currentTarget.style.color = '#E11D48';
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (activeFilter !== 'active') {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#6B7280';
                    }
                  }}
                >
                  Active ({subscriptions.filter(s => s.status === 'active').length})
                </button>
                <button
                  onClick={() => setActiveFilter('completed')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: activeFilter === 'completed' ? '#E11D48' : '#FFFFFF',
                    color: activeFilter === 'completed' ? '#FFFFFF' : '#6B7280',
                    border: `1.5px solid ${activeFilter === 'completed' ? '#E11D48' : '#E5E7EB'}`
                  }}
                  onMouseEnter={(e: any) => {
                    if (activeFilter !== 'completed') {
                      e.currentTarget.style.borderColor = '#E11D48';
                      e.currentTarget.style.color = '#E11D48';
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (activeFilter !== 'completed') {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#6B7280';
                    }
                  }}
                >
                  Completed ({subscriptions.filter(s => s.status === 'completed').length})
                </button>
                <button
                  onClick={() => setActiveFilter('cancelled')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: activeFilter === 'cancelled' ? '#E11D48' : '#FFFFFF',
                    color: activeFilter === 'cancelled' ? '#FFFFFF' : '#6B7280',
                    border: `1.5px solid ${activeFilter === 'cancelled' ? '#E11D48' : '#E5E7EB'}`
                  }}
                  onMouseEnter={(e: any) => {
                    if (activeFilter !== 'cancelled') {
                      e.currentTarget.style.borderColor = '#E11D48';
                      e.currentTarget.style.color = '#E11D48';
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (activeFilter !== 'cancelled') {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#6B7280';
                    }
                  }}
                >
                  Cancelled ({subscriptions.filter(s => s.status === 'cancelled').length})
                </button>
                <button
                  onClick={() => setActiveFilter('payment-failed')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: activeFilter === 'payment-failed' ? '#E11D48' : '#FFFFFF',
                    color: activeFilter === 'payment-failed' ? '#FFFFFF' : '#6B7280',
                    border: `1.5px solid ${activeFilter === 'payment-failed' ? '#E11D48' : '#E5E7EB'}`
                  }}
                  onMouseEnter={(e: any) => {
                    if (activeFilter !== 'payment-failed') {
                      e.currentTarget.style.borderColor = '#E11D48';
                      e.currentTarget.style.color = '#E11D48';
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (activeFilter !== 'payment-failed') {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#6B7280';
                    }
                  }}
                >
                  Payment Failed ({subscriptions.filter(s => s.status === 'payment-failed').length})
                </button>
              </div>

              {/* Subscriptions List */}
              {subscriptions.filter(sub => sub.status === activeFilter).length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border" style={{ borderColor: '#E5E7EB' }}>
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                    <svg className="w-8 h-8" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#0E1214' }}>
                    No {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1).replace('-', ' ')} Subscriptions
                  </h3>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    {activeFilter === 'active' && 'You don\'t have any active subscriptions'}
                    {activeFilter === 'completed' && 'No completed subscriptions yet'}
                    {activeFilter === 'cancelled' && 'No cancelled subscriptions'}
                    {activeFilter === 'payment-failed' && 'No payment failed subscriptions'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.filter(sub => sub.status === activeFilter).map((sub) => {
                    const statusColor = getStatusColor(sub.status);
                    const isActive = sub.status === 'active';
                const progressPercentage = getProgressPercentage(sub);
                const upcomingDates = sub.deliveryProgress.slice(sub.completedDeliveries, sub.completedDeliveries + 10);

                return (
                  <div
                    key={sub._id}
                    className="bg-white rounded-xl border transition-all p-4 sm:p-5"
                    style={{ borderColor: isActive ? '#E11D48' : '#E5E7EB' }}
                  >
                    {/* Header Section - Compact */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Product Image - Smaller */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#F3F4F6' }}>
                        <img 
                          src={sub.productImage || getFoodImage(sub.productName)} 
                          alt={sub.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info - Tighter */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold truncate" style={{ color: '#0E1214' }}>
                              {sub.productName}
                            </h3>
                            <p className="text-xs" style={{ color: '#6B7280' }}>
                              #{sub.subscriptionNumber}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span 
                              className="px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap"
                              style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                            >
                              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </span>
                            <Link
                              href={`/food/subscriptions/${sub._id}`}
                              className="px-2 py-1 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                              style={{ backgroundColor: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}
                              onMouseEnter={(e: any) => {
                                e.currentTarget.style.backgroundColor = '#E11D48';
                                e.currentTarget.style.color = '#FFFFFF';
                              }}
                              onMouseLeave={(e: any) => {
                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                                e.currentTarget.style.color = '#374151';
                              }}
                            >
                              Details
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>

                        {/* Quick Stats - Single Line */}
                        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs">
                          {isActive && (
                            <span className="font-bold" style={{ color: '#E11D48' }}>
                              {sub.completedDeliveries}/{sub.deliveryCount}
                            </span>
                          )}
                          <span className="font-medium" style={{ color: '#6B7280' }}>
                            {sub.deliverySlot.split(' - ')[0]}
                          </span>
                          {isActive && (
                            <span className="font-medium" style={{ color: '#E11D48' }}>
                              {getRemainingDays(sub.endDate)}d left
                            </span>
                          )}
                          <span className="font-medium" style={{ color: '#6B7280' }}>
                            Skip: {sub.skipDays.length}/{sub.maxSkipDays}
                          </span>
                          {sub.maxExtendedDays > 0 && (
                            <span className="font-medium" style={{ color: '#6B7280' }}>
                              Extended: {sub.skipDays.length}/{sub.maxExtendedDays}
                            </span>
                          )}
                        </div>

                        {/* Progress Bar - Compact */}
                        {isActive && (
                          <div className="mt-2">
                            <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                              <div 
                                className="h-full transition-all duration-500"
                                style={{ 
                                  backgroundColor: '#E11D48',
                                  width: `${progressPercentage}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <>
                        {/* Delivery Calendar - Compact */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold" style={{ color: '#0E1214' }}>Upcoming</h4>
                            <p className="text-xs" style={{ color: '#6B7280' }}>Tap to skip</p>
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                            {upcomingDates.map((delivery, idx) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const deliveryDate = new Date(delivery.date);
                              deliveryDate.setHours(0, 0, 0, 0);
                              const isPast = deliveryDate < today;
                              const isClickable = !isPast && delivery.status !== 'completed';
                              
                              // Check if this is the next pending delivery (highlighted in meal section)
                              const nextPendingDelivery = sub.deliveryProgress.find(d => 
                                d.status === 'pending' && new Date(d.date) >= today
                              );
                              const isNextDelivery = nextPendingDelivery && 
                                deliveryDate.getTime() === new Date(nextPendingDelivery.date).getTime();

                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    if (isClickable) {
                                      setSelectedSubscription(sub);
                                      handleCalendarDateClick(delivery.date);
                                    }
                                  }}
                                  disabled={!isClickable}
                                  className="flex-shrink-0 w-14 p-1.5 rounded-lg text-center transition-all"
                                  style={{
                                    backgroundColor: 
                                      isNextDelivery ? '#FEF3C7' :
                                      delivery.status === 'completed' ? '#D1FAE5' :
                                      delivery.status === 'skipped' ? '#FEE2E2' : '#F9FAFB',
                                    borderWidth: isNextDelivery ? '4px' : '1px',
                                    borderStyle: 'solid',
                                    borderColor:
                                      isNextDelivery ? '#F59E0B' :
                                      delivery.status === 'completed' ? '#059669' :
                                      delivery.status === 'skipped' ? '#DC2626' : '#E5E7EB',
                                    cursor: isClickable ? 'pointer' : 'default',
                                    opacity: isPast && delivery.status === 'pending' ? 0.5 : 1,
                                    boxShadow: isNextDelivery ? '0 0 0 4px rgba(245, 158, 11, 0.25), 0 6px 12px rgba(245, 158, 11, 0.4)' : 'none',
                                    transform: isNextDelivery ? 'scale(1.15)' : 'scale(1)',
                                    position: 'relative',
                                    zIndex: isNextDelivery ? 10 : 1
                                  }}
                                  onMouseEnter={(e: any) => {
                                    if (isClickable && !isNextDelivery) {
                                      e.currentTarget.style.borderColor = '#E11D48';
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                    } else if (isClickable && isNextDelivery) {
                                      e.currentTarget.style.transform = 'scale(1.20)';
                                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.35), 0 8px 16px rgba(245, 158, 11, 0.5)';
                                    }
                                  }}
                                  onMouseLeave={(e: any) => {
                                    if (isClickable && !isNextDelivery) {
                                      e.currentTarget.style.borderColor = 
                                        delivery.status === 'skipped' ? '#DC2626' : '#E5E7EB';
                                      e.currentTarget.style.transform = 'scale(1)';
                                    } else if (isNextDelivery) {
                                      e.currentTarget.style.transform = 'scale(1.15)';
                                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.25), 0 6px 12px rgba(245, 158, 11, 0.4)';
                                    }
                                  }}
                                >
                                  <div className="text-xs font-bold mb-1" style={{ 
                                    color: 
                                      isNextDelivery ? '#D97706' :
                                      delivery.status === 'completed' ? '#059669' :
                                      delivery.status === 'skipped' ? '#DC2626' : '#6B7280',
                                    fontSize: isNextDelivery ? '0.8rem' : '0.75rem'
                                  }}>
                                    {delivery.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).split(' ')[1]}
                                  </div>
                                  <div className="font-bold mb-1" style={{ 
                                    color: 
                                      isNextDelivery ? '#B45309' :
                                      delivery.status === 'completed' ? '#059669' :
                                      delivery.status === 'skipped' ? '#DC2626' : '#0E1214',
                                    fontSize: isNextDelivery ? '1.25rem' : '1.125rem'
                                  }}>
                                    {delivery.date.getDate()}
                                  </div>
                                  <div className="flex justify-center">
                                    {delivery.status === 'completed' && (
                                      <svg className="w-4 h-4" style={{ color: '#059669' }} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                    {delivery.status === 'skipped' && (
                                      <svg className="w-4 h-4" style={{ color: '#DC2626' }} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                    {delivery.status === 'pending' && (
                                      isNextDelivery ? (
                                        <svg className="w-5 h-5" style={{ color: '#D97706' }} fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                        </svg>
                                      ) : (
                                        <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: '#D1D5DB' }}></div>
                                      )
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Today's/Tomorrow's Meal (Only for Meal Plan) */}
                        {sub.type === 'meal-plan' && sub.dailyMenu && sub.dailyMenu.length > 0 && (() => {
                          // Find next pending delivery
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          const nextPendingDelivery = sub.deliveryProgress.find(d => 
                            d.status === 'pending' && new Date(d.date) >= today
                          );
                          
                          if (!nextPendingDelivery) return null;
                          
                          const deliveryDate = new Date(nextPendingDelivery.date);
                          deliveryDate.setHours(0, 0, 0, 0);
                          const isToday = deliveryDate.getTime() === today.getTime();
                          
                          // Check if customize is allowed (before 3:30 AM)
                          const now = new Date();
                          const deadlineTime = new Date(deliveryDate);
                          deadlineTime.setHours(3, 30, 0, 0); // 3:30 AM deadline
                          
                          const canCustomize = isToday ? now < deadlineTime : true;
                          const mealLabel = isToday ? "Today's Meal" : "Tomorrow's Meal";
                          
                          // Check if delivery has happened but meal not updated
                          const [startTime] = sub.deliverySlot.split(' - ');
                          const [hours, minutes] = startTime.split(':');
                          const isPM = startTime.includes('PM');
                          let deliveryHour = parseInt(hours);
                          if (isPM && deliveryHour !== 12) deliveryHour += 12;
                          if (!isPM && deliveryHour === 12) deliveryHour = 0;
                          
                          const deliveryDateTime = new Date(deliveryDate);
                          deliveryDateTime.setHours(deliveryHour, parseInt(minutes) || 0, 0, 0);
                          
                          const deliveryHappened = isToday && now > deliveryDateTime;
                          const mealUpdated = nextPendingDelivery.status === 'completed' || nextPendingDelivery.meal;
                          
                          return (
                            <div className="mb-3 p-3 rounded-lg border" style={{ backgroundColor: '#FFFBEB', borderColor: '#F59E0B' }}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" style={{ color: '#D97706' }} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                  </svg>
                                  <h4 className="text-xs font-bold" style={{ color: '#D97706' }}>
                                    {mealLabel}
                                  </h4>
                                  {isToday && (
                                    <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                                      Delivering {sub.deliverySlot.split(' - ')[0]}
                                    </span>
                                  )}
                                </div>
                                {deliveryHappened && !mealUpdated ? (
                                  <span className="text-xs font-semibold italic" style={{ color: '#92400E', opacity: 0.7 }}>
                                    Processing...
                                  </span>
                                ) : canCustomize ? (
                                  <button
                                    onClick={() => handleOpenMealModal(sub)}
                                    className="text-xs font-semibold underline transition-all"
                                    style={{ color: '#D97706' }}
                                    onMouseEnter={(e: any) => e.currentTarget.style.color = '#B45309'}
                                    onMouseLeave={(e: any) => e.currentTarget.style.color = '#D97706'}
                                  >
                                    Customize
                                  </button>
                                ) : (
                                  <span className="text-xs font-semibold" style={{ color: '#92400E', opacity: 0.5 }}>
                                    Deadline passed
                                  </span>
                                )}
                              </div>
                              
                              {deliveryHappened && !mealUpdated ? (
                                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                                  <p className="text-xs font-medium text-center" style={{ color: '#92400E' }}>
                                    Meal not updated yet... please wait
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <p className="text-xs font-medium leading-relaxed" style={{ color: '#78350F' }}>
                                    {(sub.dailyMenu[0].selectedItems || sub.dailyMenu[0].defaultItems).slice(0, 4).join(', ')}
                                    {(sub.dailyMenu[0].selectedItems || sub.dailyMenu[0].defaultItems).length > 4 && 
                                      ` +${(sub.dailyMenu[0].selectedItems || sub.dailyMenu[0].defaultItems).length - 4} more`
                                    }
                                  </p>
                                  <p className="text-xs mt-1.5 italic" style={{ color: '#92400E' }}>
                                    {sub.dailyMenu[0].selectedItems ? '✓ Customized' : 'Default menu'}
                                  </p>
                                </>
                              )}
                            </div>
                          );
                        })()}

                        {/* Action Buttons - Compact Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
                          {/* View Full Calendar */}
                          <button
                            onClick={() => handleOpenCalendar(sub)}
                            className="p-2 rounded-lg transition-all text-center border flex items-center justify-center gap-1"
                            style={{ backgroundColor: '#F9FAFB', color: '#374151', borderColor: '#E5E7EB' }}
                            onMouseEnter={(e: any) => {
                              e.currentTarget.style.backgroundColor = '#F3F4F6';
                              e.currentTarget.style.borderColor = '#E11D48';
                            }}
                            onMouseLeave={(e: any) => {
                              e.currentTarget.style.backgroundColor = '#F9FAFB';
                              e.currentTarget.style.borderColor = '#E5E7EB';
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-semibold">Calendar</span>
                          </button>

                          {/* Change Slot */}
                          <button
                            onClick={() => handleOpenSlotModal(sub)}
                            className="p-2 rounded-lg transition-all text-center border flex items-center justify-center gap-1"
                            style={{ backgroundColor: '#EEF2FF', color: '#6366F1', borderColor: '#6366F1' }}
                            onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#E0E7FF'}
                            onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#EEF2FF'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-semibold">Slot</span>
                          </button>

                          {/* Add-ons */}
                          <button
                            onClick={() => handleOpenAddonsModal(sub)}
                            className="p-2 rounded-lg transition-all text-center border flex items-center justify-center gap-1"
                            style={{ backgroundColor: '#DBEAFE', color: '#2563EB', borderColor: '#2563EB' }}
                            onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#BFDBFE'}
                            onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-xs font-semibold">Add-ons</span>
                          </button>
                        </div>

                        {/* Current Add-ons - Compact */}
                        {sub.addons.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap text-xs mb-3">
                            <span className="font-semibold" style={{ color: '#6B7280' }}>Add-ons:</span>
                            {sub.addons.map((addon, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: '#FEF2F2', color: '#E11D48' }}>
                                {addon.name} +₹{addon.price}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Paid Add-ons (Recently Added) */}
                        {sub.paidAddons && sub.paidAddons.length > 0 && (
                          <div className="p-3 rounded-lg border" style={{ backgroundColor: '#F0FDF4', borderColor: '#10B981' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4" style={{ color: '#10B981' }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-bold" style={{ color: '#10B981' }}>
                                Recently Added Add-ons
                              </span>
                            </div>
                            <div className="space-y-2">
                              {sub.paidAddons.map((addon, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="font-semibold" style={{ color: '#059669' }}>
                                    {addon.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                                      {addon.days} {addon.days === 1 ? 'day' : 'days'}
                                    </span>
                                    <span className="font-bold" style={{ color: '#059669' }}>
                                      ₹{addon.price}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Meal Selection Modal */}
        {showMealModal && selectedSubscription && selectedSubscription.dailyMenu && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowMealModal(false)}
          >
            <div 
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2" style={{ color: '#0E1214' }}>
                Tomorrow's Meal Selection
              </h3>
              <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
                Select {maxMealItems} items from the menu below
              </p>
              <div className="flex items-center gap-2 mb-4 p-2 rounded-lg" style={{ backgroundColor: '#EEF2FF' }}>
                <svg className="w-4 h-4" style={{ color: '#6366F1' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs font-semibold" style={{ color: '#6366F1' }}>
                  {selectedMealItems.length}/{maxMealItems} items selected • Deadline: {selectedSubscription.slotChangeDeadline} today
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {selectedSubscription.dailyMenu[0].defaultItems.map((item, idx) => {
                  const isSelected = selectedMealItems.includes(item);
                  const isDisabled = !isSelected && selectedMealItems.length >= maxMealItems;
                  
                  return (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      style={{ 
                        backgroundColor: isSelected ? '#FEF2F2' : '#F9FAFB',
                        borderColor: isSelected ? '#E11D48' : '#E5E7EB'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={(e) => handleMealItemToggle(item, e.target.checked)}
                        className="w-4 h-4"
                        style={{ accentColor: '#E11D48' }}
                      />
                      <span className="text-sm font-medium" style={{ color: '#0E1214' }}>{item}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 ml-auto" style={{ color: '#E11D48' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMealModal(false)}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all border"
                  style={{ backgroundColor: '#FFFFFF', color: '#6B7280', borderColor: '#E5E7EB' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                  onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMeal}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all"
                  style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#BE123C'}
                  onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#E11D48'}
                >
                  Save Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Skip Day Modal */}
        {showSkipModal && selectedSubscription && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowSkipModal(false)}
          >
            <div 
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                <svg className="w-8 h-8" style={{ color: '#D97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-center mb-2" style={{ color: '#0E1214' }}>
                Skip Tomorrow's Delivery?
              </h3>
              <p className="text-xs text-center mb-4" style={{ color: '#6B7280' }}>
                Your subscription will be extended by 1 day. You have {selectedSubscription.maxSkipDays - selectedSubscription.skipDays.length} skip days remaining.
              </p>
              <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: '#EEF2FF' }}>
                <p className="text-xs font-semibold" style={{ color: '#6366F1' }}>
                  💡 You can undo this skip later from the full calendar view
                </p>
              </div>
              <div className="p-3 rounded-lg mb-6" style={{ backgroundColor: '#FEF3C7' }}>
                <p className="text-xs font-semibold" style={{ color: '#D97706' }}>
                  New end date: {new Date(new Date(selectedSubscription.endDate).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipModal(false)}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all border"
                  style={{ backgroundColor: '#FFFFFF', color: '#6B7280', borderColor: '#E5E7EB' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                  onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSkip}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all"
                  style={{ backgroundColor: '#D97706', color: '#FFFFFF' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#B45309'}
                  onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#D97706'}
                >
                  Confirm Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Slot Change Modal */}
        {showSlotModal && selectedSubscription && (() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const nextPendingDelivery = selectedSubscription.deliveryProgress.find(d => 
            d.status === 'pending' && new Date(d.date) >= today
          );
          
          const deliveryDate = nextPendingDelivery ? new Date(nextPendingDelivery.date) : new Date();
          deliveryDate.setHours(0, 0, 0, 0);
          const isToday = deliveryDate.getTime() === today.getTime();
          const slotLabel = isToday ? "today's" : "tomorrow's";
          
          return (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              onClick={() => setShowSlotModal(false)}
            >
              <div 
                className="bg-white rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold mb-2" style={{ color: '#0E1214' }}>
                  Change Delivery Slot
                </h3>
                <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
                  Change slot before 3:30 AM for {slotLabel} delivery
                </p>

              <div className="mb-4">
                <label className="text-sm font-semibold mb-2 block" style={{ color: '#0E1214' }}>
                  Select New Slot
                </label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border text-sm font-medium"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214' }}
                >
                  <option value="7:00 AM - 8:00 AM">7:00 AM - 8:00 AM</option>
                  <option value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</option>
                  <option value="12:00 PM - 1:00 PM">12:00 PM - 1:00 PM</option>
                  <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                  <option value="7:00 PM - 8:00 PM">7:00 PM - 8:00 PM</option>
                  <option value="8:00 PM - 9:00 PM">8:00 PM - 9:00 PM</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold mb-2 block" style={{ color: '#0E1214' }}>
                  Apply Change To
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSlotChangeScope('tomorrow')}
                    className="px-4 py-3 rounded-lg font-semibold text-sm transition-all border"
                    style={{
                      backgroundColor: slotChangeScope === 'tomorrow' ? '#EEF2FF' : '#FFFFFF',
                      color: slotChangeScope === 'tomorrow' ? '#6366F1' : '#6B7280',
                      borderColor: slotChangeScope === 'tomorrow' ? '#6366F1' : '#E5E7EB'
                    }}
                  >
                    {isToday ? 'Today Only' : 'Tomorrow Only'}
                  </button>
                  <button
                    onClick={() => setSlotChangeScope('all')}
                    className="px-4 py-3 rounded-lg font-semibold text-sm transition-all border"
                    style={{
                      backgroundColor: slotChangeScope === 'all' ? '#EEF2FF' : '#FFFFFF',
                      color: slotChangeScope === 'all' ? '#6366F1' : '#6B7280',
                      borderColor: slotChangeScope === 'all' ? '#6366F1' : '#E5E7EB'
                    }}
                  >
                    All Days
                  </button>
                </div>
                <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
                  {slotChangeScope === 'tomorrow' 
                    ? `Change slot for ${slotLabel} delivery only` 
                    : 'Change slot for all remaining deliveries'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSlotModal(false)}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all border"
                  style={{ backgroundColor: '#FFFFFF', color: '#6B7280', borderColor: '#E5E7EB' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                  onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSlot}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all"
                  style={{ backgroundColor: '#6366F1', color: '#FFFFFF' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#4F46E5'}
                  onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#6366F1'}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
          );
        })()}

        {/* Add-ons Modal */}
        {showAddonsModal && selectedSubscription && selectedSubscription.availableAddons && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowAddonsModal(false)}
          >
            <div 
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>
                Add Extra Items
              </h3>

              {/* Add-ons List */}
              <div className="space-y-3 mb-4">
                {selectedSubscription.availableAddons.map((addon, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>{addon.name}</p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>₹{addon.price} per day</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddonQuantityChange(addon.name, -1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                        onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#FECACA'}
                        onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-sm font-bold w-6 text-center" style={{ color: '#0E1214' }}>
                        {selectedAddons[addon.name] || 0}
                      </span>
                      <button
                        onClick={() => handleAddonQuantityChange(addon.name, 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                        onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#A7F3D0'}
                        onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#D1FAE5'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Number of Days */}
              <div className="mb-4">
                <label className="text-sm font-semibold mb-2 block" style={{ color: '#0E1214' }}>
                  Add for how many days?
                </label>
                <div className="flex gap-2">
                  {[1, 3, 7].map(days => (
                    <button
                      key={days}
                      onClick={() => setAddonDays(days)}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all border"
                      style={{
                        backgroundColor: addonDays === days ? '#E11D48' : '#FFFFFF',
                        color: addonDays === days ? '#FFFFFF' : '#6B7280',
                        borderColor: addonDays === days ? '#E11D48' : '#E5E7EB'
                      }}
                    >
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: '#FEF2F2' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold" style={{ color: '#0E1214' }}>Total Amount</span>
                  <span className="text-xl font-bold" style={{ color: '#E11D48' }}>₹{calculateAddonTotal()}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddonsModal(false)}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all border"
                  style={{ backgroundColor: '#FFFFFF', color: '#6B7280', borderColor: '#E5E7EB' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                  onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayAddons}
                  disabled={calculateAddonTotal() === 0}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                  onMouseEnter={(e: any) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#BE123C')}
                  onMouseLeave={(e: any) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#E11D48')}
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full Calendar Modal */}
        {showCalendarModal && selectedSubscription && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowCalendarModal(false)}
          >
            <div 
              className="bg-white rounded-2xl p-3 sm:p-4 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="text-sm sm:text-base font-bold truncate" style={{ color: '#0E1214' }}>
                    Delivery Calendar - {selectedSubscription.productName}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                    {selectedSubscription.completedDeliveries}/{selectedSubscription.deliveryCount} deliveries • 
                    Skip: {selectedSubscription.skipDays.length}/{selectedSubscription.maxSkipDays}
                  </p>
                </div>
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                  onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#D1FAE5', border: '1.5px solid #059669' }}></div>
                  <span style={{ color: '#6B7280' }}>Completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FEE2E2', border: '1.5px solid #DC2626' }}></div>
                  <span style={{ color: '#6B7280' }}>Skipped</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#DBEAFE', border: '1.5px solid #2563EB' }}></div>
                  <span style={{ color: '#6B7280' }}>Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #E5E7EB' }}></div>
                  <span style={{ color: '#6B7280' }}>Upcoming</span>
                </div>
              </div>

              {/* Calendar Grid - Using start-date page style */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                {selectedSubscription.deliveryProgress.map((delivery, idx) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const deliveryDate = new Date(delivery.date);
                  deliveryDate.setHours(0, 0, 0, 0);
                  const isToday = deliveryDate.getTime() === today.getTime();
                  const isPast = deliveryDate < today;
                  const isFuture = deliveryDate > today;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleCalendarDateClick(delivery.date)}
                      disabled={delivery.status === 'completed' || isPast}
                      className="p-2 rounded-lg border transition-all relative disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: 
                          delivery.status === 'completed' ? '#D1FAE5' :
                          delivery.status === 'skipped' ? '#FEE2E2' :
                          isToday ? '#DBEAFE' : '#FFFFFF',
                        borderColor: 
                          delivery.status === 'completed' ? '#059669' :
                          delivery.status === 'skipped' ? '#DC2626' :
                          isToday ? '#2563EB' : '#E5E7EB',
                        cursor: delivery.status === 'completed' || isPast ? 'not-allowed' : 'pointer',
                        opacity: isPast && delivery.status === 'pending' ? 0.5 : 1
                      }}
                      onMouseEnter={(e: any) => {
                        if (delivery.status !== 'completed' && !isPast) {
                          e.currentTarget.style.borderColor = '#E11D48';
                        }
                      }}
                      onMouseLeave={(e: any) => {
                        if (delivery.status !== 'completed' && !isPast) {
                          e.currentTarget.style.borderColor = 
                            delivery.status === 'skipped' ? '#DC2626' :
                            isToday ? '#2563EB' : '#E5E7EB';
                        }
                      }}
                    >
                      <div className="text-center">
                        {/* Weekday */}
                        <p className="text-xs font-medium mb-0.5" style={{ 
                          color: 
                            delivery.status === 'completed' ? '#059669' :
                            delivery.status === 'skipped' ? '#DC2626' :
                            isToday ? '#2563EB' : '#6B7280'
                        }}>
                          {deliveryDate.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        
                        {/* Date */}
                        <p className="text-lg sm:text-xl md:text-2xl font-bold mb-0.5" style={{ 
                          color: 
                            delivery.status === 'completed' ? '#059669' :
                            delivery.status === 'skipped' ? '#DC2626' :
                            isToday ? '#2563EB' : '#0E1214'
                        }}>
                          {deliveryDate.getDate()}
                        </p>
                        
                        {/* Month */}
                        <p className="text-xs mb-1" style={{ 
                          color: 
                            delivery.status === 'completed' ? '#059669' :
                            delivery.status === 'skipped' ? '#DC2626' :
                            isToday ? '#2563EB' : '#6B7280'
                        }}>
                          {deliveryDate.toLocaleDateString('en-US', { month: 'short' })}
                        </p>

                        {/* Status Icon */}
                        {delivery.status === 'completed' && (
                          <div className="flex justify-center mb-0.5">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#059669' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {delivery.status === 'skipped' && (
                          <div className="flex justify-center mb-0.5">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#DC2626' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}

                        {/* Status Text */}
                        {delivery.status === 'completed' && (
                          <p className="text-xs font-semibold hidden sm:block" style={{ color: '#059669' }}>
                            Delivered
                          </p>
                        )}
                        {delivery.status === 'skipped' && !isPast && (
                          <p className="text-xs font-semibold hidden sm:block" style={{ color: '#DC2626' }}>
                            Undo Skip
                          </p>
                        )}
                        {delivery.status === 'skipped' && isPast && (
                          <p className="text-xs font-semibold hidden sm:block" style={{ color: '#DC2626' }}>
                            Skipped
                          </p>
                        )}
                        {delivery.status === 'pending' && isFuture && (
                          <p className="text-xs font-semibold hidden sm:block" style={{ color: '#6B7280' }}>
                            Click to skip
                          </p>
                        )}
                        {isToday && delivery.status === 'pending' && (
                          <p className="text-xs font-semibold" style={{ color: '#2563EB' }}>
                            Today
                          </p>
                        )}
                      </div>

                      {/* Click to view details tooltip for completed */}
                      {delivery.status === 'completed' && (delivery.meal || (delivery.addonsForDay && delivery.addonsForDay.length > 0)) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E11D48' }}>
                          <svg className="w-2 h-2" style={{ color: '#FFFFFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instructions */}
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: '#E11D48' }}>
                  📌 Quick Tips:
                </p>
                <ul className="space-y-0.5 text-xs" style={{ color: '#6B7280' }}>
                  <li>• Click upcoming dates to skip delivery</li>
                  <li>• Click skipped dates to undo skip</li>
                  <li>• {selectedSubscription.maxSkipDays - selectedSubscription.skipDays.length} skip days remaining</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Details Modal */}
        {showDeliveryDetailsModal && selectedDelivery && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowDeliveryDetailsModal(false)}
          >
            <div 
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: '#E5E7EB' }}>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: '#0E1214' }}>
                    Delivery Details
                  </h3>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                    {new Date(selectedDelivery.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setShowDeliveryDetailsModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                  onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
                <svg className="w-5 h-5" style={{ color: '#059669' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold" style={{ color: '#059669' }}>
                  Successfully Delivered
                </span>
              </div>

              {/* Meal Details */}
              {selectedDelivery.meal && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold mb-2" style={{ color: '#0E1214' }}>
                    Meal Items
                  </h4>
                  <div className="space-y-2">
                    {selectedDelivery.meal.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#059669' }}></div>
                        <span className="text-sm" style={{ color: '#374151' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {selectedDelivery.addonsForDay && selectedDelivery.addonsForDay.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold mb-2" style={{ color: '#0E1214' }}>
                    Add-ons
                  </h4>
                  <div className="space-y-2">
                    {selectedDelivery.addonsForDay.map((addon: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
                        <span className="text-sm font-medium" style={{ color: '#E11D48' }}>{addon.name}</span>
                        <span className="text-sm font-bold" style={{ color: '#E11D48' }}>+₹{addon.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowDeliveryDetailsModal(false)}
                className="w-full py-3 rounded-lg font-semibold text-sm transition-all"
                style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#BE123C'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#E11D48'}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div 
            className="fixed top-6 right-6 z-[60] animate-slide-in-right"
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            <div 
              className="flex items-start gap-3 p-4 rounded-xl shadow-2xl max-w-md"
              style={{
                backgroundColor: '#FFFFFF',
                border: `2px solid ${
                  toastType === 'success' ? '#059669' :
                  toastType === 'error' ? '#DC2626' :
                  toastType === 'warning' ? '#D97706' :
                  '#2563EB'
                }`
              }}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {toastType === 'success' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                    <svg className="w-5 h-5" style={{ color: '#059669' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {toastType === 'error' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                    <svg className="w-5 h-5" style={{ color: '#DC2626' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {toastType === 'warning' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                    <svg className="w-5 h-5" style={{ color: '#D97706' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {toastType === 'info' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                    <svg className="w-5 h-5" style={{ color: '#2563EB' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ 
                  color: 
                    toastType === 'success' ? '#059669' :
                    toastType === 'error' ? '#DC2626' :
                    toastType === 'warning' ? '#D97706' :
                    '#2563EB'
                }}>
                  {toastMessage}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowToast(false)}
                className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Floating Cart */}
        <FloatingCart 
          externalShowModal={showCartModal}
          onModalClose={() => setShowCartModal(false)}
          onFloatingButtonClick={() => setShowCartModal(true)}
        />
      </div>
    </ProtectedRoute>
  );
}
