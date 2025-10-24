'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';

const TIME_SLOTS = [
  { id: 'slot1', time: '12:00 PM - 1:00 PM', icon: '🌅' },
  { id: 'slot2', time: '1:00 PM - 2:00 PM', icon: '☀️' },
  { id: 'slot3', time: '2:00 PM - 3:00 PM', icon: '🌤️' },
];

export default function TimeSlotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, updateState } = useSubscription();
  const isEditMode = searchParams?.get('editSchedule') === 'true'; // Check if editing schedule
  const [selectedSlot, setSelectedSlot] = useState(state.deliverySlot || '');

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
      {/* Progress Bar */}
      <div className="bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Step 3 of 9</span>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Delivery Time</span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#E5E7EB' }}>
            <div className="h-1.5 rounded-full" style={{ width: '33.3%', backgroundColor: '#E11D48' }}></div>
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
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedSlot === slot.time;
            return (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot.time)}
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
                
                <span className="text-2xl">{slot.icon}</span>
                
                <div className="flex-1">
                  <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>{slot.time}</h3>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Daily delivery at this time</p>
                </div>

                {isSelected && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}>
                    Selected
                  </span>
                )}
              </div>
            </button>
          );
          })}
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
              onClick={() => router.back()}
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
            {isEditMode ? 'Update Delivery Time' : 'Next: Select Start Date'}
          </button>
        </div>
      </div>
    </div>
  );
}

