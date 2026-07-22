'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const serviceCards = [
  { icon: '🫧', title: 'Wash & Fold Laundry', desc: 'Everyday clothing, t-shirts, jeans, and casual wear washed with top-quality detergent and neatly folded.', cat: 'Clothing' },
  { icon: '🥼', title: 'Dry Cleaning', desc: 'Expert dry cleaning for delicate fabrics, designer suits, evening dresses, agbadas, and ceremonial wear.', cat: 'Clothing' },
  { icon: '🪝', title: 'Steam Ironing & Pressing', desc: 'Professional steam pressing for crisp, wrinkle-free business shirts, trousers, and formal attire.', cat: 'Clothing' },
  { icon: '✨', title: 'Stain Removal', desc: 'Specialized stain treatment targeting stubborn oil, wine, grease, and ink spots while preserving fabric color.', cat: 'Additional' },
  { icon: '👜', title: 'Shoe & Bag Restoration', desc: 'Deep cleaning, deodorizing, and surface restoration for leather shoes, sneakers, and handbags.', cat: 'Additional' },
  { icon: '🛵', title: 'Free Pickup & Doorstep Delivery', desc: 'Hassle-free collection from your home or office with scheduled delivery at your preferred time.', cat: 'Household' },
];

export default function ServicesPage() {
  const router = useRouter();
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <div className="shell">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{font-family:'DM Sans',sans-serif;background:#fff;color:#0B1B3E;-webkit-font-smoothing:antialiased;}
        .shell{min-height:100vh;display:flex;flex-direction:column;background:#fff;max-width:480px;margin:0 auto;box-shadow:0 0 60px rgba(0,0,0,0.08);position:relative;}
        .top-nav{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #F1F5F9;background:#fff;z-index:100;}
        .nav-logo{cursor:pointer;display:flex;align-items:center;transition:transform 0.2s;}
        .nav-logo:active{transform:scale(0.96);}
        .hamburger{width:44px;height:44px;background:#0B1B3E;border-radius:12px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;color:white;transition:all 0.2s;box-shadow:0 2px 8px rgba(11,27,62,0.15);}
        .hamburger:active{transform:scale(0.94);}
        .header-sec{padding:28px 20px;background:#fff;border-bottom:1px solid #F1F5F9;}
        .header-sec h1{font-size:28px;font-weight:900;color:#0B1B3E;margin-bottom:8px;letter-spacing:-0.5px;}
        .header-sec p{font-size:13px;color:#4B5563;line-height:1.5;}
        .content{padding:24px 20px;flex:1;}
        .svc-list{display:flex;flex-direction:column;gap:16px;}
        .svc-item{background:#fff;border:1.5px solid #E2E8F0;border-radius:16px;padding:20px;display:flex;gap:16px;align-items:flex-start;position:relative;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);box-shadow:0 2px 12px rgba(0,0,0,0.06);}
        .svc-item:hover{border-color:#1565C0;box-shadow:0 8px 24px rgba(21,101,192,0.12);transform:translateY(-2px);}
        .svc-item:active{transform:translateY(0);}
        .svc-icon{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#EFF6FF 0%,#E0EFFE 100%);border:1.5px solid #DBEAFE;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;box-shadow:0 2px 8px rgba(21,101,192,0.1);}
        .svc-details{flex:1;}
        .svc-badge{display:inline-block;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;padding:4px 10px;border-radius:100px;margin-bottom:8px;background:#F0F9FF;color:#1565C0;border:1px solid #DBEAFE;}
        .svc-details h3{font-size:15px;font-weight:800;color:#0B1B3E;margin-bottom:6px;letter-spacing:-0.3px;}
        .svc-details p{font-size:12.5px;color:#64748B;line-height:1.6;margin-bottom:12px;}
        .btn-view-price{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:800;color:#1565C0;background:none;border:none;cursor:pointer;transition:all 0.2s;letter-spacing:0.3px;}
        .btn-view-price:active{transform:scale(0.96);}
        .help-footer{position:sticky;bottom:0;background:linear-gradient(135deg,#0B1B3E 0%,#1a2d4d 100%);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;z-index:500;box-shadow:0 -2px 12px rgba(0,0,0,0.1);}
        .help-left{display:flex;align-items:center;gap:12px;}
        .help-ph-circle{width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;font-size:16px;color:white;flex-shrink:0;background:rgba(255,255,255,0.08);}
        .help-txt h4{font-size:12px;font-weight:800;color:white;margin-bottom:2px;}
        .help-txt p{font-size:10.5px;color:rgba(255,255,255,0.8);}
        .btn-wa{height:42px;padding:0 16px;background:white;color:#0B1B3E;border:none;border-radius:100px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap;flex-shrink:0;font-family:'DM Sans',sans-serif;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.1);}
        .btn-wa:active{transform:scale(0.96);}
        .drawer-ov{position:fixed;inset:0;background:rgba(10,22,44,0.42);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:2000;display:flex;justify-content:flex-end;animation:drawerFade 0.28s ease-out both;}
        @keyframes drawerFade{from{opacity:0}to{opacity:1}}
        .drawer-panel{background:linear-gradient(180deg,#FFFFFF 0%,#F9FBFF 100%);width:300px;max-width:85vw;height:100%;padding:0;display:flex;flex-direction:column;box-shadow:-12px 0 48px rgba(15,23,42,0.22);border-left:1px solid rgba(148,163,184,0.16);border-radius:0 24px 24px 0;transform:translateX(110%) scale(0.98);opacity:0;animation:drawerSlideIn 0.34s cubic-bezier(0.22,1,0.36,1) forwards;}
        @keyframes drawerSlideIn{from{transform:translateX(110%) scale(0.98);opacity:0;}to{transform:translateX(0) scale(1);opacity:1;}}
        .drawer-header{padding:22px 22px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #E2E8F0;}
        .drawer-header h3{font-size:16px;font-weight:900;color:#0B1B3E;}
        .drawer-x{width:40px;height:40px;background:#F1F5F9;border:none;border-radius:14px;cursor:pointer;color:#475569;padding:0;font-size:20px;transition:transform 0.2s,background-color 0.2s,color 0.2s;display:flex;align-items:center;justify-content:center;}
        .drawer-x:hover{background:#E2E8F0;color:#0B1B3E;}
        .drawer-x:active{transform:scale(0.94);}
        .drawer-items{flex:1;overflow-y:auto;padding:12px 0;}
        .drawer-item{padding:16px 22px;margin:0 12px;border-radius:14px;border:none;font-size:15px;font-weight:700;color:#0B1B3E;background:transparent;text-align:left;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s ease;display:block;width:calc(100% - 24px);}
        .drawer-item:last-child{margin-bottom:24px;}
        .drawer-item:hover{background:#F8FAFC;color:#0F4BB6;padding-left:24px;box-shadow:inset 4px 0 0 rgba(21,101,192,0.18);}
        .drawer-item.blue{color:#0F4BB6;font-weight:800;background:rgba(21,101,192,0.08);box-shadow:inset 4px 0 0 rgba(21,101,192,0.24);}
        .drawer-item.blue:hover{background:rgba(21,101,192,0.12);}
      `}} />

      <header className="top-nav">
        <div className="nav-logo" onClick={() => router.push('/')}>
          <Image src="/bglogo.png" alt="BG Laundry" width={64} height={64} style={{ objectFit: 'contain' }} priority />
        </div>
        <button className="hamburger" onClick={() => setShowDrawer(true)}>
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><rect width="20" height="2.4" rx="1.2" fill="white"/><rect y="5.8" width="20" height="2.4" rx="1.2" fill="white"/><rect y="11.6" width="20" height="2.4" rx="1.2" fill="white"/></svg>
        </button>
      </header>

      <div className="header-sec">
        <h1>Our Services</h1>
        <p>Comprehensive laundry, dry cleaning, and fabric care tailored for you.</p>
      </div>

      <div className="content">
        <div className="svc-list">
          {serviceCards.map((s) => (
            <div key={s.title} className="svc-item">
              <div className="svc-icon">{s.icon}</div>
              <div className="svc-details">
                <div className="svc-badge">{s.cat}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <button className="btn-view-price" onClick={() => router.push('/pricing')}>
                  View Pricing & Rates →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="help-footer">
        <div className="help-left">
          <div className="help-ph-circle">📞</div>
          <div className="help-txt">
            <h4>Need help?</h4>
            <p>0705 815 5555 | 0805 825 5555</p>
          </div>
        </div>
        <button className="btn-wa" onClick={() => window.open('https://wa.me/2348058255555', '_blank')}>
          💬 WHATSAPP US
        </button>
      </footer>

      {showDrawer && (
        <div className="drawer-ov" onClick={() => setShowDrawer(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Menu</h3>
              <button className="drawer-x" onClick={() => setShowDrawer(false)}>✕</button>
            </div>
            <div className="drawer-items">
              <button className="drawer-item" onClick={() => { router.push('/'); setShowDrawer(false); }}>Home</button>
              <button className="drawer-item" onClick={() => { router.push('/how-it-works'); setShowDrawer(false); }}>How It Works</button>
              <button className="drawer-item" onClick={() => { router.push('/services'); setShowDrawer(false); }}>Our Services</button>
              <button className="drawer-item" onClick={() => { router.push('/pricing'); setShowDrawer(false); }}>Price Catalog</button>
              <button className="drawer-item blue" onClick={() => { router.push('/login'); setShowDrawer(false); }}>🔐 Sign In</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
