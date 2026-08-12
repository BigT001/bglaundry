import { Platform } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';
import { API_URL } from './config';
import { getCustomerSession } from './session';

let registrationInFlight: Promise<void> | null = null;

export const registerForLiveNotifications = async () => {
  if (Platform.OS === 'web') return;
  if (registrationInFlight) return registrationInFlight;

  registrationInFlight = (async () => {
    try {
      const { token: sessionToken } = await getCustomerSession();
      if (!sessionToken) return;

      const Notifications = await import('expo-notifications');

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      const currentPermissions = await Notifications.getPermissionsAsync();
      let finalStatus = (currentPermissions as any).status || ((currentPermissions as any).granted ? 'granted' : 'denied');
      if (finalStatus !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus = (requested as any).status || ((requested as any).granted ? 'granted' : 'denied');
      }
      if (finalStatus !== 'granted') return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('orders', {
          name: 'Order updates',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0066FF',
        });
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;
      const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

      await axios.post(
        `${API_URL}/users/push-token`,
        {
          token: pushToken,
          platform: Platform.OS,
        },
        {
          headers: { Authorization: `Bearer ${sessionToken}` },
        },
      );
    } catch (error) {
      console.warn('Live notification registration skipped:', error);
    }
  })().finally(() => {
    registrationInFlight = null;
  });

  return registrationInFlight;
};
