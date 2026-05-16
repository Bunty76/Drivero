import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Config from 'react-native-config';

interface MapComponentProps {
  currentLocation: any;
  activeRide?: any;
  hasPermission?: boolean | null;
}

const DEFAULT_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 20,
  longitudeDelta: 20,
};

const GOOGLE_MAPS_API_KEY = Config.GOOGLE_MAPS_API_KEY || 'AIzaSyC88IFZSwx3opLJyYFR10A52GbRkIP1ET4';

// --- Custom Marker Components ---

const PickupMarker = () => (
  <View style={styles.markerContainer}>
    <View style={[styles.outerCircle, { borderColor: '#007AFF' }]}>
      <View style={[styles.innerCircle, { backgroundColor: '#007AFF' }]} />
    </View>
    <View style={[styles.markerLabel, { backgroundColor: '#007AFF' }]}>
      <Text style={styles.markerLabelText}>PICKUP</Text>
    </View>
  </View>
);

const DropoffMarker = () => (
  <View style={styles.markerContainer}>
    <View style={[styles.outerSquare, { borderColor: '#111827' }]}>
      <View style={[styles.innerSquare, { backgroundColor: '#111827' }]} />
    </View>
    <View style={[styles.markerLabel, { backgroundColor: '#111827' }]}>
      <Text style={styles.markerLabelText}>DROP-OFF</Text>
    </View>
  </View>
);

const MapComponent: React.FC<MapComponentProps> = ({ currentLocation, activeRide, hasPermission }) => {
  const mapRef = useRef<MapView | null>(null);
  const [debugInfo, setDebugInfo] = useState('');

  const getCoords = (data: any) => {
    if (!data) return null;
    
    // If it's an array [lng, lat]
    if (Array.isArray(data) && data.length === 2) {
      return { latitude: Number(data[1]), longitude: Number(data[0]) };
    }

    // If it's an object
    if (typeof data === 'object') {
      if (data.latitude && data.longitude) return { latitude: Number(data.latitude), longitude: Number(data.longitude) };
      if (data.lat && data.lng) return { latitude: Number(data.lat), longitude: Number(data.lng) };

      if (Array.isArray(data.coordinates)) {
        return { latitude: Number(data.coordinates[1]), longitude: Number(data.coordinates[0]) };
      }
      
      const nested = data.location || data.coords || data.coord || data.position;
      if (nested) return getCoords(nested);
    }

    return null;
  };

  const pickupCoords = activeRide ? (getCoords(activeRide.pickupLocation) || getCoords(activeRide.pickup)) : null;
  const dropoffCoords = activeRide ? (getCoords(activeRide.dropoffLocation) || getCoords(activeRide.dropoff)) : null;
  const driverCoords = currentLocation ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude } : null;

  const rideStatus = activeRide?.status || 'ACCEPTED';

  useEffect(() => {
    if (activeRide) {
      setDebugInfo(`Pickup: ${pickupCoords ? 'YES' : 'NO'}, Dropoff: ${dropoffCoords ? 'YES' : 'NO'}`);
    } else {
      setDebugInfo('');
    }
  }, [activeRide, pickupCoords, dropoffCoords]);

  useEffect(() => {
    let points: any[] = [];
    
    if (activeRide && pickupCoords && dropoffCoords) {
      if (driverCoords) {
        points = [driverCoords, pickupCoords, dropoffCoords];
      } else {
        points = [pickupCoords, dropoffCoords];
      }
    } else if (currentLocation) {
      points = [{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }];
    }

    if (points.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(points, {
          edgePadding: { top: 100, right: 100, bottom: 400, left: 100 },
          animated: true,
        });
      }, 1000);
    }
  }, [currentLocation, activeRide, pickupCoords, dropoffCoords, rideStatus]);

  const recenterMap = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }, 600);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        } : DEFAULT_REGION}
        showsUserLocation={!!hasPermission}
        showsMyLocationButton={false}
      >
        {activeRide && pickupCoords && dropoffCoords && (
          <>
            <Marker coordinate={pickupCoords} anchor={{x: 0.5, y: 0.5}}>
              <PickupMarker />
            </Marker>
            
            <Marker coordinate={dropoffCoords} anchor={{x: 0.5, y: 0.5}}>
              <DropoffMarker />
            </Marker>

            {/* FIRST SHORTEST ROUTE: Driver -> Pickup */}
            {(rideStatus === 'ACCEPTED' || rideStatus === 'ARRIVED') && driverCoords && (
              <MapViewDirections
                origin={driverCoords}
                destination={pickupCoords}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={5}
                strokeColor="#007AFF"
                optimizeWaypoints={true}
              />
            )}

            {/* SECOND SHORTEST ROUTE: Pickup -> Dropoff */}
            {activeRide && (
              <MapViewDirections
                origin={pickupCoords}
                destination={dropoffCoords}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={5}
                strokeColor={rideStatus === 'STARTED' ? '#007AFF' : 'rgba(0, 122, 255, 0.4)'}
                optimizeWaypoints={true}
              />
            )}
          </>
        )}
      </MapView>
      
      {debugInfo !== '' && (
        <View style={styles.debugPanel}>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
      )}

      {currentLocation && !activeRide && (
        <TouchableOpacity 
          style={styles.recenterButton} 
          onPress={recenterMap}
          activeOpacity={0.7}
        >
          <Text style={styles.recenterIcon}>🎯</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  recenterIcon: {
    fontSize: 24,
  },
  debugPanel: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // --- Custom Marker Styles ---
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  outerSquare: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 3,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  innerSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  markerLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  markerLabelText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
});

export default MapComponent;
