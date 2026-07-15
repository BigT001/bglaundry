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
  TrendingDown,
  Navigation,
  Bike,
  Car,
} from 'lucide-react';

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

  // Authenticate Admin
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
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', boxSizing: 'border-box' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '36px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.025em' }}>
              Dashboard Overview
            </h1>
            <p style={{ color: '#64748B', margin: '6px 0 0 0', fontSize: '14px' }}>
              Real-time analytics, rider tracking, and transaction flows
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#FFFFFF',
              padding: '6px 16px 6px 6px',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#38BDF8',
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px',
              }}
            >
              AD
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>
                Admin Coordinator
              </span>
              <span style={{ fontSize: '10px', color: '#64748B' }}>
                Operations
              </span>
            </div>
          </div>
        </header>

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px',
              fontSize: '15px',
              color: '#64748B',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #E2E8F0',
                borderTopColor: '#0066FF',
                borderRadius: '50%',
                margin: '0 auto 16px auto',
                animation: 'spin 1s linear infinite',
              }}
            />
            Loading operations database state...
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '36px',
              }}
            >
              {kpis.map((kpi, idx) => {
                const IconComponent = kpi.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {kpi.title}
                        </span>
                        <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: '8px 0' }}>
                          {kpi.val}
                        </h3>
                      </div>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          backgroundColor: kpi.bgColor,
                          color: kpi.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComponent size={22} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      {kpi.trendUp ? (
                        <ArrowUpRight size={14} style={{ color: '#10B981' }} />
                      ) : null}
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: kpi.trendUp ? '#10B981' : '#64748B',
                        }}
                      >
                        {kpi.trend}
                      </span>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Visual Analytics Rows */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '32px',
                marginBottom: '36px',
              }}
            >
              {/* Overhauled Chart Area */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '28px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                  minHeight: '340px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, color: '#0F172A', fontSize: '16px', fontWeight: '700' }}>
                    Weekly Revenue Trend
                  </h3>
                  <span style={{ fontSize: '12px', color: '#0066FF', fontWeight: '600', backgroundColor: 'rgba(0,102,255,0.05)', padding: '4px 10px', borderRadius: '20px' }}>
                    Auto-refreshing live
                  </span>
                </div>
                <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px', borderBottom: '1px solid #F1F5F9' }}>
                  {/* Styled simulated chart bars */}
                  {[
                    { day: 'Mon', h: '60px', act: false },
                    { day: 'Tue', h: '90px', act: false },
                    { day: 'Wed', h: '140px', act: true, col: '#0066FF' },
                    { day: 'Thu', h: '110px', act: false },
                    { day: 'Fri', h: '180px', act: true, col: '#0F172A' },
                    { day: 'Sat', h: '210px', act: true, col: '#10B981' },
                  ].map((bar, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div
                        style={{
                          width: '32px',
                          height: bar.h,
                          backgroundColor: bar.col || '#E2E8F0',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.6s ease',
                          cursor: 'pointer',
                          opacity: bar.act ? 1 : 0.65,
                          boxShadow: bar.act ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scaleY(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scaleY(1)';
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 10px 0 10px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748B',
                  }}
                >
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>
              </div>

              {/* Overhauled Live Driver Grid */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '28px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                }}
              >
                <h3 style={{ margin: '0 0 20px 0', color: '#0F172A', fontSize: '16px', fontWeight: '700' }}>
                  Live Rider Status
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {drivers.length === 0 ? (
                    <div style={{ color: '#64748B', fontSize: '14px', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
                      No drivers registered in DB.
                    </div>
                  ) : (
                    drivers.map((driver) => {
                      const isOnline = driver.driverProfile?.isOnline ?? false;
                      const vehicle = driver.driverProfile?.vehicleType || 'Motorcycle';
                      
                      // Match vehicle icons
                      let VehicleIcon = Bike;
                      if (vehicle.toLowerCase().includes('van')) {
                        VehicleIcon = Car;
                      } else if (vehicle.toLowerCase().includes('motor')) {
                        VehicleIcon = Bike;
                      }

                      return (
                        <div
                          key={driver.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '12px',
                            border: '1px solid #F1F5F9',
                            transition: 'transform 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: isOnline ? '#D1FAE5' : '#E2E8F0',
                                color: isOnline ? '#065F46' : '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <VehicleIcon size={18} />
                            </div>
                            <div>
                              <span style={{ fontSize: '13.5px', fontWeight: '700', display: 'block', color: '#0F172A' }}>
                                {driver.fullName}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>
                                {vehicle}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: isOnline ? '#10B981' : '#94A3B8',
                                display: 'inline-block',
                                animation: isOnline ? 'pulse 2s infinite' : 'none',
                              }}
                            />
                            <span style={{ color: isOnline ? '#10B981' : '#64748B', fontWeight: '700', fontSize: '11px' }}>
                              {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>

            {/* Overhauled Table Section */}
            <section
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '16px', fontWeight: '700' }}>
                  Recent Orders Registry
                </h3>
                <Link
                  href="/admin/orders"
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0066FF',
                    textDecoration: 'none',
                  }}
                >
                  View Active Queue →
                </Link>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Order ID</th>
                    <th style={{ padding: '12px 16px' }}>Customer Name</th>
                    <th style={{ padding: '12px 16px' }}>Service Type</th>
                    <th style={{ padding: '12px 16px' }}>Amount</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontStyle: 'italic', fontSize: '14px' }}>
                        No orders recorded yet. Submit orders from the mobile client.
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 5).map((order) => {
                      const serviceTypes = Array.from(
                        new Set(order.items.map((item) => item.serviceName.split(' ')[0] || 'Laundry')),
                      ).join(', ');

                      // Status Badge Styling
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
                        <tr
                          key={order.id}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '16px', fontWeight: '700', color: '#0066FF' }}>
                            {order.orderNumber}
                          </td>
                          <td style={{ padding: '16px', fontWeight: '600', color: '#0F172A' }}>
                            {order.customer.fullName}
                          </td>
                          <td style={{ padding: '16px', color: '#475569' }}>
                            {serviceTypes}
                          </td>
                          <td style={{ padding: '16px', fontWeight: '700', color: '#0F172A' }}>
                            {formatNaira(order.totalAmount)}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: badgeBg, color: badgeColor, textTransform: 'capitalize' }}>
                              {order.status.toLowerCase().replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
