import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Config from 'react-native-config';

// --- CONFIGURATION ---
// BASE_URL is now pulled from the .env file using react-native-config
export const BASE_URL = Config.API_URL || 'http://10.192.52.209:5000'; // Fallback to local IP for dev
// ----------------------

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export default api;
