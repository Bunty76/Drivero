import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthContext } from '../store/AuthContext';
import api from '../api/axios';

import { requestLocationPermission } from '../services/LocationService';

// Hooks
import { useSocket } from '../hooks/useSocket';
import { useLocation } from '../hooks/useLocation';

// Components
import MapComponent from '../components/home/MapComponent';
import StatusToggle from '../components/home/StatusToggle';
import RideRequestModal from '../components/home/RideRequestModal';
import ActiveRideCard from '../components/home/ActiveRideCard';

const HomeScreen = () => {
  const { driverInfo, userToken, logout } = useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Request permission on mount
  React.useEffect(() => {
    const checkPermission = async () => {
      const granted = await requestLocationPermission();
      setHasPermission(granted);
      if (!granted) {
        Alert.alert(
          'Location Required',
          'This app needs location access to show the map and track rides. Please enable it in settings.',
        );
      }
    };
    checkPermission();
  }, []);

  // Custom Hooks
  const { currentLocation } = useLocation(
    isOnline,
    driverInfo?.id || driverInfo?._id,
    hasPermission,
  );
  const { incomingRide, setIncomingRide, acceptRide, rejectRide, startRide } =
    useSocket(userToken, isOnline, activeRide);

  const handleLogout = () => {
    if (isOnline) {
      Alert.alert('Action Required', 'Please go offline before logging out.');
      return;
    }
    logout();
  };

  const toggleOnlineStatus = async (value: boolean) => {
    try {
      if (value) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Denied',
            'Location access is required to go online.',
          );
          return;
        }
      }

      await api.patch('/driver/status', {
        status: value ? 'ONLINE' : 'OFFLINE',
      });
      setIsOnline(value);
    } catch (error: any) {
      console.log('Status toggle error:', error?.response?.data || error.message);
      Alert.alert(
        'Error',
        `Failed to go ${value ? 'online' : 'offline'}. Please check your connection.`
      );
    }
  };

  const handleAccept = async () => {
    if (incomingRide) {
      const rideData = await acceptRide(
        incomingRide.id,
        driverInfo?.id || driverInfo?._id,
      );
      if (rideData) {
        setActiveRide(rideData);
      }
    }
  };

  const handleArrived = async () => {
    if (activeRide) {
      try {
        const res = await api.patch(
          `/rides/${activeRide._id || activeRide.id}/status`,
          { status: 'ARRIVED' },
        );
        setActiveRide(res.data);
      } catch (error) {
        console.log('Arrived status error:', error);
      }
    }
  };

  const handleStartRide = async (otp: string) => {
    if (activeRide) {
      const res = await startRide(activeRide._id || activeRide.id, otp);
      if (res) {
        setActiveRide(res);
        return true;
      }
    }
    return false;
  };

  const handleComplete = async () => {
    if (activeRide) {
      if (activeRide.id?.startsWith('ride_')) {
        setActiveRide(null);
        Alert.alert('Success', 'Test Ride completed successfully!');
        return;
      }

      try {
        await api.patch(`/rides/${activeRide._id || activeRide.id}/status`, {
          status: 'COMPLETED',
        });
        setActiveRide(null);
        Alert.alert('Success', 'Ride completed successfully!');
      } catch (error) {
        console.log('Ride completion error:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.driverName}>{driverInfo?.name || 'Driver'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Online/Offline Status */}
      <StatusToggle
        isOnline={isOnline}
        onToggle={toggleOnlineStatus}
        disabled={!!activeRide}
      />

      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapComponent
          currentLocation={currentLocation}
          activeRide={activeRide}
          hasPermission={hasPermission}
        />
      </View>

      {activeRide && (
        <ActiveRideCard
          ride={activeRide}
          onArrived={handleArrived}
          onStart={handleStartRide}
          onComplete={handleComplete}
        />
      )}

      <RideRequestModal
        visible={!!incomingRide}
        ride={incomingRide}
        onAccept={handleAccept}
        onReject={() => rejectRide(incomingRide.id, driverInfo?.id)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 2,
  },
  greeting: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  driverName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C1C1E',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '700',
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
  },
});

export default HomeScreen;
