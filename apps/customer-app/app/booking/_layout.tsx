import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="select" />
      <Stack.Screen name="basket" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="checkout" />
    </Stack>
  );
}
