import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000/api/v1/mobile' 
  : 'http://localhost:3000/api/v1/mobile';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Log all responses & errors for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API SUCCESS] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response?.status}`);
    console.error('API Error Details:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

