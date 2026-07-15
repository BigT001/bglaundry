'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from '../Sidebar';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';

interface Driver {
  id: string;
  fullName: string;
  driverProfile?: {
    vehicleType: string | null;
    isOnline: boolean;
  } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: {
    fullName: string;
    phoneNumber: string;
  };
  pickupAddress: string;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  driverId: string | null;
  driver: {
    fullName: string;
  } | null;
  createdAt: string;
}

const ORDER_STATUSES = [
  'PICKUP_PENDING',
  'PICKUP_IN_PROGRESS',
  'PICKED_UP',
  'PROCESSING',
  'DELIVERY_PENDING',
  'DELIVERY_IN_PROGRESS',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Authenticate Admin
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
    } else {
      setAuthorized(true);
      fetchOrdersAndDrivers();
    }
  }, []);

  const fetchOrdersAndDrivers = async () => {
    setLoading(true);
    try {
      const ordersRes = await axios.get('/api/v1/orders');
      setOrders(ordersRes.data);

      const driversRes = await axios.get('/api/v1/drivers');
      setDrivers(driversRes.data);
    } catch (err) {
      console.error('Failed to load orders or drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    if (!driverId) return;
    try {
      await axios.patch(`/api/v1/orders/${orderId}/assign`, { driverId });
      alert('Driver assigned successfully!');
      fetchOrdersAndDrivers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to assign driver.');
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await axios.patch(`/api/v1/orders/${orderId}/status`, {
        status,
        otp: '1234', // Bypass OTP code for dev simulation
      });
      alert(`Order status updated to ${status}!`);
      fetchOrdersAndDrivers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update order status.');
    }
  };

  const formatNaira = (amount: number) => {
    return '₦' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (!authorized) {
    return null;
  }

  // Filter online drivers
  const onlineDrivers = drivers.filter(
    (d) => d.driverProfile?.isOnline === true,
  );

  // Search filter
  const filteredOrders = orders.filter((o) => {
    const term = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(term) ||
      o.customer.fullName.toLowerCase().includes(term) ||
      o.pickupAddress.toLowerCase().includes(term)
    );
  });

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Shared Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', boxSizing: 'border-box', overflowY: 'auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.025em' }}>
              Active Orders Queue
            </h1>
            <p style={{ color: '#64748B', margin: '6px 0 0 0', fontSize: '14px' }}>
              Dispatch riders, sync deliveries, and manage laundry states
            </p>
          </div>
        </header>

        {/* Toolbar & Filter Bar */}
        <section
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              flex: 1,
              maxWidth: '400px',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
              }}
            />
            <input
              type="text"
              placeholder="Search by Order ID, customer, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                boxSizing: 'border-box',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}
            />
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </section>

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
            Fetching live queue details...
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      color: '#64748B',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                    }}
                  >
                    <th style={{ padding: '16px 20px' }}>Order ID</th>
                    <th style={{ padding: '16px 20px' }}>Customer</th>
                    <th style={{ padding: '16px 20px' }}>Pickup Address</th>
                    <th style={{ padding: '16px 20px' }}>Amount</th>
                    <th style={{ padding: '16px 20px' }}>Assigned Rider</th>
                    <th style={{ padding: '16px 20px' }}>Dispatch Action</th>
                    <th style={{ padding: '16px 20px' }}>Order Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding: '48px',
                          textAlign: 'center',
                          color: '#64748B',
                          fontStyle: 'italic',
                          fontSize: '14px',
                        }}
                      >
                        No matching active orders in queue.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      // Status Badge Colors
                      let badgeBg = '#F3F4F6';
                      let badgeColor = '#374151';
                      if (order.status === 'DELIVERED') {
                        badgeBg = '#D1FAE5';
                        badgeColor = '#065F46';
                      } else if (order.status.includes('PENDING')) {
                        badgeBg = '#FEF3C7';
                        badgeColor = '#92400E';
                      } else if (order.status.includes('PROGRESS') || order.status === 'PROCESSING' || order.status === 'PICKED_UP') {
                        badgeBg = '#E0F2FE';
                        badgeColor = '#0369A1';
                      } else if (order.status === 'CANCELLED') {
                        badgeBg = '#FEE2E2';
                        badgeColor = '#991B1B';
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
                          <td style={{ padding: '18px 20px', fontWeight: '700', color: '#0066FF' }}>
                            {order.orderNumber}
                          </td>
                          <td style={{ padding: '18px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: '#E2E8F0',
                                  color: '#475569',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                }}
                              >
                                {order.customer.fullName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span style={{ fontWeight: '700', display: 'block', color: '#0F172A' }}>
                                  {order.customer.fullName}
                                </span>
                                <span style={{ fontSize: '11px', color: '#64748B' }}>
                                  {order.customer.phoneNumber}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '18px 20px', maxWidth: '240px', color: '#475569' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <MapPin size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
                              <span>{order.pickupAddress}</span>
                            </div>
                          </td>
                          <td style={{ padding: '18px 20px', fontWeight: '700', color: '#0F172A' }}>
                            {formatNaira(order.totalAmount)}
                          </td>
                          <td
                            style={{
                              padding: '18px 20px',
                              fontWeight: '600',
                              color: order.driver ? '#0F172A' : '#EF4444',
                            }}
                          >
                            {order.driver ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={14} style={{ color: '#0066FF' }} />
                                <span>{order.driver.fullName}</span>
                              </div>
                            ) : (
                              'Unassigned'
                            )}
                          </td>
                          <td style={{ padding: '18px 20px' }}>
                            {!order.driver ? (
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <select
                                  defaultValue=""
                                  onChange={(e) =>
                                    handleAssignDriver(order.id, e.target.value)
                                  }
                                  style={{
                                    padding: '8px 24px 8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #CBD5E1',
                                    fontSize: '12.5px',
                                    outline: 'none',
                                    backgroundColor: '#FFFFFF',
                                    cursor: 'pointer',
                                    color: '#0F172A',
                                    appearance: 'none',
                                    fontWeight: '600',
                                  }}
                                >
                                  <option value="" disabled>
                                    Select Rider...
                                  </option>
                                  {onlineDrivers.map((d) => (
                                    <option key={d.id} value={d.id}>
                                      {d.fullName}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={12}
                                  style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#64748B',
                                    pointerEvents: 'none',
                                  }}
                                />
                              </div>
                            ) : (
                              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
                                Dispatched
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '18px 20px' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleStatusChange(order.id, e.target.value)
                                }
                                style={{
                                  padding: '8px 24px 8px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #CBD5E1',
                                  fontSize: '12.5px',
                                  outline: 'none',
                                  backgroundColor: badgeBg,
                                  color: badgeColor,
                                  appearance: 'none',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                }}
                              >
                                {ORDER_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {status.replace('_', ' ')}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                size={12}
                                style={{
                                  position: 'absolute',
                                  right: '8px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  color: badgeColor,
                                  pointerEvents: 'none',
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
