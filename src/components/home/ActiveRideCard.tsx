import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ActiveRideCardProps {
  ride: any;
  onComplete: () => void;
}

const ActiveRideCard: React.FC<ActiveRideCardProps> = ({ ride, onComplete }) => {
  if (!ride) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.statusBadge}>ONGOING RIDE</Text>
        <Text style={styles.passengerName}>{ride.passengerName}</Text>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.pickupLocation}
          </Text>
        </View>
        <View style={styles.line} />
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.dropoffLocation}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={onComplete}
        activeOpacity={0.8}
      >
        <Text style={styles.completeButtonText}>Finish Ride</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#007AFF',
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  line: {
    width: 1,
    height: 15,
    backgroundColor: '#E5E5EA',
    marginLeft: 3.5,
    marginVertical: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#3A3A3C',
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ActiveRideCard;
