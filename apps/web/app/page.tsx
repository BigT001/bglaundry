'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Menu, X } from '@/lib/icons';

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('customerToken'));
  }, []);

  const handleStart = () => {
    router.push(loggedIn ? '/dashboard' : '/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="home-container">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'DM Sans', sans-serif; 
          -webkit-font-smoothing: antialiased; 
          overflow-x: hidden;
        }

        .home-container {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          background-color: #FFFFFF;
          color: #0F172A;
        }

        /* Ambient Orbs */
        @keyframes floatBubble1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-40px) scale(1.1); }
        }
        @keyframes floatBubble2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(30px) scale(0.9); }
        }
        .bg-orb-1 {
          position: absolute; top: -10%; left: -5%;
          width: 50vw; height: 50vw; max-width: 600px; max-height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 102, 255, 0.07) 0%, transparent 70%);
          animation: floatBubble1 12s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }
        .bg-orb-2 {
          position: absolute; bottom: -15%; right: -5%;
          width: 60vw; height: 60vw; max-width: 700px; max-height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%);
          animation: floatBubble2 15s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }

        /* === NAVIGATION === */
        .top-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 5%;
          position: relative;
          z-index: 100;
          /* No border, no background — headless feel */
        }

        /* Logo only, no text */
        .nav-logo {
          display: flex;
          align-items: center;
        }

        /* Desktop nav links */
        .nav-links {
          display: none;
          align-items: center;
          gap: 36px;
          list-style: none;
        }
        .nav-link {
          font-size: 15px; font-weight: 500; color: #475569;
          text-decoration: none;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nav-link:hover { color: #0F172A; }
        .nav-link-cta {
          font-size: 15px; font-weight: 600; color: #FFFFFF;
          background: #0066FF; padding: 10px 22px; border-radius: 100px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,102,255,0.25);
        }
        .nav-link-cta:hover {
          background: #005ce6; transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(0,102,255,0.35);
        }

        /* Mobile hamburger — hidden on desktop */
        .menu-toggle {
          display: flex;
          background: transparent; border: 1px solid #E2E8F0; color: #0F172A;
          cursor: pointer; padding: 8px 10px; border-radius: 10px;
          transition: background 0.2s;
        }
        .menu-toggle:hover { background: #F1F5F9; }

        /* Show desktop links, hide hamburger on md+ screens */
        @media (min-width: 768px) {
          .nav-links { display: flex; }
          .menu-toggle { display: none; }
        }

        /* === SLIDING DRAWER (Mobile only) === */
        .drawer-overlay {
          position: fixed; inset: 0; background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          z-index: 999; opacity: 0; pointer-events: none;
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drawer-overlay.open { opacity: 1; pointer-events: auto; }

        .drawer-menu {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 100%; max-width: 360px;
          background: #FFFFFF;
          border-left: 1px solid rgba(0,0,0,0.06);
          box-shadow: -10px 0 40px rgba(0,0,0,0.08);
          z-index: 1000; padding: 28px;
          transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex; flex-direction: column;
        }
        .drawer-menu.open { transform: translateX(0); }
        .drawer-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 40px;
        }
        .drawer-nav-list {
          list-style: none; display: flex; flex-direction: column; gap: 8px;
        }
        .drawer-link {
          font-size: 20px; font-weight: 600; color: #475569; text-decoration: none;
          padding: 12px 0; border-bottom: 1px solid #F1F5F9;
          transition: all 0.2s; display: block;
        }
        .drawer-link:hover { color: #0F172A; padding-left: 8px; }
        .drawer-link-cta {
          font-size: 20px; font-weight: 700; color: #0066FF; text-decoration: none;
          padding: 12px 0; display: block;
          transition: all 0.2s;
        }
        .drawer-link-cta:hover { opacity: 0.8; padding-left: 8px; }

        /* === HERO SECTION === */
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hero-section {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; align-items: center; text-align: center;
          padding: 60px 5%; position: relative; z-index: 10;
        }
        .hero-badge {
          padding: 8px 18px; border-radius: 100px;
          background: rgba(0, 102, 255, 0.08); color: #0066FF;
          font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
          margin-bottom: 28px;
          border: 1px solid rgba(0, 102, 255, 0.12);
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both;
          text-transform: uppercase;
        }
        .hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(42px, 8vw, 80px);
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -2px;
          line-height: 1.05;
          margin-bottom: 24px;
          max-width: 900px;
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .title-accent {
          color: #0066FF;
          font-style: italic;
        }
        .hero-subtitle {
          font-size: clamp(16px, 2vw, 19px);
          color: #64748B;
          line-height: 1.7;
          margin-bottom: 48px;
          font-weight: 400;
          max-width: 560px;
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }
        .cta-group {
          display: flex; gap: 14px; align-items: center; justify-content: center;
          flex-wrap: wrap;
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        }
        .btn-primary {
          height: 54px; padding: 0 30px;
          background: #0066FF; color: #FFFFFF;
          border: none; border-radius: 100px;
          font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(0, 102, 255, 0.25);
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          background: #005ce6; transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 102, 255, 0.35);
        }
        .btn-secondary {
          height: 54px; padding: 0 30px;
          background: transparent; color: #334155;
          border: 2px solid #E2E8F0; border-radius: 100px;
          font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          background: #F8FAFC; border-color: #CBD5E1; transform: translateY(-2px);
        }

        /* Footer */
        .footer-credits {
          text-align: center; padding: 24px;
          font-size: 13px; color: #94A3B8;
          position: relative; z-index: 10;
        }
      `}} />

      {/* Background Ambience */}
      <div className="bg-orb-1" />
      <div className="bg-orb-2" />

      {/* Top Navigation — Headless */}
      <header className="top-nav">
        {/* Logo only, no text */}
        <div className="nav-logo">
          <Image src="/bglogo.png" alt="BG Laundry" width={64} height={64} style={{ objectFit: 'contain' }} />
        </div>

        {/* Desktop nav links */}
        <ul className="nav-links">
          <li><a href="#" className="nav-link">Services</a></li>
          <li><a href="#" className="nav-link">Pricing</a></li>
          <li><a href="#" className="nav-link">How It Works</a></li>
          <li><a href="/admin" className="nav-link">Admin</a></li>
          <li><a href="/login" className="nav-link-cta">Get Started</a></li>
        </ul>

        {/* Mobile hamburger only */}
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Open Menu">
          <Menu size={22} />
        </button>
      </header>

      {/* Sliding Drawer Menu (Mobile only) */}
      <div className={`drawer-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu} />
      <aside className={`drawer-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <Image src="/bglogo.png" alt="BG Laundry" width={52} height={52} style={{ objectFit: 'contain' }} />
          <button className="menu-toggle" onClick={toggleMenu} aria-label="Close Menu">
            <X size={22} />
          </button>
        </div>
        <ul className="drawer-nav-list">
          <li><a href="#" className="drawer-link" onClick={toggleMenu}>Services</a></li>
          <li><a href="#" className="drawer-link" onClick={toggleMenu}>Pricing</a></li>
          <li><a href="#" className="drawer-link" onClick={toggleMenu}>How It Works</a></li>
          <li><a href="/admin" className="drawer-link" onClick={toggleMenu}>Admin Portal</a></li>
          <li style={{ marginTop: '16px' }}>
            <a href="/login" className="drawer-link-cta" onClick={toggleMenu}>Get Started →</a>
          </li>
        </ul>
      </aside>

      {/* Main Hero Section */}
      <main className="hero-section">
        <div className="hero-badge">24H Express · Free Pickup · Lagos</div>
        <h1 className="hero-title">
          Premium Laundry.<br />
          Delivered to <span className="title-accent">Your Door.</span>
        </h1>
        <p className="hero-subtitle">
          Experience the finest garment care without leaving your home. Schedule a pickup, track your order, and receive your clothes fresh and perfectly pressed.
        </p>
        <div className="cta-group">
          <button className="btn-primary" onClick={handleStart}>
            Get Started <ArrowRight size={18} />
          </button>
          <button className="btn-secondary" onClick={toggleMenu}>
            Explore Services
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer-credits">
        © {new Date().getFullYear()} BG Laundry & Dry Cleaning · Lagos, Nigeria
      </footer>
    </div>
  );
}
