import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (configuredUrl) {
    return configuredUrl.endsWith('/api/v1') ? configuredUrl : `${configuredUrl}/api/v1`;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5001/api/v1`;
  }

  // Active Wi-Fi IP address fallback for standalone Release APKs
  return 'http://192.168.18.4:5001/api/v1';
};

export const API_URL = getApiUrl();
