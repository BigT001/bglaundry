'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shirt, Clock, ArrowRight, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';

export default function MarketingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('customerToken');
      setIsLoggedIn(!!token);
    }
  }, []);

  const services = [
    { title: 'WASH & FOLD', desc: 'Clean, fresh and neatly folded clothing bags.' },
    { title: 'DRY CLEANING', desc: 'Professional care for delicate premium fabrics.' },
    { title: 'IRONING', desc: 'Crisp, neat and well pressed garments.' },
    { title: 'STAIN REMOVAL', desc: 'Tough on stains, gentle on your fabrics.' },
    { title: 'DUVETS & BLANKETS', desc: 'Deep cleaning configurations for comfort.' },
    { title: 'CURTAINS & LINEN', desc: 'Fresh, clean and completely dust-free.' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top Header Navigation */}
      <header style={{
        borderBottom: '1px solid #E6F0FA',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#002B7F', display: 'flex', alignItems: 'center', gap: '8px' }}>
          BG Laundry
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '15px', fontWeight: '600' }}>
          <a href="#services" style={{ color: '#002B7F', textDecoration: 'none' }}>Services</a>
          <a href="#how-it-works" style={{ color: '#002B7F', textDecoration: 'none' }}>How It Works</a>
          <a href="/admin" style={{ color: '#64748B', textDecoration: 'none' }}>Admin Console</a>
          
          {isLoggedIn ? (
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#002B7F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Portal Dashboard
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0066FF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Customer Login
            </button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ backgroundColor: '#002B7F', color: '#FFFFFF', padding: '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', zIndex: 10, position: 'relative' }}>
          <span style={{ backgroundColor: '#0066FF', color: '#FFFFFF', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
            <Sparkles size={14} />
            24-48 HR Delivery Guaranteed
          </span>
          <h1 style={{ fontSize: '54px', fontWeight: '800', marginTop: '12px', marginBottom: '20px', lineHeight: '1.1', letterSpacing: '-1px' }}>
            Clean Today,<br />Ready Tomorrow!
          </h1>
          <p style={{ fontSize: '19px', color: '#E6F0FA', marginBottom: '40px', lineHeight: '1.6', maxWidth: '640px', margin: '0 auto 40px auto' }}>
            Premium laundry and dry cleaning services delivered directly to your doorstep. Schedule pickups, track orders, and pay seamlessly inside the new web portal.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '16px 36px',
                  backgroundColor: '#0066FF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px 0 rgba(0,102,255,0.4)'
                }}
              >
                Go to Web Portal
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                style={{
                  padding: '16px 36px',
                  backgroundColor: '#0066FF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px 0 rgba(0,102,255,0.4)'
                }}
              >
                Book Laundry Now
                <ArrowRight size={18} />
              </button>
            )}
            <button
              onClick={() => window.open('https://wa.me/2347058155555', '_blank')}
              style={{
                padding: '16px 36px',
                backgroundColor: '#FFFFFF',
                color: '#002B7F',
                border: '1px solid #E6F0FA',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <PhoneCall size={18} />
              Chat on WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section id="services" style={{ padding: '100px 40px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#002B7F', textAlign: 'center', marginBottom: '12px', letterSpacing: '-0.5px' }}>Our Services</h2>
          <p style={{ color: '#64748B', textAlign: 'center', marginBottom: '60px', fontSize: '16px' }}>Premium care for all your garments, linen, and commercial laundry</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {services.map((svc, idx) => (
              <div key={idx} style={{ padding: '30px', borderRadius: '12px', border: '1px solid #E6F0FA', backgroundColor: '#F8FAFC', transition: 'transform 0.2s', cursor: 'default' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#E6F0FA', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Shirt size={22} style={{ color: '#0066FF' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#002B7F', margin: '0 0 10px 0' }}>{svc.title}</h3>
                <p style={{ color: '#64748B', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" style={{ padding: '100px 40px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E6F0FA', borderBottom: '1px solid #E6F0FA' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#002B7F', marginBottom: '60px', letterSpacing: '-0.5px' }}>How It Works</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '28px', backgroundColor: '#E6F0FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066FF', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>1</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '16px', fontWeight: 'bold' }}>Book on Web</h4>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Select your services and schedule pickup dates.</p>
            </div>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '28px', backgroundColor: '#E6F0FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066FF', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>2</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '16px', fontWeight: 'bold' }}>We Collect</h4>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Our dispatch driver picks up laundry at your door.</p>
            </div>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '28px', backgroundColor: '#E6F0FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066FF', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>3</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '16px', fontWeight: 'bold' }}>We Clean & Press</h4>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Your garments undergo premium washing and ironing care.</p>
            </div>
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '28px', backgroundColor: '#E6F0FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066FF', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>4</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '16px', fontWeight: 'bold' }}>Fresh Delivery</h4>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Laundry is delivered fresh & folded in 24-48 hrs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Contact Details */}
      <footer id="contact" style={{ backgroundColor: '#0F172A', color: '#FFFFFF', padding: '80px 40px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
          <div>
            <h3 style={{ margin: '0 0 16px 0', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold' }}>BG Laundry & Dry Cleaning</h3>
            <p style={{ color: '#94A3B8', fontSize: '14px', maxWidth: '320px', lineHeight: '1.6' }}>
              Clean today, ready tomorrow! Lagos' premium laundry service provider.
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 16px 0', color: '#94A3B8', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Our Address</h4>
            <p style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: '1.6' }}>
              16B Maria Okor Street,<br />Ejibo, Lagos, Nigeria
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 16px 0', color: '#94A3B8', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Contact Options</h4>
            <p style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Call / WhatsApp: 07058155555
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid #1E293B', marginTop: '60px', paddingTop: '24px', fontSize: '13px', color: '#94A3B8' }}>
          © 2026 BG Laundry & Dry Cleaning. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
