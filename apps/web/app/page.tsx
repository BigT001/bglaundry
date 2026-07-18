'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shirt, 
  ArrowRight, 
  PhoneCall, 
  Sparkles, 
  Smartphone,
  MapPin,
  Zap, 
  ShieldCheck, 
  Check,
  ChevronRight
} from 'lucide-react';

// Custom Scroll Reveal Component
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(25px)',
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

export default function MarketingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('customerToken');
      setIsLoggedIn(!!token);
    }
  }, []);

  const services = [
    { title: 'WASH & FOLD', desc: 'Garments cleaned, dried, and crisply folded. Perfect for everyday bags.' },
    { title: 'DRY CLEANING', desc: 'Specialized chemical solvent cleaning for premium and delicate fabrics.' },
    { title: 'IRONING & PRESSING', desc: 'Professional pressing services for crisp shirts and crease-free trousers.' },
    { title: 'STAIN REMOVAL', desc: 'Expert treatment targeting tough oils and grease while preserving colors.' },
    { title: 'DUVETS & BLANKETS', desc: 'Deep-thermal sanitization for oversized household blankets and duvets.' },
    { title: 'CURTAINS & LINEN', desc: 'Gentle upholstery washes to restore freshness and eliminate household allergens.' },
  ];

  const faqs = [
    { q: 'How long does a standard order take?', a: 'Our standard turnaround is 24 to 48 hours. Express 12-hour turnaround is also available.' },
    { q: 'What is the minimum order value?', a: 'We have a low minimum order value of ₦5,000 for free pickup and delivery.' },
    { q: 'How do I track my active order?', a: 'Simply log in to the Customer Portal Dashboard to see live updates, assign drivers, and retrieve secure verification OTPs.' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFBFC', color: '#0F172A', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Premium Fonts & Global CSS Injection */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        * {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          box-sizing: border-box;
        }
        html {
          scroll-behavior: smooth;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.08); }
        }
        .animate-float {
          animation: float 6s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .service-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .service-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(0, 102, 255, 0.06), 0 8px 10px -6px rgba(0, 102, 255, 0.06);
          border-color: #0066FF !important;
        }
        .hover-lift {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 102, 255, 0.15);
        }

        /* 📱 RESPONSIVE MEDIA QUERIES */
        @media (max-width: 991px) {
          .hero-flex-layout {
            flex-direction: column !important;
            text-align: center !important;
            gap: 48px !important;
          }
          .hero-text-align {
            text-align: center !important;
          }
          .hero-title {
            font-size: 42px !important;
          }
          .hero-ctas {
            justify-content: center !important;
          }
          .hero-card-container {
            width: 100% !important;
            max-width: 380px !important;
            margin: 0 auto !important;
          }
        }

        @media (max-width: 767px) {
          .header-nav-links {
            display: none !important;
          }
          .header-container {
            padding: 12px 20px !important;
          }
          .hero-section {
            padding: 80px 20px 100px 20px !important;
          }
          .hero-title {
            font-size: 34px !important;
          }
          .hero-subtitle {
            font-size: 15px !important;
          }
          .hero-ctas {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .hero-ctas button {
            width: 100% !important;
            justify-content: center !important;
          }
          .section-padding {
            padding: 60px 20px !important;
          }
          .section-title {
            font-size: 28px !important;
          }
          .timeline-container {
            flex-direction: column !important;
            gap: 32px !important;
          }
          .timeline-node {
            flex: 1 1 100% !important;
          }
          .footer-container {
            flex-direction: column !important;
            gap: 40px !important;
            text-align: center !important;
          }
          .footer-logo-section {
            align-items: center !important;
            text-align: center !important;
          }
        }
      `}} />

      {/* Responsive Glassmorphic Header */}
      <header className="header-container" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.01)'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#002B7F', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#002B7F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
            <Shirt size={15} />
          </div>
          BG Laundry
        </div>
        
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className="header-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px', fontWeight: '600' }}>
            <a href="#services" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}>Services</a>
            <a href="#how-it-works" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}>How It Works</a>
            <a href="#faqs" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}>FAQs</a>
            <a href="/admin" style={{ color: '#64748B', textDecoration: 'none', fontSize: '13px', borderRight: '1px solid #E2E8F0', paddingRight: '16px' }}>Admin</a>
          </div>
          
          {isLoggedIn ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="hover-lift"
              style={{
                padding: '8px 18px',
                backgroundColor: '#002B7F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px'
              }}
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="hover-lift"
              style={{
                padding: '8px 18px',
                backgroundColor: '#0066FF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px'
              }}
            >
              Login
            </button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section" style={{
        position: 'relative',
        backgroundColor: '#030712',
        color: '#FFFFFF',
        padding: '100px 40px 120px 40px',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle at 80% 20%, #1e1b4b 0%, transparent 60%), radial-gradient(circle at 15% 85%, #0c4a6e 0%, transparent 50%)'
      }}>
        {/* Pulsing Blur Blobs */}
        <div className="animate-pulse-slow" style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: '#0066FF', filter: 'blur(120px)', top: '-100px', right: '-50px', zIndex: 0 }} />
        <div className="animate-pulse-slow" style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', backgroundColor: '#6366F1', filter: 'blur(110px)', bottom: '-80px', left: '-50px', zIndex: 0 }} />

        {/* Content wrapper */}
        <div className="hero-flex-layout" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', position: 'relative', zIndex: 10 }}>
          
          {/* Left Column */}
          <div className="hero-text-align" style={{ flex: '1 1 500px' }}>
            <span style={{
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818CF8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '24px'
            }}>
              <Sparkles size={13} />
              Lagos' Premium Express Laundry
            </span>

            <h1 className="hero-title" style={{
              fontSize: '54px',
              fontWeight: '800',
              lineHeight: '1.15',
              letterSpacing: '-1.5px',
              margin: '0 0 20px 0',
              background: 'linear-gradient(to right, #FFFFFF, #93C5FD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Clean Today,<br />Ready Tomorrow!
            </h1>

            <p className="hero-subtitle" style={{ fontSize: '17px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '32px', maxWidth: '500px' }}>
              Premium door-to-door laundry & dry cleaning services. Schedule pickups in under 60 seconds and track active cleaning pipelines live on our web portal.
            </p>

            <div className="hero-ctas" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push(isLoggedIn ? '/dashboard' : '/login')}
                className="hover-lift"
                style={{
                  padding: '14px 28px',
                  backgroundColor: '#0066FF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isLoggedIn ? 'Go to Web Portal' : 'Book Laundry Now'}
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => window.open('https://wa.me/2347058155555', '_blank')}
                style={{
                  padding: '14px 28px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              >
                <PhoneCall size={16} />
                Chat on WhatsApp
              </button>
            </div>
          </div>

          {/* Right Column (Interactive Mock Card) */}
          <div className="hero-card-container animate-float" style={{ flex: '1 1 380px', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '360px',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#6366F1', letterSpacing: '1px' }}>
                  ACTIVE TRACKER
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                  Processing
                </span>
              </div>

              {/* Order number */}
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', marginBottom: '4px' }}>
                Order #BG-8902
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '20px' }}>
                Lagos Delivery Area
              </div>

              {/* Garment list items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: '#6366F1' }} /> Shirts (Iron Only)</span>
                  <span style={{ color: '#94A3B8' }}>Qty: 4</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={12} style={{ color: '#6366F1' }} /> Duvet (Wash Only)</span>
                  <span style={{ color: '#94A3B8' }}>Qty: 1</span>
                </div>
              </div>

              {/* Progress visualizer */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
                  <span>Progress Status</span>
                  <span style={{ color: '#6366F1', fontWeight: '700' }}>Cleaning 4/6</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', position: 'relative' }}>
                  <div style={{ width: '66%', height: '100%', backgroundColor: '#0066FF', borderRadius: '3px' }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Services Grid Section */}
      <section id="services" className="section-padding" style={{ padding: '80px 40px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '10px' }}>
                OUR CATALOG
              </span>
              <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                Services We Provide
              </h2>
              <p style={{ color: '#64748B', marginTop: '10px', fontSize: '15px', maxWidth: '540px', margin: '10px auto 0 auto' }}>
                Enjoy premium fabric treatments and express collections, optimized for both daily garments and fine wear.
              </p>
            </div>
          </ScrollReveal>

          {/* Cards grid */}
          <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {services.map((svc, idx) => (
              <ScrollReveal key={idx} delay={idx * 60}>
                <div 
                  className="service-card"
                  style={{
                    padding: '28px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FAFBFC',
                    cursor: 'default'
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#F0F5FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    color: '#0066FF'
                  }}>
                    <Shirt size={20} />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#002B7F', margin: '0 0 10px 0' }}>
                    {svc.title}
                  </h3>
                  <p style={{ color: '#64748B', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                    {svc.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* How It Works Timeline */}
      <section id="how-it-works" className="section-padding" style={{ padding: '80px 40px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '10px' }}>
                THE PIPELINE
              </span>
              <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                How It Works
              </h2>
            </div>
          </ScrollReveal>

          {/* Timeline Nodes */}
          <div className="timeline-container" style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            {[
              { step: '1', title: 'Schedule on Web', desc: 'Select laundry items, enter addresses, and schedule pickup.', icon: <Smartphone size={18} /> },
              { step: '2', title: 'Driver Collects', desc: 'A dispatch driver arrives at your door and collects laundry bags.', icon: <MapPin size={18} /> },
              { step: '3', title: 'Premium Clean', desc: 'Garments undergo washing, dry cleaning, or pressing care.', icon: <Zap size={18} /> },
              { step: '4', title: 'Fresh Delivery', desc: 'We deliver fresh, clean, and folded clothing back to you.', icon: <ShieldCheck size={18} /> }
            ].map((node, idx) => (
              <ScrollReveal key={idx} delay={idx * 80}>
                <div className="timeline-node" style={{
                  flex: '1 1 200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '16px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '28px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0066FF',
                    marginBottom: '20px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.01)',
                    position: 'relative'
                  }}>
                    {node.icon}
                    <span style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      backgroundColor: '#002B7F',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {node.step}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '15px', fontWeight: '700' }}>
                    {node.title}
                  </h4>
                  <p style={{ color: '#64748B', fontSize: '13px', margin: 0, lineHeight: '1.6', maxWidth: '170px' }}>
                    {node.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* Accordion FAQs */}
      <section id="faqs" className="section-padding" style={{ padding: '80px 40px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '44px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#0066FF', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '10px' }}>
                SUPPORT
              </span>
              <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                Frequently Asked Questions
              </h2>
            </div>
          </ScrollReveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => (
              <ScrollReveal key={idx} delay={idx * 60}>
                <div style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  backgroundColor: '#FAFBFC',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === idx ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      color: '#002B7F'
                    }}
                  >
                    {faq.q}
                    <span style={{ fontSize: '18px', lineHeight: '0', color: '#64748B' }}>
                      {activeAccordion === idx ? '−' : '+'}
                    </span>
                  </button>

                  {activeAccordion === idx && (
                    <div style={{
                      padding: '0 20px 16px 20px',
                      color: '#475569',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '12px'
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* Responsive Footer */}
      <footer id="contact" className="section-padding" style={{ backgroundColor: '#090D16', color: '#FFFFFF', padding: '60px 40px', borderTop: '1px solid #1E293B' }}>
        <div className="footer-container" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
          
          <div className="footer-logo-section" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#FFFFFF', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                <Shirt size={12} />
              </div>
              BG Laundry & Dry Cleaning
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '13px', maxWidth: '300px', lineHeight: '1.6', margin: 0 }}>
              Premium laundry service and express deliveries. Clean today, ready tomorrow!
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 12px 0', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>
              Our Address
            </h4>
            <p style={{ color: '#E2E8F0', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              16B Maria Okor Street,<br />Ejibo, Lagos, Nigeria
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 12px 0', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>
              Get In Touch
            </h4>
            <p style={{ color: '#E2E8F0', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              Call / WhatsApp: 07058155555<br />
              Email: support@bglaundry.com
            </p>
          </div>

        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid #1E293B', marginTop: '48px', paddingTop: '20px', fontSize: '12px', color: '#64748B' }}>
          © 2026 BG Laundry & Dry Cleaning. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
