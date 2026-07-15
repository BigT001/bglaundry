import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';

export default function DriverDashboard() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  const jobs = [
    { id: 'BG-1002', customer: 'Blessed G.', action: 'PICKUP', address: '16B Maria Okor St, Ejibo', time: '10:00 AM' },
    { id: 'BG-1001', customer: 'Samuel S.', action: 'DELIVER', address: '24 Lawanson Rd, Surulere', time: '2:30 PM' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.statusPanel}>
        <Text style={styles.statusLabel}>Driver Duty Status:</Text>
        <View style={styles.toggleRow}>
          <Text style={[styles.statusText, isOnline ? styles.online : styles.offline]}>
            {isOnline ? 'ONLINE & ACTIVE' : 'OFFLINE'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#CBD5E1', true: '#E6F0FA' }}
            thumbColor={isOnline ? '#002B7F' : '#64748B'}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Assigned Jobs Queue</Text>
      <FlatList
        data={isOnline ? jobs : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No active jobs. Toggle online status to poll dispatch.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.orderId}>Order #{item.id}</Text>
              <View style={[styles.badge, item.action === 'PICKUP' ? styles.pickupBadge : styles.deliverBadge]}>
                <Text style={item.action === 'PICKUP' ? styles.pickupText : styles.deliverText}>{item.action}</Text>
              </View>
            </View>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.val}>{item.customer}</Text>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.val}>{item.address}</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/orders/${item.id}/route`)}
            >
              <Text style={styles.actionBtnText}>Start Nav Route</Text>
            </TouchableOpacity>
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
  statusPanel: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E6F0FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  online: {
    color: '#002B7F',
  },
  offline: {
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  list: {
    paddingBottom: 20,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: '#E6F0FA',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6F0FA',
    paddingBottom: 8,
  },
  orderId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002B7F',
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  pickupBadge: {
    backgroundColor: '#FEF3C7',
  },
  deliverBadge: {
    backgroundColor: '#D1FAE5',
  },
  pickupText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deliverText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
  },
  val: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#002B7F',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
