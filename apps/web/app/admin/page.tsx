'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    setError('');
    try {
      await axios.post('/api/v1/auth/request-otp', { phoneNumber: phone });
      setStep(2);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to request OTP. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/v1/auth/verify-otp', {
        phoneNumber: phone,
        code: otp,
      });
      const { token, user } = response.data;

      if (user.role !== 'ADMIN') {
        setError(
          'Access Denied: Only users with the ADMIN role can access this portal.',
        );
        return;
      }

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Invalid OTP code. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#FFFFFF',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #E6F0FA',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#002B7F',
            textAlign: 'center',
            margin: '0 0 8px 0',
          }}
        >
          BG Admin Portal
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: '#64748B',
            textAlign: 'center',
            margin: '0 0 32px 0',
          }}
        >
          laundry business admin panel login
        </p>

        {error ? (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '6px',
              color: '#B91C1C',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        ) : null}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0F172A',
                  marginBottom: '8px',
                }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 07058155555"
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
                  backgroundColor: '#F8FAFC',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '12px',
                  backgroundColor: '#002B7F',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Sending Request...' : 'Request Access Token'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0F172A',
                  marginBottom: '8px',
                }}
              >
                Enter 4-Digit Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="e.g. 1234"
                maxLength={4}
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
                  backgroundColor: '#F8FAFC',
                  textAlign: 'center',
                  letterSpacing: '4px',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '12px',
                  backgroundColor: '#0066FF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  color: '#64748B',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Back to Phone Number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
