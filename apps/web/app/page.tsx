'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, PhoneCall, Star, ChevronDown, Shirt, Wind, Flame, Droplets, Layers, WashingMachine } from 'lucide-react';

/* ─── Scroll Reveal ─── */
function Reveal({ children, delay = 0, from = 'bottom' }: {
  children: React.ReactNode; delay?: number; from?: 'bottom' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold: 0.06 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const tx = from === 'left' ? 'translateX(-28px)' : from === 'right' ? 'translateX(28px)' : 'translateY(22px)';
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : tx, transition: `opacity 1s ease ${delay}ms, transform 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── Marquee ─── */
function Marquee({ items }: { items: string[] }) {
  const list = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', display: 'flex' }}>
      <div style={{ display: 'flex', animation: 'marquee 32s linear infinite', whiteSpace: 'nowrap', willChange: 'transform' }}>
        {list.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '0 32px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2.5px', color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#374151', display: 'inline-block', flexShrink: 0 }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('customerToken'));
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll);
    const t = setTimeout(() => setHeroReady(true), 120);
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(t); };
  }, []);

  const services = [
    { icon: <WashingMachine size={24} />, name: 'Wash & Fold', tagline: 'Everyday essentials, impeccably cleaned and crisply folded.', price: 'From ₦800 / kg' },
    { icon: <Wind size={24} />, name: 'Dry Cleaning', tagline: 'Professional solvent care for your finest and most delicate pieces.', price: 'From ₦2,500 / piece' },
    { icon: <Flame size={24} />, name: 'Steam Ironing', tagline: 'A razor-sharp press on every crease line, every time.', price: 'From ₦500 / piece' },
    { icon: <Droplets size={24} />, name: 'Stain Removal', tagline: 'Advanced targeted treatment. Colour-safe, fabric-safe.', price: 'From ₦1,500' },
    { icon: <Layers size={24} />, name: 'Duvets & Linen', tagline: 'Deep thermal sanitisation for oversized household items.', price: 'From ₦3,500' },
    { icon: <Shirt size={24} />, name: 'Corporate Shirts', tagline: 'Box-fold boardroom finish. Delivered before your Monday.', price: 'From ₦600 / piece' },
  ];

  const testimonials = [
    { name: 'Adaeze O.', location: 'Victoria Island', text: 'My husband\'s suits came back looking like they had just left the store. The attention to detail is honestly unreal.' },
    { name: 'Tunde A.', location: 'Lekki Phase 1', text: 'I\'ve tried five laundry services in Lagos. BG is the only one that actually shows up on time and returns everything perfectly folded.' },
    { name: 'Chisom M.', location: 'Ajah', text: 'Booked at 8pm, pickup by 7am, delivered that same evening. The live tracking is a genuine game-changer.' },
  ];

  const marqueeItems = ['Wash & Fold', 'Dry Cleaning', 'Steam Ironing', 'Stain Removal', 'Duvets & Linen', 'Corporate Shirts', 'Same-Day Express', 'Free Pickup & Delivery', 'Lagos-Wide Coverage'];

  // Word reveal split for headline
  const words1 = ['Your', 'clothes.'];
  const words2 = ['Our', 'obsession.'];

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F7', color: '#0D0D0D', overflowX: 'hidden' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }

        /* ── Keyframes ── */
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        @keyframes wordUp {
          0%  { opacity: 0; transform: translateY(100%); }
          100%{ opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          0%  { opacity: 0; }
          100%{ opacity: 1; }
        }
        @keyframes slideRight {
          0%  { width: 0; opacity: 0; }
          100%{ width: 100%; opacity: 1; }
        }
        @keyframes floatY {
          0%,100%{ transform: translateY(0px); }
          50%    { transform: translateY(-10px); }
        }
        @keyframes ticker {
          0%        { transform: translateY(0); }
          0%, 28%   { transform: translateY(0); }
          33%, 61%  { transform: translateY(-33.33%); }
          66%, 94%  { transform: translateY(-66.66%); }
          99%, 100% { transform: translateY(0); }
        }
        @keyframes scaleIn {
          0%  { transform: scale(0.94); opacity: 0; }
          100%{ transform: scale(1);    opacity: 1; }
        }
        @keyframes shimmer {
          0%  { background-position: -200% center; }
          100%{ background-position: 200% center; }
        }
        @keyframes pulseRing {
          0%  { box-shadow: 0 0 0 0 rgba(0,85,255,0.25); }
          70% { box-shadow: 0 0 0 12px rgba(0,85,255,0); }
          100%{ box-shadow: 0 0 0 0 rgba(0,85,255,0); }
        }

        /* ── Components ── */
        .word-mask { overflow: hidden; display: inline-block; }
        .word-reveal {
          display: inline-block;
          opacity: 0;
          transform: translateY(100%);
          animation: wordUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        .nav-link {
          font-family: 'DM Sans', sans-serif;
          color: #6B7280; text-decoration: none;
          font-size: 14px; font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #0D0D0D; }

        .btn-primary {
          background: #0D0D0D; color: #FAF9F7;
          border: none; border-radius: 100px;
          padding: 14px 30px; font-size: 14px; font-weight: 500;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.25s, transform 0.25s, box-shadow 0.25s;
          letter-spacing: -0.1px;
        }
        .btn-primary:hover { background: #1a1a1a; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.18); }

        .btn-ghost {
          background: transparent; color: #0D0D0D;
          border: 1.5px solid #D6D3CD; border-radius: 100px;
          padding: 14px 30px; font-size: 14px; font-weight: 500;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.25s, transform 0.25s;
        }
        .btn-ghost:hover { border-color: #0D0D0D; transform: translateY(-2px); }

        .btn-ghost-white {
          background: transparent; color: #FAF9F7;
          border: 1.5px solid rgba(255,255,255,0.2); border-radius: 100px;
          padding: 14px 30px; font-size: 14px; font-weight: 500;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.25s, transform 0.25s;
        }
        .btn-ghost-white:hover { border-color: rgba(255,255,255,0.6); transform: translateY(-2px); }

        .service-card {
          background: #fff; border: 1px solid #EAE8E3;
          border-radius: 18px; padding: 36px 30px;
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s, border-color 0.4s;
          cursor: default;
        }
        .service-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 24px 48px rgba(0,0,0,0.07);
          border-color: #0D0D0D;
        }
        .testimonial-card {
          background: #fff; border: 1px solid #EAE8E3;
          border-radius: 18px; padding: 36px;
          display: flex; flex-direction: column; justify-content: space-between;
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s;
        }
        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.06);
        }

        .trust-pill {
          display: inline-flex; align-items: center; gap: 10px;
          background: #fff; border: 1px solid #EAE8E3;
          border-radius: 100px; padding: 10px 18px 10px 10px;
          animation: pulseRing 3s ease-in-out infinite;
        }
        .icon-dot {
          width: 36px; height: 36px; border-radius: 50%;
          background: #0D0D0D;
          display: flex; align-items: center; justify-content: center;
          color: #FAF9F7; flex-shrink: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .hero-grid   { grid-template-columns: 1fr !important; }
          .hero-visual { display: none !important; }
          .svc-grid    { grid-template-columns: 1fr 1fr !important; }
          .how-grid    { grid-template-columns: 1fr !important; }
          .test-grid   { grid-template-columns: 1fr !important; }
          .trust-row   { gap: 20px !important; justify-content: center !important; }
          .cta-split   { flex-direction: column !important; text-align: center !important; align-items: center !important; }
          .nav-links   { display: none !important; }
        }
        @media (max-width: 600px) {
          .svc-grid  { grid-template-columns: 1fr !important; }
          .hero-ctas { flex-direction: column !important; }
          .hero-ctas button { width: 100% !important; justify-content: center !important; }
          .sp { padding: 64px 24px !important; }
          .hero-sp { padding: 110px 24px 72px !important; }
        }
      `}} />

      {/* ═══════════════════════════════════════
          NAV
      ═══════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 48px', height: '70px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(250,249,247,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ fontSize: '17px', fontWeight: '600', letterSpacing: '-0.4px', color: '#0D0D0D', fontFamily: "'DM Sans', sans-serif" }}>
          BG Laundry
        </div>

        <div className="nav-links" style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
          <a href="#services" className="nav-link">Services</a>
          <a href="#how" className="nav-link">How It Works</a>
          <a href="#reviews" className="nav-link">Reviews</a>
          <a href="/admin" className="nav-link" style={{ paddingRight: '28px', borderRight: '1px solid #EAE8E3' }}>Admin</a>
        </div>

        <button className="btn-primary" onClick={() => router.push(loggedIn ? '/dashboard' : '/login')} style={{ padding: '10px 22px', fontSize: '13px' }}>
          {loggedIn ? 'My Dashboard' : 'Get Started'} <ArrowRight size={14} />
        </button>
      </nav>

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="hero-sp" style={{
        minHeight: '100svh', padding: '130px 64px 80px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #FAF9F7 0%, #F0EDE8 100%)',
      }}>
        {/* Decorative ring */}
        <div style={{
          position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-52%)',
          width: '480px', height: '480px', borderRadius: '50%',
          border: '1px solid rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ width: '340px', height: '340px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(0,0,0,0.03)' }} />
          </div>
        </div>

        <div style={{ maxWidth: '1160px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 420px', gap: '80px', alignItems: 'center', position: 'relative', zIndex: 2 }} className="hero-grid">

          {/* ── Left ── */}
          <div>
            {/* Ticker pill */}
            <div className="trust-pill" style={{ marginBottom: '40px', animation: 'scaleIn 0.6s ease 0.1s both' }}>
              <div className="icon-dot" style={{ background: '#0055FF' }}>
                <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
              <div style={{ height: '22px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ animation: 'ticker 9s ease-in-out infinite', display: 'flex', flexDirection: 'column' }}>
                  {['Express 12-hr turnaround', 'Free door-to-door pickup', 'Live tracking portal'].map((t, i) => (
                    <span key={i} style={{ height: '22px', display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '500', color: '#374151', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Headline — word by word reveal */}
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(56px, 7vw, 96px)',
              fontWeight: '700',
              lineHeight: '0.98',
              letterSpacing: '-2px',
              color: '#0D0D0D',
              marginBottom: '32px',
            }}>
              {[...words1, ...words2].map((word, i) => {
                const isSecondLine = i >= words1.length;
                return (
                  <React.Fragment key={i}>
                    {i === words1.length && <br />}
                    <span className="word-mask">
                      <span
                        className="word-reveal"
                        style={{
                          animationDelay: heroReady ? `${i * 120}ms` : '99999ms',
                          fontStyle: isSecondLine ? 'italic' : 'normal',
                        }}
                      >
                        {word}
                      </span>
                    </span>
                    {i < words1.length - 1 || (i >= words1.length && i < words1.length + words2.length - 1) ? '\u00A0' : ''}
                  </React.Fragment>
                );
              })}
            </h1>

            <p style={{
              fontSize: '17px', color: '#6B7280', lineHeight: '1.7',
              maxWidth: '480px', marginBottom: '48px',
              fontFamily: "'DM Sans', sans-serif", fontWeight: '300',
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'none' : 'translateY(12px)',
              transition: 'opacity 0.9s ease 600ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 600ms',
            }}>
              We pick up, clean, press and return — while you get on with your day. Same-day turnarounds available across Lagos.
            </p>

            <div className="hero-ctas" style={{
              display: 'flex', gap: '14px', flexWrap: 'wrap',
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'none' : 'translateY(14px)',
              transition: 'opacity 0.9s ease 800ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 800ms',
            }}>
              <button className="btn-primary" onClick={() => router.push(loggedIn ? '/dashboard' : '/login')} style={{ fontSize: '15px', padding: '16px 34px' }}>
                Book a Pickup <ArrowRight size={16} />
              </button>
              <button className="btn-ghost" onClick={() => window.open('https://wa.me/2347058155555', '_blank')} style={{ fontSize: '15px', padding: '16px 34px' }}>
                <PhoneCall size={16} /> WhatsApp Us
              </button>
            </div>

            {/* Mini trust strip */}
            <div style={{
              marginTop: '52px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
              opacity: heroReady ? 1 : 0,
              transition: 'opacity 0.9s ease 1000ms',
            }}>
              <div style={{ display: 'flex' }}>
                {['#0055FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((c, i) => (
                  <div key={i} style={{ width: '30px', height: '30px', borderRadius: '50%', background: c, border: '2px solid #FAF9F7', marginLeft: i === 0 ? 0 : '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: '700' }}>
                    {['A', 'T', 'C', 'M', 'E'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '3px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#F59E0B" stroke="none" />)}
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                  Rated 5 stars by our early customers
                </p>
              </div>
            </div>
          </div>

          {/* ── Right — floating order card ── */}
          <div className="hero-visual" style={{ position: 'relative' }}>
            {/* Main card */}
            <div style={{
              background: '#0D0D0D', borderRadius: '28px', padding: '30px',
              color: '#fff', boxShadow: '0 50px 100px rgba(0,0,0,0.22)',
              animation: 'scaleIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s both',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px', fontFamily: "'DM Sans', sans-serif" }}>Active Order</div>
                  <div style={{ fontSize: '22px', fontFamily: "'Cormorant Garamond', serif", fontWeight: '700', letterSpacing: '-0.5px' }}>#BG-8902</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '100px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981', animation: 'pulseRing 2s infinite' }} />
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '600', fontFamily: "'DM Sans', sans-serif" }}>Cleaning</span>
                </div>
              </div>

              {[['Shirts — Iron Only', '×4'], ['Duvet — Wash', '×1'], ['Chinos — Press', '×2']].map(([item, qty], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
                  <span style={{ color: '#C4C4C0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0055FF', display: 'inline-block' }} />
                    {item}
                  </span>
                  <span style={{ color: '#6B7280', fontWeight: '500' }}>{qty}</span>
                </div>
              ))}

              <div style={{ marginTop: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px', fontFamily: "'DM Sans', sans-serif" }}>
                  <span style={{ color: '#6B7280' }}>Progress</span>
                  <span style={{ color: '#0055FF', fontWeight: '600' }}>Step 4 / 6</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '100px', height: '5px', marginBottom: '22px' }}>
                  <div style={{ width: '66%', background: 'linear-gradient(90deg, #0055FF, #6366F1)', height: '100%', borderRadius: '100px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {['Pickup', 'Received', 'Cleaning', 'Pressing', 'Dispatch', 'Done'].map((s, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: i < 4 ? '#0055FF' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i < 4 && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff' }} />}
                      </div>
                      <span style={{ fontSize: '8px', color: i < 4 ? '#9CA3AF' : '#374151', fontFamily: "'DM Sans', sans-serif" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ETA bubble */}
            <div style={{
              position: 'absolute', bottom: '-22px', left: '-28px',
              background: '#fff', border: '1px solid #EAE8E3', borderRadius: '18px', padding: '14px 20px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.09)',
              animation: 'floatY 5s ease-in-out infinite, scaleIn 0.8s ease 1s both',
            }}>
              <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px', fontFamily: "'DM Sans', sans-serif" }}>ETA</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0D0D0D', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.3px' }}>Today, 6:30 PM</div>
              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '600', marginTop: '2px', fontFamily: "'DM Sans', sans-serif" }}>On schedule ✓</div>
            </div>

            {/* Review bubble */}
            <div style={{
              position: 'absolute', top: '-22px', right: '-20px',
              background: '#fff', border: '1px solid #EAE8E3', borderRadius: '18px', padding: '14px 18px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.09)',
              animation: 'floatY 6s ease-in-out 2s infinite, scaleIn 0.8s ease 1.2s both',
            }}>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '5px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#F59E0B" stroke="none" />)}
              </div>
              <div style={{ fontSize: '12px', color: '#0D0D0D', fontWeight: '600', fontFamily: "'DM Sans', sans-serif" }}>"Absolutely flawless"</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', fontFamily: "'DM Sans', sans-serif" }}>— Adaeze O.</div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', opacity: 0.35, animation: 'fadeIn 1s ease 1.4s both' }}>
          <span style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2.5px', fontFamily: "'DM Sans', sans-serif" }}>Discover</span>
          <ChevronDown size={15} />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MARQUEE STRIP
      ═══════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid #EAE8E3', borderBottom: '1px solid #EAE8E3', padding: '16px 0', background: '#FAF9F7', overflow: 'hidden' }}>
        <Marquee items={marqueeItems} />
      </div>

      {/* ═══════════════════════════════════════
          TRUST BAND (replaces stats)
      ═══════════════════════════════════════ */}
      <section style={{ background: '#0D0D0D', padding: '64px 64px' }} className="sp">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div className="trust-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
              {[
                { label: 'Express Turnaround', value: '12-hour', sub: 'Same-day cleaning available' },
                { label: 'Delivery Coverage', value: 'Lagos-wide', sub: 'Mainland & Island' },
                { label: 'Service Window', value: '7 Days', sub: 'Mon – Sun, 7am – 8pm' },
                { label: 'Customer Rating', value: '5 Stars', sub: 'Rated by every client so far' },
              ].map((item, i) => (
                <div key={i} style={{ flex: '1 1 200px', textAlign: 'center' }}>
                  <div style={{
                    fontSize: 'clamp(32px, 4vw, 44px)',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: '700',
                    letterSpacing: '-1px',
                    color: '#FAF9F7',
                    lineHeight: 1,
                    marginBottom: '8px',
                  }}>{item.value}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', fontFamily: "'DM Sans', sans-serif" }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: '#4B5563', fontFamily: "'DM Sans', sans-serif" }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SERVICES
      ═══════════════════════════════════════ */}
      <section id="services" className="sp" style={{ padding: '100px 64px', background: '#FAF9F7' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px', flexWrap: 'wrap', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '14px', fontFamily: "'DM Sans', sans-serif" }}>What We Do</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(38px, 5vw, 60px)', fontWeight: '700', letterSpacing: '-1.5px', lineHeight: '1.0', color: '#0D0D0D' }}>
                  Every fabric.<br /><em>Every care label.</em>
                </h2>
              </div>
              <button className="btn-ghost" onClick={() => router.push(loggedIn ? '/dashboard' : '/login')} style={{ flexShrink: 0 }}>
                Book Now <ArrowRight size={15} />
              </button>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="svc-grid">
            {services.map((svc, i) => (
              <Reveal key={i} delay={i * 65}>
                <div className="service-card" style={{ height: '100%' }}>
                  <div style={{ color: '#0055FF', marginBottom: '20px', opacity: 0.8 }}>{svc.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0D0D0D', marginBottom: '10px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.3px' }}>{svc.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>{svc.tagline}</p>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0D0D0D', paddingTop: '18px', borderTop: '1px solid #F0EDE8', fontFamily: "'DM Sans', sans-serif" }}>{svc.price}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section id="how" className="sp" style={{ background: '#fff', padding: '100px 64px', borderTop: '1px solid #EAE8E3' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '72px', flexWrap: 'wrap', gap: '20px' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(38px, 5vw, 60px)', fontWeight: '700', letterSpacing: '-1.5px', lineHeight: '1.0', color: '#0D0D0D' }}>
                Three steps.<br /><em>Zero stress.</em>
              </h2>
              <p style={{ fontSize: '14px', color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif", maxWidth: '300px', lineHeight: '1.7' }}>
                From booking to delivery, our process is designed to stay completely out of your way.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }} className="how-grid">
            {[
              { n: '01', title: 'Schedule Online', body: 'Select your items, drop your address and choose a pickup window — done in under 60 seconds from any browser.' },
              { n: '02', title: 'We Handle Everything', body: 'A driver arrives at your door. Professional cleaning, pressing and folding follows — with live status updates throughout.' },
              { n: '03', title: 'Returned to Your Door', body: 'Fresh, folded and on schedule. We deliver with a secure confirmation OTP so only you can accept the handover.' },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 90} from={i === 0 ? 'left' : i === 2 ? 'right' : 'bottom'}>
                <div style={{
                  padding: '44px 38px',
                  background: i === 1 ? '#0D0D0D' : '#F7F6F3',
                  borderRadius: '20px',
                  color: i === 1 ? '#FAF9F7' : '#0D0D0D',
                  height: '100%',
                }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '72px', fontWeight: '700', opacity: 0.08, letterSpacing: '-3px', lineHeight: 1, marginBottom: '24px' }}>{step.n}</div>
                  <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '20px', fontWeight: '600', letterSpacing: '-0.4px', marginBottom: '16px' }}>{step.title}</h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', lineHeight: '1.7', color: i === 1 ? '#9CA3AF' : '#6B7280' }}>{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section id="reviews" className="sp" style={{ background: '#FAF9F7', padding: '100px 64px', borderTop: '1px solid #EAE8E3' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: '64px' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '14px', fontFamily: "'DM Sans', sans-serif" }}>What Clients Say</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(38px, 5vw, 60px)', fontWeight: '700', letterSpacing: '-1.5px', lineHeight: '1.0', color: '#0D0D0D' }}>
                Don't take our word for it.
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="test-grid">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="testimonial-card">
                  <div>
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '22px' }}>
                      {[...Array(5)].map((_, j) => <Star key={j} size={13} fill="#F59E0B" stroke="none" />)}
                    </div>
                    <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>
                      "{t.text}"
                    </p>
                  </div>
                  <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F0EDE8', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#0055FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0D0D0D', fontFamily: "'DM Sans', sans-serif" }}>{t.name}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>{t.location}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA
      ═══════════════════════════════════════ */}
      <section className="sp" style={{ background: '#0D0D0D', padding: '88px 64px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '48px', flexWrap: 'wrap' }} className="cta-split">
          <Reveal from="left">
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '700', letterSpacing: '-1.5px', color: '#FAF9F7', lineHeight: '1.05', marginBottom: '14px' }}>
                Ready for cleaner clothes?
              </h2>
              <p style={{ fontSize: '15px', color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>Book in under 60 seconds. Free pickup across Lagos.</p>
            </div>
          </Reveal>
          <Reveal from="right">
            <div style={{ display: 'flex', gap: '14px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => router.push(loggedIn ? '/dashboard' : '/login')} style={{ background: '#0055FF', fontSize: '15px', padding: '16px 34px' }}>
                Book a Pickup <ArrowRight size={16} />
              </button>
              <button className="btn-ghost-white" onClick={() => window.open('https://wa.me/2347058155555', '_blank')} style={{ fontSize: '15px', padding: '16px 34px' }}>
                <PhoneCall size={16} /> WhatsApp
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer style={{ background: '#0D0D0D', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 64px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#FAF9F7', marginBottom: '5px', fontFamily: "'DM Sans', sans-serif" }}>BG Laundry & Dry Cleaning</div>
            <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>16B Maria Okor Street, Ejibo, Lagos · 07058155555</div>
          </div>
          <div style={{ fontSize: '12px', color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>© 2026 BG Laundry. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
