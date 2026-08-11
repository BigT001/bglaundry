import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (configured) {
    return configured.endsWith('/api/v1') ? configured : `${configured}/api/v1`;
  }

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && __DEV__) return `http://${host}:5001/api/v1`;

  // Production backend URL for standalone Release APKs (works on 4G/5G/Wi-Fi everywhere)
  return 'https://bglaundry.org/api/v1';
};

const getMapboxToken = () => {
  return process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() || '';
};

export const API_URL = getApiUrl();
export const MAPBOX_TOKEN = getMapboxToken();
