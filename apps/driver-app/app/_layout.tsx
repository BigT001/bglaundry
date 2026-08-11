import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DRIVER_TOKEN_KEY } from '../lib/session';

// Keep splash screen visible while we fetch auth token
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await AsyncStorage.getItem(DRIVER_TOKEN_KEY);
        const inAuthGroup = segments[0] === '(auth)';

        if (!token && !inAuthGroup) {
          try {
            router.replace('/login' as any);
          } catch {
            router.replace('/(auth)/login' as any);
          }
        } else if (token && inAuthGroup) {
          try {
            router.replace('/' as any);
          } catch {
            router.replace('/(tabs)' as any);
          }
        }
      } catch (e) {
        console.error('[Rider Auth Error]', e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }
    void checkAuth();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="orders/[id]/route" options={{ title: 'Route Details', headerShown: true }} />
      <Stack.Screen name="orders/[id]/confirm" options={{ title: 'OTP Verification', headerShown: true }} />
    </Stack>
  );
}
