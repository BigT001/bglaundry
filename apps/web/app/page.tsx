'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Menu, X, Check } from '@/lib/icons';

type View = 'home' | 'services' | 'pricing' | 'how-it-works';

const services = [
  { icon: '👕', title: 'Wash & Fold',      desc: 'Expert laundering with premium detergents, returned neatly folded.',  tags: ['Same Day', 'Delicate Care'],      color: '#EFF6FF' },
  { icon: '🥼', title: 'Dry Cleaning',     desc: 'Professional care for suits, dresses & delicate fabrics.',            tags: ['Specialist', '48h Turnaround'],   color: '#F0FDF4' },
  { icon: '👔', title: 'Iron & Press',     desc: 'Steam pressing for crisp shirts and formal wear.',                    tags: ['24h', 'Steam Pressed'],           color: '#FFF7ED' },
  { icon: '👟', title: 'Shoe Cleaning',    desc: 'Deep cleaning & restoration for sneakers and leather shoes.',         tags: ['Restoration', 'All Materials'],   color: '#FDF4FF' },
  { icon: '🛏️', title: 'Bedding & Linen', desc: 'Hygienic washing of duvets, sheets and pillow cases.',               tags: ['Bulk Orders', 'Fresh Scent'],     color: '#F0FDF4' },
  { icon: '🧥', title: 'Stain Removal',   desc: 'Pre-treatment for stubborn stains — oil, wine, ink and more.',       tags: ['Guaranteed', 'Safe Removal'],    color: '#FFF1F2' },
];

const plans = [
  {
    name: 'Basic', price: '₦2,500', per: 'per visit',
    desc: 'For individuals needing occasional laundry care.',
    features: ['Up to 5kg', 'Wash & fold', '48h turnaround', 'Free pickup & delivery'],
    highlight: false, cta: 'Get Started',
  },
  {
    name: 'Premium', price: '₦5,500', per: 'per visit',
    desc: 'Most popular — for families & professionals.',
    features: ['Up to 15kg', 'Wash, fold & iron', '24h express', 'Free pickup & delivery', 'Priority slot', 'App tracking'],
    highlight: true, cta: 'Get Started',
  },
  {
    name: 'Business', price: 'Custom', per: 'monthly contract',
    desc: 'For hotels, restaurants & growing businesses.',
    features: ['Unlimited volume', 'All services', 'Dedicated manager', 'Same-day option', 'Bulk discount', 'Invoice billing'],
    highlight: false, cta: 'Contact Us',
  },
];

const steps = [
  { step: '01', title: 'Schedule',    desc: 'Choose your service and select a convenient pickup time.',         color: '#EEF2FF', accent: '#6366F1', icon: '📅' },
  { step: '02', title: 'We Collect', desc: 'Our driver arrives on time and handles your clothes with care.',   color: '#F0FDF4', accent: '#16A34A', icon: '🚚' },
  { step: '03', title: 'We Clean',   desc: 'Items cleaned with premium products in our expert facility.',     color: '#EFF6FF', accent: '#0066FF', icon: '✨' },
  { step: '04', title: 'Delivered',  desc: 'Fresh, pressed clothes returned straight to your door.',          color: '#FFF7ED', accent: '#EA580C', icon: '📦' },
];

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn]       = useState(false);
  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [activeView, setActiveView]   = useState<View>('home');
  const [animating, setAnimating]     = useState(false);
  const [displayedView, setDisplayedView] = useState<View>('home');

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('customerToken'));
  }, []);

  const switchView = useCallback((view: View) => {
    if (view === activeView || animating) return;
    setIsMenuOpen(false);
    setAnimating(true);
    setTimeout(() => {
      setDisplayedView(view);
      setActiveView(view);
      setAnimating(false);
    }, 280);
  }, [activeView, animating]);

  const handleStart = () => router.push(loggedIn ? '/dashboard' : '/login');

  const navItems: { key: View; label: string }[] = [
    { key: 'home',         label: 'Home' },
    { key: 'services',     label: 'Services' },
    { key: 'pricing',      label: 'Pricing' },
    { key: 'how-it-works', label: 'How It Works' },
  ];

  const isVisible = (v: View) => v === displayedView || v === activeView;

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

        /* ── NAV ── */
        .top-nav {
          position: relative; z-index: 100; flex-shrink: 0;
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 5%;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        }
        .nav-logo { display: flex; align-items: center; cursor: pointer; }
        .nav-links { display: none; align-items: center; gap: 2px; list-style: none; }
        .nav-btn {
          padding: 7px 14px; border-radius: 100px; border: none;
          font-size: 14px; font-weight: 500; color: #64748B; cursor: pointer;
          background: transparent; font-family: 'DM Sans', sans-serif;
          transition: all 0.18s;
        }
        .nav-btn:hover { color: #0F172A; background: #F1F5F9; }
        .nav-btn.active { color: #0066FF; background: rgba(0,102,255,0.08); font-weight: 700; }
        .nav-cta {
          margin-left: 10px; padding: 9px 20px; border-radius: 100px; border: none;
          font-size: 14px; font-weight: 700; color: #fff; cursor: pointer;
          background: #0066FF; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(0,102,255,0.28); transition: all 0.18s;
        }
        .nav-cta:hover { background: #005ce6; transform: translateY(-1px); }
        .hamburger {
          display: flex; background: transparent; border: 1.5px solid #E2E8F0;
          color: #0F172A; cursor: pointer; padding: 7px 9px; border-radius: 10px;
          transition: background 0.18s;
        }
        .hamburger:hover { background: #F1F5F9; }
        @media (min-width: 768px) {
          .nav-links { display: flex; }
          .hamburger { display: none; }
        }

        /* ── DRAWER ── */
        .overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          opacity: 0; pointer-events: none;
          transition: opacity 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .overlay.open { opacity: 1; pointer-events: auto; }
        .drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 100%; max-width: 300px;
          background: #fff; z-index: 1000; padding: 24px;
          border-left: 1px solid rgba(0,0,0,0.05);
          box-shadow: -12px 0 40px rgba(0,0,0,0.08);
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.42s cubic-bezier(0.16,1,0.3,1);
        }
        .drawer.open { transform: translateX(0); }
        .drawer-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .drawer-list { list-style: none; display: flex; flex-direction: column; gap: 2px; }
        .drawer-item {
          font-size: 17px; font-weight: 600; color: #475569;
          padding: 12px 0; border-bottom: 1px solid #F1F5F9;
          cursor: pointer; background: none; border-top: none; border-left: none; border-right: none;
          width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
          transition: all 0.18s;
        }
        .drawer-item:hover, .drawer-item.active { color: #0066FF; padding-left: 6px; }
        .drawer-cta {
          margin-top: 20px; padding: 13px; border-radius: 100px; border: none;
          background: #0066FF; color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.18s;
        }
        .drawer-cta:hover { background: #005ce6; }

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
          padding: 16px 5%;
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
          font-size: clamp(36px, 7vw, 78px); font-weight: 900;
          color: #0F172A; letter-spacing: -2.5px; line-height: 1.04;
          margin-bottom: 18px;
          animation: fadeUp 0.6s ease 0.08s both;
        }
        .hero-accent { color: #0066FF; font-style: italic; }
        .hero-sub {
          font-size: clamp(14px, 1.8vw, 18px); color: #64748B; line-height: 1.7;
          margin-bottom: 36px; max-width: 500px;
          animation: fadeUp 0.6s ease 0.16s both;
        }
        .ctas {
          display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
          animation: fadeUp 0.6s ease 0.22s both;
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
        /* Always 2-column on mobile, 3-column on desktop */
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
        .s-name { font-size: 13px; font-weight: 800; color: #0F172A; line-height: 1.2; }
        .s-desc { font-size: 11px; color: #475569; line-height: 1.5; flex: 1; margin-bottom: 8px; }
        .s-tags { display: flex; gap: 5px; flex-wrap: wrap; }
        .s-tag {
          font-size: 10px; font-weight: 700; color: #0066FF;
          background: rgba(0,102,255,0.08); padding: 2px 8px; border-radius: 100px;
        }

        /* ── PRICING GRID ── */
        .pricing-grid {
          flex: 1; min-height: 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px; align-items: stretch;
        }
        @media (max-width: 600px) {
          .pricing-grid { grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr); }
        }
        .p-card {
          border-radius: 16px; padding: 16px;
          background: #FAFBFC; border: 1.5px solid #E2E8F0;
          display: flex; flex-direction: column;
          transition: all 0.2s;
        }
        .p-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
        .p-card.hl {
          background: #0066FF; border-color: #0066FF;
          box-shadow: 0 14px 40px rgba(0,102,255,0.3);
        }
        .p-name {
          font-size: 10px; font-weight: 800; letter-spacing: 2px;
          text-transform: uppercase; color: #94A3B8; margin-bottom: 8px;
        }
        .p-card.hl .p-name { color: rgba(255,255,255,0.6); }
        .p-price {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 3.5vw, 36px); font-weight: 900; color: #0F172A; line-height: 1;
        }
        .p-card.hl .p-price { color: #fff; }
        .p-per { font-size: 11px; color: #94A3B8; margin-bottom: 8px; }
        .p-card.hl .p-per { color: rgba(255,255,255,0.6); }
        .p-desc { font-size: 12px; color: #64748B; line-height: 1.5; margin-bottom: 10px; }
        .p-card.hl .p-desc { color: rgba(255,255,255,0.75); }
        .p-features {
          list-style: none; display: flex; flex-direction: column; gap: 5px;
          margin-bottom: 14px; flex: 1;
        }
        .p-feat { font-size: 12px; color: #334155; display: flex; align-items: flex-start; gap: 6px; }
        .p-card.hl .p-feat { color: rgba(255,255,255,0.85); }
        .p-check { color: #0066FF; flex-shrink: 0; margin-top: 1px; }
        .p-card.hl .p-check { color: rgba(255,255,255,0.8); }
        .p-btn {
          width: 100%; height: 40px; border-radius: 100px; border: none;
          font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          cursor: pointer; background: #0F172A; color: #fff; transition: all 0.2s;
        }
        .p-btn:hover { background: #1E293B; }
        .p-card.hl .p-btn { background: #fff; color: #0066FF; }
        .p-card.hl .p-btn:hover { background: #F0F4FF; }

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
        .step-title { font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
        .step-desc { font-size: 12px; color: #475569; line-height: 1.6; }

        /* ── FOOTER BAR ── */
        .foot {
          flex-shrink: 0; z-index: 50; position: relative;
          padding: 10px 5%;
          border-top: 1px solid rgba(0,0,0,0.04);
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        }
        .foot-copy { font-size: 11px; color: #94A3B8; }
        .foot-links { display: flex; gap: 16px; }
        .foot-link {
          font-size: 11px; color: #CBD5E1; text-decoration: none; cursor: pointer;
          background: none; border: none; font-family: 'DM Sans', sans-serif; transition: color 0.2s;
        }
        .foot-link:hover { color: #64748B; }
      `}} />

      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* ── NAV ── */}
      <header className="top-nav">
        <div className="nav-logo" onClick={() => switchView('home')}>
          <Image src="/bglogo.png" alt="BG Laundry" width={68} height={68} style={{ objectFit: 'contain' }} priority />
        </div>
        <ul className="nav-links">
          {navItems.map(({ key, label }) => (
            <li key={key}>
              <button className={`nav-btn${activeView === key ? ' active' : ''}`} onClick={() => switchView(key)}>
                {label}
              </button>
            </li>
          ))}
          <li><button className="nav-cta" onClick={handleStart}>Get Started</button></li>
        </ul>
        <button className="hamburger" onClick={() => setIsMenuOpen(true)} aria-label="Menu">
          <Menu size={20} />
        </button>
      </header>

      {/* ── DRAWER ── */}
      <div className={`overlay${isMenuOpen ? ' open' : ''}`} onClick={() => setIsMenuOpen(false)} />
      <aside className={`drawer${isMenuOpen ? ' open' : ''}`}>
        <div className="drawer-head">
          <Image src="/bglogo.png" alt="BG Laundry" width={50} height={50} style={{ objectFit: 'contain' }} />
          <button className="hamburger" onClick={() => setIsMenuOpen(false)} aria-label="Close"><X size={20} /></button>
        </div>
        <ul className="drawer-list">
          {navItems.map(({ key, label }) => (
            <li key={key}>
              <button className={`drawer-item${activeView === key ? ' active' : ''}`} onClick={() => switchView(key)}>
                {label}
              </button>
            </li>
          ))}
        </ul>
        <button className="drawer-cta" onClick={() => { setIsMenuOpen(false); handleStart(); }}>
          Get Started →
        </button>
      </aside>

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
                  <div className="s-tags">
                    {s.tags.map((t) => <span key={t} className="s-tag">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRICING */}
        <div className={`view${displayedView === 'pricing' ? (animating ? ' exiting' : ' entering') : ' exiting'}`}
          style={{ display: isVisible('pricing') ? 'flex' : 'none', alignItems: 'stretch' }}>
          <div className="sec-wrap">
            <div className="sec-head">
              <p className="sec-label">Simple Pricing</p>
              <h2 className="sec-title">Honest Pricing. No Surprises.</h2>
            </div>
            <div className="pricing-grid">
              {plans.map((p) => (
                <div key={p.name} className={`p-card${p.highlight ? ' hl' : ''}`}>
                  <p className="p-name">{p.name}</p>
                  <p className="p-price">{p.price}</p>
                  <p className="p-per">{p.per}</p>
                  <p className="p-desc">{p.desc}</p>
                  <ul className="p-features">
                    {p.features.map((f) => (
                      <li key={f} className="p-feat">
                        <span className="p-check"><Check size={12} strokeWidth={3} /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className="p-btn" onClick={handleStart}>{p.cta}</button>
                </div>
              ))}
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

      {/* ── FOOTER BAR ── */}
      <footer className="foot">
        <p className="foot-copy">© {new Date().getFullYear()} BG Laundry · Lagos, Nigeria</p>
        <nav className="foot-links">
          <button className="foot-link" onClick={() => switchView('services')}>Services</button>
          <button className="foot-link" onClick={() => switchView('pricing')}>Pricing</button>
          <button className="foot-link" onClick={() => switchView('how-it-works')}>How It Works</button>
          <a href="/login" className="foot-link">Login</a>
        </nav>
      </footer>
    </div>
  );
}
