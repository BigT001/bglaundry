'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const steps = [
  {
    num: '1',
    title: 'Schedule a Pickup',
    desc: 'Select your laundry items, add any special instructions, and pick a convenient pickup date and time right from your phone.',
    icon: '📅'
  },
  {
    num: '2',
    title: 'We Collect & Inspect',
    desc: 'Our courteous driver arrives at your doorstep, collects your laundry bag, and conducts a preliminary inspection.',
    icon: '🚚'
  },
  {
    num: '3',
    title: 'Expert Cleaning & Care',
    desc: 'Your clothes are pre-treated for stains, sorted by fabric type and color, and washed using eco-friendly, premium detergents.',
    icon: '🧼'
  },
  {
    num: '4',
    title: 'Steam Press & Quality Check',
    desc: 'Every garment is professionally steam-pressed or neatly folded, inspected for quality, and packaged carefully.',
    icon: '👔'
  },
  {
    num: '5',
    title: 'Delivered Fresh to Your Door',
    desc: 'We deliver your fresh, crisp, and neatly packaged garments back to you within 24 to 48 hours.',
    icon: '📦'
  }
];

export default function HowItWorksPage() {
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
        .top-nav{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #F1F5F9;background:#fff;}
        .nav-logo{cursor:pointer;display:flex;align-items:center;}
        .hamburger{width:44px;height:44px;background:#0B1B3E;border-radius:10px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;color:white;}
        .header-sec{padding:24px 20px;background:linear-gradient(160deg,#D6EAFF 0%,#F5F9FF 100%);}
        .header-sec h1{font-size:24px;font-weight:900;color:#0B1B3E;margin-bottom:6px;}
        .header-sec p{font-size:12px;color:#4B5563;}
        .content{padding:20px;flex:1;}
        .steps-list{display:flex;flex-direction:column;gap:18px;}
        .step-card{background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:18px;display:flex;gap:14px;align-items:flex-start;position:relative;}
        .step-num-badge{width:38px;height:38px;border-radius:50%;background:#1565C0;color:white;font-size:16px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .step-info h3{font-size:14px;font-weight:800;color:#0B1B3E;margin-bottom:4px;}
        .step-info p{font-size:11.5px;color:#64748B;line-height:1.5;}
        .cta-box{margin-top:20px;background:#EFF6FF;border:1px solid #DBEAFE;border-radius:14px;padding:20px;text-align:center;}
        .cta-box h3{font-size:15px;font-weight:900;color:#0B1B3E;margin-bottom:6px;}
        .cta-box p{font-size:11.5px;color:#475569;margin-bottom:14px;}
        .btn-start{height:46px;width:100%;background:#1565C0;color:white;border:none;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;font-family:'DM Sans',sans-serif;}
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
        <h1>How BG Laundry Works</h1>
        <p>5 simple steps from your hamper to fresh, clean clothes.</p>
      </div>

      <div className="content">
        <div className="steps-list">
          {steps.map((s) => (
            <div key={s.num} className="step-card">
              <div className="step-num-badge">{s.num}</div>
              <div className="step-info">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cta-box">
          <h3>Ready for fresh clothes?</h3>
          <p>Schedule your first pickup in less than 2 minutes.</p>
          <button className="btn-start" onClick={() => router.push('/login')}>
            Book a Pickup Now →
          </button>
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
