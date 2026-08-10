import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  React.useEffect(() => {
    async function loadAddr() {
      try {
        const userStr = await AsyncStorage.getItem('@bglaundry_user');
        if (userStr) {
          const u = JSON.parse(userStr);
          const defaultAddr = u.pickupAddress || u.homeAddress || u.officeAddress || '';
          setPickupAddress(defaultAddr);
          setDeliveryAddress(defaultAddr);
        }
      } catch (e) {
        console.warn('Failed to load user address in schedule.tsx', e);
      }
    }
    void loadAddr();
  }, []);

  const handleNext = () => {
    if (!pickupAddress.trim()) {
      Alert.alert('Error', 'Please enter your pickup address');
      return;
    }
    router.push({
      pathname: '/booking/checkout',
      params: {
        ...params,
        pickupAddress: pickupAddress.trim(),
        deliveryAddress: (deliveryAddress.trim() || pickupAddress.trim()),
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup & Delivery Address</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Pickup Address *</Text>
        <TextInput
          style={styles.input}
          value={pickupAddress}
          onChangeText={setPickupAddress}
          placeholder="Enter pickup address"
          multiline
        />

        <Text style={styles.label}>Delivery Address (Optional if same as pickup)</Text>
        <TextInput
          style={styles.input}
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          placeholder="Enter delivery address"
          multiline
        />
        <Text style={styles.tipText}>Note: Standard laundry orders are processed and returned in 24 hours.</Text>
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
