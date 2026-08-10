import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../../lib/config';
import { clearRiderSession, riderAuthHeaders } from '../../lib/session';

type Earning = {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
};

const money = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

export default function EarningsScreen() {
  const router = useRouter();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const headers = await riderAuthHeaders();
      if (!headers) {
        await clearRiderSession();
        router.replace('/(auth)/login');
        return;
      }
      const { data } = await axios.get(`${API_URL}/riders/me/earnings`, { headers });
      setEarnings(data.earnings || []);
      setTotal(Number(data.total) || 0);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        await clearRiderSession();
        router.replace('/(auth)/login');
        return;
      }
      Alert.alert('Earnings unavailable', error.response?.data?.error || 'Pull down to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.label}>Net Balance</Text>
        <Text style={styles.balance}>{money.format(total)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Earnings Log</Text>
      {loading ? <View style={styles.loading}><ActivityIndicator color="#002B7F" /><Text>Loading earnings...</Text></View> : null}
      <FlatList
        data={earnings}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        ListEmptyComponent={!loading ? <View style={styles.empty}><Text style={styles.emptyTitle}>No earnings yet</Text><Text style={styles.emptyCopy}>Completed rider payouts will appear here.</Text></View> : null}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowDesc}>{item.description}</Text>
              <Text style={styles.rowDate}>{new Date(item.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
            </View>
            <Text style={styles.rowVal}>{money.format(item.amount)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#002B7F',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    color: '#E6F0FA',
    fontSize: 13,
  },
  balance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  loading: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  emptyCopy: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F0FA',
    paddingVertical: 16,
  },
  rowDesc: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  rowDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  rowVal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002B7F',
  },
});
