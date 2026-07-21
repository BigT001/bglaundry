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
        html{scroll-behavior:smooth;}
        body{font-family:'DM Sans',sans-serif;background:#fff;color:#0B1B3E;-webkit-font-smoothing:antialiased;}
        .shell{min-height:100vh;display:flex;flex-direction:column;background:#fff;max-width:480px;margin:0 auto;box-shadow:0 0 60px rgba(0,0,0,0.08);position:relative;}
        .top-nav{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #F1F5F9;background:#fff;z-index:100;}
        .nav-logo{cursor:pointer;display:flex;align-items:center;transition:transform 0.2s;}
        .nav-logo:active{transform:scale(0.96);}
        .hamburger{width:44px;height:44px;background:#0B1B3E;border-radius:12px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;color:white;transition:all 0.2s;box-shadow:0 2px 8px rgba(11,27,62,0.15);}
        .hamburger:active{transform:scale(0.94);}
        .header-sec{padding:28px 20px;background:linear-gradient(165deg,#D6EAFF 0%,#E8F4FF 50%,#F0F9FF 100%);border-bottom:1px solid rgba(255,255,255,0.5);}
        .header-sec h1{font-size:28px;font-weight:900;color:#0B1B3E;margin-bottom:8px;letter-spacing:-0.5px;}
        .header-sec p{font-size:13px;color:#4B5563;line-height:1.5;}
        .content{padding:24px 20px;flex:1;}
        .steps-list{display:flex;flex-direction:column;gap:16px;position:relative;}
        .steps-list::before{content:'';position:absolute;left:38px;top:60px;bottom:0;width:2px;background:linear-gradient(180deg,#1565C0 0%,#1565C0 40%,rgba(21,101,192,0.1) 100%);z-index:0;pointer-events:none;}
        .step-card{background:#fff;border:1.5px solid #E2E8F0;border-radius:16px;padding:20px;display:flex;gap:16px;align-items:flex-start;position:relative;z-index:1;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);box-shadow:0 2px 12px rgba(0,0,0,0.06);}
        .step-card:hover{border-color:#1565C0;box-shadow:0 8px 24px rgba(21,101,192,0.12);transform:translateY(-2px);}
        .step-card:active{transform:translateY(0);}
        .step-num-badge{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#1565C0 0%,#1a4dbe 100%);color:white;font-size:18px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 16px rgba(21,101,192,0.25);position:relative;}
        .step-icon{position:absolute;font-size:24px;width:52px;height:52px;display:flex;align-items:center;justify-content:center;pointer-events:none;}
        .step-info h3{font-size:15px;font-weight:800;color:#0B1B3E;margin-bottom:6px;letter-spacing:-0.3px;}
        .step-info p{font-size:12.5px;color:#64748B;line-height:1.6;margin-bottom:0;}
        .cta-box{margin-top:24px;background:linear-gradient(135deg,#EFF6FF 0%,#E0EFFE 100%);border:1.5px solid #DBEAFE;border-radius:16px;padding:24px;text-align:center;box-shadow:0 4px 16px rgba(21,101,192,0.08);}
        .cta-box h3{font-size:17px;font-weight:900;color:#0B1B3E;margin-bottom:8px;letter-spacing:-0.3px;}
        .cta-box p{font-size:12.5px;color:#475569;margin-bottom:18px;line-height:1.5;}
        .btn-start{height:50px;width:100%;background:linear-gradient(135deg,#1565C0 0%,#1a4dbe 100%);color:white;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;box-shadow:0 4px 16px rgba(21,101,192,0.28);letter-spacing:0.5px;text-transform:uppercase;}
        .btn-start:active{transform:scale(0.98);}
        .help-footer{position:sticky;bottom:0;background:linear-gradient(135deg,#0B1B3E 0%,#1a2d4d 100%);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;z-index:500;box-shadow:0 -2px 12px rgba(0,0,0,0.1);}
        .help-left{display:flex;align-items:center;gap:12px;}
        .help-ph-circle{width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;font-size:16px;color:white;flex-shrink:0;background:rgba(255,255,255,0.08);}
        .help-txt h4{font-size:12px;font-weight:800;color:white;margin-bottom:2px;}
        .help-txt p{font-size:10.5px;color:rgba(255,255,255,0.8);}
        .btn-wa{height:42px;padding:0 16px;background:white;color:#0B1B3E;border:none;border-radius:100px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap;flex-shrink:0;font-family:'DM Sans',sans-serif;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.1);}
        .btn-wa:active{transform:scale(0.96);}
        .drawer-ov{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:2000;display:flex;justify-content:flex-end;animation:fadeIn 0.3s ease-out;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .drawer-panel{background:white;width:280px;max-width:85vw;height:100%;padding:20px;display:flex;flex-direction:column;box-shadow:-4px 0 24px rgba(0,0,0,0.15);animation:slideIn 0.3s cubic-bezier(0.16,1,0.3,1);}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        .drawer-x{align-self:flex-end;background:none;border:none;cursor:pointer;color:#94A3B8;padding:8px;font-size:22px;transition:color 0.2s;}
        .drawer-x:active{color:#64748B;}
        .drawer-item{padding:16px 12px;border-bottom:1px solid #F1F5F9;font-size:15px;font-weight:700;color:#0B1B3E;background:none;border:none;text-align:left;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .drawer-item:hover{color:#1565C0;padding-left:16px;}
        .drawer-item.blue{color:#1565C0;font-weight:800;}
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
              <div className="step-num-badge">
                <div className="step-icon">{s.icon}</div>
                {s.num}
              </div>
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
