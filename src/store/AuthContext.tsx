import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  userToken: string | null;
  driverInfo: any | null;
  login: (token: string, driver: any) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  driverInfo: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [driverInfo, setDriverInfo] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (token: string, driver: any) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('driverInfo', JSON.stringify(driver));
      setUserToken(token);
      setDriverInfo(driver);
    } catch (e) {
      console.error('Error storing auth info', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('driverInfo');
      setUserToken(null);
      setDriverInfo(null);
    } catch (e) {
      console.error('Error removing auth info', e);
    }
  };

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const driver = await AsyncStorage.getItem('driverInfo');
      if (token && driver) {
        setUserToken(token);
        setDriverInfo(JSON.parse(driver));
      }
    } catch (e) {
      console.error('Error checking token', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{ userToken, driverInfo, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
