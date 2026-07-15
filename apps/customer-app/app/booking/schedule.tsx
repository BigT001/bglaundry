import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [pickupAddress, setPickupAddress] = useState('16B Maria Okor Street, Ejibo, Lagos');
  const [deliveryAddress, setDeliveryAddress] = useState('16B Maria Okor Street, Ejibo, Lagos');
  const [pickupDate, setPickupDate] = useState('2026-07-09T10:00:00Z');

  const handleNext = () => {
    if (!pickupAddress || !deliveryAddress || !pickupDate) {
      Alert.alert('Error', 'Please fill in all layout options');
      return;
    }
    router.push({
      pathname: '/booking/checkout',
      params: {
        ...params,
        pickupAddress,
        deliveryAddress,
        pickupDate,
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Delivery</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Pickup Address</Text>
        <TextInput
          style={styles.input}
          value={pickupAddress}
          onChangeText={setPickupAddress}
          placeholder="Enter pickup address"
        />

        <Text style={styles.label}>Delivery Address</Text>
        <TextInput
          style={styles.input}
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          placeholder="Enter delivery address"
        />

        <Text style={styles.label}>Scheduled Pickup Date & Time</Text>
        <TextInput
          style={styles.input}
          value={pickupDate}
          onChangeText={setPickupDate}
          placeholder="e.g. 2026-07-09T10:00:00Z"
        />
        <Text style={styles.tipText}>Note: standard laundry delivery completes in 24 hours.</Text>
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>Proceed to Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6F0FA',
    marginBottom: 24,
  },
  backText: {
    color: '#64748B',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6F0FA',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 20,
  },
  tipText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  nextBtn: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
