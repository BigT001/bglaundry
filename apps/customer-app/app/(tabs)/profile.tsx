import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, TextInput, ScrollView, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../lib/config';
import { clearCustomerSession, getCustomerSession, saveCustomerSession } from '../../lib/session';

interface SavedAddress {
  id: string;
  title: string;
  address: string;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
];

export default function ProfileScreen() {
  const router = useRouter();

  // Profile Information State
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileName, setProfileName] = useState('Customer');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Modals Visibility
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  // Form Input States
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editHomeAddr, setEditHomeAddr] = useState('');
  const [editOfficeAddr, setEditOfficeAddr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Additional Address List State
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrVal, setNewAddrVal] = useState('');

  // Load stored profile and addresses on mount & focus
  const loadProfile = async () => {
    try {
      const { token, user: u } = await getCustomerSession();
      if (!token || !u?.id) {
        await clearCustomerSession();
        router.replace('/(auth)/login' as any);
        return;
      }
      if (u) {
        setUserProfile(u);
        setProfileName(u.fullName || 'Customer');
        setProfilePhone(u.phoneNumber || '');
        setProfileEmail(u.email || '');
        setHomeAddress(u.homeAddress || '');
        setOfficeAddress(u.officeAddress || '');
        setPickupAddress(u.pickupAddress || u.homeAddress || u.officeAddress || '');
        setAvatarUrl(u.avatarUrl || '');

        setEditName(u.fullName || '');
        setEditEmail(u.email || '');
        setEditHomeAddr(u.homeAddress || '');
        setEditOfficeAddr(u.officeAddress || '');
      }

      const savedAddrs = await AsyncStorage.getItem('@bglaundry_addresses');
      if (savedAddrs) {
        setAddresses(JSON.parse(savedAddrs));
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }
    if (!editHomeAddr.trim() && !editOfficeAddr.trim()) {
      Alert.alert('Required', 'Please provide at least one address (Home Address or Office Address).');
      return;
    }

    setSavingProfile(true);
    try {
      const { token } = await getCustomerSession();
      const payload = {
        fullName: editName.trim(),
        email: editEmail.trim(),
        homeAddress: editHomeAddr.trim(),
        officeAddress: editOfficeAddr.trim(),
        pickupAddress: editHomeAddr.trim() || editOfficeAddr.trim(),
        avatarUrl,
      };

      const response = await axios.patch(`${API_URL}/users/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = response.data.user || { ...userProfile, ...payload };
      setUserProfile(updatedUser);
      setProfileName(updatedUser.fullName);
      setProfileEmail(updatedUser.email || '');
      setHomeAddress(updatedUser.homeAddress || '');
      setOfficeAddress(updatedUser.officeAddress || '');
      setPickupAddress(updatedUser.pickupAddress || '');
      setAvatarUrl(updatedUser.avatarUrl || '');

      await saveCustomerSession(token, updatedUser);
      setIsEditProfileOpen(false);
      Alert.alert('Success', 'Your profile details have been updated!');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      Alert.alert('Update Note', err.response?.data?.error || 'Unable to update profile right now.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSelectAvatar = async (url: string) => {
    setAvatarUrl(url);
    setIsAvatarPickerOpen(false);
    try {
      const { token } = await getCustomerSession();
      const payload = {
        fullName: profileName,
        email: profileEmail,
        homeAddress,
        officeAddress,
        pickupAddress,
        avatarUrl: url,
      };
      const res = await axios.patch(`${API_URL}/users/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = res.data.user || { ...userProfile, avatarUrl: url };
      setUserProfile(updatedUser);
      await saveCustomerSession(token, updatedUser);
    } catch (e) {
      console.warn('Failed to update avatar on server:', e);
      if (userProfile) {
        const { token } = await getCustomerSession();
        const u = { ...userProfile, avatarUrl: url, sessionToken: token || userProfile.sessionToken };
        setUserProfile(u);
        await AsyncStorage.setItem('@bglaundry_user', JSON.stringify(u));
      }
    }
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
            if (Platform.OS === 'web') {
              const { auth: webAuth } = require('../../lib/firebase');
              const { signOut } = require('firebase/auth');
              await signOut(webAuth).catch(() => {});
            } else {
              const rnfbAuth = require('@react-native-firebase/auth');
              const authInst = typeof rnfbAuth === 'function' ? rnfbAuth() : (rnfbAuth && typeof rnfbAuth.default === 'function' ? rnfbAuth.default() : rnfbAuth);
              if (authInst && typeof authInst.signOut === 'function') {
                await authInst.signOut().catch(() => {});
              }
            }
          } catch (e) {
            console.warn('Firebase signout on logout failed:', e);
          }
          try {
            const { clearBasket } = require('../booking/basketState');
            clearBasket();
            await AsyncStorage.multiRemove([
              '@bglaundry_token',
              '@bglaundry_user',
              '@bglaundry_receipts',
              '@bglaundry_addresses',
              '@bglaundry_basket',
            ]);
            try {
              router.replace('/login' as any);
            } catch {
              router.replace('/(auth)/login' as any);
            }
          } catch (err) {
            console.error('Logout error:', err);
            try {
              router.replace('/login' as any);
            } catch {
              router.replace('/(auth)/login' as any);
            }
          }
        },
      },
    ]);
  };

  const initials = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'BG';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* 1. Header Profile & Avatar */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setIsAvatarPickerOpen(true)} style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.editBadge} onPress={() => setIsAvatarPickerOpen(true)}>
            <Feather name="camera" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{profileName}</Text>
        <Text style={styles.phone}>{profilePhone}</Text>
        {profileEmail ? <Text style={styles.emailText}>{profileEmail}</Text> : null}

        <TouchableOpacity style={styles.editProfileTriggerBtn} onPress={() => setIsEditProfileOpen(true)}>
          <Feather name="edit-3" size={15} color="#0066FF" style={{ marginRight: 6 }} />
          <Text style={styles.editProfileTriggerText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Customer Personal Details Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <TouchableOpacity onPress={() => setIsEditProfileOpen(true)}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIconBox}><Feather name="user" size={18} color="#0066FF" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Full Name</Text>
            <Text style={styles.detailValue}>{profileName}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIconBox}><Feather name="phone" size={18} color="#0066FF" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Phone Number</Text>
            <Text style={styles.detailValue}>{profilePhone || 'Not set'}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIconBox}><Feather name="mail" size={18} color="#0066FF" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Email Address</Text>
            <Text style={styles.detailValue}>{profileEmail || 'Add your email'}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIconBox}><Feather name="home" size={18} color="#10B981" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Home Address (Pickup Location)</Text>
            <Text style={styles.detailValue}>{homeAddress || pickupAddress || 'No home address saved'}</Text>
          </View>
        </View>

        <View style={styles.detailRowNoBorder}>
          <View style={styles.detailIconBox}><Feather name="briefcase" size={18} color="#8B5CF6" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Office Address</Text>
            <Text style={styles.detailValue}>{officeAddress || 'No office address saved'}</Text>
          </View>
        </View>
      </View>

      {/* 3. Menu options */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setIsAddressesOpen(true)}>
          <View style={styles.menuLeft}>
            <Feather name="map-pin" size={20} color="#0066FF" style={{ marginRight: 12 }} />
            <Text style={styles.menuText}>Additional Saved Addresses</Text>
          </View>
          <Feather name="chevron-right" size={16} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Help Center', 'Need assistance with an order? Call us at +234 800 BGLAUNDRY or email support@bglaundry.com')}>
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

      {/* MODAL 1: Edit Profile Modal */}
      <Modal visible={isEditProfileOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetLong}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit Profile Information</Text>
              <TouchableOpacity onPress={() => setIsEditProfileOpen(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="John Doe"
              />

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="customer@gmail.com"
              />

              <Text style={styles.label}>Home Address (Pickup Location) *</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                multiline
                value={editHomeAddr}
                onChangeText={setEditHomeAddr}
                placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
              />

              <Text style={styles.label}>Office Address (Work Location)</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                multiline
                value={editOfficeAddr}
                onChangeText={setEditOfficeAddr}
                placeholder="e.g. 42 Marina Street, Lagos Island"
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Profile Details</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Avatar Photo Picker Modal */}
      <Modal visible={isAvatarPickerOpen} animationType="fade" transparent>
        <View style={styles.modalOverlayForm}>
          <View style={styles.formCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.formTitle}>Choose Profile Picture</Text>
              <TouchableOpacity onPress={() => setIsAvatarPickerOpen(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Select a profile picture style:</Text>
            
            <View style={styles.presetGrid}>
              {AVATAR_PRESETS.map((url, idx) => (
                <TouchableOpacity key={idx} onPress={() => handleSelectAvatar(url)} style={styles.presetItem}>
                  <Image source={{ uri: url }} style={styles.presetImage} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAvatarPickerOpen(false)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Saved Addresses Sheet */}
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

      {/* MODAL 3A: Add Address Form */}
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
                <Text style={styles.saveBtnText}>Save Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
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
    marginVertical: 16,
    paddingTop: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E6F0FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#002B7F',
    overflow: 'hidden',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#002B7F',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0066FF',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  phone: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  emailText: {
    fontSize: 13,
    color: '#0066FF',
    fontWeight: '600',
    marginTop: 2,
  },
  editProfileTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  editProfileTriggerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  editLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 12,
  },
  detailRowNoBorder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 12,
  },
  detailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  menu: {
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
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
    marginTop: 24,
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
  bottomSheetLong: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  /* Form components overlay */
  modalOverlayForm: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    marginVertical: 16,
  },
  presetItem: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#0066FF',
    overflow: 'hidden',
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
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
});
