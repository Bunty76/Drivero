import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { AuthContext } from '../store/AuthContext';
import { initSocket, getSocket, disconnectSocket } from '../api/socket';
import api from '../api/axios';
import {
  requestLocationPermission,
  getCurrentLocation,
  watchLocation,
  clearLocationWatch,
} from '../services/LocationService';



const HomeScreen = () => {
  const { driverInfo, userToken, logout } = useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [incomingRide, setIncomingRide] = useState<any>(null);
  const [activeRide, setActiveRide] = useState<any>(null);
  const watchIdRef = useRef<number | null>(null);

  const handleLogout = () => {
    if (isOnline) {
      Alert.alert(
        'Cannot Logout',
        'Please go offline before logging out.',
      );
      return;
    }
    logout();
  };

  useEffect(() => {
    if (userToken) {
      const socket = initSocket(userToken);

      socket.on('ride-request', (rideData: any) => {
        console.log('New ride request received:', rideData);
        if (!activeRide && isOnline) {
          setIncomingRide(rideData);
        }
      });

      socket.on('ride-cancelled', (data: any) => {
        if (incomingRide?.id === data.rideId) {
          setIncomingRide(null);
          Alert.alert('Ride Cancelled', 'The passenger cancelled the request.');
        }
        if (activeRide?.id === data.rideId) {
          setActiveRide(null);
          Alert.alert('Ride Cancelled', 'The passenger cancelled the ride.');
        }
      });
    }

    return () => {
      disconnectSocket();
      if (watchIdRef.current !== null) {
        clearLocationWatch(watchIdRef.current);
      }
    };
  }, [userToken, activeRide, isOnline, incomingRide]);

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

        const position = await getCurrentLocation();
        setCurrentLocation(position.coords);

        watchIdRef.current = watchLocation(
          pos => {
            setCurrentLocation(pos.coords);
            const socket = getSocket();
            if (socket) {
              // Match backend expectations: event 'updateLocation' and coordinates [lng, lat]
              socket.emit('updateLocation', {
                driverId: driverInfo.id || driverInfo._id,
                coordinates: [pos.coords.longitude, pos.coords.latitude],
              });
            }
          },
          err => console.log('Location watch error', err),
        );
      } else {
        if (watchIdRef.current !== null) {
          clearLocationWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      }

      await api.patch('/driver/status', {
        status: value ? 'ONLINE' : 'OFFLINE',
      });
      setIsOnline(value);
    } catch (error) {
      console.log('Status toggle error', error);
      // Fallback for UI if backend fails
      setIsOnline(value);
      if (value && !watchIdRef.current) {
        const hasPermission = await requestLocationPermission();
        if (hasPermission) {
          watchIdRef.current = watchLocation(pos =>
            setCurrentLocation(pos.coords),
          );
        }
      }
    }
  };

  const handleAcceptRide = () => {
    const socket = getSocket();
    if (socket && incomingRide) {
      socket.emit('accept-ride', {
        rideId: incomingRide.id,
        driverId: driverInfo.id,
      });
      setActiveRide(incomingRide);
      setIncomingRide(null);
    }
  };

  const handleRejectRide = () => {
    const socket = getSocket();
    if (socket && incomingRide) {
      socket.emit('reject-ride', {
        rideId: incomingRide.id,
        driverId: driverInfo.id,
      });
      setIncomingRide(null);
    }
  };

  const generateTestRide = () => {
    if (!isOnline) {
      Alert.alert('Go Online', 'You must be online to receive rides.');
      return;
    }
    setIncomingRide({
      id: `ride-${Math.floor(Math.random() * 1000)}`,
      passengerName: 'John Doe',
      pickupLocation: '123 Main St, City Center',
      dropoffLocation: '456 Market St, Downtown',
      estimatedPrice: '$15.50',
      distance: '3.2 miles',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} testID="HomeScreenHeader">
          Welcome, {driverInfo?.name || 'Driver'}
        </Text>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          testID="LogoutButton"
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text
            style={[
              styles.statusValue,
              isOnline ? styles.statusValueOnline : styles.statusValueOffline,
            ]}
            testID="StatusValue"
          >
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={toggleOnlineStatus}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isOnline ? '#34C759' : '#f4f3f4'}
          disabled={!!activeRide}
          testID="OnlineStatusToggle"
        />
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Live Map Area</Text>
        {currentLocation && (
          <Text style={styles.coordsText}>
            Lat: {currentLocation.latitude.toFixed(4)}
            {'\n'}
            Lng: {currentLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      {/* Test Ride Generator */}
      <TouchableOpacity style={styles.testButton} onPress={generateTestRide}>
        <Text style={styles.testButtonText}>🧪 Simulate Ride Request</Text>
      </TouchableOpacity>

      {/* Active Ride Info */}
      {activeRide && (
        <View style={styles.activeRideContainer}>
          <Text style={styles.activeRideTitle}>Active Ride</Text>
          <Text>Passenger: {activeRide.passengerName}</Text>
          <Text>Pickup: {activeRide.pickupLocation}</Text>
          <Text>Dropoff: {activeRide.dropoffLocation}</Text>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => setActiveRide(null)}
          >
            <Text style={styles.completeButtonText}>Complete Ride</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Incoming Ride Modal */}
      <Modal visible={!!incomingRide} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Ride Request</Text>
              <Text style={styles.priceTag}>
                {incomingRide?.estimatedPrice}
              </Text>
            </View>

            <View style={styles.rideDetails}>
              <Text style={styles.detailText}>
                👤 {incomingRide?.passengerName}
              </Text>
              <Text style={styles.detailText}>
                📍 Pickup: {incomingRide?.pickupLocation}
              </Text>
              <Text style={styles.detailText}>
                🏁 Dropoff: {incomingRide?.dropoffLocation}
              </Text>
              <Text style={styles.detailText}>
                📏 Distance: {incomingRide?.distance}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={handleRejectRide}
              >
                <Text style={styles.actionBtnText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={handleAcceptRide}
              >
                <Text style={styles.actionBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50, // for notch
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusValueOnline: {
    color: '#34C759',
  },
  statusValueOffline: {
    color: '#FF3B30',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e1e4e8',
    margin: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5da',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 18,
    color: '#6a737d',
    fontWeight: 'bold',
  },
  coordsText: {
    marginTop: 10,
    fontSize: 14,
    color: '#586069',
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#5856D6',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeRideContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  activeRideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  completeButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  priceTag: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
  rideDetails: {
    marginBottom: 25,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#FF3B30',
    marginRight: 10,
  },
  acceptBtn: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
