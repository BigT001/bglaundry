'use client';
import React from 'react';

export default function MarketingPage() {
  const services = [
    { title: 'WASH & FOLD', desc: 'Clean, fresh and neatly folded clothing bags.' },
    { title: 'DRY CLEANING', desc: 'Professional care for delicate premium fabrics.' },
    { title: 'IRONING', desc: 'Crisp, neat and well pressed garments.' },
    { title: 'STAIN REMOVAL', desc: 'Tough on stains, gentle on your fabrics.' },
    { title: 'DUVETS & BLANKETS', desc: 'Deep cleaning configurations for comfort.' },
    { title: 'CURTAINS & LINEN', desc: 'Fresh, clean and completely dust-free.' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      {/* Top Header Navigation */}
      <header style={{ borderBottom: '1px solid #E6F0FA', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#002B7F', display: 'flex', alignItems: 'center', gap: '8px' }}>
          BG Laundry
        </div>
        <nav style={{ display: 'flex', gap: '24px', fontSize: '15px', fontWeight: '500' }}>
          <a href="#services" style={{ color: '#002B7F', textDecoration: 'none' }}>Services</a>
          <a href="#how-it-works" style={{ color: '#002B7F', textDecoration: 'none' }}>How It Works</a>
          <a href="/admin" style={{ color: '#0066FF', textDecoration: 'none', fontWeight: 'bold' }}>Admin Console</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ backgroundColor: '#002B7F', color: '#FFFFFF', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ backgroundColor: '#0066FF', color: '#FFFFFF', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            24-48 HR Delivery Guaranteed
          </span>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginTop: '24px', marginBottom: '16px', lineHeight: '1.1' }}>
            Clean Today,<br />Ready Tomorrow!
          </h1>
          <p style={{ fontSize: '18px', color: '#E6F0FA', marginBottom: '40px', lineHeight: '1.6' }}>
            Premium laundry and dry cleaning services delivered directly to your doorstep. Manage your bookings, tracking, and payments inside the customer mobile app.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => alert('Download on Google Play Store (Redirecting to app list...)')}
              style={{ padding: '16px 32px', backgroundColor: '#0066FF', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 102, 255, 0.4)' }}
            >
              Download on Google Play
            </button>
            <button
              onClick={() => window.open('https://wa.me/2347058155555', '_blank')}
              style={{ padding: '16px 32px', backgroundColor: '#FFFFFF', color: '#002B7F', border: '1px solid #E6F0FA', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Chat on WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section id="services" style={{ padding: '80px 40px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#002B7F', textAlign: 'center', marginBottom: '8px' }}>Our Services</h2>
          <p style={{ color: '#64748B', textAlign: 'center', marginBottom: '48px' }}>Premium care for all your garments, linen, and commercial laundry</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {services.map((svc, idx) => (
              <div key={idx} style={{ padding: '24px', borderRadius: '8px', border: '1px solid #E6F0FA', backgroundColor: '#F8FAFC' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#E6F0FA', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <span style={{ color: '#0066FF', fontWeight: 'bold' }}>✓</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#002B7F', margin: '0 0 8px 0' }}>{svc.title}</h3>
                <p style={{ color: '#64748B', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" style={{ padding: '80px 40px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E6F0FA', borderBottom: '1px solid #E6F0FA' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#002B7F', marginBottom: '48px' }}>How It Works</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066FF', marginBottom: '8px' }}>1</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#0F172A' }}>Book on App</h4>
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>Select your services and schedule pickup.</p>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066FF', marginBottom: '8px' }}>2</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#0F172A' }}>We Collect</h4>
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>Our dispatch driver picks up laundry at your door.</p>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066FF', marginBottom: '8px' }}>3</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#0F172A' }}>We Wash & Dry</h4>
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>Your garments undergo premium washing care.</p>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066FF', marginBottom: '8px' }}>4</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#0F172A' }}>Fast Delivery</h4>
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>Laundry is delivered fresh & folded in 24-48 hrs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Contact Details */}
      <footer id="contact" style={{ backgroundColor: '#0F172A', color: '#FFFFFF', padding: '60px 40px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
          <div>
            <h3 style={{ margin: '0 0 16px 0', color: '#FFFFFF' }}>BG Laundry & Dry Cleaning</h3>
            <p style={{ color: '#94A3B8', fontSize: '14px', maxWidth: '300px', lineHeight: '1.5' }}>
              Clean today, ready tomorrow! Lagos\' premium laundry service provider.
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 16px 0', color: '#94A3B8', fontSize: '14px', textTransform: 'uppercase' }}>Our Address</h4>
            <p style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: '1.5' }}>
              16B Maria Okor Street,<br />Ejibo, Lagos, Nigeria
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 16px 0', color: '#94A3B8', fontSize: '14px', textTransform: 'uppercase' }}>Contact Options</h4>
            <p style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
              Call / WhatsApp: 07058155555
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid #1E293B', marginTop: '40px', paddingTop: '20px', fontSize: '13px', color: '#94A3B8' }}>
          © 2026 BG Laundry & Dry Cleaning. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
