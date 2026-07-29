import AsyncStorage from '@react-native-async-storage/async-storage';

export const DRIVER_TOKEN_KEY = '@bglaundry_driver_token';
export const DRIVER_USER_KEY = '@bglaundry_driver_user';

export async function riderToken() {
  return AsyncStorage.getItem(DRIVER_TOKEN_KEY);
}
