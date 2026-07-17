'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { auth } from '../../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

type LoginStep = 'PHONE' | 'OTP' | 'ONBOARDING';

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [step, setStep] = useState<LoginStep>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // Onboarding temporary states
  const [tempToken, setTempToken] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);

  // Initialize reCAPTCHA Verifier
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Create invisible recaptcha verifier
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('[reCAPTCHA] Resolved successfully.');
          }
        });
        setRecaptchaVerifier(verifier);
      } catch (err: any) {
        console.error('[reCAPTCHA] Initialization failed:', err);
        setError('Failed to initialize security verification. Please reload the page.');
      }
    }
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || loading) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+234${phoneNumber.replace(/^0+/, '')}`;
      
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA verifier is not ready yet. Please try again.');
      }

      // Trigger Firebase Phone Auth SMS request
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('OTP');
      setSuccess(`Verification code sent to ${formattedPhone}.`);
    } catch (err: any) {
      console.error('[Firebase SMS Error]', err);
      setError(err.message || 'Failed to send SMS code. Please verify your phone number.');
      // Reset recaptcha verifier to prevent lockups
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
        setRecaptchaVerifier(verifier);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult || loading) return;

    setLoading(true);
    setError('');

    try {
      // 1. Confirm code on Firebase Client Auth
      const userCredential = await confirmationResult.confirm(otp);
      const firebaseToken = await userCredential.user.getIdToken();

      // 2. Verify with Next.js Backend API
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+234${phoneNumber.replace(/^0+/, '')}`;
      const response = await axios.post('/api/v1/auth/verify-otp', {
        phoneNumber: formattedPhone,
        idToken: firebaseToken,
      });

      const { token, user } = response.data;

      // 3. Check if onboarding is needed
      if (!user.fullName || user.fullName === 'Customer Account') {
        setTempToken(token);
        setTempUser(user);
        setStep('ONBOARDING');
      } else {
        localStorage.setItem('customerToken', token);
        localStorage.setItem('customerUser', JSON.stringify(user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('[OTP Verification Error]', err);
      setError(err.response?.data?.error || err.message || 'Verification failed. Please double check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !tempToken || !tempUser || loading) return;

    setLoading(true);
    setError('');

    try {
      // Call backend user profile update API
      const response = await axios.put(
        `/api/v1/users/${tempUser.id}`,
        { fullName: fullName.trim() },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );

      const updatedUser = response.data;
      
      // Save session credentials
      localStorage.setItem('customerToken', tempToken);
      localStorage.setItem('customerUser', JSON.stringify(updatedUser));
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[Onboarding Error]', err);
      setError(err.response?.data?.error || 'Failed to register your name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Invisible Recaptcha Container required by Firebase SDK */}
      <div id="recaptcha-container"></div>

      {/* Brand Hero Column (Left Side) */}
      <div style={{
        flex: 1,
        backgroundColor: '#002B7F',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        color: '#FFFFFF'
      }} className="hidden md:flex">
        <div style={{ maxWidth: '440px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '24px' }}>
            Clean Today,<br />Ready Tomorrow!
          </h1>
          <p style={{ fontSize: '16px', color: '#E6F0FA', lineHeight: '1.6', margin: 0 }}>
            Premium laundry and dry cleaning services delivered directly to your doorstep. Schedule, track, and complete your laundry orders in under 60 seconds.
          </p>
        </div>
      </div>

      {/* Auth Interface Column (Right Side) */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#FFFFFF',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #E6F0FA',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          {/* Logo / Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#002B7F', margin: '0 0 8px 0' }}>
              BG Laundry
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
              {step === 'PHONE' && 'Sign in or register with your phone'}
              {step === 'OTP' && 'Enter your security code'}
              {step === 'ONBOARDING' && 'Help us know who you are'}
            </p>
          </div>

          {/* Feedback Messages */}
          {error ? (
            <div style={{
              padding: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '6px',
              color: '#B91C1C',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          ) : null}

          {success ? (
            <div style={{
              padding: '12px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #86EFAC',
              borderRadius: '6px',
              color: '#166534',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {success}
            </div>
          ) : null}

          {/* Step 1: Phone Request Form */}
          {step === 'PHONE' && (
            <form onSubmit={handleRequestOtp}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 08158928839"
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    boxSizing: 'border-box',
                    border: '1px solid #E6F0FA',
                    borderRadius: '6px',
                    fontSize: '15px',
                    color: '#0F172A',
                    outline: 'none',
                    backgroundColor: '#F8FAFC'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !phoneNumber}
                  style={{
                    width: '100%',
                    marginTop: '24px',
                    padding: '14px',
                    backgroundColor: '#002B7F',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: (loading || !phoneNumber) ? 'not-allowed' : 'pointer',
                    opacity: (loading || !phoneNumber) ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {loading ? 'Sending verification...' : 'Request Code'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification Form */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="e.g. 789044"
                  maxLength={6}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    boxSizing: 'border-box',
                    border: '1px solid #E6F0FA',
                    borderRadius: '6px',
                    fontSize: '16px',
                    color: '#0F172A',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                    textAlign: 'center',
                    letterSpacing: '8px',
                    fontWeight: 'bold'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  style={{
                    width: '100%',
                    marginTop: '24px',
                    padding: '14px',
                    backgroundColor: '#0066FF',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer',
                    opacity: (loading || otp.length < 6) ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {loading ? 'Verifying OTP...' : 'Verify & Continue'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '8px',
                    backgroundColor: 'transparent',
                    color: '#64748B',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Change Phone Number
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Onboarding Details Form */}
          {step === 'ONBOARDING' && (
            <form onSubmit={handleCompleteOnboarding}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Samuel Stanley"
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    boxSizing: 'border-box',
                    border: '1px solid #E6F0FA',
                    borderRadius: '6px',
                    fontSize: '15px',
                    color: '#0F172A',
                    outline: 'none',
                    backgroundColor: '#F8FAFC'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !fullName.trim()}
                  style={{
                    width: '100%',
                    marginTop: '24px',
                    padding: '14px',
                    backgroundColor: '#0066FF',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: (loading || !fullName.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (loading || !fullName.trim()) ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {loading ? 'Completing profile...' : 'Complete & Continue'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
