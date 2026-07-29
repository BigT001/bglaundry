import Constants from 'expo-constants';

const configured = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const host = Constants.expoConfig?.hostUri?.split(':')[0];

export const API_URL = configured || (host ? `http://${host}:4000/api/v1` : 'http://localhost:4000/api/v1');
export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
