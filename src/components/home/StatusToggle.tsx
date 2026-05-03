import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

interface StatusToggleProps {
  isOnline: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ isOnline, onToggle, disabled }) => {
  return (
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
        onValueChange={onToggle}
        trackColor={{ false: '#D1D1D6', true: '#34C759' }}
        thumbColor={'#fff'}
        ios_backgroundColor="#D1D1D6"
        disabled={disabled}
        testID="OnlineStatusToggle"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  statusValueOnline: {
    color: '#34C759',
  },
  statusValueOffline: {
    color: '#FF3B30',
  },
});

export default StatusToggle;
