import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const API_URL = 'http://localhost:4000/api/v1';

  const handleRequestOtp = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    try {
      await axios.post(`${API_URL}/auth/request-otp`, { phoneNumber });
      setIsOtpSent(true);
      Alert.alert('OTP Sent', 'Check backend console for verification code');
    } catch (error) {
      Alert.alert('Error', 'Failed to request OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, { phoneNumber, code });
      Alert.alert('Login Success', `Driver Panel Authenticated!`, [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP code. Use "1234" for mock bypass.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brandTitle}>BG Driver Portal</Text>
      <Text style={styles.brandSubtitle}>Delivery Coordinator App</Text>

      {!isOtpSent ? (
        <View style={styles.form}>
          <Text style={styles.label}>Driver Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 08012345678"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <TouchableOpacity style={styles.button} onPress={handleRequestOtp}>
            <Text style={styles.buttonText}>Get Verification Code</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Enter 4-Digit OTP Code</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1234"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={4}
            value={code}
            onChangeText={setCode}
          />
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
            <Text style={styles.buttonText}>Confirm & Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    padding: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002B7F',
    textAlign: 'center',
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 48,
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
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#002B7F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
