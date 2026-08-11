import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, TextInput, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../lib/config';

const formatNaira = (amount: number) => {
  return '₦' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getSessionToken = async () => {
  const storedToken = await AsyncStorage.getItem('@bglaundry_token');
  const token = typeof storedToken === 'string' ? storedToken.trim() : '';
  if (!token || token === 'undefined' || token === 'null') {
    await AsyncStorage.multiRemove(['@bglaundry_token', '@bglaundry_user']);
    return '';
  }
  return token;
};

const getStaticItemPrice = (key: string): number => {
  const normalizedKey = key.toLowerCase();
  
  // Additional services
  if (normalizedKey.includes('stain removal')) return 1000;
  if (normalizedKey.includes('spot cleaning')) return 500;
  if (normalizedKey.includes('softener')) return 200;
  if (normalizedKey.includes('fragrance')) return 200;
  if (normalizedKey.includes('folding')) return 200;
  if (normalizedKey.includes('shoe')) return 4000;
  if (normalizedKey.includes('bag')) return 4000;
  if (normalizedKey.includes('gown care') || normalizedKey.includes('wedding gown')) return 15000;

  // Determine service mode
  const isWashOnly = normalizedKey.includes('wash only');
  const isIronOnly = normalizedKey.includes('iron only');
  const isWashAndIron = normalizedKey.includes('wash & iron');

  // Garments pricing
  if (normalizedKey.includes('t-shirt') || normalizedKey.includes('polo')) {
    return isWashAndIron ? 700 : isIronOnly ? 300 : 500;
  }
  if (normalizedKey.includes('dress shirt')) {
    return isWashAndIron ? 1000 : isIronOnly ? 400 : 700;
  }
  if (normalizedKey.includes('trouser')) {
    return isWashAndIron ? 700 : isIronOnly ? 300 : 500;
  }
  if (normalizedKey.includes('jeans')) {
    return isWashAndIron ? 1000 : isIronOnly ? 400 : 700;
  }
  if (normalizedKey.includes('shorts')) {
    return isWashAndIron ? 500 : isIronOnly ? 200 : 300;
  }
  if (normalizedKey.includes('casual/formal shirt')) {
    return isWashAndIron ? 800 : isIronOnly ? 300 : 500;
  }
  if (normalizedKey.includes('blouse')) {
    return isWashAndIron ? 800 : isIronOnly ? 300 : 500;
  }
  if (normalizedKey.includes('dress')) {
    return isWashAndIron ? 2000 : isIronOnly ? 700 : 1300;
  }
  if (normalizedKey.includes('two-piece suit')) {
    return isWashAndIron ? 3500 : isIronOnly ? 1200 : 2500;
  }
  if (normalizedKey.includes('blazer')) {
    return isWashAndIron ? 1500 : isIronOnly ? 600 : 1000;
  }
  if (normalizedKey.includes('senator wear')) {
    return isWashAndIron ? 1500 : isIronOnly ? 500 : 1000;
  }
  if (normalizedKey.includes('agbada')) {
    return isWashAndIron ? 3500 : isIronOnly ? 1200 : 2500;
  }
  if (normalizedKey.includes('kaftan')) {
    return isWashAndIron ? 2000 : isIronOnly ? 700 : 1300;
  }
  if (normalizedKey.includes('jacket')) {
    return isWashAndIron ? 1500 : isIronOnly ? 600 : 1000;
  }
  if (normalizedKey.includes('tie')) {
    return 300;
  }

  // Household
  if (normalizedKey.includes('bed sheet')) {
    return isWashAndIron ? 1500 : 1000;
  }
  if (normalizedKey.includes('duvet (small)')) {
    return isWashAndIron ? 3000 : 2500;
  }
  if (normalizedKey.includes('duvet (medium)') || normalizedKey.includes('duvet (large/king)') || normalizedKey.includes('duvet')) {
    return isWashAndIron ? 4000 : 3500;
  }
  if (normalizedKey.includes('blanket')) {
    return isWashAndIron ? 3500 : 3000;
  }
  if (normalizedKey.includes('pillow')) {
    return isWashAndIron ? 800 : 600;
  }
  if (normalizedKey.includes('curtain')) {
    return isWashAndIron ? 2000 : 1500;
  }
  if (normalizedKey.includes('bath towel')) {
    return isWashAndIron ? 800 : 600;
  }

  return 500; // default backup fallback
};

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [dbServices, setDbServices] = React.useState<any[]>([]);

  React.useEffect(() => {
    axios.get(`${API_URL}/admin/services`)
      .then(res => {
        if (res.data && res.data.services) {
          setDbServices(res.data.services);
        }
      })
      .catch(err => console.log('Failed to fetch pricing database in checkout:', err));
  }, []);

  const getItemPrice = (key: string): number => {
    const normalizedKey = key.toLowerCase();
    
    // Find service item that matches the name
    const service = dbServices.find(s => normalizedKey.includes(s.name.toLowerCase()));
    if (service) {
      if (normalizedKey.includes('wash & iron')) return service.washIronPrice;
      if (normalizedKey.includes('iron only')) return service.ironPrice;
      if (normalizedKey.includes('wash only')) return service.washPrice;
      
      // Fallback
      if (service.category === 'Additional') {
        return service.washPrice;
      }
      return service.washIronPrice || service.washPrice || service.ironPrice || 0;
    }
    
    // Fallback to static pricing list
    return getStaticItemPrice(key);
  };

  const total = params.total ? parseFloat(params.total as string) : 0;
  const items = params.itemsJson ? JSON.parse(params.itemsJson as string) : {};
  const pickupAddress = params.pickupAddress as string;
  const deliveryAddress = params.deliveryAddress as string;
  const pickupDate = params.pickupDate as string;

  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = React.useState<string>('');
  const [customerPhone, setCustomerPhone] = React.useState<string>('');
  const [formPickupAddress, setFormPickupAddress] = React.useState<string>(pickupAddress || '');
  const [formDeliveryAddress, setFormDeliveryAddress] = React.useState<string>(deliveryAddress || '');
  const [canSaveToProfile, setCanSaveToProfile] = React.useState(false);
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = React.useState('');

  const persistProfileLocally = React.useCallback(async () => {
    try {
      const userStr = await AsyncStorage.getItem('@bglaundry_user');
      let user = userStr ? JSON.parse(userStr) : {};
      user = {
        ...user,
        fullName: customerName || user.fullName,
        phoneNumber: customerPhone || user.phoneNumber,
        pickupAddress: formPickupAddress || user.pickupAddress,
      };
      await AsyncStorage.setItem('@bglaundry_user', JSON.stringify(user));
      return user;
    } catch (e) {
      console.warn('Failed to persist updated user locally', e);
      return null;
    }
  }, [customerName, customerPhone, formPickupAddress]);

  const saveProfileToServer = React.useCallback(async (showFeedback = true) => {
    if (!canSaveToProfile) {
      setProfileSaveMessage('Sign in to save this information to your profile.');
      return false;
    }

    try {
      setProfileSaving(true);
      setProfileSaveMessage('');
      const localUser = await persistProfileLocally();
      const token = await AsyncStorage.getItem('@bglaundry_token');
      if (!token) {
        setCanSaveToProfile(false);
        setProfileSaveMessage('Sign in to save this information to your profile.');
        return false;
      }

      const payload = {
        fullName: customerName.trim() || localUser?.fullName || '',
        phoneNumber: customerPhone.trim() || localUser?.phoneNumber || '',
        pickupAddress: formPickupAddress.trim() || localUser?.pickupAddress || '',
      };

      const response = await axios.patch(`${API_URL}/users/profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.user) {
        const updatedUser = {
          ...localUser,
          ...response.data.user,
        };
        await AsyncStorage.setItem('@bglaundry_user', JSON.stringify(updatedUser));
      }

      if (showFeedback) {
        setProfileSaveMessage('Saved to your profile.');
      }
      return true;
    } catch (error) {
      console.warn('Failed to save profile to server from checkout', error);
      if (showFeedback) {
        const message = axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : 'We could not save this profile to your account right now.';
        setProfileSaveMessage(message);
      }
      return false;
    } finally {
      setProfileSaving(false);
    }
  }, [API_URL, canSaveToProfile, customerName, customerPhone, formPickupAddress, persistProfileLocally]);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('@bglaundry_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.fullName) setCustomerName(user.fullName);
          if (user.phoneNumber) setCustomerPhone(user.phoneNumber);
          const savedAddr = user.pickupAddress || user.homeAddress || user.officeAddress || '';
          if (savedAddr) {
            setFormPickupAddress(prev => prev || savedAddr);
            setFormDeliveryAddress(prev => prev || savedAddr);
          }
        }

        const addrs = await AsyncStorage.getItem('@bglaundry_addresses');
        if ((!userStr || !JSON.parse(userStr).pickupAddress) && addrs) {
          try {
            const parsed = JSON.parse(addrs);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setFormPickupAddress(prev => prev || parsed[0].address || '');
            }
          } catch (e) {
            // ignore
          }
        }

        const token = await AsyncStorage.getItem('@bglaundry_token');
        setCanSaveToProfile(Boolean(token));
      } catch (err) {
        console.error('Failed to load stored user for checkout:', err);
      }
    };
    loadUser();
  }, []);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // 1. Submit Order to NestJS backend
      const formattedItems = Object.keys(items)
        .filter(key => items[key] > 0)
        .map(key => ({
          serviceName: key,
          quantity: items[key],
          price: getItemPrice(key),
        }));

      const token = await getSessionToken();
      if (!token) {
        Alert.alert('Sign in required', 'Please sign in again before making payment.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/login' as any) },
        ]);
        return;
      }
      const authConfig = { headers: { Authorization: `Bearer ${token}` } };

      const payloadPickup = formPickupAddress || pickupAddress || '';
      const payloadDelivery = formDeliveryAddress || deliveryAddress || payloadPickup;

      const orderResponse = await axios.post(`${API_URL}/orders/book`, {
        pickupAddress: payloadPickup,
        deliveryAddress: payloadDelivery,
        items: formattedItems,
      }, authConfig);

      const orderId = orderResponse.data.id;
      const orderNumber = orderResponse.data.orderNumber;

      // Persist any edited profile/address details locally and to the account when available
      try {
        await persistProfileLocally();
      } catch (e) {
        console.warn('Failed to persist updated user after checkout', e);
      }

      if (canSaveToProfile) {
        await saveProfileToServer(false);
      }

      // 2. Initialize Payment
      const paymentResponse = await axios.post(`${API_URL}/payments/initialize`, {
        orderId,
        client: 'mobile',
      }, authConfig);

      const checkoutUrl = paymentResponse.data.checkoutUrl;
      const reference = paymentResponse.data.payment.reference;
      if (!checkoutUrl) {
        throw new Error('Flutterwave checkout URL was not generated. Please try again.');
      }
      try {
        await Linking.openURL(checkoutUrl);
      } catch (openErr) {
        console.warn('[Flutterwave] Linking.openURL fallback attempt:', openErr);
        await Linking.openURL(checkoutUrl);
      }
      for (let attempt = 0; attempt < 60; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const latestToken = await getSessionToken();
        if (!latestToken) {
          throw new Error('Your session expired while checking payment. Please sign in again.');
        }
        const result = await axios.get(`${API_URL}/payments/status`, {
          params: { reference },
          headers: { Authorization: `Bearer ${latestToken}` },
        });
        if (result.data.status === 'SUCCESSFUL') {
          Alert.alert(
            'Payment successful',
            `Order ${orderNumber} is confirmed.\nAmount: ${formatNaira(result.data.amount)}\nReceipt: ${result.data.reference}`,
          );
          router.replace('/(tabs)/orders');
          return;
        }
        if (result.data.status === 'FAILED') {
          throw new Error('Flutterwave reported that the payment failed');
        }
      }
      Alert.alert('Payment pending', `Order ${orderNumber} is awaiting confirmation.`);
    } catch (error) {
      console.error('Checkout error:', error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || 'Unable to start payment. Please try again.'
        : error instanceof Error ? error.message : 'Unable to start payment. Please try again.';
      if (message === 'Customer authentication required.' || message.includes('session')) {
        Alert.alert('Sign in required', 'Please sign in again before making payment.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/login' as any) },
        ]);
      } else {
        Alert.alert('Payment not completed', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Summary Invoice</Text>
        <View style={styles.card}>
          {Object.keys(items).map((key, idx) => {
            if (items[key] <= 0) return null;
            return (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemText}>{key} x{items[key]}</Text>
                <Text style={styles.itemVal}>{formatNaira(items[key] * getItemPrice(key))}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Contact Details</Text>
        <View style={styles.card}>
          <Text style={styles.infoLabel}>Full name</Text>
          <TextInput
            style={[styles.infoVal, { borderWidth: 1, borderColor: '#E6F0FA', padding: 8, borderRadius: 6 }]}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Your full name"
          />
          <View style={{ height: 12 }} />
          <Text style={styles.infoLabel}>Phone number</Text>
          <TextInput
            style={[styles.infoVal, { borderWidth: 1, borderColor: '#E6F0FA', padding: 8, borderRadius: 6 }]}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="+2348106889242"
            keyboardType="phone-pad"
          />
          {canSaveToProfile ? (
            <TouchableOpacity
              style={styles.saveProfileButton}
              onPress={() => saveProfileToServer(true)}
              disabled={profileSaving}
            >
              <Text style={styles.saveProfileButtonText}>{profileSaving ? 'Saving...' : 'Save to profile'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.saveProfileHintBox}>
              <Text style={styles.saveProfileHintText}>Sign in to save these details to your account.</Text>
            </View>
          )}
          {profileSaveMessage ? (
            <Text style={styles.saveProfileStatus}>{profileSaveMessage}</Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Address Coordinates</Text>
        <View style={styles.card}>
          <Text style={styles.infoLabel}>Pickup From:</Text>
          <TextInput
            style={[styles.infoVal, { borderWidth: 1, borderColor: '#E6F0FA', padding: 8, borderRadius: 6 }]}
            value={formPickupAddress}
            onChangeText={setFormPickupAddress}
            placeholder="Enter your pickup address (e.g. 15 Admiralty Way, Lekki)"
          />
          <View style={styles.divider} />
          <Text style={styles.infoLabel}>Deliver To:</Text>
          <TextInput
            style={[styles.infoVal, { borderWidth: 1, borderColor: '#E6F0FA', padding: 8, borderRadius: 6 }]}
            value={formDeliveryAddress}
            onChangeText={setFormDeliveryAddress}
            placeholder="e.g. Same as pickup address"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Charge:</Text>
          <Text style={styles.totalVal}>{formatNaira(total)}</Text>
        </View>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.payButtonText}>{loading ? 'Booking Order...' : 'Pay & Confirm Order'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E6F0FA',
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
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E6F0FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#0F172A',
  },
  itemVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#002B7F',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  infoVal: {
    fontSize: 14,
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6F0FA',
    marginVertical: 12,
  },
  saveProfileButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  saveProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  saveProfileHintBox: {
    marginTop: 10,
    paddingVertical: 6,
  },
  saveProfileHintText: {
    color: '#6B7280',
    fontSize: 12,
  },
  saveProfileStatus: {
    marginTop: 8,
    color: '#047857',
    fontSize: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6F0FA',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  totalVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#002B7F',
  },
  payButton: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
