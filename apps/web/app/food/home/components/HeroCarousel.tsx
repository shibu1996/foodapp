'use client';

import { useState, useEffect } from 'react';
import { HERO_IMAGES } from '../utils/images';

interface HeroCarouselProps {
  userName?: string;
}

export function HeroCarousel({ userName }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  return (
    <div
      className="relative h-[400px] w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {HERO_IMAGES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          
          <div className="absolute inset-0 flex flex-col justify-center">
            <div className="max-w-7xl mx-auto px-8 md:px-12 w-full">
              {userName && index === 0 && (
                <p className="text-white/90 text-sm mb-2">Welcome back, {userName}!</p>
              )}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 max-w-3xl">
                {slide.title}
              </h1>
              <p className="text-sm md:text-base text-white/90 mb-6 max-w-2xl">
                {slide.subtitle}
              </p>
              <div className="flex gap-3">
                <button 
                  className="text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-200 text-sm"
                  style={{
                    backgroundColor: '#E11D48',
                    boxShadow: '0 4px 20px rgba(225,29,72,0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#BE123C';
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(225,29,72,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#E11D48';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(225,29,72,0.4)';
                  }}
                >
                  Order Now
                </button>
                <button 
                  className="backdrop-blur-sm text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-200 border-2 text-sm"
                  style={{
                    backgroundColor: 'rgba(244,63,94,0.10)',
                    borderColor: '#F43F5E'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.20)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.10)';
                  }}
                >
                  View Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Dots - Crimson Jet Theme */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {HERO_IMAGES.map((_, index) => {
          const isActive = index === currentSlide;
          return (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${isActive ? 'w-8' : 'w-3'}`}
              style={{
                backgroundColor: isActive ? '#E11D48' : 'rgba(255,255,255,0.5)',
                boxShadow: isActive ? '0 0 10px rgba(225,29,72,0.6)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.7)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)';
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}


