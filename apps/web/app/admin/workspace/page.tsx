'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminPermission, hasAdminPermission, roleLabel } from '@/lib/admin-permissions';
import styles from './workspace.module.css';

type StaffUser = {
  fullName?: string;
  role?: string;
  permissions?: string[];
};

const modules: Array<{
  permission: AdminPermission;
  href: string;
  title: string;
  description: string;
  icon: string;
}> = [
  { permission: 'orders.manage', href: '/admin/orders', title: 'Orders', description: 'View and manage laundry orders assigned to your role.', icon: '▣' },
  { permission: 'invoices.manage', href: '/admin/invoices', title: 'Invoices', description: 'Create invoices and manage customer billing.', icon: '▤' },
  { permission: 'customers.view', href: '/admin/users', title: 'Customers', description: 'Access customer profiles and order history.', icon: '♙' },
  { permission: 'riders.manage', href: '/admin/riders', title: 'Riders', description: 'Manage rider accounts and delivery operations.', icon: '♜' },
  { permission: 'pricing.manage', href: '/admin/pricing', title: 'Pricing', description: 'Update services and laundry pricing.', icon: '⚙' },
];

export default function StaffWorkspacePage() {
  const [user, setUser] = useState<StaffUser | null>(null);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('adminUser') || 'null'));
    } catch {
      setUser(null);
    }
  }, []);

  const allowed = modules.filter(module => hasAdminPermission(user, module.permission));

  return <main className={styles.page}>
    <header>
      <span className={styles.eyebrow}>{roleLabel(user?.role)} workspace</span>
      <h1>Welcome, {user?.fullName?.split(' ')[0] || 'team member'}</h1>
      <p>This is your private work area. You can only open tools assigned to your account.</p>
    </header>

    <section className={styles.accessCard}>
      <div><strong>Your access</strong><span>{roleLabel(user?.role)}</span></div>
      <small>{allowed.length} operational module{allowed.length === 1 ? '' : 's'} available</small>
    </section>

    {allowed.length ? <section className={styles.grid}>
      {allowed.map(module => <Link href={module.href} key={module.href} className={styles.module}>
        <span className={styles.icon}>{module.icon}</span>
        <div><h2>{module.title}</h2><p>{module.description}</p></div>
        <b>Open →</b>
      </Link>)}
    </section> : <section className={styles.empty}>
      <h2>No modules assigned yet</h2>
      <p>Your account is active, but the Super Admin has not assigned any operational permissions. Contact the Super Admin to request access.</p>
    </section>}
  </main>;
}
