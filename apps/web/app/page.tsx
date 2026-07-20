'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Check } from '@/lib/icons';

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
  { icon: '👕', title: 'Wash & Fold',      desc: 'Expert laundering with premium detergents, returned neatly folded.',  color: '#EFF6FF' },
  { icon: '🥼', title: 'Dry Cleaning',     desc: 'Professional care for suits, dresses & delicate fabrics.',            color: '#F0FDF4' },
  { icon: '👔', title: 'Iron & Press',     desc: 'Steam pressing for crisp shirts and formal wear.',                    color: '#FFF7ED' },
  { icon: '👟', title: 'Shoe Cleaning',    desc: 'Deep cleaning & restoration for sneakers and leather shoes.',         color: '#FDF4FF' },
  { icon: '🛏️', title: 'Bedding & Linen', desc: 'Hygienic washing of duvets, sheets and pillow cases.',               color: '#F0FDF4' },
  { icon: '🧥', title: 'Stain Removal',   desc: 'Pre-treatment for stubborn stains — oil, wine, ink and more.',       color: '#FFF1F2' },
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

  const switchView = useCallback((view: View) => {
    if (view === activeView || animating) return;
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

  // Filter dbServices by currently active tab
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

        /* ── NAV — centered logo + links below ── */
        .top-nav {
          position: relative; z-index: 100; flex-shrink: 0;
          display: flex; flex-direction: column; align-items: center;
          padding: 16px 5% 8px;
          gap: 6px;
        }
        .nav-logo { display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .nav-links {
          display: flex; align-items: center; justify-content: center;
          gap: 2px; list-style: none; flex-wrap: wrap;
        }
        .nav-btn {
          padding: 6px 14px; border-radius: 100px; border: none;
          font-size: 13px; font-weight: 500; color: #64748B; cursor: pointer;
          background: transparent; font-family: 'DM Sans', sans-serif;
          transition: all 0.18s; white-space: nowrap;
        }
        .nav-btn:hover { color: #0F172A; background: #F1F5F9; }
        .nav-btn.active { color: #0066FF; background: rgba(0,102,255,0.08); font-weight: 700; }

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
          padding: 16px 5% 24px;
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
      `}} />

      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* ── NAV ── */}
      <header className="top-nav">
        <div className="nav-logo" onClick={() => switchView('home')}>
          <Image src="/bglogo.png" alt="BG Laundry" width={82} height={82} style={{ objectFit: 'contain' }} priority />
        </div>
        <ul className="nav-links">
          {navItems.map(({ key, label }) => (
            <li key={key}>
              <button className={`nav-btn${activeView === key ? ' active' : ''}`} onClick={() => switchView(key)}>
                {label}
              </button>
            </li>
          ))}
        </ul>
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
                    if (s.title.includes('Dry Cleaning')) {
                      setPricingCategory('Clothing');
                    } else if (s.title.includes('Bedding') || s.title.includes('Linen')) {
                      setPricingCategory('Household');
                    } else if (s.title.includes('Shoe') || s.title.includes('Stain')) {
                      setPricingCategory('Additional');
                    }
                    switchView('pricing');
                  }}>
                    View Rates →
                  </button>
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
              <p className="sec-label">Pricing Catalog</p>
              <h2 className="sec-title">Standard Rates</h2>
            </div>
            
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

            <div className="pricing-table-container">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Wash Only</th>
                    <th>Iron Only</th>
                    <th>Wash & Iron</th>
                  </tr>
                </thead>
                <tbody>
                  {displayServices.map((item) => (
                    <tr key={item.name}>
                      <td className="item-name-cell">{item.name}</td>
                      <td className="price-text">{item.hasWash && item.washPrice > 0 ? `₦${item.washPrice.toLocaleString()}` : '—'}</td>
                      <td className="price-text">{item.hasIron && item.ironPrice > 0 ? `₦${item.ironPrice.toLocaleString()}` : '—'}</td>
                      <td className="price-text">{item.hasWashIron && item.washIronPrice > 0 ? `₦${item.washIronPrice.toLocaleString()}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </div>
  );
}
