'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Menu, X, Check } from '@/lib/icons';

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('customerToken'));
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleStart = () => router.push(loggedIn ? '/dashboard' : '/login');
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const services = [
    {
      icon: '👕',
      title: 'Wash & Fold',
      desc: 'Expert laundering with premium detergents. Clothes returned neatly folded and fresh.',
      tags: ['Same day', 'Delicate care'],
    },
    {
      icon: '🥼',
      title: 'Dry Cleaning',
      desc: 'Professional dry cleaning for suits, dresses, and delicate fabrics that require special treatment.',
      tags: ['Specialist care', '48h turnaround'],
    },
    {
      icon: '👔',
      title: 'Iron & Press',
      desc: 'Precision pressing service for crisp shirts, trousers, and formal wear — ready to wear.',
      tags: ['24h service', 'Steam pressed'],
    },
    {
      icon: '👟',
      title: 'Shoe Cleaning',
      desc: 'Deep cleaning and restoration for sneakers, leather shoes, and boots of all styles.',
      tags: ['Restoration', 'All materials'],
    },
    {
      icon: '🛏️',
      title: 'Bedding & Linen',
      desc: 'Hygienic washing and pressing of duvets, bed sheets, pillow cases, and curtains.',
      tags: ['Bulk orders', 'Fresh scent'],
    },
    {
      icon: '🧥',
      title: 'Stain Removal',
      desc: 'Specialist pre-treatment for stubborn stains — oil, wine, ink, and more removed safely.',
      tags: ['Expert treatment', 'Guaranteed'],
    },
  ];

  const plans = [
    {
      name: 'Basic',
      price: '₦2,500',
      per: 'per visit',
      desc: 'Perfect for individuals needing occasional laundry care.',
      features: ['Up to 5kg of laundry', 'Wash & fold service', '48h turnaround', 'Free pickup & delivery'],
      cta: 'Get Started',
      highlight: false,
    },
    {
      name: 'Premium',
      price: '₦5,500',
      per: 'per visit',
      desc: 'Our most popular plan for families and professionals.',
      features: ['Up to 15kg of laundry', 'Wash, fold & iron', '24h express option', 'Free pickup & delivery', 'Priority scheduling', 'SMS & app tracking'],
      cta: 'Get Started',
      highlight: true,
    },
    {
      name: 'Business',
      price: 'Custom',
      per: 'monthly contract',
      desc: 'Tailored solutions for hotels, restaurants, and businesses.',
      features: ['Unlimited volume', 'All services included', 'Dedicated account manager', 'Same-day turnaround', 'Bulk pricing discounts', 'Invoice billing'],
      cta: 'Contact Us',
      highlight: false,
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Schedule a Pickup',
      desc: 'Open the BG Laundry app or website. Choose your service, select a convenient pickup time, and confirm your address.',
      color: '#EEF2FF',
      accent: '#6366F1',
    },
    {
      step: '02',
      title: 'We Collect Your Laundry',
      desc: 'Our professional driver arrives at your door exactly on time. We handle your clothes with the utmost care from the moment we collect them.',
      color: '#F0FDF4',
      accent: '#22C55E',
    },
    {
      step: '03',
      title: 'Expert Cleaning',
      desc: 'Your garments are cleaned using premium products in our state-of-the-art facility. Each item is treated according to its care label.',
      color: '#EFF6FF',
      accent: '#0066FF',
    },
    {
      step: '04',
      title: 'Delivered Fresh',
      desc: 'Clean, fresh, and perfectly pressed clothes are delivered back to your door. Track your order every step of the way.',
      color: '#FFF7ED',
      accent: '#F97316',
    },
  ];

  return (
    <div className="home-container">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { 
          font-family: 'DM Sans', sans-serif; 
          -webkit-font-smoothing: antialiased; 
          overflow-x: hidden;
          background: #FFFFFF;
        }
        .home-container {
          min-height: 100svh;
          display: flex; flex-direction: column;
          position: relative; color: #0F172A;
        }

        /* Orbs */
        @keyframes floatA { 0%,100% { transform: translateY(0) scale(1);} 50% { transform: translateY(-40px) scale(1.08);} }
        @keyframes floatB { 0%,100% { transform: translateY(0) scale(1);} 50% { transform: translateY(28px) scale(0.94);} }
        .bg-orb-1 {
          position: absolute; top: -8%; left: -6%;
          width: 55vw; height: 55vw; max-width: 640px; max-height: 640px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,102,255,0.06) 0%, transparent 70%);
          animation: floatA 14s ease-in-out infinite; pointer-events: none; z-index: 0;
        }
        .bg-orb-2 {
          position: absolute; bottom: -12%; right: -6%;
          width: 65vw; height: 65vw; max-width: 720px; max-height: 720px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
          animation: floatB 17s ease-in-out infinite; pointer-events: none; z-index: 0;
        }

        /* === NAV === */
        .top-nav {
          position: sticky; top: 0; z-index: 200;
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 5%;
          transition: background 0.3s, box-shadow 0.3s;
        }
        .top-nav.scrolled {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 1px 0 rgba(0,0,0,0.06);
        }
        .nav-logo { display: flex; align-items: center; }
        .nav-links {
          display: none; align-items: center; gap: 32px; list-style: none;
        }
        .nav-link {
          font-size: 15px; font-weight: 500; color: #475569;
          text-decoration: none; transition: color 0.2s; cursor: pointer;
          background: none; border: none; font-family: 'DM Sans', sans-serif;
        }
        .nav-link:hover { color: #0F172A; }
        .nav-link-cta {
          font-size: 15px; font-weight: 600; color: #FFFFFF;
          background: #0066FF; padding: 10px 22px; border-radius: 100px;
          text-decoration: none; cursor: pointer;
          border: none; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,102,255,0.25);
        }
        .nav-link-cta:hover { background: #005ce6; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,102,255,0.35); }
        .menu-toggle {
          display: flex; background: transparent;
          border: 1.5px solid #E2E8F0; color: #0F172A;
          cursor: pointer; padding: 8px 10px; border-radius: 10px;
          transition: background 0.2s;
        }
        .menu-toggle:hover { background: #F1F5F9; }
        @media (min-width: 768px) {
          .nav-links { display: flex; }
          .menu-toggle { display: none; }
        }

        /* === DRAWER === */
        .drawer-overlay {
          position: fixed; inset: 0; background: rgba(255,255,255,0.65);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          z-index: 999; opacity: 0; pointer-events: none;
          transition: opacity 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .drawer-overlay.open { opacity: 1; pointer-events: auto; }
        .drawer-menu {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 100%; max-width: 340px;
          background: #fff; border-left: 1px solid rgba(0,0,0,0.05);
          box-shadow: -12px 0 40px rgba(0,0,0,0.08);
          z-index: 1000; padding: 28px;
          transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
          display: flex; flex-direction: column;
        }
        .drawer-menu.open { transform: translateX(0); }
        .drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; }
        .drawer-nav-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
        .drawer-link {
          font-size: 18px; font-weight: 600; color: #475569; text-decoration: none;
          padding: 13px 0; border-bottom: 1px solid #F1F5F9;
          transition: all 0.2s; display: block; cursor: pointer;
          background: none; border-radius: 0; border: none; border-bottom: 1px solid #F1F5F9;
          width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
        }
        .drawer-link:hover { color: #0F172A; padding-left: 6px; }
        .drawer-link-cta {
          margin-top: 20px; display: block; text-align: center;
          background: #0066FF; color: #fff; font-size: 16px; font-weight: 700;
          padding: 14px 24px; border-radius: 100px; text-decoration: none;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .drawer-link-cta:hover { background: #005ce6; }

        /* === HERO === */
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px);} to { opacity:1; transform:translateY(0);} }
        .hero-section {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; align-items: center; text-align: center;
          padding: 80px 5% 100px; position: relative; z-index: 10;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 18px; border-radius: 100px;
          background: rgba(0,102,255,0.07); color: #0066FF;
          font-size: 11px; font-weight: 700; letter-spacing: 1.8px;
          margin-bottom: 32px; border: 1px solid rgba(0,102,255,0.12);
          text-transform: uppercase;
          animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #0066FF; display: inline-block; }
        .hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(44px, 8.5vw, 84px);
          font-weight: 900; color: #0F172A;
          letter-spacing: -2.5px; line-height: 1.04;
          margin-bottom: 24px; max-width: 860px;
          animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .title-accent { color: #0066FF; font-style: italic; }
        .hero-subtitle {
          font-size: clamp(16px, 2vw, 19px); color: #64748B; line-height: 1.75;
          margin-bottom: 48px; font-weight: 400; max-width: 540px;
          animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }
        .cta-group {
          display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap;
          animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        }
        .btn-primary {
          height: 54px; padding: 0 28px; background: #0066FF; color: #fff;
          border: none; border-radius: 100px; font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(0,102,255,0.25); transition: all 0.2s;
        }
        .btn-primary:hover { background: #005ce6; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,102,255,0.35); }
        .btn-secondary {
          height: 54px; padding: 0 28px; background: transparent; color: #334155;
          border: 2px solid #E2E8F0; border-radius: 100px; font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 8px; transition: all 0.2s;
        }
        .btn-secondary:hover { background: #F8FAFC; border-color: #CBD5E1; transform: translateY(-2px); }

        /* === SECTION SHARED === */
        .section { padding: 100px 5%; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          color: #0066FF; margin-bottom: 14px;
        }
        .section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(32px, 5vw, 52px); font-weight: 900;
          color: #0F172A; letter-spacing: -1px; line-height: 1.1; margin-bottom: 16px;
        }
        .section-subtitle {
          font-size: 17px; color: #64748B; line-height: 1.7; max-width: 560px;
          margin-bottom: 64px;
        }
        .section-divider { width: 100%; height: 1px; background: #F1F5F9; }

        /* === SERVICES === */
        .services-bg { background: #FAFAFA; }
        .services-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;
        }
        .service-card {
          background: #FFFFFF; border: 1px solid #F1F5F9;
          border-radius: 20px; padding: 32px;
          transition: all 0.25s ease;
        }
        .service-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.07); border-color: #E2E8F0; }
        .service-icon { font-size: 36px; margin-bottom: 20px; display: block; }
        .service-title { font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 10px; }
        .service-desc { font-size: 15px; color: #64748B; line-height: 1.65; margin-bottom: 20px; }
        .service-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .service-tag {
          font-size: 12px; font-weight: 600; color: #0066FF;
          background: rgba(0,102,255,0.07); padding: 4px 12px; border-radius: 100px;
        }

        /* === PRICING === */
        .pricing-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; align-items: start;
        }
        .pricing-card {
          background: #FFFFFF; border: 1.5px solid #E2E8F0;
          border-radius: 24px; padding: 36px; transition: all 0.25s;
        }
        .pricing-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
        .pricing-card.highlight {
          background: #0066FF; border-color: #0066FF;
          box-shadow: 0 20px 60px rgba(0,102,255,0.3);
        }
        .pricing-card.highlight .pricing-name,
        .pricing-card.highlight .pricing-price,
        .pricing-card.highlight .pricing-desc,
        .pricing-card.highlight .pricing-feature { color: rgba(255,255,255,0.9); }
        .pricing-card.highlight .pricing-name { color: rgba(255,255,255,0.7); }
        .pricing-card.highlight .pricing-price { color: #FFFFFF; }
        .pricing-name { font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #94A3B8; margin-bottom: 16px; }
        .pricing-price { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 900; color: #0F172A; line-height: 1; }
        .pricing-per { font-size: 14px; color: #94A3B8; font-weight: 500; margin-bottom: 16px; }
        .pricing-desc { font-size: 14px; color: #64748B; line-height: 1.6; margin-bottom: 28px; }
        .pricing-features { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .pricing-feature { font-size: 15px; color: #334155; display: flex; align-items: center; gap: 10px; }
        .pricing-check { color: #0066FF; flex-shrink: 0; }
        .pricing-card.highlight .pricing-check { color: rgba(255,255,255,0.8); }
        .pricing-btn {
          width: 100%; height: 48px; border-radius: 100px; font-size: 15px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; transition: all 0.2s;
          background: #0F172A; color: #fff;
        }
        .pricing-btn:hover { background: #1E293B; transform: translateY(-1px); }
        .pricing-card.highlight .pricing-btn { background: #fff; color: #0066FF; }
        .pricing-card.highlight .pricing-btn:hover { background: #F8FAFC; }

        /* === HOW IT WORKS === */
        .works-bg { background: #FAFAFA; }
        .steps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
        .step-card { border-radius: 20px; padding: 32px; }
        .step-number { font-family: 'Playfair Display', serif; font-size: 56px; font-weight: 900; line-height: 1; margin-bottom: 20px; }
        .step-title { font-size: 19px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }
        .step-desc { font-size: 15px; color: #475569; line-height: 1.7; }

        /* === FOOTER === */
        .footer {
          background: #0F172A; color: #94A3B8;
          padding: 48px 5% 32px;
        }
        .footer-inner { max-width: 1100px; margin: 0 auto; }
        .footer-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; margin-bottom: 40px; }
        .footer-brand { display: flex; align-items: center; gap: 12px; }
        .footer-brand-name { font-size: 18px; font-weight: 700; color: #fff; }
        .footer-links { display: flex; gap: 28px; flex-wrap: wrap; }
        .footer-link { font-size: 14px; color: #64748B; text-decoration: none; transition: color 0.2s; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; }
        .footer-link:hover { color: #94A3B8; }
        .footer-bottom { border-top: 1px solid #1E293B; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-copy { font-size: 13px; color: #475569; }
      `}} />

      {/* Background Orbs (hero only) */}
      <div className="bg-orb-1" />
      <div className="bg-orb-2" />

      {/* === STICKY NAV === */}
      <header className={`top-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-logo">
          <Image src="/bglogo.png" alt="BG Laundry" width={72} height={72} style={{ objectFit: 'contain' }} priority />
        </div>
        <ul className="nav-links">
          <li><button className="nav-link" onClick={() => scrollTo('services')}>Services</button></li>
          <li><button className="nav-link" onClick={() => scrollTo('pricing')}>Pricing</button></li>
          <li><button className="nav-link" onClick={() => scrollTo('how-it-works')}>How It Works</button></li>
          <li><button className="nav-link-cta" onClick={handleStart}>Get Started</button></li>
        </ul>
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Open Menu">
          <Menu size={22} />
        </button>
      </header>

      {/* === MOBILE DRAWER === */}
      <div className={`drawer-overlay${isMenuOpen ? ' open' : ''}`} onClick={toggleMenu} />
      <aside className={`drawer-menu${isMenuOpen ? ' open' : ''}`}>
        <div className="drawer-header">
          <Image src="/bglogo.png" alt="BG Laundry" width={52} height={52} style={{ objectFit: 'contain' }} />
          <button className="menu-toggle" onClick={toggleMenu} aria-label="Close Menu"><X size={22} /></button>
        </div>
        <ul className="drawer-nav-list">
          <li><button className="drawer-link" onClick={() => scrollTo('services')}>Services</button></li>
          <li><button className="drawer-link" onClick={() => scrollTo('pricing')}>Pricing</button></li>
          <li><button className="drawer-link" onClick={() => scrollTo('how-it-works')}>How It Works</button></li>
          <li><a href="/login" className="drawer-link-cta" onClick={toggleMenu}>Get Started →</a></li>
        </ul>
      </aside>

      {/* === HERO SECTION === */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Lagos&apos; Premier Laundry Service
        </div>
        <h1 className="hero-title">
          Premium Laundry.<br />
          Delivered to <span className="title-accent">Your Door.</span>
        </h1>
        <p className="hero-subtitle">
          Experience world-class garment care without leaving your home. Schedule a pickup, track your order, and receive clothes that look and feel brand new.
        </p>
        <div className="cta-group">
          <button className="btn-primary" onClick={handleStart}>
            Get Started <ArrowRight size={18} />
          </button>
          <button className="btn-secondary" onClick={() => scrollTo('services')}>
            Explore Services
          </button>
        </div>
      </section>

      <div className="section-divider" />

      {/* === SERVICES SECTION === */}
      <section id="services" className="section services-bg">
        <div className="section-inner">
          <p className="section-label">What We Offer</p>
          <h2 className="section-title">Services Tailored<br />for Every Need</h2>
          <p className="section-subtitle">From everyday wash & fold to specialist dry cleaning — we handle it all with precision and care.</p>
          <div className="services-grid">
            {services.map((s) => (
              <div key={s.title} className="service-card">
                <span className="service-icon">{s.icon}</span>
                <h3 className="service-title">{s.title}</h3>
                <p className="service-desc">{s.desc}</p>
                <div className="service-tags">
                  {s.tags.map((t) => <span key={t} className="service-tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* === PRICING SECTION === */}
      <section id="pricing" className="section">
        <div className="section-inner">
          <p className="section-label">Simple Pricing</p>
          <h2 className="section-title">Clear, Honest Pricing.<br />No Surprises.</h2>
          <p className="section-subtitle">Choose the plan that fits your lifestyle. All plans include free pickup and delivery anywhere in Lagos.</p>
          <div className="pricing-grid">
            {plans.map((p) => (
              <div key={p.name} className={`pricing-card${p.highlight ? ' highlight' : ''}`}>
                <p className="pricing-name">{p.name}</p>
                <p className="pricing-price">{p.price}</p>
                <p className="pricing-per">{p.per}</p>
                <p className="pricing-desc">{p.desc}</p>
                <ul className="pricing-features">
                  {p.features.map((f) => (
                    <li key={f} className="pricing-feature">
                      <span className="pricing-check"><Check size={16} strokeWidth={2.5} /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="pricing-btn" onClick={handleStart}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* === HOW IT WORKS SECTION === */}
      <section id="how-it-works" className="section works-bg">
        <div className="section-inner">
          <p className="section-label">The Process</p>
          <h2 className="section-title">From Your Door.<br />Back to Your Door.</h2>
          <p className="section-subtitle">Four simple steps stand between you and perfectly clean clothes — and we handle most of them.</p>
          <div className="steps-grid">
            {steps.map((s) => (
              <div key={s.step} className="step-card" style={{ background: s.color }}>
                <p className="step-number" style={{ color: s.accent }}>{s.step}</p>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <Image src="/bglogo.png" alt="BG Laundry" width={44} height={44} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <span className="footer-brand-name">BG Laundry</span>
            </div>
            <nav className="footer-links">
              <button className="footer-link" onClick={() => scrollTo('services')}>Services</button>
              <button className="footer-link" onClick={() => scrollTo('pricing')}>Pricing</button>
              <button className="footer-link" onClick={() => scrollTo('how-it-works')}>How It Works</button>
              <a href="/login" className="footer-link">Customer Login</a>
            </nav>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© {new Date().getFullYear()} BG Laundry & Dry Cleaning · Lagos, Nigeria</p>
            <p className="footer-copy">Premium · Reliable · On Time</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
