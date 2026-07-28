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
    if (pathname === '/admin') { setReady(true); return; }
    const token = localStorage.getItem('adminToken');
    const user = JSON.parse(localStorage.getItem('adminUser') || 'null');
    if (!token || !user) { router.replace('/admin'); return; }
    if (pathname.startsWith('/admin/settings') && !isSuperAdmin(user)) {
      router.replace('/admin/dashboard');
      return;
    }
    const routes: Array<[string, AdminPermission]> = [
      ['/admin/settings', 'staff.manage'], ['/admin/staff', 'staff.manage'], ['/admin/pricing', 'pricing.manage'],
      ['/admin/riders', 'riders.manage'], ['/admin/users', 'customers.view'],
      ['/admin/invoices', 'invoices.manage'], ['/admin/orders', 'orders.manage'],
      ['/admin/dashboard', 'dashboard.view'],
    ];
    const required = routes.find(([route]) => pathname.startsWith(route))?.[1];
    if (required && !hasAdminPermission(user, required)) {
      const fallback = routes.slice().reverse().find(([, permission]) => hasAdminPermission(user, permission));
      router.replace(fallback?.[0] || '/admin');
      return;
    }
    setReady(true);
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
