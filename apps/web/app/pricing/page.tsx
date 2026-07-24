'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ServiceItem {
  name: string;
  category: 'Clothing' | 'Household' | 'Additional';
  washPrice: number;
  ironPrice: number;
  washIronPrice: number;
  hasWash: boolean;
  hasIron: boolean;
  hasWashIron: boolean;
}

const fallbackServices: ServiceItem[] = [
  { name: 'T-Shirt / Polo', category: 'Clothing', washPrice: 500, ironPrice: 300, washIronPrice: 700, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Dress Shirt', category: 'Clothing', washPrice: 700, ironPrice: 400, washIronPrice: 1000, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Trouser', category: 'Clothing', washPrice: 500, ironPrice: 300, washIronPrice: 700, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Jeans', category: 'Clothing', washPrice: 700, ironPrice: 400, washIronPrice: 1000, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Shorts', category: 'Clothing', washPrice: 300, ironPrice: 200, washIronPrice: 500, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Dress', category: 'Clothing', washPrice: 1300, ironPrice: 700, washIronPrice: 2000, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Two-Piece Suit', category: 'Clothing', washPrice: 2500, ironPrice: 1200, washIronPrice: 3500, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Blazer', category: 'Clothing', washPrice: 1000, ironPrice: 600, washIronPrice: 1500, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Senator Wear (2 pcs)', category: 'Clothing', washPrice: 1000, ironPrice: 500, washIronPrice: 1500, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Agbada (Complete Set)', category: 'Clothing', washPrice: 2500, ironPrice: 1200, washIronPrice: 3500, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Kaftan', category: 'Clothing', washPrice: 1300, ironPrice: 700, washIronPrice: 2000, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Jacket', category: 'Clothing', washPrice: 1000, ironPrice: 600, washIronPrice: 1500, hasWash: true, hasIron: true, hasWashIron: true },
  { name: 'Tie', category: 'Clothing', washPrice: 0, ironPrice: 300, washIronPrice: 300, hasWash: false, hasIron: true, hasWashIron: true },
  { name: 'Bed Sheet', category: 'Household', washPrice: 1000, ironPrice: 0, washIronPrice: 1500, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Duvet (Small)', category: 'Household', washPrice: 2500, ironPrice: 0, washIronPrice: 3000, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Duvet (Large/King)', category: 'Household', washPrice: 3500, ironPrice: 0, washIronPrice: 4000, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Blanket', category: 'Household', washPrice: 3000, ironPrice: 0, washIronPrice: 3500, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Pillow', category: 'Household', washPrice: 600, ironPrice: 0, washIronPrice: 800, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Curtain (Per Panel)', category: 'Household', washPrice: 1500, ironPrice: 0, washIronPrice: 2000, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Bath Towel', category: 'Household', washPrice: 600, ironPrice: 0, washIronPrice: 800, hasWash: true, hasIron: false, hasWashIron: true },
  { name: 'Stain Removal', category: 'Additional', washPrice: 1000, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Spot Cleaning', category: 'Additional', washPrice: 500, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Fabric Softener', category: 'Additional', washPrice: 200, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Premium Fragrance', category: 'Additional', washPrice: 200, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Shoe Cleaning', category: 'Additional', washPrice: 4000, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Bag Cleaning', category: 'Additional', washPrice: 4000, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
  { name: 'Wedding Gown Care', category: 'Additional', washPrice: 15000, ironPrice: 0, washIronPrice: 0, hasWash: true, hasIron: false, hasWashIron: false },
];

export default function PricingPage() {
  const router = useRouter();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [dbServices, setDbServices] = useState<ServiceItem[]>(fallbackServices);
  const [category, setCategory] = useState<'Clothing' | 'Household' | 'Additional'>('Clothing');

  useEffect(() => {
    fetch('/api/v1/admin/services')
      .then((r) => r.json())
      .then((d) => { if (d.services?.length > 0) setDbServices(d.services); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const updateViewport = () => setIsMobile(media.matches);
    updateViewport();
    media.addEventListener?.('change', updateViewport);
    return () => media.removeEventListener?.('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!isMobile || !showPricingModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, showPricingModal]);

  const closePricing = () => {
    setShowPricingModal(false);
    if (!isMobile) return;
    const returnTo = sessionStorage.getItem('pricingReturnTo');
    sessionStorage.removeItem('pricingReturnTo');
    if (returnTo && returnTo !== '/pricing') {
      router.back();
      return;
    }
    router.replace('/');
  };

  const items = dbServices.filter((s) => s.category === category);

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
        .content{padding:24px 20px;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .info-panel{background:#fff;border:1.5px solid #E2E8F0;border-radius:20px;padding:32px 24px;text-align:center;max-width:380px;box-shadow:0 2px 24px rgba(15,23,42,0.08);}
        .info-panel h2{font-size:22px;font-weight:900;color:#0B1B3E;margin-bottom:10px;letter-spacing:-0.3px;}
        .info-panel p{font-size:13px;color:#525F7F;line-height:1.6;margin:0;}
        .cta-btn{height:50px;width:100%;background:linear-gradient(135deg,#1565C0 0%,#1a4dbe 100%);color:white;border:none;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;box-shadow:0 4px 16px rgba(21,101,192,0.28);letter-spacing:0.5px;text-transform:uppercase;}
        .cta-btn:active{transform:scale(0.98);}
        .pm-ov{position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:3000;display:flex;align-items:flex-end;justify-content:center;}
        .pm-sheet{background:white;border-radius:24px 24px 0 0;padding:22px 18px 32px;width:100%;max-width:480px;max-height:85vh;overflow-y:auto;position:relative;animation:slideUpSheet 0.32s cubic-bezier(0.16,1,0.3,1) both;box-shadow:0 -10px 40px rgba(0,0,0,0.18);}
        @keyframes slideUpSheet{from{transform:translateY(100%);}to{transform:translateY(0);}}
        .pm-handle{width:44px;height:4.5px;background:#CBD5E1;border-radius:3px;margin:0 auto 16px;}
        .pm-x{position:absolute;top:16px;right:16px;background:#F1F5F9;border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#64748B;transition:all 0.2s;}
        .pm-x:active{transform:scale(0.9);}
        .pm-title{font-size:19px;font-weight:900;color:#0B1B3E;text-align:center;margin-bottom:14px;letter-spacing:-0.3px;}
        .pm-tabs{display:flex;gap:8px;justify-content:center;margin-bottom:16px;flex-wrap:wrap;}
        .pm-tab{padding:8px 18px;border-radius:100px;border:1.5px solid #E2E8F0;background:transparent;color:#64748B;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .pm-tab:active{transform:scale(0.96);}
        .pm-tab.active{background:linear-gradient(135deg,#1565C0 0%,#1a4dbe 100%);color:white;border-color:transparent;box-shadow:0 4px 12px rgba(21,101,192,0.24);}
        .pm-table{width:100%;border-collapse:collapse;font-size:12px;}
        .pm-table th{background:#F8FAFC;color:#64748B;font-weight:800;padding:11px 10px;border-bottom:1.5px solid #E2E8F0;text-align:left;font-size:11px;letter-spacing:0.3px;}
        .pm-table td{padding:12px 10px;border-bottom:1px solid #F1F5F9;}
        .pm-table tr:last-child td{border-bottom:none;}
        .pm-nm{font-weight:800;color:#0B1B3E;}
        .pm-pr{color:#1565C0;font-weight:800;font-size:13px;}
        .pm-bk{padding:8px 14px;border-radius:100px;border:none;background:linear-gradient(135deg,#1565C0 0%,#1a4dbe 100%);color:white;font-size:11px;font-weight:800;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(21,101,192,0.2);}
        .pm-bk:active{transform:scale(0.96);}
        .pm-grid{display:none;grid-template-columns:1fr 1fr;gap:8px;}
        .pm-card{background:#F8FAFC;border:1px solid #F1F5F9;border-radius:12px;padding:10px;}
        .pm-card-t{font-size:12px;font-weight:800;color:#0B1B3E;margin-bottom:7px;padding-bottom:5px;border-bottom:1px solid #F1F5F9;}
        .pm-card-r{display:flex;justify-content:space-between;font-size:10.5px;color:#64748B;margin-bottom:3px;}
        .pm-card-r .v{color:#1565C0;font-weight:700;}
        .pm-card-bk{width:100%;height:30px;border-radius:100px;border:none;background:#1565C0;color:white;font-size:10.5px;font-weight:700;cursor:pointer;margin-top:7px;}
        @media(max-width:400px){.pm-table{display:none;}.pm-grid{display:grid;}}
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
        @media(max-width:1023px){
          .pricing-route-page{display:none!important;}
          .shell{min-height:100dvh;box-shadow:none;}
        }
      `}} />

      <header className="top-nav pricing-route-page">
        <div className="nav-logo" onClick={() => router.push('/')}>
          <Image src="/bglogo.png" alt="BG Laundry" width={64} height={64} style={{ objectFit: 'contain' }} priority />
        </div>
        <button className="hamburger" onClick={() => setShowDrawer(true)}>
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><rect width="20" height="2.4" rx="1.2" fill="white"/><rect y="5.8" width="20" height="2.4" rx="1.2" fill="white"/><rect y="11.6" width="20" height="2.4" rx="1.2" fill="white"/></svg>
        </button>
      </header>

      <div className="header-sec pricing-route-page">
        <h1>Price Catalog</h1>
        <p>Transparent rates for all our laundry, dry cleaning, and pressing services.</p>
      </div>

      <div className="content pricing-route-page">
        <div className="info-panel">
          <h2>Price Catalog</h2>
          <p>Your full pricing list opens automatically in the slide-up catalog. Close it when you’re done browsing.</p>
        </div>
      </div>

      <footer className="help-footer pricing-route-page">
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
              <button className="drawer-item" onClick={() => { setShowPricingModal(true); setShowDrawer(false); }}>Price Catalog</button>
              <button className="drawer-item blue" onClick={() => { router.push('/login'); setShowDrawer(false); }}>🔐 Sign In</button>
            </div>
          </div>
        </div>
      )}

      {showPricingModal && (
        <div className="pm-ov" onClick={closePricing}>
          <div className="pm-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="pm-handle" />
            <button className="pm-x" onClick={closePricing}>✕</button>
            <p className="pm-title">Service Pricing</p>
            <div className="pm-tabs">
              {(['Clothing', 'Household', 'Additional'] as const).map((cat) => (
                <button key={cat} className={`pm-tab${category === cat ? ' active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
              ))}
            </div>
            <table className="pm-table">
              <thead><tr><th>Item</th><th>Wash</th><th>Iron</th><th>Both</th><th></th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.name}>
                    <td className="pm-nm">{item.name}</td>
                    <td className="pm-pr">{item.hasWash && item.washPrice > 0 ? `₦${item.washPrice.toLocaleString()}` : '—'}</td>
                    <td className="pm-pr">{item.hasIron && item.ironPrice > 0 ? `₦${item.ironPrice.toLocaleString()}` : '—'}</td>
                    <td className="pm-pr">{item.hasWashIron && item.washIronPrice > 0 ? `₦${item.washIronPrice.toLocaleString()}` : '—'}</td>
                    <td><button className="pm-bk" onClick={() => router.push('/login')}>Book</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pm-grid">
              {items.map((item) => (
                <div key={item.name} className="pm-card">
                  <p className="pm-card-t">{item.name}</p>
                  {item.hasWash && item.washPrice > 0 && <div className="pm-card-r"><span>Wash</span><span className="v">₦{item.washPrice.toLocaleString()}</span></div>}
                  {item.hasIron && item.ironPrice > 0 && <div className="pm-card-r"><span>Iron</span><span className="v">₦{item.ironPrice.toLocaleString()}</span></div>}
                  {item.hasWashIron && item.washIronPrice > 0 && <div className="pm-card-r"><span>Both</span><span className="v">₦{item.washIronPrice.toLocaleString()}</span></div>}
                  <button className="pm-card-bk" onClick={() => router.push('/login')}>Book Now</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
