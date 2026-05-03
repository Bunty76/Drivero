import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface MapComponentProps {
  currentLocation: any;
  onRecenter?: () => void;
}

const DEFAULT_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 20,
  longitudeDelta: 20,
};

const MapComponent: React.FC<MapComponentProps> = ({ currentLocation }) => {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }, 1000);
    }
  }, [currentLocation]);

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
        testID="LiveMapView"
        initialRegion={currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        } : DEFAULT_REGION}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={false}
        onMapReady={() => console.log('Map is ready')}
        onRegionChangeComplete={(region) => console.log('Region changed:', region)}
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Position"
            description="You are here"
          />
        )}
      </MapView>
      
      {currentLocation && (
        <View style={styles.debugCoords}>
          <Text style={styles.debugText}>
            GPS: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </Text>
        </View>
      )}
      {!currentLocation && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Fetching location...</Text>
        </View>
      )}
      
      {currentLocation && (
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
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  recenterIcon: {
    fontSize: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  debugCoords: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MapComponent;
