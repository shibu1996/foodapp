'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';
import { FoodHeader } from '@/app/components/FoodHeader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TimeSlot {
  _id: string;
  label: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  isActive: boolean;
  order: number;
}

export default function TimeSlotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, updateState } = useSubscription();
  const isEditMode = searchParams?.get('editSchedule') === 'true'; // Check if editing schedule
  const [selectedSlot, setSelectedSlot] = useState(state.deliverySlot || '');
  const [user, setUser] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load time slots from API
  useEffect(() => {
    const loadTimeSlots = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/food/time-slots/active`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setTimeSlots(data.data);
          }
        }
      } catch (error) {
        console.error('❌ Error loading time slots:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimeSlots();
  }, []);

  // Convert 24-hour time to 12-hour format
  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Get icon based on time
  const getTimeIcon = (startTime: string) => {
    const hours = parseInt(startTime.split(':')[0]);
    if (hours >= 6 && hours < 9) return '🌅'; // Early Morning
    if (hours >= 9 && hours < 12) return '☀️'; // Morning
    if (hours >= 12 && hours < 15) return '🌤️'; // Afternoon
    if (hours >= 15 && hours < 18) return '🌆'; // Evening
    if (hours >= 18 && hours < 21) return '🌇'; // Late Evening
    return '🌙'; // Night
  };

  const handleNext = () => {
    if (!selectedSlot) {
      alert('Please select a delivery time slot');
      return;
    }

    updateState({ deliverySlot: selectedSlot });
    
    // Navigate based on mode
    if (isEditMode) {
      console.log('🎯 Edit Mode - Navigating back to summary');
      router.push('/food/subscribe/summary');
    } else {
      console.log('🎯 Regular Mode - Navigating to skip-rules');
      router.push('/food/subscribe/skip-rules');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <FoodHeader 
        user={user}
        showLocation={false}
        showSearch={false}
        showCart={false}
        onLogout={() => {
          localStorage.clear();
          router.push('/auth');
        }}
        centerTitle="New Subscription"
      />

      {/* Progress Bar */}
      <div className="bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Step 3 of 6</span>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Delivery Time</span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#E5E7EB' }}>
            <div className="h-1.5 rounded-full" style={{ width: '50%', backgroundColor: '#E11D48' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
            {isEditMode ? 'Update Your Delivery Time' : 'Choose Your Delivery Time'}
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {isEditMode ? 'Change when you want your meal delivered daily' : 'Select when you want your meal delivered daily'}
          </p>
        </div>

        {/* Current Selection Summary */}
        <div className="bg-white rounded-xl p-4 mb-6 border" style={{ borderColor: '#E5E7EB' }}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs" style={{ color: '#6B7280' }}>Selected Plan</p>
                <p className="font-bold text-base mt-1" style={{ color: '#0E1214' }}>{state.duration} Days Subscription</p>
              </div>
              <button
                onClick={() => router.push('/food/subscribe/duration')}
                className="text-xs font-semibold transition-colors"
                style={{ color: '#E11D48' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#BE123C'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#E11D48'}
              >
                Change
              </button>
            </div>
            
            {state.startDate && (
              <div className="pt-3 border-t" style={{ borderColor: '#E5E7EB' }}>
                <p className="text-xs" style={{ color: '#6B7280' }}>Start Date</p>
                <p className="font-semibold text-sm mt-1" style={{ color: '#0E1214' }}>
                  {new Date(state.startDate).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Time Slot Options */}
        <div className="space-y-3 mb-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#E11D48' }}></div>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border" style={{ borderColor: '#E5E7EB' }}>
              <div className="text-5xl mb-3">🕐</div>
              <h3 className="text-base font-semibold mb-1" style={{ color: '#0E1214' }}>No Time Slots Available</h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Please contact support or try again later
              </p>
            </div>
          ) : (
            timeSlots.map((slot) => {
              const timeDisplay = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
              const isSelected = selectedSlot === timeDisplay;
              return (
                <button
                  key={slot._id}
                  onClick={() => setSelectedSlot(timeDisplay)}
                  className="w-full p-4 rounded-xl border-2 transition text-left"
                  style={{
                    borderColor: isSelected ? '#E11D48' : '#E5E7EB',
                    backgroundColor: isSelected ? '#FEF2F2' : '#FFFFFF'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = '#FEE2E2';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: isSelected ? '#E11D48' : '#D1D5DB',
                        backgroundColor: isSelected ? '#E11D48' : 'transparent'
                      }}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    
                    <span className="text-2xl">{getTimeIcon(slot.startTime)}</span>
                    
                    <div className="flex-1">
                      <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>{slot.label}</h3>
                      <p className="text-xs" style={{ color: '#6B7280' }}>{timeDisplay} • Daily delivery</p>
                    </div>

                    {isSelected && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}>
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Info Card */}
        <div className="rounded-xl p-4 mb-6 border" style={{ backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }}>
          <h4 className="font-semibold text-sm mb-2" style={{ color: '#1E40AF' }}>Delivery Information</h4>
          <ul className="space-y-1 text-xs" style={{ color: '#1E3A8A' }}>
            <li>• Fresh food prepared daily</li>
            <li>• Delivered within your selected time window</li>
            <li>• Call us if you need to change delivery time</li>
            <li>• Contactless delivery available</li>
          </ul>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {!isEditMode && (
            <button
              onClick={() => router.push('/food/subscribe/start-date')}
              className="px-5 py-2.5 border-2 rounded-lg font-semibold text-sm transition-all"
              style={{ borderColor: '#E5E7EB', color: '#374151', backgroundColor: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!selectedSlot}
            className="flex-1 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
            onMouseEnter={(e) => {
              if (selectedSlot) e.currentTarget.style.backgroundColor = '#BE123C';
            }}
            onMouseLeave={(e) => {
              if (selectedSlot) e.currentTarget.style.backgroundColor = '#E11D48';
            }}
          >
            {isEditMode ? 'Update Delivery Time' : 'Next: Skip Rules'}
          </button>
        </div>
      </div>
    </div>
  );
}

