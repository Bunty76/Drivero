import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';
import { AuthContext } from '../src/store/AuthContext';
import { getSocket } from '../src/api/socket';
import { Alert } from 'react-native';
import * as LocationService from '../src/services/LocationService';

const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('../src/api/socket', () => ({
  initSocket: jest.fn(() => mockSocket),
  getSocket: jest.fn(() => mockSocket),
  disconnectSocket: jest.fn(),
}));

jest.mock('../src/api/axios', () => ({
  patch: jest.fn().mockResolvedValue({}),
}));

describe('HomeScreen', () => {
  const mockLogout = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
    jest.spyOn(LocationService, 'requestLocationPermission').mockResolvedValue(true);
    jest.spyOn(LocationService, 'getCurrentLocation').mockResolvedValue({
      coords: { latitude: 10, longitude: 20 },
      timestamp: 12345
    } as any);
  });

  const setup = () => {
    return render(
      <AuthContext.Provider value={{
        userToken: 'fake-token',
        driverInfo: { id: 'd1', name: 'Test Driver' },
        login: jest.fn(),
        logout: mockLogout,
        isLoading: false
      }}>
        <HomeScreen />
      </AuthContext.Provider>
    );
  };

  it('renders driver name and default offline status', () => {
    const { getByText } = setup();
    expect(getByText('Welcome, Test Driver')).toBeTruthy();
    expect(getByText('OFFLINE')).toBeTruthy();
  });

  it('calls logout when logout button is pressed', () => {
    const { getByText } = setup();
    fireEvent.press(getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('toggles online status and requests location', async () => {
    const { getByRole, getByText } = setup();
    
    // The Switch component usually has role="switch"
    const toggle = getByRole('switch');
    fireEvent(toggle, 'valueChange', true);

    await waitFor(() => {
      expect(LocationService.requestLocationPermission).toHaveBeenCalled();
      expect(LocationService.getCurrentLocation).toHaveBeenCalled();
      expect(getByText('ONLINE')).toBeTruthy();
      // It displays coordinates
      expect(getByText(/Lat: 37.788/)).toBeTruthy();
    });
  });

  it('simulates test ride request and opens modal', async () => {
    const { getByRole, getByText, queryByText } = setup();
    
    // First go online
    const toggle = getByRole('switch');
    fireEvent(toggle, 'valueChange', true);

    await waitFor(() => {
      expect(getByText('ONLINE')).toBeTruthy();
    });

    // Simulate ride
    fireEvent.press(getByText('🧪 Simulate Ride Request'));

    await waitFor(() => {
      expect(getByText('New Ride Request')).toBeTruthy();
      expect(getByText('👤 John Doe')).toBeTruthy();
    });

    // Accept ride
    const socket = getSocket();
    fireEvent.press(getByText('Accept'));

    await waitFor(() => {
      expect(queryByText('New Ride Request')).toBeNull(); // Modal closed
      expect(getByText('Active Ride')).toBeTruthy(); // Active ride container visible
      expect(socket?.emit).toHaveBeenCalledWith('accept-ride', expect.any(Object));
    });
  });
});
