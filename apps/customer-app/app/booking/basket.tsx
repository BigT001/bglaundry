import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getBasket, subscribeBasket, addToBasket, removeFromBasket, deleteFromBasket, getBasketTotal, getBasketItemsCount, clearBasket } from './basketState';
import { API_URL } from '../../lib/config';

const formatNaira = (amount: number) => {
  return '₦' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function BasketScreen() {
  const router = useRouter();

  // Sync with global basket state
  const [basket, setBasket] = useState(getBasket());
  const [totalAmount, setTotalAmount] = useState(getBasketTotal());
  const [totalCount, setTotalCount] = useState(getBasketItemsCount());

  useEffect(() => {
    return subscribeBasket(() => {
      setBasket({ ...getBasket() });
      setTotalAmount(getBasketTotal());
      setTotalCount(getBasketItemsCount());
    });
  }, []);

  // Checkout Modals State
  const [isScheduleVisible, setIsScheduleVisible] = useState(false);
  const [isFlutterwaveVisible, setIsFlutterwaveVisible] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'PROCESSING' | 'SUCCESS'>('PROCESSING');
  const [receipt, setReceipt] = useState<{
    reference: string;
    orderNumber: string;
    amount: number;
  } | null>(null);

  // Input states for schedule & addresses
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedAddrOption, setSelectedAddrOption] = useState<'HOME' | 'OFFICE' | 'DROPOFF' | 'CUSTOM'>('HOME');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    async function loadSavedUser() {
      try {
        const userStr = await AsyncStorage.getItem('@bglaundry_user');
        if (userStr) {
          const u = JSON.parse(userStr);
          setUserProfile(u);
          const defaultAddr = u.pickupAddress || u.homeAddress || u.officeAddress || '';
          setPickupAddress(defaultAddr);
          setDeliveryAddress(defaultAddr);
          if (u.homeAddress && defaultAddr === u.homeAddress) {
            setSelectedAddrOption('HOME');
          } else if (u.officeAddress && defaultAddr === u.officeAddress) {
            setSelectedAddrOption('OFFICE');
          }
        }
      } catch (e) {
        console.warn('Failed to load user profile in basket:', e);
      }
    }
    void loadSavedUser();
  }, [isScheduleVisible]);

  const selectAddressOption = (option: 'HOME' | 'OFFICE' | 'DROPOFF' | 'CUSTOM') => {
    setSelectedAddrOption(option);
    if (option === 'HOME') {
      const addr = userProfile?.homeAddress || userProfile?.pickupAddress || '';
      setPickupAddress(addr);
      if (!deliveryAddress || deliveryAddress.includes('BG Laundry Hub')) setDeliveryAddress(addr);
    } else if (option === 'OFFICE') {
      const addr = userProfile?.officeAddress || '';
      setPickupAddress(addr);
      if (!deliveryAddress || deliveryAddress.includes('BG Laundry Hub')) setDeliveryAddress(addr);
    } else if (option === 'DROPOFF') {
      const hubAddr = 'BG Laundry Hub (16B Maria Okor Street, Ejibo, Lagos)';
      setPickupAddress(hubAddr);
      const returnAddr = userProfile?.homeAddress || userProfile?.pickupAddress || userProfile?.officeAddress || '';
      setDeliveryAddress(returnAddr);
    }
  };

  const handleIncrement = (itemName: string, serviceName: string, serviceCode: string, price: number) => {
    addToBasket(itemName, serviceCode, serviceName, price);
  };

  const handleDecrement = (itemName: string, serviceName: string) => {
    removeFromBasket(itemName, serviceName);
  };

  const handleDelete = (itemName: string, serviceName: string) => {
    deleteFromBasket(itemName, serviceName);
  };

  const handleProceedCheckout = () => {
    if (totalCount <= 0) {
      Alert.alert('Empty Basket', 'Please add some items to your basket first.');
      return;
    }
    // Refresh user address from storage
    AsyncStorage.getItem('@bglaundry_user').then(userStr => {
      if (userStr) {
        const u = JSON.parse(userStr);
        setUserProfile(u);
        if (!pickupAddress) {
          const addr = u.pickupAddress || u.homeAddress || u.officeAddress || '';
          setPickupAddress(addr);
          setDeliveryAddress(addr);
        }
      }
    }).catch(() => {});
    setIsScheduleVisible(true);
  };

  const handleConfirmSchedule = () => {
    if (!pickupAddress.trim()) {
      Alert.alert('Pickup Address Required', 'Please enter your pickup address to proceed.');
      return;
    }
    setIsScheduleVisible(false);
    setPaymentStep('PROCESSING');
    setIsFlutterwaveVisible(true);
    void handleFlutterwavePayment();
  };

  const handleFlutterwavePayment = async () => {
    setPaymentStep('PROCESSING');
    setReceipt(null);
    try {
      const formattedItems = Object.values(basket).map(item => ({
        serviceName: `${item.itemName} (${item.serviceName})`,
        quantity: item.quantity,
        price: item.price,
      }));

      const token = await AsyncStorage.getItem('@bglaundry_token');
      if (!token) throw new Error('Please sign in before checking out.');
      const authConfig = { headers: { Authorization: `Bearer ${token}` } };

      const orderResponse = await axios.post(`${API_URL}/orders/book`, {
        pickupAddress: pickupAddress.trim(),
        deliveryAddress: (deliveryAddress.trim() || pickupAddress.trim()),
        items: formattedItems,
      }, authConfig);

      const orderId = orderResponse.data.id;
      const orderNumber = orderResponse.data.orderNumber;

      // 2. Initialize Payment
      const paymentResponse = await axios.post(`${API_URL}/payments/initialize`, {
        orderId,
      }, authConfig);

      const checkoutUrl = paymentResponse.data.checkoutUrl;
      const reference = paymentResponse.data.payment.reference;
      if (!checkoutUrl || !(await Linking.canOpenURL(checkoutUrl))) {
        throw new Error('Unable to open Flutterwave checkout');
      }
      await Linking.openURL(checkoutUrl);
      for (let attempt = 0; attempt < 60; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const result = await axios.get(`${API_URL}/payments/status`, {
          params: { reference },
          ...authConfig,
        });
        if (result.data.status === 'SUCCESSFUL') {
          const confirmedReceipt = {
            reference: result.data.reference,
            orderNumber: result.data.order.orderNumber,
            amount: result.data.amount,
          };
          setReceipt(confirmedReceipt);
          try {
            const storedReceipts = await AsyncStorage.getItem('@bglaundry_receipts');
            const receipts = storedReceipts ? JSON.parse(storedReceipts) : [];
            await AsyncStorage.setItem(
              '@bglaundry_receipts',
              JSON.stringify([confirmedReceipt, ...(Array.isArray(receipts) ? receipts : [])].slice(0, 50)),
            );
          } catch (storageError) {
            console.warn('Payment confirmed, but receipt could not be saved locally:', storageError);
          }
          setPaymentStep('SUCCESS');
          clearBasket();
          return;
        }
        if (result.data.status === 'FAILED') throw new Error('Payment failed');
      }
      Alert.alert('Payment pending', `Order ${orderNumber} is awaiting confirmation.`);

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment not completed', 'Please try again. No payment was confirmed.');
    }
  };

  const basketKeys = Object.keys(basket);

  return (
    <View style={styles.container}>
      {/* Back Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Basket</Text>
        {totalCount > 0 ? (
          <TouchableOpacity style={styles.clearBtn} onPress={() => clearBasket()}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {totalCount <= 0 ? (
        /* Empty Basket State */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Feather name="shopping-bag" size={40} color="#0066FF" />
          </View>
          <Text style={styles.emptyTitle}>Your basket is empty</Text>
          <Text style={styles.emptySubtitle}>Select items from our service categories to get started.</Text>
          <TouchableOpacity style={styles.emptyGoBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.emptyGoBtnText}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* List of Basket Items */
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text style={styles.listSubtitle}>Review garments and service choices before confirming order</Text>

          {basketKeys.map((key) => {
            const item = basket[key];
            const isSuit = item.itemName.includes('Suit');
            const isGown = item.itemName.includes('Gown');
            const iconName = isSuit ? 'tie' : isGown ? 'cards-heart' : item.serviceCode === 'SHOE_LAUNDRY' ? 'shoe-sneaker' : item.serviceCode === 'IRONING' ? 'iron' : 'hanger';

            return (
              <View key={key} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  {/* Icon Column */}
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name={iconName as any} size={22} color="#0066FF" />
                  </View>

                  {/* Details Column */}
                  <View style={styles.detailsCol}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.itemName}</Text>
                    <Text style={styles.itemServiceLabel}>{item.serviceName.toUpperCase()}</Text>
                    <Text style={styles.itemPrice}>{formatNaira(item.price)}</Text>
                  </View>

                  {/* Delete Item Button */}
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.itemName, item.serviceName)}>
                    <Feather name="trash-2" size={15} color="#F43F5E" />
                  </TouchableOpacity>

                  {/* Quantities Counter */}
                  <View style={styles.counter}>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => handleDecrement(item.itemName, item.serviceName)}>
                      <Feather name="minus" size={13} color="#64748B" />
                    </TouchableOpacity>
                    <Text style={styles.counterText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => handleIncrement(item.itemName, item.serviceName, item.serviceCode, item.price)}>
                      <Feather name="plus" size={13} color="#0066FF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Delivery Note */}
          <View style={styles.deliveryNoteBox}>
            <Feather name="info" size={16} color="#0066FF" style={{ marginRight: 8, marginTop: 1 }} />
            <Text style={styles.deliveryNoteText}>Standard laundry returns in 24 hours. Gowns and Leather may take 48-72 hours.</Text>
          </View>
        </ScrollView>
      )}

      {/* Sticky Bottom Actions */}
      {totalCount > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.itemCountText}>{totalCount} {totalCount === 1 ? 'item' : 'items'} in basket</Text>
            </View>
            <Text style={styles.totalVal}>{formatNaira(totalAmount)}</Text>
          </View>

          <TouchableOpacity style={styles.proceedButton} onPress={handleProceedCheckout}>
            <Text style={styles.proceedButtonText}>Checkout</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL 1: Schedule Address */}
      <Modal visible={isScheduleVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalDragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Pickup & Delivery Address</Text>
              <TouchableOpacity onPress={() => setIsScheduleVisible(false)} style={styles.closeModalBtn}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Quick Address Selection</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {userProfile?.homeAddress ? (
                  <TouchableOpacity
                    style={[styles.addrPill, selectedAddrOption === 'HOME' && styles.addrPillActive]}
                    onPress={() => selectAddressOption('HOME')}
                  >
                    <Feather name="home" size={13} color={selectedAddrOption === 'HOME' ? '#0066FF' : '#64748B'} />
                    <Text style={[styles.addrPillText, selectedAddrOption === 'HOME' && styles.addrPillTextActive]}>Home Address</Text>
                  </TouchableOpacity>
                ) : null}

                {userProfile?.officeAddress ? (
                  <TouchableOpacity
                    style={[styles.addrPill, selectedAddrOption === 'OFFICE' && styles.addrPillActive]}
                    onPress={() => selectAddressOption('OFFICE')}
                  >
                    <Feather name="briefcase" size={13} color={selectedAddrOption === 'OFFICE' ? '#0066FF' : '#64748B'} />
                    <Text style={[styles.addrPillText, selectedAddrOption === 'OFFICE' && styles.addrPillTextActive]}>Office Address</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[styles.addrPill, selectedAddrOption === 'DROPOFF' && styles.addrPillActive]}
                  onPress={() => selectAddressOption('DROPOFF')}
                >
                  <Feather name="map-pin" size={13} color={selectedAddrOption === 'DROPOFF' ? '#0066FF' : '#64748B'} />
                  <Text style={[styles.addrPillText, selectedAddrOption === 'DROPOFF' && styles.addrPillTextActive]}>Drop-off at BG Hub</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Pickup Address *</Text>
              <TextInput 
                style={styles.textInput}
                value={pickupAddress}
                onChangeText={(text) => {
                  setPickupAddress(text);
                  setSelectedAddrOption('CUSTOM');
                }}
                placeholder="Enter pickup address"
                multiline
              />

              <Text style={styles.inputLabel}>Delivery Address (Optional if same as pickup)</Text>
              <TextInput 
                style={styles.textInput}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Enter delivery address"
                multiline
              />

              <TouchableOpacity style={styles.payTriggerBtn} onPress={handleConfirmSchedule}>
                <Text style={styles.payTriggerBtnText}>Proceed to Payment</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Checkout Payment Simulation */}
      <Modal visible={isFlutterwaveVisible} animationType="fade" transparent>
        <View style={styles.fwOverlay}>
          <View style={styles.fwCard}>
            
            {/* Header */}
            <View style={styles.fwHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="lock" size={18} color="#0066FF" />
                <Text style={styles.fwBrandText}>Secure Payment</Text>
              </View>
              <TouchableOpacity onPress={() => setIsFlutterwaveVisible(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Processing Spinner */}
            {paymentStep === 'PROCESSING' && (
              <View style={styles.fwFeedbackContainer}>
                <ActivityIndicator size="large" color="#0066FF" />
                <Text style={styles.fwLoadingText}>Authorizing transaction securely...</Text>
                <Text style={styles.fwLoadingSubtext}>Please do not close this transaction window.</Text>
              </View>
            )}

            {/* Success Animation */}
            {paymentStep === 'SUCCESS' && (
              <View style={styles.fwFeedbackContainer}>
                <View style={styles.successCircle}>
                  <Feather name="check" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.fwSuccessTitle}>Payment Successful!</Text>
                <Text style={styles.fwSuccessSub}>Transaction authorized and order booked.</Text>
                {receipt && (
                  <View style={styles.receiptCard}>
                    <View>
                      <Text style={styles.receiptLabel}>ORDER</Text>
                      <Text style={styles.receiptValue}>{receipt.orderNumber}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.receiptLabel}>AMOUNT PAID</Text>
                      <Text style={styles.receiptValue}>{formatNaira(receipt.amount)}</Text>
                    </View>
                    <Text style={styles.receiptReference}>Receipt ref: {receipt.reference}</Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.fwCloseBtn} 
                  onPress={() => {
                    setIsFlutterwaveVisible(false);
                    router.replace('/(tabs)/orders');
                  }}
                >
                  <Text style={styles.fwCloseBtnText}>Return to Orders</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  clearBtn: {
    paddingHorizontal: 8,
  },
  clearText: {
    fontSize: 14,
    color: '#F43F5E',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  listSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  /* Cart Item Card */
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsCol: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemServiceLabel: {
    fontSize: 10,
    color: '#0066FF',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 3,
  },
  counterBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  deliveryNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    marginTop: 12,
    marginBottom: 32,
  },
  deliveryNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#1D4ED8',
    lineHeight: 16,
  },
  /* Empty state */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FAFCFF',
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyGoBtn: {
    backgroundColor: '#0066FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyGoBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  /* Footer styles */
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  itemCountText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  totalVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  proceedButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  /* Modals Overlay */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '62%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalDragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeModalBtn: {
    padding: 4,
  },
  addrPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  addrPillActive: {
    backgroundColor: '#F0F7FF',
    borderColor: '#0066FF',
  },
  addrPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  addrPillTextActive: {
    color: '#0066FF',
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
  },
  payTriggerBtn: {
    backgroundColor: '#0066FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  payTriggerBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  /* Secure payment simulation overlay */
  fwOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  fwCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  fwHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2FE',
    padding: 16,
  },
  fwBrandText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0066FF',
    marginLeft: 8,
  },
  fwBody: {
    padding: 20,
  },
  fwMerchantBadge: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderColor: '#0066FF',
  },
  merchantLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  merchantName: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
    marginTop: 2,
  },
  fwAmountBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  fwAmountLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fwAmountValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  fwInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  fwInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
    backgroundColor: '#FAFCFF',
  },
  fwInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    padding: 0,
    fontWeight: '500',
  },
  fwPayBtn: {
    backgroundColor: '#0066FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fwPayBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  fwSecureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  fwSecureText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  fwFeedbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 300,
  },
  fwLoadingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 20,
  },
  fwLoadingSubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fwSuccessTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  fwSuccessSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  receiptLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  receiptValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
  },
  receiptReference: {
    width: '100%',
    fontSize: 10,
    color: '#64748B',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  fwCloseBtn: {
    backgroundColor: '#0066FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  fwCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
