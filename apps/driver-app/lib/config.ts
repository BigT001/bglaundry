import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (configured) {
    return configured.endsWith('/api/v1') ? configured : `${configured}/api/v1`;
  }

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:5001/api/v1`;

  return 'http://192.168.18.4:5001/api/v1';
};

const getMapboxToken = () => {
  return process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() || '';
};

export const API_URL = getApiUrl();
export const MAPBOX_TOKEN = getMapboxToken();
