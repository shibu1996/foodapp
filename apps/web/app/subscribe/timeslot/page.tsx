'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';

const TIME_SLOTS = [
  { id: 'slot1', time: '12:00 PM - 1:00 PM', icon: '🌅' },
  { id: 'slot2', time: '1:00 PM - 2:00 PM', icon: '☀️' },
  { id: 'slot3', time: '2:00 PM - 3:00 PM', icon: '🌤️' },
];

export default function TimeSlotPage() {
  const router = useRouter();
  const { state, updateState } = useSubscription();
  const [selectedSlot, setSelectedSlot] = useState(state.deliverySlot || '');

  const handleNext = () => {
    if (!selectedSlot) {
      alert('Please select a delivery time slot');
      return;
    }

    updateState({ deliverySlot: selectedSlot });
    router.push('/subscribe/start-date');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step 2 of 9</span>
            <span className="text-sm text-gray-500">Delivery Time</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '22.2%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Delivery Time</h1>
          <p className="text-gray-600">Select when you want your meal delivered daily</p>
        </div>

        {/* Current Selection Summary */}
        <div className="bg-white rounded-xl p-4 mb-6 border-2 border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Selected Plan</p>
              <p className="font-bold text-gray-800">{state.duration} Days Subscription</p>
            </div>
            <button
              onClick={() => router.push('/subscribe/duration')}
              className="text-sm text-primary hover:underline"
            >
              Change
            </button>
          </div>
        </div>

        {/* Time Slot Options */}
        <div className="space-y-4 mb-8">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot.time)}
              className={`w-full p-6 rounded-xl border-2 transition text-left ${
                selectedSlot === slot.time
                  ? 'border-primary bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedSlot === slot.time
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {selectedSlot === slot.time && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                
                <span className="text-4xl">{slot.icon}</span>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{slot.time}</h3>
                  <p className="text-sm text-gray-600">Daily delivery at this time</p>
                </div>

                {selectedSlot === slot.time && (
                  <span className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                    Selected
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">Delivery Information</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Fresh food prepared daily</li>
            <li>• Delivered within your selected time window</li>
            <li>• Call us if you need to change delivery time</li>
            <li>• Contactless delivery available</li>
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
            disabled={!selectedSlot}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Select Start Date
          </button>
        </div>
      </div>
    </div>
  );
}

