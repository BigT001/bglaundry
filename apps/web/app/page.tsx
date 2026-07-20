'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { ArrowRight, Check, X } from '@/lib/icons';

type View = 'home' | 'services' | 'pricing' | 'how-it-works';

interface ServiceItem {
  name: string;
  category: 'Clothing' | 'Household' | 'Additional';
  washPrice: number;
  ironPrice: number;
  washIronPrice: number;
  hasWash: boolean;
  hasIron: boolean;
  hasWashIron: boolean;
}

const fallbackServices: ServiceItem[] = [
  // Clothing
  { name: 'T-Shirt / Polo', category: 'Clothing', washPrice: 500, ironPrice: 300, washIronPrice: 700, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Dress Shirt', category: 'Clothing', washPrice: 700, ironPrice: 400, washIronPrice: 1000, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Trouser', category: 'Clothing', washPrice: 500, ironPrice: 300, washIronPrice: 700, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Jeans', category: 'Clothing', washPrice: 700, ironPrice: 400, washIronPrice: 1000, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Shorts', category: 'Clothing', washPrice: 300, ironPrice: 200, washIronPrice: 500, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Casual/Formal Shirt', category: 'Clothing', washPrice: 500, ironPrice: 300, washIronPrice: 800, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Blouse', category: 'Clothing', washPrice: 500, ironPrice: 300, washIronPrice: 800, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Dress', category: 'Clothing', washPrice: 1300, ironPrice: 700, washIronPrice: 2000, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Two-Piece Suit', category: 'Clothing', washPrice: 2500, ironPrice: 1200, washIronPrice: 3500, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Blazer', category: 'Clothing', washPrice: 1000, ironPrice: 600, washIronPrice: 1500, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Senator Wear (2 pcs)', category: 'Clothing', washPrice: 1000, ironPrice: 500, washIronPrice: 1500, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Agbada (Complete Set)', category: 'Clothing', washPrice: 2500, ironPrice: 1200, washIronPrice: 3500, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Kaftan', category: 'Clothing', washPrice: 1300, ironPrice: 700, washIronPrice: 2000, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Jacket', category: 'Clothing', washPrice: 1000, ironPrice: 600, washIronPrice: 1500, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Tie', category: 'Clothing', washPrice: 0, ironPrice: 300, washIronPrice: 300, hasWash: false, hasIron: true, hasWashIron: true },

  // Household
  { name: 'Bed Sheet', category: 'Household', washPrice: 1000, ironPrice: 0, washIronPrice: 1500, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Duvet (Small)', category: 'Household', washPrice: 2500, ironPrice: 0, washIronPrice: 3000, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Duvet (Medium)', category: 'Household', washPrice: 3500, ironPrice: 0, washIronPrice: 4000, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Duvet (Large/King)', category: 'Household', washPrice: 3500, ironPrice: 0, washIronPrice: 4000, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Blanket', category: 'Household', washPrice: 3000, ironPrice: 0, washIronPrice: 3500, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Pillow', category: 'Household', washPrice: 600, ironPrice: 0, washIronPrice: 800, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Curtain (Per Panel)', category: 'Household', washPrice: 1500, ironPrice: 0, washIronPrice: 2000, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Bath Towel', category: 'Household', washPrice: 600, ironPrice: 0, washIronPrice: 800, hasWash: true, hasIron: false, hasWashIron: true },

  // Additional
  { name: 'Stain Removal', category: 'Additional', washPrice: 1000, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Spot Cleaning', category: 'Additional', washPrice: 500, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Fabric Softener Treatment', category: 'Additional', washPrice: 200, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Premium Fragrance Finish', category: 'Additional', washPrice: 200, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Folding Only', category: 'Additional', washPrice: 200, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Shoe Cleaning', category: 'Additional', washPrice: 4000, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Bag Cleaning', category: 'Additional', washPrice: 4000, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Wedding Gown Care', category: 'Additional', washPrice: 15000, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
];

const services = [
  { icon: '👕', title: 'Wash & Fold',      desc: 'Professional washing & folding. From ₦300 (Shorts) to ₦2,500 (Agbada).',  color: '#EFF6FF' },
  { icon: '🥼', title: 'Dry Cleaning',     desc: 'Delicate care for Agbadas, Senator wear, suits & gowns. From ₦1,000 to ₦3,500.', color: '#F0FDF4' },
  { icon: '👔', title: 'Iron & Press',     desc: 'Steam pressing for shirts, trousers & blazers. Flat rate from ₦200 to ₦1,200.', color: '#FFF7ED' },
  { icon: '👟', title: 'Shoe & Bag Care',  desc: 'Deep cleaning, stain removal & restoration for premium shoes & bags. From ₦4,000.', color: '#FDF4FF' },
  { icon: '🛏️', title: 'Household Items',  desc: 'Washing duvets, blankets, pillows, sheets, and curtains. From ₦600.', color: '#F0FDF4' },
  { icon: '✨', title: 'Specialty Add-ons', desc: 'Stain removal (from ₦1,000), fabric softener (₦200), fragrance (₦200).', color: '#FFF1F2' },
];

const steps = [
  { step: '01', title: 'Schedule',    desc: 'Choose your service and select a convenient pickup time.',         color: '#EEF2FF', accent: '#6366F1', icon: '📅' },
  { step: '02', title: 'We Collect', desc: 'Our driver arrives on time and handles your clothes with care.',   color: '#F0FDF4', accent: '#16A34A', icon: '🚚' },
  { step: '03', title: 'We Clean',   desc: 'Items cleaned with premium products in our expert facility.',     color: '#EFF6FF', accent: '#0066FF', icon: '✨' },
  { step: '04', title: 'Delivered',  desc: 'Fresh, pressed clothes returned straight to your door.',          color: '#FFF7ED', accent: '#EA580C', icon: '📦' },
];

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<View>('home');
  const [animating, setAnimating] = useState(false);
  const [displayedView, setDisplayedView] = useState<View>('home');
  const [dbServices, setDbServices] = useState<ServiceItem[]>(fallbackServices);
  const [pricingCategory, setPricingCategory] = useState<'Clothing' | 'Household' | 'Additional'>('Clothing');

  // Login Modal & Firebase verification states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState<'PHONE' | 'OTP' | 'ONBOARDING'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginInfo, setLoginInfo] = useState('');
  const [verifier, setVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmation, setConfirmation] = useState<any>(null);
  const [tempToken, setTempToken] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('customerToken'));
    // Fetch live service catalog from database
    fetch('/api/v1/admin/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.services && data.services.length > 0) {
          setDbServices(data.services);
        }
      })
      .catch((err) => console.error('Failed to load services:', err));
  }, []);

  // Initialize reCAPTCHA on modal show
  useEffect(() => {
    if (!showLoginModal) return;
    
    setTimeout(() => {
      try {
        const container = document.getElementById('recaptcha-container');
        if (!container) return;
        container.innerHTML = '';
        const v = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {
            setVerifier(null);
          }
        });
        v.render().then(() => setVerifier(v)).catch(() => {});
      } catch (e) {
        console.error('[reCAPTCHA init error]', e);
      }
    }, 100);
  }, [showLoginModal]);

  const switchView = useCallback((view: View) => {
    if (view === activeView || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setDisplayedView(view);
      setActiveView(view);
      setAnimating(false);
    }, 280);
  }, [activeView, animating]);

  const handleStart = () => {
    if (loggedIn) {
      router.push('/dashboard');
    } else {
      setLoginStep('PHONE');
      setLoginError('');
      setLoginInfo('');
      setShowLoginModal(true);
    }
  };

  const handleBookItem = (itemName: string) => {
    if (loggedIn) {
      router.push('/dashboard');
    } else {
      setLoginStep('PHONE');
      setLoginError('');
      setLoginInfo('');
      setShowLoginModal(true);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || loginLoading) return;
    setLoginLoading(true); setLoginError(''); setLoginInfo('');
    
    const formatted = phone.startsWith('+') ? phone : `+234${phone.replace(/^0+/, '')}`;
    
    try {
      let v = verifier;
      if (!v) {
        const container = document.getElementById('recaptcha-container');
        if (container) container.innerHTML = '';
        v = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
        await v.render();
        setVerifier(v);
      }
      
      const result = await signInWithPhoneNumber(auth, formatted, v);
      setConfirmation(result);
      setLoginInfo(`OTP code sent to ${formatted}`);
      setLoginStep('OTP');
    } catch (err: any) {
      console.error('[Phone Submit Error]', err);
      setLoginError(err.message || 'Failed to send verification code.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || !confirmation || loginLoading) return;
    setLoginLoading(true); setLoginError('');
    
    const formatted = phone.startsWith('+') ? phone : `+234${phone.replace(/^0+/, '')}`;
    
    try {
      const credential = await confirmation.confirm(otp);
      const idToken = await credential.user.getIdToken();
      
      const { data } = await axios.post('/api/v1/auth/verify-otp', { phoneNumber: formatted, idToken });
      const { token, user: loggedUser } = data;
      
      if (!loggedUser.fullName || loggedUser.fullName === 'Customer Account') {
        setTempToken(token);
        setTempUser(loggedUser);
        setLoginStep('ONBOARDING');
      } else {
        localStorage.setItem('customerToken', token);
        localStorage.setItem('customerUser', JSON.stringify(loggedUser));
        setLoggedIn(true);
        setShowLoginModal(false);
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('[OTP Submit Error]', err);
      setLoginError(err.response?.data?.error || err.message || 'Invalid code.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || loginLoading) return;
    setLoginLoading(true); setLoginError('');
    
    try {
      const { data } = await axios.patch(
        '/api/v1/users/profile',
        { fullName: fullName.trim() },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );
      localStorage.setItem('customerToken', tempToken);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      setLoggedIn(true);
      setShowLoginModal(false);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[Onboarding Error]', err);
      setLoginError(err.response?.data?.error || 'Failed to complete registration.');
    } finally {
      setLoginLoading(false);
    }
  };

  const isVisible = (v: View) => v === displayedView || v === activeView;

  // Filter dbServices by currently active category tab
  const displayServices = dbServices.filter((s) => s.category === pricingCategory);

  return (
    <div className="shell">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; }
        body {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          background: #fff; color: #0F172A;
        }

        /* ── SHELL ── */
        .shell {
          height: 100svh; display: flex; flex-direction: column;
          position: relative; overflow: hidden; background: #fff;
        }

        /* Orbs */
        @keyframes floatA { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-28px) scale(1.05);} }
        @keyframes floatB { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(20px) scale(0.95);} }
        .orb {
          position: absolute; border-radius: 50%; pointer-events: none; z-index: 0;
        }
        .orb-1 {
          width: 60vw; height: 60vw; max-width: 640px; max-height: 640px;
          top: -15%; left: -10%;
          background: radial-gradient(circle, rgba(0,102,255,0.06) 0%, transparent 70%);
          animation: floatA 14s ease-in-out infinite;
        }
        .orb-2 {
          width: 70vw; height: 70vw; max-width: 760px; max-height: 760px;
          bottom: -18%; right: -10%;
          background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%);
          animation: floatB 18s ease-in-out infinite;
        }

        /* ── NAV — Centered splits (Logo in between Menu links) ── */
        .top-nav {
          position: relative; z-index: 100; flex-shrink: 0;
          display: flex; justify-content: center;
          padding: 18px 5% 10px;
        }
        .nav-container-centered {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          width: 100%;
          max-width: 800px;
        }
        .nav-group {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }
        .nav-group.left { justify-content: flex-end; }
        .nav-group.right { justify-content: flex-start; }
        
        .nav-logo { display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        
        .nav-btn {
          padding: 6px 14px; border-radius: 100px; border: none;
          font-size: 13px; font-weight: 500; color: #64748B; cursor: pointer;
          background: transparent; font-family: 'DM Sans', sans-serif;
          transition: all 0.18s; white-space: nowrap;
        }
        .nav-btn:hover { color: #0F172A; background: #F1F5F9; }
        .nav-btn.active { color: #0066FF; background: rgba(0,102,255,0.08); font-weight: 700; }

        @media (max-width: 600px) {
          .nav-container-centered { gap: 8px; }
          .nav-group { gap: 6px; }
          .nav-btn { font-size: 12px; padding: 5px 10px; }
          .top-nav { padding: 12px 3% 6px; }
        }

        /* ── MAIN PANEL ── */
        .panel {
          flex: 1; position: relative; z-index: 10; overflow: hidden;
          display: flex; align-items: stretch; justify-content: center;
          min-height: 0;
        }

        /* ── VIEW TRANSITIONS ── */
        .view {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 12px 5% 20px;
          transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.16,1,0.3,1);
        }
        .view.entering { opacity: 1; transform: translateY(0); }
        .view.exiting  { opacity: 0; transform: translateY(10px); pointer-events: none; }

        /* ── HOME VIEW ── */
        .hero {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; max-width: 760px; width: 100%;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 16px; border-radius: 100px;
          background: rgba(0,102,255,0.07); color: #0066FF;
          font-size: 11px; font-weight: 800; letter-spacing: 2px;
          margin-bottom: 24px; border: 1px solid rgba(0,102,255,0.12);
          text-transform: uppercase; animation: fadeUp 0.6s ease both;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #0066FF; flex-shrink: 0; }
        .hero-h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(34px, 7vw, 76px); font-weight: 900;
          color: #0F172A; letter-spacing: -2.5px; line-height: 1.04;
          margin-bottom: 16px;
          animation: fadeUp 0.6s ease 0.08s both;
        }
        .hero-accent { color: #0066FF; font-style: italic; }
        .hero-sub {
          font-size: clamp(14px, 1.8vw, 17px); color: #64748B; line-height: 1.7;
          margin-bottom: 28px; max-width: 480px;
          animation: fadeUp 0.6s ease 0.16s both;
        }
        .ctas {
          display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
          animation: fadeUp 0.6s ease 0.22s both;
          margin-bottom: 24px;
        }
        .btn-p {
          height: 50px; padding: 0 26px; background: #0066FF; color: #fff;
          border: none; border-radius: 100px; font-size: 15px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 8px 22px rgba(0,102,255,0.25); transition: all 0.2s;
        }
        .btn-p:hover { background: #005ce6; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,102,255,0.35); }
        .btn-s {
          height: 50px; padding: 0 26px; background: transparent; color: #334155;
          border: 2px solid #E2E8F0; border-radius: 100px; font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 8px; transition: all 0.2s;
        }
        .btn-s:hover { background: #F8FAFC; border-color: #CBD5E1; transform: translateY(-2px); }

        /* Trust/Features Bar for empty Hero Section — transparent/headless style */
        .hero-features {
          display: flex; gap: 32px; width: 100%; max-width: 680px;
          justify-content: center; animation: fadeUp 0.6s ease 0.3s both;
          margin-bottom: 24px;
        }
        .hero-feature-item {
          background: transparent; border: none;
          padding: 8px 0; display: flex;
          align-items: center; gap: 12px; text-align: left; transition: all 0.2s;
        }
        .hero-feature-item:hover {
          transform: translateY(-2px);
        }
        .hf-icon { font-size: 24px; }
        .hf-text h4 { font-size: 14px; font-weight: 700; color: #0F172A; }
        .hf-text p { font-size: 12px; color: #64748B; margin-top: 1px; }

        /* Testimonials Indicators */
        .hero-testimonials {
          display: flex; align-items: center; gap: 12px;
          animation: fadeUp 0.6s ease 0.36s both;
        }
        .avatar-group {
          display: flex; align-items: center;
        }
        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: #F1F5F9; border: 2px solid #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; margin-left: -8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .avatar:first-child { margin-left: 0; }
        
        .rating-info { text-align: left; }
        .rating-stars { color: #F59E0B; font-size: 14px; letter-spacing: 1px; font-weight: 700; }
        .rating-info p { font-size: 12px; color: #64748B; font-weight: 500; }

        @media (max-width: 640px) {
          .hero-features { gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
          .hero-feature-item { flex: 1 1 45%; padding: 4px 0; gap: 8px; }
          .hero-h1 { margin-bottom: 12px; }
          .hero-sub { margin-bottom: 24px; }
          .ctas { margin-bottom: 20px; }
          .hf-icon { font-size: 20px; }
          .hf-text h4 { font-size: 13px; }
          .hf-text p { font-size: 11px; }
        }

        /* ── SHARED SECTION WRAPPER ── */
        .sec-wrap {
          width: 100%; max-width: 1100px; height: 100%;
          display: flex; flex-direction: column;
        }
        .sec-head { flex-shrink: 0; margin-bottom: 12px; }
        .sec-label {
          font-size: 10px; font-weight: 800; letter-spacing: 2px;
          text-transform: uppercase; color: #0066FF; margin-bottom: 4px;
        }
        .sec-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(20px, 3.5vw, 36px); font-weight: 900;
          color: #0F172A; letter-spacing: -0.5px; line-height: 1.1;
        }

        /* ── SERVICES GRID ── */
        .services-grid {
          flex: 1; min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 10px;
        }
        @media (min-width: 768px) {
          .services-grid {
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 1fr);
          }
        }
        .s-card {
          border-radius: 14px; padding: 14px;
          display: flex; flex-direction: column; justify-content: space-between;
          transition: all 0.2s;
        }
        .s-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .s-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .s-icon-wrap {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.7);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .s-name { font-size: 14px; font-weight: 800; color: #0F172A; line-height: 1.2; }
        .s-desc { font-size: 14px; color: #475569; line-height: 1.55; flex: 1; margin-bottom: 8px; }
        
        .s-card-btn {
          width: 100%; height: 36px; border-radius: 100px;
          border: 1.5px solid #E2E8F0; background: #FFF;
          color: #475569; font-size: 11px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.18s; display: flex; align-items: center; justify-content: center;
          margin-top: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .s-card-btn:hover {
          border-color: #0066FF; color: #0066FF; background: rgba(0, 102, 255, 0.02);
        }

        .services-note-banner {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 14px;
          padding: 12px 16px;
          background: rgba(255, 179, 0, 0.05);
          border: 1px dashed rgba(255, 179, 0, 0.3);
          border-radius: 14px;
          flex-shrink: 0;
        }
        .note-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 11px;
          line-height: 1.4;
          color: #475569;
        }
        .note-icon {
          font-size: 16px;
          flex-shrink: 0;
          line-height: 1;
        }
        .note-item strong {
          color: #0F172A;
          font-weight: 700;
        }
        
        @media (max-width: 600px) {
          .services-note-banner {
            grid-template-columns: 1fr;
            gap: 8px;
            padding: 10px 12px;
            margin-top: 10px;
          }
          .note-item {
            font-size: 10px;
          }
        }

        /* ── PRICING INTERACTIVE BOARD ── */
        .pricing-tabs {
          display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; flex-shrink: 0;
        }
        .pricing-tab-btn {
          padding: 8px 18px; border-radius: 100px; border: 1.5px solid #E2E8F0;
          background: transparent; color: #64748B; font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .pricing-tab-btn:hover { background: #F8FAFC; color: #0F172A; border-color: #CBD5E1; }
        .pricing-tab-btn.active { background: #0066FF; color: #fff; border-color: #0066FF; }

        .pricing-table-container {
          flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto;
          border: 1px solid #F1F5F9; border-radius: 16px;
          background: #FAFBFC;
        }
        .pricing-table {
          width: 100%; border-collapse: collapse; text-align: left;
          font-size: 13px;
        }
        .pricing-table th, .pricing-table td {
          padding: 10px 14px; border-bottom: 1px solid #F1F5F9;
        }
        .pricing-table th {
          background: #F8FAFC; color: #475569; font-weight: 800;
          position: sticky; top: 0; z-index: 5; font-size: 12px;
          border-bottom: 1px solid #E2E8F0;
        }
        .pricing-table tr:hover { background: rgba(0, 102, 255, 0.02); }
        .item-name-cell { font-weight: 700; color: #0F172A; }
        .price-text { font-family: 'DM Sans', sans-serif; font-weight: 600; color: #0066FF; }
        
        .table-book-btn {
          padding: 6px 14px; border-radius: 100px; border: none;
          background: #0066FF; color: #fff; font-size: 11px; font-weight: 700;
          cursor: pointer; transition: background 0.18s;
        }
        .table-book-btn:hover { background: #005ce6; }

        /* Mobile Card Grid styling */
        .pricing-mobile-container {
          display: none;
          flex: 1; min-height: 0; overflow-y: auto;
        }
        .pricing-mobile-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding: 2px;
        }
        
        .p-item-card {
          background: #FAFBFC;
          border: 1px solid #F1F5F9;
          border-radius: 14px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s;
        }
        .p-item-card:hover {
          border-color: #0066FF;
          background: #FFFFFF;
          box-shadow: 0 4px 12px rgba(0,102,255,0.04);
        }
        .p-item-title {
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 8px;
          border-bottom: 1px solid #F1F5F9;
          padding-bottom: 4px;
        }
        .p-item-rates {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 8px;
          flex: 1;
        }
        .p-item-rate-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #64748B;
        }
        .p-item-rate-row span.val {
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          color: #0066FF;
        }
        
        .p-item-book-btn {
          width: 100%;
          height: 32px;
          border-radius: 100px;
          border: none;
          background: #0066FF;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.18s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .p-item-book-btn:hover {
          background: #005ce6;
        }

        @media (max-width: 767px) {
          .pricing-table-container {
            display: none;
          }
          .pricing-mobile-container {
            display: block;
          }
        }

        /* ── HOW IT WORKS GRID ── */
        .steps-grid {
          flex: 1; min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 768px) {
          .steps-grid { grid-template-columns: repeat(4, 1fr); grid-template-rows: 1fr; }
        }
        .step-card {
          border-radius: 16px; padding: 18px;
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .step-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .step-icon-wrap {
          width: 38px; height: 38px; border-radius: 12px;
          background: rgba(255,255,255,0.7);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .step-num {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 900; line-height: 1;
        }
        .step-title { font-size: 15px; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
        .step-desc { font-size: 13px; color: #475569; line-height: 1.6; }

        /* ── MODAL OVERLAY & CONTENT ── */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .modal-content {
          background: #FFFFFF; border-radius: 24px; padding: 32px;
          width: 100%; max-width: 400px; position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
          min-height: 290px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .modal-close {
          position: absolute; top: 20px; right: 20px;
          background: none; border: none; cursor: pointer; color: #64748B;
          padding: 4px; border-radius: 50%; display: flex; align-items: center;
          transition: background 0.2s;
        }
        .modal-close:hover { background: #F1F5F9; color: #0F172A; }
        
        .modal-header { margin-bottom: 16px; }
        .modal-header h3 {
          font-family: 'Playfair Display', serif; font-size: 24px;
          font-weight: 900; color: #0F172A; margin-bottom: 8px;
        }
        .modal-header p { font-size: 13px; color: #64748B; line-height: 1.5; }
        
        .modal-error {
          padding: 10px 14px; background: #FEF2F2; border: 1px solid #FEE2E2;
          color: #DC2626; border-radius: 10px; font-size: 12px; margin-bottom: 12px;
        }
        .modal-info {
          padding: 10px 14px; background: #ECFDF5; border: 1px solid #D1FAE5;
          color: #059669; border-radius: 10px; font-size: 12px; margin-bottom: 12px;
        }
        
        .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .form-group label { font-size: 12px; font-weight: 700; color: #475569; }
        .modal-input {
          height: 48px; border-radius: 12px; border: 1.5px solid #E2E8F0;
          padding: 0 16px; font-size: 14px; font-family: inherit;
          transition: border-color 0.2s; width: 100%;
        }
        .modal-input:focus { border-color: #0066FF; outline: none; }
        
        .modal-submit-btn {
          width: 100%; height: 48px; border-radius: 12px; border: none;
          background: #0066FF; color: #FFFFFF; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: background 0.2s;
        }
        .modal-submit-btn:hover { background: #005ce6; }
        .modal-submit-btn:disabled { background: #94A3B8; cursor: not-allowed; }
        
        /* Hide recaptcha container from page flow to prevent shifts */
        #recaptcha-container {
          position: absolute !important;
          visibility: hidden !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }
      `}} />

      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* ── NAV ── */}
      <header className="top-nav">
        <div className="nav-container-centered">
          <div className="nav-group left">
            <button className={`nav-btn${activeView === 'home' ? ' active' : ''}`} onClick={() => switchView('home')}>
              Home
            </button>
            <button className={`nav-btn${activeView === 'services' ? ' active' : ''}`} onClick={() => switchView('services')}>
              Services
            </button>
          </div>
          
          <div className="nav-logo" onClick={() => switchView('home')}>
            <Image src="/bglogo.png" alt="BG Laundry" width={110} height={110} style={{ objectFit: 'contain' }} priority />
          </div>
          
          <div className="nav-group right">
            <button className={`nav-btn${activeView === 'how-it-works' ? ' active' : ''}`} onClick={() => switchView('how-it-works')}>
              How It Works
            </button>
            <button className="nav-btn" onClick={handleStart}>
              {loggedIn ? 'Dashboard' : 'Sign In'}
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN PANEL ── */}
      <main className="panel">

        {/* HOME */}
        <div className={`view${displayedView === 'home' ? (animating ? ' exiting' : ' entering') : ' exiting'}`}
          style={{ display: isVisible('home') ? 'flex' : 'none' }}>
          <div className="hero">
            <div className="hero-badge">
              <span className="badge-dot" />
              Lagos&apos; Premier Laundry Service
            </div>
            <h1 className="hero-h1">
              Premium Laundry.<br />
              Delivered to <span className="hero-accent">Your Door.</span>
            </h1>
            <p className="hero-sub">
              World-class garment care without leaving your home. Schedule a pickup, track your order, and receive clothes that look brand new.
            </p>
            <div className="ctas">
              <button className="btn-p" onClick={handleStart}>
                Get Started <ArrowRight size={16} />
              </button>
              <button className="btn-s" onClick={() => switchView('services')}>
                Explore Services
              </button>
            </div>
            
            {/* Minimalist Headless Feature Details */}
            <div className="hero-features">
              <div className="hero-feature-item">
                <span className="hf-icon">⚡</span>
                <div className="hf-text">
                  <h4>24h Express</h4>
                  <p>Fast turnaround</p>
                </div>
              </div>
              <div className="hero-feature-item">
                <span className="hf-icon">🛡️</span>
                <div className="hf-text">
                  <h4>Premium Care</h4>
                  <p>Fabric protection</p>
                </div>
              </div>
              <div className="hero-feature-item">
                <span className="hf-icon">🚚</span>
                <div className="hf-text">
                  <h4>Free Delivery</h4>
                  <p>Pickup & return</p>
                </div>
              </div>
            </div>

            {/* Testimonials Indicators */}
            <div className="hero-testimonials">
              <div className="avatar-group">
                <span className="avatar">👩‍🦰</span>
                <span className="avatar">👨</span>
                <span className="avatar">👩</span>
                <span className="avatar">🧔</span>
              </div>
              <div className="rating-info">
                <div className="rating-stars">★★★★★</div>
                <p>Loved by 1,200+ Lagos families</p>
              </div>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <div className={`view${displayedView === 'services' ? (animating ? ' exiting' : ' entering') : ' exiting'}`}
          style={{ display: isVisible('services') ? 'flex' : 'none', alignItems: 'stretch' }}>
          <div className="sec-wrap">
            <div className="sec-head">
              <p className="sec-label">What We Offer</p>
              <h2 className="sec-title">Services for Every Need</h2>
            </div>
            <div className="services-grid">
              {services.map((s) => (
                <div key={s.title} className="s-card" style={{ background: s.color }}>
                  <div>
                    <div className="s-card-top">
                      <div className="s-icon-wrap">{s.icon}</div>
                      <span className="s-name">{s.title}</span>
                    </div>
                    <p className="s-desc">{s.desc}</p>
                  </div>
                  <button className="s-card-btn" onClick={() => {
                    if (s.title.includes('Dry Cleaning') || s.title.includes('Fold') || s.title.includes('Press')) {
                      setPricingCategory('Clothing');
                    } else if (s.title.includes('Bedding') || s.title.includes('Linen') || s.title.includes('Household')) {
                      setPricingCategory('Household');
                    } else if (s.title.includes('Shoe') || s.title.includes('Stain') || s.title.includes('Specialty')) {
                      setPricingCategory('Additional');
                    }
                    switchView('pricing');
                  }}>
                    View Rates →
                  </button>
                </div>
              ))}
            </div>

            {/* Price list note details banner */}
            <div className="services-note-banner">
              <div className="note-item">
                <span className="note-icon">🚚</span>
                <span><strong>Free Delivery & Pickup:</strong> Starts from 10 items & above. Under 10 items attracts a delivery fee based on location.</span>
              </div>
              <div className="note-item">
                <span className="note-icon">⏱️</span>
                <span><strong>Turnaround:</strong> 24–48 hours standard. <strong>Express 24h service</strong> is available at +50% service charge.</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRICING */}
        <div className={`view${displayedView === 'pricing' ? (animating ? ' exiting' : ' entering') : ' exiting'}`}
          style={{ display: isVisible('pricing') ? 'flex' : 'none', alignItems: 'stretch' }}>
          <div className="sec-wrap">
            <div className="pricing-tabs" style={{ marginTop: '10px' }}>
              {(['Clothing', 'Household', 'Additional'] as const).map((cat) => (
                <button
                  key={cat}
                  className={`pricing-tab-btn${pricingCategory === cat ? ' active' : ''}`}
                  onClick={() => setPricingCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
 
            {/* Desktop Table View */}
            <div className="pricing-table-container">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Wash Only</th>
                    <th>Iron Only</th>
                    <th>Wash & Iron</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayServices.map((item) => (
                    <tr key={item.name}>
                      <td className="item-name-cell">{item.name}</td>
                      <td className="price-text">{item.hasWash && item.washPrice > 0 ? `₦${item.washPrice.toLocaleString()}` : '—'}</td>
                      <td className="price-text">{item.hasIron && item.ironPrice > 0 ? `₦${item.ironPrice.toLocaleString()}` : '—'}</td>
                      <td className="price-text">{item.hasWashIron && item.washIronPrice > 0 ? `₦${item.washIronPrice.toLocaleString()}` : '—'}</td>
                      <td>
                        <button className="table-book-btn" onClick={() => handleBookItem(item.name)}>
                          Book
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid View */}
            <div className="pricing-mobile-container">
              <div className="pricing-mobile-grid">
                {displayServices.map((item) => (
                  <div key={item.name} className="p-item-card">
                    <div>
                      <h4 className="p-item-title">{item.name}</h4>
                      <div className="p-item-rates">
                        {item.hasWash && item.washPrice > 0 && (
                          <div className="p-item-rate-row">
                            <span>Wash Only</span>
                            <span className="val">₦{item.washPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {item.hasIron && item.ironPrice > 0 && (
                          <div className="p-item-rate-row">
                            <span>Iron Only</span>
                            <span className="val">₦{item.ironPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {item.hasWashIron && item.washIronPrice > 0 && (
                          <div className="p-item-rate-row highlight">
                            <span>Wash & Iron</span>
                            <span className="val">₦{item.washIronPrice.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button className="p-item-book-btn" onClick={() => handleBookItem(item.name)}>
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className={`view${displayedView === 'how-it-works' ? (animating ? ' exiting' : ' entering') : ' exiting'}`}
          style={{ display: isVisible('how-it-works') ? 'flex' : 'none', alignItems: 'stretch' }}>
          <div className="sec-wrap">
            <div className="sec-head">
              <p className="sec-label">The Process</p>
              <h2 className="sec-title">From Your Door. Back to Your Door.</h2>
            </div>
            <div className="steps-grid">
              {steps.map((s) => (
                <div key={s.step} className="step-card" style={{ background: s.color }}>
                  <div>
                    <div className="step-top">
                      <div className="step-icon-wrap">{s.icon}</div>
                      <span className="step-num" style={{ color: s.accent }}>{s.step}</span>
                    </div>
                    <h3 className="step-title">{s.title}</h3>
                    <p className="step-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Login Popup Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>
              <X size={18} />
            </button>
            <div className="modal-header">
              <h3>Sign In to Continue</h3>
              <p>Please log in using your phone number to proceed with booking.</p>
            </div>
            
            {loginError && <div className="modal-error">{loginError}</div>}
            {loginInfo && <div className="modal-info">{loginInfo}</div>}

            {loginStep === 'PHONE' && (
              <form onSubmit={handlePhoneSubmit}>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="modal-input"
                  />
                </div>
                <button type="submit" disabled={loginLoading} className="modal-submit-btn">
                  {loginLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            )}

            {loginStep === 'OTP' && (
              <form onSubmit={handleOtpSubmit}>
                <div className="form-group">
                  <label>OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="modal-input"
                  />
                </div>
                <button type="submit" disabled={loginLoading} className="modal-submit-btn">
                  {loginLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>
            )}

            {loginStep === 'ONBOARDING' && (
              <form onSubmit={handleOnboardSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="modal-input"
                  />
                </div>
                <button type="submit" disabled={loginLoading} className="modal-submit-btn">
                  {loginLoading ? 'Saving...' : 'Complete Registration'}
                </button>
              </form>
            )}

            {/* Hidden container for reCAPTCHA */}
            <div id="recaptcha-container"></div>
          </div>
        </div>
      )}
    </div>
  );
}
