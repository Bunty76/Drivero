import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

interface RideRequestModalProps {
  visible: boolean;
  ride: any;
  onAccept: () => void;
  onReject: () => void;
}

const RideRequestModal: React.FC<RideRequestModalProps> = ({
  visible,
  ride,
  onAccept,
  onReject,
}) => {
  if (!ride) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalSubtitle}>New Ride Request</Text>
              <Text style={styles.modalTitle}>{ride.passengerName}</Text>
            </View>
            <Text style={styles.priceTag}>{ride.estimatedPrice}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rideDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>PICKUP</Text>
                <Text style={styles.detailText}>{ride.pickupLocation}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🏁</Text>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>DROPOFF</Text>
                <Text style={styles.detailText}>{ride.dropoffLocation}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>DISTANCE</Text>
                <Text style={styles.statValue}>{ride.distance}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>RATING</Text>
                <Text style={styles.statValue}>⭐ 4.9</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={onReject}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={onAccept}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptBtnText}>Accept Ride</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1C1C1E',
  },
  priceTag: {
    fontSize: 28,
    fontWeight: '900',
    color: '#34C759',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 15,
  },
  rideDetails: {
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 15,
    marginTop: 10,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '800',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 16,
    color: '#3A3A3C',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '700',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#F2F2F7',
    marginRight: 10,
  },
  acceptBtn: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  rejectBtnText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '700',
  },
  acceptBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default RideRequestModal;
