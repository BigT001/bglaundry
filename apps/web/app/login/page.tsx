'use client';
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type Step = 'LOGIN_PHONE' | 'LOGIN_PASSWORD' | 'RESET_REQUEST' | 'RESET_CONFIRM' | 'RESET_SUCCESS' | 'SIGNUP_PHONE' | 'SIGNUP_NAME' | 'SIGNUP_ADDRESS' | 'SIGNUP_PASSWORD' | 'SUCCESS';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('LOGIN_PHONE');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [addressType, setAddressType] = useState<'HOME' | 'OFFICE'>('HOME');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const codeInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const selectedAddress = addressType === 'HOME' ? homeAddress : officeAddress;
  const setSelectedAddress = addressType === 'HOME' ? setHomeAddress : setOfficeAddress;

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
    if (!phone || !email || !fullName || !selectedAddress.trim() || !password || loading) return;
    setLoading(true);
    setError('');

    try {
      const selectedAddress = addressType === 'HOME' ? homeAddress : officeAddress;
      const { data } = await axios.post('/api/v1/auth/signup', {
        phoneNumber: phone,
        email,
        fullName: fullName,
        pickupAddress: selectedAddress,
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

  const requestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setRecoveryMessage('');
    try {
      const { data } = await axios.post('/api/v1/auth/password-reset/request', {
        identifier: recoveryIdentifier.trim(), accountType: 'CUSTOMER',
      });
      setRecoveryMessage(data.developmentCode ? `${data.message} Development code: ${data.developmentCode}` : data.message);
      setStep('RESET_CONFIRM');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to send a reset code.');
    } finally { setLoading(false); }
  };

  const confirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode.length !== 6) { setError('Enter the complete six-digit verification code.'); return; }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) { setError('Use at least eight characters with one letter and one number.'); return; }
    if (password !== confirmPassword) { setError('The passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      await axios.post('/api/v1/auth/password-reset/confirm', {
        identifier: recoveryIdentifier.trim(), code: resetCode, password, accountType: 'CUSTOMER',
      });
      setStep('RESET_SUCCESS'); setPassword(''); setConfirmPassword(''); setResetCode('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to change your password.');
    } finally { setLoading(false); }
  };

  const selectFlow = (flow: 'LOGIN' | 'SIGNUP' | 'RESET') => {
    setError('');
    setRecoveryMessage('');
    setPassword('');
    setConfirmPassword('');
    setResetCode('');
    if (flow === 'LOGIN') setStep('LOGIN_PHONE');
    if (flow === 'SIGNUP') setStep('SIGNUP_PHONE');
    if (flow === 'RESET') {
      setRecoveryIdentifier(phone);
      setStep('RESET_REQUEST');
    }
  };

  const setCodeDigit = (index: number, value: string) => {
    if (value.replace(/\D/g, '').length > 1) {
      pasteCode(value);
      return;
    }
    const digit = value.replace(/\D/g, '').slice(-1);
    const digits = resetCode.padEnd(6, ' ').split('');
    digits[index] = digit || ' ';
    setResetCode(digits.join('').replace(/\s/g, '').slice(0, 6));
    setError('');
    if (digit && index < 5) codeInputRefs.current[index + 1]?.focus();
  };

  const pasteCode = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    setResetCode(digits);
    codeInputRefs.current[Math.min(digits.length, 5)]?.focus();
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
        input[type=tel], input[type=text], input[type=email], input[type=password] {
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
        .forgot-link { width: 100%; border: 0; background: none; color: #2858A7; font: 600 13px 'DM Sans'; text-align: right; cursor: pointer; margin-top: -4px; }
        .recovery-message { font-size: 12px; line-height: 1.5; color: #215F46; background: #ECFDF5; border: 1px solid #BBF7D0; border-radius: 8px; padding: 10px 12px; margin-bottom: 14px; }
        .code-group { display:grid; grid-template-columns:repeat(6,1fr); gap:7px; margin-bottom:18px; }
        .code-box { width:100% !important; height:52px !important; padding:0 !important; border:1.5px solid #DDE3EB !important; border-radius:11px !important; background:#F9FAFB !important; text-align:center; font:800 20px 'DM Sans',sans-serif !important; color:#173F83 !important; caret-color:#173F83; }
        .code-box:focus { border-color:#1565C0 !important; background:#fff !important; box-shadow:0 0 0 3px rgba(21,101,192,.12) !important; }
        .form-heading { text-align:center; font-size:24px; line-height:1.15; font-weight:800; letter-spacing:-.7px; color:#111827; margin-bottom:8px; }
        .form-copy { text-align:center; font-size:13px; line-height:1.5; color:#6B7280; margin-bottom:24px; }
        .button-row { display:flex; gap:10px; margin-top:20px; }
        .button-row .btn-secondary { flex:0 0 38%; }
        .security-note { display:flex; align-items:flex-start; gap:8px; padding:11px 12px; border-radius:10px; background:#F3F7FC; color:#526077; font-size:11px; line-height:1.45; margin-bottom:18px; }
        .auth-switch { display:flex; align-items:center; justify-content:center; gap:5px; margin-top:20px; color:#7B8494; font-size:12px; }
        .auth-switch button { border:0; padding:3px; background:none; color:#2858A7; font:700 12px 'DM Sans',sans-serif; cursor:pointer; }
        .auth-switch button:hover { text-decoration:underline; }
        @media (max-width: 600px) {
          html, body { min-height:100%; height:auto; }
          .page { min-height:100dvh; align-items:flex-start; padding:20px 14px 32px; background:linear-gradient(180deg,#EDF4FC 0,#F7F6F2 42%,#F7F6F2 100%); }
          .card { max-width:440px; border-radius:24px; padding:24px 20px 26px; box-shadow:0 16px 45px rgba(15,23,42,.10); border:1px solid rgba(255,255,255,.8); }
          .brand-top { gap:10px; margin-bottom:10px; }
          .brand-logo { width:68px; height:68px; border-radius:20px; }
          .brand-logo img { width:58px; height:58px; object-fit:contain; }
          .brand-name { font-size:20px; }
          .tagline { font-size:13px; margin-bottom:22px; }
          .divider { margin-bottom:22px; }
          label { font-size:11px; letter-spacing:1.2px; }
          input[type=tel], input[type=text], input[type=email], input[type=password] { height:54px; border-radius:13px; font-size:16px; }
          textarea { min-height:100px; border-radius:13px; font-size:16px; }
          .btn { height:52px; border-radius:13px; font-size:15px; }
          .form-heading { font-size:22px; }
          .code-group { gap:5px; }
          .code-box { height:50px !important; border-radius:10px !important; font-size:19px !important; }
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

          {/* LOGIN - PHONE */}
          {step === 'LOGIN_PHONE' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('LOGIN_PASSWORD'); }}>
              <h1 className="form-heading">Welcome back</h1>
              <p className="form-copy">Enter the phone number connected to your BG Laundry account.</p>
              <div className="divider" />
              {error && <div className="error">{error}</div>}
              <label>Phone Number</label>
              <div className="input-wrap">
                <span className="prefix">+234</span>
                <input
                  type="tel"
                  placeholder="801 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  required
                />
              </div>
              <button type="button" className="forgot-link" onClick={() => { setRecoveryIdentifier(phone); setStep('RESET_REQUEST'); setPassword(''); setError(''); }}>Forgot password?</button>
              <div className="button-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.push('/')}
                >
                  Home
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={!phone || loading}
                >
                  {loading ? <span className="spinner" /> : 'Next'}
                </button>
              </div>
              <div className="auth-switch"><span>New to BG Laundry?</span><button type="button" onClick={() => selectFlow('SIGNUP')}>Create an account</button></div>
            </form>
          )}

          {step === 'RESET_REQUEST' && (
            <form onSubmit={requestPasswordReset} noValidate>
              <h1 className="form-heading">Reset your password</h1>
              <p className="form-copy">Use your account email for the most reliable delivery, or enter your phone number for SMS.</p>
              <div className="divider" />
              {error && <div className="error">{error}</div>}
              <label>Phone number or email</label>
              <div className="input-wrap">
                <input type="text" inputMode="email" autoComplete="username" placeholder="you@example.com or 0801 234 5678" value={recoveryIdentifier} onChange={(e) => setRecoveryIdentifier(e.target.value)} required autoFocus />
              </div>
              <div className="security-note"><span>✦</span><span>We’ll send a six-digit code to the email saved on your account and by SMS when available. Check Spam or Promotions if it does not appear in your inbox.</span></div>
              <div className="button-row">
                <button type="button" className="btn btn-secondary" onClick={() => selectFlow('LOGIN')}>Back</button>
                <button type="submit" className="btn" disabled={!recoveryIdentifier.trim() || loading}>{loading ? <span className="spinner" /> : 'Send Code'}</button>
              </div>
            </form>
          )}

          {step === 'RESET_CONFIRM' && (
            <form onSubmit={confirmPasswordReset} noValidate>
              <h1 className="form-heading">Check your messages</h1>
              <p className="form-copy">Enter the six-digit BG Laundry recovery code and choose a secure password.</p>
              <div className="divider" />
              {recoveryMessage && <div className="recovery-message">{recoveryMessage}</div>}
              {error && <div className="error">{error}</div>}
              <label>Verification Code</label>
              <div className="code-group" onPaste={(event) => { event.preventDefault(); pasteCode(event.clipboardData.getData('text')); }}>
                {Array.from({ length: 6 }, (_, index) => (
                  <input
                    key={index}
                    ref={(element) => { codeInputRefs.current[index] = element; }}
                    className="code-box"
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Verification code digit ${index + 1}`}
                    value={resetCode[index] || ''}
                    onChange={(event) => setCodeDigit(index, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Backspace' && !resetCode[index] && index > 0) codeInputRefs.current[index - 1]?.focus();
                      if (event.key === 'ArrowLeft' && index > 0) codeInputRefs.current[index - 1]?.focus();
                      if (event.key === 'ArrowRight' && index < 5) codeInputRefs.current[index + 1]?.focus();
                    }}
                  />
                ))}
              </div>
              <label>New Password</label>
              <div className="input-wrap"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} /></div>
              <label>Confirm Password</label>
              <div className="input-wrap"><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" required minLength={8} /></div>
              <p className="hint">Use at least eight characters with one letter and one number.</p>
              <button className="btn" disabled={resetCode.length !== 6 || password.length < 8 || !confirmPassword || loading}>{loading ? <span className="spinner" /> : 'Change Password'}</button>
              <button type="button" className="back-link" onClick={() => { setStep('RESET_REQUEST'); setError(''); }}>Request another code</button>
            </form>
          )}

          {step === 'RESET_SUCCESS' && (
            <div style={{ textAlign: 'center', paddingTop: 20 }}>
              <div className="success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></div>
              <div className="success-text">Password changed</div>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Your new password is ready to use.</p>
              <button className="btn" onClick={() => { setStep('LOGIN_PHONE'); setError(''); }}>Continue to Sign In</button>
            </div>
          )}

          {/* LOGIN - PASSWORD */}
          {step === 'LOGIN_PASSWORD' && (
            <form onSubmit={handleLogin}>
              <h1 className="form-heading">Enter your password</h1>
              <p className="form-copy">Signing in as {phone || 'your BG Laundry account'}.</p>
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
                  autoComplete="current-password"
                />
              </div>
              <button type="button" className="forgot-link" onClick={() => { setRecoveryIdentifier(phone); setStep('RESET_REQUEST'); setPassword(''); setError(''); }}>Forgot password?</button>
              <div className="button-row">
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
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => selectFlow('LOGIN')}
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
              <div className="auth-switch"><span>Already have an account?</span><button type="button" onClick={() => selectFlow('LOGIN')}>Sign in</button></div>
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
                  placeholder="Blessed Samuel"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <label>Email Address</label>
              <div className="input-wrap">
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trimStart())}
                  required
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
                  disabled={!fullName.trim() || !email.trim() || loading}
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
                  placeholder={addressType === 'HOME' ? 'Enter your home pickup address' : 'Enter your office pickup address'}
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
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
                  disabled={!selectedAddress.trim() || loading}
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
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  autoFocus
                />
              </div>
              <div className="hint">Use at least eight characters with one letter and one number.</div>
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
                  disabled={password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password) || loading}
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
