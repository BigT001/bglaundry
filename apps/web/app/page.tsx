'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { X } from '@/lib/icons';

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

const serviceCards = [
  { icon: '🫧', title: 'Laundry', desc: 'Washing & folding for everyday wear.', cat: 'Clothing' as const },
  { icon: '🥼', title: 'Dry Cleaning', desc: 'Gentle care for delicate fabrics.', cat: 'Clothing' as const },
  { icon: '🪝', title: 'Ironing', desc: 'Crisp, neat & perfectly pressed.', cat: 'Clothing' as const },
  { icon: '✨', title: 'Stain Removal', desc: 'Tough on stains, gentle on fabrics.', cat: 'Additional' as const },
  { icon: '👜', title: 'Shoe & Bag Cleaning', desc: 'Deep cleaning for shoes, bags & accessories.', cat: 'Additional' as const },
  { icon: '🛵', title: 'Pickup & Delivery', desc: 'Free pickup & delivery right to your door.', cat: 'Household' as const },
];

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [dbServices, setDbServices] = useState<ServiceItem[]>(fallbackServices);
  const [pricingCategory, setPricingCategory] = useState<'Clothing' | 'Household' | 'Additional'>('Clothing');
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'SELECT' | 'LOGIN' | 'SIGNUP'>('SELECT');
  const [loginStep, setLoginStep] = useState<'PHONE' | 'NAME' | 'ADDRESS' | 'PASSWORD'>('PHONE');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [addressType, setAddressType] = useState<'HOME' | 'OFFICE'>('HOME');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('customerToken'));
    fetch('/api/v1/admin/services')
      .then((r) => r.json())
      .then((d) => { if (d.services?.length > 0) setDbServices(d.services); })
      .catch(() => {});
  }, []);

  const handleStart = () => {
    if (loggedIn) { router.push('/dashboard'); return; }
    setLoginMode('SELECT');
    setLoginStep('PHONE');
    setPhone('');
    setPassword('');
    setFullName('');
    setPickupAddress('');
    setAddressType('HOME');
    setLoginError('');
    setShowLoginModal(true);
  };

  const handleBook = (name: string) => {
    if (loggedIn) { router.push('/dashboard'); return; }
    setLoginMode('SELECT');
    setLoginStep('PHONE');
    setPhone('');
    setPassword('');
    setFullName('');
    setPickupAddress('');
    setAddressType('HOME');
    setLoginError('');
    setShowLoginModal(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password || loginLoading) return;
    setLoginLoading(true);
    setLoginError('');

    try {
      const { data } = await axios.post('/api/v1/auth/login', {
        phoneNumber: phone,
        password: password,
      });

      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      setLoggedIn(true);
      setShowLoginModal(false);
      router.push('/dashboard');
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Login failed. Please try again.');
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !fullName || !pickupAddress || !password || loginLoading) return;
    setLoginLoading(true);
    setLoginError('');

    try {
      const { data } = await axios.post('/api/v1/auth/signup', {
        phoneNumber: phone,
        fullName: fullName,
        pickupAddress: pickupAddress,
        addressType: addressType,
        password: password,
      });

      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      setLoggedIn(true);
      setShowLoginModal(false);
      router.push('/dashboard');
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Signup failed. Please try again.');
      setLoginLoading(false);
    }
  };

  const displayServices = dbServices.filter((s) => s.category === pricingCategory);

  const css = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;background:#fff;color:#0B1B3E;overflow-x:hidden;}
    .shell{min-height:100vh;display:flex;flex-direction:column;background:#fff;position:relative;max-width:480px;margin:0 auto;box-shadow:0 0 60px rgba(0,0,0,0.06);}
    .top-nav{position:absolute;top:0;left:0;right:0;z-index:100;display:flex;align-items:flex-start;justify-content:space-between;padding:18px 20px 0;}
    .nav-logo{display:flex;flex-direction:column;align-items:center;cursor:pointer;}
    .hamburger{width:46px;height:46px;background:#0B1B3E;border-radius:10px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;color:white;flex-shrink:0;}
    
    /* ── HERO SECTION WITH LARGE BACKGROUND ── */
    .hero-section{
      position: relative;
      overflow: hidden;
      padding: 100px 20px 28px;
      min-height: 520px;
      background-image: url('/hero-bg.jpg');
      background-size: cover;
      background-position: center right;
      background-repeat: no-repeat;
    }
    .hero-section::before{
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.80) 22%, rgba(255,255,255,0.18) 56%, rgba(255,255,255,0.08) 100%);
      pointer-events: none;
      z-index: 1;
    }
    .hero-content-wrap{
      position: relative;
      z-index: 2;
      max-width: 560px;
    }
    .hero-h1{font-size:38px;font-weight:900;color:#0B1B3E;text-transform:uppercase;line-height:1.04;letter-spacing:-0.6px;}
    .hero-h1-blue{color:#1565C0;display:block;}
    .hero-ul{display:flex;align-items:center;gap:5px;margin:10px 0 12px;}
    .hero-ul-bar{width:28px;height:3.5px;background:#1565C0;border-radius:2px;}
    .hero-ul-dot{width:6px;height:6px;border-radius:50%;background:#1565C0;}
    .hero-sub{font-size:12.5px;color:#4B5563;line-height:1.6;margin-bottom:18px;max-width:70%;}
    .hf-list{display:flex;flex-direction:column;gap:12px;margin-bottom:22px;}
    .hf-item{display:flex;align-items:flex-start;gap:12px;}
    .hf-icon{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#1565C0 0%,#1a4dbe 100%);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;color:white;box-shadow:0 4px 14px rgba(21,101,192,0.28);}
    .hf-text h4{font-size:13px;font-weight:800;color:#0B1B3E;margin-bottom:2px;letter-spacing:-0.2px;}
    .hf-text p{font-size:11px;color:#64748B;line-height:1.45;}

    .hero-ctas{display:flex;gap:10px;margin-bottom:14px;position:relative;z-index:3;}
    .btn-book{flex:1;height:52px;background:linear-gradient(135deg,#1565C0 0%,#1a4dbe 100%);color:white;border:none;border-radius:12px;font-weight:800;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;text-transform:uppercase;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(21,101,192,0.32);font-family:'DM Sans',sans-serif;transition:all 0.2s;}
    .btn-book:active{transform:scale(0.98);}
    .btn-chat{flex:1;height:52px;background:white;color:#0B1B3E;border:1.5px solid #CBD5E1;border-radius:12px;font-weight:800;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;text-transform:uppercase;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
    .btn-chat:active{border-color:#1565C0;box-shadow:0 2px 8px rgba(21,101,192,0.1);}
    .social-proof{display:flex;align-items:center;gap:10px;background:white;border:1px solid #E2E8F0;border-radius:12px;padding:12px 16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);position:relative;z-index:3;}
    .av-stack{display:flex;}
    .av{width:27px;height:27px;border-radius:50%;border:2px solid white;background:#CBD5E1;margin-left:-7px;display:flex;align-items:center;justify-content:center;font-size:12px;overflow:hidden;flex-shrink:0;}
    .av:first-child{margin-left:0;}
    .sp-stars{color:#F59E0B;font-size:13px;letter-spacing:1px;flex-shrink:0;}
    .sp-text{font-size:11px;color:#4B5563;font-weight:600;}

    .hiw-section{background:white;padding:32px 20px 28px;border-top:1px solid #F1F5F9;}
    .sec-label{display:flex;align-items:center;justify-content:center;gap:10px;font-size:10px;font-weight:800;color:#1565C0;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:8px;}
    .sec-label::before,.sec-label::after{content:'';flex:1;max-width:36px;height:1px;background:#CBD5E1;}
    .sec-title{text-align:center;font-size:22px;font-weight:900;color:#0B1B3E;margin-bottom:26px;font-style:italic;}
    .steps-row{display:flex;justify-content:space-between;position:relative;max-width:360px;margin:0 auto;}
    .steps-conn{position:absolute;top:35px;left:18%;right:18%;border-top:2px dashed #CBD5E1;z-index:0;}
    .step-col{flex:1;display:flex;flex-direction:column;align-items:center;z-index:1;padding:0 6px;}
    .step-wrap{position:relative;width:70px;height:70px;background:#EFF6FF;border-radius:50%;border:1.5px solid #DBEAFE;display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:10px;}
    .step-badge{position:absolute;bottom:1px;right:1px;width:20px;height:20px;background:#1565C0;border-radius:50%;border:2px solid white;color:white;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;}
    .step-title{font-size:11px;font-weight:900;color:#0B1B3E;text-transform:uppercase;letter-spacing:0.5px;text-align:center;margin-bottom:3px;}
    .step-desc{font-size:10px;color:#6B7280;text-align:center;line-height:1.4;}

    .services-section{background:#F8FAFC;padding:26px 20px 90px;border-top:1px solid #F1F5F9;}
    .svc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .svc-card{background:white;border:1.5px solid #E2E8F0;border-radius:14px;padding:14px 12px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);}
    .svc-card:hover{border-color:#1565C0;box-shadow:0 6px 16px rgba(21,101,192,0.12);transform:translateY(-2px);}
    .svc-card:active{transform:translateY(0);}
    .svc-left{display:flex;align-items:center;gap:8px;min-width:0;}
    .svc-icon{width:36px;height:36px;border-radius:9px;background:#EFF6FF;border:1px solid #DBEAFE;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
    .svc-info h3{font-size:12px;font-weight:800;color:#0B1B3E;margin-bottom:1px;line-height:1.2;}
    .svc-info p{font-size:9.5px;color:#6B7280;line-height:1.3;}
    .svc-chev{color:#9CA3AF;flex-shrink:0;font-size:16px;font-weight:700;}

    .help-footer{position:sticky;bottom:0;background:linear-gradient(135deg,#0B1B3E 0%,#1a2d4d 100%);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;z-index:500;box-shadow:0 -2px 12px rgba(0,0,0,0.1);}
    .help-left{display:flex;align-items:center;gap:12px;}
    .help-ph-circle{width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;font-size:16px;color:white;flex-shrink:0;background:rgba(255,255,255,0.08);}
    .help-txt h4{font-size:12px;font-weight:800;color:white;margin-bottom:2px;}
    .help-txt p{font-size:10.5px;color:rgba(255,255,255,0.8);}
    .btn-wa{height:42px;padding:0 16px;background:white;color:#0B1B3E;border:none;border-radius:100px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap;flex-shrink:0;font-family:'DM Sans',sans-serif;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.1);}
    .btn-wa:active{transform:scale(0.96);}


    .drawer-ov{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:2000;display:flex;justify-content:flex-end;animation:fadeIn 0.3s ease-out;}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .drawer-panel{background:white;width:280px;max-width:85vw;height:100%;padding:20px;display:flex;flex-direction:column;box-shadow:-4px 0 24px rgba(0,0,0,0.15);animation:slideD 0.3s cubic-bezier(0.16,1,0.3,1) both;}
    @keyframes slideD{from{transform:translateX(100%)}to{transform:translateX(0)}}
    .drawer-x{align-self:flex-end;background:none;border:none;cursor:pointer;color:#94A3B8;padding:8px;border-radius:50%;margin-bottom:14px;font-size:22px;transition:color 0.2s;}
    .drawer-x:active{color:#64748B;}
    .drawer-item{padding:16px 12px;border-bottom:1px solid #F1F5F9;font-size:15px;font-weight:700;color:#0B1B3E;background:none;border-top:none;border-left:none;border-right:none;text-align:left;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
    .drawer-item:hover{color:#1565C0;padding-left:16px;}
    .drawer-item.blue{color:#1565C0;border-bottom:none;font-weight:800;}

    /* ── PRICING SLIDE-OUT BOTTOM SHEET MODAL ── */
    .pm-ov{position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:3000;display:flex;align-items:flex-end;justify-content:center;}
    .pm-sheet{
      background:white;
      border-radius:24px 24px 0 0;
      padding:22px 18px 32px;
      width:100%;
      max-width:480px;
      max-height:85vh;
      overflow-y:auto;
      position:relative;
      animation:slideUpSheet 0.32s cubic-bezier(0.16,1,0.3,1) both;
      box-shadow: 0 -10px 40px rgba(0,0,0,0.18);
    }
    @keyframes slideUpSheet{
      from{transform:translateY(100%);}
      to{transform:translateY(0);}
    }
    .pm-handle{width:44px;height:4.5px;background:#CBD5E1;border-radius:3px;margin:0 auto 16px;}
    .pm-x{position:absolute;top:16px;right:16px;background:#F1F5F9;border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#64748B;}
    .pm-title{font-size:19px;font-weight:900;color:#0B1B3E;text-align:center;margin-bottom:14px;}
    .pm-tabs{display:flex;gap:7px;justify-content:center;margin-bottom:16px;flex-wrap:wrap;}
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

    .modal-ov{position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,0.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;}
    .modal-box{background:white;border-radius:20px;padding:26px 22px;width:100%;max-width:380px;position:relative;box-shadow:0 20px 50px rgba(0,0,0,0.15);animation:fUp 0.35s cubic-bezier(0.16,1,0.3,1) both;}
    @keyframes fUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .modal-x{position:absolute;top:16px;right:16px;background:#F1F5F9;border:none;cursor:pointer;color:#64748B;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
    .modal-ttl{font-size:20px;font-weight:900;color:#0B1B3E;margin-bottom:5px;}
    .modal-sub{font-size:12.5px;color:#64748B;margin-bottom:18px;line-height:1.5;}
    .m-err{padding:9px 13px;background:#FEF2F2;border:1px solid #FEE2E2;color:#DC2626;border-radius:10px;font-size:12px;margin-bottom:12px;}
    .m-info{padding:9px 13px;background:#ECFDF5;border:1px solid #D1FAE5;color:#059669;border-radius:10px;font-size:12px;margin-bottom:12px;}
    .f-lbl{font-size:11.5px;font-weight:700;color:#475569;display:block;margin-bottom:5px;}
    .f-inp{width:100%;height:47px;border:1.5px solid #E2E8F0;border-radius:12px;padding:0 14px;font-size:14px;font-family:'DM Sans',sans-serif;margin-bottom:13px;transition:border-color 0.2s;}
    .f-inp:focus{border-color:#1565C0;outline:none;}
    .m-sub{width:100%;height:47px;border-radius:12px;border:none;background:#1565C0;color:white;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;}
    .m-sub:disabled{background:#94A3B8;cursor:not-allowed;}
    #recaptcha-container{position:absolute!important;visibility:hidden!important;width:0!important;height:0!important;overflow:hidden!important;}
    @media(min-width:481px){.shell{border-radius:24px;margin:20px auto;min-height:calc(100vh - 40px);}}
  `;

  return (
    <div className="shell">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* NAV */}
      <header className="top-nav">
        <div className="nav-logo" onClick={() => router.push('/')}>
          <Image src="/bglogo.png" alt="BG Laundry" width={70} height={70} style={{ objectFit: 'contain' }} priority />
        </div>
        <button className="hamburger" aria-label="Open menu" onClick={() => setShowMenuDrawer(true)}>
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
            <rect width="20" height="2.4" rx="1.2" fill="white" />
            <rect y="5.8" width="20" height="2.4" rx="1.2" fill="white" />
            <rect y="11.6" width="20" height="2.4" rx="1.2" fill="white" />
          </svg>
        </button>
      </header>

      {/* HERO SECTION WITH LARGE BACKGROUND IMAGE */}
      <section id="home" className="hero-section">
        <div className="hero-content-wrap">
          <h1 className="hero-h1">
            Clean Clothes.
            <span className="hero-h1-blue">Happy Life.</span>
          </h1>
          <div className="hero-ul">
            <div className="hero-ul-bar" />
            <div className="hero-ul-dot" />
          </div>
          <p className="hero-sub">
            Premium laundry and dry cleaning services with care, delivered to your door.
          </p>

          <div className="hf-list">
            <div className="hf-item">
              <div className="hf-icon">👑</div>
              <div className="hf-text">
                <h4>Premium Care</h4>
                <p>Top-quality cleaning for every fabric.</p>
              </div>
            </div>
            <div className="hf-item">
              <div className="hf-icon">🕐</div>
              <div className="hf-text">
                <h4>24h Express</h4>
                <p>Fast turnaround when you need it.</p>
              </div>
            </div>
            <div className="hf-item">
              <div className="hf-icon">🚚</div>
              <div className="hf-text">
                <h4>Free Pickup &amp; Delivery</h4>
                <p>We pick up and deliver at your convenience.</p>
              </div>
            </div>
          </div>

          <div className="hero-ctas">
            <button className="btn-book" onClick={handleStart}>
              🛍 Book a Pickup →
            </button>
            <button className="btn-chat" onClick={() => window.open('https://wa.me/2348058255555', '_blank')}>
              💬 Chat on WhatsApp
            </button>
          </div>

          <div className="social-proof">
            <div className="av-stack">
              <span className="av">👩‍🦰</span>
              <span className="av">👨</span>
              <span className="av">👩</span>
              <span className="av">🧔</span>
            </div>
            <div className="sp-stars">★★★★★</div>
            <span className="sp-text">Loved by 1,200+ Lagos families</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="hiw-section">
        <div className="sec-label">HOW IT WORKS</div>
        <h2 className="sec-title">Laundry made simple</h2>
        <div className="steps-row">
          <div className="steps-conn" />
          <div className="step-col">
            <div className="step-wrap">📅<span className="step-badge">1</span></div>
            <p className="step-title">BOOK</p>
            <p className="step-desc">Schedule a pickup in seconds.</p>
          </div>
          <div className="step-col">
            <div className="step-wrap">🧼<span className="step-badge">2</span></div>
            <p className="step-title">WE CLEAN</p>
            <p className="step-desc">We wash, dry &amp; care for your clothes.</p>
          </div>
          <div className="step-col">
            <div className="step-wrap">👔<span className="step-badge">3</span></div>
            <p className="step-title">WE DELIVER</p>
            <p className="step-desc">Fresh, clean &amp; neatly packed to you.</p>
          </div>
        </div>
      </section>

      {/* OUR SERVICES */}
      <section id="services" className="services-section">
        <div className="sec-label">OUR SERVICES</div>
        <div className="svc-grid">
          {serviceCards.map((s) => (
            <div key={s.title} className="svc-card" onClick={() => { setPricingCategory(s.cat); setShowPricingModal(true); }}>
              <div className="svc-left">
                <div className="svc-icon">{s.icon}</div>
                <div className="svc-info"><h3>{s.title}</h3><p>{s.desc}</p></div>
              </div>
              <span className="svc-chev">›</span>
            </div>
          ))}
        </div>
      </section>

      {/* STICKY FOOTER */}
      <footer className="help-footer">
        <div className="help-left">
          <div className="help-ph-circle">📞</div>
          <div className="help-txt">
            <h4>Need help?</h4>
            <p>0705 815 5555 &nbsp;|&nbsp; 0805 825 5555</p>
          </div>
        </div>
        <button className="btn-wa" onClick={() => window.open('https://wa.me/2348058255555', '_blank')}>
          💬 WHATSAPP US
        </button>
      </footer>

      {/* DRAWER MENU */}
      {showMenuDrawer && (
        <div className="drawer-ov" onClick={() => setShowMenuDrawer(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-x" onClick={() => setShowMenuDrawer(false)}>✕</button>
            <button className="drawer-item" onClick={() => { router.push('/'); setShowMenuDrawer(false); }}>Home</button>
            <button className="drawer-item" onClick={() => { router.push('/how-it-works'); setShowMenuDrawer(false); }}>How It Works</button>
            <button className="drawer-item" onClick={() => { router.push('/services'); setShowMenuDrawer(false); }}>Our Services</button>
            <button className="drawer-item" onClick={() => { setShowPricingModal(true); setShowMenuDrawer(false); }}>Price Catalog</button>
            <button className="drawer-item blue" onClick={() => { router.push(loggedIn ? '/dashboard' : '/login'); setShowMenuDrawer(false); }}>
              {loggedIn ? '📊 Dashboard' : '🔐 Sign In'}
            </button>
          </div>
        </div>
      )}

      {/* PRICING SLIDE-OUT BOTTOM SHEET MODAL */}
      {showPricingModal && (
        <div className="pm-ov" onClick={() => setShowPricingModal(false)}>
          <div className="pm-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="pm-handle" />
            <button className="pm-x" onClick={() => setShowPricingModal(false)}><X size={14} /></button>
            <p className="pm-title">Service Pricing</p>
            <div className="pm-tabs">
              {(['Clothing', 'Household', 'Additional'] as const).map((cat) => (
                <button key={cat} className={`pm-tab${pricingCategory === cat ? ' active' : ''}`} onClick={() => setPricingCategory(cat)}>{cat}</button>
              ))}
            </div>
            <table className="pm-table">
              <thead><tr><th>Item</th><th>Wash</th><th>Iron</th><th>Both</th><th></th></tr></thead>
              <tbody>
                {displayServices.map((item) => (
                  <tr key={item.name}>
                    <td className="pm-nm">{item.name}</td>
                    <td className="pm-pr">{item.hasWash && item.washPrice > 0 ? `₦${item.washPrice.toLocaleString()}` : '—'}</td>
                    <td className="pm-pr">{item.hasIron && item.ironPrice > 0 ? `₦${item.ironPrice.toLocaleString()}` : '—'}</td>
                    <td className="pm-pr">{item.hasWashIron && item.washIronPrice > 0 ? `₦${item.washIronPrice.toLocaleString()}` : '—'}</td>
                    <td><button className="pm-bk" onClick={() => { handleBook(item.name); setShowPricingModal(false); }}>Book</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pm-grid">
              {displayServices.map((item) => (
                <div key={item.name} className="pm-card">
                  <p className="pm-card-t">{item.name}</p>
                  {item.hasWash && item.washPrice > 0 && <div className="pm-card-r"><span>Wash</span><span className="v">₦{item.washPrice.toLocaleString()}</span></div>}
                  {item.hasIron && item.ironPrice > 0 && <div className="pm-card-r"><span>Iron</span><span className="v">₦{item.ironPrice.toLocaleString()}</span></div>}
                  {item.hasWashIron && item.washIronPrice > 0 && <div className="pm-card-r"><span>Both</span><span className="v">₦{item.washIronPrice.toLocaleString()}</span></div>}
                  <button className="pm-card-bk" onClick={() => { handleBook(item.name); setShowPricingModal(false); }}>Book Now</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="modal-ov">
          <div className="modal-box">
            <button className="modal-x" onClick={() => setShowLoginModal(false)}><X size={13} /></button>
            {loginMode === 'SELECT' && (
              <>
                <h3 className="modal-ttl">Welcome</h3>
                <p className="modal-sub">Sign in or create an account to book a service.</p>
                {loginError && <div className="m-err">{loginError}</div>}
                <button
                  className="m-sub"
                  onClick={() => { setLoginMode('LOGIN'); setLoginStep('PHONE'); setLoginError(''); setPhone(''); setPassword(''); }}
                  style={{ marginBottom: '8px' }}
                >
                  Sign In
                </button>
                <button
                  className="m-sub"
                  onClick={() => { setLoginMode('SIGNUP'); setLoginStep('PHONE'); setLoginError(''); setPhone(''); setPassword(''); setFullName(''); setPickupAddress(''); }}
                  style={{ background: '#F5F4F0', color: '#0D0D0D', border: '1.5px solid #E8E6E1' }}
                >
                  Create Account
                </button>
              </>
            )}

            {loginMode === 'LOGIN' && (
              <>
                <h3 className="modal-ttl">Sign In</h3>
                <p className="modal-sub">Enter your phone number and password.</p>
                {loginError && <div className="m-err">{loginError}</div>}
                {loginStep === 'PHONE' && (
                  <form onSubmit={(e) => { e.preventDefault(); setLoginStep('PASSWORD'); }}>
                    <label className="f-lbl">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      className="f-inp"
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <button
                        type="button"
                        className="m-sub"
                        onClick={() => { setLoginMode('SELECT'); setLoginError(''); }}
                        style={{ flex: 1, background: '#F5F4F0', color: '#0D0D0D', border: '1.5px solid #E8E6E1' }}
                      >
                        Back
                      </button>
                      <button type="submit" disabled={!phone || loginLoading} className="m-sub" style={{ flex: 1 }}>
                        Next
                      </button>
                    </div>
                  </form>
                )}
                {loginStep === 'PASSWORD' && (
                  <form onSubmit={handleLoginSubmit}>
                    <label className="f-lbl">Password</label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="f-inp"
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <button
                        type="button"
                        className="m-sub"
                        onClick={() => { setLoginStep('PHONE'); setPassword(''); setLoginError(''); }}
                        style={{ flex: 1, background: '#F5F4F0', color: '#0D0D0D', border: '1.5px solid #E8E6E1' }}
                      >
                        Back
                      </button>
                      <button type="submit" disabled={!password || loginLoading} className="m-sub" style={{ flex: 1 }}>
                        {loginLoading ? 'Signing In...' : 'Sign In'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {loginMode === 'SIGNUP' && (
              <>
                <h3 className="modal-ttl">Create Account</h3>
                <p className="modal-sub">Fill in your details to get started.</p>
                {loginError && <div className="m-err">{loginError}</div>}
                {loginStep === 'PHONE' && (
                  <form onSubmit={(e) => { e.preventDefault(); setLoginStep('NAME'); }}>
                    <label className="f-lbl">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      className="f-inp"
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <button
                        type="button"
                        className="m-sub"
                        onClick={() => { setLoginMode('SELECT'); setLoginError(''); }}
                        style={{ flex: 1, background: '#F5F4F0', color: '#0D0D0D', border: '1.5px solid #E8E6E1' }}
                      >
                        Back
                      </button>
                      <button type="submit" disabled={!phone || loginLoading} className="m-sub" style={{ flex: 1 }}>
                        Next
                      </button>
                    </div>
                  </form>
                )}
                {loginStep === 'NAME' && (
                  <form onSubmit={(e) => { e.preventDefault(); setLoginStep('ADDRESS'); }}>
                    <label className="f-lbl">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="f-inp"
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <button
                        type="button"
                        className="m-sub"
                        onClick={() => { setLoginStep('PHONE'); setLoginError(''); }}
                        style={{ flex: 1, background: '#F5F4F0', color: '#0D0D0D', border: '1.5px solid #E8E6E1' }}
                      >
                        Back
                      </button>
                      <button type="submit" disabled={!fullName.trim() || loginLoading} className="m-sub" style={{ flex: 1 }}>
                        Next
                      </button>
                    </div>
                  </form>
                )}
                {loginStep === 'ADDRESS' && (
                  <form onSubmit={(e) => { e.preventDefault(); setLoginStep('PASSWORD'); }}>
                    <label className="f-lbl">Address Type</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      <button
                        type="button"
                        onClick={() => setAddressType('HOME')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: addressType === 'HOME' ? '2px solid #0D0D0D' : '1.5px solid #E8E6E1',
                          borderRadius: '6px',
                          background: addressType === 'HOME' ? '#F5F4F0' : '#fff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: addressType === 'HOME' ? '600' : '400',
                        }}
                      >
                        Home
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressType('OFFICE')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: addressType === 'OFFICE' ? '2px solid #0D0D0D' : '1.5px solid #E8E6E1',
                          borderRadius: '6px',
                          background: addressType === 'OFFICE' ? '#F5F4F0' : '#fff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: addressType === 'OFFICE' ? '600' : '400',
                        }}
                      >
                        Office
                      </button>
                    </div>
                    <label className="f-lbl">Your Address</label>
                    <textarea
                      placeholder="Enter your full address"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      required
                      className="f-inp"
                      style={{ minHeight: '80px', resize: 'none' }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <button
                        type="button"
                        className="m-sub"
                        onClick={() => { setLoginStep('NAME'); setLoginError(''); }}
                        style={{ flex: 1, background: '#F5F4F0', color: '#0D0D0D', border: '1.5px solid #E8E6E1' }}
                      >
                        Back
                      </button>
                      <button type="submit" disabled={!pickupAddress.trim() || loginLoading} className="m-sub" style={{ flex: 1 }}>
                        Next
                      </button>
                    </div>
                  </form>
                )}
                {loginStep === 'PASSWORD' && (
                  <form onSubmit={handleSignupSubmit}>
                    <label className="f-lbl">Create Password</label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="f-inp"
                      autoFocus
                    />
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '-8px', marginBottom: '16px' }}>
                      Password must be at least 6 characters
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="m-sub"
                        onClick={() => { setLoginStep('ADDRESS'); setLoginError(''); }}
                        style={{ flex: 1, background: '#F5F4F0', color: '#0D0D0D', border: '1.5px solid #E8E6E1' }}
                      >
                        Back
                      </button>
                      <button type="submit" disabled={password.length < 6 || loginLoading} className="m-sub" style={{ flex: 1 }}>
                        {loginLoading ? 'Creating...' : 'Create Account'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
