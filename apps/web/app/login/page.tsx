'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { auth } from '../../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { ArrowRight, ArrowLeft, Shirt, CheckCircle2, Loader2 } from 'lucide-react';

type LoginStep = 'PHONE' | 'OTP' | 'ONBOARDING';

/* ─── OTP digit boxes ─── */
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const next = digits.map((d, idx) => idx === i ? '' : d).join('');
      onChange(next);
      if (i > 0) inputs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = digits.map((d, idx) => idx === i ? char : d).join('');
    onChange(next);
    if (char && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
    e.preventDefault();
  };

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: '46px', height: '56px',
            textAlign: 'center', fontSize: '22px', fontWeight: '700',
            fontFamily: "'DM Sans', sans-serif",
            border: digits[i] ? '2px solid #0D0D0D' : '1.5px solid #D6D3CD',
            borderRadius: '12px',
            background: digits[i] ? '#F7F6F3' : '#fff',
            color: '#0D0D0D', outline: 'none',
            transition: 'border-color 0.2s, background 0.2s',
            caretColor: 'transparent',
          }}
          onFocus={e => e.target.style.borderColor = '#0D0D0D'}
          onBlur={e => e.target.style.borderColor = digits[i] ? '#0D0D0D' : '#D6D3CD'}
        />
      ))}
    </div>
  );
}

/* ─── Main Page ─── */
export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [tempToken, setTempToken] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let verifier: RecaptchaVerifier | null = null;
    if (typeof window !== 'undefined') {
      try {
        const container = document.getElementById('recaptcha-container');
        if (container) container.innerHTML = '';
        verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
        });
        setRecaptchaVerifier(verifier);
      } catch (err) {
        console.error('[reCAPTCHA]', err);
      }
    }
    return () => { if (verifier) { try { verifier.clear(); } catch (_) {} } };
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || loading) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+234${phoneNumber.replace(/^0+/, '')}`;
      if (!recaptchaVerifier) throw new Error('Security check not ready. Please refresh.');
      const confirmation = await signInWithPhoneNumber(auth, formatted, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('OTP');
      setSuccess(`Code sent to ${formatted}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send code. Please try again.');
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        const v = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
        setRecaptchaVerifier(v);
      }
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || !confirmationResult || loading) return;
    setLoading(true); setError('');
    try {
      const credential = await confirmationResult.confirm(otp);
      const idToken = await credential.user.getIdToken();
      const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+234${phoneNumber.replace(/^0+/, '')}`;
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
      setError(err.response?.data?.error || err.message || 'Invalid code. Please check and retry.');
    } finally { setLoading(false); }
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !tempToken || !tempUser || loading) return;
    setLoading(true); setError('');
    try {
      const { data } = await axios.put(
        `/api/v1/users/${tempUser.id}`,
        { fullName: fullName.trim() },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );
      localStorage.setItem('customerToken', tempToken);
      localStorage.setItem('customerUser', JSON.stringify(data));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not save your name. Please try again.');
    } finally { setLoading(false); }
  };

  const stepIndex = step === 'PHONE' ? 0 : step === 'OTP' ? 1 : 2;

  return (
    <div style={{ minHeight: '100svh', display: 'flex', background: '#FAF9F7' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes orb1     { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-18px)} }
        @keyframes orb2     { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-16px,22px)} }
        @keyframes orb3     { 0%,100%{transform:translate(0,0)} 50%{transform:translate(22px,14px)} }
        @keyframes progress { from{width:0} to{width:var(--w)} }

        .step-in  { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .field-input {
          width: 100%; padding: 14px 16px;
          font-size: 15px; font-weight: 400;
          font-family: 'DM Sans', sans-serif;
          color: #0D0D0D; background: #fff;
          border: 1.5px solid #D6D3CD; border-radius: 12px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input::placeholder { color: #B0ADA8; }
        .field-input:focus {
          border-color: #0D0D0D;
          box-shadow: 0 0 0 3px rgba(13,13,13,0.06);
        }
        .btn-submit {
          width: 100%; padding: 15px;
          background: #0D0D0D; color: #FAF9F7;
          border: none; border-radius: 12px;
          font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s, transform 0.2s, opacity 0.2s;
          letter-spacing: -0.1px;
        }
        .btn-submit:hover:not(:disabled) { background: #1a1a1a; transform: translateY(-1px); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-back {
          background: none; border: none; cursor: pointer;
          color: #9CA3AF; font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0; transition: color 0.2s;
        }
        .btn-back:hover { color: #0D0D0D; }

        /* Mobile */
        @media (max-width: 820px) {
          .brand-panel { display: none !important; }
          .form-panel  { padding: 48px 28px !important; justify-content: flex-start !important; padding-top: 80px !important; }
        }
      `}} />

      {/* Hidden reCAPTCHA */}
      <div id="recaptcha-container" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />

      {/* ═════════════════════════════
          LEFT — Brand Panel
      ═════════════════════════════ */}
      <div className="brand-panel" style={{
        flex: '0 0 46%', maxWidth: '520px',
        background: '#0D0D0D', position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px', overflow: 'hidden',
      }}>
        {/* Animated orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,85,255,0.18) 0%, transparent 70%)', top: '-60px', left: '-80px', animation: 'orb1 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', bottom: '80px', right: '-60px', animation: 'orb2 18s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)', bottom: '200px', left: '40px', animation: 'orb3 22s ease-in-out infinite' }} />
        </div>

        {/* Top — logo */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#FAF9F7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shirt size={16} color="#0D0D0D" />
            </div>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#FAF9F7', fontFamily: "'DM Sans', sans-serif" }}>BG Laundry</span>
          </div>
        </div>

        {/* Middle — headline */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(40px, 4vw, 56px)',
            fontWeight: '700',
            lineHeight: '1.05',
            letterSpacing: '-1.5px',
            color: '#FAF9F7',
            marginBottom: '24px',
          }}>
            Your clothes.<br /><em style={{ color: '#94A3B8' }}>Handled with care.</em>
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.7', maxWidth: '340px', fontFamily: "'DM Sans', sans-serif", fontWeight: '300' }}>
            Sign in to book pickups, track active orders and manage your laundry from anywhere in Lagos.
          </p>

          {/* Trust items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '40px' }}>
            {[
              'Free door-to-door pickup & delivery',
              'Live order tracking on your dashboard',
              'Express 12-hour turnaround available',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={11} color="#10B981" />
                </div>
                <span style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — decorative grid lines */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        {/* Bottom — tagline */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '24px' }} />
          <p style={{ fontSize: '12px', color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
            © 2026 BG Laundry & Dry Cleaning · Lagos, Nigeria
          </p>
        </div>
      </div>

      {/* ═════════════════════════════
          RIGHT — Form Panel
      ═════════════════════════════ */}
      <div className="form-panel" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '60px 48px', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Mobile-only logo */}
          <div style={{ display: 'none', marginBottom: '40px' }} className="mobile-logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: '#0D0D0D', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shirt size={16} color="#FAF9F7" />
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#0D0D0D', fontFamily: "'DM Sans', sans-serif" }}>BG Laundry</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  flex: 1, height: '3px', borderRadius: '100px',
                  background: i <= stepIndex ? '#0D0D0D' : '#E8E6E1',
                  transition: 'background 0.4s ease',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif" }}>
                  {step === 'PHONE' ? 'Step 1 of 3' : step === 'OTP' ? 'Step 2 of 3' : 'Step 3 of 3'}
                </p>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '32px', fontWeight: '700',
                  letterSpacing: '-0.8px', color: '#0D0D0D', lineHeight: 1.1,
                }}>
                  {step === 'PHONE' && 'Enter your number'}
                  {step === 'OTP' && 'Check your messages'}
                  {step === 'ONBOARDING' && 'What should we call you?'}
                </h2>
              </div>
              {step !== 'PHONE' && (
                <button className="btn-back" onClick={() => setStep(step === 'OTP' ? 'PHONE' : 'OTP')}>
                  <ArrowLeft size={13} /> Back
                </button>
              )}
            </div>
          </div>

          {/* Error / Success banners */}
          {error && (
            <div key={error} style={{
              padding: '12px 16px', background: '#FEF2F2',
              border: '1px solid #FECACA', borderRadius: '10px',
              color: '#B91C1C', fontSize: '13px', marginBottom: '20px',
              animation: 'fadeUp 0.3s ease', fontFamily: "'DM Sans', sans-serif",
            }}>
              {error}
            </div>
          )}
          {success && (
            <div key={success} style={{
              padding: '12px 16px', background: '#F0FDF4',
              border: '1px solid #BBF7D0', borderRadius: '10px',
              color: '#166534', fontSize: '13px', marginBottom: '20px',
              animation: 'fadeUp 0.3s ease', fontFamily: "'DM Sans', sans-serif",
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <CheckCircle2 size={14} /> {success}
            </div>
          )}

          {/* ── Step 1: Phone ── */}
          {step === 'PHONE' && (
            <form key="phone" className="step-in" onSubmit={handleRequestOtp}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif" }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '14px', fontWeight: '600', color: '#6B7280',
                    fontFamily: "'DM Sans', sans-serif", pointerEvents: 'none',
                    borderRight: '1px solid #D6D3CD', paddingRight: '12px',
                  }}>+234</div>
                  <input
                    className="field-input"
                    type="tel"
                    value={phoneNumber.replace(/^(\+234|0)/, '')}
                    onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="8158928839"
                    style={{ paddingLeft: '72px' }}
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <p style={{ fontSize: '12px', color: '#B0ADA8', marginTop: '8px', fontFamily: "'DM Sans', sans-serif" }}>
                  We'll send a 6-digit verification code to this number.
                </p>
              </div>
              <button className="btn-submit" type="submit" disabled={loading || phoneNumber.replace(/\D/g, '').length < 10}>
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Sending code...</>
                  : <>Send Verification Code <ArrowRight size={16} /></>}
              </button>
              <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '12px', color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                By continuing, you agree to our{' '}
                <span style={{ color: '#0D0D0D', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>
              </p>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'OTP' && (
            <form key="otp" className="step-in" onSubmit={handleVerifyOtp}>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.6' }}>
                Enter the 6-digit code sent to{' '}
                <strong style={{ color: '#0D0D0D' }}>+234{phoneNumber.replace(/^(\+234|0)/, '')}</strong>
              </p>
              <div style={{ marginBottom: '28px' }}>
                <OtpInput value={otp} onChange={setOtp} />
              </div>
              <button className="btn-submit" type="submit" disabled={loading || otp.length < 6}>
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Verifying...</>
                  : <>Verify Code <ArrowRight size={16} /></>}
              </button>
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', fontSize: '13px', color: '#9CA3AF', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif' " }}
                  onClick={() => { setOtp(''); setStep('PHONE'); }}
                >
                  Didn't receive a code? Try again
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Onboarding ── */}
          {step === 'ONBOARDING' && (
            <form key="onboard" className="step-in" onSubmit={handleOnboarding}>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.6' }}>
                Just your name — so we can address your orders properly.
              </p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'DM Sans', sans-serif" }}>
                  Full Name
                </label>
                <input
                  className="field-input"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Samuel Adeyemi"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              <button className="btn-submit" type="submit" disabled={loading || !fullName.trim()}>
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Setting up your account...</>
                  : <>Complete Setup <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* Back to homepage */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <button
              onClick={() => router.push('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#B0ADA8', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '5px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0D0D0D')}
              onMouseLeave={e => (e.currentTarget.style.color = '#B0ADA8')}
            >
              <ArrowLeft size={12} /> Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
