jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-geolocation-service', () => ({
  requestAuthorization: jest.fn(() => Promise.resolve('granted')),
  getCurrentPosition: jest.fn((success, _error, _options) => {
    success({ coords: { latitude: 37.78825, longitude: -122.4324 } });
  }),
  watchPosition: jest.fn((success) => {
    success({ coords: { latitude: 37.78825, longitude: -122.4324 } });
    return 1;
  }),
  clearWatch: jest.fn(),
}));

jest.mock('react-native-permissions', () => ({
  request: jest.fn(() => Promise.resolve('granted')),
  PERMISSIONS: {
    ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
  },
  RESULTS: {
    GRANTED: 'granted',
  },
}));

jest.mock('socket.io-client', () => {
  const mSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    id: 'test-socket-id',
  };
  return {
    io: jest.fn(() => mSocket),
    Socket: jest.fn(() => mSocket),
  };
});
