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
type AuthMode = 'LOGIN' | 'REGISTER';

const getFormattedPhone = (rawPhone: string) => {
  const digits = rawPhone.replace(/\D/g, '');
  if (rawPhone.startsWith('+')) return rawPhone;
  return `+234${digits.replace(/^0+/, '')}`;
};

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<LoginStep>('PHONE');
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);

  const handlePasswordLogin = async () => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 10 || password.length === 0) {
      Alert.alert('Missing details', 'Enter your phone number and password to continue.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        phoneNumber: getFormattedPhone(phoneNumber),
        password,
        client: 'customer-mobile',
      }, { timeout: 20000 });
      const { token, user } = response.data;
      if (typeof token !== 'string' || !user?.id) throw new Error('The server did not return a valid login session.');
      await saveCustomerSession(token.trim(), user);
      setTimeout(() => { void registerForLiveNotifications(); }, 1500);
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error || error.message : error?.message;
      Alert.alert('Login failed', message || 'Could not log in. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEmailOtp = async () => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Missing details', 'Enter a valid phone number and email address to register.');
      return;
    }
    setLoading(true);
    setCode('');
    const formattedPhone = getFormattedPhone(phoneNumber);

    try {
      console.log(`[Email Gateway] Requesting verification code via ${API_URL}/auth/register/request-email-otp...`);
      const response = await axios.post(
        `${API_URL}/auth/register/request-email-otp`,
        { phoneNumber: formattedPhone, email: email.trim().toLowerCase() },
        { timeout: 20000 }
      );

      if (response.data?.success) {
        setStep('OTP');
        if (response.data?.developmentCode) {
          Alert.alert(
            'Development OTP',
            `Use this code in the simulator: ${response.data.developmentCode}`
          );
        } else {
          Alert.alert(
            'Verification Code Sent',
            `A 6-digit verification code was sent to ${email.trim().toLowerCase()}. Please check your email.`
          );
        }
      } else {
        throw new Error(response.data?.error || 'Failed to send email verification code.');
      }
    } catch (err: any) {
      console.error('[Email Request Error]', err);
      let msg = 'Could not send email verification code. Please check your network connection.';
      if (axios.isAxiosError(err)) {
        if (err.message === 'Network Error' || !err.response) {
          msg = `Network Connection Error: Could not reach backend server at ${API_URL}. Ensure your phone is connected to Wi-Fi.`;
        } else {
          msg = err.response?.data?.error || err.message;
        }
      } else if (err?.message) {
        msg = err.message;
      }
      Alert.alert('Verification Email Failed', msg);
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
    try {
      console.log('[Email Gateway] Verifying registration code with BG Laundry Server...');
      const response = await axios.post(
        `${API_URL}/auth/register/verify-email-otp`,
        {
          email: email.trim().toLowerCase(),
          code: cleanCode,
          password,
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
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      Alert.alert('Invalid Password', 'Use at least 8 characters with one letter and one number.');
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
          password,
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
        <View style={styles.headerSection}>
          <View style={styles.logoFrame}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandSubtitle}>Clean today, ready tomorrow!</Text>
        </View>

        {step === 'PHONE' && (
          <View style={styles.formContainer}>
            <View style={styles.modeRow}>
              <TouchableOpacity style={[styles.modeButton, authMode === 'LOGIN' && styles.modeButtonActive]} onPress={() => setAuthMode('LOGIN')} disabled={loading}>
                <Text style={[styles.modeText, authMode === 'LOGIN' && styles.modeTextActive]}>Log in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modeButton, authMode === 'REGISTER' && styles.modeButtonActive]} onPress={() => setAuthMode('REGISTER')} disabled={loading}>
                <Text style={[styles.modeText, authMode === 'REGISTER' && styles.modeTextActive]}>Create account</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionTitle}>{authMode === 'LOGIN' ? 'Welcome back' : 'Create your account'}</Text>
            <Text style={styles.sectionSubtitle}>
              {authMode === 'LOGIN' ? 'Log in with the phone number and password you use on BG Laundry web or mobile.' : 'We will verify your phone by SMS once, then you will create a password for future logins.'}
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

            {authMode === 'REGISTER' && (
              <>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Email address"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
                <TextInput
                  style={styles.nameInput}
                  placeholder="Create password (8+ characters)"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
              </>
            )}

            {authMode === 'LOGIN' && (
              <TextInput
                style={styles.nameInput}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={authMode === 'LOGIN' ? handlePasswordLogin : handleRequestEmailOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{authMode === 'LOGIN' ? 'Log in' : 'Send verification code'}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 'OTP' && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Enter Verification Code</Text>
            <Text style={styles.sectionSubtitle}>
              Type the code sent to {email}.
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

            <TouchableOpacity onPress={handleRequestEmailOtp} disabled={loading} style={{ marginTop: 6 }}>
              <Text style={[styles.linkText, { color: '#0066FF' }]}>Resend Email Code</Text>
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

            <Text style={styles.fieldLabel}>Password *</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="At least 8 characters"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
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
    backgroundColor: '#F3F3F3',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 26,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoFrame: {
    width: 132,
    height: 132,
    borderRadius: 30,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
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
    fontSize: 15,
    color: '#49576A',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#E7E7E7',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  modeButton: {
    flex: 1,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  modeButtonActive: {
    backgroundColor: '#F7F7F7',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  modeText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 15,
  },
  modeTextActive: {
    color: '#002B7F',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    marginBottom: 20,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 16,
    marginBottom: 18,
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
    height: 58,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 18,
  },
  codeOtpInput: {
    height: 60,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#F7F7F7',
    fontSize: 20,
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '800',
    marginBottom: 20,
  },
  button: {
    height: 58,
    backgroundColor: '#002B7F',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#002B7F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
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
