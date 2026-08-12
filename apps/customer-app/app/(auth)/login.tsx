import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { API_URL } from '../../lib/config';
import { getCustomerSession, saveCustomerSession } from '../../lib/session';
import { registerForLiveNotifications } from '../../lib/push-notifications';

type LoginStep = 'PHONE' | 'OTP' | 'PROFILE';

const getFormattedPhone = (rawPhone: string) => {
  const digits = rawPhone.replace(/\D/g, '');
  if (rawPhone.startsWith('+')) return rawPhone;
  return `+234${digits.replace(/^0+/, '')}`;
};

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<LoginStep>('PHONE');
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);

  const handleRequestOtp = async () => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number (e.g. 08106889242).');
      return;
    }
    setLoading(true);
    setCode('');
    const formattedPhone = getFormattedPhone(phoneNumber);

    try {
      console.log(`[SMS Gateway] Requesting OTP code via ${API_URL}/auth/request-otp...`);
      const response = await axios.post(
        `${API_URL}/auth/request-otp`,
        { phoneNumber: formattedPhone },
        { timeout: 20000 }
      );

      if (response.data?.success) {
        setStep('OTP');
        Alert.alert(
          'Verification Code Sent',
          `A 6-digit SMS verification code was sent to ${formattedPhone}. Please check your phone messages.`
        );
      } else {
        throw new Error(response.data?.error || 'Failed to send SMS verification code.');
      }
    } catch (err: any) {
      console.error('[SMS Request Error]', err);
      let msg = 'Could not send SMS verification code. Please check your network connection.';
      if (axios.isAxiosError(err)) {
        if (err.message === 'Network Error' || !err.response) {
          msg = `Network Connection Error: Could not reach backend server at ${API_URL}. Ensure your phone is connected to Wi-Fi.`;
        } else {
          msg = err.response?.data?.error || err.message;
        }
      } else if (err?.message) {
        msg = err.message;
      }
      Alert.alert('Connection Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanCode = code.replace(/\D/g, '').trim();
    if (cleanCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit verification code.');
      return;
    }
    setLoading(true);
    const formattedPhone = getFormattedPhone(phoneNumber);

    try {
      console.log('[SMS Gateway] Verifying OTP code with BG Laundry Server...');
      const response = await axios.post(
        `${API_URL}/auth/verify-otp`,
        {
          phoneNumber: formattedPhone,
          code: cleanCode,
        },
        { timeout: 20000 }
      );

      const { token, user } = response.data;
      if (typeof token !== 'string' || token.trim().length === 0 || !user?.id) {
        throw new Error('Verification succeeded, but the server did not return a valid login session. Please request a new code and try again.');
      }

      const sessionToken = token.trim();
      setTempToken(sessionToken);
      setTempUser(user);
      await saveCustomerSession(sessionToken, user);

      if (!user.fullName || user.fullName === 'Customer Account') {
        setStep('PROFILE');
      } else {
        setTimeout(() => {
          void registerForLiveNotifications();
        }, 1500);
        Alert.alert('Success', 'Logged in successfully!', [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)' as any);
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error('Sign-in verification error:', error);
      let serverMsg = 'The code entered is invalid or expired. Please try again.';
      if (axios.isAxiosError(error)) {
        if (error.message === 'Network Error' || !error.response) {
          serverMsg = `Network Error: Could not reach backend server at ${API_URL}. Ensure your phone is connected to Wi-Fi.`;
        } else {
          serverMsg = error.response?.data?.error || error.message;
        }
      }
      Alert.alert('Verification Failed', serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const [homeAddress, setHomeAddress] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');

  const handleRegisterName = async () => {
    if (!fullName || fullName.trim().length < 2) {
      Alert.alert('Error', 'Please enter your full name to proceed.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address for account recovery.');
      return;
    }
    const cleanHome = homeAddress.trim();
    const cleanOffice = officeAddress.trim();
    if (!cleanHome && !cleanOffice) {
      Alert.alert(
        'Address Required',
        'Please enter your Home Address or Office Address (or both) so our riders can fulfill your laundry pickups.'
      );
      return;
    }

    const { token: storedToken } = await getCustomerSession();
    const authToken = tempToken || storedToken;
    if (!authToken) {
      Alert.alert('Session Note', 'Your login token was missing. Please re-enter your verification code.', [
        { text: 'OK', onPress: () => setStep('PHONE') },
      ]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(
        `${API_URL}/users/profile`,
        {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          homeAddress: cleanHome,
          officeAddress: cleanOffice,
          pickupAddress: cleanHome || cleanOffice,
          sessionToken: authToken,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const updatedUser = response.data.user;

      await saveCustomerSession(authToken, updatedUser);
      setTimeout(() => {
        void registerForLiveNotifications();
      }, 1500);

      Alert.alert('Success', 'Profile completed!', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(tabs)' as any);
          },
        },
      ]);
    } catch (error: any) {
      console.error('Onboarding Error:', error);
      let errorMsg = 'Failed to complete profile. Please try again.';
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        const rawErr = error.response.data.error;
        if (typeof rawErr === 'string' && (rawErr.includes('Prisma') || rawErr.includes('invocation'))) {
          errorMsg = 'A database update occurred. Please tap Complete Registration again.';
        } else {
          errorMsg = rawErr;
        }
      }
      Alert.alert('Registration Note', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Brand visual header with official logo */}
        <View style={styles.headerSection}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandSubtitle}>Clean today, ready tomorrow!</Text>
        </View>

        {step === 'PHONE' && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Verification</Text>
            <Text style={styles.sectionSubtitle}>
              Please enter your phone number. We will send you an OTP to verify your account.
            </Text>

            {/* Custom styled single-input phone container */}
            <View style={styles.phoneInputRow}>
              <Text style={styles.countryCodeText}>+234</Text>
              <View style={styles.verticalDivider} />
              <TextInput
                style={styles.borderlessInput}
                placeholder="8106889242"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                editable={!loading}
                maxLength={11}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRequestOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 'OTP' && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Enter Verification Code</Text>
            <Text style={styles.sectionSubtitle}>
              Type the code sent to your phone number (+234) {phoneNumber}.
            </Text>

            <TextInput
              style={styles.codeOtpInput}
              placeholder="e.g. 123456"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('PHONE')} disabled={loading}>
              <Text style={styles.linkText}>Change Phone Number</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRequestOtp} disabled={loading} style={{ marginTop: 6 }}>
              <Text style={[styles.linkText, { color: '#0066FF' }]}>Resend SMS Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'PROFILE' && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Create Your Profile</Text>
            <Text style={styles.sectionSubtitle}>
              Enter your details to complete setup. A pickup address (Home or Office) is mandatory.
            </Text>

            <Text style={styles.fieldLabel}>Full Name *</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="e.g. Blessed Chibuikem"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />

            <Text style={styles.fieldLabel}>Email Address *</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />

            <Text style={styles.fieldLabel}>Home Address (Pickup Location) *</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
              placeholderTextColor="#94A3B8"
              value={homeAddress}
              onChangeText={setHomeAddress}
              editable={!loading}
            />

            <Text style={styles.fieldLabel}>Office Address (Optional if Home Address entered)</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="e.g. Suite 402, Victoria Island Tower, Lagos"
              placeholderTextColor="#94A3B8"
              value={officeAddress}
              onChangeText={setOfficeAddress}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegisterName}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Complete Registration</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        {Platform.OS === 'web' && <View id="recaptcha-container" style={{ display: 'none' } as any} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoImage: {
    width: 96,
    height: 96,
    marginBottom: 12,
    borderRadius: 22,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#002B7F',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14.5,
    color: '#64748B',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 28,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  verticalDivider: {
    width: 1.5,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 16,
  },
  borderlessInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002B7F',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nameInput: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 24,
  },
  codeOtpInput: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    fontSize: 20,
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '800',
    marginBottom: 24,
  },
  button: {
    height: 54,
    backgroundColor: '#002B7F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#002B7F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  linkText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
});
