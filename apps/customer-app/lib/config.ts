import Constants from 'expo-constants';

const isLocalOnlyUrl = (value: string) => {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('172.') ||
      /^169\.254\./.test(host)
    );
  } catch {
    return false;
  }
};

const getApiUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (configuredUrl && !isLocalOnlyUrl(configuredUrl)) {
    return configuredUrl.endsWith('/api/v1') ? configuredUrl : `${configuredUrl}/api/v1`;
  }

  // Live production backend URL for all release APKs (works on 4G/5G/Wi-Fi everywhere)
  return 'https://www.bglaundry.org/api/v1';
};

export const API_URL = getApiUrl();
