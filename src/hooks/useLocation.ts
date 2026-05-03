import { useState, useEffect, useRef, useCallback } from 'react';
import {
  requestLocationPermission,
  getCurrentLocation,
  watchLocation,
  clearLocationWatch,
} from '../services/LocationService';
import { getSocket } from '../api/socket';

export const useLocation = (isOnline: boolean, driverId: string | null, hasPermission: boolean | null) => {
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const isOnlineRef = useRef(isOnline);
  const driverIdRef = useRef(driverId);
  const mountedRef = useRef(true);

  useEffect(() => {
    isOnlineRef.current = isOnline;
    driverIdRef.current = driverId;
  }, [isOnline, driverId]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      console.log('Stopping location watch:', watchIdRef.current);
      clearLocationWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startTracking = useCallback(async () => {
    // Prevent multiple watches
    stopTracking();

    if (!mountedRef.current || !hasPermission) return false;

    try {
      // Small delay to let native system stabilize after permission grant
      await new Promise(resolve => setTimeout(() => resolve(null), 500));

      // Fetch current location once immediately
      const position = await getCurrentLocation();
      if (mountedRef.current) {
        setCurrentLocation(position.coords);
      }

      // Start watching
      const id = watchLocation(
        pos => {
          if (mountedRef.current) {
            console.log('Location update:', pos.coords.latitude, pos.coords.longitude);
            setCurrentLocation(pos.coords);
            const socket = getSocket();
            if (socket && isOnlineRef.current && driverIdRef.current) {
              socket.emit('updateLocation', {
                driverId: driverIdRef.current,
                coordinates: [pos.coords.longitude, pos.coords.latitude],
              });
            }
          }
        },
        err => console.log('Location watch error', err),
      );
      
      watchIdRef.current = id;
      console.log('Started location watch:', id);
      return true;
    } catch (error) {
      console.log('Error starting tracking:', error);
      return false;
    }
  }, [stopTracking, hasPermission]);

  useEffect(() => {
    mountedRef.current = true;
    if (isOnline && hasPermission) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => {
      mountedRef.current = false;
      stopTracking();
    };
  }, [isOnline, hasPermission, startTracking, stopTracking]);

  // Initial location fetch when permission is granted
  useEffect(() => {
    if (hasPermission) {
      // Delay initial fetch slightly to avoid crash right after permission allow
      const timer = setTimeout(() => {
        getCurrentLocation()
          .then(pos => {
            if (mountedRef.current) {
              setCurrentLocation(pos.coords);
            }
          })
          .catch(err => console.log('Initial location error', err));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasPermission]);

  return { currentLocation, setCurrentLocation };
};
