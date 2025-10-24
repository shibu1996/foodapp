'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';

const AVAILABLE_MEALS = [
  { id: 'dal-makhani', name: 'Dal Makhani' },
  { id: 'rajma', name: 'Rajma' },
  { id: 'chole', name: 'Chole' },
  { id: 'paneer', name: 'Paneer Sabzi' },
  { id: 'mix-veg', name: 'Mix Veg' },
  { id: 'aloo-gobi', name: 'Aloo Gobi' },
];

interface DailyMeal {
  date: string;
  mealId: string;
  isSkipped: boolean;
}

export default function MealsPage() {
  const router = useRouter();
  const { state, updateState } = useSubscription();
  const [dailyMeals, setDailyMeals] = useState<DailyMeal[]>(state.dailyMeals || []);
  const [selectedMealForAll, setSelectedMealForAll] = useState('');

  // Generate dates for subscription period
  const generateDates = () => {
    const dates = [];
    const startDate = new Date(state.startDate);
    
    for (let i = 0; i < state.duration; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const subscriptionDates = generateDates();

  // Initialize meals if empty
  useEffect(() => {
    if (dailyMeals.length === 0) {
      const initialMeals = subscriptionDates.map(date => ({
        date,
        mealId: '',
        isSkipped: false
      }));
      setDailyMeals(initialMeals);
    }
  }, []);

  const updateMeal = (date: string, mealId: string) => {
    setDailyMeals(prev => 
      prev.map(meal => 
        meal.date === date ? { ...meal, mealId } : meal
      )
    );
  };

  const toggleSkip = (date: string) => {
    setDailyMeals(prev => 
      prev.map(meal => 
        meal.date === date ? { ...meal, isSkipped: !meal.isSkipped, mealId: meal.isSkipped ? meal.mealId : '' } : meal
      )
    );
  };

  const applyToAll = () => {
    if (!selectedMealForAll) {
      alert('Please select a meal first');
      return;
    }
    
    setDailyMeals(prev => 
      prev.map(meal => 
        meal.isSkipped ? meal : { ...meal, mealId: selectedMealForAll }
      )
    );
  };

  const handleNext = () => {
    // Validation
    const nonSkippedDays = dailyMeals.filter(m => !m.isSkipped);
    const unselectedDays = nonSkippedDays.filter(m => !m.mealId);
    
    if (unselectedDays.length > 0) {
      alert(`Please select meals for all days or mark them as skipped. ${unselectedDays.length} day(s) remaining.`);
      return;
    }

    const skippedCount = dailyMeals.filter(m => m.isSkipped).length;
    if (state.skipEnabled && skippedCount > state.maxSkips) {
      alert(`You can only skip up to ${state.maxSkips} days. Currently ${skippedCount} days are marked as skipped.`);
      return;
    }

    const skipDates = dailyMeals.filter(m => m.isSkipped).map(m => m.date);
    updateState({ 
      dailyMeals,
      skipDates
    });

    router.push('/food/subscribe/summary');
  };

  const selectedCount = dailyMeals.filter(m => !m.isSkipped && m.mealId).length;
  const skippedCount = dailyMeals.filter(m => m.isSkipped).length;
  const totalDays = subscriptionDates.length;

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step 6 of 9</span>
            <span className="text-sm text-gray-500">Daily Meals</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Meals for Each Day</h1>
          <p className="text-gray-600">Choose what you'd like to eat each day</p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-xl p-4 mb-6 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="font-bold text-gray-800">{selectedCount} of {totalDays - skippedCount} days selected</p>
            </div>
            {skippedCount > 0 && (
              <div>
                <p className="text-sm text-gray-500">Skipped Days</p>
                <p className="font-bold text-orange-600">{skippedCount} day(s)</p>
              </div>
            )}
            <div className="text-right">
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="font-bold text-primary">{totalDays - skippedCount - selectedCount} day(s)</p>
            </div>
          </div>
        </div>

        {/* Quick Fill */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 mb-6 border border-teal-200">
          <h3 className="font-semibold text-teal-900 mb-3">Quick Fill - Same Meal for All Days</h3>
          <div className="flex gap-3">
            <select
              value={selectedMealForAll}
              onChange={(e) => setSelectedMealForAll(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-teal-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
            >
              <option value="">Choose a meal...</option>
              {AVAILABLE_MEALS.map(meal => (
                <option key={meal.id} value={meal.id}>{meal.name}</option>
              ))}
            </select>
            <button
              onClick={applyToAll}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700"
            >
              Apply to All
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {subscriptionDates.map((dateStr, index) => {
            const meal = dailyMeals.find(m => m.date === dateStr);
            const displayDate = formatDisplayDate(dateStr);
            const isSkipped = meal?.isSkipped || false;
            const selectedMeal = meal?.mealId || '';
            const mealName = AVAILABLE_MEALS.find(m => m.id === selectedMeal)?.name;

            return (
              <div
                key={dateStr}
                className={`bg-white rounded-xl border-2 overflow-hidden ${
                  isSkipped 
                    ? 'border-gray-300 opacity-60' 
                    : selectedMeal 
                    ? 'border-green-500' 
                    : 'border-gray-200'
                }`}
              >
                {/* Date Header */}
                <div className={`p-3 text-center ${
                  isSkipped ? 'bg-gray-100' : 'bg-gradient-to-r from-orange-50 to-teal-50'
                }`}>
                  <p className="text-xs text-gray-500">{displayDate.weekday}</p>
                  <p className="text-2xl font-bold text-gray-800">{displayDate.day}</p>
                  <p className="text-xs text-gray-500">{displayDate.month}</p>
                </div>

                {/* Meal Selection */}
                <div className="p-4">
                  {isSkipped ? (
                    <div className="text-center mb-3">
                      <p className="text-sm font-semibold text-gray-500">Skipped</p>
                    </div>
                  ) : (
                    <select
                      value={selectedMeal}
                      onChange={(e) => updateMeal(dateStr, e.target.value)}
                      className={`w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none mb-2 ${
                        selectedMeal 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select meal...</option>
                      {AVAILABLE_MEALS.map(meal => (
                        <option key={meal.id} value={meal.id}>{meal.name}</option>
                      ))}
                    </select>
                  )}

                  {/* Skip Toggle */}
                  {state.skipEnabled && (
                    <button
                      onClick={() => toggleSkip(dateStr)}
                      className={`w-full py-2 rounded-lg text-xs font-medium transition ${
                        isSkipped 
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isSkipped ? 'Undo Skip' : 'Skip Day'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">Tips</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Use "Quick Fill" to select the same meal for all days, then customize individual days</li>
            <li>• Green border means meal is selected for that day</li>
            {state.skipEnabled && (
              <li>• You can skip up to {state.maxSkips} day(s) - skipped days won't be charged</li>
            )}
            <li>• You can change meal selections after subscription (24 hours before delivery)</li>
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
            disabled={selectedCount < totalDays - skippedCount}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Review Summary
          </button>
        </div>
      </div>
    </div>
  );
}


