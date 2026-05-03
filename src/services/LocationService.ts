import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

export const checkLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    // For iOS, we usually just request or rely on the request call, 
    // but Geolocation.requestAuthorization('whenInUse') is what we use.
    return true; // Simplified for this fix
  }

  if (Platform.OS === 'android') {
    return await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
  }
  return false;
};

export const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    const auth = await Geolocation.requestAuthorization('whenInUse');
    return auth === 'granted';
  }

  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Driver Location Permission',
        message: 'We need access to your location so we can track rides.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return false;
};

export const getCurrentLocation = (): Promise<Geolocation.GeoPosition> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve(position);
      },
      error => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
};

export const watchLocation = (
  successCallback: Geolocation.SuccessCallback,
  errorCallback?: Geolocation.ErrorCallback,
): number => {
  return Geolocation.watchPosition(successCallback, errorCallback, {
    enableHighAccuracy: true,
    distanceFilter: 10,
    interval: 5000,
    fastestInterval: 2000,
  });
};

export const clearLocationWatch = (watchId: number) => {
  Geolocation.clearWatch(watchId);
};
