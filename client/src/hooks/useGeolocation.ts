/**
 * useGeolocation — Hook to get user's current location
 * Returns lat/lng, loading state, error, and a refresh function
 * Watches position for live updates
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
  granted: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    loading: false,
    error: null,
    granted: false,
  });

  const watchIdRef = useRef<number | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation is not supported by your browser', loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Get initial position quickly
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null,
          granted: true,
        });
      },
      (err) => {
        let errorMsg = 'Unable to get your location';
        if (err.code === 1) errorMsg = 'Location access denied. Please enable location services.';
        else if (err.code === 2) errorMsg = 'Location unavailable. Please try again.';
        else if (err.code === 3) errorMsg = 'Location request timed out. Please try again.';
        setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );

    // Also watch for updates
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null,
          granted: true,
        });
      },
      () => {}, // Silently ignore watch errors
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
    );
  }, []);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    requestLocation,
  };
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 0.1) return `${Math.round(km * 1000)}m`;
  if (km < 1) return `${Math.round(km * 100) * 10}m`;
  return `${km.toFixed(1)}km`;
}
