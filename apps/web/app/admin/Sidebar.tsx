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

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: IconDashboard,
      desc: 'Overview & metrics',
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: IconOrders,
      desc: 'Active orders registry',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: IconUsers,
      desc: 'Registered customers list',
    },
    {
      name: 'Pricing Setup',
      href: '/admin/pricing',
      icon: IconPricing,
      desc: 'Dynamic rate controller',
    },
  ];

  return (
    <>
      {isMobile && !mobileOpen && (
        <button className="mobileMenuButton" onClick={() => setMobileOpen(true)}>
          <IconMenu />
        </button>
      )}
      {isMobile && mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebarOpen' : ''}`}>
        <div className="sidebarInner" style={{ width: isCollapsed ? '72px' : '260px' }}>
          <button className="collapseButton" onClick={toggleCollapse}>
            {isCollapsed ? <IconChevronRight /> : <IconChevronLeft />}
          </button>

          <div className="brandHeader">
            <div className="brandLogo">BG</div>
            {!isCollapsed && <span className="brandTitle">BG Laundry</span>}
          </div>

          <nav className="sidebarNav">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} title={isCollapsed ? item.name : undefined} className={`navItem ${isActive ? 'active' : ''}`}>
                  <Icon size={20} />
                  {!isCollapsed && (
                    <div className="navMeta">
                      <span>{item.name}</span>
                      <span>{item.desc}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="sidebarFooter">
            <div className="profileContainer">
              <div className="profileBadge">{adminName.slice(0, 2).toUpperCase()}</div>
              {!isCollapsed && (
                <div className="profileText">
                  <div className="profileName">{adminName}</div>
                  <div className="profileRole">Admin Coordinator</div>
                </div>
              )}
            </div>
            <button className="logoutButton" onClick={handleLogout}>
              <IconLogOut />
              {!isCollapsed && 'Log Out'}
            </button>
          </div>
        </div>
      </aside>

      <style jsx>{`
        .sidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          background-color: #000000;
          color: #ffffff;
          display: flex;
          z-index: 50;
          min-width: 72px;
          max-width: 260px;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.05);
          border-right: 1px solid #1e293b;
        }

        .sidebarInner {
          width: 100%;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          box-sizing: border-box;
          position: relative;
        }

        .collapseButton {
          position: absolute;
          top: 32px;
          right: -12px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #0066ff;
          border: 1px solid #1e293b;
          color: #ffffff;
          display: grid;
          place-items: center;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 60;
        }

        .brandHeader {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          overflow: hidden;
          white-space: nowrap;
        }

        .brandLogo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background-color: #0066ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
          flex-shrink: 0;
        }

        .brandTitle {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.025em;
        }

        .sidebarNav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .navItem {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          color: #94a3b8;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease-in-out;
          border-left: 3px solid transparent;
        }

        .navItem:hover {
          background-color: rgba(255, 255, 255, 0.04);
          color: #ffffff;
        }

        .active {
          color: #ffffff;
          background-color: #0066ff;
          border-left-color: #ffffff;
          font-weight: 600;
        }

        .navMeta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .navMeta span:last-child {
          font-size: 11px;
          color: #cbd5e1;
        }

        .sidebarFooter {
          margin-top: auto;
          border-top: 1px solid rgba(148, 163, 184, 0.15);
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .profileContainer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          background-color: #111827;
        }

        .profileBadge {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background-color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: #ffffff;
        }

        .profileText {
          min-width: 0;
        }

        .profileName {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .profileRole {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .logoutButton {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          background-color: #111827;
          color: #fecaca;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .logoutButton:hover {
          background-color: rgba(244, 63, 94, 0.12);
        }

        .mobileMenuButton {
          position: fixed;
          top: 18px;
          left: 18px;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: none;
          background-color: #0066ff;
          color: #ffffff;
          display: grid;
          place-items: center;
          z-index: 110;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
          cursor: pointer;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.45);
          z-index: 90;
        }

        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            width: 280px;
            box-shadow: 14px 0 60px rgba(0, 0, 0, 0.24);
            border-right: none;
          }

          .sidebarOpen {
            transform: translateX(0);
          }

          .sidebarInner {
            padding: 20px 18px;
          }

          .collapseButton {
            display: none;
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
