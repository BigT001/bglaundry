import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../lib/config';
import { DRIVER_TOKEN_KEY, DRIVER_USER_KEY } from '../../lib/session';

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber || password.length < 8) return Alert.alert('Sign in', 'Enter your rider phone number and password.');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { phoneNumber, password });
      if (data.user?.role !== 'DRIVER') throw new Error('This account is not a rider account.');
      await AsyncStorage.multiSet([[DRIVER_TOKEN_KEY, data.token], [DRIVER_USER_KEY, JSON.stringify(data.user)]]);
      router.replace('/(tabs)');
    } catch (error: any) { Alert.alert('Unable to sign in', error.response?.data?.error || error.message || 'Check your details and try again.'); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brandTitle}>BG Driver Portal</Text>
      <Text style={styles.brandSubtitle}>Delivery Coordinator App</Text>

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
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Your rider password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign in to assignments'}</Text>
          </TouchableOpacity>
        </View>
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
