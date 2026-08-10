import AsyncStorage from '@react-native-async-storage/async-storage';

export const DRIVER_TOKEN_KEY = '@bglaundry_driver_token';
export const DRIVER_USER_KEY = '@bglaundry_driver_user';

export async function riderToken() {
  return AsyncStorage.getItem(DRIVER_TOKEN_KEY);
}

export async function clearRiderSession() {
  await AsyncStorage.multiRemove([DRIVER_TOKEN_KEY, DRIVER_USER_KEY]);
}

export async function riderAuthHeaders() {
  const token = await riderToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
}
