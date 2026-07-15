import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';

export default function EarningsScreen() {
  const log = [
    { id: '1', desc: 'Order #BG-1000 Delivery Fee', amount: 'NGN 1,200', date: 'Today, 2:14 PM' },
    { id: '2', desc: 'Order #BG-0999 Pickup Fee', amount: 'NGN 1,200', date: 'Today, 11:30 AM' },
    { id: '3', desc: 'Weekly Target Bonus', amount: 'NGN 5,000', date: 'July 5, 2026' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.label}>Net Balance</Text>
        <Text style={styles.balance}>NGN 7,400</Text>
      </View>

      <Text style={styles.sectionTitle}>Earnings Log</Text>
      <FlatList
        data={log}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowDesc}>{item.desc}</Text>
              <Text style={styles.rowDate}>{item.date}</Text>
            </View>
            <Text style={styles.rowVal}>{item.amount}</Text>
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
