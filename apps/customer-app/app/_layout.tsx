import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { registerCrashReporter } from '../lib/crash-reporting';

export default function RootLayout() {
  useEffect(() => {
    registerCrashReporter();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="booking" options={{ headerShown: false }} />
      <Stack.Screen name="orders/[id]/track" options={{ title: 'Track Order', headerShown: true }} />
    </Stack>
  );
}
