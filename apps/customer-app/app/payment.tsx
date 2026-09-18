import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PaymentResultScreen() {
  const router = useRouter();
  const { status } = useLocalSearchParams<{ status?: string }>();
  const successful = status === 'successful';

  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/(tabs)/orders' as any), 500);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color="#0066FF" size="large" />
      <Text style={styles.title}>{successful ? 'Payment confirmed' : 'Checking payment'}</Text>
      <Text style={styles.message}>Returning you to your orders...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#FFFFFF' },
  title: { marginTop: 18, color: '#0F172A', fontSize: 22, fontWeight: '700' },
  message: { marginTop: 8, color: '#64748B', fontSize: 15 },
});