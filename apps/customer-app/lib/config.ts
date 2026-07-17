import Constants from 'expo-constants';

const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:4000/api/v1`;
  }
  return 'http://localhost:4000/api/v1';
};

export const API_URL = getApiUrl();
