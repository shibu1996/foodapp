'use client';

import { useState, useCallback } from 'react';
import { GoogleMap, Marker, StandaloneSearchBox, useLoadScript } from '@react-google-maps/api';

interface OutletMapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  initialCenter?: { lat: number; lng: number };
}

const libraries: ("places" | "geometry")[] = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

export function OutletMapPicker({ onLocationSelect, initialCenter }: OutletMapPickerProps) {
  const [center, setCenter] = useState(initialCenter || defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(initialCenter || defaultCenter);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);

  // Load Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAQ3tRqgbbsKDSwC_oGNF6Ocsn01llBRuc',
    libraries,
  });

  const reverseGeocode = async (lat: number, lng: number) => {
    onLocationSelect({ lat, lng });
  };

  const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  };

  const onMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setMarkerPosition({ lat, lng });
      await reverseGeocode(lat, lng);
    }
  }, []);

  const onMarkerDragEnd = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setMarkerPosition({ lat, lng });
      await reverseGeocode(lat, lng);
    }
  }, []);

  const onPlacesChanged = async () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          setCenter({ lat, lng });
          setMarkerPosition({ lat, lng });
          await reverseGeocode(lat, lng);
        }
      }
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setCenter({ lat, lng });
          setMarkerPosition({ lat, lng });
          await reverseGeocode(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please select manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  if (!isLoaded) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#E11D48' }}></div>
        <p className="text-xs mt-2" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
          Loading map...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Box */}
      {/* @ts-ignore - Google Maps API types not fully compatible with React 19 */}
      <StandaloneSearchBox onLoad={onSearchBoxLoad} onPlacesChanged={onPlacesChanged}>
        <input
          type="text"
          placeholder="Search for a location..."
          className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
          style={{ borderColor: '#E5E7EB', fontFamily: 'Poppins, sans-serif' }}
        />
      </StandaloneSearchBox>

      {/* Use Current Location Button */}
      <button
        type="button"
        onClick={useCurrentLocation}
        className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
        style={{
          backgroundColor: '#E11D48',
          color: '#FFFFFF',
          fontFamily: 'Poppins, sans-serif'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#BE123C';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#E11D48';
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Use Current Location</span>
      </button>

      {/* Map */}
      <div className="relative">
        {/* @ts-ignore - Google Maps API types not fully compatible with React 19 */}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
          onClick={onMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {/* @ts-ignore - Google Maps API types not fully compatible with React 19 */}
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
          />
        </GoogleMap>
      </div>

      <p className="text-xs" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
        📍 Click on the map or drag the marker to pin exact outlet location
      </p>

      {/* Coordinates Display */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 p-2 rounded-lg">
          <p className="text-xs font-semibold" style={{ color: '#1E40AF', fontFamily: 'Poppins, sans-serif' }}>
            Latitude
          </p>
          <p className="text-xs" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
            {markerPosition.lat.toFixed(6)}
          </p>
        </div>
        <div className="bg-blue-50 p-2 rounded-lg">
          <p className="text-xs font-semibold" style={{ color: '#1E40AF', fontFamily: 'Poppins, sans-serif' }}>
            Longitude
          </p>
          <p className="text-xs" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
            {markerPosition.lng.toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
}
