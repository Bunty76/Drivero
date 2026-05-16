import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';

interface ActiveRideCardProps {
  ride: any;
  onStart: (otp: string) => Promise<boolean>;
  onComplete: () => void;
  onArrived: () => void;
}

const ActiveRideCard: React.FC<ActiveRideCardProps> = ({ ride, onStart, onComplete, onArrived }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Use local state if ride doesn't have status (for test rides)
  const [localStatus, setLocalStatus] = useState<'ACCEPTED' | 'ARRIVED' | 'STARTED'>('ACCEPTED');
  
  const status = ride?.status || localStatus;

  const handleArrived = () => {
    if (ride.id?.startsWith('ride_')) {
      setLocalStatus('ARRIVED');
    } else {
      onArrived();
    }
  };

  const handleStartRide = async () => {
    if (otp.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter a 4-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      if (ride.id?.startsWith('ride_')) {
        // Mock success for test rides
        setLocalStatus('STARTED');
      } else {
        const success = await onStart(otp);
        if (!success) {
          // Error handled in useSocket
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Text style={styles.statusBadge}>
            {status === 'ACCEPTED' ? 'HEADING TO PICKUP' : status === 'ARRIVED' ? 'ARRIVED AT PICKUP' : 'ONGOING RIDE'}
          </Text>
          {ride.otp && status === 'ARRIVED' && (
             <Text style={[styles.statusBadge, { marginLeft: 8, backgroundColor: '#FFF9E5', color: '#B28400' }]}>
               DEBUG: {ride.otp}
             </Text>
          )}
        </View>
        <Text style={styles.passengerName}>{ride.passengerName || 'Bhai B'}</Text>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.pickupLocation?.address || ride.pickupLocation}
          </Text>
        </View>
        <View style={styles.line} />
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.dropoffLocation?.address || ride.dropoffLocation}
          </Text>
        </View>
      </View>

      {status === 'ACCEPTED' && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleArrived}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>I have Arrived</Text>
        </TouchableOpacity>
      )}

      {status === 'ARRIVED' && (
        <View style={styles.otpSection}>
          <Text style={styles.otpLabel}>Enter OTP to Start Ride</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="0 0 0 0"
            keyboardType="number-pad"
            maxLength={4}
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartRide}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Start Ride</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {status === 'STARTED' && (
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: '#34C759' }]}
          onPress={onComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Finish Ride</Text>
        </TouchableOpacity>
      )}
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  primaryButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  otpSection: {
    width: '100%',
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 10,
    fontWeight: '600',
  },
  otpInput: {
    width: '100%',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 15,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 10,
    marginBottom: 15,
    color: '#1C1C1E',
  },
});

export default ActiveRideCard;
