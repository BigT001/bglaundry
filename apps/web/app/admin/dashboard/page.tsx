'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { getAdminCache, setAdminCache } from '../adminCache';
import {
  ShoppingBag,
  Users,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Bike,
  Car,
} from '@/lib/icons';
import { hasAdminPermission } from '@/lib/admin-permissions';

interface KpiData {
  totalOrders: number;
  ordersThisWeek: number;
  ordersLastWeek: number;
  orderGrowthPercent: number | null;
  driversOnline: number;
  totalDrivers: number;
  activePickups: number;
  unassignedPickups: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowthPercent: number | null;
  dailyRevenue: Array<{ date: string; label: string; amount: number }>;
  generatedAt: string;
}

interface Driver {
  id: string;
  fullName: string;
  phoneNumber: string;
  driverProfile?: {
    vehicleType: string | null;
    isOnline: boolean;
  } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    fullName: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{ serviceName: string }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [stats, setStats] = useState<KpiData>(() =>
    getAdminCache<KpiData>('dashboard-stats') || {
      totalOrders: 0,
      ordersThisWeek: 0,
      ordersLastWeek: 0,
      orderGrowthPercent: null,
      driversOnline: 0,
      totalDrivers: 0,
      activePickups: 0,
      unassignedPickups: 0,
      totalRevenue: 0,
      thisMonthRevenue: 0,
      lastMonthRevenue: 0,
      revenueGrowthPercent: null,
      dailyRevenue: [],
      generatedAt: '',
    },
  );
  const [drivers, setDrivers] = useState<Driver[]>(() => getAdminCache<Driver[]>('dashboard-drivers') || []);
  const [orders, setOrders] = useState<Order[]>(() => getAdminCache<Order[]>('dashboard-orders') || []);
  const [loading, setLoading] = useState(() => {
    const cachedStats = getAdminCache<KpiData>('dashboard-stats');
    const cachedDrivers = getAdminCache<Driver[]>('dashboard-drivers');
    const cachedOrders = getAdminCache<Order[]>('dashboard-orders');
    return !cachedStats || !cachedDrivers || !cachedOrders;
  });
  const [expandedSections, setExpandedSections] = useState({
    analytics: true,
    orders: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      setAuthChecked(true);
    } else {
      setAuthorized(true);
      setAuthChecked(true);
      fetchDashboardData();
      const refresh = window.setInterval(() => fetchDashboardData(true), 30000);
      return () => window.clearInterval(refresh);
    }
  }, []);

  const fetchDashboardData = async (quiet = false) => {
    const hasCachedData = Boolean(
      getAdminCache<KpiData>('dashboard-stats') &&
      getAdminCache<Driver[]>('dashboard-drivers') &&
      getAdminCache<Order[]>('dashboard-orders'),
    );
    if (!quiet && !hasCachedData) setLoading(true);
    if (!quiet) setError('');
    try {
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
      const authHeaders = { Authorization: `Bearer ${localStorage.getItem('adminToken')}` };
      const [statsRes, driversRes, ordersRes] = await Promise.all([
        axios.get('/api/v1/admin/stats', {
          headers: authHeaders,
        }),
        hasAdminPermission(adminUser, 'riders.manage')
          ? axios.get('/api/v1/drivers', { headers: authHeaders })
          : Promise.resolve({ data: [] }),
        hasAdminPermission(adminUser, 'orders.manage')
          ? axios.get('/api/v1/orders', { headers: authHeaders })
          : Promise.resolve({ data: [] }),
      ]);

      setStats(statsRes.data);
      setAdminCache('dashboard-stats', statsRes.data);
      setDrivers(driversRes.data);
      setAdminCache('dashboard-drivers', driversRes.data);
      setOrders(ordersRes.data);
      setAdminCache('dashboard-orders', ordersRes.data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      if (!quiet) setError(err.response?.data?.error || 'Unable to refresh live dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: 'analytics' | 'orders') => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const formatNaira = (amount: number) => {
    return '₦' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (!authChecked) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#F8FAFC',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          padding: '32px',
          textAlign: 'center',
          color: '#0F172A',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>Loading admin dashboard…</h2>
          <p style={{ marginTop: '12px', color: '#64748B' }}>
            Checking your admin session and initializing dashboard data.
          </p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Orders',
      val: stats.totalOrders.toString(),
      trend: stats.orderGrowthPercent === null
        ? `${stats.ordersThisWeek} booked this week`
        : `${stats.orderGrowthPercent >= 0 ? '+' : ''}${stats.orderGrowthPercent.toFixed(1)}% vs last week`,
      trendUp: stats.orderGrowthPercent !== null && stats.orderGrowthPercent > 0,
      color: '#0066FF',
      bgColor: 'rgba(0, 102, 255, 0.08)',
      icon: ShoppingBag,
    },
    {
      title: 'Drivers Online',
      val: stats.driversOnline.toString(),
      trend: `${Math.max(0, stats.totalDrivers - stats.driversOnline)} currently offline`,
      trendUp: stats.driversOnline > 0,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.08)',
      icon: Users,
    },
    {
      title: 'Active Pickups',
      val: stats.activePickups.toString(),
      trend: `${stats.unassignedPickups} awaiting rider dispatch`,
      trendUp: false,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.08)',
      icon: Clock,
    },
    {
      title: 'Total Revenue',
      val: formatNaira(stats.totalRevenue),
      trend: stats.revenueGrowthPercent === null
        ? `${formatNaira(stats.thisMonthRevenue)} received this month`
        : `${stats.revenueGrowthPercent >= 0 ? '+' : ''}${stats.revenueGrowthPercent.toFixed(1)}% vs last month`,
      trendUp: stats.revenueGrowthPercent !== null && stats.revenueGrowthPercent > 0,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="dashboardWrapper">
      <main className="dashboardMain">
        <header className="dashboardHeader">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Live operational data from completed bookings and successful payments.</p>
          </div>
          <div className="dashboardFreshness">
            <span className="liveIndicator" />
            {stats.generatedAt ? `Updated ${new Date(stats.generatedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}` : 'Waiting for live data'}
            <button type="button" onClick={() => fetchDashboardData()} disabled={loading}>Refresh</button>
          </div>
        </header>

        {error && <div className="errorCard"><span>{error}</span><button type="button" onClick={() => fetchDashboardData()}>Try again</button></div>}

        {loading ? (
          <div className="loadingCard">
            <div className="spinner" />
            Loading operations database state...
          </div>
        ) : (
          <>
            <section className="kpiGrid">
              {kpis.map((kpi, idx) => {
                const IconComponent = kpi.icon;
                return (
                  <div className="metricCard" key={idx}>
                    <div className="metricHeader">
                      <div>
                        <span>{kpi.title}</span>
                        <h3>{kpi.val}</h3>
                      </div>
                      <div className="metricIcon" style={{ backgroundColor: kpi.bgColor, color: kpi.color }}>
                        <IconComponent size={22} />
                      </div>
                    </div>
                    <div className="metricTrend">
                      {kpi.trendUp && <ArrowUpRight size={14} style={{ color: '#10B981' }} />}
                      <span>{kpi.trend}</span>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className={`panelCard ${expandedSections.analytics ? 'expanded' : 'collapsed'}`}>
              <button className="panelToggle" onClick={() => toggleSection('analytics')}>
                <div>
                  <span className="panelEyebrow">Operations Snapshot</span>
                  <h3>Performance & rider activity</h3>
                </div>
                <span className="toggleBadge">{expandedSections.analytics ? 'Collapse' : 'Expand'}</span>
              </button>

              {expandedSections.analytics && (
                <div className="panelBody">
                  <div className="chartRow">
                    <div className="chartCard">
                      <div className="sectionHeader">
                        <h3>Successful revenue · Last 7 days</h3>
                        <span>Database live</span>
                      </div>
                      {stats.dailyRevenue.some((entry) => entry.amount > 0) ? (
                        <div className="chartBars">
                          {stats.dailyRevenue.map((entry) => {
                            const maximum = Math.max(...stats.dailyRevenue.map((day) => day.amount), 1);
                            const height = Math.max(8, Math.round((entry.amount / maximum) * 190));
                            return <div key={entry.date} className="barColumn" title={`${entry.label}: ${formatNaira(entry.amount)}`}>
                            <div
                              className="barFill"
                              style={{ backgroundColor: entry.amount > 0 ? '#1565C0' : '#E2E8F0', height: `${height}px` }}
                            />
                            <strong>{entry.amount > 0 ? formatNaira(entry.amount) : '₦0'}</strong>
                            <span>{entry.label}</span>
                          </div>;
                          })}
                        </div>
                      ) : (
                        <div className="chartEmpty"><TrendingUp size={24} /><strong>No successful payments in the last 7 days</strong><span>Revenue will appear here automatically after a payment is confirmed.</span></div>
                      )}
                    </div>

                    <div className="liveDriverCard">
                      <h3>Live Rider Status</h3>
                      <div className="driverList">
                        {drivers.length === 0 ? (
                          <div className="emptyState">No rider accounts are available yet.</div>
                        ) : (
                          drivers.map((driver) => {
                            const isOnline = driver.driverProfile?.isOnline ?? false;
                            const vehicle = driver.driverProfile?.vehicleType || 'Vehicle not specified';
                            let VehicleIcon = Bike;
                            if (vehicle.toLowerCase().includes('van')) {
                              VehicleIcon = Car;
                            } else if (vehicle.toLowerCase().includes('motor')) {
                              VehicleIcon = Bike;
                            }

                            return (
                              <div className="driverRow" key={driver.id}>
                                <div className="driverMeta">
                                  <div className="driverBadge" style={{ backgroundColor: isOnline ? '#D1FAE5' : '#E2E8F0', color: isOnline ? '#065F46' : '#475569' }}>
                                    <VehicleIcon size={18} />
                                  </div>
                                  <div>
                                    <span>{driver.fullName}</span>
                                    <span>{vehicle}</span>
                                  </div>
                                </div>
                                <div className="driverStatus">
                                  <span className={isOnline ? 'onlineDot' : 'offlineDot'} />
                                  <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className={`panelCard ${expandedSections.orders ? 'expanded' : 'collapsed'}`}>
              <button className="panelToggle" onClick={() => toggleSection('orders')}>
                <div>
                  <span className="panelEyebrow">Queue</span>
                  <h3>Recent Orders</h3>
                </div>
                <span className="toggleBadge">{expandedSections.orders ? 'Collapse' : `Show ${orders.length} orders`}</span>
              </button>

              {expandedSections.orders && (
                <div className="panelBody">
                  <div className="ordersHeader">
                    <p>Latest requests from the customer app.</p>
                    <Link href="/admin/orders">Open full queue →</Link>
                  </div>

                  <div className="orderList">
                    {orders.length === 0 ? (
                      <div className="emptyState">No customer orders have been recorded yet.</div>
                    ) : (
                      orders.slice(0, 4).map((order) => {
                        const serviceTypes = Array.from(
                          new Set(order.items.map((item) => item.serviceName.split(' ')[0] || 'Laundry')),
                        ).join(', ');

                        let badgeBg = '#F3F4F6';
                        let badgeColor = '#374151';
                        if (order.status === 'DELIVERED') {
                          badgeBg = '#D1FAE5';
                          badgeColor = '#065F46';
                        } else if (order.status.includes('PENDING')) {
                          badgeBg = '#FEF3C7';
                          badgeColor = '#92400E';
                        } else if (order.status.includes('PROGRESS') || order.status === 'PROCESSING') {
                          badgeBg = '#E0F2FE';
                          badgeColor = '#0369A1';
                        }

                        return (
                          <div className="orderCard" key={order.id}>
                            <div className="orderCardMain">
                              <div className="orderTitle">{order.orderNumber}</div>
                              <div className="orderMeta">{order.customer.fullName}</div>
                              <div className="orderMeta soft">{serviceTypes}</div>
                            </div>
                            <div className="orderCardSide">
                              <div className="orderAmount">{formatNaira(order.totalAmount)}</div>
                              <span className="statusBadge" style={{ backgroundColor: badgeBg, color: badgeColor }}>
                                {order.status.toLowerCase().replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <style jsx>{`
        .dashboardWrapper {
          display: flex;
          min-height: 100vh;
          width: 100%;
          max-width: 100vw;
          background-color: #F8FAFC;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        .dashboardMain {
          flex: 1;
          width: 100%;
          max-width: 100vw;
          padding: 36px 40px 40px;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          min-width: 0;
        }

        .dashboardHeader {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 32px;
        }

        .dashboardHeader h1 {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .dashboardHeader p {
          margin: 7px 0 0;
          color: #64748B;
          font-size: 13px;
        }

        .dashboardFreshness {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748B;
          font-size: 12px;
          font-weight: 600;
        }

        .liveIndicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 0 4px #D1FAE5;
        }

        .dashboardFreshness button,
        .errorCard button {
          border: 1px solid #D6DFEA;
          background: #FFFFFF;
          color: #244A85;
          border-radius: 9px;
          padding: 8px 11px;
          font: 700 11px 'Inter', sans-serif;
          cursor: pointer;
        }

        .dashboardFreshness button:disabled {
          opacity: .55;
          cursor: wait;
        }

        .errorCard {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: -12px 0 22px;
          padding: 13px 15px;
          border: 1px solid #F1C7CC;
          border-radius: 11px;
          background: #FFF3F4;
          color: #983542;
          font-size: 12px;
        }

        .loadingCard {
          text-align: center;
          padding: 80px;
          font-size: 15px;
          color: #64748B;
          background-color: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          margin-top: 40px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #E2E8F0;
          border-top-color: #0066FF;
          border-radius: 50%;
          margin: 0 auto 16px auto;
          animation: spin 1s linear infinite;
        }

        .kpiGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          margin-bottom: 34px;
        }

        @media (max-width: 1200px) {
          .kpiGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .metricCard {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01);
          overflow: hidden;
        }

        .metricHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .metricHeader span {
          font-size: 13px;
          color: #64748B;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metricHeader h3 {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 8px 0 0 0;
        }

        .metricIcon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metricTrend {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 12px;
          font-weight: 500;
          color: #64748B;
        }

        .metricTrend span {
          color: inherit;
        }

        .panelCard {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
          overflow: hidden;
          margin-bottom: 18px;
        }

        .panelCard.collapsed {
          padding: 0;
        }

        .panelToggle {
          width: 100%;
          border: none;
          background: transparent;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 20px 24px;
          cursor: pointer;
          text-align: left;
        }

        .panelEyebrow {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #0066FF;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .panelToggle h3 {
          margin: 0;
          color: #0F172A;
          font-size: 16px;
          font-weight: 700;
        }

        .toggleBadge {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          background-color: #F8FAFC;
          padding: 7px 10px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .panelBody {
          padding: 0 24px 24px;
          border-top: 1px solid #F1F5F9;
          overflow-x: hidden;
        }

        .chartRow {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          padding-top: 20px;
        }

        .chartCard,
        .liveDriverCard {
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 20px;
          min-height: 280px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .sectionHeader h3 {
          margin: 0;
          color: #0F172A;
          font-size: 16px;
          font-weight: 700;
        }

        .sectionHeader span {
          font-size: 12px;
          color: #0066FF;
          font-weight: 600;
          background-color: rgba(0,102,255,0.05);
          padding: 4px 10px;
          border-radius: 20px;
        }

        .chartBars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
          padding: 0 10px;
          border-bottom: 1px solid #F1F5F9;
          flex-wrap: wrap;
          min-height: 240px;
          width: 100%;
          overflow-x: hidden;
        }

        .barColumn {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          gap: 10px;
        }

        .barFill {
          width: 32px;
          border-radius: 6px 6px 0 0;
          transition: transform 0.2s ease, height 0.4s ease;
          cursor: pointer;
        }

        .barColumn span {
          font-size: 12px;
          color: #64748B;
          font-weight: 600;
        }

        .barColumn strong {
          font-size: 9px;
          color: #475569;
          font-weight: 700;
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chartEmpty {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #8290A4;
          padding: 24px;
        }

        .chartEmpty strong {
          color: #334155;
          font-size: 14px;
          margin: 12px 0 5px;
        }

        .chartEmpty span {
          max-width: 340px;
          font-size: 11px;
          line-height: 1.5;
        }

        .liveDriverCard {
          padding: 28px;
        }

        .driverList {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .emptyState {
          color: #64748B;
          font-size: 14px;
          font-style: italic;
          text-align: center;
          padding: 40px 0;
        }

        .driverRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #F8FAFC;
          border-radius: 12px;
          border: 1px solid #F1F5F9;
          transition: transform 0.2s;
        }

        .driverMeta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .driverBadge {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .driverMeta span:first-child {
          display: block;
          font-size: 13.5px;
          font-weight: 700;
          color: #0F172A;
        }

        .driverMeta span:last-child {
          display: block;
          font-size: 11px;
          color: #64748B;
        }

        .driverStatus {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 88px;
          justify-content: flex-end;
        }

        .onlineDot,
        .offlineDot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .onlineDot {
          background-color: #10B981;
          animation: pulse 2s infinite;
        }

        .offlineDot {
          background-color: #94A3B8;
        }

        .ordersHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .ordersHeader p {
          margin: 0;
          color: #64748B;
          font-size: 13px;
        }

        .ordersHeader a {
          font-size: 13px;
          font-weight: 600;
          color: #0066FF;
          text-decoration: none;
        }

        .orderList {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .orderCard {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          width: 100%;
          min-width: 0;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 18px 20px;
        }

        .orderCardMain {
          min-width: 0;
          width: 100%;
          overflow-wrap: anywhere;
        }

        .orderTitle {
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 4px;
        }

        .orderMeta {
          font-size: 13px;
          color: #475569;
        }

        .orderMeta.soft {
          color: #64748B;
          margin-top: 2px;
        }

        .orderCardSide {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          flex-shrink: 0;
          min-width: 0;
        }

        .orderAmount {
          font-weight: 700;
          color: #0F172A;
        }

        .statusBadge {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
        }

        @media (max-width: 980px) {
          .dashboardMain {
            padding: 28px 20px;
          }

          .dashboardHeader {
            flex-direction: column;
            align-items: flex-start;
          }

          .kpiGrid {
            grid-template-columns: 1fr;
          }

          .chartRow {
            grid-template-columns: 1fr;
          }

          .chartCard,
          .liveDriverCard {
            min-height: auto;
          }

          .orderCard {
            flex-direction: column;
            align-items: flex-start;
          }

          .orderCardSide {
            align-items: flex-start;
          }
        }

        @media (max-width: 640px) {
          .dashboardMain {
            padding: 20px 16px;
          }

          .profileChip {
            width: 100%;
            justify-content: space-between;
          }

          .kpiGrid {
            gap: 18px;
          }

          .metricCard,
          .chartCard,
          .liveDriverCard {
            padding: 18px;
          }

          .panelBody {
            padding: 0 16px 16px;
          }

          .panelToggle {
            padding: 16px;
          }

          .dashboardHeader h1 {
            font-size: 24px;
          }

          .dashboardHeader p {
            font-size: 13px;
          }
        }
      `}</style>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
