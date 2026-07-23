'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getAdminCache, setAdminCache } from '../adminCache';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  User,
  MapPin,
} from '@/lib/icons';

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
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => getAdminCache<Order[]>('dashboard-orders') || []);
  const [drivers, setDrivers] = useState<Driver[]>(() => getAdminCache<Driver[]>('dashboard-drivers') || []);
  const [loading, setLoading] = useState(() => {
    const cachedOrders = getAdminCache<Order[]>('dashboard-orders');
    const cachedDrivers = getAdminCache<Driver[]>('dashboard-drivers');
    return !cachedOrders || !cachedDrivers;
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Authenticate Admin
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      setAuthChecked(true);
    } else {
      setAuthorized(true);
      setAuthChecked(true);
      fetchOrdersAndDrivers();
    }
  }, []);

  const fetchOrdersAndDrivers = async () => {
    setLoading(true);
    try {
      const ordersRes = await axios.get('/api/v1/orders');
      setOrders(ordersRes.data);
      setAdminCache('dashboard-orders', ordersRes.data);

      const driversRes = await axios.get('/api/v1/drivers');
      setDrivers(driversRes.data);
      setAdminCache('dashboard-drivers', driversRes.data);
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
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>Loading orders page…</h2>
          <p style={{ marginTop: '12px', color: '#64748B' }}>
            Preparing order details and driver assignments.
          </p>
        </div>
      </div>
    );
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
    <div className="ordersPage">
      <main className="ordersMain">
        <header className="ordersHeader">
          <div>
            <h1>
              Active Orders Queue
            </h1>
            <p>
              Dispatch riders, sync deliveries, and manage laundry states
            </p>
          </div>
        </header>

        <section className="ordersToolbar">
          <div className="searchWrapper">
            <Search size={18} className="searchIcon" />
            <input
              type="text"
              placeholder="Search by Order ID, customer, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="searchInput"
            />
          </div>
          <button className="filterButton">
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </section>

        {loading ? (
          <div className="loadingState">
            <div className="spinner" />
            Fetching live queue details...
          </div>
        ) : (
          <div className="ordersTableShell">
            {filteredOrders.length === 0 ? (
              <div className="emptyState">
                No matching active orders in queue.
              </div>
            ) : (
              <>
                <div className="desktopTable">
                  <table className="ordersTable">
                    <colgroup>
                      <col className="orderIdColumn" />
                      <col className="customerColumn" />
                      <col className="addressColumn" />
                      <col className="amountColumn" />
                      <col className="riderColumn" />
                      <col className="dispatchColumn" />
                      <col className="statusColumn" />
                    </colgroup>
                    <thead>
                      <tr className="tableHeaderRow">
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Pickup Address</th>
                        <th>Amount</th>
                        <th>Assigned Rider</th>
                        <th>Dispatch Action</th>
                        <th>Order Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
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
                            className="tableRow"
                          >
                            <td className="tableCell idCell">{order.orderNumber}</td>
                            <td className="tableCell customerCell">
                              <div className="customerCellInner">
                                <div className="customerAvatar">
                                  {order.customer.fullName.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="customerName">{order.customer.fullName}</span>
                                  <span className="customerPhone">{order.customer.phoneNumber}</span>
                                </div>
                              </div>
                            </td>
                            <td className="tableCell addressCell">
                              <div className="addressText">
                                <MapPin size={14} className="addressIcon" />
                                <span>{order.pickupAddress}</span>
                              </div>
                            </td>
                            <td className="tableCell amountCell">{formatNaira(order.totalAmount)}</td>
                            <td className="tableCell riderCell">
                              {order.driver ? (
                                <div className="driverNameWrap">
                                  <User size={14} className="driverIcon" />
                                  <span>{order.driver.fullName}</span>
                                </div>
                              ) : (
                                'Unassigned'
                              )}
                            </td>
                            <td className="tableCell selectCell">
                              {!order.driver ? (
                                <div className="selectWrapper">
                                  <select
                                    defaultValue=""
                                    onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                                    className="selectInput"
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
                                  <ChevronDown size={12} className="selectChevron" />
                                </div>
                              ) : (
                                <span className="statusLabel">Dispatched</span>
                              )}
                            </td>
                            <td className="tableCell selectCell">
                              <div className="selectWrapper">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className="selectInput"
                                  style={{ backgroundColor: badgeBg, color: badgeColor }}
                                >
                                  {ORDER_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                      {status.replace('_', ' ')}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown size={12} className="selectChevron" style={{ color: badgeColor }} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mobileList">
                  {filteredOrders.map((order) => {
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
                      <article className="orderCardMobile" key={order.id}>
                        <div className="orderCardTop">
                          <div>
                            <div className="orderMobileId">{order.orderNumber}</div>
                            <div className="orderMobileLabel">Customer</div>
                            <div className="orderMobileValue">{order.customer.fullName}</div>
                          </div>
                          <span className="statusBadge" style={{ backgroundColor: badgeBg, color: badgeColor }}>
                            {order.status.replace('_', ' ').toLowerCase()}
                          </span>
                        </div>
                        <div className="orderMobileField">
                          <span>Pickup</span>
                          <span>{order.pickupAddress}</span>
                        </div>
                        <div className="orderMobileField">
                          <span>Amount</span>
                          <strong>{formatNaira(order.totalAmount)}</strong>
                        </div>
                        <div className="orderMobileField">
                          <span>Rider</span>
                          <span>{order.driver ? order.driver.fullName : 'Unassigned'}</span>
                        </div>
                        <div className="orderMobileActions">
                          {!order.driver ? (
                            <div className="selectWrapper">
                              <select
                                defaultValue=""
                                onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                                className="selectInput"
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
                              <ChevronDown size={12} className="selectChevron" />
                            </div>
                          ) : (
                            <span className="statusLabel">Dispatched</span>
                          )}
                          <div className="selectWrapper">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="selectInput"
                              style={{ backgroundColor: badgeBg, color: badgeColor }}
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status.replace('_', ' ')}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="selectChevron" style={{ color: badgeColor }} />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .ordersPage {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background-color: #F8FAFC;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        .ordersMain {
          flex: 1;
          padding: 40px;
          box-sizing: border-box;
          overflow-y: auto;
          min-width: 0;
          max-width: 100%;
        }

        .ordersHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .ordersHeader h1 {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .ordersHeader p {
          margin: 6px 0 0 0;
          color: #64748B;
          font-size: 14px;
        }

        .ordersToolbar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          align-items: center;
          flex-wrap: wrap;
        }

        .searchWrapper {
          position: relative;
          flex: 1;
          min-width: 220px;
          max-width: 460px;
        }

        .searchIcon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
        }

        .searchInput {
          width: 100%;
          padding: 12px 14px 12px 40px;
          box-sizing: border-box;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          background-color: #FFFFFF;
          color: #0F172A;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .filterButton {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
          background-color: #FFFFFF;
          color: #475569;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: transform 0.2s ease, background-color 0.2s ease;
        }

        .filterButton:hover {
          transform: translateY(-1px);
          background-color: #F8FAFC;
        }

        .loadingState {
          text-align: center;
          padding: 80px;
          font-size: 15px;
          color: #64748B;
          background-color: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
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

        .ordersTableShell {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
          overflow: hidden;
        }

        .desktopTable {
          width: 100%;
          overflow-x: auto;
        }

        .ordersTable {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 900px;
          table-layout: fixed;
        }

        .orderIdColumn { width: 8%; }
        .customerColumn { width: 14%; }
        .addressColumn { width: 34%; }
        .amountColumn { width: 8%; }
        .riderColumn { width: 10%; }
        .dispatchColumn { width: 13%; }
        .statusColumn { width: 13%; }

        .tableHeaderRow {
          border-bottom: 1px solid #E2E8F0;
          background-color: #F8FAFC;
          color: #64748B;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .ordersTable th,
        .ordersTable td {
          padding: 16px 14px;
          vertical-align: middle;
          overflow: hidden;
        }

        .tableRow {
          border-bottom: 1px solid #F1F5F9;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .tableRow:hover {
          background-color: #F8FAFC;
        }

        .idCell {
          font-weight: 700;
          color: #0066FF;
        }

        .customerCellInner {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .customerAvatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: #E2E8F0;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        .customerName {
          display: block;
          font-weight: 700;
          color: #0F172A;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .customerPhone {
          display: block;
          font-size: 11px;
          color: #64748B;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .addressText {
          display: flex;
          align-items: center;
          gap: 6px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          color: #475569;
        }

        .addressIcon {
          color: #94A3B8;
          flex-shrink: 0;
        }

        .driverNameWrap {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }

        .driverNameWrap span {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .driverIcon {
          color: #0066FF;
        }

        .selectCell {
          min-width: 0;
        }

        .selectWrapper {
          position: relative;
          display: inline-block;
          width: 100%;
          max-width: none;
        }

        .selectInput {
          width: 100%;
          padding: 10px 32px 10px 12px;
          border-radius: 8px;
          border: 1px solid #CBD5E1;
          font-size: 13px;
          outline: none;
          background-color: #FFFFFF;
          color: #0F172A;
          appearance: none;
          font-weight: 600;
          cursor: pointer;
        }

        .selectChevron {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748B;
          pointer-events: none;
        }

        .statusLabel {
          font-size: 13px;
          color: #64748B;
          font-weight: 500;
        }

        .statusBadge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .mobileList {
          display: none;
        }

        .orderCardMobile {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 20px;
          display: grid;
          gap: 14px;
          margin: 16px;
        }

        .orderCardTop {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }

        .orderMobileId {
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 6px;
        }

        .orderMobileLabel {
          font-size: 12px;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .orderMobileValue {
          color: #0F172A;
          font-weight: 700;
        }

        .orderMobileField {
          display: grid;
          gap: 6px;
          color: #475569;
          font-size: 14px;
        }

        .orderMobileField span:first-child {
          font-size: 12px;
          color: #94A3B8;
          font-weight: 700;
        }

        .orderMobileActions {
          display: grid;
          gap: 14px;
        }

        .emptyState {
          padding: 48px;
          text-align: center;
          color: #64748B;
          font-style: italic;
          font-size: 14px;
        }

        @media (max-width: 1080px) {
          .ordersMain {
            padding: 28px 20px;
          }

          .desktopTable {
            display: none;
          }

          .mobileList {
            display: block;
          }

          .orderCardMobile {
            margin: 16px 0;
          }
        }

        @media (max-width: 640px) {
          .ordersMain {
            padding: 20px 16px;
          }

          /* Leave a clear lane for the fixed mobile navigation control. */
          .ordersHeader {
            padding-left: 56px;
            margin-bottom: 24px;
            min-height: 44px;
          }

          .ordersHeader h1 {
            font-size: 22px;
            line-height: 1.15;
            letter-spacing: -0.02em;
          }

          .ordersHeader p {
            margin-top: 5px;
            font-size: 13px;
            line-height: 1.4;
          }

          .ordersToolbar {
            justify-content: stretch;
          }

          .filterButton {
            width: 100%;
            justify-content: center;
          }

          .orderCardMobile {
            padding: 18px;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
