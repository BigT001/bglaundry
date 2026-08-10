import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import type { RiderOrder } from '@bglaundry/rider-core';
import { destinationFor } from '@bglaundry/rider-core';
import { API_URL } from '../../lib/config';
import { clearRiderSession, riderAuthHeaders } from '../../lib/session';

export default function HistoryScreen() {
  const router = useRouter();
  const [completedOrders, setCompletedOrders] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const headers = await riderAuthHeaders();
      if (!headers) {
        await clearRiderSession();
        router.replace('/(auth)/login');
        return;
      }
      const { data } = await axios.get<RiderOrder[]>(`${API_URL}/riders/me/orders`, { headers });
      // Filter orders that have completed pickup or final delivery
      const finished = data.filter(
        (o: any) =>
          o.status === 'PICKED_UP' ||
          o.status === 'DELIVERED' ||
          o.status === 'PROCESSING' ||
          o.status === 'COMPLETED'
      );
      setCompletedOrders(finished);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        await clearRiderSession();
        router.replace('/(auth)/login');
        return;
      }
      Alert.alert('History unavailable', error.response?.data?.error || 'Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PICKED_UP':
        return { label: 'PICKUP COMPLETED', bg: '#DCFCE7', text: '#15803D' };
      case 'DELIVERED':
      case 'COMPLETED':
        return { label: 'DELIVERED', bg: '#DBEAFE', text: '#1D4ED8' };
      default:
        return { label: status.replace(/_/g, ' '), bg: '#F1F5F9', text: '#475569' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Completed Assignments</Text>
        <Text style={styles.headerSubtitle}>
          {completedOrders.length} job{completedOrders.length === 1 ? '' : 's'} completed by you
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002B7F" />
          <Text style={styles.loadingText}>Loading completed jobs...</Text>
        </View>
      ) : (
        <FlatList
          data={completedOrders}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadHistory(true)} tintColor="#002B7F" />
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No completed jobs yet</Text>
              <Text style={styles.emptySubtitle}>
                Jobs you pick up or deliver to customers will appear here in your log.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                  </View>
                </View>

                <Text style={styles.customerName}>{item.customer?.fullName || 'Customer'}</Text>
                <Text style={styles.address}>📍 {destinationFor(item)}</Text>
                <Text style={styles.timestamp}>
                  🕒 {new Date(item.pickupDate).toLocaleString('en-NG', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#002B7F',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#93C5FD',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#002B7F',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  address: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
