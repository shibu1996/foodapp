'use client';

import { useState } from 'react';

interface LocationSelectorProps {
  currentLocation: string;
  onLocationChange: () => void;
}

export function LocationSelector({ currentLocation, onLocationChange }: LocationSelectorProps) {
  return (
    <button
      onClick={onLocationChange}
      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition group"
    >
      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <div className="text-left hidden md:block">
        <p className="text-xs text-gray-500">Delivering to</p>
        <p className="font-medium text-gray-800 truncate max-w-[150px]">{currentLocation}</p>
      </div>
      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}


