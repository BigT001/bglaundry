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
        body{font-family:'DM Sans',sans-serif;background:#fff;color:#0B1B3E;}
        .shell{min-height:100vh;display:flex;flex-direction:column;background:#fff;max-width:480px;margin:0 auto;box-shadow:0 0 60px rgba(0,0,0,0.06);position:relative;}
        .top-nav{display:flex;align-items:center;justify-space-between;padding:18px 20px;border-bottom:1px solid #F1F5F9;background:#fff;}
        .nav-logo{cursor:pointer;display:flex;align-items:center;}
        .hamburger{width:44px;height:44px;background:#0B1B3E;border-radius:10px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;color:white;}
        .header-sec{padding:24px 20px;background:linear-gradient(160deg,#D6EAFF 0%,#F5F9FF 100%);}
        .header-sec h1{font-size:24px;font-weight:900;color:#0B1B3E;margin-bottom:6px;}
        .header-sec p{font-size:12px;color:#4B5563;}
        .content{padding:20px;flex:1;}
        .svc-list{display:flex;flex-direction:column;gap:14px;}
        .svc-item{background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:16px;display:flex;gap:14px;align-items:flex-start;}
        .svc-icon{width:46px;height:46px;border-radius:12px;background:#EFF6FF;border:1px solid #DBEAFE;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
        .svc-details h3{font-size:14px;font-weight:800;color:#0B1B3E;margin-bottom:4px;}
        .svc-details p{font-size:11.5px;color:#64748B;line-height:1.5;margin-bottom:10px;}
        .btn-view-price{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;color:#1565C0;background:none;border:none;cursor:pointer;}
        .help-footer{position:sticky;bottom:0;background:#0B1B3E;padding:13px 20px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:500;}
        .help-left{display:flex;align-items:center;gap:10px;}
        .help-ph-circle{width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center;font-size:15px;color:white;flex-shrink:0;}
        .help-txt h4{font-size:11.5px;font-weight:800;color:white;margin-bottom:1px;}
        .help-txt p{font-size:10px;color:rgba(255,255,255,0.75);}
        .btn-wa{height:39px;padding:0 15px;background:white;color:#0B1B3E;border:none;border-radius:100px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:5px;white-space:nowrap;flex-shrink:0;font-family:'DM Sans',sans-serif;}
        .drawer-ov{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;justify-content:flex-end;}
        .drawer-panel{background:white;width:280px;max-width:85vw;height:100%;padding:20px;display:flex;flex-direction:column;}
        .drawer-x{align-self:flex-end;background:none;border:none;cursor:pointer;color:#64748B;padding:6px;font-size:20px;}
        .drawer-item{padding:14px 8px;border-bottom:1px solid #F1F5F9;font-size:15px;font-weight:700;color:#0B1B3E;background:none;border:none;text-align:left;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .drawer-item.blue{color:#1565C0;}
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
            <button className="drawer-x" onClick={() => setShowDrawer(false)}>✕</button>
            <button className="drawer-item" onClick={() => router.push('/')}>Home</button>
            <button className="drawer-item" onClick={() => router.push('/how-it-works')}>How It Works</button>
            <button className="drawer-item" onClick={() => router.push('/services')}>Our Services</button>
            <button className="drawer-item" onClick={() => router.push('/pricing')}>Price Catalog</button>
            <button className="drawer-item blue" onClick={() => router.push('/login')}>🔐 Sign In</button>
          </div>
        </div>
      )}
    </div>
  );
}
