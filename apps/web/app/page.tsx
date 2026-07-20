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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="home-container">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

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
          background: radial-gradient(circle, rgba(0, 102, 255, 0.08) 0%, transparent 70%);
          animation: floatBubble1 12s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }
        .bg-orb-2 {
          position: absolute; bottom: -15%; right: -5%;
          width: 60vw; height: 60vw; max-width: 700px; max-height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%);
          animation: floatBubble2 15s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }

        /* Navigation */
        .top-nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 5%;
          position: relative; z-index: 100;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .nav-logo {
          font-size: 20px; font-weight: 700; color: #0F172A;
          display: flex; align-items: center; gap: 10px;
          letter-spacing: -0.5px;
        }
        .menu-toggle {
          background: transparent; border: none; color: #0F172A;
          cursor: pointer; padding: 8px; border-radius: 8px;
          transition: background 0.2s;
        }
        .menu-toggle:hover { background: rgba(0, 0, 0, 0.05); }

        /* Sliding Drawer (Carousel Menu) */
        .drawer-overlay {
          position: fixed; inset: 0; background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          z-index: 999; opacity: 0; pointer-events: none;
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drawer-overlay.open { opacity: 1; pointer-events: auto; }
        
        .drawer-menu {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 100%; max-width: 400px;
          background: #FFFFFF; border-left: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: -10px 0 30px rgba(0,0,0,0.05);
          z-index: 1000; padding: 32px;
          transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex; flex-direction: column;
        }
        .drawer-menu.open { transform: translateX(0); }
        .drawer-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 48px;
        }
        .drawer-nav-list {
          list-style: none; display: flex; flex-direction: column; gap: 24px;
        }
        .drawer-link {
          font-size: 24px; font-weight: 600; color: #64748B; text-decoration: none;
          transition: all 0.2s; display: block;
        }
        .drawer-link:hover { color: #0F172A; transform: translateX(8px); }
        
        /* Hero Section */
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hero-section {
          flex: 1; display: flex; flex-direction: column; 
          justify-content: center; align-items: center; text-align: center;
          padding: 60px 5%; position: relative; z-index: 10;
        }
        .hero-logo-wrap {
          margin-bottom: 32px;
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both;
          filter: drop-shadow(0 8px 24px rgba(0, 102, 255, 0.15));
        }
        .hero-badge {
          padding: 8px 16px; border-radius: 100px;
          background: rgba(0, 102, 255, 0.1); color: #0066FF;
          font-size: 13px; font-weight: 700; letter-spacing: 0.5px;
          margin-bottom: 32px;
          border: 1px solid rgba(0, 102, 255, 0.15);
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        .hero-title {
          font-size: clamp(40px, 8vw, 72px); font-weight: 800; color: #0F172A;
          letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 24px; max-width: 900px;
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .title-accent { color: #0066FF; }
        .hero-subtitle {
          font-size: clamp(16px, 2vw, 20px); color: #475569; line-height: 1.6;
          margin-bottom: 48px; font-weight: 400; max-width: 600px;
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }
        .cta-group {
          display: flex; gap: 16px; align-items: center; justify-content: center;
          flex-wrap: wrap; animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        }
        .btn-primary {
          height: 56px; padding: 0 32px;
          background: #0066FF; color: #FFFFFF;
          border: none; border-radius: 100px;
          font-size: 16px; font-weight: 600; font-family: inherit;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(0, 102, 255, 0.25);
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          background: #005ce6; transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 102, 255, 0.35);
        }
        .btn-secondary {
          height: 56px; padding: 0 32px;
          background: transparent; color: #0F172A;
          border: 2px solid #E2E8F0; border-radius: 100px;
          font-size: 16px; font-weight: 600; font-family: inherit;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          background: #F1F5F9; border-color: #CBD5E1; transform: translateY(-2px);
        }
        
        .footer-credits {
          text-align: center; padding: 24px; font-size: 13px; color: #64748B;
          position: relative; z-index: 10;
        }
      `}} />

      {/* Background Ambience */}
      <div className="bg-orb-1" />
      <div className="bg-orb-2" />

      {/* Top Navigation */}
      <header className="top-nav">
        <div className="nav-logo">
          <Image src="/bglogo.png" alt="BG Laundry Logo" width={40} height={40} style={{ objectFit: 'contain' }} />
          BG Laundry
        </div>
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Open Menu">
          <Menu size={28} />
        </button>
      </header>

      {/* Sliding Drawer Menu */}
      <div className={`drawer-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu} />
      <aside className={`drawer-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="nav-logo">
            <Image src="/bglogo.png" alt="BG Laundry Logo" width={40} height={40} style={{ objectFit: 'contain' }} />
            BG Laundry
          </div>
          <button className="menu-toggle" onClick={toggleMenu} aria-label="Close Menu">
            <X size={28} />
          </button>
        </div>
        <ul className="drawer-nav-list">
          <li><a href="#" className="drawer-link" onClick={toggleMenu}>Services</a></li>
          <li><a href="#" className="drawer-link" onClick={toggleMenu}>Pricing</a></li>
          <li><a href="#" className="drawer-link" onClick={toggleMenu}>How It Works</a></li>
          <li style={{ marginTop: '24px' }}>
            <a href="/login" className="drawer-link" style={{ color: '#0066FF' }}>Customer Login</a>
          </li>
          <li>
            <a href="/admin" className="drawer-link" style={{ color: '#38BDF8', fontSize: '18px' }}>Admin Portal</a>
          </li>
        </ul>
      </aside>

      {/* Main Hero Section */}
      <main className="hero-section">
        <div className="hero-badge">24H EXPRESS SERVICE</div>
        <h1 className="hero-title">
          Premium Laundry.<br/>Delivered to <span className="title-accent">Your Door.</span>
        </h1>
        <p className="hero-subtitle">
          Experience the finest garment care without leaving your home. Schedule a pickup, track your order, and receive your clothes fresh and perfectly pressed.
        </p>
        <div className="cta-group">
          <button className="btn-primary" onClick={handleStart}>
            Get Started <ArrowRight size={18} />
          </button>
          <button className="btn-secondary" onClick={() => setIsMenuOpen(true)}>
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
