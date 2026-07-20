'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Menu, X, Check } from '@/lib/icons';

type View = 'home' | 'services' | 'pricing' | 'how-it-works';

const services = [
  { icon: '👕', title: 'Wash & Fold', desc: 'Expert laundering with premium detergents. Returned neatly folded and fresh.', tags: ['Same Day', 'Delicate Care'] },
  { icon: '🥼', title: 'Dry Cleaning', desc: 'Professional care for suits, dresses and delicate fabrics requiring specialist treatment.', tags: ['Specialist Care', '48h Turnaround'] },
  { icon: '👔', title: 'Iron & Press', desc: 'Precision steam pressing for crisp shirts, trousers and formal wear — ready to wear.', tags: ['24h Service', 'Steam Pressed'] },
  { icon: '👟', title: 'Shoe Cleaning', desc: 'Deep cleaning and restoration for sneakers, leather shoes and boots of all styles.', tags: ['Restoration', 'All Materials'] },
  { icon: '🛏️', title: 'Bedding & Linen', desc: 'Hygienic washing and pressing of duvets, sheets, pillow cases and curtains.', tags: ['Bulk Orders', 'Fresh Scent'] },
  { icon: '🧥', title: 'Stain Removal', desc: 'Specialist pre-treatment for stubborn stains — oil, wine, ink and more, removed safely.', tags: ['Expert Treatment', 'Guaranteed'] },
];

const plans = [
  {
    name: 'Basic', price: '₦2,500', per: 'per visit',
    desc: 'Perfect for individuals needing occasional laundry care.',
    features: ['Up to 5kg of laundry', 'Wash & fold service', '48h turnaround', 'Free pickup & delivery'],
    highlight: false, cta: 'Get Started',
  },
  {
    name: 'Premium', price: '₦5,500', per: 'per visit',
    desc: 'Our most popular plan for families and professionals.',
    features: ['Up to 15kg of laundry', 'Wash, fold & iron', '24h express option', 'Free pickup & delivery', 'Priority scheduling', 'SMS & app tracking'],
    highlight: true, cta: 'Get Started',
  },
  {
    name: 'Business', price: 'Custom', per: 'monthly contract',
    desc: 'Tailored solutions for hotels, restaurants and businesses.',
    features: ['Unlimited volume', 'All services included', 'Dedicated account manager', 'Same-day turnaround', 'Bulk pricing discounts', 'Invoice billing'],
    highlight: false, cta: 'Contact Us',
  },
];

const steps = [
  { step: '01', title: 'Schedule a Pickup', desc: 'Choose your service, select a pickup time and confirm your address in seconds.', color: '#EEF2FF', accent: '#6366F1' },
  { step: '02', title: 'We Collect Your Items', desc: 'Our driver arrives at your door exactly on time and handles your clothes with care.', color: '#F0FDF4', accent: '#16A34A' },
  { step: '03', title: 'Expert Cleaning', desc: 'Your garments are cleaned using premium products in our state-of-the-art facility.', color: '#EFF6FF', accent: '#0066FF' },
  { step: '04', title: 'Delivered Fresh', desc: 'Clean, pressed clothes are delivered back. Track your order every step of the way.', color: '#FFF7ED', accent: '#EA580C' },
];

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>('home');
  const [animating, setAnimating] = useState(false);
  const [displayedView, setDisplayedView] = useState<View>('home');

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('customerToken'));
  }, []);

  const switchView = useCallback((view: View) => {
    if (view === activeView || animating) return;
    setIsMenuOpen(false);
    setAnimating(true);
    // fade out → swap → fade in
    setTimeout(() => {
      setDisplayedView(view);
      setActiveView(view);
      setAnimating(false);
    }, 320);
  }, [activeView, animating]);

  const handleStart = () => router.push(loggedIn ? '/dashboard' : '/login');

  const navItems: { key: View; label: string }[] = [
    { key: 'home', label: 'Home' },
    { key: 'services', label: 'Services' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'how-it-works', label: 'How It Works' },
  ];

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
          background: #FFFFFF; color: #0F172A;
        }

        /* ── SHELL ── */
        .shell {
          height: 100svh; display: flex; flex-direction: column;
          position: relative; overflow: hidden; background: #fff;
        }

        /* Ambient orbs */
        @keyframes floatA { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-30px) scale(1.06);} }
        @keyframes floatB { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(22px) scale(0.95);} }
        .orb {
          position: absolute; border-radius: 50%;
          pointer-events: none; z-index: 0;
        }
        .orb-1 {
          width: 60vw; height: 60vw; max-width: 700px; max-height: 700px;
          top: -15%; left: -10%;
          background: radial-gradient(circle, rgba(0,102,255,0.06) 0%, transparent 70%);
          animation: floatA 14s ease-in-out infinite;
        }
        .orb-2 {
          width: 70vw; height: 70vw; max-width: 800px; max-height: 800px;
          bottom: -20%; right: -12%;
          background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%);
          animation: floatB 18s ease-in-out infinite;
        }

        /* ── NAV ── */
        .top-nav {
          position: relative; z-index: 100;
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 5%;
          border-bottom: 1px solid rgba(0,0,0,0.04);
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          flex-shrink: 0;
        }
        .nav-logo { display: flex; align-items: center; cursor: pointer; }
        .nav-links { display: none; align-items: center; gap: 4px; list-style: none; }
        .nav-btn {
          padding: 8px 16px; border-radius: 100px; border: none;
          font-size: 14px; font-weight: 500; color: #64748B; cursor: pointer;
          background: transparent; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .nav-btn:hover { color: #0F172A; background: #F1F5F9; }
        .nav-btn.active { color: #0066FF; background: rgba(0,102,255,0.08); font-weight: 700; }
        .nav-cta {
          margin-left: 12px; padding: 10px 22px; border-radius: 100px; border: none;
          font-size: 14px; font-weight: 700; color: #fff; cursor: pointer;
          background: #0066FF; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(0,102,255,0.3);
          transition: all 0.2s;
        }
        .nav-cta:hover { background: #005ce6; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,102,255,0.35); }
        .hamburger {
          display: flex; background: transparent; border: 1.5px solid #E2E8F0;
          color: #0F172A; cursor: pointer; padding: 8px 10px; border-radius: 10px;
          transition: background 0.2s;
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
          width: 100%; max-width: 320px;
          background: #fff; z-index: 1000; padding: 28px;
          border-left: 1px solid rgba(0,0,0,0.05);
          box-shadow: -12px 0 40px rgba(0,0,0,0.08);
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        .drawer.open { transform: translateX(0); }
        .drawer-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .drawer-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
        .drawer-item {
          font-size: 18px; font-weight: 600; color: #475569;
          padding: 13px 0; border-bottom: 1px solid #F1F5F9;
          cursor: pointer; background: none; border-top: none; border-left: none; border-right: none;
          width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .drawer-item:hover, .drawer-item.active { color: #0066FF; padding-left: 6px; }
        .drawer-cta {
          margin-top: 24px; padding: 14px; border-radius: 100px; border: none;
          background: #0066FF; color: #fff; font-size: 16px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .drawer-cta:hover { background: #005ce6; }

        /* ── VIEW PANEL ── */
        .panel {
          flex: 1; position: relative; z-index: 10; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .view {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 24px 5%;
          transition: opacity 0.32s ease, transform 0.32s cubic-bezier(0.16,1,0.3,1);
        }
        .view.entering { opacity: 1; transform: translateY(0); }
        .view.exiting { opacity: 0; transform: translateY(12px); pointer-events: none; }

        /* ── HOME VIEW ── */
        .hero { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 800px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px);} to { opacity:1; transform:translateY(0);} }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 16px; border-radius: 100px;
          background: rgba(0,102,255,0.07); color: #0066FF;
          font-size: 11px; font-weight: 800; letter-spacing: 2px;
          margin-bottom: 28px; border: 1px solid rgba(0,102,255,0.12);
          text-transform: uppercase;
          animation: fadeUp 0.6s ease both;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #0066FF; }
        .hero-h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(40px, 7.5vw, 80px); font-weight: 900;
          color: #0F172A; letter-spacing: -2.5px; line-height: 1.04;
          margin-bottom: 20px;
          animation: fadeUp 0.6s ease 0.08s both;
        }
        .hero-accent { color: #0066FF; font-style: italic; }
        .hero-sub {
          font-size: clamp(15px, 1.8vw, 18px); color: #64748B; line-height: 1.75;
          margin-bottom: 40px; max-width: 520px;
          animation: fadeUp 0.6s ease 0.16s both;
        }
        .ctas {
          display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
          animation: fadeUp 0.6s ease 0.24s both;
        }
        .btn-p {
          height: 52px; padding: 0 28px; background: #0066FF; color: #fff;
          border: none; border-radius: 100px; font-size: 15px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(0,102,255,0.25); transition: all 0.2s;
        }
        .btn-p:hover { background: #005ce6; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,102,255,0.35); }
        .btn-s {
          height: 52px; padding: 0 28px; background: transparent; color: #334155;
          border: 2px solid #E2E8F0; border-radius: 100px; font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 8px; transition: all 0.2s;
        }
        .btn-s:hover { background: #F8FAFC; border-color: #CBD5E1; transform: translateY(-2px); }

        /* ── SERVICES VIEW ── */
        .view-inner { width: 100%; max-width: 1100px; }
        .view-title-area { margin-bottom: 36px; }
        .view-label {
          font-size: 11px; font-weight: 800; letter-spacing: 2px;
          text-transform: uppercase; color: #0066FF; margin-bottom: 8px;
        }
        .view-h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 44px); font-weight: 900;
          color: #0F172A; letter-spacing: -1px; line-height: 1.1;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .services-grid { grid-template-columns: 1fr; } }
        .s-card {
          background: #FAFBFC; border: 1px solid #F1F5F9;
          border-radius: 16px; padding: 22px;
          transition: all 0.22s;
        }
        .s-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.07); border-color: #E2E8F0; background: #fff; }
        .s-icon { font-size: 28px; margin-bottom: 12px; display: block; }
        .s-name { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 6px; }
        .s-desc { font-size: 13px; color: #64748B; line-height: 1.6; margin-bottom: 12px; }
        .s-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .s-tag { font-size: 11px; font-weight: 700; color: #0066FF; background: rgba(0,102,255,0.07); padding: 3px 10px; border-radius: 100px; }

        /* ── PRICING VIEW ── */
        .pricing-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: start;
        }
        @media (max-width: 900px) { .pricing-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .pricing-grid { grid-template-columns: 1fr; } }
        .p-card {
          background: #FAFBFC; border: 1.5px solid #E2E8F0;
          border-radius: 20px; padding: 28px; transition: all 0.22s;
        }
        .p-card:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(0,0,0,0.08); }
        .p-card.hl { background: #0066FF; border-color: #0066FF; box-shadow: 0 16px 48px rgba(0,102,255,0.3); }
        .p-name { font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #94A3B8; margin-bottom: 12px; }
        .p-card.hl .p-name { color: rgba(255,255,255,0.6); }
        .p-price { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 900; color: #0F172A; line-height: 1; }
        .p-card.hl .p-price { color: #fff; }
        .p-per { font-size: 13px; color: #94A3B8; margin-bottom: 12px; }
        .p-card.hl .p-per { color: rgba(255,255,255,0.6); }
        .p-desc { font-size: 13px; color: #64748B; line-height: 1.55; margin-bottom: 18px; }
        .p-card.hl .p-desc { color: rgba(255,255,255,0.75); }
        .p-features { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px; }
        .p-feat { font-size: 13px; color: #334155; display: flex; align-items: center; gap: 8px; }
        .p-card.hl .p-feat { color: rgba(255,255,255,0.85); }
        .p-check { color: #0066FF; flex-shrink: 0; }
        .p-card.hl .p-check { color: rgba(255,255,255,0.8); }
        .p-btn {
          width: 100%; height: 44px; border-radius: 100px; border: none;
          font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          cursor: pointer; background: #0F172A; color: #fff; transition: all 0.2s;
        }
        .p-btn:hover { background: #1E293B; transform: translateY(-1px); }
        .p-card.hl .p-btn { background: #fff; color: #0066FF; }
        .p-card.hl .p-btn:hover { background: #F0F4FF; }

        /* ── HOW IT WORKS VIEW ── */
        .steps-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        @media (max-width: 900px) { .steps-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .steps-grid { grid-template-columns: 1fr; } }
        .step-card { border-radius: 18px; padding: 26px; }
        .step-num { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 900; line-height: 1; margin-bottom: 16px; }
        .step-title { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
        .step-desc { font-size: 13px; color: #475569; line-height: 1.65; }

        /* ── FOOTER BAR ── */
        .foot {
          flex-shrink: 0; z-index: 50; position: relative;
          padding: 14px 5%;
          border-top: 1px solid rgba(0,0,0,0.04);
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        }
        .foot-copy { font-size: 12px; color: #94A3B8; }
        .foot-links { display: flex; gap: 20px; }
        .foot-link { font-size: 12px; color: #CBD5E1; text-decoration: none; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; transition: color 0.2s; }
        .foot-link:hover { color: #64748B; }
      `}} />

      {/* Ambient Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* ── NAV ── */}
      <header className="top-nav">
        <div className="nav-logo" onClick={() => switchView('home')}>
          <Image src="/bglogo.png" alt="BG Laundry" width={76} height={76} style={{ objectFit: 'contain' }} priority />
        </div>
        <ul className="nav-links">
          {navItems.map(({ key, label }) => (
            <li key={key}>
              <button
                className={`nav-btn${activeView === key ? ' active' : ''}`}
                onClick={() => switchView(key)}
              >
                {label}
              </button>
            </li>
          ))}
          <li>
            <button className="nav-cta" onClick={handleStart}>Get Started</button>
          </li>
        </ul>
        <button className="hamburger" onClick={() => setIsMenuOpen(true)} aria-label="Menu">
          <Menu size={22} />
        </button>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <div className={`overlay${isMenuOpen ? ' open' : ''}`} onClick={() => setIsMenuOpen(false)} />
      <aside className={`drawer${isMenuOpen ? ' open' : ''}`}>
        <div className="drawer-head">
          <Image src="/bglogo.png" alt="BG Laundry" width={52} height={52} style={{ objectFit: 'contain' }} />
          <button className="hamburger" onClick={() => setIsMenuOpen(false)} aria-label="Close">
            <X size={22} />
          </button>
        </div>
        <ul className="drawer-list">
          {navItems.map(({ key, label }) => (
            <li key={key}>
              <button
                className={`drawer-item${activeView === key ? ' active' : ''}`}
                onClick={() => switchView(key)}
              >
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
          style={{ display: displayedView === 'home' || activeView === 'home' ? 'flex' : 'none' }}>
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
                Get Started <ArrowRight size={17} />
              </button>
              <button className="btn-s" onClick={() => switchView('services')}>
                Explore Services
              </button>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <div className={`view${displayedView === 'services' ? (animating ? ' exiting' : ' entering') : ' exiting'}`}
          style={{ display: displayedView === 'services' || activeView === 'services' ? 'flex' : 'none', alignItems: 'flex-start', overflowY: 'auto', paddingTop: '32px', paddingBottom: '24px' }}>
          <div className="view-inner">
            <div className="view-title-area">
              <p className="view-label">What We Offer</p>
              <h2 className="view-h2">Services Tailored for Every Need</h2>
            </div>
            <div className="services-grid">
              {services.map((s) => (
                <div key={s.title} className="s-card">
                  <span className="s-icon">{s.icon}</span>
                  <h3 className="s-name">{s.title}</h3>
                  <p className="s-desc">{s.desc}</p>
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
          style={{ display: displayedView === 'pricing' || activeView === 'pricing' ? 'flex' : 'none', alignItems: 'flex-start', overflowY: 'auto', paddingTop: '32px', paddingBottom: '24px' }}>
          <div className="view-inner">
            <div className="view-title-area">
              <p className="view-label">Simple Pricing</p>
              <h2 className="view-h2">Clear, Honest Pricing. No Surprises.</h2>
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
                        <span className="p-check"><Check size={14} strokeWidth={2.5} /></span>
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
          style={{ display: displayedView === 'how-it-works' || activeView === 'how-it-works' ? 'flex' : 'none', alignItems: 'flex-start', overflowY: 'auto', paddingTop: '32px', paddingBottom: '24px' }}>
          <div className="view-inner">
            <div className="view-title-area">
              <p className="view-label">The Process</p>
              <h2 className="view-h2">From Your Door. Back to Your Door.</h2>
            </div>
            <div className="steps-grid">
              {steps.map((s) => (
                <div key={s.step} className="step-card" style={{ background: s.color }}>
                  <p className="step-num" style={{ color: s.accent }}>{s.step}</p>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER BAR ── */}
      <footer className="foot">
        <p className="foot-copy">© {new Date().getFullYear()} BG Laundry & Dry Cleaning · Lagos, Nigeria</p>
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
