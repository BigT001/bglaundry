'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Sliders,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Users,
} from 'lucide-react';

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
      icon: LayoutDashboard,
      desc: 'Overview & metrics',
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      desc: 'Active orders registry',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      desc: 'Registered customers list',
    },
    {
      name: 'Pricing Setup',
      href: '/admin/pricing',
      icon: Sliders,
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
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
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
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>Log Out</span>}
        </a>
      </div>
    </aside>
  );
}
