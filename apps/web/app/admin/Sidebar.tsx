'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// Inline SVG icons — avoids lucide-react @types/react peer conflict in monorepo
type IconProps = { size?: number; style?: React.CSSProperties; className?: string };

const IconDashboard = ({ size = 20, style, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IconOrders = ({ size = 20, style, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const IconUsers = ({ size = 20, style, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconPricing = ({ size = 20, style, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);
const IconLogOut = ({ size = 16, style, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconChevronRight = ({ size = 14, style, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconChevronLeft = ({ size = 14, style, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconMenu = ({ size = 20, style, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);
const IconRiders = ({ size = 20, style, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <circle cx="8" cy="8" r="3" />
    <path d="M5 14c0-2 3-3 3-3s3 1 3 3v4H5v-4Z" />
    <path d="M15 7h4" />
    <path d="M17 7v10" />
    <path d="M15 17h4" />
  </svg>
);
const IconInvoice = ({ size = 20, style, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <path d="M6 2h9l3 3v17H6z" />
    <path d="M15 2v4h4" />
    <path d="M9 11h6M9 15h6M9 19h3" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [adminName, setAdminName] = useState('Blessed Admin');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsCollapsed(collapsed);

    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.fullName) {
          setAdminName(user.fullName);
        }
      } catch (err) {
        console.error('Failed to parse admin user info:', err);
      }
    }

    const resizeHandler = () => {
      setIsMobile(window.innerWidth <= 900);
      if (window.innerWidth > 900) {
        setMobileOpen(false);
      }
    };

    resizeHandler();
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebarCollapsed', String(nextState));
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin');
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: IconDashboard,
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: IconOrders,
    },
    {
      name: 'Invoices',
      href: '/admin/invoices',
      icon: IconInvoice,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: IconUsers,
    },
    {
      name: 'Riders',
      href: '/admin/riders',
      icon: IconRiders,
    },
    {
      name: 'Pricing Setup',
      href: '/admin/pricing',
      icon: IconPricing,
    },
  ];
  // A collapsed desktop preference should not turn the mobile drawer into an
  // icon-only menu, where the expand control is intentionally hidden.
  const sidebarIsCompact = isCollapsed && !isMobile;

  return (
    <>
      {isMobile && !mobileOpen && (
        <button
        className="mobileMenuButton"
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin navigation"
      >
        <IconMenu />
      </button>
      )}
      {isMobile && mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <aside className={`sidebar ${sidebarIsCompact ? 'sidebarCollapsed' : ''} ${mobileOpen ? 'sidebarOpen' : ''}`}>
        <div className="sidebarInner">
          <button
            type="button"
            className="collapseButton"
            onClick={toggleCollapse}
            aria-label={sidebarIsCompact ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarIsCompact}
          >
            {sidebarIsCompact ? <IconChevronRight /> : <IconChevronLeft />}
          </button>

          <div className="brandHeader">
            <div className="brandLogo">BG</div>
            {!sidebarIsCompact && (
              <div className="brandInfo">
                <span className="brandTitle">BG Laundry</span>
                <span className="brandTag">Admin Console</span>
              </div>
            )}
          </div>

          <nav className="sidebarNav" aria-label="Admin navigation">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarIsCompact ? item.name : undefined}
                  className={`navItem ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && <span className="activeMarker" aria-hidden="true" />}
                  <span className="iconWrap">
                    <Icon size={20} />
                  </span>
                  {!sidebarIsCompact && <span className="navLabel">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="sidebarFooter">
            <div className="profileContainer">
              <div className="profileBadge">{adminName.slice(0, 2).toUpperCase()}</div>
              {!sidebarIsCompact && (
                <div className="profileText">
                  <div className="profileName">{adminName}</div>
                  <div className="profileRole">Admin Coordinator</div>
                </div>
              )}
            </div>
            <button className="logoutButton" onClick={handleLogout}>
              <IconLogOut />
              {!sidebarIsCompact && 'Log Out'}
            </button>
          </div>
        </div>
      </aside>

      <style jsx>{`
        .sidebar {
          position: sticky;
          top: 0;
          align-self: flex-start;
          height: 100vh;
          height: 100dvh;
          width: 260px;
          min-width: 260px;
          background-color: #FFFFFF;
          color: #000000;
          display: flex;
          z-index: 110;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
          border-right: 1px solid #E5E7EB;
          transition: width 0.22s ease, transform 0.22s ease;
        }

        .sidebar.sidebarCollapsed {
          width: 76px;
          min-width: 76px;
        }

        .sidebar.sidebarCollapsed .sidebarInner {
          padding-left: 12px;
          padding-right: 12px;
        }

        .sidebar.sidebarCollapsed .brandHeader,
        .sidebar.sidebarCollapsed :global(.navItem),
        .sidebar.sidebarCollapsed .profileContainer,
        .sidebar.sidebarCollapsed .logoutButton {
          justify-content: center !important;
        }

        .sidebar.sidebarCollapsed :global(.navItem) {
          padding-left: 8px !important;
          padding-right: 8px !important;
        }

        .sidebar.sidebarCollapsed .sidebarFooter {
          gap: 12px;
        }

        .sidebarInner {
          width: 100%;
          height: 100%;
          padding: 28px 18px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 24px;
          box-sizing: border-box;
          position: relative;
        }

        .collapseButton {
          position: absolute;
          top: 24px;
          right: -14px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #F8F8F8;
          border: 1px solid #D1D5DB;
          color: #000000;
          display: grid;
          place-items: center;
          cursor: pointer;
          box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
          z-index: 60;
          transition: transform 0.2s ease;
        }

        .collapseButton:hover {
          transform: translateX(1px);
        }

        .brandHeader {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          overflow: hidden;
          white-space: nowrap;
        }

        .brandLogo {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          background-color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          color: #FFFFFF;
          flex-shrink: 0;
        }

        .brandInfo {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .brandTitle {
          font-size: 18px;
          font-weight: 800;
          color: #000000;
          letter-spacing: -0.025em;
        }

        .brandTag {
          font-size: 12px;
          color: #64748B;
        }

        .sidebarNav {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .sidebar :global(a) {
          color: inherit;
          text-decoration: none;
        }

        :global(.navItem) {
          position: relative !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 14px !important;
          padding: 12px 16px !important;
          border-radius: 16px !important;
          color: #000000 !important;
          text-decoration: none !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          transition: background-color 0.22s ease, color 0.22s ease, transform 0.18s ease, box-shadow 0.22s ease !important;
          background-color: transparent !important;
          border: 1px solid transparent !important;
          min-height: 50px !important;
          white-space: nowrap !important;
          flex-wrap: nowrap !important;
        }

        :global(.navItem:hover) {
          background-color: #F1F5F9 !important;
          color: #000000;
          transform: translateX(2px);
        }

        :global(.navItem.active) {
          background: linear-gradient(100deg, #102B72 0%, #19469A 100%) !important;
          border-color: #102B72 !important;
          color: #FFFFFF !important;
          box-shadow: 0 9px 22px rgba(16, 43, 114, 0.24);
          transform: translateX(3px);
          animation: activeNavIn 0.32s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes activeNavIn {
          from { opacity: 0.72; transform: translateX(-7px); }
          to { opacity: 1; transform: translateX(3px); }
        }

        .activeMarker {
          position: absolute;
          left: 0;
          top: 11px;
          bottom: 11px;
          width: 3px;
          border-radius: 0 4px 4px 0;
          background: #7DD3FC;
          box-shadow: 0 0 12px rgba(125, 211, 252, 0.8);
        }

        :global(.navItem.active) .iconWrap,
        :global(.navItem.active) .navLabel {
          color: #FFFFFF !important;
        }

        :global(.navItem.active) .iconWrap {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 10px;
        }

        .iconWrap {
          width: 34px;
          min-width: 34px;
          height: 34px;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #000000 !important;
          flex-shrink: 0;
        }

        .navLabel {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 100%;
          white-space: nowrap !important;
          color: #000000 !important;
          line-height: 1.1 !important;
        }

        .sidebarFooter {
          margin-top: auto;
          border-top: 1px solid #E5E7EB;
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .profileContainer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border-radius: 16px;
          background-color: #F8F8F8;
        }

        .profileBadge {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          background-color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          color: #ffffff;
        }

        .profileText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .profileName {
          font-size: 13px;
          font-weight: 700;
          color: #000000;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .profileRole {
          font-size: 11px;
          color: #64748B;
        }

        .logoutButton {
          width: 100%;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid #D1D5DB;
          background-color: #FFFFFF;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.18s ease, border-color 0.18s ease;
        }

        .logoutButton:hover {
          background-color: #F3F4F6;
          border-color: #9CA3AF;
        }

        .mobileMenuButton {
          position: fixed;
          top: 18px;
          left: 18px;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: 1px solid #D1D5DB;
          background-color: #FFFFFF;
          color: #000000;
          display: grid;
          place-items: center;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
          z-index: 130;
          cursor: pointer;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.28);
          z-index: 105;
        }

        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            width: 280px;
            min-width: 280px;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: 14px 0 60px rgba(0, 0, 0, 0.24);
            border-right: none;
          }

          .sidebar.sidebarCollapsed {
            width: 280px;
            min-width: 280px;
          }

          .sidebar.sidebarOpen {
            transform: translateX(0);
          }

          .sidebarInner {
            min-width: 280px;
            height: 100vh;
            padding-top: 24px;
            padding-bottom: 24px;
          }

          .sidebar.sidebarCollapsed .sidebarInner {
            padding-left: 18px;
            padding-right: 18px;
          }

          .collapseButton {
            display: none;
          }
        }

        @media (max-width: 640px) {
          :global(.navItem) {
            padding: 12px 14px;
          }

          .brandLogo {
            width: 36px;
            height: 36px;
          }

          .brandHeader {
            gap: 10px;
          }
        }

        @media (max-width: 520px) {
          .mobileMenuButton {
            width: 40px;
            height: 40px;
            left: 14px;
            top: 14px;
          }
        }
      `}</style>
    </>
  );
}
