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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [adminName, setAdminName] = useState('Blessed Admin');

  // Load collapse state and user details from localStorage
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
    <aside
      style={{
        width: isCollapsed ? '72px' : '260px',
        height: '100vh',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.05)',
        borderRight: '1px solid #1E293B',
        boxSizing: 'border-box',
        zIndex: 50,
      }}
    >
      {/* Collapse Toggle Handle */}
      <button
        onClick={toggleCollapse}
        style={{
          position: 'absolute',
          top: '32px',
          right: '-12px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#0066FF',
          border: '1px solid #1E293B',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          outline: 'none',
          transition: 'background-color 0.2s',
          zIndex: 60,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0052CC')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0066FF')}
      >
        {isCollapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
      </button>

      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '40px',
          paddingLeft: '8px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#0066FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#FFFFFF',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)',
          }}
        >
          BG
        </div>
        {!isCollapsed && (
          <span
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              transition: 'opacity 0.2s ease',
            }}
          >
            BG Laundry
          </span>
        )}
      </div>

      {/* Nav List */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                color: isActive ? '#FFFFFF' : '#94A3B8',
                backgroundColor: isActive ? '#0066FF' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                transition: 'all 0.2s ease-in-out',
                borderLeft: isActive ? '3px solid #FFFFFF' : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <Icon
                size={20}
                style={{
                  color: isActive ? '#FFFFFF' : '#64748B',
                  flexShrink: 0,
                  transition: 'color 0.2s',
                }}
              />
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>{item.name}</span>
                  <span style={{ fontSize: '11px', color: isActive ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontWeight: 'normal' }}>
                    {item.desc}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile Widget at Bottom */}
      <div
        style={{
          borderTop: '1px solid #1E293B',
          paddingTop: '20px',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#0066FF',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(0, 102, 255, 0.2)',
            }}
          >
            {adminName.substring(0, 2).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: '600',
                  color: '#F1F5F9',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {adminName}
              </span>
              <span style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap' }}>
                Admin Coordinator
              </span>
            </div>
          )}
        </div>

        {/* Action button */}
        <a
          href="#"
          onClick={handleLogout}
          title={isCollapsed ? 'Log Out' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '6px',
            color: '#FDA4AF',
            fontSize: '13.5px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.15)';
            e.currentTarget.style.color = '#F43F5E';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#FDA4AF';
          }}
        >
          <IconLogOut size={16} />
          {!isCollapsed && <span>Log Out</span>}
        </a>
      </div>
    </aside>
  );
}
