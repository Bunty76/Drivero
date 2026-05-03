import { useEffect, useState, useCallback, useRef } from 'react';
import { initSocket, getSocket, disconnectSocket } from '../api/socket';
import { Alert } from 'react-native';

export const useSocket = (userToken: string | null, isOnline: boolean, activeRide: any) => {
  const [incomingRide, setIncomingRide] = useState<any>(null);
  
  // Use refs to access latest values in socket listeners without re-running the effect
  const isOnlineRef = useRef(isOnline);
  const activeRideRef = useRef(activeRide);
  const incomingRideRef = useRef(incomingRide);

  useEffect(() => {
    isOnlineRef.current = isOnline;
    activeRideRef.current = activeRide;
    incomingRideRef.current = incomingRide;
  }, [isOnline, activeRide, incomingRide]);

  useEffect(() => {
    if (!userToken) return;

    console.log('Initializing socket...');
    const socket = initSocket(userToken);

    const handleRideRequest = (rideData: any) => {
      console.log('New ride request received:', rideData);
      if (!activeRideRef.current && isOnlineRef.current) {
        setIncomingRide(rideData);
      }
    };

    const handleRideCancelled = (data: any) => {
      if (incomingRideRef.current?.id === data.rideId) {
        setIncomingRide(null);
        Alert.alert('Ride Cancelled', 'The passenger cancelled the request.');
      }
    };

    socket.on('ride-request', handleRideRequest);
    socket.on('ride-cancelled', handleRideCancelled);

    return () => {
      console.log('Cleaning up socket...');
      socket.off('ride-request', handleRideRequest);
      socket.off('ride-cancelled', handleRideCancelled);
      disconnectSocket();
    };
  }, [userToken]); // Only re-init if token changes

  const acceptRide = useCallback((rideId: string, driverId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('accept-ride', { rideId, driverId });
      setIncomingRide(null);
    }
  }, []);

  const rejectRide = useCallback((rideId: string, driverId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('reject-ride', { rideId, driverId });
      setIncomingRide(null);
    }
  }, []);

  return {
    incomingRide,
    setIncomingRide,
    acceptRide,
    rejectRide,
    socket: getSocket(),
  };
};
