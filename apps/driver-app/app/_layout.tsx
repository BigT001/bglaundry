import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="orders/[id]/route" options={{ title: 'Route Details', headerShown: true }} />
      <Stack.Screen name="orders/[id]/confirm" options={{ title: 'OTP Verification', headerShown: true }} />
    </Stack>
  );
}
