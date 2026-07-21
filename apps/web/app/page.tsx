'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
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
  const [loginStep, setLoginStep] = useState<'PHONE' | 'OTP' | 'ONBOARDING'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginInfo, setLoginInfo] = useState('');
  const [verifier, setVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmation, setConfirmation] = useState<any>(null);
  const [tempToken, setTempToken] = useState('');

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('customerToken'));
    fetch('/api/v1/admin/services')
      .then((r) => r.json())
      .then((d) => { if (d.services?.length > 0) setDbServices(d.services); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!showLoginModal) return;
    setTimeout(() => {
      try {
        const c = document.getElementById('recaptcha-container');
        if (!c) return;
        c.innerHTML = '';
        const v = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible', callback: () => {}, 'expired-callback': () => setVerifier(null),
        });
        v.render().then(() => setVerifier(v)).catch(() => {});
      } catch (e) { console.error(e); }
    }, 100);
  }, [showLoginModal]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleStart = () => {
    if (loggedIn) { router.push('/dashboard'); return; }
    setLoginStep('PHONE'); setLoginError(''); setLoginInfo(''); setShowLoginModal(true);
  };

  const handleBook = (name: string) => {
    if (loggedIn) { router.push('/dashboard'); return; }
    setLoginStep('PHONE'); setLoginError(''); setLoginInfo(''); setShowLoginModal(true);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || loginLoading) return;
    setLoginLoading(true); setLoginError(''); setLoginInfo('');
    const fmt = phone.startsWith('+') ? phone : '+234' + phone.replace(/^0+/, '');
    try {
      await axios.post('/api/v1/auth/request-otp', { phoneNumber: fmt });
      try {
        let v = verifier;
        if (!v) {
          const c = document.getElementById('recaptcha-container');
          if (c) c.innerHTML = '';
          v = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
          await v.render(); setVerifier(v);
        }
        signInWithPhoneNumber(auth, fmt, v).then((r) => setConfirmation(r)).catch(() => {});
      } catch { }
      setLoginInfo('OTP sent to ' + fmt); setLoginStep('OTP');
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Failed to send OTP.');
    } finally { setLoginLoading(false); }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || loginLoading) return;
    setLoginLoading(true); setLoginError('');
    const fmt = phone.startsWith('+') ? phone : '+234' + phone.replace(/^0+/, '');
    try {
      let idToken = '';
      if (confirmation) {
        try { const cred = await confirmation.confirm(otp); idToken = await cred.user.getIdToken(); } catch { }
      }
      const { data } = await axios.post('/api/v1/auth/verify-otp', { phoneNumber: fmt, code: otp, idToken });
      const { token, user: u } = data;
      if (!u.fullName || u.fullName === 'Customer Account') {
        setTempToken(token); setLoginStep('ONBOARDING');
      } else {
        localStorage.setItem('customerToken', token);
        localStorage.setItem('customerUser', JSON.stringify(u));
        setLoggedIn(true); setShowLoginModal(false); router.push('/dashboard');
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Invalid code.');
    } finally { setLoginLoading(false); }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || loginLoading) return;
    setLoginLoading(true); setLoginError('');
    try {
      const { data } = await axios.patch('/api/v1/users/profile', { fullName: fullName.trim() }, { headers: { Authorization: 'Bearer ' + tempToken } });
      localStorage.setItem('customerToken', tempToken);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      setLoggedIn(true); setShowLoginModal(false); router.push('/dashboard');
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Failed to register.');
    } finally { setLoginLoading(false); }
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
    .hero-section{background:linear-gradient(160deg,#D6EAFF 0%,#E8F4FF 30%,#F5F9FF 65%,#FFFFFF 100%);padding:90px 20px 28px;position:relative;}
    .hero-split{display:flex;align-items:flex-start;gap:10px;margin-bottom:20px;}
    .hero-left{flex:1;min-width:0;}
    .hero-right{flex:0 0 155px;width:155px;}
    .hero-h1{font-size:30px;font-weight:900;color:#0B1B3E;text-transform:uppercase;line-height:1.08;letter-spacing:-0.5px;}
    .hero-h1-blue{color:#1565C0;display:block;}
    .hero-ul{display:flex;align-items:center;gap:5px;margin:10px 0 11px;}
    .hero-ul-bar{width:26px;height:3px;background:#1565C0;border-radius:2px;}
    .hero-ul-dot{width:6px;height:6px;border-radius:50%;background:#1565C0;}
    .hero-sub{font-size:12.5px;color:#4B5563;line-height:1.6;margin-bottom:16px;}
    .hf-list{display:flex;flex-direction:column;gap:11px;}
    .hf-item{display:flex;align-items:flex-start;gap:9px;}
    .hf-icon{width:33px;height:33px;border-radius:50%;background:#1565C0;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;color:white;}
    .hf-text h4{font-size:12.5px;font-weight:800;color:#0B1B3E;margin-bottom:1px;}
    .hero-img-wrap{width:100%;border-radius:14px;overflow:hidden;margin-top:-2px;mix-blend-mode:multiply;}
    .hero-img-wrap img{mix-blend-mode:multiply;}
    .hero-ctas{display:flex;gap:10px;margin-bottom:13px;}
    .btn-book{flex:1;height:50px;background:#1565C0;color:white;border:none;border-radius:10px;font-weight:800;font-size:11.5px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;text-transform:uppercase;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(21,101,192,0.28);font-family:'DM Sans',sans-serif;}
    .btn-chat{flex:1;height:50px;background:white;color:#0B1B3E;border:1.5px solid #CBD5E1;border-radius:10px;font-weight:800;font-size:11.5px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;text-transform:uppercase;font-family:'DM Sans',sans-serif;}
    .social-proof{display:flex;align-items:center;gap:10px;background:white;border:1px solid #E2E8F0;border-radius:10px;padding:9px 14px;box-shadow:0 2px 8px rgba(0,0,0,0.04);}
    .av-stack{display:flex;}
    .av{width:26px;height:26px;border-radius:50%;border:2px solid white;background:#CBD5E1;margin-left:-7px;display:flex;align-items:center;justify-content:center;font-size:12px;overflow:hidden;flex-shrink:0;}
    .av:first-child{margin-left:0;}
    .sp-stars{color:#F59E0B;font-size:13px;letter-spacing:1px;flex-shrink:0;}
    .sp-text{font-size:11px;color:#4B5563;font-weight:600;}
    .hiw-section{background:white;padding:30px 20px 26px;border-top:1px solid #F1F5F9;}
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
    .svc-card{background:white;border:1px solid #E2E8F0;border-radius:12px;padding:11px 10px 11px 11px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:border-color 0.18s,box-shadow 0.18s;gap:6px;}
    .svc-card:hover{border-color:#1565C0;box-shadow:0 4px 12px rgba(21,101,192,0.08);}
    .svc-left{display:flex;align-items:center;gap:8px;min-width:0;}
    .svc-icon{width:36px;height:36px;border-radius:9px;background:#EFF6FF;border:1px solid #DBEAFE;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
    .svc-info h3{font-size:12px;font-weight:800;color:#0B1B3E;margin-bottom:1px;line-height:1.2;}
    .svc-info p{font-size:9.5px;color:#6B7280;line-height:1.3;}
    .svc-chev{color:#9CA3AF;flex-shrink:0;font-size:16px;font-weight:700;}
    .help-footer{position:sticky;bottom:0;background:#0B1B3E;padding:13px 20px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:500;}
    .help-left{display:flex;align-items:center;gap:10px;}
    .help-ph-circle{width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center;font-size:15px;color:white;flex-shrink:0;}
    .help-txt h4{font-size:11.5px;font-weight:800;color:white;margin-bottom:1px;}
    .help-txt p{font-size:10px;color:rgba(255,255,255,0.75);}
    .btn-wa{height:39px;padding:0 15px;background:white;color:#0B1B3E;border:none;border-radius:100px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:5px;white-space:nowrap;flex-shrink:0;font-family:'DM Sans',sans-serif;}
    .drawer-ov{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;justify-content:flex-end;}
    .drawer-panel{background:white;width:280px;max-width:85vw;height:100%;padding:20px;display:flex;flex-direction:column;animation:slideD 0.25s cubic-bezier(0.16,1,0.3,1) both;}
    @keyframes slideD{from{transform:translateX(100%)}to{transform:translateX(0)}}
    .drawer-x{align-self:flex-end;background:none;border:none;cursor:pointer;color:#64748B;padding:6px;border-radius:50%;margin-bottom:14px;font-size:20px;}
    .drawer-item{padding:14px 8px;border-bottom:1px solid #F1F5F9;font-size:15px;font-weight:700;color:#0B1B3E;background:none;border-top:none;border-left:none;border-right:none;text-align:left;cursor:pointer;font-family:'DM Sans',sans-serif;transition:color 0.18s;}
    .drawer-item:hover{color:#1565C0;}
    .drawer-item.blue{color:#1565C0;border-bottom:none;}
    .pm-ov{position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:3000;display:flex;align-items:flex-end;justify-content:center;}
    .pm-sheet{background:white;border-radius:24px 24px 0 0;padding:22px 18px 32px;width:100%;max-width:480px;max-height:82vh;overflow-y:auto;position:relative;animation:sheetUp 0.3s cubic-bezier(0.16,1,0.3,1) both;}
    @keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    .pm-handle{width:40px;height:4px;background:#E2E8F0;border-radius:2px;margin:0 auto 18px;}
    .pm-x{position:absolute;top:16px;right:16px;background:#F1F5F9;border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#64748B;}
    .pm-title{font-size:18px;font-weight:900;color:#0B1B3E;text-align:center;margin-bottom:14px;}
    .pm-tabs{display:flex;gap:7px;justify-content:center;margin-bottom:14px;flex-wrap:wrap;}
    .pm-tab{padding:6px 14px;border-radius:100px;border:1.5px solid #E2E8F0;background:transparent;color:#64748B;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s;}
    .pm-tab.active{background:#1565C0;color:white;border-color:#1565C0;}
    .pm-table{width:100%;border-collapse:collapse;font-size:12px;}
    .pm-table th{background:#F8FAFC;color:#64748B;font-weight:800;padding:9px 10px;border-bottom:1px solid #F1F5F9;text-align:left;font-size:11px;}
    .pm-table td{padding:9px 10px;border-bottom:1px solid #F1F5F9;}
    .pm-table tr:last-child td{border-bottom:none;}
    .pm-nm{font-weight:700;color:#0B1B3E;}
    .pm-pr{color:#1565C0;font-weight:700;}
    .pm-bk{padding:5px 11px;border-radius:100px;border:none;background:#1565C0;color:white;font-size:11px;font-weight:700;cursor:pointer;}
    .pm-grid{display:none;grid-template-columns:1fr 1fr;gap:8px;}
    .pm-card{background:#F8FAFC;border:1px solid #F1F5F9;border-radius:12px;padding:10px;}
    .pm-card-t{font-size:12px;font-weight:800;color:#0B1B3E;margin-bottom:7px;padding-bottom:5px;border-bottom:1px solid #F1F5F9;}
    .pm-card-r{display:flex;justify-content:space-between;font-size:10.5px;color:#64748B;margin-bottom:3px;}
    .pm-card-r .v{color:#1565C0;font-weight:700;}
    .pm-card-bk{width:100%;height:29px;border-radius:100px;border:none;background:#1565C0;color:white;font-size:10.5px;font-weight:700;cursor:pointer;margin-top:7px;}
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
        <div className="nav-logo" onClick={() => scrollTo('home')}>
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

      {/* HERO */}
      <section id="home" className="hero-section">
        <div className="hero-split">
          <div className="hero-left">
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
                <div className="hf-text"><h4>Premium Care</h4><p>Top-quality cleaning for every fabric.</p></div>
              </div>
              <div className="hf-item">
                <div className="hf-icon">🕐</div>
                <div className="hf-text"><h4>24h Express</h4><p>Fast turnaround when you need it.</p></div>
              </div>
              <div className="hf-item">
                <div className="hf-icon">🚚</div>
                <div className="hf-text"><h4>Free Pickup &amp; Delivery</h4><p>We pick up and deliver at your convenience.</p></div>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-img-wrap">
              <Image src="/basket.png" alt="BG Laundry basket" width={200} height={260} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} priority />
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

      {/* DRAWER */}
      {showMenuDrawer && (
        <div className="drawer-ov" onClick={() => setShowMenuDrawer(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-x" onClick={() => setShowMenuDrawer(false)}>✕</button>
            <button className="drawer-item" onClick={() => { scrollTo('home'); setShowMenuDrawer(false); }}>Home</button>
            <button className="drawer-item" onClick={() => { scrollTo('how-it-works'); setShowMenuDrawer(false); }}>How It Works</button>
            <button className="drawer-item" onClick={() => { scrollTo('services'); setShowMenuDrawer(false); }}>Our Services</button>
            <button className="drawer-item" onClick={() => { setShowPricingModal(true); setShowMenuDrawer(false); }}>Price Catalog</button>
            <button className="drawer-item blue" onClick={() => { handleStart(); setShowMenuDrawer(false); }}>
              {loggedIn ? '📊 Dashboard' : '🔐 Sign In'}
            </button>
          </div>
        </div>
      )}

      {/* PRICING MODAL */}
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
            <h3 className="modal-ttl">Sign In</h3>
            <p className="modal-sub">Enter your phone number to book a service.</p>
            {loginError && <div className="m-err">{loginError}</div>}
            {loginInfo && <div className="m-info">{loginInfo}</div>}
            {loginStep === 'PHONE' && (
              <form onSubmit={handlePhoneSubmit}>
                <label className="f-lbl">Phone Number</label>
                <input type="tel" placeholder="e.g. 08012345678" value={phone} onChange={(e) => setPhone(e.target.value)} required className="f-inp" />
                <button type="submit" disabled={loginLoading} className="m-sub">{loginLoading ? 'Sending OTP...' : 'Send OTP'}</button>
              </form>
            )}
            {loginStep === 'OTP' && (
              <form onSubmit={handleOtpSubmit}>
                <label className="f-lbl">OTP Code</label>
                <input type="text" maxLength={6} placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required className="f-inp" />
                <button type="submit" disabled={loginLoading} className="m-sub">{loginLoading ? 'Verifying...' : 'Verify & Continue'}</button>
              </form>
            )}
            {loginStep === 'ONBOARDING' && (
              <form onSubmit={handleOnboardSubmit}>
                <label className="f-lbl">Full Name</label>
                <input type="text" placeholder="Enter your name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="f-inp" />
                <button type="submit" disabled={loginLoading} className="m-sub">{loginLoading ? 'Saving...' : 'Complete Registration'}</button>
              </form>
            )}
            <div id="recaptcha-container"></div>
          </div>
        </div>
      )}
    </div>
  );
}
