'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Shirt, Compass } from '@/lib/icons';

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('customerToken'));
  }, []);

  const handleStart = () => {
    router.push(loggedIn ? '/dashboard' : '/login');
  };

  return (
    <div style={{
      minHeight: '100svh',
      backgroundColor: '#0A192F', // Rich dark navy matching the mobile app splash
      color: '#FAF9F7',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px'
    }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; background-color: #0A192F; }

        @keyframes floatBubble1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes floatBubble2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(25px) scale(0.95); }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .bg-bubble-1 {
          position: absolute; top: 10%; left: -10%;
          width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 102, 255, 0.12) 0%, transparent 70%);
          animation: floatBubble1 8s ease-in-out infinite;
          pointer-events: none;
        }
        .bg-bubble-2 {
          position: absolute; bottom: 15%; right: -8%;
          width: 380px; height: 380px; border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%);
          animation: floatBubble2 10s ease-in-out infinite;
          pointer-events: none;
        }

        .content-card {
          max-width: 420px; width: 100%;
          margin: auto; text-align: center;
          position: relative; z-index: 10;
          display: flex; flexDirection: column; align-items: center;
        }

        .logo-badge {
          width: 88px; height: 88px;
          border-radius: 24px;
          background: #FFFFFF;
          display: flex; align-items: center; justify-content: center;
          color: #0A192F; font-size: 28px; font-weight: 800;
          margin-bottom: 32px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1);
          animation: scaleIn 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }

        .title {
          font-size: 36px; font-weight: 700; color: #FAF9F7;
          letter-spacing: -0.8px; margin-bottom: 12px;
          animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }

        .subtitle {
          font-size: 15px; color: #94A3B8; line-height: 1.6;
          margin-bottom: 24px; font-weight: 400; max-width: 320px;
          animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        }

        .badge-row {
          display: flex; gap: 8px; justify-content: center; margin-bottom: 40px;
          animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both;
        }
        .capsule-badge {
          padding: 6px 14px; border-radius: 100px;
          background: rgba(0, 102, 255, 0.15);
          color: #0066FF; font-size: 12px; font-weight: 600;
        }
        .capsule-badge.light {
          background: rgba(56, 189, 248, 0.15);
          color: #38BDF8;
        }

        .btn-start {
          width: 100%; max-width: 280px; height: 52px;
          background: #FAF9F7; color: #0A192F;
          border: none; border-radius: 100px;
          font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease-in-out;
          animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both;
        }
        .btn-start:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 102, 255, 0.25);
          background: #FFFFFF;
        }

        .footer-hint {
          font-size: 12px; color: #475569; margin-top: 16px;
          letter-spacing: 0.5px; text-transform: uppercase;
          animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s both;
        }

        .top-nav {
          display: flex; justify-content: space-between; align-items: center;
          width: 100%; max-width: 1000px; margin: 0 auto;
          position: relative; z-index: 100;
        }
        .nav-logo {
          font-size: 15px; font-weight: 600; color: #FAF9F7;
          display: flex; alignItems: center; gap: 8px;
        }
        .nav-admin {
          font-size: 13px; color: #64748B; text-decoration: none;
          transition: color 0.2s;
        }
        .nav-admin:hover { color: #FAF9F7; }
      `}} />

      {/* Floating Animated Bubbles */}
      <div className="bg-bubble-1" />
      <div className="bg-bubble-2" />

      {/* Top Header Navigation */}
      <header className="top-nav">
        <div className="nav-logo">
          <Shirt size={16} />
          <span>BG Laundry</span>
        </div>
        <a href="/admin" className="nav-admin">Admin Portal</a>
      </header>

      {/* Center Onboarding Card */}
      <div className="content-card">
        <div className="logo-badge">BG</div>
        <h1 className="title">BG Laundry</h1>
        <p className="subtitle">
          Premium laundry & dry cleaning service at your doorstep.
        </p>

        <div className="badge-row">
          <div className="capsule-badge">24h Express</div>
          <div className="capsule-badge light">Free Pickup</div>
        </div>

        <button className="btn-start" onClick={handleStart}>
          Get Started
          <ArrowRight size={15} />
        </button>

        <span className="footer-hint">Secure Login • Fast Dispatch</span>
      </div>

      {/* Bottom Footer Credits */}
      <footer style={{
        textAlign: 'center', fontSize: '11px', color: '#334155',
        position: 'relative', zIndex: 100, width: '100%'
      }}>
        © 2026 BG Laundry & Dry Cleaning · Lagos, Nigeria
      </footer>
    </div>
  );
}
