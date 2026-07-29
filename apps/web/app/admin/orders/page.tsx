'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Activity, ChevronDown, Clock, MapPin, Search, ShoppingBag, Trash2, User } from '@/lib/icons';
import { getAdminCache, setAdminCache } from '../adminCache';
import styles from './orders.module.css';

interface Driver {
  id: string;
  fullName: string;
  phoneNumber: string;
  driverProfile?: { vehicleType: string | null; isOnline: boolean; currentLat: number | null; currentLng: number | null } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
  driverId: string | null;
  customer: { id: string; fullName: string; phoneNumber: string; email: string | null };
  driver: Driver | null;
  items: Array<{ id: string; serviceName: string; quantity: number; price: number }>;
  payments: Array<{ id: string; amount: number; status: string; gateway: string; createdAt: string }>;
  trackingHistory: Array<{ id: string; status: string; note: string | null; createdAt: string }>;
}

const ORDER_STATUSES = [
  'PICKUP_PENDING', 'PICKUP_IN_PROGRESS', 'PROCESSING',
  'DELIVERY_PENDING', 'DELIVERY_IN_PROGRESS', 'CANCELLED',
];

const money = new Intl.NumberFormat('en-NG', {
  style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
});

function readable(value: string) {
  return value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function statusGroup(status: string) {
  if (status.startsWith('PICKUP') || status === 'PICKED_UP') return 'PICKUP';
  if (status === 'PROCESSING') return 'PROCESSING';
  if (status.startsWith('DELIVERY')) return 'DELIVERY';
  if (status === 'DELIVERED') return 'COMPLETED';
  return status;
}

function DriverLocationMap({ order }: { order: Order }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const profile = order.driver?.driverProfile;
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [expanded]);

  useEffect(() => {
    if (!token || !containerRef.current || profile?.currentLat == null || profile.currentLng == null) return;
    let map: import('mapbox-gl').Map | null = null;
    let cancelled = false;
    void import('mapbox-gl').then(async ({ default: mapboxgl }) => {
      if (cancelled || !containerRef.current) return;
      mapboxgl.accessToken = token;
      const coordinates: [number, number] = [profile.currentLng!, profile.currentLat!];
      const destinationAddress = ['PICKUP_PENDING', 'PICKUP_IN_PROGRESS'].includes(order.status) ? order.pickupAddress : order.deliveryAddress;
      let destination: [number, number] | null = null;
      let destinationLabel = destinationAddress;
      try {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destinationAddress)}.json?country=ng&autocomplete=false&proximity=${coordinates.join(',')}&limit=1&access_token=${token}`);
        const result = await response.json();
        const match = result.features?.[0];
        // Always show the provider's best available customer-location match.
        // The matched label is exposed on the marker so dispatch can verify it.
        if (Array.isArray(match?.center)) {
          destination = match.center;
          destinationLabel = match.place_name || destinationAddress;
        }
      } catch { /* Keep showing live GPS if routing is temporarily unavailable. */ }
      if (cancelled || !containerRef.current) return;
      map = new mapboxgl.Map({ container: containerRef.current, style: 'mapbox://styles/mapbox/streets-v12', center: coordinates, zoom: destination ? 12 : 15, attributionControl: false });
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

      const addMarkerPopup = (element: HTMLElement, popup: import('mapbox-gl').Popup) => {
        let pinned = false;
        element.addEventListener('mouseenter', () => { if (!pinned) popup.addTo(map!); });
        element.addEventListener('mouseleave', () => { if (!pinned) popup.remove(); });
        element.addEventListener('click', () => {
          pinned = !pinned;
          if (pinned) popup.addTo(map!); else popup.remove();
        });
      };
      const marker = document.createElement('div'); marker.className = styles.liveRiderMarker;
      marker.title = `${order.driver?.fullName || 'Rider'} · live GPS`;
      new mapboxgl.Marker({ element: marker }).setLngLat(coordinates).addTo(map);
      const riderPopupContent = document.createElement('div');
      const riderName = document.createElement('strong'); riderName.textContent = order.driver?.fullName || 'Assigned rider';
      const riderDetail = document.createElement('span'); riderDetail.textContent = `Live GPS · ${readable(order.status)}`;
      riderPopupContent.append(riderName, riderDetail);
      addMarkerPopup(marker, new mapboxgl.Popup({ closeButton: false, offset: 18, className: styles.locationPopup }).setLngLat(coordinates).setDOMContent(riderPopupContent));
      if (destination) {
        const stop = document.createElement('div'); stop.className = styles.destinationMarker;
        stop.title = `Assigned stop: ${destinationAddress}`;
        new mapboxgl.Marker({ element: stop }).setLngLat(destination).addTo(map);
        const stopPopupContent = document.createElement('div');
        const stopName = document.createElement('strong'); stopName.textContent = order.status.startsWith('PICKUP') ? 'Pickup destination' : 'Delivery destination';
        const stopAddress = document.createElement('span'); stopAddress.textContent = destinationLabel;
        stopPopupContent.append(stopName, stopAddress);
        addMarkerPopup(stop, new mapboxgl.Popup({ closeButton: false, offset: 24, className: styles.locationPopup }).setLngLat(destination).setDOMContent(stopPopupContent));
        map.fitBounds(new mapboxgl.LngLatBounds().extend(coordinates).extend(destination), { padding: 55, maxZoom: 15, duration: 0 });
        map.once('load', async () => {
          try {
            const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates.join(',')};${destination!.join(',')}?geometries=geojson&overview=full&access_token=${token}`);
            const result = await response.json();
            const geometry = result.routes?.[0]?.geometry;
            if (!geometry || !map) return;
            map.addSource('active-route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry } });
            map.addLayer({ id: 'active-route', type: 'line', source: 'active-route', paint: { 'line-color': '#174da7', 'line-width': 5, 'line-opacity': .85 } });
          } catch { /* Markers remain usable if directions cannot be fetched. */ }
        });
      }
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    });
    return () => { cancelled = true; map?.remove(); };
  }, [expanded, order.deliveryAddress, order.pickupAddress, order.status, profile?.currentLat, profile?.currentLng, token]);

  if (!order.driver) return null;
  return <section className={`${styles.driverTracking} ${expanded ? styles.expandedMap : ''}`} role={expanded ? 'dialog' : undefined} aria-modal={expanded || undefined} aria-label={expanded ? `Live map for ${order.orderNumber}` : undefined}>
    <div className={styles.mapInformation}><span><i className={profile?.isOnline ? styles.trackingOnline : ''}/>{profile?.isOnline ? 'Live rider location' : 'Last rider location'}</span><strong>{order.driver.fullName}</strong><small>{profile?.currentLat == null ? 'Waiting for the rider to enable precise GPS.' : `Position refreshes every 15 seconds · ${readable(order.status)}`}</small><button type="button" className={styles.expandMapButton} onClick={() => setExpanded(value => !value)} aria-label={expanded ? 'Close full screen map' : 'Expand map to full screen'}>{expanded ? '× Close map' : '⛶ Expand map'}</button></div>
    {profile?.currentLat != null && profile.currentLng != null ? <div ref={containerRef} className={styles.driverMap}/> : <div className={styles.noDriverMap}><MapPin size={20}/>No GPS position received yet</div>}
  </section>;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => getAdminCache<Order[]>('dashboard-orders') || []);
  const [drivers, setDrivers] = useState<Driver[]>(() => getAdminCache<Driver[]>('dashboard-drivers') || []);
  const [loading, setLoading] = useState(() => !getAdminCache<Order[]>('dashboard-orders'));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PICKUP' | 'PROCESSING' | 'DELIVERY' | 'COMPLETED'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const seenEventsRef = useRef<Set<string>>(new Set());

  const headers = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
  }), []);

  const fetchOrdersAndDrivers = useCallback(async (quiet = false) => {
    if (!quiet && !getAdminCache<Order[]>('dashboard-orders')) setLoading(true);
    try {
      const [ordersResponse, driversResponse] = await Promise.all([
        axios.get('/api/v1/orders', { headers: headers() }),
        axios.get('/api/v1/drivers', { headers: headers() }),
      ]);
      setOrders(ordersResponse.data || []);
      setDrivers(driversResponse.data || []);
      setAdminCache('dashboard-orders', ordersResponse.data || []);
      setAdminCache('dashboard-drivers', driversResponse.data || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        // A page request must never destroy the shared login session. The
        // layout owns session recovery and expiry handling.
        if (!quiet) setNotice('Your session could not be verified. Refresh the page to recover it.');
        return;
      }
      if (!quiet) setNotice(error.response?.data?.error || 'Unable to load order operations.');
    } finally {
      setLoading(false);
    }
  }, [headers, router]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/admin');
      return;
    }
    setAuthorized(true);
    axios.get('/api/v1/admin/auth/session', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      setIsSuperAdmin(response.data?.user?.role === 'SUPER_ADMIN');
    }).catch(() => setIsSuperAdmin(false));
    fetchOrdersAndDrivers();
    const timer = window.setInterval(() => fetchOrdersAndDrivers(true), 15000);
    return () => window.clearInterval(timer);
  }, [fetchOrdersAndDrivers, router]);

  useEffect(() => {
    const events = orders.flatMap(order => order.trackingHistory
      .filter(event => /arrived|reached|pickup confirmed|delivery confirmed/i.test(event.note || ''))
      .map(event => ({ ...event, orderNumber: order.orderNumber })));
    if (!seenEventsRef.current.size) {
      events.forEach(event => seenEventsRef.current.add(event.id));
      return;
    }
    events.forEach(event => {
      if (seenEventsRef.current.has(event.id)) return;
      seenEventsRef.current.add(event.id);
      const message = `${event.orderNumber}: ${event.note || readable(event.status)}`;
      setNotice(message);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Rider update', { body: message, tag: event.id });
      }
    });
  }, [orders]);

  async function enableNotifications() {
    if (!('Notification' in window)) return setNotice('This browser does not support desktop notifications.');
    const permission = await Notification.requestPermission();
    setNotice(permission === 'granted' ? 'Rider arrival notifications are enabled.' : 'Notification permission was not granted.');
  }

  async function assignDriver(orderId: string, driverId: string) {
    if (!driverId) return;
    setSavingId(orderId); setNotice('');
    try {
      await axios.patch(`/api/v1/orders/${orderId}/assign`, { driverId }, { headers: headers() });
      setNotice('Rider assigned. The route will activate when the rider taps Start.');
      await fetchOrdersAndDrivers(true);
    } catch (error: any) {
      setNotice(error.response?.data?.error || 'Unable to assign this rider.');
    } finally {
      setSavingId(null);
    }
  }

  async function changeStatus(orderId: string, status: string) {
    setSavingId(orderId); setNotice('');
    try {
      await axios.patch(`/api/v1/orders/${orderId}/status`, { status }, { headers: headers() });
      setNotice(`Order updated to ${readable(status)}.`);
      await fetchOrdersAndDrivers(true);
    } catch (error: any) {
      setNotice(error.response?.data?.error || 'Unable to update this order.');
    } finally {
      setSavingId(null);
    }
  }

  async function deleteOrder(order: Order) {
    const confirmed = window.confirm(
      `Permanently delete ${order.orderNumber}?\n\nIts items, payments, and tracking history will also be deleted. This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(order.id);
    setNotice('');
    try {
      await axios.delete(`/api/v1/orders/${order.id}`, { headers: headers() });
      const next = orders.filter((item) => item.id !== order.id);
      setOrders(next);
      setAdminCache('dashboard-orders', next);
      setExpandedId(null);
      setNotice(`${order.orderNumber} was deleted.`);
    } catch (error: any) {
      setNotice(error.response?.data?.error || 'Unable to delete this order.');
    } finally {
      setDeletingId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter = filter === 'ALL' || statusGroup(order.status) === filter;
      const matchesSearch = !query || [
        order.orderNumber, order.customer.fullName, order.customer.phoneNumber,
        order.pickupAddress, order.deliveryAddress, order.driver?.fullName,
      ].some((value) => value?.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [filter, orders, search]);

  const metrics = useMemo(() => ({
    active: orders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.status)).length,
    unassigned: orders.filter((order) => !order.driverId && !['DELIVERED', 'CANCELLED'].includes(order.status)).length,
    processing: orders.filter((order) => order.status === 'PROCESSING').length,
    completed: orders.filter((order) => order.status === 'DELIVERED').length,
  }), [orders]);

  const availableDrivers = drivers.filter((driver) => driver.driverProfile?.isOnline);

  if (!authorized) return <div className={styles.loadingPage}>Checking admin access…</div>;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><span className={styles.eyebrow}>Operations / Orders</span><h1>Order operations</h1><p>Track every handoff, dispatch riders, and manage the laundry lifecycle.</p></div>
        <button className={styles.live} onClick={enableNotifications} title="Enable rider arrival notifications"><i />Live updates<span>Every 15 seconds · Enable alerts</span></button>
      </header>

      {notice && <button className={styles.notice} onClick={() => setNotice('')}>{notice}<span>×</span></button>}

      <section className={styles.metrics}>
        <article><div className={styles.metricIcon}><ShoppingBag size={19} /></div><div><span>Active orders</span><strong>{metrics.active}</strong><small>Currently in operation</small></div></article>
        <article><div className={`${styles.metricIcon} ${styles.amber}`}><User size={19} /></div><div><span>Need a rider</span><strong>{metrics.unassigned}</strong><small>Awaiting dispatch</small></div></article>
        <article><div className={`${styles.metricIcon} ${styles.violet}`}><Activity size={19} /></div><div><span>Processing</span><strong>{metrics.processing}</strong><small>At the laundry facility</small></div></article>
        <article><div className={`${styles.metricIcon} ${styles.green}`}>✓</div><div><span>Delivered</span><strong>{metrics.completed}</strong><small>All-time completion</small></div></article>
      </section>

      <section className={styles.toolbar}>
        <div className={styles.search}><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, address or rider…" /></div>
        <div className={styles.filters}>
          {(['ALL', 'PICKUP', 'PROCESSING', 'DELIVERY', 'COMPLETED'] as const).map((value) => (
            <button key={value} className={filter === value ? styles.activeFilter : ''} onClick={() => setFilter(value)}>{value.charAt(0) + value.slice(1).toLowerCase()}</button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className={styles.empty}>Loading order operations…</div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.empty}><ShoppingBag size={28} /><h2>No orders found</h2><p>Try another search or lifecycle filter.</p></div>
      ) : (
        <section className={styles.orderList}>
          <div className={styles.listHeader}><span>Order & customer</span><span>Stage</span><span>Rider</span><span>Value</span><span>Updated</span><span /></div>
          {filteredOrders.map((order) => {
            const expanded = order.id === expandedId;
            const paid = order.payments.filter((payment) => payment.status === 'SUCCESSFUL').reduce((sum, payment) => sum + payment.amount, 0);
            return (
              <article className={`${styles.orderCard} ${expanded ? styles.expanded : ''}`} key={order.id}>
                <button className={styles.orderSummary} onClick={() => setExpandedId(expanded ? null : order.id)} aria-expanded={expanded}>
                  <div className={styles.orderCustomer}>
                    <div className={styles.avatar}>{initials(order.customer.fullName)}</div>
                    <div><strong>{order.orderNumber}</strong><span>{order.customer.fullName} · {order.customer.phoneNumber}</span></div>
                  </div>
                  <span className={`${styles.status} ${styles[order.status.toLowerCase()] || ''}`}><i />{readable(order.status)}</span>
                  <div className={styles.rider}>{order.driver ? <><strong>{order.driver.fullName}</strong><span>{order.driver.driverProfile?.vehicleType || 'Assigned rider'}</span></> : <><strong className={styles.unassigned}>Unassigned</strong><span>Dispatch required</span></>}</div>
                  <div className={styles.value}><strong>{money.format(order.totalAmount)}</strong><span>{paid ? `${money.format(paid)} paid` : 'Payment pending'}</span></div>
                  <div className={styles.updated}><strong>{new Date(order.updatedAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })}</strong><span>{new Date(order.updatedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</span></div>
                  <ChevronDown size={18} className={styles.chevron} />
                </button>

                {expanded && (
                  <div className={styles.details}>
                    <div className={styles.detailTop}>
                      <div className={styles.addresses}>
                        <div><span className={styles.addressIcon}><MapPin size={16} /></span><div><small>PICKUP ADDRESS</small><strong>{order.pickupAddress}</strong><span>{new Date(order.pickupDate).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</span></div></div>
                        <div><span className={`${styles.addressIcon} ${styles.deliveryIcon}`}><MapPin size={16} /></span><div><small>DELIVERY ADDRESS</small><strong>{order.deliveryAddress}</strong><span>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : 'Delivery time not scheduled'}</span></div></div>
                      </div>
                      <div className={styles.controls}>
                        <label>Assigned rider<select value={order.driverId || ''} onChange={(event) => assignDriver(order.id, event.target.value)} disabled={savingId === order.id}><option value="" disabled>{availableDrivers.length ? 'Select an online rider' : 'No online riders'}</option>{availableDrivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.fullName} · {driver.driverProfile?.vehicleType || 'Rider'}</option>)}</select></label>
                        <label>Order status<select value={order.status} onChange={(event) => changeStatus(order.id, event.target.value)} disabled={savingId === order.id}>{ORDER_STATUSES.map((status) => <option key={status} value={status}>{readable(status)}</option>)}</select></label>
                      </div>
                    </div>
                    <DriverLocationMap order={order} />

                    <div className={styles.detailGrid}>
                      <section><div className={styles.sectionTitle}><div><h3>Order items</h3><p>{order.items.reduce((sum, item) => sum + item.quantity, 0)} total pieces</p></div><strong>{money.format(order.totalAmount)}</strong></div><div className={styles.items}>{order.items.map((item) => <div key={item.id}><span><b>{item.quantity}×</b>{item.serviceName}</span><strong>{money.format(item.price * item.quantity)}</strong></div>)}</div></section>
                      <section><div className={styles.sectionTitle}><div><h3>Tracking timeline</h3><p>Latest operational events</p></div><Clock size={17} /></div><div className={styles.timeline}>{order.trackingHistory.length ? order.trackingHistory.slice(0, 5).map((event, index) => <div key={event.id}><i className={index === 0 ? styles.currentEvent : ''} /><span><strong>{readable(event.status)}</strong><small>{event.note || 'Order status updated'}</small></span><time>{new Date(event.createdAt).toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</time></div>) : <p>No tracking events recorded.</p>}</div></section>
                    </div>

                    <footer className={styles.detailFooter}><div><span>Customer contact</span><a href={`tel:${order.customer.phoneNumber}`}>{order.customer.phoneNumber}</a>{order.customer.email && <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>}</div><div><span>Payment</span><strong className={paid >= order.totalAmount ? styles.paid : styles.pending}>{paid >= order.totalAmount ? 'Paid in full' : `${money.format(Math.max(0, order.totalAmount - paid))} outstanding`}</strong></div><div><span>Created</span><strong>{new Date(order.createdAt).toLocaleDateString('en-NG', { dateStyle: 'long' })}</strong></div></footer>
                    {isSuperAdmin && (
                      <div className={styles.dangerZone}>
                        <div><strong>Delete order record</strong><span>Permanently removes this order, payment records, items, and tracking history.</span></div>
                        <button type="button" onClick={() => deleteOrder(order)} disabled={deletingId === order.id}>
                          <Trash2 size={15} />{deletingId === order.id ? 'Deleting…' : 'Delete order'}
                        </button>
                      </div>
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
