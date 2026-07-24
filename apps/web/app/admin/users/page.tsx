'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ChevronDown, Clock, MapPin, Search, ShoppingBag, TrendingUp, User } from '@/lib/icons';
import { getAdminCache, setAdminCache } from '../adminCache';
import styles from './customers.module.css';

type CustomerOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  itemCount: number;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate: string | null;
  createdAt: string;
};

type Customer = {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  pickupAddress: string | null;
  addressType: string | null;
  createdAt: string;
  totalOrders: number;
  completedOrders: number;
  lifetimeRevenue: number;
  bookedValue: number;
  averageOrderValue: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  ordersPerMonth: number;
  isRepeatCustomer: boolean;
  orders: CustomerOrder[];
};

const money = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'C';
}

function readableStatus(status: string) {
  return status.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function frequencyLabel(customer: Customer) {
  if (!customer.totalOrders) return 'No orders yet';
  if (customer.ordersPerMonth >= 4) return 'Very frequent';
  if (customer.ordersPerMonth >= 2) return 'Frequent';
  if (customer.ordersPerMonth >= 1) return 'Monthly';
  if (customer.isRepeatCustomer) return 'Occasional';
  return 'New customer';
}

function relativeDate(date: string | null) {
  if (!date) return 'Never';
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(() => getAdminCache<Customer[]>('admin-users') || []);
  const [loading, setLoading] = useState(() => !getAdminCache<Customer[]>('admin-users'));
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<'ALL' | 'REPEAT' | 'NEW' | 'INACTIVE'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchCustomers = useCallback(async (quiet = false) => {
    if (!quiet && !getAdminCache<Customer[]>('admin-users')) setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      const next = response.data.users || [];
      setCustomers(next);
      setAdminCache('admin-users', next);
    } catch (requestError: any) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem('adminToken');
        router.replace('/admin');
        return;
      }
      if (!quiet) setError(requestError.response?.data?.error || 'Unable to load customer insights.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      router.replace('/admin');
      return;
    }
    setAuthorized(true);
    fetchCustomers();
    const refresh = window.setInterval(() => fetchCustomers(true), 30000);
    return () => window.clearInterval(refresh);
  }, [fetchCustomers, router]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const inactive = !customer.lastOrderAt || Date.now() - new Date(customer.lastOrderAt).getTime() > 90 * 86400000;
      const matchesSegment = segment === 'ALL'
        || (segment === 'REPEAT' && customer.isRepeatCustomer)
        || (segment === 'NEW' && customer.totalOrders <= 1)
        || (segment === 'INACTIVE' && inactive);
      const matchesSearch = !query || [
        customer.fullName,
        customer.phoneNumber,
        customer.email,
        customer.pickupAddress,
      ].some((value) => value?.toLowerCase().includes(query));
      return matchesSegment && matchesSearch;
    });
  }, [customers, search, segment]);

  const portfolio = useMemo(() => {
    const revenue = customers.reduce((sum, customer) => sum + customer.lifetimeRevenue, 0);
    const bookedValue = customers.reduce((sum, customer) => sum + customer.bookedValue, 0);
    const orderCount = customers.reduce((sum, customer) => sum + customer.totalOrders, 0);
    const repeat = customers.filter((customer) => customer.isRepeatCustomer).length;
    return {
      revenue,
      repeat,
      repeatRate: customers.length ? Math.round((repeat / customers.length) * 100) : 0,
      averageValue: orderCount ? bookedValue / orderCount : 0,
    };
  }, [customers]);

  if (!authorized) return <div className={styles.loadingPage}>Checking admin access…</div>;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Customers / Insights</span>
          <h1>Customer directory</h1>
          <p>Understand customer value, loyalty, activity and complete order history.</p>
        </div>
        <div className={styles.customerCount}><User size={16} /><strong>{customers.length}</strong><span>customers</span></div>
      </header>

      <section className={styles.metrics}>
        <article><div className={styles.metricIcon}><User size={19} /></div><div><span>Total customers</span><strong>{customers.length}</strong><small>Customer accounts only</small></div></article>
        <article><div className={`${styles.metricIcon} ${styles.green}`}><TrendingUp size={19} /></div><div><span>Customer revenue</span><strong>{money.format(portfolio.revenue)}</strong><small>Successful payments</small></div></article>
        <article><div className={`${styles.metricIcon} ${styles.violet}`}><ShoppingBag size={19} /></div><div><span>Repeat customers</span><strong>{portfolio.repeat}</strong><small>{portfolio.repeatRate}% retention base</small></div></article>
        <article><div className={`${styles.metricIcon} ${styles.amber}`}><span>₦</span></div><div><span>Average order value</span><strong>{money.format(portfolio.averageValue)}</strong><small>Across customer profiles</small></div></article>
      </section>

      <section className={styles.toolbar}>
        <div className={styles.search}><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, phone, email or address…" /></div>
        <div className={styles.segments}>
          {(['ALL', 'REPEAT', 'NEW', 'INACTIVE'] as const).map((value) => (
            <button key={value} className={segment === value ? styles.selectedSegment : ''} onClick={() => setSegment(value)}>
              {value.charAt(0) + value.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </section>

      {error && <div className={styles.error}>{error}<button onClick={() => fetchCustomers()}>Try again</button></div>}

      {loading ? (
        <div className={styles.empty}>Loading customer intelligence…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}><div><User size={28} /></div><h2>No customers found</h2><p>Try a different search or customer segment.</p></div>
      ) : (
        <section className={styles.list}>
          <div className={styles.listHeader}><span>Customer</span><span>Patronage</span><span>Lifetime revenue</span><span>Last activity</span><span /></div>
          {filtered.map((customer) => {
            const expanded = expandedId === customer.id;
            return (
              <article className={`${styles.customerCard} ${expanded ? styles.expanded : ''}`} key={customer.id}>
                <button className={styles.summary} onClick={() => setExpandedId(expanded ? null : customer.id)} aria-expanded={expanded}>
                  <div className={styles.profile}>
                    <div className={styles.avatar}>{initials(customer.fullName)}</div>
                    <div><strong>{customer.fullName || 'Unnamed customer'}</strong><span>{customer.phoneNumber}</span></div>
                    {customer.isRepeatCustomer && <i>Repeat</i>}
                  </div>
                  <div className={styles.patronage}><strong>{customer.totalOrders}</strong><span>{customer.totalOrders === 1 ? 'order' : 'orders'} · {frequencyLabel(customer)}</span></div>
                  <div className={styles.revenue}><strong>{money.format(customer.lifetimeRevenue)}</strong><span>{money.format(customer.bookedValue)} booked</span></div>
                  <div className={styles.activity}><strong>{relativeDate(customer.lastOrderAt)}</strong><span>{customer.completedOrders} completed</span></div>
                  <ChevronDown size={18} className={styles.chevron} />
                </button>

                {expanded && (
                  <div className={styles.details}>
                    <div className={styles.insightGrid}>
                      <div><span>Average order</span><strong>{money.format(customer.averageOrderValue)}</strong></div>
                      <div><span>Order frequency</span><strong>{customer.ordersPerMonth ? `${customer.ordersPerMonth.toFixed(1)} / month` : 'No history'}</strong></div>
                      <div><span>First patronage</span><strong>{relativeDate(customer.firstOrderAt)}</strong></div>
                      <div><span>Completion rate</span><strong>{customer.totalOrders ? `${Math.round((customer.completedOrders / customer.totalOrders) * 100)}%` : '—'}</strong></div>
                    </div>

                    <div className={styles.customerInfo}>
                      <div><span>Contact</span><strong>{customer.phoneNumber}</strong><small>{customer.email || 'No email provided'}</small></div>
                      <div><span>Default address</span><strong>{customer.pickupAddress || 'No default address'}</strong><small>{customer.addressType ? customer.addressType.toLowerCase() : 'Address type not set'}</small></div>
                      <div><span>Customer since</span><strong>{new Date(customer.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</strong><small>ID · {customer.id.slice(0, 8)}</small></div>
                    </div>

                    <div className={styles.historyHeader}><div><h3>Order history</h3><p>Most recent orders and payment performance.</p></div><span>{customer.orders.length} records</span></div>
                    {customer.orders.length === 0 ? (
                      <div className={styles.noOrders}><ShoppingBag size={22} />This customer has not placed an order yet.</div>
                    ) : (
                      <div className={styles.orderTable}>
                        <div className={styles.orderHead}><span>Order</span><span>Date</span><span>Items</span><span>Status</span><span>Order value</span><span>Paid</span></div>
                        {customer.orders.map((order) => (
                          <div className={styles.orderRow} key={order.id}>
                            <strong>{order.orderNumber}</strong>
                            <span>{new Date(order.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span>{order.itemCount}</span>
                            <span className={`${styles.orderStatus} ${styles[order.status.toLowerCase()] || ''}`}>{readableStatus(order.status)}</span>
                            <strong>{money.format(order.totalAmount)}</strong>
                            <strong className={order.paidAmount > 0 ? styles.paid : styles.unpaid}>{order.paidAmount > 0 ? money.format(order.paidAmount) : 'Unpaid'}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                    {customer.orders[0] && (
                      <div className={styles.lastLocation}><MapPin size={15} /><span>Most recent pickup:</span><strong>{customer.orders[0].pickupAddress}</strong><Clock size={14} /><span>{relativeDate(customer.orders[0].createdAt)}</span></div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
