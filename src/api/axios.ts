import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- CONFIGURATION ---
// Toggle the line below to switch environments:
export const BASE_URL = 'https://ridexbackend.onrender.com'; // 🟢 DEPLOYED (Production)
// export const BASE_URL = 'http://10.0.2.2:5000';           // 📱 EMULATOR (Local)
//export const BASE_URL = 'http://10.192.52.209:5000'; // 🔌 PHYSICAL DEVICE (Local)
// ----------------------

const api = axios.create({
  baseURL: BASE_URL,
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
