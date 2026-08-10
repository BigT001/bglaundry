import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../../lib/config';

const formatNaira = (amount: number) => {
  return '₦' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

interface LiveOrder {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate: string | null;
  pickupOTP: string | null;
  deliveryOTP: string | null;
  totalAmount: number;
  items: Array<{
    id: string;
    serviceName: string;
    quantity: number;
    price: number;
  }>;
  trackingHistory: Array<{ id: string; status: string; note: string | null; createdAt: string }>;
}

export default function TrackOrderScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<LiveOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadOrder = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('@bglaundry_token');
      if (!token || !id) throw new Error('Your session has expired. Please sign in again.');
      const response = await axios.get(`${API_URL}/orders/${String(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(response.data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to load this order.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
    const timer = setInterval(() => loadOrder(true), 30000);
    return () => clearInterval(timer);
  }, [loadOrder]);

  if (loading && !order) {
    return <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color="#0066FF" /><Text style={{ marginTop: 12, color: '#64748B' }}>Loading live order…</Text></View>;
  }
  if (!order) {
    return <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}><Feather name="alert-circle" size={38} color="#94A3B8" /><Text style={{ marginVertical: 12, color: '#64748B', textAlign: 'center' }}>{error || 'Order not found.'}</Text><TouchableOpacity onPress={() => loadOrder()}><Text style={{ color: '#0066FF', fontWeight: '700' }}>Try again</Text></TouchableOpacity></View>;
  }

  const statusLabel = order.status.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  const steps = [...order.trackingHistory].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const activePin = ['PICKUP_PENDING', 'PICKUP_IN_PROGRESS'].includes(order.status)
    ? { label: 'Pickup handoff PIN', value: order.pickupOTP }
    : ['DELIVERY_PENDING', 'DELIVERY_IN_PROGRESS'].includes(order.status)
      ? { label: 'Delivery handoff PIN', value: order.deliveryOTP }
      : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadOrder(true)} tintColor="#0066FF" />}>
        
        {/* 1. Overview / Status Card */}
        <View style={styles.card}>
          <View style={styles.orderHeaderRow}>
            <View>
              <Text style={styles.orderLabel}>Order ID</Text>
              <Text style={styles.orderVal}>{order.orderNumber}</Text>
            </View>
            <View style={[styles.statusBadge, styles[`statusBadge_${order.status}`]]}>
              <Text style={[styles.statusText, styles[`statusText_${order.status}`]]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaInfoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Order Date</Text>
              <Text style={styles.metaVal}>{new Date(order.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.metaLabel}>Scheduled Delivery</Text>
              <Text style={styles.metaVal}>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not scheduled'}</Text>
            </View>
          </View>
        </View>

        {activePin?.value ? (
          <>
            <Text style={styles.sectionTitle}>Customer Handoff Security</Text>
            <View style={[styles.card, styles.pinCard]}>
              <View>
                <Text style={styles.pinLabel}>{activePin.label}</Text>
                <Text style={styles.pinHint}>Give this code only to your assigned BG Laundry rider at handoff.</Text>
              </View>
              <Text style={styles.pinValue}>{activePin.value}</Text>
            </View>
          </>
        ) : null}

        {/* 2. Garments Itemized Breakdown Card (Moved up) */}
        <Text style={styles.sectionTitle}>Garments Itemized Breakdown</Text>
        <View style={styles.card}>
          {order.items.map((item, idx) => (
            <View key={idx}>
              <View style={styles.itemRow}>
                <View style={styles.itemIconBg}>
                  <MaterialCommunityIcons name="hanger" size={20} color="#0066FF" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.serviceName}</Text>
                  <Text style={styles.itemService}>Laundry service</Text>
                </View>
                <View style={styles.itemPriceCol}>
                  <Text style={styles.itemQty}>{item.quantity}x</Text>
                  <Text style={styles.itemPrice}>{formatNaira(item.price * item.quantity)}</Text>
                </View>
              </View>
              {idx < order.items.length - 1 && <View style={styles.lightDivider} />}
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>{formatNaira(order.totalAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={[styles.summaryVal, { color: '#10B981', fontWeight: 'bold' }]}>FREE</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={styles.grandTotalLabel}>Order total</Text>
            <Text style={styles.grandTotalVal}>{formatNaira(order.totalAmount)}</Text>
          </View>
        </View>

        {/* 3. Progress Tracking Timeline Card */}
        <Text style={styles.sectionTitle}>Order Tracking Progress</Text>
        <View style={[styles.card, { paddingVertical: 20 }]}>
          {steps.length ? steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            return (
              <View key={step.id} style={styles.timelineItem}>
                <View style={styles.dotContainer}>
                  <View style={[styles.dot, styles.dotActive]} />
                  {!isLast && <View style={[styles.line, styles.lineActive]} />}
                </View>

                <View style={styles.stepContent}>
                  <View style={styles.stepHeaderRow}>
                    <Text style={[styles.stepLabel, styles.stepLabelActive]}>
                      {step.status.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </Text>
                    <Text style={styles.stepTime}>{new Date(step.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <Text style={styles.stepDesc}>{step.note || 'Order status updated.'}</Text>
                </View>
              </View>
            );
          }) : <Text style={{ color: '#64748B' }}>No tracking events have been recorded yet.</Text>}
        </View>

        {/* 4. Address Logistics Details Card */}
        <Text style={styles.sectionTitle}>Logistics Delivery Addresses</Text>
        <View style={styles.card}>
          <View style={styles.logisticsRow}>
            <Feather name="map-pin" size={16} color="#0066FF" style={{ marginRight: 12, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.logisticsLabel}>Pickup Location</Text>
              <Text style={styles.logisticsVal}>{order.pickupAddress}</Text>
            </View>
          </View>

          <View style={[styles.logisticsRow, { marginTop: 14 }]}>
            <Feather name="truck" size={16} color="#10B981" style={{ marginRight: 12, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.logisticsLabel}>Delivery Destination</Text>
              <Text style={styles.logisticsVal}>{order.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  lightDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 10,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  orderVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadge_PICKUP_PENDING: {
    backgroundColor: '#EFF6FF',
  },
  statusBadge_PROCESSING: {
    backgroundColor: '#FAF5FF',
  },
  statusBadge_PICKUP_IN_PROGRESS: {
    backgroundColor: '#EFF6FF',
  },
  statusBadge_PICKED_UP: {
    backgroundColor: '#F3E8FF',
  },
  statusBadge_DELIVERY_PENDING: {
    backgroundColor: '#FEF3C7',
  },
  statusBadge_DELIVERY_IN_PROGRESS: {
    backgroundColor: '#FEF3C7',
  },
  statusBadge_DELIVERED: {
    backgroundColor: '#ECFDF5',
  },
  statusBadge_CANCELLED: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusText_PICKUP_PENDING: {
    color: '#2563EB',
  },
  statusText_PROCESSING: {
    color: '#9333EA',
  },
  statusText_PICKUP_IN_PROGRESS: {
    color: '#2563EB',
  },
  statusText_PICKED_UP: {
    color: '#7C3AED',
  },
  statusText_DELIVERY_PENDING: {
    color: '#B45309',
  },
  statusText_DELIVERY_IN_PROGRESS: {
    color: '#B45309',
  },
  statusText_DELIVERED: {
    color: '#10B981',
  },
  statusText_CANCELLED: {
    color: '#DC2626',
  },
  pinCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  pinLabel: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  pinHint: {
    color: '#475569',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  pinValue: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  metaInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  itemService: {
    fontSize: 11,
    color: '#0066FF',
    fontWeight: '600',
    marginTop: 2,
  },
  itemPriceCol: {
    alignItems: 'flex-end',
  },
  itemQty: {
    fontSize: 12,
    color: '#64748B',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  logisticsRow: {
    flexDirection: 'row',
  },
  logisticsLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  logisticsVal: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginTop: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  dotContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#CBD5E1',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 2,
    zIndex: 1,
  },
  dotActive: {
    backgroundColor: '#0066FF',
  },
  line: {
    width: 2.5,
    height: 48,
    backgroundColor: '#CBD5E1',
    marginVertical: 2,
  },
  lineActive: {
    backgroundColor: '#0066FF',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 24,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
  },
  stepLabelActive: {
    color: '#0F172A',
  },
  stepTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  stepDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
});
