import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedAddress {
  id: string;
  title: string;
  address: string;
}

export default function ProfileScreen() {
  const router = useRouter();

  // Profile Information State
  const [profileName, setProfileName] = useState('Blessed G.');
  const [profilePhone, setProfilePhone] = useState('+234 810 688 9242');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Address List State
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    { id: '1', title: 'Home', address: '16B Maria Okor Street, Ejibo, Lagos' },
    { id: '2', title: 'Office', address: '42 Isaac John Street, Ikeja, Lagos' }
  ]);

  // Modals Visibility
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  // Form Input States
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrVal, setNewAddrVal] = useState('');

  // Upload simulation state
  const [uploading, setUploading] = useState(false);

  // Load stored profile and addresses on mount
  useEffect(() => {
    const loadUserInfoAndAddresses = async () => {
      try {
        const userStr = await AsyncStorage.getItem('@bglaundry_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.fullName) setProfileName(user.fullName);
          if (user.phoneNumber) setProfilePhone(user.phoneNumber);
        }

        const savedAddrs = await AsyncStorage.getItem('@bglaundry_addresses');
        if (savedAddrs) {
          setAddresses(JSON.parse(savedAddrs));
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      }
    };
    loadUserInfoAndAddresses();
  }, []);

  const handleSelectMockImage = (uri: string) => {
    setUploading(true);
    setTimeout(() => {
      setAvatarUri(uri);
      setUploading(false);
      setIsAvatarOpen(false);
      Alert.alert('Success', 'Profile photo updated successfully!');
    }, 1200);
  };

  const handleAddAddress = async () => {
    if (!newAddrTitle || !newAddrVal) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    const newAddr: SavedAddress = {
      id: Date.now().toString(),
      title: newAddrTitle,
      address: newAddrVal,
    };
    const updatedList = [...addresses, newAddr];
    setAddresses(updatedList);
    try {
      await AsyncStorage.setItem('@bglaundry_addresses', JSON.stringify(updatedList));
    } catch (err) {
      console.error('Failed to persist address:', err);
    }
    setNewAddrTitle('');
    setNewAddrVal('');
    setIsAddAddressOpen(false);
  };

  const handleDeleteAddress = async (id: string) => {
    const updatedList = addresses.filter(a => a.id !== id);
    setAddresses(updatedList);
    try {
      await AsyncStorage.setItem('@bglaundry_addresses', JSON.stringify(updatedList));
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('@bglaundry_token');
            await AsyncStorage.removeItem('@bglaundry_user');
            router.replace('/');
          } catch (err) {
            console.error('Logout error:', err);
            router.replace('/');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 1. Profile Picture & Core Details */}
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.avatarWrapper} onPress={() => setIsAvatarOpen(true)}>
          <View style={styles.avatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>BG</Text>
            )}
          </View>
          <View style={styles.editBadge}>
            <Feather name="camera" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{profileName}</Text>
        <Text style={styles.phone}>{profilePhone}</Text>
      </View>

      {/* 2. Menu options */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setIsAddressesOpen(true)}>
          <View style={styles.menuLeft}>
            <Feather name="map-pin" size={20} color="#0066FF" style={{ marginRight: 12 }} />
            <Text style={styles.menuText}>Saved Addresses</Text>
          </View>
          <Feather name="chevron-right" size={16} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Feather name="help-circle" size={20} color="#0066FF" style={{ marginRight: 12 }} />
            <Text style={styles.menuText}>Help & Support</Text>
          </View>
          <Feather name="chevron-right" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      {/* MODAL 1: Avatar Image Picker Simulation */}
      <Modal visible={isAvatarOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Update Profile Picture</Text>
              <TouchableOpacity onPress={() => setIsAvatarOpen(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {uploading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0066FF" />
                <Text style={styles.loaderText}>Uploading image to secure servers...</Text>
              </View>
            ) : (
              <View style={{ padding: 20 }}>
                <Text style={styles.promptText}>Select a photo from your device profile gallery:</Text>
                
                <View style={styles.mockGallery}>
                  <TouchableOpacity onPress={() => handleSelectMockImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')}>
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }} style={styles.galleryThumb} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleSelectMockImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')}>
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }} style={styles.galleryThumb} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleSelectMockImage('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150')}>
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }} style={styles.galleryThumb} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.selectBtn} onPress={() => handleSelectMockImage('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150')}>
                  <Feather name="image" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.selectBtnText}>Import Custom Image</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Saved Addresses Sheet */}
      <Modal visible={isAddressesOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetLong}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Saved Addresses</Text>
              <TouchableOpacity onPress={() => setIsAddressesOpen(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {addresses.map(addr => (
                <View key={addr.id} style={styles.addrCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addrTitle}>{addr.title}</Text>
                    <Text style={styles.addrText}>{addr.address}</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteAddress(addr.id)}>
                    <Feather name="trash-2" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addTriggerBtn} onPress={() => setIsAddAddressOpen(true)}>
                <Feather name="plus" size={16} color="#0066FF" style={{ marginRight: 6 }} />
                <Text style={styles.addTriggerBtnText}>Add New Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2A: Add Address Form */}
      <Modal visible={isAddAddressOpen} animationType="fade" transparent>
        <View style={styles.modalOverlayForm}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Location</Text>
            
            <Text style={styles.label}>Address Label (e.g. Home, Work)</Text>
            <TextInput 
              style={styles.input}
              value={newAddrTitle}
              onChangeText={setNewAddrTitle}
              placeholder="Home / Work / Office"
            />

            <Text style={styles.label}>Full Address Details</Text>
            <TextInput 
              style={styles.input}
              value={newAddrVal}
              onChangeText={setNewAddrVal}
              placeholder="Street name, City, Lagos"
            />

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddAddressOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddAddress}>
                <Text style={styles.saveBtnText}>Save Address</Text>
              </TouchableOpacity>
            </View>
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
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 24,
    paddingTop: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E6F0FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#002B7F',
    overflow: 'hidden',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#002B7F',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0066FF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  phone: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  menu: {
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    marginTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutButtonText: {
    color: '#F43F5E',
    fontSize: 15,
    fontWeight: 'bold',
  },
  /* Bottom sheet overlays */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  bottomSheetLong: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  promptText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  /* Mock photo gallery picker */
  mockGallery: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  galleryThumb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectBtn: {
    backgroundColor: '#0066FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selectBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 16,
  },
  /* Saved Addresses list UI */
  addrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  addrTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  addrText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  deleteBtn: {
    padding: 8,
  },
  addTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#0066FF',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 32,
  },
  addTriggerBtnText: {
    fontSize: 14,
    color: '#0066FF',
    fontWeight: 'bold',
  },
  /* Form components overlay */
  modalOverlayForm: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0066FF',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  /* Cards visual designs */
  cardBlock: {
    marginBottom: 20,
  },
  creditCardVisual: {
    backgroundColor: '#002B7F',
    borderRadius: 16,
    padding: 20,
    minHeight: 180,
    justifyContent: 'space-between',
    shadowColor: '#002B7F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHolderLabel: {
    color: '#93C5FD',
    fontSize: 9,
    fontWeight: '600',
  },
  cardHolderName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  cardRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  cardRemoveBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
