import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import type { RiderOrder } from '@bglaundry/rider-core';
import { destinationFor, jobKind } from '@bglaundry/rider-core';
import { API_URL } from '../../lib/config';
import { clearRiderSession, riderAuthHeaders } from '../../lib/session';

type FilterType = 'ALL' | 'PICKUP' | 'DELIVERY';

export default function DriverDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('ALL');

  const loadAssignments = useCallback(
    async (isRefresh = false) => {
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
        setOrders(data);
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          await clearRiderSession();
          router.replace('/(auth)/login');
        } else {
          Alert.alert(
            'Assignments unavailable',
            error.response?.data?.error || 'Pull down to refresh assignments.'
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    void loadAssignments();
    const timer = setInterval(() => loadAssignments(true), 15000);
    return () => clearInterval(timer);
  }, [loadAssignments]);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'PICKUP') {
      return o.status === 'PICKUP_PENDING' || o.status === 'PICKUP_IN_PROGRESS';
    }
    if (filter === 'DELIVERY') {
      return o.status === 'DELIVERY_PENDING' || o.status === 'DELIVERY_IN_PROGRESS';
    }
    return true;
  });

  const handleCallCustomer = (phone?: string) => {
    if (!phone) {
      Alert.alert('Phone Unavailable', 'Customer phone number is not available.');
      return;
    }
    const cleanPhone = phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Error', 'Could not initiate call to customer.');
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002B7F" />
        <Text style={styles.loadingText}>Fetching assigned routes & customers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Active Assignments</Text>
        <Text style={styles.summaryCount}>
          {orders.length} assigned stop{orders.length === 1 ? '' : 's'} on duty
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            All ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'PICKUP' && styles.filterPillActive]}
          onPress={() => setFilter('PICKUP')}
        >
          <Text style={[styles.filterText, filter === 'PICKUP' && styles.filterTextActive]}>
            Pickups ({orders.filter((o) => o.status.includes('PICKUP')).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'DELIVERY' && styles.filterPillActive]}
          onPress={() => setFilter('DELIVERY')}
        >
          <Text style={[styles.filterText, filter === 'DELIVERY' && styles.filterTextActive]}>
            Deliveries ({orders.filter((o) => o.status.includes('DELIVERY')).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Assignments List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAssignments(true)}
            tintColor="#002B7F"
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No active assignments</Text>
            <Text style={styles.emptySubtitle}>
              New customer pickup or delivery jobs assigned by dispatch will automatically show up here.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isPickup = item.status.includes('PICKUP');
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({ pathname: '/orders/[id]/route', params: { id: item.id } })
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.stopNumberBadge}>
                  <Text style={styles.stopNumberText}>{index + 1}</Text>
                </View>

                <View style={styles.cardTitleBox}>
                  <Text style={styles.customerName}>{item.customer?.fullName || 'Customer'}</Text>
                  <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
                </View>

                <View
                  style={[
                    styles.kindBadge,
                    { backgroundColor: isPickup ? '#EFF6FF' : '#F0FDF4' },
                  ]}
                >
                  <Text
                    style={[
                      styles.kindBadgeText,
                      { color: isPickup ? '#1D4ED8' : '#15803D' },
                    ]}
                  >
                    {jobKind(item.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.addressText}>📍 {destinationFor(item)}</Text>
              <Text style={styles.timeText}>
                🕒 Scheduled:{' '}
                {new Date(item.pickupDate).toLocaleString('en-NG', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </Text>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCallCustomer(item.customer?.phoneNumber)}
                >
                  <Text style={styles.callBtnText}>📞 Call Customer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.routeBtn}
                  onPress={() =>
                    router.push({ pathname: '/orders/[id]/route', params: { id: item.id } })
                  }
                >
                  <Text style={styles.routeBtnText}>Start Navigation ›</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryCard: {
    backgroundColor: '#002B7F',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryCount: {
    fontSize: 13,
    color: '#93C5FD',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#002B7F',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stopNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0284C7',
  },
  cardTitleBox: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  orderNumber: {
    fontSize: 12,
    color: '#002B7F',
    fontWeight: '600',
    marginTop: 2,
  },
  kindBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kindBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  callBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  callBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  routeBtn: {
    flex: 1.2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#002B7F',
    alignItems: 'center',
  },
  routeBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
