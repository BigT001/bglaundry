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
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { auth } from '../../lib/firebase';
import { signInWithPhoneNumber, ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

type LoginStep = 'PHONE' | 'OTP' | 'PROFILE';

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [step, setStep] = useState<LoginStep>('PHONE');
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null);

  const API_URL = 'http://localhost:4000/api/v1';

  // Initialize reCAPTCHA verifier for Web browser execution
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('[Firebase Auth] Web Recaptcha resolved successfully.');
          }
        });
        setRecaptchaVerifier(verifier);
      } catch (err) {
        console.warn('[Firebase Auth] Failed to initialize Web RecaptchaVerifier:', err);
      }
    }
  }, []);

  const handleRequestOtp = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+234${phoneNumber.replace(/^0+/, '')}`;
      let verifier: any;

      if (Platform.OS === 'web' && recaptchaVerifier) {
        // For real SMS testing on Web, disable testing bypass and use the real verifier
        auth.settings.appVerificationDisabledForTesting = false;
        verifier = recaptchaVerifier;
      } else {
        // For testing/mocking in simulators (or native without linked keys), bypass recaptcha
        auth.settings.appVerificationDisabledForTesting = true;
        verifier = {
          type: 'recaptcha' as const,
          verify: async () => 'mock-recaptcha-token',
          _reset: () => {},
          clear: () => {},
        };
      }
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmation);
      setStep('OTP');
      Alert.alert(
        'Verification Code Sent',
        'Please enter the 6-digit code sent to your phone.'
      );
    } catch (error: any) {
      console.error('Firebase Request OTP failed:', error);
      Alert.alert('Authentication Error', error.message || 'Failed to send OTP verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (code.trim().length < 4) {
      Alert.alert('Error', 'Please enter a valid verification code.');
      return;
    }
    setLoading(true);
    try {
      if (!confirmationResult) {
        Alert.alert('Error', 'No active verification session. Please request a new code.');
        setLoading(false);
        return;
      }
      
      // 1. Verify code on Firebase Auth
      const userCredential = await confirmationResult.confirm(code);
      // 2. Fetch the ID Token from the signed-in user profile
      const firebaseToken = await userCredential.user.getIdToken();

      // 3. Authenticate with Next.js database API
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+234${phoneNumber.replace(/^0+/, '')}`;
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        phoneNumber: formattedPhone,
        idToken: firebaseToken,
      });
      
      const { token, user } = response.data;

      if (!user.fullName || user.fullName === 'Customer Account') {
        setTempToken(token);
        setTempUser(user);
        setStep('PROFILE');
      } else {
        await AsyncStorage.setItem('@bglaundry_token', token);
        await AsyncStorage.setItem('@bglaundry_user', JSON.stringify(user));
        Alert.alert('Success', 'Logged in successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);
      }
    } catch (error: any) {
      console.error('Verify OTP Error:', error);
      Alert.alert('Verification Failed', 'The code is incorrect or expired. Please check your messages and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterName = async () => {
    if (!fullName || fullName.trim().length < 2) {
      Alert.alert('Error', 'Please enter your full name to proceed.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.patch(
        `${API_URL}/users/profile`,
        { fullName: fullName.trim() },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
        },
      );

      const updatedUser = response.data.user;

      await AsyncStorage.setItem('@bglaundry_token', tempToken);
      await AsyncStorage.setItem('@bglaundry_user', JSON.stringify(updatedUser));

      Alert.alert('Success', 'Profile completed!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error: any) {
      console.error('Onboarding Error:', error);
      Alert.alert('Error', 'Failed to update profile name. Please try again.');
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
        {/* Brand visual header */}
        <View style={styles.headerSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>BG</Text>
          </View>
          <Text style={styles.brandTitle}>BG Laundry</Text>
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
          </View>
        )}

        {step === 'PROFILE' && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Create Your Profile</Text>
            <Text style={styles.sectionSubtitle}>
              Please enter your full name so our pickup riders can easily recognize you.
            </Text>

            <TextInput
              style={styles.nameInput}
              placeholder="e.g. Blessed Chibuikem"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
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
    marginBottom: 44,
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
  nameInput: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    fontSize: 16,
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
