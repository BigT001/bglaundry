'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { ArrowRight, Check, X, Menu, ChevronRight } from '@/lib/icons';

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
  { icon: '👕', title: 'Wash & Fold', desc: 'Expert laundering with premium detergents, returned neatly folded.', color: '#EFF6FF' },
  { icon: '🥼', title: 'Dry Cleaning', desc: 'Professional care for suits, dresses & delicate fabrics.', color: '#F0FDF4' },
  { icon: '👔', title: 'Iron & Press', desc: 'Steam pressing for crisp shirts and formal wear.', color: '#FFF7ED' },
  { icon: '👟', title: 'Shoe Cleaning', desc: 'Deep cleaning & restoration for sneakers and leather shoes.', color: '#FDF4FF' },
  { icon: '🛏️', title: 'Bedding & Linen', desc: 'Hygienic washing of duvets, sheets and pillow cases.', color: '#F0FDF4' },
  { icon: '🧥', title: 'Stain Removal', desc: 'Pre-treatment for stubborn stains — oil, wine, ink and more.', color: '#FFF1F2' },
];

const steps = [
  { step: '01', title: 'Schedule', desc: 'Choose your service and select a convenient pickup time.', color: '#EEF2FF', accent: '#6366F1', icon: '📅' },
  { step: '02', title: 'We Collect', desc: 'Our driver arrives on time and handles your clothes with care.', color: '#F0FDF4', accent: '#16A34A', icon: '🚚' },
  { step: '03', title: 'We Clean', desc: 'Items cleaned with premium products in our expert facility.', color: '#EFF6FF', accent: '#0066FF', icon: '✨' },
  { step: '04', title: 'Delivered', desc: 'Fresh, pressed clothes returned straight to your door.', color: '#FFF7ED', accent: '#EA580C', icon: '📦' },
];

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<View>('home');
  const [animating, setAnimating] = useState(false);
  const [displayedView, setDisplayedView] = useState<View>('home');
  const [dbServices, setDbServices] = useState<ServiceItem[]>(fallbackServices);
  const [pricingCategory, setPricingCategory] = useState<'Clothing' | 'Household' | 'Additional'>('Clothing');
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

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
          callback: () => { },
          'expired-callback': () => {
            setVerifier(null);
          }
        });
        v.render().then(() => setVerifier(v)).catch(() => { });
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      // 1. Trigger instant backend OTP dispatch (Termii SMS)
      await axios.post('/api/v1/auth/request-otp', { phoneNumber: formatted });

      // 2. Initialize Firebase in background as backup
      try {
        let v = verifier;
        if (!v) {
          const container = document.getElementById('recaptcha-container');
          if (container) container.innerHTML = '';
          v = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
          await v.render();
          setVerifier(v);
        }
        signInWithPhoneNumber(auth, formatted, v)
          .then((res) => setConfirmation(res))
          .catch((fErr) => console.warn('[Firebase Auth Backup Warning]', fErr?.message));
      } catch (fInitErr) {
        console.warn('[Firebase Recaptcha Warning]', fInitErr);
      }

      setLoginInfo(`OTP code sent to ${formatted}`);
      setLoginStep('OTP');
    } catch (err: any) {
      console.error('[Phone Submit Error]', err);
      setLoginError(err.response?.data?.error || err.message || 'Failed to send verification code.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || loginLoading) return;
    setLoginLoading(true); setLoginError('');

    const formatted = phone.startsWith('+') ? phone : `+234${phone.replace(/^0+/, '')}`;

    try {
      let idToken = '';
      if (confirmation) {
        try {
          const credential = await confirmation.confirm(otp);
          idToken = await credential.user.getIdToken();
        } catch (firebaseErr: any) {
          console.warn('[Firebase Confirm Warning]', firebaseErr?.message);
        }
      }

      const { data } = await axios.post('/api/v1/auth/verify-otp', {
        phoneNumber: formatted,
        code: otp,
        idToken,
      });
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

      <style dangerouslySetInnerHTML={{
        __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          height: auto;
          min-height: 100%;
          overflow-y: auto;
          scroll-behavior: smooth;
          background: #FAFBFC;
          color: #0F172A;
        }
        body {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ── SHELL ── */
        .shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #FAFBFC;
          overflow-x: hidden;
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
          background: radial-gradient(circle, rgba(0,102,255,0.05) 0%, transparent 70%);
          animation: floatA 14s ease-in-out infinite;
        }
        .orb-2 {
          width: 70vw; height: 70vw; max-width: 760px; max-height: 760px;
          bottom: -18%; right: -10%;
          background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%);
          animation: floatB 18s ease-in-out infinite;
        }

        /* ── NAV — Centered split layout ── */
        .top-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #F1F5F9;
          padding: 12px 5%;
        }
        .nav-container-centered {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .hamburger-btn {
          width: 42px;
          height: 42px;
          background: #0B132B;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          color: #FFF;
          transition: background 0.2s;
        }
        .hamburger-btn:hover {
          background: #1C2541;
        }

        /* Drawer Overlay */
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 2000;
          display: flex;
          justify-content: flex-end;
        }
        .drawer-content {
          background: #FFF;
          width: 100%;
          max-width: 280px;
          height: 100%;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: -10px 0 30px rgba(0,0,0,0.1);
          animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-close {
          align-self: flex-end;
          background: none;
          border: none;
          cursor: pointer;
          color: #64748B;
          padding: 6px;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .drawer-close:hover {
          background: #F1F5F9;
          color: #0F172A;
        }
        .drawer-link {
          font-size: 15px;
          font-weight: 700;
          color: #0B132B;
          background: none;
          border: none;
          text-align: left;
          padding: 12px 6px;
          border-bottom: 1px solid #F1F5F9;
          cursor: pointer;
          transition: color 0.18s;
        }
        .drawer-link:hover {
          color: #0066FF;
        }

        /* ── MAIN PANEL ── */
        .panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 10;
          height: auto;
        }

        /* ── SECTIONS ── */
        .sec-wrap {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }

        /* ── HERO VIEW ── */
        .hero-split {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 5% 50px;
          gap: 40px;
          position: relative;
          z-index: 2;
        }
        .hero-left {
          flex: 1.1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .hero-right {
          flex: 0.9;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .hero-img-container {
          position: relative;
          width: 100%;
          max-width: 440px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
          border: 1px solid #FFF;
        }
        
        .hero-h1-split {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(34px, 5vw, 56px);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -1.5px;
          color: #0F172A;
          margin-bottom: 12px;
        }
        .h1-blue {
          color: #0066FF;
        }
        .hero-divider {
          width: 48px;
          height: 4px;
          background: #0066FF;
          border-radius: 2px;
          margin-bottom: 20px;
        }
        .hero-sub-split {
          font-size: 15px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 28px;
          max-width: 460px;
        }

        /* Hero Features list */
        .hero-feature-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 28px;
        }
        .hf-list-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .hf-list-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #EFF6FF;
          color: #0066FF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .hf-list-text h4 {
          font-size: 14px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 1px;
        }
        .hf-list-text p {
          font-size: 12px;
          color: #64748B;
        }

        /* CTA buttons */
        .hero-ctas {
          display: flex;
          gap: 12px;
          width: 100%;
          max-width: 460px;
          margin-bottom: 24px;
        }
        .btn-pickup {
          flex: 1;
          height: 48px;
          background: #0066FF;
          color: #FFF;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(0,102,255,0.25);
          transition: all 0.2s;
        }
        .btn-pickup:hover {
          background: #0056FF;
          transform: translateY(-1px);
        }
        .btn-whatsapp {
          flex: 1;
          height: 48px;
          background: #FFF;
          color: #0F172A;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-whatsapp:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }

        /* Testimonial rating indicators */
        .hero-social-proof {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #FFF;
          border-radius: 12px;
          border: 1px solid #F1F5F9;
          padding: 8px 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .avatar-group { display: flex; align-items: center; }
        .avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid #FFF;
          margin-left: -6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          background: #F1F5F9;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .avatar:first-child { margin-left: 0; }
        .rating-stars { color: #F59E0B; font-size: 13px; font-weight: 700; letter-spacing: 1px; }
        .rating-info p { font-size: 11px; color: #64748B; font-weight: 600; }

        /* ── HOW IT WORKS SECTION ── */
        .how-it-works-sec {
          background: #FFF;
          padding: 64px 5%;
          text-align: center;
          border-top: 1px solid #F1F5F9;
          border-bottom: 1px solid #F1F5F9;
          position: relative;
          z-index: 2;
        }
        .section-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 10px;
          font-weight: 800;
          color: #0066FF;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .section-divider::before, .section-divider::after {
          content: "";
          width: 32px;
          height: 1px;
          background: #E2E8F0;
        }
        .section-main-title {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(24px, 4.5vw, 36px);
          font-weight: 900;
          color: #0F172A;
          margin-bottom: 44px;
        }
        .steps-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
        }
        .step-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
          padding: 0 12px;
        }
        .step-icon-container {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: #EFF6FF;
          color: #0066FF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          box-shadow: 0 8px 20px rgba(0,102,255,0.06);
          position: relative;
          margin-bottom: 20px;
          border: 1px solid #DBEAFE;
        }
        .step-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 22px;
          height: 22px;
          background: #0066FF;
          color: #FFF;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FFF;
        }
        .step-item-title {
          font-size: 13px;
          font-weight: 900;
          color: #0F172A;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .step-item-desc {
          font-size: 12px;
          color: #64748B;
          line-height: 1.5;
          max-width: 220px;
        }
        .steps-connector {
          position: absolute;
          top: 34px;
          left: 12%;
          right: 12%;
          height: 2px;
          border-bottom: 2px dashed #E2E8F0;
          z-index: 1;
        }

        /* ── SERVICES SECTION ── */
        .services-sec {
          padding: 64px 5% 80px;
          text-align: center;
          position: relative;
          z-index: 2;
        }
        .services-mock-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }
        .service-card-mock {
          background: #FFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.01);
        }
        .service-card-mock:hover {
          border-color: #0066FF;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,102,255,0.05);
        }
        .s-mock-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .s-mock-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          border: 1px solid #F1F5F9;
        }
        .s-mock-text h3 {
          font-size: 14px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 3px;
        }
        .s-mock-text p {
          font-size: 11px;
          color: #64748B;
        }
        .s-mock-chevron {
          color: #94A3B8;
        }

        /* ── STICKY CALL ACTION FOOTER ── */
        .helper-footer {
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 900;
          background: #0056FF;
          color: #FFF;
          padding: 14px 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 -4px 20px rgba(0,86,255,0.15);
        }
        .helper-text {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
        }
        .helper-phone-icon {
          font-size: 16px;
        }
        .btn-whatsapp-footer {
          height: 38px;
          padding: 0 18px;
          background: #FFF;
          color: #0056FF;
          border-radius: 100px;
          font-weight: 700;
          font-size: 12px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }
        .btn-whatsapp-footer:hover {
          background: #F1F5F9;
        }

        /* ── PRICING MODAL OVERLAY ── */
        .pricing-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .pricing-modal-content {
          background: #FFF;
          border-radius: 24px;
          padding: 28px;
          width: 100%;
          max-width: 600px;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .pricing-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          cursor: pointer;
          color: #64748B;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .pricing-modal-close:hover {
          background: #F1F5F9;
          color: #0F172A;
        }

        .pricing-tabs {
          display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; flex-shrink: 0;
        }
        .pricing-tab-btn {
          padding: 8px 18px; border-radius: 100px; border: 1.5px solid #E2E8F0;
          background: transparent; color: #64748B; font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .pricing-tab-btn:hover { background: #F8FAFC; color: #0F172A; border-color: #CBD5E1; }
        .pricing-tab-btn.active { background: #0066FF; color: #fff; border-color: #0066FF; }

        .pricing-table-container {
          border: 1px solid #F1F5F9; border-radius: 16px;
          background: #FAFBFC; margin-bottom: 10px;
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

        /* Mobile Card Grid styling inside Popover Catalog */
        .pricing-mobile-container {
          display: none;
        }
        .pricing-mobile-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
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
          font-size: 12px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 6px;
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

        /* ── RESPONSIVE MEDIA QUERIES ── */
        @media (max-width: 768px) {
          .hero-split {
            flex-direction: column;
            padding: 24px 5% 30px;
            gap: 24px;
          }
          .hero-left {
            align-items: center;
            text-align: center;
          }
          .hero-divider {
            margin: 0 auto 16px;
          }
          .hero-sub-split {
            margin: 0 auto 20px;
            text-align: center;
          }
          .hero-feature-list {
            align-items: flex-start;
            text-align: left;
            margin-bottom: 24px;
            width: 100%;
            max-width: 320px;
          }
          .hero-ctas {
            flex-direction: column;
            width: 100%;
            gap: 10px;
            margin-bottom: 20px;
          }
          .hero-right {
            order: -1; /* Wicker basket image goes on top on mobile */
            width: 100%;
          }
          .steps-container {
            flex-direction: column;
            gap: 32px;
          }
          .steps-connector {
            display: none;
          }
          .services-mock-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .helper-footer {
            flex-direction: column;
            gap: 12px;
            text-align: center;
            padding: 18px 5%;
          }
        }
      `}} />

      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* ── NAV ── */}
      <header className="top-nav">
        <div className="nav-container-centered">
          <div className="nav-logo" onClick={() => scrollToSection('home')}>
            <Image src="/bglogo.png" alt="BG Laundry" width={100} height={100} style={{ objectFit: 'contain' }} priority />
          </div>

          <button className="hamburger-btn" aria-label="Open navigation menu" onClick={() => setShowMenuDrawer(true)}>
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU DRAWER ── */}
      {showMenuDrawer && (
        <div className="drawer-overlay" onClick={() => setShowMenuDrawer(false)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" aria-label="Close navigation menu" onClick={() => setShowMenuDrawer(false)}>
              <X size={20} />
            </button>
            <button className="drawer-link" onClick={() => { scrollToSection('home'); setShowMenuDrawer(false); }}>
              Home
            </button>
            <button className="drawer-link" onClick={() => { scrollToSection('how-it-works'); setShowMenuDrawer(false); }}>
              How It Works
            </button>
            <button className="drawer-link" onClick={() => { scrollToSection('services'); setShowMenuDrawer(false); }}>
              Our Services
            </button>
            <button className="drawer-link" onClick={() => { setShowPricingModal(true); setShowMenuDrawer(false); }}>
              Price Catalog
            </button>
            <button className="drawer-link" onClick={() => { handleStart(); setShowMenuDrawer(false); }} style={{ color: '#0066FF' }}>
              {loggedIn ? 'Go to Dashboard' : 'Sign In'}
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN PANEL ── */}
      <main className="panel">

        {/* HERO SECTION */}
        <section id="home" className="hero-split">
          <div className="hero-left">
            <h1 className="hero-h1-split">
              Clean Clothes.<br />
              <span className="h1-blue">Happy Life.</span>
            </h1>
            <div className="hero-divider" />
            <p className="hero-sub-split">
              Premium laundry and dry cleaning services with care, delivered to your door.
            </p>

            <div className="hero-feature-list">
              <div className="hf-list-item">
                <div className="hf-list-icon">👑</div>
                <div className="hf-list-text">
                  <h4>Premium Care</h4>
                  <p>Top-quality cleaning for every fabric.</p>
                </div>
              </div>
              <div className="hf-list-item">
                <div className="hf-list-icon">⏰</div>
                <div className="hf-list-text">
                  <h4>24h Express</h4>
                  <p>Fast turnaround when you need it.</p>
                </div>
              </div>
              <div className="hf-list-item">
                <div className="hf-list-icon">🚚</div>
                <div className="hf-list-text">
                  <h4>Free Pickup & Delivery</h4>
                  <p>We pick up and deliver at your convenience.</p>
                </div>
              </div>
            </div>

            <div className="hero-ctas">
              <button className="btn-pickup" onClick={handleStart}>
                🛍️ BOOK A PICKUP →
              </button>
              <button className="btn-whatsapp" onClick={() => window.open('https://wa.me/2348058255555', '_blank')}>
                💬 CHAT ON WHATSAPP
              </button>
            </div>

            <div className="hero-social-proof">
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

          <div className="hero-right">
            <div className="hero-img-container">
              <Image src="/basket.png" alt="Clean clothes basket" width={440} height={440} style={{ objectFit: 'cover', display: 'block' }} priority />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="how-it-works-sec">
          <div className="sec-wrap">
            <div className="section-divider">HOW IT WORKS</div>
            <h2 className="section-main-title">Laundry made simple</h2>

            <div className="steps-container">
              <div className="steps-connector" />
              
              <div className="step-item">
                <div className="step-icon-container">
                  📅
                  <span className="step-badge">1</span>
                </div>
                <h3 className="step-item-title">BOOK</h3>
                <p className="step-item-desc">Schedule a pickup in seconds.</p>
              </div>

              <div className="step-item">
                <div className="step-icon-container">
                  🧼
                  <span className="step-badge">2</span>
                </div>
                <h3 className="step-item-title">WE CLEAN</h3>
                <p className="step-item-desc">We wash, dry & care for your clothes.</p>
              </div>

              <div className="step-item">
                <div className="step-icon-container">
                  👔
                  <span className="step-badge">3</span>
                </div>
                <h3 className="step-item-title">WE DELIVER</h3>
                <p className="step-item-desc">Fresh, clean & neatly packed to you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="services-sec">
          <div className="sec-wrap">
            <div className="section-divider">OUR SERVICES</div>
            <h2 className="section-main-title">Services for Every Need</h2>

            <div className="services-mock-grid">
              <div className="service-card-mock" onClick={() => { setPricingCategory('Clothing'); setShowPricingModal(true); }}>
                <div className="s-mock-left">
                  <div className="s-mock-icon-wrap">👕</div>
                  <div className="s-mock-text">
                    <h3>Laundry</h3>
                    <p>Washing & folding for everyday wear.</p>
                  </div>
                </div>
                <ChevronRight className="s-mock-chevron" size={16} />
              </div>

              <div className="service-card-mock" onClick={() => { setPricingCategory('Clothing'); setShowPricingModal(true); }}>
                <div className="s-mock-left">
                  <div className="s-mock-icon-wrap">🥼</div>
                  <div className="s-mock-text">
                    <h3>Dry Cleaning</h3>
                    <p>Gentle care for delicate fabrics.</p>
                  </div>
                </div>
                <ChevronRight className="s-mock-chevron" size={16} />
              </div>

              <div className="service-card-mock" onClick={() => { setPricingCategory('Clothing'); setShowPricingModal(true); }}>
                <div className="s-mock-left">
                  <div className="s-mock-icon-wrap">👔</div>
                  <div className="s-mock-text">
                    <h3>Ironing</h3>
                    <p>Crisp, neat & perfectly pressed.</p>
                  </div>
                </div>
                <ChevronRight className="s-mock-chevron" size={16} />
              </div>

              <div className="service-card-mock" onClick={() => { setPricingCategory('Additional'); setShowPricingModal(true); }}>
                <div className="s-mock-left">
                  <div className="s-mock-icon-wrap">🦠</div>
                  <div className="s-mock-text">
                    <h3>Stain Removal</h3>
                    <p>Tough on stains, gentle on fabrics.</p>
                  </div>
                </div>
                <ChevronRight className="s-mock-chevron" size={16} />
              </div>

              <div className="service-card-mock" onClick={() => { setPricingCategory('Additional'); setShowPricingModal(true); }}>
                <div className="s-mock-left">
                  <div className="s-mock-icon-wrap">👟</div>
                  <div className="s-mock-text">
                    <h3>Shoe & Bag Cleaning</h3>
                    <p>Deep cleaning for shoes, bags & accessories.</p>
                  </div>
                </div>
                <ChevronRight className="s-mock-chevron" size={16} />
              </div>

              <div className="service-card-mock" onClick={() => { setPricingCategory('Household'); setShowPricingModal(true); }}>
                <div className="s-mock-left">
                  <div className="s-mock-icon-wrap">🛵</div>
                  <div className="s-mock-text">
                    <h3>Pickup & Delivery</h3>
                    <p>Free pickup & delivery right to your door.</p>
                  </div>
                </div>
                <ChevronRight className="s-mock-chevron" size={16} />
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── STICKY HELPER FOOTER ── */}
      <footer className="helper-footer">
        <div className="helper-text">
          <span className="helper-phone-icon">📞</span>
          <span>Need help? 0705 815 5555 | 0805 825 5555</span>
        </div>
        <button className="btn-whatsapp-footer" onClick={() => window.open('https://wa.me/2348058255555', '_blank')}>
          💬 WHATSAPP US
        </button>
      </footer>

      {/* ── PRICE CATALOG POPOVER MODAL ── */}
      {showPricingModal && (
        <div className="pricing-modal-overlay" onClick={() => setShowPricingModal(false)}>
          <div className="pricing-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="pricing-modal-close" aria-label="Close pricing catalog" onClick={() => setShowPricingModal(false)}>
              <X size={20} />
            </button>
            
            <div className="section-divider" style={{ marginBottom: '14px' }}>PRICING</div>
            <h3 className="section-main-title" style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}>Service Catalog Rates</h3>

            <div className="pricing-tabs">
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

            {/* Desktop Table */}
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
                        <button className="table-book-btn" onClick={() => { handleBookItem(item.name); setShowPricingModal(false); }}>
                          Book
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
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
                    <button className="p-item-book-btn" onClick={() => { handleBookItem(item.name); setShowPricingModal(false); }}>
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
