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
  const [dbServices, setDbServices] = useState<ServiceItem[]>(fallbackServices);
  const [category, setCategory] = useState<'Clothing' | 'Household' | 'Additional'>('Clothing');

  useEffect(() => {
    fetch('/api/v1/admin/services')
      .then((r) => r.json())
      .then((d) => { if (d.services?.length > 0) setDbServices(d.services); })
      .catch(() => {});
  }, []);

  const items = dbServices.filter((s) => s.category === category);

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
        .tabs{display:flex;gap:8px;margin-bottom:20px;}
        .tab-btn{flex:1;padding:10px;border-radius:10px;border:1.5px solid #E2E8F0;background:#fff;color:#64748B;font-weight:700;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;text-align:center;}
        .tab-btn.active{background:#1565C0;color:white;border-color:#1565C0;}
        .price-table{width:100%;border-collapse:collapse;font-size:12.5px;}
        .price-table th{background:#F8FAFC;color:#64748B;font-weight:800;padding:10px;border-bottom:1px solid #E2E8F0;text-align:left;font-size:11px;}
        .price-table td{padding:12px 10px;border-bottom:1px solid #F1F5F9;}
        .pm-name{font-weight:700;color:#0B1B3E;}
        .pm-val{color:#1565C0;font-weight:700;}
        .pm-book{padding:6px 12px;border-radius:100px;border:none;background:#1565C0;color:white;font-size:11px;font-weight:700;cursor:pointer;}
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
        <h1>Price Catalog</h1>
        <p>Transparent rates for all our laundry, dry cleaning, and pressing services.</p>
      </div>

      <div className="content">
        <div className="tabs">
          {(['Clothing', 'Household', 'Additional'] as const).map((cat) => (
            <button
              key={cat}
              className={`tab-btn${category === cat ? ' active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <table className="price-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Wash</th>
              <th>Iron</th>
              <th>Wash & Iron</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name}>
                <td className="pm-name">{item.name}</td>
                <td className="pm-val">{item.hasWash && item.washPrice > 0 ? `₦${item.washPrice.toLocaleString()}` : '—'}</td>
                <td className="pm-val">{item.hasIron && item.ironPrice > 0 ? `₦${item.ironPrice.toLocaleString()}` : '—'}</td>
                <td className="pm-val">{item.hasWashIron && item.washIronPrice > 0 ? `₦${item.washIronPrice.toLocaleString()}` : '—'}</td>
                <td>
                  <button className="pm-book" onClick={() => router.push('/login')}>
                    Book
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
