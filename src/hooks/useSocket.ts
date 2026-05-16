import { useEffect, useState, useCallback, useRef } from 'react';
import { initSocket, getSocket, disconnectSocket } from '../api/socket';
import api from '../api/axios';
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

    socket.on('newRideRequest', handleRideRequest);
    socket.on('rideCancelled', handleRideCancelled);

    return () => {
      console.log('Cleaning up socket...');
      socket.off('newRideRequest', handleRideRequest);
      socket.off('rideCancelled', handleRideCancelled);
      disconnectSocket();
    };
  }, [userToken]); // Only re-init if token changes

  const acceptRide = useCallback(async (rideId: string, driverId: string) => {
    // Check if this is a mock ride from the TestRideGenerator
    if (rideId.startsWith('ride_')) {
      console.log('Accepting mock ride locally...');
      setIncomingRide(null);
      return { 
        ...incomingRideRef.current, 
        status: 'ACCEPTED', 
        otp: '1234',
        driver: driverId 
      };
    }

    try {
      const response = await api.patch(`/rides/${rideId}/accept`, { driverId });
      setIncomingRide(null);
      return response.data;
    } catch (error) {
      console.log('Accept ride error:', error);
      Alert.alert('Error', 'Failed to accept ride. It may have been taken.');
      setIncomingRide(null);
      return null;
    }
  }, []);

  const rejectRide = useCallback(async (rideId: string, driverId: string) => {
    if (rideId.startsWith('ride_')) {
      setIncomingRide(null);
      return;
    }

    try {
      await api.patch(`/rides/${rideId}/reject`, { driverId });
      setIncomingRide(null);
    } catch (error) {
      setIncomingRide(null);
    }
  }, []);

  const startRide = useCallback(async (rideId: string, otp: string) => {
    try {
      const response = await api.patch(`/rides/${rideId}/start`, { otp });
      return response.data;
    } catch (error: any) {
      console.log('Start ride error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to start ride');
      return null;
    }
  }, []);

  return {
    incomingRide,
    setIncomingRide,
    acceptRide,
    rejectRide,
    startRide,
    socket: getSocket(),
  };
};
