'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Sidebar from '../Sidebar';
import {
  ShoppingBag,
  Users,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Bike,
  Car,
} from '@/lib/icons';

interface KpiData {
  totalOrders: number;
  driversOnline: number;
  activePickups: number;
  totalRevenue: number;
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
  const [stats, setStats] = useState<KpiData>({
    totalOrders: 0,
    driversOnline: 0,
    activePickups: 0,
    totalRevenue: 0,
  });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    analytics: true,
    orders: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
    } else {
      setAuthorized(true);
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get('/api/v1/admin/stats');
      setStats(statsRes.data);

      const driversRes = await axios.get('/api/v1/drivers');
      setDrivers(driversRes.data);

      const ordersRes = await axios.get('/api/v1/orders');
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
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

  if (!authorized) {
    return null;
  }

  const kpis = [
    {
      title: 'Total Orders',
      val: stats.totalOrders.toString(),
      trend: '+12.5% vs last week',
      trendUp: true,
      color: '#0066FF',
      bgColor: 'rgba(0, 102, 255, 0.08)',
      icon: ShoppingBag,
    },
    {
      title: 'Drivers Online',
      val: stats.driversOnline.toString(),
      trend: `${drivers.length - stats.driversOnline} currently offline`,
      trendUp: true,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.08)',
      icon: Users,
    },
    {
      title: 'Active Pickups',
      val: stats.activePickups.toString(),
      trend: 'Awaiting rider dispatch',
      trendUp: false,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.08)',
      icon: Clock,
    },
    {
      title: 'Total Revenue',
      val: formatNaira(stats.totalRevenue),
      trend: '+18.2% monthly growth',
      trendUp: true,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="dashboardWrapper">
      <Sidebar />
      <main className="dashboardMain">
        <header className="dashboardHeader">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Real-time analytics, rider tracking, and transaction flows</p>
          </div>
          <div className="profileChip">
            <div className="profileInitial">AD</div>
            <div>
              <span>Admin Coordinator</span>
              <span>Operations</span>
            </div>
          </div>
        </header>

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
                        <h3>Weekly Revenue Trend</h3>
                        <span>Live pulse</span>
                      </div>
                      <div className="chartBars">
                        {[
                          { day: 'Mon', h: '60px', act: false },
                          { day: 'Tue', h: '90px', act: false },
                          { day: 'Wed', h: '140px', act: true, col: '#0066FF' },
                          { day: 'Thu', h: '110px', act: false },
                          { day: 'Fri', h: '180px', act: true, col: '#0F172A' },
                          { day: 'Sat', h: '210px', act: true, col: '#10B981' },
                        ].map((bar, i) => (
                          <div key={i} className="barColumn">
                            <div
                              className="barFill"
                              style={{ backgroundColor: bar.col || '#E2E8F0', height: bar.h, opacity: bar.act ? 1 : 0.65 }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scaleY(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scaleY(1)';
                              }}
                            />
                            <span>{bar.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="liveDriverCard">
                      <h3>Live Rider Status</h3>
                      <div className="driverList">
                        {drivers.length === 0 ? (
                          <div className="emptyState">No drivers registered in DB.</div>
                        ) : (
                          drivers.map((driver) => {
                            const isOnline = driver.driverProfile?.isOnline ?? false;
                            const vehicle = driver.driverProfile?.vehicleType || 'Motorcycle';
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
                      <div className="emptyState">No orders recorded yet. Submit orders from the mobile client.</div>
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
          padding: 40px;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          min-width: 0;
        }

        .dashboardHeader {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          margin-bottom: 36px;
        }

        .dashboardHeader h1 {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .dashboardHeader p {
          margin: 6px 0 0 0;
          color: #64748B;
          font-size: 14px;
        }

        .profileChip {
          display: flex;
          align-items: center;
          gap: 12px;
          background-color: #FFFFFF;
          padding: 8px 16px;
          border-radius: 24px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .profileInitial {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #38BDF8;
          color: #0F172A;
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 13px;
        }

        .profileChip span {
          display: block;
          line-height: 1.2;
        }

        .profileChip span:first-child {
          font-size: 12.5px;
          font-weight: 700;
          color: #0F172A;
        }

        .profileChip span:last-child {
          font-size: 10px;
          color: #64748B;
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
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 36px;
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
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .orderCard {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          width: 100%;
          min-width: 0;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 14px 16px;
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
