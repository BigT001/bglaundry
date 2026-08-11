import AsyncStorage from '@react-native-async-storage/async-storage';

export const CUSTOMER_TOKEN_KEY = '@bglaundry_token';
export const CUSTOMER_USER_KEY = '@bglaundry_user';

const cleanToken = (value: unknown) => {
  const token = typeof value === 'string' ? value.trim() : '';
  return token && token !== 'undefined' && token !== 'null' ? token : '';
};

export const saveCustomerSession = async (tokenValue: string, userValue: any) => {
  const token = cleanToken(tokenValue);
  if (!token || !userValue?.id) {
    throw new Error('A valid login session was not returned. Please request a new code and try again.');
  }

  const user = {
    ...userValue,
    sessionToken: token,
  };

  await AsyncStorage.multiSet([
    [CUSTOMER_TOKEN_KEY, token],
    [CUSTOMER_USER_KEY, JSON.stringify(user)],
  ]);

  const savedToken = cleanToken(await AsyncStorage.getItem(CUSTOMER_TOKEN_KEY));
  if (!savedToken) {
    throw new Error('Your login session could not be saved on this device. Please try again.');
  }

  return { token: savedToken, user };
};

export const getCustomerSession = async () => {
  const entries = await AsyncStorage.multiGet([CUSTOMER_TOKEN_KEY, CUSTOMER_USER_KEY]);
  const tokenFromStorage = cleanToken(entries[0]?.[1]);
  const userJson = entries[1]?.[1];
  let user: any = null;

  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      user = null;
    }
  }

  const backupToken = cleanToken(user?.sessionToken || user?.token);
  const token = tokenFromStorage || backupToken;

  if (token && !tokenFromStorage) {
    await AsyncStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  }

  if (token && user && user.sessionToken !== token) {
    user = { ...user, sessionToken: token };
    await AsyncStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
  }

  return { token, user };
};

export const clearCustomerSession = async () => {
  await AsyncStorage.multiRemove([CUSTOMER_TOKEN_KEY, CUSTOMER_USER_KEY]);
};
