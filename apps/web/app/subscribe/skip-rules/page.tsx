'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';

export default function SkipRulesPage() {
  const router = useRouter();
  const { state, updateState } = useSubscription();
  const [skipEnabled, setSkipEnabled] = useState(state.skipEnabled || false);

  const handleNext = () => {
    updateState({ skipEnabled });
    router.push('/subscribe/addons');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step 4 of 9</span>
            <span className="text-sm text-gray-500">Skip Days</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '44.4%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Skip Days Option</h1>
          <p className="text-gray-600">Decide if you want the flexibility to skip days</p>
        </div>

        {/* Skip Info Card */}
        <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Skip Allowance</h3>
          
          <div className="bg-gradient-to-r from-orange-50 to-teal-50 rounded-lg p-6 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">With your {state.duration}-day plan, you can skip</p>
              <p className="text-5xl font-bold text-primary mb-2">{state.maxSkips}</p>
              <p className="text-lg text-gray-700">day{state.maxSkips !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <span className="text-green-600 mt-1">✓</span>
              <p>Skip days when you're traveling or don't need food</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <span className="text-green-600 mt-1">✓</span>
              <p>No charges for skipped days</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <span className="text-green-600 mt-1">✓</span>
              <p>You can select which days to skip in the next step</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <span className="text-green-600 mt-1">✓</span>
              <p>Subscription duration extends automatically for skipped days</p>
            </div>
          </div>
        </div>

        {/* Toggle Option */}
        <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
          <button
            onClick={() => setSkipEnabled(!skipEnabled)}
            className={`w-full p-6 rounded-xl border-2 transition ${
              skipEnabled
                ? 'border-primary bg-orange-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {skipEnabled ? 'Skipping Enabled' : 'Enable Skip Days'}
                </h3>
                <p className="text-sm text-gray-600">
                  {skipEnabled 
                    ? `You can skip up to ${state.maxSkips} day${state.maxSkips !== 1 ? 's' : ''} during your subscription`
                    : 'Tap to enable the ability to skip days'
                  }
                </p>
              </div>
              
              <div className={`w-16 h-8 rounded-full transition relative ${
                skipEnabled ? 'bg-primary' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  skipEnabled ? 'translate-x-9' : 'translate-x-1'
                }`}></div>
              </div>
            </div>
          </button>
        </div>

        {/* Examples */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-blue-900 mb-3">How Skip Days Work</h4>
          
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-1">Example 1: Weekend Trip</p>
              <p className="text-sm text-gray-600">
                Going away for 2 days? Skip Saturday & Sunday. Your subscription automatically extends by 2 days.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-1">Example 2: Special Occasion</p>
              <p className="text-sm text-gray-600">
                Having a party at home? Skip that day and we won't deliver. No charges, no waste!
              </p>
            </div>
          </div>
        </div>

        {/* Info Note */}
        {!skipEnabled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> If you don't enable skip days now, you won't be able to skip any deliveries during your subscription period.
            </p>
          </div>
        )}

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
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark"
          >
            Next: Add-ons
          </button>
        </div>
      </div>
    </div>
  );
}

