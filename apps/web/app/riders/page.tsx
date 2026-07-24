'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RiderOrder, RiderSession } from '@bglaundry/rider-core';
import {
  RIDER_SESSION_KEY, canStart, destinationFor, jobKind,
  nextConfirmedStatus, nextStartedStatus,
} from '@bglaundry/rider-core';
import styles from './riders.module.css';

type Coordinates = { latitude: number; longitude: number };

async function api<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init?.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

function Icon({ name }: { name: 'pin' | 'route' | 'phone' | 'bag' | 'logout' | 'clock' }) {
  const paths = {
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    route: <><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h2a4 4 0 0 0 4-4V9a4 4 0 0 1 4-4"/></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>,
    bag: <><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function Login({ onLogin }: { onLogin: (session: RiderSession) => void }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to sign in.');
      if (data.user.role !== 'DRIVER') throw new Error('This portal is only for rider accounts.');
      onLogin({ token: data.token, rider: { id: data.user.id, fullName: data.user.fullName, phoneNumber: data.user.phoneNumber } });
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in.'); }
    finally { setLoading(false); }
  }

  return <main className={styles.loginPage}>
    <section className={styles.loginBrand}>
      <div className={styles.brandMark}><span>BG</span></div>
      <div>
        <p className={styles.eyebrow}>BG Laundry rider network</p>
        <h1>Every pickup.<br/>Right on time.</h1>
        <p className={styles.brandCopy}>Your assigned routes, customer verification, and delivery progress—all in one focused workspace.</p>
      </div>
      <div className={styles.brandStats}><div><strong>Live</strong><span>dispatch updates</span></div><div><strong>Secure</strong><span>handover codes</span></div></div>
    </section>
    <section className={styles.loginPanel}>
      <form className={styles.loginCard} onSubmit={submit}>
        <div className={styles.mobileLogo}>BG</div>
        <p className={styles.eyebrow}>Rider portal</p>
        <h2>Welcome back</h2>
        <p className={styles.muted}>Sign in with the details provided by your dispatcher.</p>
        <label>Phone number<input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} type="tel" placeholder="080 1234 5678" autoComplete="tel" required /></label>
        <label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Enter your password" autoComplete="current-password" required /></label>
        {error && <div className={styles.error}>{error}</div>}
        <button className={styles.primary} disabled={loading}>{loading ? 'Signing in…' : 'Sign in to rider portal'} <span>→</span></button>
        <small>Can’t sign in? Contact your dispatcher to reset your access.</small>
      </form>
    </section>
  </main>;
}

function RouteMap({ order, position }: { order: RiderOrder; position: Coordinates | null }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [mapUrl, setMapUrl] = useState('');
  const [routeMeta, setRouteMeta] = useState<{ distance: string; duration: string } | null>(null);
  const address = destinationFor(order);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=ng&limit=1&access_token=${token}`).then(r => r.json());
        const destination = result.features?.[0]?.center;
        if (!destination || cancelled) return;
        const start = position ? [position.longitude, position.latitude] : destination;
        let overlay = `pin-s+102b72(${destination[0]},${destination[1]})`;
        if (position) {
          const directions = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start[0]},${start[1]};${destination[0]},${destination[1]}?geometries=geojson&overview=full&access_token=${token}`).then(r => r.json());
          const route = directions.routes?.[0];
          if (route) {
            const encoded = encodeURIComponent(JSON.stringify({ type: 'Feature', properties: { stroke: '#102b72', 'stroke-width': 5 }, geometry: route.geometry }));
            overlay = `geojson(${encoded}),pin-s-a+16a36a(${start[0]},${start[1]}),${overlay}`;
            setRouteMeta({ distance: `${Math.max(0.1, route.distance / 1000).toFixed(1)} km`, duration: `${Math.max(1, Math.round(route.duration / 60))} min` });
          }
        }
        if (!cancelled) setMapUrl(`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlay}/auto/900x500@2x?padding=70&access_token=${token}`);
      } catch { /* The address remains usable if Mapbox is temporarily unavailable. */ }
    })();
    return () => { cancelled = true; };
  }, [address, position?.latitude, position?.longitude, token]);

  return <div className={styles.map}>
    {mapUrl ? <img src={mapUrl} alt={`Route map to ${address}`} /> : <div className={styles.mapFallback}><Icon name="route"/><strong>{token ? 'Finding the best route…' : 'Mapbox setup required'}</strong><span>{token ? address : 'Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to show live routes.'}</span></div>}
    {routeMeta && <div className={styles.routeMeta}><strong>{routeMeta.duration}</strong><span>{routeMeta.distance}</span></div>}
    <div className={styles.mapAttribution}>Powered by Mapbox</div>
  </div>;
}

function Dashboard({ session, onLogout }: { session: RiderSession; onLogout: () => void }) {
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [online, setOnline] = useState(true);
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [code, setCode] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const loadOrders = useCallback(async (quiet = false) => {
    try {
      const data = await api<RiderOrder[]>('/api/v1/riders/me/orders', session.token);
      setOrders(data); setSelectedId(current => data.some(o => o.id === current) ? current : data[0]?.id || '');
    } catch (e) {
      if (!quiet) setMessage(e instanceof Error ? e.message : 'Could not load assignments.');
    } finally { setLoading(false); }
  }, [session.token]);

  useEffect(() => {
    loadOrders();
    api('/api/v1/riders/me', session.token, {
      method: 'PATCH',
      body: JSON.stringify({ isOnline: true }),
    }).catch(() => setMessage('Signed in, but availability could not be synced.'));
    const timer = window.setInterval(() => loadOrders(true), 15000);
    return () => window.clearInterval(timer);
  }, [loadOrders]);

  useEffect(() => {
    if (!navigator.geolocation || !online) return;
    const watch = navigator.geolocation.watchPosition(async result => {
      const next = { latitude: result.coords.latitude, longitude: result.coords.longitude };
      setPosition(next);
      try { await api('/api/v1/riders/me', session.token, { method: 'PATCH', body: JSON.stringify({ currentLat: next.latitude, currentLng: next.longitude, isOnline: true }) }); } catch {}
    }, () => setMessage('Location access is off. Routes can still use the destination address.'), { enableHighAccuracy: true, maximumAge: 15000 });
    return () => navigator.geolocation.clearWatch(watch);
  }, [online, session.token]);

  const selected = useMemo(() => orders.find(o => o.id === selectedId) || orders[0], [orders, selectedId]);

  async function setAvailability(value: boolean) {
    setOnline(value);
    try { await api('/api/v1/riders/me', session.token, { method: 'PATCH', body: JSON.stringify({ isOnline: value }) }); }
    catch (e) { setOnline(!value); setMessage(e instanceof Error ? e.message : 'Could not update availability.'); }
  }

  async function updateStatus(status: string, otp?: string) {
    if (!selected) return;
    setActionBusy(true); setMessage('');
    try {
      const updated = await api<RiderOrder>(`/api/v1/riders/orders/${selected.id}/status`, session.token, { method: 'PATCH', body: JSON.stringify({ status, otp }) });
      setOrders(current => current.map(o => o.id === updated.id ? updated : o));
      setConfirming(false); setCode('');
      setMessage(status === 'PICKED_UP' ? 'Pickup confirmed. Dispatch has been updated.' : status === 'DELIVERED' ? 'Delivery complete. Dispatch has been updated.' : 'Route started.');
      if (status === 'DELIVERED') await loadOrders(true);
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not update this job.'); }
    finally { setActionBusy(false); }
  }

  const kind = selected ? jobKind(selected.status) : 'WAITING';
  return <main className={styles.appShell}>
    <aside className={styles.sidebar}>
      <div className={styles.logoRow}><div className={styles.logo}>BG</div><div><strong>Rider</strong><span>Operations</span></div></div>
      <nav><button className={styles.navActive}><Icon name="bag"/>Assignments <span>{orders.length}</span></button><button><Icon name="route"/>Route</button></nav>
      <div className={styles.riderCard}><div className={styles.avatar}>{session.rider.fullName.slice(0, 2).toUpperCase()}</div><div><strong>{session.rider.fullName}</strong><span>{online ? 'Online' : 'Offline'}</span></div><button onClick={onLogout} aria-label="Sign out"><Icon name="logout"/></button></div>
    </aside>
    <section className={styles.workspace}>
      <header className={styles.topbar}>
        <div><p className={styles.eyebrow}>Friday’s route</p><h1>Good day, {session.rider.fullName.split(' ')[0]}</h1></div>
        <label className={styles.availability}><span><i className={online ? styles.onlineDot : ''}/>{online ? 'You’re online' : 'You’re offline'}</span><input type="checkbox" checked={online} onChange={e => setAvailability(e.target.checked)}/><b/></label>
      </header>
      {message && <button className={styles.toast} onClick={() => setMessage('')}>{message}<span>×</span></button>}
      <div className={styles.contentGrid}>
        <section className={styles.queue}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Today</p><h2>Assigned jobs</h2></div><span>{orders.length} active</span></div>
          {loading ? <div className={styles.empty}>Loading your assignments…</div> : orders.length === 0 ? <div className={styles.empty}><Icon name="bag"/><strong>You’re all caught up</strong><span>New assignments from dispatch will appear here automatically.</span></div> :
            orders.map(order => <button key={order.id} onClick={() => setSelectedId(order.id)} className={`${styles.jobCard} ${selected?.id === order.id ? styles.selected : ''}`}>
              <div className={styles.jobTop}><span className={jobKind(order.status) === 'PICKUP' ? styles.pickup : styles.delivery}>{jobKind(order.status)}</span><small>{order.orderNumber}</small></div>
              <strong>{order.customer.fullName}</strong><p><Icon name="pin"/>{destinationFor(order)}</p>
              <div><span><Icon name="clock"/>{new Date(order.pickupDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><b>View job →</b></div>
            </button>)}
        </section>
        <section className={styles.detail}>
          {!selected ? <div className={styles.detailEmpty}><Icon name="route"/><h2>No active route</h2><p>Your next assigned pickup or delivery will show here.</p></div> : <>
            <RouteMap order={selected} position={position}/>
            <article className={styles.jobDetail}>
              <div className={styles.detailTitle}><div><span className={kind === 'PICKUP' ? styles.pickup : styles.delivery}>{kind}</span><h2>{selected.customer.fullName}</h2><p>{selected.orderNumber}</p></div><a href={`tel:${selected.customer.phoneNumber}`}><Icon name="phone"/>Call customer</a></div>
              <div className={styles.address}><Icon name="pin"/><div><small>{kind === 'DELIVERY' ? 'DELIVERY ADDRESS' : 'PICKUP ADDRESS'}</small><strong>{destinationFor(selected)}</strong></div></div>
              <div className={styles.items}><small>ORDER SUMMARY</small><div>{selected.items.map(item => <span key={item.id}><b>{item.quantity}×</b>{item.serviceName}</span>)}</div></div>
              {canStart(selected.status) ? <button className={styles.action} disabled={actionBusy || !online} onClick={() => updateStatus(nextStartedStatus(selected.status)!)}><Icon name="route"/>{online ? `Start ${kind.toLowerCase()} route` : 'Go online to start'}<span>→</span></button>
                : (kind === 'PICKUP' || kind === 'DELIVERY') && <button className={styles.action} onClick={() => setConfirming(true)}><Icon name="bag"/>Confirm {kind.toLowerCase()}<span>→</span></button>}
            </article>
          </>}
        </section>
      </div>
    </section>
    {confirming && selected && <div className={styles.modalBackdrop} onMouseDown={() => !actionBusy && setConfirming(false)}>
      <form className={styles.codeModal} onMouseDown={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); updateStatus(nextConfirmedStatus(selected.status)!, code); }}>
        <button type="button" className={styles.modalClose} onClick={() => setConfirming(false)}>×</button>
        <div className={styles.codeIcon}>✓</div><p className={styles.eyebrow}>Secure handover</p><h2>Enter customer code</h2>
        <p>Ask {selected.customer.fullName.split(' ')[0]} for the 4-digit {kind.toLowerCase()} code. Dispatch updates immediately after verification.</p>
        <input autoFocus inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="••••"/>
        {message && <div className={styles.error}>{message}</div>}
        <button className={styles.primary} disabled={code.length !== 4 || actionBusy}>{actionBusy ? 'Verifying…' : `Verify & complete ${kind.toLowerCase()}`}</button>
      </form>
    </div>}
  </main>;
}

export default function RidersPage() {
  const [session, setSession] = useState<RiderSession | null | undefined>(undefined);
  useEffect(() => {
    try { setSession(JSON.parse(localStorage.getItem(RIDER_SESSION_KEY) || 'null')); } catch { setSession(null); }
  }, []);
  function login(next: RiderSession) { localStorage.setItem(RIDER_SESSION_KEY, JSON.stringify(next)); setSession(next); }
  function logout() { localStorage.removeItem(RIDER_SESSION_KEY); setSession(null); }
  if (session === undefined) return <div className={styles.boot}>Loading rider portal…</div>;
  return session ? <Dashboard session={session} onLogout={logout}/> : <Login onLogin={login}/>;
}
