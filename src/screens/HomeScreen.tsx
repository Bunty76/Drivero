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

  // Request permission on mount
  React.useEffect(() => {
    const checkPermission = async () => {
      const granted = await requestLocationPermission();
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
  const { currentLocation } = useLocation(isOnline, driverInfo?.id || driverInfo?._id);
  const { incomingRide, setIncomingRide, acceptRide, rejectRide } = useSocket(
    userToken,
    isOnline,
    activeRide
  );

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
          Alert.alert('Permission Denied', 'Location access is required to go online.');
          return;
        }
      }

      await api.patch('/driver/status', {
        status: value ? 'ONLINE' : 'OFFLINE',
      });
      setIsOnline(value);
    } catch (error) {
      console.log('Status toggle error', error);
      // Fallback for UI if backend fails (optimistic update)
      setIsOnline(value);
    }
  };

  const handleAccept = () => {
    if (incomingRide) {
      acceptRide(incomingRide.id, driverInfo.id);
      setActiveRide(incomingRide);
    }
  };

  const handleReject = () => {
    if (incomingRide) {
      rejectRide(incomingRide.id, driverInfo.id);
    }
  };

  const generateTestRide = () => {
    if (!isOnline) {
      Alert.alert('Status Offline', 'Go online to receive ride requests.');
      return;
    }
    setIncomingRide({
      id: `ride-${Math.floor(Math.random() * 1000)}`,
      passengerName: 'Jessica Smith',
      pickupLocation: 'Grand Central Terminal, NY',
      dropoffLocation: 'Central Park West, NY',
      estimatedPrice: '$24.50',
      distance: '2.8 miles',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.driverName} testID="HomeScreenHeader">
            {driverInfo?.name || 'Driver'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.7}
          testID="LogoutButton"
        >
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
        <MapComponent currentLocation={currentLocation} />
      </View>

      {/* Test Ride Button */}
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={generateTestRide}
        activeOpacity={0.8}
      >
        <Text style={styles.testButtonText}>🚀 Simulate Ride Request</Text>
      </TouchableOpacity>

      {/* Active Ride Overlay */}
      {activeRide && (
        <ActiveRideCard 
          ride={activeRide} 
          onComplete={() => setActiveRide(null)} 
        />
      )}

      {/* Incoming Request Modal */}
      <RideRequestModal
        visible={!!incomingRide}
        ride={incomingRide}
        onAccept={handleAccept}
        onReject={handleReject}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  testButton: {
    backgroundColor: '#5856D6',
    marginHorizontal: 25,
    marginBottom: 25,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#5856D6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
