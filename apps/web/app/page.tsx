'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, PhoneCall, Star, ChevronDown,
  Shirt, Wind, Flame, Droplets, WashingMachine, Layers
} from 'lucide-react';

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
function Reveal({ children, delay = 0, from = 'bottom' }: {
  children: React.ReactNode;
  delay?: number;
  from?: 'bottom' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const tx = from === 'left' ? 'translateX(-32px)' : from === 'right' ? 'translateX(32px)' : 'translateY(28px)';
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : tx, transition: `opacity 0.9s ease ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect();
        let start = 0;
        const step = Math.ceil(to / 60);
        const t = setInterval(() => {
          start += step;
          if (start >= to) { setVal(to); clearInterval(t); } else setVal(start);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────
   MARQUEE
───────────────────────────────────────── */
function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', display: 'flex' }}>
      <div style={{ display: 'flex', gap: '0', animation: 'marquee 28s linear infinite', whiteSpace: 'nowrap', willChange: 'transform' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', padding: '0 36px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: '#64748B' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0066FF', display: 'inline-block', flexShrink: 0 }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('customerToken'));
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const services = [
    { icon: <WashingMachine size={28} />, name: 'Wash & Fold', tagline: 'Everyday essentials, impeccably done', price: 'From ₦800/kg' },
    { icon: <Wind size={28} />, name: 'Dry Cleaning', tagline: 'Solvent care for delicate fabrics', price: 'From ₦2,500/piece' },
    { icon: <Flame size={28} />, name: 'Steam Ironing', tagline: 'Crisp press, zero creases', price: 'From ₦500/piece' },
    { icon: <Droplets size={28} />, name: 'Stain Removal', tagline: 'Advanced treatment, colour safe', price: 'From ₦1,500' },
    { icon: <Layers size={28} />, name: 'Duvets & Linen', tagline: 'Deep thermal sanitisation', price: 'From ₦3,500' },
    { icon: <Shirt size={28} />, name: 'Corporate Shirts', tagline: 'Box-fold finish for the boardroom', price: 'From ₦600/piece' },
  ];

  const testimonials = [
    { name: 'Adaeze O.', role: 'Victoria Island', text: 'My husband\'s suits came back looking like they just left the store. The attention to detail is honestly unreal.', rating: 5 },
    { name: 'Tunde A.', role: 'Lekki Phase 1', text: 'I\'ve tried five laundry services in Lagos. BG is the only one that actually shows up on time and returns everything folded perfectly.', rating: 5 },
    { name: 'Chisom M.', role: 'Ajah', text: 'Booked at 8pm, they picked up by 7am, delivered same evening. The tracking feature is a game changer.', rating: 5 },
  ];

  const marqueItems = ['Wash & Fold', 'Dry Cleaning', 'Steam Ironing', 'Stain Removal', 'Duvets & Linen', 'Corporate Shirts', 'Express 12-Hour Turnaround', 'Free Pickup & Delivery'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF9', color: '#0A0A0A', overflowX: 'hidden' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif !important; }
        .display-font { font-family: 'Syne', sans-serif !important; }

        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,15px) scale(0.97)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-25px,20px) scale(1.04)} 66%{transform:translate(20px,-15px) scale(0.98)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ticker { 0%{transform:translateY(0)} 33%{transform:translateY(-33.33%)} 66%{transform:translateY(-66.66%)} 100%{transform:translateY(-100%)} }

        .nav-link { color: #64748B; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #0A0A0A; }
        .btn-primary { background: #0A0A0A; color: #fff; border: none; border-radius: 10px; padding: 14px 28px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: background 0.2s, transform 0.2s; font-family: 'Inter', sans-serif; }
        .btn-primary:hover { background: #1a1a1a; transform: translateY(-1px); }
        .btn-outline { background: transparent; color: #0A0A0A; border: 1.5px solid #D4D4D4; border-radius: 10px; padding: 14px 28px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: border-color 0.2s, transform 0.2s; font-family: 'Inter', sans-serif; }
        .btn-outline:hover { border-color: #0A0A0A; transform: translateY(-1px); }
        .service-card { background: #fff; border: 1px solid #E8E8E4; border-radius: 20px; padding: 36px 32px; cursor: default; transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.35s; }
        .service-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.07); border-color: #0A0A0A; }
        .testimonial-card { background: #fff; border: 1px solid #E8E8E4; border-radius: 20px; padding: 36px; }

        /* Mobile */
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { display: none !important; }
          .hero-headline { font-size: clamp(48px, 13vw, 72px) !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .nav-links { display: none !important; }
          .cta-split { flex-direction: column !important; text-align: center !important; align-items: center !important; }
          .hero-ctas { flex-direction: column !important; }
          .hero-ctas button, .hero-ctas a { width: 100% !important; justify-content: center !important; }
          .section-pad { padding: 64px 20px !important; }
          .hero-pad { padding: 100px 20px 80px !important; }
        }
        @media (max-width: 480px) {
          .hero-headline { font-size: clamp(38px, 11vw, 52px) !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}} />

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, padding: '0 40px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrolled ? 'rgba(250,250,249,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent', transition: 'all 0.4s ease' }}>
        <div className="display-font" style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px', color: '#0A0A0A' }}>
          BG Laundry
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#services" className="nav-link">Services</a>
          <a href="#how" className="nav-link">How It Works</a>
          <a href="#reviews" className="nav-link">Reviews</a>
          <a href="/admin" className="nav-link" style={{ borderRight: '1px solid #E8E8E4', paddingRight: '28px' }}>Admin</a>
        </div>
        <button
          className="btn-primary"
          onClick={() => router.push(loggedIn ? '/dashboard' : '/login')}
          style={{ padding: '10px 22px', fontSize: '13px' }}
        >
          {loggedIn ? 'My Dashboard' : 'Get Started'}
          <ArrowRight size={14} />
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-pad" style={{ minHeight: '100svh', padding: '130px 60px 80px', background: '#FAFAF9', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,102,255,0.07) 0%, transparent 70%)', top: '-100px', right: '-100px', animation: 'blob1 14s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', bottom: '0', left: '5%', animation: 'blob2 18s ease-in-out infinite', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 420px', gap: '60px', alignItems: 'center' }} className="hero-grid">
          {/* Left */}
          <div>
            {/* Rotating tagline ticker */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '36px', background: '#fff', border: '1px solid #E8E8E4', borderRadius: '40px', padding: '8px 18px 8px 8px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ background: '#0A0A0A', borderRadius: '30px', padding: '5px 12px', overflow: 'hidden', height: '26px' }}>
                <div style={{ animation: 'ticker 6s steps(1) infinite', display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {['Express 12hr ⚡', 'Free Pickup 📦', 'Live Tracking 🗺️', 'Express 12hr ⚡'].map((t, i) => (
                    <span key={i} style={{ fontSize: '11px', color: '#fff', fontWeight: '700', height: '26px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>{t}</span>
                  ))}
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Lagos door-to-door laundry</span>
            </div>

            <h1
              className="hero-headline display-font"
              style={{
                fontSize: 'clamp(58px, 6.5vw, 88px)',
                fontWeight: '800',
                lineHeight: '1.04',
                letterSpacing: '-2.5px',
                color: '#0A0A0A',
                marginBottom: '28px'
              }}
            >
              Your clothes.<br />
              Our obsession.
            </h1>

            <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: '1.7', maxWidth: '500px', marginBottom: '44px', fontWeight: '400' }}>
              We pick up, clean, press and deliver — while you focus on things that actually matter. Same-day turnarounds available across Lagos.
            </p>

            <div className="hero-ctas" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => router.push(loggedIn ? '/dashboard' : '/login')} style={{ fontSize: '15px', padding: '16px 32px', borderRadius: '12px' }}>
                Book a Pickup
                <ArrowRight size={16} />
              </button>
              <button
                className="btn-outline"
                onClick={() => window.open('https://wa.me/2347058155555', '_blank')}
                style={{ fontSize: '15px', padding: '16px 32px', borderRadius: '12px' }}
              >
                <PhoneCall size={16} />
                WhatsApp Us
              </button>
            </div>

            {/* Social proof row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '48px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex' }}>
                {['#0066FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((c, i) => (
                  <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: '2px solid #FAFAF9', marginLeft: i === 0 ? 0 : '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: '700' }}>
                    {['A', 'T', 'C', 'M', 'E'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#F59E0B" stroke="none" />)}
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Loved by <strong style={{ color: '#0A0A0A' }}>2,400+</strong> customers in Lagos</p>
              </div>
            </div>
          </div>

          {/* Right — live order card */}
          <div className="hero-visual" style={{ position: 'relative' }}>
            {/* Main card */}
            <div style={{
              background: '#0A0A0A',
              borderRadius: '24px',
              padding: '28px',
              color: '#fff',
              boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
              animation: 'fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.3s both'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>Active Order</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px' }}>#BG-8902</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>Cleaning</span>
                </div>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {[['Shirts (Iron Only)', '×4'], ['Duvet (Wash Only)', '×1'], ['Chinos (Press)', '×2']].map(([item, qty], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#D4D4D4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0066FF', display: 'inline-block' }} />
                      {item}
                    </span>
                    <span style={{ color: '#6B7280', fontWeight: '600' }}>{qty}</span>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#6B7280' }}>Progress</span>
                <span style={{ color: '#0066FF', fontWeight: '700' }}>Step 4 of 6</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px', height: '6px', marginBottom: '20px' }}>
                <div style={{ width: '66%', background: 'linear-gradient(90deg, #0066FF, #6366F1)', height: '100%', borderRadius: '6px' }} />
              </div>

              {/* Pipeline steps */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {['Pickup', 'Received', 'Cleaning', 'Pressing', 'En Route', 'Done'].map((step, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i < 4 ? '#0066FF' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {i < 4 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <span style={{ fontSize: '9px', color: i < 4 ? '#94A3B8' : '#374151', whiteSpace: 'nowrap' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating mini card - ETA */}
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-30px',
              background: '#fff',
              border: '1px solid #E8E8E4',
              borderRadius: '16px',
              padding: '14px 18px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
              animation: 'fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.6s both'
            }}>
              <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>ETA</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0A0A0A' }}>Today, 6:30 PM</div>
              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '600', marginTop: '2px' }}>On schedule ✓</div>
            </div>

            {/* Floating mini card - rating */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-24px',
              background: '#fff',
              border: '1px solid #E8E8E4',
              borderRadius: '16px',
              padding: '14px 18px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
              animation: 'fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.8s both'
            }}>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#F59E0B" stroke="none" />)}
              </div>
              <div style={{ fontSize: '12px', color: '#0A0A0A', fontWeight: '600' }}>"Absolutely flawless"</div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>— Adaeze O., V.I</div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.4 }}>
          <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>Scroll</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div style={{ borderTop: '1px solid #E8E8E4', borderBottom: '1px solid #E8E8E4', padding: '18px 0', background: '#fff', overflow: 'hidden' }}>
        <Marquee items={marqueItems} />
      </div>

      {/* ── STATS ── */}
      <section style={{ padding: '80px 60px', background: '#0A0A0A', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', textAlign: 'center' }} className="stats-grid">
              {[
                { num: 2400, suf: '+', label: 'Happy Customers' },
                { num: 98, suf: '%', label: 'On-Time Delivery' },
                { num: 12, suf: 'hr', label: 'Express Turnaround' },
                { num: 7, suf: '', label: 'Days a Week' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px' }}>
                  <div className="display-font" style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-2px', background: 'linear-gradient(135deg, #fff 0%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                    <Counter to={s.num} suffix={s.suf} />
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '10px', fontWeight: '500' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="section-pad" style={{ padding: '100px 60px', background: '#FAFAF9' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#0066FF', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>What We Do</p>
                <h2 className="display-font" style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: '800', letterSpacing: '-1.5px', lineHeight: '1.1', color: '#0A0A0A' }}>
                  Every fabric.<br />Every care label.
                </h2>
              </div>
              <button className="btn-outline" onClick={() => router.push(loggedIn ? '/dashboard' : '/login')}>
                See All Services <ArrowRight size={15} />
              </button>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="services-grid">
            {services.map((svc, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="service-card">
                  <div style={{ color: '#0066FF', marginBottom: '24px' }}>{svc.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0A0A0A', marginBottom: '8px', letterSpacing: '-0.3px' }}>{svc.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px', lineHeight: '1.5' }}>{svc.tagline}</p>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0A0A0A', paddingTop: '16px', borderTop: '1px solid #F1F0EE' }}>{svc.price}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ background: '#fff', padding: '100px 60px', borderTop: '1px solid #E8E8E4' }} className="section-pad">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '72px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#0066FF', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>The Process</p>
              <h2 className="display-font" style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: '800', letterSpacing: '-1.5px', color: '#0A0A0A' }}>
                Three steps.<br />Zero stress.
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }} className="services-grid">
            {[
              { n: '01', title: 'Schedule Online', body: 'Pick your garments, drop your address and choose a pickup time — all inside your browser in under a minute.' },
              { n: '02', title: 'We Handle It', body: 'Our driver collects from your door. Expert cleaning, pressing and folding follows — with live status updates throughout.' },
              { n: '03', title: 'Back at Your Door', body: 'Fresh. Folded. On time. We deliver back to your exact address with a confirmation OTP for secure handover.' },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 100} from={i === 0 ? 'left' : i === 2 ? 'right' : 'bottom'}>
                <div style={{ padding: '40px 36px', background: i === 1 ? '#0A0A0A' : '#FAFAF9', borderRadius: '20px', color: i === 1 ? '#fff' : '#0A0A0A', border: i === 1 ? 'none' : '1px solid #E8E8E4' }}>
                  <div className="display-font" style={{ fontSize: '60px', fontWeight: '800', opacity: 0.1, letterSpacing: '-2px', lineHeight: 1, marginBottom: '20px' }}>{step.n}</div>
                  <h3 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '14px' }}>{step.title}</h3>
                  <p style={{ fontSize: '15px', lineHeight: '1.65', color: i === 1 ? '#94A3B8' : '#6B7280' }}>{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" className="section-pad" style={{ background: '#FAFAF9', padding: '100px 60px', borderTop: '1px solid #E8E8E4' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: '60px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#0066FF', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Real Reviews</p>
              <h2 className="display-font" style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: '800', letterSpacing: '-1.5px', color: '#0A0A0A' }}>
                Don't take our word for it.
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="testimonials-grid">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="testimonial-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
                      {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="#F59E0B" stroke="none" />)}
                    </div>
                    <p style={{ fontSize: '15px', lineHeight: '1.65', color: '#374151', fontStyle: 'italic' }}>"{t.text}"</p>
                  </div>
                  <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #F1F0EE', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0A0A0A' }}>{t.name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ background: '#0A0A0A', padding: '80px 60px' }} className="section-pad">
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }} className="cta-split">
          <div>
            <h2 className="display-font" style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '800', letterSpacing: '-1.5px', color: '#fff', lineHeight: 1.1, marginBottom: '12px' }}>
              Ready for cleaner clothes?
            </h2>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>Book in under 60 seconds. Free pickup across Lagos.</p>
          </div>
          <div style={{ display: 'flex', gap: '14px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="btn-primary"
              onClick={() => router.push(loggedIn ? '/dashboard' : '/login')}
              style={{ background: '#0066FF', fontSize: '15px', padding: '16px 32px', borderRadius: '12px' }}
            >
              Book a Pickup <ArrowRight size={16} />
            </button>
            <button
              className="btn-outline"
              onClick={() => window.open('https://wa.me/2347058155555', '_blank')}
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '15px', padding: '16px 32px', borderRadius: '12px' }}
            >
              <PhoneCall size={16} /> WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 60px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div className="display-font" style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>BG Laundry & Dry Cleaning</div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>16B Maria Okor Street, Ejibo, Lagos · 07058155555</div>
          </div>
          <div style={{ fontSize: '12px', color: '#374151' }}>© 2026 BG Laundry. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
