import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const formatNaira = (amount: number) => {
  return '₦' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

interface OrderMock {
  id: string;
  status: 'PICKUP_PENDING' | 'PROCESSING' | 'DELIVERED';
  statusLabel: string;
  date: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedReturn: string;
  total: number;
  items: {
    name: string;
    qty: number;
    service: string;
    price: number;
    icon: string;
  }[];
  steps: {
    label: string;
    desc: string;
    active: boolean;
    time?: string;
  }[];
}

export default function TrackOrderScreen() {
  const { id } = useLocalSearchParams();

  // Mock Orders Database
  const ordersDb: Record<string, OrderMock> = {
    'BG-1002': {
      id: 'BG-1002',
      status: 'PICKUP_PENDING',
      statusLabel: 'Pickup Pending',
      date: 'July 10, 2026',
      pickupAddress: '16B Maria Okor Street, Ejibo, Lagos',
      deliveryAddress: '16B Maria Okor Street, Ejibo, Lagos',
      estimatedReturn: 'Tomorrow, 11 Jul at 10:00 AM',
      total: 7500,
      items: [
        { name: 'Press Shirt', qty: 2, service: 'Iron Only', price: 1000, icon: 'tshirt-v' },
        { name: 'Dry Clean Native Kaftan', qty: 1, service: 'Dry Cleaning', price: 2000, icon: 'account' },
        { name: 'Dry Clean Suit Set', qty: 1, service: 'Dry Cleaning', price: 5000, icon: 'tie' },
      ],
      steps: [
        { label: 'Order Registered', desc: 'Secure payment authorized via Flutterwave', active: true, time: '10:00 AM' },
        { label: 'Driver Assigned', desc: 'Driver (Samuel) is en-route for pickup', active: true, time: '10:15 AM' },
        { label: 'Washing & Cleaning', desc: 'Clothes deep wash and stain lift treatment', active: false },
        { label: 'Out for Delivery', desc: 'Garments crisp ironed and returned in 24 hours', active: false },
      ]
    },
    'BG-1001': {
      id: 'BG-1001',
      status: 'PROCESSING',
      statusLabel: 'In Processing',
      date: 'July 8, 2026',
      pickupAddress: '16B Maria Okor Street, Ejibo, Lagos',
      deliveryAddress: '16B Maria Okor Street, Ejibo, Lagos',
      estimatedReturn: 'Today, 9 Jul at 2:00 PM',
      total: 15000,
      items: [
        { name: 'Dry Clean Shirt', qty: 3, service: 'Dry Cleaning', price: 1500, icon: 'tshirt-v' },
        { name: 'Dry Clean Suit Set', qty: 1, service: 'Dry Cleaning', price: 5000, icon: 'tie' },
        { name: 'Dry Clean Duvet', qty: 1, service: 'Dry Cleaning', price: 5000, icon: 'bed-double-outline' },
      ],
      steps: [
        { label: 'Order Registered', desc: 'Secure payment authorized via Flutterwave', active: true, time: '2:00 PM' },
        { label: 'Clothes Picked Up', desc: 'Garments picked up by driver (Samuel)', active: true, time: '2:40 PM' },
        { label: 'Washing & Cleaning', desc: 'Clothes deep wash and stain lift treatment', active: true, time: '4:10 PM' },
        { label: 'Out for Delivery', desc: 'Garments crisp ironed and returned in 24 hours', active: false },
      ]
    },
    'BG-1000': {
      id: 'BG-1000',
      status: 'DELIVERED',
      statusLabel: 'Delivered Successfully',
      date: 'June 28, 2026',
      pickupAddress: '16B Maria Okor Street, Ejibo, Lagos',
      deliveryAddress: '16B Maria Okor Street, Ejibo, Lagos',
      estimatedReturn: 'Completed on 29 Jun at 3:15 PM',
      total: 3000,
      items: [
        { name: 'Kids Dry Clean Dress', qty: 1, service: 'Dry Cleaning', price: 1200, icon: 'hanger' },
        { name: 'Kids Press Shirt', qty: 1, service: 'Iron Only', price: 800, icon: 'tshirt-v' },
        { name: 'Kids Wash Trouser', qty: 1, service: 'Wash Only', price: 1000, icon: 'hanger' },
      ],
      steps: [
        { label: 'Order Registered', desc: 'Secure payment authorized via Flutterwave', active: true, time: '11:00 AM' },
        { label: 'Clothes Picked Up', desc: 'Garments picked up by driver', active: true, time: '11:45 AM' },
        { label: 'Washing & Cleaning', desc: 'Clothes deep wash and stain lift treatment', active: true, time: '2:00 PM' },
        { label: 'Out for Delivery', desc: 'Garments returned to address', active: true, time: '3:15 PM' },
      ]
    }
  };

  const order = ordersDb[id as string] || ordersDb['BG-1002'];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 1. Overview / Status Card */}
        <View style={styles.card}>
          <View style={styles.orderHeaderRow}>
            <View>
              <Text style={styles.orderLabel}>Order ID</Text>
              <Text style={styles.orderVal}>#{order.id}</Text>
            </View>
            <View style={[styles.statusBadge, styles[`statusBadge_${order.status}`]]}>
              <Text style={[styles.statusText, styles[`statusText_${order.status}`]]}>
                {order.statusLabel}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaInfoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Order Date</Text>
              <Text style={styles.metaVal}>{order.date}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.metaLabel}>Estimated Delivery</Text>
              <Text style={styles.metaVal}>{order.estimatedReturn}</Text>
            </View>
          </View>
        </View>

        {/* 2. Garments Itemized Breakdown Card (Moved up) */}
        <Text style={styles.sectionTitle}>Garments Itemized Breakdown</Text>
        <View style={styles.card}>
          {order.items.map((item, idx) => (
            <View key={idx}>
              <View style={styles.itemRow}>
                <View style={styles.itemIconBg}>
                  <MaterialCommunityIcons name={item.icon as any} size={20} color="#0066FF" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemService}>{item.service}</Text>
                </View>
                <View style={styles.itemPriceCol}>
                  <Text style={styles.itemQty}>{item.qty}x</Text>
                  <Text style={styles.itemPrice}>{formatNaira(item.price * item.qty)}</Text>
                </View>
              </View>
              {idx < order.items.length - 1 && <View style={styles.lightDivider} />}
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>{formatNaira(order.total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={[styles.summaryVal, { color: '#10B981', fontWeight: 'bold' }]}>FREE</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={styles.grandTotalLabel}>Total Paid (via Flutterwave)</Text>
            <Text style={styles.grandTotalVal}>{formatNaira(order.total)}</Text>
          </View>
        </View>

        {/* 3. Progress Tracking Timeline Card */}
        <Text style={styles.sectionTitle}>Order Tracking Progress</Text>
        <View style={[styles.card, { paddingVertical: 20 }]}>
          {order.steps.map((step, idx) => {
            const isLast = idx === order.steps.length - 1;
            return (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.dotContainer}>
                  <View style={[styles.dot, step.active && styles.dotActive]} />
                  {!isLast && <View style={[styles.line, step.active && styles.lineActive]} />}
                </View>

                <View style={styles.stepContent}>
                  <View style={styles.stepHeaderRow}>
                    <Text style={[styles.stepLabel, step.active && styles.stepLabelActive]}>
                      {step.label}
                    </Text>
                    {step.time && <Text style={styles.stepTime}>{step.time}</Text>}
                  </View>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            );
          })}
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
  statusBadge_DELIVERED: {
    backgroundColor: '#ECFDF5',
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
  statusText_DELIVERED: {
    color: '#10B981',
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
