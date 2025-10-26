'use client';

import { useState, useEffect } from 'react';
import { GoogleMap, Marker, Polyline, DirectionsRenderer, useLoadScript } from '@react-google-maps/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const libraries: ("places" | "geometry")[] = ['places', 'geometry'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '12px'
};

interface Subscription {
  _id: string;
  userId: {
    name: string;
    phone: string;
  };
  productId: {
    name: string;
    image: string;
  };
  deliveryAddress: {
    houseNo: string;
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };
  deliverySlot: string;
  status: string;
  startDate: string;
  distance?: number;
}

interface RouteStop {
  subscription: Subscription;
  order: number;
  distance: number;
}

export default function DeliveryBoyPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAQ3tRqgbbsKDSwC_oGNF6Ocsn01llBRuc',
    libraries,
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [outletLocation, setOutletLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [optimizedRoute, setOptimizedRoute] = useState<RouteStop[]>([]);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<string>('');
  const [deliveredIds, setDeliveredIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Auto-determine current slot when subscriptions load
    if (subscriptions.length > 0 && !currentSlot) {
      const slots = getUniqueSlots();
      if (slots.length > 0) {
        setCurrentSlot(slots[0]);
      }
    }
  }, [subscriptions]);

  useEffect(() => {
    // Check if all deliveries in current slot are done, move to next slot
    if (currentSlot && subscriptions.length > 0) {
      const currentSlotSubs = subscriptions.filter(sub => sub.deliverySlot === currentSlot);
      const allDelivered = currentSlotSubs.every(sub => deliveredIds.has(sub._id));
      
      if (allDelivered && currentSlotSubs.length > 0) {
        const slots = getUniqueSlots();
        const currentIndex = slots.indexOf(currentSlot);
        if (currentIndex < slots.length - 1) {
          const nextSlot = slots[currentIndex + 1];
          showToast(`All deliveries for ${currentSlot} completed! Moving to ${nextSlot}`, 'success');
          setTimeout(() => {
            setCurrentSlot(nextSlot);
            setOptimizedRoute([]);
            setShowMap(false);
          }, 2000);
        } else {
          showToast('All deliveries completed for today! 🎉', 'success');
        }
      }
    }
  }, [deliveredIds, currentSlot, subscriptions]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadActiveSubscriptions(), loadOutletLocation()]);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSubscriptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/subscriptions/admin/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Get today's date in IST
        const now = new Date();
        const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const today = new Date(istTime);
        today.setHours(0, 0, 0, 0);
        
        // Filter only today's active subscriptions with delivery addresses
        const activeSubs = data.data.filter((sub: Subscription) => {
          if (sub.status !== 'active' || !sub.deliveryAddress || !sub.deliveryAddress.latitude || !sub.deliveryAddress.longitude) {
            return false;
          }
          
          // Check if subscription is for today
          const startDate = new Date(sub.startDate);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(sub.endDate);
          endDate.setHours(0, 0, 0, 0);
          
          return today.getTime() >= startDate.getTime() && today.getTime() <= endDate.getTime();
        });
        
        setSubscriptions(activeSubs);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const loadOutletLocation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/outlets/active`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        const outlet = data.data[0];
        if (outlet.location && outlet.location.coordinates) {
          setOutletLocation({
            lng: outlet.location.coordinates[0],
            lat: outlet.location.coordinates[1]
          });
        }
      }
    } catch (error) {
      console.error('Error loading outlet:', error);
    }
  };

  // Get unique time slots
  const getUniqueSlots = () => {
    return Array.from(new Set(subscriptions.map(sub => sub.deliverySlot))).sort();
  };

  // Get current slot subscriptions (excluding delivered ones)
  const getCurrentSlotSubscriptions = () => {
    return subscriptions.filter(sub => 
      sub.deliverySlot === currentSlot && !deliveredIds.has(sub._id)
    );
  };

  // Mark subscription as delivered
  const markAsDelivered = (subscriptionId: string) => {
    setDeliveredIds(prev => new Set([...prev, subscriptionId]));
    showToast('Marked as delivered!', 'success');
  };

  // Start Google Maps navigation
  const startDirection = (address: any) => {
    const destination = `${address.latitude},${address.longitude}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Optimize route using Nearest Neighbor algorithm
  const optimizeRoute = () => {
    if (!outletLocation || subscriptions.length === 0) {
      showToast('No outlet or subscriptions available', 'error');
      return;
    }

    // Only use current slot subscriptions (excluding delivered)
    const filteredSubs = getCurrentSlotSubscriptions();

    if (filteredSubs.length === 0) {
      showToast('No pending deliveries for current slot', 'error');
      return;
    }

    let currentLocation = outletLocation;
    const unvisited = [...filteredSubs];
    const route: RouteStop[] = [];
    let order = 1;

    // Nearest Neighbor Algorithm
    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      unvisited.forEach((sub, index) => {
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          sub.deliveryAddress.latitude,
          sub.deliveryAddress.longitude
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = index;
        }
      });

      const nearestSub = unvisited[nearestIndex];
      route.push({
        subscription: nearestSub,
        order: order++,
        distance: minDistance
      });

      currentLocation = {
        lat: nearestSub.deliveryAddress.latitude,
        lng: nearestSub.deliveryAddress.longitude
      };

      unvisited.splice(nearestIndex, 1);
    }

    setOptimizedRoute(route);
    calculateGoogleRoute(route);
    setShowMap(true);
    showToast(`Route optimized with ${route.length} stops`, 'success');
  };

  // Calculate route using Google Directions API
  const calculateGoogleRoute = async (route: RouteStop[]) => {
    if (!window.google || !outletLocation) return;

    const waypoints = route.map(stop => ({
      location: new google.maps.LatLng(
        stop.subscription.deliveryAddress.latitude,
        stop.subscription.deliveryAddress.longitude
      ),
      stopover: true
    }));

    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: new google.maps.LatLng(outletLocation.lat, outletLocation.lng),
        destination: new google.maps.LatLng(outletLocation.lat, outletLocation.lng), // Return to outlet
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false // We already optimized
      });

      setDirectionsResponse(result);

      // Calculate total distance and duration
      let totalDist = 0;
      let totalDur = 0;

      result.routes[0].legs.forEach(leg => {
        if (leg.distance && leg.duration) {
          totalDist += leg.distance.value / 1000; // Convert to km
          totalDur += leg.duration.value / 60; // Convert to minutes
        }
      });

      setTotalDistance(totalDist);
      setTotalDuration(totalDur);
    } catch (error) {
      console.error('Error calculating route:', error);
      showToast('Failed to calculate route', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-3" 
            style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
          <p className="text-sm" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>Loading delivery data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Toast Notification */}
      {toast.show && (
        <div
          className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all"
          style={{
            backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
            color: '#FFFFFF'
          }}
        >
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#0E1214' }}>
              🚴 Delivery Route Management
            </h1>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {subscriptions.length} total subscriptions | {deliveredIds.size} delivered
            </p>
          </div>
          
          <button
            onClick={optimizeRoute}
            disabled={getCurrentSlotSubscriptions().length === 0}
            className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: getCurrentSlotSubscriptions().length === 0 ? '#9CA3AF' : '#E11D48',
              color: '#FFFFFF',
              cursor: getCurrentSlotSubscriptions().length === 0 ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e: any) => {
              if (getCurrentSlotSubscriptions().length > 0) {
                e.currentTarget.style.backgroundColor = '#BE123C';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e: any) => {
              if (getCurrentSlotSubscriptions().length > 0) {
                e.currentTarget.style.backgroundColor = '#E11D48';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Optimize Route</span>
          </button>
        </div>

        {/* Current Time Slot Banner */}
        {getUniqueSlots().length > 0 && (
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 md:p-6 border-2" style={{ borderColor: '#E11D48' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E11D48' }}>
                  <svg className="w-6 h-6 md:w-7 md:h-7" style={{ color: '#FFFFFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#9F1239' }}>Current Delivery Slot</p>
                  <p className="text-xl md:text-2xl font-bold" style={{ color: '#E11D48' }}>{currentSlot}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                  <p className="text-sm font-bold" style={{ color: '#E11D48' }}>
                    {getCurrentSlotSubscriptions().length} Pending
                  </p>
                  <div className="w-px h-6" style={{ backgroundColor: '#FEE2E2' }}></div>
                  <p className="text-sm font-bold" style={{ color: '#059669' }}>
                    {subscriptions.filter(sub => sub.deliverySlot === currentSlot && deliveredIds.has(sub._id)).length} Delivered
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {optimizedRoute.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-xl border p-3 md:p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#DBEAFE' }}>
                <svg className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Total Stops</p>
                <p className="text-lg md:text-xl font-bold" style={{ color: '#0E1214' }}>{optimizedRoute.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-3 md:p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF2F2' }}>
                <svg className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Total Distance</p>
                <p className="text-lg md:text-xl font-bold" style={{ color: '#0E1214' }}>{totalDistance.toFixed(1)} km</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-3 md:p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
                <svg className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Est. Duration</p>
                <p className="text-lg md:text-xl font-bold" style={{ color: '#0E1214' }}>{Math.ceil(totalDuration)} min</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-3 md:p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
                <svg className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Avg per Stop</p>
                <p className="text-lg md:text-xl font-bold" style={{ color: '#0E1214' }}>
                  {optimizedRoute.length > 0 ? (totalDistance / optimizedRoute.length).toFixed(1) : '0'} km
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left: Subscriptions List */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl border p-3 md:p-4" style={{ borderColor: '#E5E7EB' }}>
            <h3 className="text-sm md:text-base font-bold mb-3 md:mb-4" style={{ color: '#0E1214' }}>
              {currentSlot} - Pending Deliveries ({getCurrentSlotSubscriptions().length})
            </h3>

            {getCurrentSlotSubscriptions().length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                  <svg className="w-8 h-8" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-semibold" style={{ color: '#059669' }}>All Delivered!</p>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  {getUniqueSlots().indexOf(currentSlot) < getUniqueSlots().length - 1 
                    ? 'Moving to next slot...' 
                    : 'All deliveries complete for today'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {(optimizedRoute.length > 0 ? optimizedRoute : getCurrentSlotSubscriptions().map((sub, idx) => ({ subscription: sub, order: idx + 1, distance: 0 }))).map((stop) => {
                  const sub = stop.subscription;
                  const routeOrder = optimizedRoute.find(r => r.subscription._id === sub._id)?.order;
                  const isDelivered = deliveredIds.has(sub._id);
                  
                  return (
                    <div
                      key={sub._id}
                      className="border rounded-lg p-3 hover:shadow-md transition-all"
                      style={{ borderColor: routeOrder ? '#E11D48' : '#E5E7EB' }}
                    >
                      {routeOrder && (
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: '#FEF2F2', color: '#E11D48' }}
                          >
                            Stop #{routeOrder}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                            {stop.distance.toFixed(2)} km
                          </span>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <img
                          src={sub.productId.image || '/placeholder-food.jpg'}
                          alt={sub.productId.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold mb-1 truncate" style={{ color: '#0E1214' }}>
                            {sub.productId.name}
                          </p>
                          <p className="text-xs mb-1" style={{ color: '#374151' }}>
                            {sub.userId.name}
                          </p>
                          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>
                            📞 {sub.userId.phone}
                          </p>
                          <p className="text-xs font-semibold" style={{ color: '#059669' }}>
                            🕒 {sub.deliverySlot}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t" style={{ borderColor: '#F3F4F6' }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: '#0E1214' }}>
                          📍 Delivery Address:
                        </p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          {sub.deliveryAddress.houseNo}, {sub.deliveryAddress.street}
                        </p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          {sub.deliveryAddress.area}, {sub.deliveryAddress.city}
                        </p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          {sub.deliveryAddress.state} - {sub.deliveryAddress.pincode}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => startDirection(sub.deliveryAddress)}
                          className="flex-1 py-2 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1"
                          style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                          onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                          onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#2563EB'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <span>Start Direction</span>
                        </button>

                        <button
                          onClick={() => markAsDelivered(sub._id)}
                          className="flex-1 py-2 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1"
                          style={{ 
                            backgroundColor: deliveredIds.has(sub._id) ? '#059669' : '#E11D48', 
                            color: '#FFFFFF' 
                          }}
                          disabled={deliveredIds.has(sub._id)}
                          onMouseEnter={(e: any) => {
                            if (!deliveredIds.has(sub._id)) {
                              e.currentTarget.style.backgroundColor = '#BE123C';
                            }
                          }}
                          onMouseLeave={(e: any) => {
                            if (!deliveredIds.has(sub._id)) {
                              e.currentTarget.style.backgroundColor = '#E11D48';
                            }
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{deliveredIds.has(sub._id) ? 'Delivered' : 'Mark Delivered'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Map */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-xl border p-3 md:p-4" style={{ borderColor: '#E5E7EB' }}>
            <h3 className="text-sm md:text-base font-bold mb-3 md:mb-4" style={{ color: '#0E1214' }}>
              📍 Delivery Route Map
            </h3>

            {!showMap ? (
              <div className="flex items-center justify-center bg-gray-50 rounded-lg" style={{ height: '400px', minHeight: '300px' }}>
                <div className="text-center px-4">
                  <svg className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4" style={{ color: '#D1D5DB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-xs md:text-sm font-semibold mb-2" style={{ color: '#6B7280' }}>
                    Click "Optimize Route" to generate delivery path
                  </p>
                </div>
              </div>
            ) : !isLoaded ? (
              <div className="flex items-center justify-center" style={{ height: '400px', minHeight: '300px' }}>
                <div className="text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 border-4 rounded-full animate-spin mx-auto mb-3" 
                    style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
                  <p className="text-xs md:text-sm" style={{ color: '#6B7280' }}>Loading map...</p>
                </div>
              </div>
            ) : (
              <div>
                {/* @ts-ignore */}
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={outletLocation || { lat: 28.6139, lng: 77.2090 }}
                  zoom={12}
                  options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                  }}
                >
                  {/* Outlet Marker */}
                  {outletLocation && (
                    /* @ts-ignore */
                    <Marker
                      position={outletLocation}
                      icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                        scaledSize: new google.maps.Size(40, 40)
                      }}
                      title="Outlet"
                    />
                  )}

                  {/* Route Markers */}
                  {optimizedRoute.map((stop, index) => (
                    /* @ts-ignore */
                    <Marker
                      key={stop.subscription._id}
                      position={{
                        lat: stop.subscription.deliveryAddress.latitude,
                        lng: stop.subscription.deliveryAddress.longitude
                      }}
                      label={{
                        text: `${index + 1}`,
                        color: '#FFFFFF',
                        fontWeight: 'bold'
                      }}
                      title={stop.subscription.userId.name}
                    />
                  ))}

                  {/* Directions */}
                  {directionsResponse && (
                    /* @ts-ignore */
                    <DirectionsRenderer
                      directions={directionsResponse}
                      options={{
                        suppressMarkers: true,
                        polylineOptions: {
                          strokeColor: '#E11D48',
                          strokeWeight: 4
                        }
                      }}
                    />
                  )}
                </GoogleMap>

                {/* Turn-by-turn directions */}
                {directionsResponse && (
                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <h4 className="text-sm font-bold mb-3" style={{ color: '#0E1214' }}>
                      📋 Turn-by-turn Directions
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {directionsResponse.routes[0].legs.map((leg, idx) => (
                        <div key={idx} className="text-xs p-2 rounded bg-white" style={{ borderLeft: '3px solid #E11D48' }}>
                          <p className="font-bold mb-1" style={{ color: '#E11D48' }}>
                            Stop {idx + 1}: {leg.distance?.text} • {leg.duration?.text}
                          </p>
                          <p style={{ color: '#6B7280' }}>{leg.end_address}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
