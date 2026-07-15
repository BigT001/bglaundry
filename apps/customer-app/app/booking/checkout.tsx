import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const formatNaira = (amount: number) => {
  return '₦' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
  const API_URL = 'http://localhost:4000/api/v1';

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

      // 1. Submit Order to NestJS backend
      let realCustomerId = 'customer-mock-id';
      try {
        const userStr = await AsyncStorage.getItem('@bglaundry_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.id) {
            realCustomerId = user.id;
          }
        }
      } catch (err) {
        console.error('Failed to load user ID for booking:', err);
      }

      const orderResponse = await axios.post(`${API_URL}/orders/book`, {
        customerId: realCustomerId,
        pickupAddress,
        deliveryAddress,
        pickupDate,
        items: formattedItems,
      });

      const orderId = orderResponse.data.id;
      const orderNumber = orderResponse.data.orderNumber;

      // 2. Initialize Payment
      const paymentResponse = await axios.post(`${API_URL}/payments/initialize`, {
        orderId,
        amount: total,
      });

      const checkoutUrl = paymentResponse.data.checkoutUrl;

      Alert.alert('Order Booked', `Order ID: ${orderNumber}\nProceed to complete checkout payment?`, [
        {
          text: 'Pay Mock',
          onPress: () => {
            // Direct simulator flow bypass - mock checkout webhook
            axios.post(`${API_URL}/payments/verify-webhook`, {
              reference: paymentResponse.data.payment.reference,
              status: 'SUCCESS',
            }).then(() => {
              router.replace(`/(tabs)/orders`);
            });
          }
        }
      ]);
    } catch (error) {
      console.log('API Integration Error - switching to demo bypass:', error);
      // Demo bypass if backend is inactive
      Alert.alert('Demo Mode Checkout', 'NestJS API inactive. Generating mock transaction locally...', [
        {
          text: 'Ok',
          onPress: () => router.replace('/(tabs)/orders'),
        }
      ]);
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

        <Text style={styles.sectionTitle}>Address Coordinates</Text>
        <View style={styles.card}>
          <Text style={styles.infoLabel}>Pickup From:</Text>
          <Text style={styles.infoVal}>{pickupAddress}</Text>
          <View style={styles.divider} />
          <Text style={styles.infoLabel}>Deliver To:</Text>
          <Text style={styles.infoVal}>{deliveryAddress}</Text>
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
