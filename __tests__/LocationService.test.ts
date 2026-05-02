import { requestLocationPermission, getCurrentLocation } from '../src/services/LocationService';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

describe('LocationService', () =>
 {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestLocationPermission', () => {
    it('should request authorization on iOS and return true if granted', async () => {
      Platform.OS = 'ios';
      (Geolocation.requestAuthorization as jest.Mock).mockResolvedValueOnce('granted');
      
      const result = await requestLocationPermission();
      
      expect(Geolocation.requestAuthorization).toHaveBeenCalledWith('whenInUse');
      expect(result).toBe(true);
    });

    it('should request permission on Android and return true if granted', async () => {
      Platform.OS = 'android';
      jest.spyOn(PermissionsAndroid, 'request').mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);
      
      const result = await requestLocationPermission();
      
      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        expect.any(Object)
      );
      expect(result).toBe(true);
    });
  });

  describe('getCurrentLocation', () => {
    it('should return location coordinates', async () => {
      const position = await getCurrentLocation();
      expect(Geolocation.getCurrentPosition).toHaveBeenCalled();
      expect(position.coords.latitude).toBe(37.78825);
    });
  });
});
