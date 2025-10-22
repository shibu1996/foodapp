'use client';

import { useState, useCallback } from 'react';
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { reverseGeocode } from '../hooks/useGoogleMaps';

interface MapPickerProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: any;
  }) => void;
  initialCenter?: { lat: number; lng: number };
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 28.6139, // Delhi coordinates as default
  lng: 77.2090
};

export function MapPicker({ onLocationSelect, initialCenter }: MapPickerProps) {
  const [center, setCenter] = useState(initialCenter || defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(initialCenter || defaultCenter);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);

  const onMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setMarkerPosition({ lat, lng });
      
      const address = await reverseGeocode(lat, lng);
      onLocationSelect({ lat, lng, address });
    }
  }, [onLocationSelect]);

  const onMarkerDragEnd = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setMarkerPosition({ lat, lng });
      
      const address = await reverseGeocode(lat, lng);
      onLocationSelect({ lat, lng, address });
    }
  }, [onLocationSelect]);

  const onSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  }, []);

  const onPlacesChanged = useCallback(async () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          setCenter({ lat, lng });
          setMarkerPosition({ lat, lng });
          
          const address = await reverseGeocode(lat, lng);
          onLocationSelect({ lat, lng, address });
        }
      }
    }
  }, [searchBox, onLocationSelect]);

  const useCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setCenter({ lat, lng });
          setMarkerPosition({ lat, lng });
          
          const address = await reverseGeocode(lat, lng);
          onLocationSelect({ lat, lng, address });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please select manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, [onLocationSelect]);

  return (
    <div>
      {/* Search Box */}
      <div className="mb-4">
        <StandaloneSearchBox onLoad={onSearchBoxLoad} onPlacesChanged={onPlacesChanged}>
          <input
            type="text"
            placeholder="Search for a location..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </StandaloneSearchBox>
      </div>

      {/* Use Current Location Button */}
      <button
        type="button"
        onClick={useCurrentLocation}
        className="mb-4 px-4 py-2 bg-teal-100 text-teal-700 rounded-lg font-medium hover:bg-teal-200 transition"
      >
        Use Current Location
      </button>

      {/* Map */}
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
        <Marker
          position={markerPosition}
          draggable={true}
          onDragEnd={onMarkerDragEnd}
        />
      </GoogleMap>

      <p className="text-sm text-gray-600 mt-2">
        Click on the map or drag the marker to select your location
      </p>
    </div>
  );
}

