'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/v1/auth/login', {
        phoneNumber: phone,
        password,
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
      setError(err.response?.data?.error || 'Invalid phone number or password.');
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

        <form onSubmit={handleAdminLogin}>
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

            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#0F172A',
                marginTop: '16px',
                marginBottom: '8px',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
