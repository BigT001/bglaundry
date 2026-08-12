import Constants from 'expo-constants';

const getApiUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (configuredUrl) {
    return configuredUrl.endsWith('/api/v1') ? configuredUrl : `${configuredUrl}/api/v1`;
  }

  // Live production backend URL for all release APKs (works on 4G/5G/Wi-Fi everywhere)
  return 'https://www.bglaundry.org/api/v1';
};

export const API_URL = getApiUrl();
