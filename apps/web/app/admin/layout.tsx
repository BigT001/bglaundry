'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { AdminPermission, hasAdminPermission, isSuperAdmin } from '@/lib/admin-permissions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const showSidebar = pathname !== '/admin';
  const [ready, setReady] = useState(pathname === '/admin');

  useEffect(() => {
    let cancelled = false;
    async function checkAccess() {
      if (pathname === '/admin') { if (!cancelled) setReady(true); return; }
      setReady(false);
      let token = localStorage.getItem('adminToken');
      let user: { role?: string; permissions?: string[] } | null = null;
      try { user = JSON.parse(localStorage.getItem('adminUser') || 'null'); } catch { user = null; }

      // Recover a valid server session when browser storage was cleared,
      // delayed, or unavailable during the post-login navigation.
      if (!token || !user) {
        try {
          const response = await fetch('/api/v1/admin/auth/session', { credentials: 'same-origin', cache: 'no-store' });
          if (!response.ok) throw new Error('No active session');
          const data = await response.json();
          token = data.token;
          user = data.user;
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        } catch {
          if (!cancelled) router.replace('/admin');
          return;
        }
      }

      if (pathname.startsWith('/admin/dashboard') && !isSuperAdmin(user)) {
        router.replace('/admin/workspace');
        return;
      }
      if ((pathname.startsWith('/admin/staffs') || pathname.startsWith('/admin/settings')) && !isSuperAdmin(user)) {
        router.replace('/admin/workspace');
        return;
      }
      const routes: Array<[string, AdminPermission]> = [
        ['/admin/staffs', 'staff.manage'], ['/admin/settings', 'staff.manage'], ['/admin/staff', 'staff.manage'], ['/admin/pricing', 'pricing.manage'],
        ['/admin/riders', 'riders.manage'], ['/admin/users', 'customers.view'],
        ['/admin/invoices', 'invoices.manage'], ['/admin/orders', 'orders.manage'],
        ['/admin/dashboard', 'dashboard.view'],
      ];
      const required = routes.find(([route]) => pathname.startsWith(route))?.[1];
      if (required && !hasAdminPermission(user, required)) {
        router.replace('/admin/workspace');
        return;
      }
      if (!cancelled) setReady(true);
    }
    void checkAccess();
    return () => { cancelled = true; };
  }, [pathname, router]);

  return (
    <div className="adminLayout">
      {showSidebar && <Sidebar />}
      <div className={`adminContent ${showSidebar ? 'withSidebar' : 'withoutSidebar'}`}>
        {ready ? children : <div style={{ padding: 40 }}>Checking access…</div>}
      </div>
      <style jsx>{`
        .adminLayout {
          display: flex;
          height: 100vh;
          height: 100dvh;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          background-color: #F8FAFC;
        }

        .adminContent {
          width: 100%;
          min-width: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior-y: contain;
          -webkit-overflow-scrolling: touch;
        }

        .withSidebar {
          margin-left: 0;
        }

        .withoutSidebar {
          width: 100%;
        }

        @media (max-width: 900px) {
          .adminLayout {
            flex-direction: column;
          }

          .adminContent {
            height: 100dvh;
          }
        }
      `}</style>
    </div>
  );
}
