// Utility to test backend connection
import { reportsAPI } from '../services/api';

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '')
).replace(/\/api\/?$/, '');

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    const response = await fetch(`${API_ORIGIN}/health`);
    const data = await response.json();
    console.log('✅ Backend is running:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    console.error(`Make sure backend is running on ${API_ORIGIN}`);
    return false;
  }
};

export const testAPIEndpoint = async () => {
  try {
    console.log('Testing API endpoint...');
    const data = await reportsAPI.getAll();
    console.log('✅ API endpoint working. Reports:', data.length);
    return true;
  } catch (error) {
    console.error('❌ API endpoint failed:', error);
    return false;
  }
};

