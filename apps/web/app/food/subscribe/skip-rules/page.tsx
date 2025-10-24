'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';

export default function SkipRulesPage() {
  const router = useRouter();
  const { state, updateState } = useSubscription();
  const [selectedSkipDays, setSelectedSkipDays] = useState<string[]>(state.skipDates || []);
  const [skipLater, setSkipLater] = useState(false); // User wants to skip selection for now
  const [calendarDays, setCalendarDays] = useState<Array<{
    date: Date;
    dateString: string;
    dayName: string;
    dayNumber: number;
    monthName: string;
    isSkipped: boolean;
  }>>([]);

  // Generate calendar days based on start date and duration
  // Calendar will extend by the number of skip days selected
  useEffect(() => {
    if (!state.startDate || !state.duration) {
      router.push('/food/subscribe/start-date');
      return;
    }

    const days = [];
    const startDate = new Date(state.startDate);
    const skipCount = selectedSkipDays.length;
    
    // Total calendar days = original duration + skip days (to maintain delivery count)
    const totalCalendarDays = state.duration + skipCount;
    
    for (let i = 0; i < totalCalendarDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateString = currentDate.toISOString().split('T')[0];
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = currentDate.getDate();
      const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });
      
      days.push({
        date: currentDate,
        dateString,
        dayName,
        dayNumber,
        monthName,
        isSkipped: selectedSkipDays.includes(dateString)
      });
    }
    
    setCalendarDays(days);
  }, [state.startDate, state.duration, selectedSkipDays, router]);

  const toggleSkipDay = (dateString: string) => {
    if (selectedSkipDays.includes(dateString)) {
      // Remove from skip days
      setSelectedSkipDays(selectedSkipDays.filter(d => d !== dateString));
    } else {
      // Calculate if this is an original or extended day
      const skipDate = new Date(dateString);
      const startDate = new Date(state.startDate || '');
      const dayIndex = Math.floor((skipDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const isOriginalDay = dayIndex < (state.duration || 0);
      
      // Check limits
      if (isOriginalDay) {
        // Original period: check skip limit
        if (skipsInOriginalPeriod >= skipLimit) {
          alert(`Original period skip limit reached! You can only skip ${skipLimit} days in the original ${state.duration}-day period. Skip days in the extended period (green dates) instead.`);
          return;
        }
      }
      
      // Check total extension limit
      if (selectedSkipDays.length >= maxExtension) {
        alert(`Maximum extension limit reached! You can only extend your ${state.duration}-day plan by ${maxExtension} days total.`);
        return;
      }
      
      // Add to skip days
      setSelectedSkipDays([...selectedSkipDays, dateString]);
    }
  };

  const handleNext = () => {
    // If user chooses to skip later, don't set any skip days now
    if (skipLater) {
      updateState({ 
        skipDates: [],
        skipEnabled: false,
        // Keep the original end date as is
      });
      router.push('/food/subscribe/addons');
      return;
    }

    // Calculate new end date by extending subscription for skip days
    const skipCount = selectedSkipDays.length;
    let newEndDate = state.endDate;
    
    if (skipCount > 0 && state.endDate) {
      const originalEndDate = new Date(state.endDate);
      const extendedEndDate = new Date(originalEndDate);
      extendedEndDate.setDate(originalEndDate.getDate() + skipCount);
      newEndDate = extendedEndDate.toISOString().split('T')[0];
    }
    
    updateState({ 
      skipDates: selectedSkipDays, 
      skipEnabled: selectedSkipDays.length > 0,
      endDate: newEndDate
    });
    
    router.push('/food/subscribe/addons');
  };

  // Product-level settings (will come from admin panel later)
  // For now, using dynamic values based on plan duration
  const getSkipLimit = (duration: number) => {
    // Skip limit in ORIGINAL period (days 1 to duration)
    return Math.floor(duration / 7); // e.g., 30 days = 4 skips, 15 days = 2 skips
  };
  
  const getMaxExtension = (duration: number) => {
    // Max NEW days that can be added
    if (duration >= 30) return 10; // 30+ days: max 10 days extension
    if (duration >= 15) return 7;  // 15-29 days: max 7 days extension
    if (duration >= 7) return 5;   // 7-14 days: max 5 days extension
    return 3; // Less than 7 days: max 3 days extension
  };
  
  const skipLimit = getSkipLimit(state.duration || 0); // Max skips in original period
  const maxExtension = getMaxExtension(state.duration || 0); // Max extension days
  
  // Calculate skips in original period vs extended period
  const originalPeriodEnd = state.duration || 0;
  const skipsInOriginalPeriod = selectedSkipDays.filter(dateStr => {
    const skipDate = new Date(dateStr);
    const startDate = new Date(state.startDate || '');
    const dayIndex = Math.floor((skipDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return dayIndex < originalPeriodEnd;
  }).length;
  
  const skipsInExtendedPeriod = selectedSkipDays.length - skipsInOriginalPeriod;
  const currentExtension = selectedSkipDays.length;
  const remainingExtension = maxExtension - currentExtension;
  const remainingSkipsInOriginal = skipLimit - skipsInOriginalPeriod;

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Step 4 of 9</span>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Skip Days</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ background: '#E5E7EB', height: '6px' }}>
            <div style={{ width: '44.4%', background: '#E11D48', height: '6px' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#0E1214' }}>
            Select Days to Skip Delivery
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Choose the days when you don't want delivery during your subscription period
          </p>
        </div>

        {/* Skip Now or Later Option */}
        <div className="mb-6 p-5 rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <h3 className="text-base font-semibold mb-3" style={{ color: '#0E1214' }}>
            When do you want to select skip days?
          </h3>
          <div className="space-y-3">
            {/* Option 1: Select Now */}
            <button
              onClick={() => setSkipLater(false)}
              className="w-full p-4 rounded-xl border transition-all duration-200 hover:shadow-md text-left"
              style={{
                background: !skipLater ? '#FEF2F2' : '#FFFFFF',
                borderColor: !skipLater ? '#E11D48' : '#E5E7EB',
                borderWidth: !skipLater ? '2px' : '1px'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div 
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: !skipLater ? '#E11D48' : '#D1D5DB',
                      background: !skipLater ? '#E11D48' : 'transparent'
                    }}
                  >
                    {!skipLater && (
                      <div className="w-2 h-2 rounded-full" style={{ background: '#FFFFFF' }}></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>
                    📅 Select Skip Days Now
                  </p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    Choose skip days from the calendar below. You can modify them later from your subscription dashboard (24 hours before delivery).
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2: Skip Later */}
            <button
              onClick={() => {
                setSkipLater(true);
                setSelectedSkipDays([]); // Clear any selected skip days
              }}
              className="w-full p-4 rounded-xl border transition-all duration-200 hover:shadow-md text-left"
              style={{
                background: skipLater ? '#FEF2F2' : '#FFFFFF',
                borderColor: skipLater ? '#E11D48' : '#E5E7EB',
                borderWidth: skipLater ? '2px' : '1px'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div 
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: skipLater ? '#E11D48' : '#D1D5DB',
                      background: skipLater ? '#E11D48' : 'transparent'
                    }}
                  >
                    {skipLater && (
                      <div className="w-2 h-2 rounded-full" style={{ background: '#FFFFFF' }}></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>
                    ⏰ I'll Select Later
                  </p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    Skip this step for now. You can select skip days anytime from your subscription dashboard (must be 24 hours before delivery).
                  </p>
                  {skipLater && (
                    <div className="mt-2 p-2 rounded-lg" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                      <p className="text-xs font-medium" style={{ color: '#92400E' }}>
                        💡 No worries! You'll have full control to add skip days from your subscription page.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Skip Stats - Only show if user wants to select now */}
        {!skipLater && (
        <>
        <div className="mb-6 space-y-3">
          {/* Original Period Skip Limit */}
          <div className="p-4 rounded-xl border" style={{ background: skipsInOriginalPeriod >= skipLimit ? '#FEE2E2' : '#FEF2F2', borderColor: '#FEE2E2' }}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: '#991B1B' }}>Original Period (Days 1-{state.duration})</p>
                <p className="text-base font-bold" style={{ color: '#0E1214' }}>
                  {skipsInOriginalPeriod} of {skipLimit} skips used
                </p>
                {skipsInOriginalPeriod >= skipLimit ? (
                  <p className="text-xs mt-1 font-semibold" style={{ color: '#DC2626' }}>
                    ⚠️ Original period days now disabled
                  </p>
                ) : (
                  <p className="text-xs mt-1" style={{ color: '#F59E0B' }}>
                    {remainingSkipsInOriginal} skips remaining in original period
                  </p>
                )}
              </div>
            <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: skipsInOriginalPeriod >= skipLimit ? '#DC2626' : '#E11D48' }}>
                  <span className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{remainingSkipsInOriginal}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>left</p>
              </div>
            </div>
          </div>

          {/* Total Extension Limit */}
          <div className="p-4 rounded-xl border" style={{ background: 'linear-gradient(to right, #F0FDF4, #ECFDF5)', borderColor: '#BBF7D0' }}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: '#15803D' }}>Total Extension Limit</p>
                <p className="text-base font-bold" style={{ color: '#0E1214' }}>
                  {currentExtension} of {maxExtension} days extended
                </p>
                <p className="text-xs mt-1" style={{ color: '#16A34A' }}>
                  Calendar can extend up to {maxExtension} total days
                </p>
            </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: remainingExtension > 0 ? '#10B981' : '#9CA3AF' }}>
                  <span className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{remainingExtension}</span>
            </div>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>remaining</p>
            </div>
            </div>
          </div>
        </div>

        {/* Extension Limit Warning */}
        {remainingExtension <= 2 && remainingExtension > 0 && (
          <div className="mb-6 p-4 rounded-xl border" style={{ background: '#FFFBEB', borderColor: '#FEF3C7' }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-1" style={{ color: '#92400E' }}>
                  Extension Limit Almost Reached
                </h4>
                <p className="text-xs" style={{ color: '#B45309' }}>
                  You can only add {remainingExtension} more skip day{remainingExtension > 1 ? 's' : ''} to your {state.duration}-day plan. Maximum extension for this plan is {maxExtension} days.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Extension Info */}
        {selectedSkipDays.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#10B981' }}>
                <svg className="w-5 h-5" fill="white" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold mb-2" style={{ color: '#15803D' }}>
                  🎉 Good News! Your Subscription Will Be Extended
                </h4>
                <p className="text-xs mb-2" style={{ color: '#166534' }}>
                  Since you're skipping {selectedSkipDays.length} day{selectedSkipDays.length > 1 ? 's' : ''}, we'll extend your subscription by {selectedSkipDays.length} day{selectedSkipDays.length > 1 ? 's' : ''} so you still get your full {state.duration} days of delivery!
                </p>
                <div className="flex items-center gap-4 mt-3 p-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #BBF7D0' }}>
                  <div>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Original Plan</p>
                    <p className="text-sm font-bold" style={{ color: '#0E1214' }}>{state.duration} days</p>
                  </div>
                  <svg className="w-5 h-5" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <div>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Extended Duration</p>
                    <p className="text-sm font-bold" style={{ color: '#10B981' }}>{state.duration + selectedSkipDays.length} days</p>
                  </div>
                </div>
                <p className="text-xs mt-3" style={{ color: '#16A34A' }}>
                  ✓ You'll receive {state.duration} deliveries over {state.duration + selectedSkipDays.length} days
                </p>
              </div>
            </div>
        </div>
        )}

        {/* Calendar */}
        <div className="mb-6 p-5 rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>
              Select Days to Skip
            </h3>
            <div className="text-right">
              <p className="text-xs" style={{ color: '#6B7280' }}>Showing calendar</p>
              <p className="text-sm font-bold" style={{ color: '#E11D48' }}>
                {calendarDays.length} days
                {selectedSkipDays.length > 0 && (
                  <span className="text-xs font-normal ml-1" style={{ color: '#10B981' }}>
                    (+{selectedSkipDays.length} extended)
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const isSkipped = selectedSkipDays.includes(day.dateString);
              const isExtendedDay = index >= state.duration; // Days beyond original duration
              const isOriginalDay = index < state.duration; // Days in original period
              
              // Determine if day can be skipped
              let canSkip = false;
              let disabledReason = '';
              
              if (isSkipped) {
                // Already skipped days can always be un-skipped
                canSkip = true;
              } else if (isOriginalDay) {
                // Original period days: check if skip limit reached
                if (skipsInOriginalPeriod >= skipLimit) {
                  canSkip = false;
                  disabledReason = 'Original period skip limit reached';
                } else {
                  canSkip = true;
                }
              } else if (isExtendedDay) {
                // Extended days: always enabled if under max extension
                if (currentExtension >= maxExtension) {
                  canSkip = false;
                  disabledReason = 'Maximum extension limit reached';
                } else {
                  canSkip = true;
                }
              }
              
              return (
                <button
                  key={index}
                  onClick={() => canSkip && toggleSkipDay(day.dateString)}
                  disabled={!canSkip}
                  title={!canSkip && !isSkipped ? disabledReason : ''}
                  className="p-3 rounded-xl border transition-all duration-200 relative"
                  style={{
                    background: isSkipped ? '#E11D48' : (isExtendedDay ? '#F0FDF4' : '#FFFFFF'),
                    borderColor: isSkipped ? '#E11D48' : (isExtendedDay ? '#BBF7D0' : '#E5E7EB'),
                    opacity: !canSkip && !isSkipped ? 0.4 : 1,
                    cursor: canSkip ? 'pointer' : 'not-allowed'
                  }}
                >
                  {isSkipped && (
                    <div className="absolute top-1 right-1">
                      <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {!isSkipped && isExtendedDay && (
                    <div className="absolute top-1 left-1">
                      <span className="text-xs" style={{ color: '#10B981' }}>+</span>
                    </div>
                  )}
                  <div className="text-xs mb-1" style={{ color: isSkipped ? '#FFFFFF' : (isExtendedDay ? '#15803D' : '#6B7280') }}>
                    {day.dayName}
                  </div>
                  <div className="text-xl font-bold mb-1" style={{ color: isSkipped ? '#FFFFFF' : (isExtendedDay ? '#10B981' : '#0E1214') }}>
                    {day.dayNumber}
                  </div>
                  <div className="text-xs" style={{ color: isSkipped ? '#FFFFFF' : (isExtendedDay ? '#15803D' : '#6B7280') }}>
                    {day.monthName}
                  </div>
                </button>
              );
            })}
            </div>
            
          {/* Calendar Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}></div>
              <span style={{ color: '#6B7280' }}>Regular Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border" style={{ background: '#E11D48', borderColor: '#E11D48' }}></div>
              <span style={{ color: '#6B7280' }}>Skip Day</span>
            </div>
            {selectedSkipDays.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border flex items-center justify-center" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                  <span style={{ color: '#10B981', fontSize: '10px' }}>+</span>
                </div>
                <span style={{ color: '#6B7280' }}>Extended Day</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Note */}
        <div className="mb-6 p-4 rounded-xl border" style={{ background: '#EFF6FF', borderColor: '#DBEAFE' }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#3B82F6' }}>
              <span className="text-xs" style={{ color: '#FFFFFF' }}>ℹ</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: '#1E40AF' }}>
                Important Information
              </h4>
              <ul className="space-y-1.5 text-xs" style={{ color: '#1E3A8A' }}>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">1️⃣</span>
                  <span><strong>Original Period (Days 1-{state.duration}):</strong> You can skip up to {skipLimit} days. Each skip extends the calendar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">2️⃣</span>
                  <span><strong>After {skipLimit} Skips:</strong> Original days (1-{state.duration}) become disabled. You can only skip extended days (green dates).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">3️⃣</span>
                  <span><strong>Extended Days Always Active:</strong> Green dates are always selectable until you reach the {maxExtension}-day extension limit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">✓</span>
                  <span><strong>No Extra Charges:</strong> You only pay for {state.duration} delivery days - skip days are completely free!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">✓</span>
                  <span><strong>Full Flexibility:</strong> Modify skip days from your subscription page 24 hours before delivery.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Selected Days Summary */}
        {selectedSkipDays.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: '#15803D' }}>
              Days You've Selected to Skip ({selectedSkipDays.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {calendarDays
                .filter(day => selectedSkipDays.includes(day.dateString))
                .map((day, index) => (
                  <div
                    key={index}
                    className="px-3 py-1.5 rounded-lg border text-xs font-medium"
                    style={{ background: '#FFFFFF', borderColor: '#BBF7D0', color: '#166534' }}
                  >
                    {day.dayName}, {day.monthName} {day.dayNumber}
                  </div>
                ))}
            </div>
          </div>
        )}
        </>
        )}

        {/* Confirmation Message when Skip Later is selected */}
        {skipLater && (
          <div className="mb-6 p-6 rounded-xl border" style={{ background: 'linear-gradient(to right, #F0FDF4, #ECFDF5)', borderColor: '#BBF7D0' }}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-4xl">
                ✅
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2" style={{ color: '#166534' }}>
                  Perfect! You can skip days later
                </h3>
                <p className="text-sm mb-3" style={{ color: '#15803D' }}>
                  No skip days will be set for now. You can manage skip days anytime from your subscription dashboard.
                </p>
                <div className="p-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #BBF7D0' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#166534' }}>
                    📌 How to add skip days later:
                  </p>
                  <ul className="space-y-1 text-xs" style={{ color: '#15803D' }}>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5">•</span>
                      <span>Go to your subscription dashboard after activating your plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5">•</span>
                      <span>Click "Manage Skip Days" option</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5">•</span>
                      <span>Select any date (must be at least 24 hours before delivery)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5">•</span>
                      <span>Your subscription will automatically extend by the number of skip days</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 border rounded-xl font-semibold text-sm transition-all duration-200"
            style={{ 
              background: '#FFFFFF',
              borderColor: '#E5E7EB',
              color: '#374151'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
            }}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{ 
              background: '#E11D48',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#BE123C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#E11D48';
            }}
          >
            {skipLater 
              ? '⏩ Skip This Step & Continue' 
              : selectedSkipDays.length > 0 
                ? `Continue with ${selectedSkipDays.length} Skip Day${selectedSkipDays.length > 1 ? 's' : ''}`
                : 'Continue Without Skip Days'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

