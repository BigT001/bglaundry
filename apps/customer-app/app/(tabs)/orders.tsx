import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../lib/config';

interface OrderItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  items: Array<{ quantity: number; serviceName: string }>;
}

export default function OrdersScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [token, userValue] = await Promise.all([
        AsyncStorage.getItem('@bglaundry_token'),
        AsyncStorage.getItem('@bglaundry_user'),
      ]);
      const user = userValue ? JSON.parse(userValue) : null;
      if (!token || !user?.id) throw new Error('Your session has expired. Please sign in again.');
      const headers = { Authorization: `Bearer ${token}` };
      const [activeResponse, historyResponse] = await Promise.all([
        axios.get(`${API_URL}/orders/customer/${user.id}`, { headers }),
        axios.get(`${API_URL}/orders/customer/${user.id}?history=true`, { headers }),
      ]);
      const combined = [...(activeResponse.data || []), ...(historyResponse.data || [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(combined);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to load your orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'PICKUP_PENDING':
        return {
          label: 'Pickup Pending',
          bgColor: '#EFF6FF',
          textColor: '#2563EB',
          icon: 'clock',
          iconColor: '#2563EB'
        };
      case 'PICKUP_IN_PROGRESS':
        return {
          label: 'Rider En Route',
          bgColor: '#EFF6FF',
          textColor: '#2563EB',
          icon: 'truck',
          iconColor: '#2563EB'
        };
      case 'PICKED_UP':
        return {
          label: 'Picked Up',
          bgColor: '#F3E8FF',
          textColor: '#7C3AED',
          icon: 'package',
          iconColor: '#7C3AED'
        };
      case 'PROCESSING':
        return {
          label: 'Processing',
          bgColor: '#F3E8FF',
          textColor: '#7C3AED',
          icon: 'loader',
          iconColor: '#7C3AED'
        };
      case 'DELIVERY_PENDING':
        return {
          label: 'Delivery Pending',
          bgColor: '#FEF3C7',
          textColor: '#B45309',
          icon: 'clock',
          iconColor: '#B45309'
        };
      case 'DELIVERY_IN_PROGRESS':
        return {
          label: 'Out for Delivery',
          bgColor: '#FEF3C7',
          textColor: '#B45309',
          icon: 'navigation',
          iconColor: '#B45309'
        };
      case 'DELIVERED':
        return {
          label: 'Delivered',
          bgColor: '#ECFDF5',
          textColor: '#059669',
          icon: 'check-circle',
          iconColor: '#059669'
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          bgColor: '#FEE2E2',
          textColor: '#DC2626',
          icon: 'x-circle',
          iconColor: '#DC2626'
        };
      default:
        return {
          label: status,
          bgColor: '#F1F5F9',
          textColor: '#64748B',
          icon: 'help-circle',
          iconColor: '#64748B'
        };
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'ACTIVE') return order.status !== 'DELIVERED';
    if (filter === 'COMPLETED') return order.status === 'DELIVERED';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Dynamic Filter Tabs */}
      <View style={styles.tabContainer}>
        {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.tabBtn,
              filter === type && styles.tabBtnActive
            ]}
            onPress={() => setFilter(type)}
          >
            <Text style={[
              styles.tabText,
              filter === type && styles.tabTextActive
            ]}>
              {type === 'ALL' ? 'All Orders' : type === 'ACTIVE' ? 'Active' : 'Completed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadOrders(true)} tintColor="#0066FF" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? <ActivityIndicator size="large" color="#0066FF" /> : <Feather name={error ? 'alert-circle' : 'folder'} size={48} color="#94A3B8" />}
            <Text style={styles.emptyText}>{loading ? 'Loading your orders…' : error || 'No orders found in this category'}</Text>
            {!loading && error ? <TouchableOpacity onPress={() => loadOrders()}><Text style={{ color: '#0066FF', fontWeight: '700' }}>Try again</Text></TouchableOpacity> : null}
          </View>
        }
        renderItem={({ item }) => {
          const statusConfig = getStatusDetails(item.status);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/orders/${item.id}/track`)}
            >
              {/* Header row: Order ID & Status */}
              <View style={styles.cardHeader}>
                <View style={styles.orderIdContainer}>
                  <MaterialCommunityIcons name="clipboard-text-outline" size={18} color="#0F172A" />
                  <Text style={styles.orderId}>{item.orderNumber}</Text>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                  <Feather name={statusConfig.icon as any} size={11} color={statusConfig.textColor} style={{ marginRight: 4 }} />
                  <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              {/* Items Summary */}
              <Text style={styles.details}>
                {item.items.reduce((sum, orderItem) => sum + orderItem.quantity, 0)} items · {Array.from(new Set(item.items.map((orderItem) => orderItem.serviceName))).slice(0, 2).join(', ')}
              </Text>

              {/* Footer row: Date & Amount */}
              <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                  <Feather name="calendar" size={13} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text style={styles.amount}>₦{item.totalAmount.toLocaleString('en-NG')}</Text>
                  <Feather name="chevron-right" size={16} color="#94A3B8" style={{ marginLeft: 4 }} />
                </View>
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
    backgroundColor: '#FAFCFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
  },
  card: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#64748B',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
