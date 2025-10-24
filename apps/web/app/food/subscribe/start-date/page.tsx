'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';

export default function StartDatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, updateState } = useSubscription();
  const isEditMode = searchParams?.get('editSchedule') === 'true'; // Check if editing schedule
  const [selectedDate, setSelectedDate] = useState(state.startDate || '');

  // Generate next 7 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDisplayDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const calculateEndDate = (startDate: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + state.duration - 1);
    return end.toISOString().split('T')[0];
  };

  const handleNext = () => {
    if (!selectedDate) {
      alert('Please select a start date');
      return;
    }

    const endDate = calculateEndDate(selectedDate);
    updateState({ 
      startDate: selectedDate,
      endDate: endDate
    });

    // Navigate based on mode
    if (isEditMode) {
      console.log('🎯 Edit Mode - Navigating to timeslot with edit mode');
      router.push('/food/subscribe/timeslot?editSchedule=true');
    } else {
      console.log('🎯 Regular Mode - Navigating to timeslot');
      router.push('/food/subscribe/timeslot');
    }
  };

  const availableDates = getAvailableDates();
  const endDateDisplay = selectedDate ? calculateEndDate(selectedDate) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Progress Bar */}
      <div className="bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Step 2 of 9</span>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Start Date</span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#E5E7EB' }}>
            <div className="h-1.5 rounded-full" style={{ width: '22.2%', backgroundColor: '#E11D48' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
            {isEditMode ? 'Update Your Start Date' : 'Select Your Start Date'}
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {isEditMode ? 'Change when your subscription begins' : 'Choose when you want your subscription to begin'}
          </p>
        </div>

        {/* Current Selection Summary */}
        <div className="bg-white rounded-xl p-4 mb-6 border" style={{ borderColor: '#E5E7EB' }}>
          <div>
            <p className="text-xs" style={{ color: '#6B7280' }}>Selected Plan</p>
            <p className="font-bold text-base mt-1" style={{ color: '#0E1214' }}>{state.duration} Days Subscription</p>
          </div>
        </div>

        {/* Calendar - Date Selection */}
        <div className="bg-white rounded-xl p-5 mb-6 border" style={{ borderColor: '#E5E7EB' }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: '#0E1214' }}>Available Start Dates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableDates.map((date) => {
              const dateStr = formatDate(date);
              const isSelected = selectedDate === dateStr;
              
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className="p-3 rounded-xl border-2 transition"
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
                  <div className="text-center">
                    <p className="text-xs font-medium mb-1"
                      style={{ color: isSelected ? '#E11D48' : '#6B7280' }}
                    >
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-xl font-bold"
                      style={{ color: isSelected ? '#E11D48' : '#0E1214' }}
                    >
                      {date.getDate()}
                    </p>
                    <p className="text-xs mt-1"
                      style={{ color: isSelected ? '#E11D48' : '#6B7280' }}
                    >
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* End Date Display */}
        {selectedDate && endDateDisplay && (
          <div className="rounded-xl p-4 mb-6 border" style={{ background: 'linear-gradient(to right, #F0FDF4, #ECFDF5)', borderColor: '#BBF7D0' }}>
            <div>
              <p className="text-xs mb-1" style={{ color: '#15803D' }}>Your subscription will start on</p>
              <p className="text-base font-bold" style={{ color: '#166534' }}>
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #BBF7D0' }}>
              <p className="text-xs mb-1" style={{ color: '#15803D' }}>And end on</p>
              <p className="text-sm font-bold" style={{ color: '#166534' }}>
                {new Date(endDateDisplay).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs mt-2" style={{ color: '#16A34A' }}>
                Total {state.duration} days of delicious meals!
              </p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="rounded-xl p-4 mb-6 border" style={{ backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }}>
          <h4 className="font-semibold text-sm mb-2" style={{ color: '#1E40AF' }}>Important Notes</h4>
          <ul className="space-y-1 text-xs" style={{ color: '#1E3A8A' }}>
            <li>• First delivery will be on your selected start date</li>
            <li>• You can pause or skip days after subscription starts</li>
            <li>• Delivery time: {state.deliverySlot}</li>
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
            disabled={!selectedDate}
            className="flex-1 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
            onMouseEnter={(e) => {
              if (selectedDate) e.currentTarget.style.backgroundColor = '#BE123C';
            }}
            onMouseLeave={(e) => {
              if (selectedDate) e.currentTarget.style.backgroundColor = '#E11D48';
            }}
          >
            {isEditMode ? 'Update Delivery Date' : 'Next: Skip Days Option'}
          </button>
        </div>
      </div>
    </div>
  );
}

