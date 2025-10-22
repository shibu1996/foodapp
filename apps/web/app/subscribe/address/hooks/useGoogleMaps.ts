'use client';

import { useLoadScript } from '@react-google-maps/api';

const libraries: ("places" | "geometry")[] = ['places'];

export function useGoogleMaps() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAQ3tRqgbbsKDSwC_oGNF6Ocsn01llBRuc',
    libraries,
  });

  return { isLoaded, loadError };
}

export async function reverseGeocode(lat: number, lng: number) {
  if (!window.google) return null;

  const geocoder = new google.maps.Geocoder();
  
  try {
    const result = await geocoder.geocode({
      location: { lat, lng }
    });

    if (result.results[0]) {
      const addressComponents = result.results[0].address_components;
      
      let houseNo = '';
      let street = '';
      let area = '';
      let city = '';
      let state = '';
      let pincode = '';

      addressComponents.forEach(component => {
        const types = component.types;
        
        if (types.includes('street_number')) {
          houseNo = component.long_name;
        }
        if (types.includes('route')) {
          street = component.long_name;
        }
        if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
          area = component.long_name;
        }
        if (types.includes('locality')) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (types.includes('postal_code')) {
          pincode = component.long_name;
        }
      });

      return {
        houseNo,
        street,
        area,
        city,
        state,
        pincode,
        formattedAddress: result.results[0].formatted_address
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }

  return null;
}

