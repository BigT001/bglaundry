'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { auth } from '../../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

type Step = 'PHONE' | 'OTP' | 'ONBOARDING';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [verifier, setVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [tempToken, setTempToken] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let v: RecaptchaVerifier | null = null;

    // Small delay ensures the DOM element is mounted before reCAPTCHA binds
    const timer = setTimeout(() => {
      try {
        const container = document.getElementById('recaptcha-container');
        if (!container) return;
        container.innerHTML = '';                 // clear any stale widget
        v = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {
            // silently reset on expiry so the next attempt gets a fresh token
            setVerifier(null);
          },
        });
        // Render eagerly so the token is ready before the user submits
        v.render().then(() => setVerifier(v)).catch(() => {});
      } catch (e) {
        console.warn('[reCAPTCHA init]', e);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      try { v?.clear(); } catch (_) {}
    };
  }, []);

  const formatted = phone.startsWith('+') ? phone : `+234${phone.replace(/^0+/, '')}`;

  const resetVerifier = () => {
    try {
      verifier?.clear();
      const c = document.getElementById('recaptcha-container');
      if (c) c.innerHTML = '';
      const v2 = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible', callback: () => {} });
      v2.render().then(() => setVerifier(v2)).catch(() => {});
    } catch (_) {}
  };

  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || loading) return;
    setLoading(true); setError(''); setInfo('');
    try {
      // Re-build verifier if it expired between page load and submit
      let v = verifier;
      if (!v) {
        const c = document.getElementById('recaptcha-container');
        if (c) c.innerHTML = '';
        v = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
        await v.render();
        setVerifier(v);
      }
      const result = await signInWithPhoneNumber(auth, formatted, v);
      setConfirmation(result);
      setInfo(`Code sent to ${formatted}`);
      setStep('OTP');
    } catch (err: any) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('invalid-app-credential') || msg.includes('recaptcha')) {
        setError('Security check failed. Please click Continue again to retry.');
      } else {
        setError(err.message || 'Could not send code. Please try again.');
      }
      resetVerifier();
    } finally { setLoading(false); }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || !confirmation || loading) return;
    setLoading(true); setError('');
    try {
      const credential = await confirmation.confirm(otp);
      const idToken = await credential.user.getIdToken();
      const { data } = await axios.post('/api/v1/auth/verify-otp', { phoneNumber: formatted, idToken });
      const { token, user } = data;
      if (!user.fullName || user.fullName === 'Customer Account') {
        setTempToken(token); setTempUser(user); setStep('ONBOARDING');
      } else {
        localStorage.setItem('customerToken', token);
        localStorage.setItem('customerUser', JSON.stringify(user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Invalid code. Please try again.');
    } finally { setLoading(false); }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || loading) return;
    setLoading(true); setError('');
    try {
      const { data } = await axios.patch(
        '/api/v1/users/profile',
        { fullName: fullName.trim() },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );
      localStorage.setItem('customerToken', tempToken);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
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
        .page {
          min-height: 100svh;
          display: flex; align-items: center; justify-content: center;
          background: #F5F4F0;
          padding: 24px;
        }
        .card {
          width: 100%; max-width: 380px;
          background: #fff;
          border-radius: 16px;
          padding: 40px 36px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05);
          animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
        }
        .logo {
          text-align: center;
          font-size: 15px; font-weight: 600; color: #0D0D0D;
          letter-spacing: -0.2px;
          margin-bottom: 6px;
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
        input[type=tel], input[type=text] {
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
        .otp-input {
          text-align: center;
          letter-spacing: 14px;
          font-size: 20px; font-weight: 600;
          padding: 0 14px !important;
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
        .error {
          font-size: 13px; color: #B91C1C;
          background: #FEF2F2; border: 1px solid #FECACA;
          border-radius: 8px; padding: 10px 14px;
          margin-bottom: 14px;
          animation: fadeUp 0.3s ease;
        }
        .info {
          font-size: 13px; color: #166534;
          background: #F0FDF4; border: 1px solid #BBF7D0;
          border-radius: 8px; padding: 10px 14px;
          margin-bottom: 14px;
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
      `}} />

      <div id="recaptcha-container" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />

      <div className="page">
        <div className="card">
          <div className="logo">BG Laundry</div>
          <div className="tagline">
            {step === 'PHONE' && 'Enter your phone number to continue'}
            {step === 'OTP' && `Code sent to ${formatted}`}
            {step === 'ONBOARDING' && "One last thing — what's your name?"}
          </div>
          <div className="divider" />

          {error && <div className="error">{error}</div>}
          {info && !error && <div className="info">{info}</div>}

          {/* Phone */}
          {step === 'PHONE' && (
            <form onSubmit={handlePhone}>
              <label>Phone Number</label>
              <div className="input-wrap">
                <span className="prefix">+234</span>
                <input
                  type="tel"
                  value={phone.replace(/^(\+234|0)/, '')}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="08012345678"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
              <button className="btn" type="submit" disabled={loading || phone.replace(/\D/g, '').length < 10}>
                {loading ? <><div className="spinner" /> Sending...</> : 'Continue'}
              </button>
            </form>
          )}

          {/* OTP */}
          {step === 'OTP' && (
            <form onSubmit={handleOtp}>
              <label>6-Digit Code</label>
              <div className="input-wrap">
                <input
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="——————"
                  maxLength={6}
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
              <button className="btn" type="submit" disabled={loading || otp.length < 6}>
                {loading ? <><div className="spinner" /> Verifying...</> : 'Verify'}
              </button>
              <button type="button" className="back-link" onClick={() => { setStep('PHONE'); setOtp(''); setError(''); setInfo(''); }}>
                Change number
              </button>
            </form>
          )}

          {/* Onboarding */}
          {step === 'ONBOARDING' && (
            <form onSubmit={handleOnboard}>
              <label>Full Name</label>
              <div className="input-wrap">
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Samuel Adeyemi"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
              <button className="btn" type="submit" disabled={loading || !fullName.trim()}>
                {loading ? <><div className="spinner" /> Setting up...</> : 'Get Started'}
              </button>
            </form>
          )}

          <button className="back-link" onClick={() => router.push('/')}>
            ← Back to home
          </button>
        </div>
      </div>
    </>
  );
}
