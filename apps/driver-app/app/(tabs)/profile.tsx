import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../lib/config';
import { DRIVER_USER_KEY, clearRiderSession, riderAuthHeaders } from '../../lib/session';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    void (async () => {
      try {
        const storedUserJson = await AsyncStorage.getItem(DRIVER_USER_KEY);
        if (storedUserJson) {
          const parsed = JSON.parse(storedUserJson);
          setUser(parsed);
          if (typeof parsed.isOnline === 'boolean') {
            setIsOnline(parsed.isOnline);
          }
        }
      } catch (e) {
        console.warn('Failed to load user profile from storage', e);
      }
    })();
  }, []);

  const handleToggleOnline = async (value: boolean) => {
    setIsOnline(value);
    try {
      const headers = await riderAuthHeaders();
      if (!headers) return;
      await axios.patch(`${API_URL}/riders/me`, { isOnline: value }, { headers });
      if (user) {
        const updated = { ...user, isOnline: value };
        setUser(updated);
        await AsyncStorage.setItem(DRIVER_USER_KEY, JSON.stringify(updated));
      }
    } catch (err: any) {
      console.warn('Failed to update online status:', err);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of the Driver Portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          await clearRiderSession();
          try {
            router.replace('/login' as any);
          } catch {
            router.replace('/(auth)/login' as any);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'R'}
          </Text>
        </View>
        <Text style={styles.nameText}>{user?.fullName || 'Company Logistics Rider'}</Text>
        <Text style={styles.roleText}>Official Delivery Coordinator</Text>
        <Text style={styles.phoneText}>📞 {user?.phoneNumber || 'N/A'}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Shift / Duty Status</Text>
            <Text style={styles.rowSubtitle}>
              {isOnline ? 'Active on duty (receiving assignments)' : 'Off duty'}
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={isOnline ? '#002B7F' : '#94A3B8'}
            onValueChange={handleToggleOnline}
            value={isOnline}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>Rider Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Employment Type</Text>
          <Text style={styles.infoValue}>Company Employee (Monthly Salary)</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Assigned Hub</Text>
          <Text style={styles.infoValue}>BG Laundry Central Hub</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Primary Duty</Text>
          <Text style={styles.infoValue}>Pickup & Delivery Logistics</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={handleSignOut}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#EF4444" />
        ) : (
          <Text style={styles.signOutText}>Sign Out from Driver Portal</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#002B7F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  roleText: {
    fontSize: 13,
    color: '#002B7F',
    fontWeight: '600',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  infoRow: {
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  signOutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
