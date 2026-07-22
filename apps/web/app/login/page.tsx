'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type Step = 'MODE_SELECT' | 'LOGIN_PHONE' | 'LOGIN_PASSWORD' | 'SIGNUP_PHONE' | 'SIGNUP_NAME' | 'SIGNUP_ADDRESS' | 'SIGNUP_PASSWORD' | 'SUCCESS';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('MODE_SELECT');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [addressType, setAddressType] = useState<'HOME' | 'OFFICE'>('HOME');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password || loading) return;
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/v1/auth/login', {
        phoneNumber: phone,
        password: password,
      });

      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !fullName || !pickupAddress || !password || loading) return;
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/v1/auth/signup', {
        phoneNumber: phone,
        fullName: fullName,
        pickupAddress: pickupAddress,
        addressType: addressType,
        password: password,
      });

      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      setStep('SUCCESS');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes checkmark { 0% { transform: scale(0.5) rotate(-45deg); } 50% { transform: scale(1.1); } 100% { transform: scale(1) rotate(0deg); } }
        .page {
          min-height: 100svh;
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(circle at top, rgba(21,101,192,0.12), transparent 28%), #F5F4F0;
          padding: 24px;
        }
        .card {
          width: 100%; max-width: 400px;
          background: #fff;
          border-radius: 22px;
          padding: 36px 30px 34px;
          box-shadow: 0 18px 55px rgba(15,23,42,0.12);
          animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
        }
        .brand-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
        }
        .brand-logo {
          width: 84px;
          height: 84px;
          display: grid;
          place-items: center;
          border-radius: 24px;
          background: linear-gradient(180deg, #EAF2FF 0%, #FFFFFF 100%);
          box-shadow: 0 12px 30px rgba(15,23,42,0.08);
          overflow: hidden;
        }
        .brand-name {
          font-size: 18px; font-weight: 900;
          color: #0D0D0D;
          letter-spacing: -0.4px;
        }
        .tagline {
          text-align: center;
          font-size: 13px; color: #9CA3AF;
          margin-bottom: 32px;
        }
        .divider {
          height: 1px; background: #EDECEA;
          margin-bottom: 28px;
        }
        label {
          display: block;
          font-size: 12px; font-weight: 600; color: #6B7280;
          text-transform: uppercase; letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .input-wrap { position: relative; margin-bottom: 16px; }
        .prefix {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 14px; font-weight: 500; color: #9CA3AF;
          pointer-events: none;
          border-right: 1px solid #E8E6E1; padding-right: 10px;
        }
        input[type=tel], input[type=text], input[type=password] {
          width: 100%; height: 48px;
          border: 1.5px solid #E8E6E1; border-radius: 10px;
          font-size: 15px; font-family: 'DM Sans', sans-serif;
          color: #0D0D0D; background: #FAFAF9;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          padding: 0 14px;
        }
        input[type=tel] { padding-left: 60px; }
        input::placeholder { color: #C4C1BA; }
        input:focus {
          border-color: #0D0D0D;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(13,13,13,0.06);
        }
        textarea {
          width: 100%; min-height: 80px;
          border: 1.5px solid #E8E6E1; border-radius: 10px;
          font-size: 15px; font-family: 'DM Sans', sans-serif;
          color: #0D0D0D; background: #FAFAF9;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          padding: 12px 14px;
          resize: none;
        }
        textarea:focus {
          border-color: #0D0D0D;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(13,13,13,0.06);
        }
        .radio-group {
          display: flex; gap: 16px; margin-bottom: 20px;
        }
        .radio-option {
          flex: 1;
          display: flex; align-items: center; gap: 8px;
          padding: 12px; border-radius: 10px;
          border: 1.5px solid #E8E6E1;
          cursor: pointer;
          transition: all 0.2s;
        }
        .radio-option input[type=radio] {
          cursor: pointer;
        }
        .radio-option:hover {
          border-color: #9CA3AF;
        }
        .radio-option input[type=radio]:checked + label {
          color: #0D0D0D;
          font-weight: 600;
        }
        .radio-option.selected {
          border-color: #0D0D0D;
          background: #F5F4F0;
        }
        .hint {
          font-size: 12px; color: #9CA3AF;
          margin-top: -8px; margin-bottom: 20px;
        }
        .btn {
          width: 100%; height: 48px;
          background: #0D0D0D; color: #fff;
          border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; letter-spacing: -0.1px;
          transition: opacity 0.18s, transform 0.18s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-secondary {
          background: #F5F4F0; color: #0D0D0D;
          border: 1.5px solid #E8E6E1;
        }
        .btn-secondary:hover:not(:disabled) {
          border-color: #0D0D0D;
        }
        .error {
          font-size: 13px; color: #B91C1C;
          background: #FEF2F2; border: 1px solid #FECACA;
          border-radius: 8px; padding: 10px 14px;
          margin-bottom: 14px;
          animation: fadeUp 0.3s ease;
        }
        .success-icon {
          width: 80px; height: 80px;
          background: #DCFCE7;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 20px auto;
          animation: checkmark 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .success-icon svg {
          width: 48px; height: 48px; color: #16A34A;
        }
        .success-text {
          text-align: center;
          font-size: 16px; font-weight: 600; color: #0D0D0D;
          margin-bottom: 8px;
        }
        .back-link {
          display: block; text-align: center;
          margin-top: 20px;
          font-size: 12px; color: #9CA3AF;
          cursor: pointer; background: none; border: none;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.18s;
        }
        .back-link:hover { color: #0D0D0D; }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        .mode-buttons {
          display: flex; flex-direction: column; gap: 12px;
        }
      `}} />

      <div className="page">
        <div className="card">
          <div className="brand-top">
            <div className="brand-logo">
              <Image src="/bglogo.png" alt="BG Laundry" width={68} height={68} priority />
            </div>
            <div className="brand-name">BG Laundry</div>
          </div>

          {/* MODE SELECT */}
          {step === 'MODE_SELECT' && (
            <>
              <div className="tagline">Welcome back</div>
              <div className="divider" />
              <div className="mode-buttons">
                <button
                  className="btn"
                  onClick={() => { setStep('LOGIN_PHONE'); setError(''); }}
                >
                  Sign In
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setStep('SIGNUP_PHONE'); setError(''); }}
                >
                  Create Account
                </button>
              </div>
            </>
          )}

          {/* LOGIN - PHONE */}
          {step === 'LOGIN_PHONE' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('LOGIN_PASSWORD'); }}>
              <div className="tagline">Sign In</div>
              <div className="divider" />
              {error && <div className="error">{error}</div>}
              <label>Phone Number</label>
              <div className="input-wrap">
                <span className="prefix">+234</span>
                <input
                  type="tel"
                  placeholder="801 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setStep('MODE_SELECT'); setPhone(''); setPassword(''); setError(''); }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={!phone || loading}
                >
                  {loading ? <span className="spinner" /> : 'Next'}
                </button>
              </div>
            </form>
          )}

          {/* LOGIN - PASSWORD */}
          {step === 'LOGIN_PASSWORD' && (
            <form onSubmit={handleLogin}>
              <div className="tagline">Enter Your Password</div>
              <div className="divider" />
              {error && <div className="error">{error}</div>}
              <label>Password</label>
              <div className="input-wrap">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setStep('LOGIN_PHONE'); setPassword(''); setError(''); }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={!password || loading}
                >
                  {loading ? <span className="spinner" /> : 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP - PHONE */}
          {step === 'SIGNUP_PHONE' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('SIGNUP_NAME'); }}>
              <div className="tagline">Create Account</div>
              <div className="divider" />
              {error && <div className="error">{error}</div>}
              <label>Phone Number</label>
              <div className="input-wrap">
                <span className="prefix">+234</span>
                <input
                  type="tel"
                  placeholder="801 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setStep('MODE_SELECT'); setPhone(''); setError(''); }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={!phone || loading}
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP - NAME */}
          {step === 'SIGNUP_NAME' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('SIGNUP_ADDRESS'); }}>
              <div className="tagline">Your Full Name</div>
              <div className="divider" />
              {error && <div className="error">{error}</div>}
              <label>Full Name</label>
              <div className="input-wrap">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setStep('SIGNUP_PHONE'); setError(''); }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={!fullName.trim() || loading}
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP - ADDRESS */}
          {step === 'SIGNUP_ADDRESS' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('SIGNUP_PASSWORD'); }}>
              <div className="tagline">Pickup Address</div>
              <div className="divider" />
              {error && <div className="error">{error}</div>}
              <label style={{ marginBottom: 12 }}>Address Type</label>
              <div className="radio-group">
                <label
                  className={`radio-option ${addressType === 'HOME' ? 'selected' : ''}`}
                  style={{ margin: 0 }}
                >
                  <input
                    type="radio"
                    name="addressType"
                    value="HOME"
                    checked={addressType === 'HOME'}
                    onChange={() => setAddressType('HOME')}
                  />
                  <span>Home</span>
                </label>
                <label
                  className={`radio-option ${addressType === 'OFFICE' ? 'selected' : ''}`}
                  style={{ margin: 0 }}
                >
                  <input
                    type="radio"
                    name="addressType"
                    value="OFFICE"
                    checked={addressType === 'OFFICE'}
                    onChange={() => setAddressType('OFFICE')}
                  />
                  <span>Office</span>
                </label>
              </div>
              <label>Address</label>
              <div className="input-wrap">
                <textarea
                  placeholder="Enter your full pickup address"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setStep('SIGNUP_NAME'); setError(''); }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={!pickupAddress.trim() || loading}
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP - PASSWORD */}
          {step === 'SIGNUP_PASSWORD' && (
            <form onSubmit={handleSignup}>
              <div className="tagline">Create Password</div>
              <div className="divider" />
              {error && <div className="error">{error}</div>}
              <label>Password</label>
              <div className="input-wrap">
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                />
              </div>
              <div className="hint">Password must be at least 6 characters</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setStep('SIGNUP_ADDRESS'); setError(''); }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={password.length < 6 || loading}
                >
                  {loading ? <span className="spinner" /> : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* SUCCESS */}
          {step === 'SUCCESS' && (
            <div style={{ textAlign: 'center', paddingTop: 20 }}>
              <div className="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="success-text">Account Created!</div>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
                Welcome to BG Laundry. Redirecting to dashboard...
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
