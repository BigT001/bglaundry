import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (configuredUrl) {
    return configuredUrl.endsWith('/api/v1') ? configuredUrl : `${configuredUrl}/api/v1`;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri && __DEV__) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5001/api/v1`;
  }

  // Production backend URL for standalone Release APKs (works on 4G/5G/Wi-Fi everywhere)
  return 'https://bglaundry.org/api/v1';
};

export const API_URL = getApiUrl();
