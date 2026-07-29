import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../../../lib/config';
import { riderToken } from '../../../lib/session';

export default function ConfirmHandoffScreen() {
  const router = useRouter();
  const { id, status } = useLocalSearchParams<{ id: string; status: string }>();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter verification OTP');
      return;
    }
    setLoading(true);
    try {
      const token = await riderToken();
      const nextStatus = status === 'DELIVERY_IN_PROGRESS' ? 'DELIVERED' : 'PICKED_UP';
      await axios.patch(`${API_URL}/riders/orders/${id}/status`, {
        status: nextStatus,
        otp,
      }, { headers: { Authorization: `Bearer ${token}` } });

      Alert.alert('Success', 'Order status updated successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      Alert.alert('Verification failed', error.response?.data?.error || 'Check the customer code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Security Check</Text>
      <Text style={styles.subtitle}>Ask customer for the verification OTP code displayed on their app to confirm laundry handoff.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Enter Customer OTP</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1234"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          maxLength={4}
          value={otp}
          onChangeText={setOtp}
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? 'Verifying OTP...' : 'Verify & Confirm Handoff'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#002B7F',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  form: {
    width: '100%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#002B7F',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#002B7F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
