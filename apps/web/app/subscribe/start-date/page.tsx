'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';

export default function StartDatePage() {
  const router = useRouter();
  const { state, updateState } = useSubscription();
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

    router.push('/subscribe/skip-rules');
  };

  const availableDates = getAvailableDates();
  const endDateDisplay = selectedDate ? calculateEndDate(selectedDate) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step 3 of 9</span>
            <span className="text-sm text-gray-500">Start Date</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '33.3%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Your Start Date</h1>
          <p className="text-gray-600">Choose when you want your subscription to begin</p>
        </div>

        {/* Current Selection Summary */}
        <div className="bg-white rounded-xl p-4 mb-6 border-2 border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-bold text-gray-800">{state.duration} Days</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivery Time</p>
              <p className="font-bold text-gray-800">{state.deliverySlot}</p>
            </div>
          </div>
        </div>

        {/* Calendar - Date Selection */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Start Dates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableDates.map((date) => {
              const dateStr = formatDate(date);
              const isSelected = selectedDate === dateStr;
              
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-4 rounded-xl border-2 transition ${
                    isSelected
                      ? 'border-primary bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <p className={`text-xs font-medium mb-1 ${
                      isSelected ? 'text-primary' : 'text-gray-500'
                    }`}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-2xl font-bold ${
                      isSelected ? 'text-primary' : 'text-gray-800'
                    }`}>
                      {date.getDate()}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isSelected ? 'text-primary' : 'text-gray-500'
                    }`}>
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
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 mb-6 border border-teal-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-700 mb-1">Your subscription will start on</p>
                <p className="text-xl font-bold text-teal-900">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-teal-200">
              <p className="text-sm text-teal-700 mb-1">And end on</p>
              <p className="text-lg font-bold text-teal-900">
                {new Date(endDateDisplay).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-teal-600 mt-2">
                Total {state.duration} days of delicious meals!
              </p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">Important Notes</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• First delivery will be on your selected start date</li>
            <li>• You can pause or skip days after subscription starts</li>
            <li>• Delivery time: {state.deliverySlot}</li>
          </ul>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedDate}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Skip Days Option
          </button>
        </div>
      </div>
    </div>
  );
}

