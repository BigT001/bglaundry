'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './admin-login.module.css';

type Mode = 'LOGIN' | 'RESET_REQUEST' | 'RESET_CONFIRM' | 'RESET_SUCCESS';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAdminLogin(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/v1/admin/auth/login', { email, password });
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid admin email or password.');
    } finally { setLoading(false); }
  }

  async function requestReset(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(''); setMessage('');
    try {
      const { data } = await axios.post('/api/v1/auth/password-reset/request', { identifier: email, accountType: 'ADMIN' });
      setMessage(data.developmentCode ? `${data.message} Development code: ${data.developmentCode}` : data.message);
      setMode('RESET_CONFIRM');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to send a reset code.');
    } finally { setLoading(false); }
  }

  async function confirmReset(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) { setError('The passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      await axios.post('/api/v1/auth/password-reset/confirm', { identifier: email, code, password, accountType: 'ADMIN' });
      setMode('RESET_SUCCESS'); setCode(''); setPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to change the admin password.');
    } finally { setLoading(false); }
  }

  return <main className={styles.page}><section className={styles.card}>
    <div className={styles.mark}>BG</div>
    <span className={styles.eyebrow}>Secure administration</span>
    <h1>{mode === 'LOGIN' ? 'Admin portal' : mode === 'RESET_SUCCESS' ? 'Password changed' : 'Recover access'}</h1>
    <p>{mode === 'LOGIN' ? 'Sign in to manage BG Laundry operations.' : mode === 'RESET_SUCCESS' ? 'Your new administrator password is ready.' : 'We’ll verify the phone number connected to your administrator profile.'}</p>
    {error && <div className={styles.error}>{error}</div>}
    {message && <div className={styles.success}>{message}</div>}

    {mode === 'LOGIN' && <form onSubmit={handleAdminLogin}>
      <label>Admin email<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" placeholder="admin@bglaundry.org" required /></label>
      <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter your password" required /></label>
      <button className={styles.primary} disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      <button type="button" className={styles.link} onClick={() => { setMode('RESET_REQUEST'); setPassword(''); setError(''); }}>Forgot admin password?</button>
    </form>}

    {mode === 'RESET_REQUEST' && <form onSubmit={requestReset}>
      <label>Admin email<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="admin@bglaundry.org" required autoFocus /></label>
      <button className={styles.primary} disabled={loading}>{loading ? 'Sending…' : 'Send verification code'}</button>
      <button type="button" className={styles.link} onClick={() => { setMode('LOGIN'); setError(''); }}>Back to sign in</button>
    </form>}

    {mode === 'RESET_CONFIRM' && <form onSubmit={confirmReset}>
      <label>Six-digit code<input className={styles.code} inputMode="numeric" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" required /></label>
      <label>New password<input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={8} required /></label>
      <label>Confirm password<input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Repeat your password" minLength={8} required /></label>
      <small>Use at least eight characters with one letter and one number.</small>
      <button className={styles.primary} disabled={loading || code.length !== 6}>{loading ? 'Changing…' : 'Change password'}</button>
      <button type="button" className={styles.link} onClick={() => { setMode('RESET_REQUEST'); setError(''); setMessage(''); }}>Request another code</button>
    </form>}

    {mode === 'RESET_SUCCESS' && <button className={styles.primary} onClick={() => { setMode('LOGIN'); setError(''); }}>Continue to sign in</button>}
  </section></main>;
}
