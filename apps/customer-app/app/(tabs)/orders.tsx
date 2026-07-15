import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface OrderItem {
  id: string;
  date: string;
  items: string;
  amount: string;
  status: 'PICKUP_PENDING' | 'PROCESSING' | 'DELIVERED';
}

export default function OrdersScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const orders: OrderItem[] = [
    { id: 'BG-1002', date: 'July 8, 2026', items: '3 items (Dry Cleaning)', amount: '₦7,500', status: 'PICKUP_PENDING' },
    { id: 'BG-1001', date: 'July 5, 2026', items: '5 items (Dry Cleaning)', amount: '₦15,000', status: 'PROCESSING' },
    { id: 'BG-1000', date: 'June 28, 2026', items: '2 items (Ironing)', amount: '₦3,000', status: 'DELIVERED' },
  ];

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
      case 'PROCESSING':
        return {
          label: 'Processing',
          bgColor: '#F3E8FF',
          textColor: '#7C3AED',
          icon: 'loader',
          iconColor: '#7C3AED'
        };
      case 'DELIVERED':
        return {
          label: 'Delivered',
          bgColor: '#ECFDF5',
          textColor: '#059669',
          icon: 'check-circle',
          iconColor: '#059669'
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

  const filteredOrders = orders.filter(order => {
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="folder" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No orders found in this category</Text>
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
                  <Text style={styles.orderId}>Order #{item.id}</Text>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                  <Feather name={statusConfig.icon as any} size={11} color={statusConfig.textColor} style={{ marginRight: 4 }} />
                  <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              {/* Items Summary */}
              <Text style={styles.details}>{item.items}</Text>

              {/* Footer row: Date & Amount */}
              <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                  <Feather name="calendar" size={13} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.date}>{item.date}</Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text style={styles.amount}>{item.amount}</Text>
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
