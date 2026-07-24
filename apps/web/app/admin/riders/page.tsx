'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Bike, MapPin, Search, Trash2, User, X } from '@/lib/icons';
import { getAdminCache, setAdminCache } from '../adminCache';
import styles from './riders.module.css';

interface Driver {
  id: string;
  fullName: string;
  phoneNumber: string;
  createdAt: string;
  activeOrderCount: number;
  completedOrderCount: number;
  driverProfile?: {
    vehicleType: string | null;
    isOnline: boolean;
    licenseNumber: string | null;
    currentLat: number | null;
    currentLng: number | null;
  } | null;
}

type RiderForm = {
  fullName: string;
  phoneNumber: string;
  password: string;
  vehicleType: string;
  licenseNumber: string;
};

const EMPTY_FORM: RiderForm = {
  fullName: '',
  phoneNumber: '',
  password: '',
  vehicleType: '',
  licenseNumber: '',
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function AdminRidersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>(() => getAdminCache<Driver[]>('dashboard-drivers') || []);
  const [loading, setLoading] = useState(() => !getAdminCache<Driver[]>('dashboard-drivers'));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');
  const [modal, setModal] = useState<'CREATE' | 'EDIT' | null>(null);
  const [selected, setSelected] = useState<Driver | null>(null);
  const [deleting, setDeleting] = useState<Driver | null>(null);
  const [form, setForm] = useState<RiderForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
  }), []);

  const fetchDrivers = useCallback(async (quiet = false) => {
    if (!quiet && !getAdminCache<Driver[]>('dashboard-drivers')) setLoading(true);
    try {
      const response = await axios.get('/api/v1/drivers', { headers: authHeaders() });
      const nextDrivers = response.data || [];
      setDrivers(nextDrivers);
      setAdminCache('dashboard-drivers', nextDrivers);
    } catch (requestError: any) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem('adminToken');
        router.replace('/admin');
        return;
      }
      if (!quiet) setNotice(requestError.response?.data?.error || 'Unable to load the rider fleet.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, router]);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      router.replace('/admin');
      return;
    }
    setAuthorized(true);
    fetchDrivers();
    const refresh = window.setInterval(() => fetchDrivers(true), 15000);
    return () => window.clearInterval(refresh);
  }, [fetchDrivers, router]);

  const filteredDrivers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return drivers.filter((driver) => {
      const matchesFilter = filter === 'ALL'
        || (filter === 'ONLINE' && driver.driverProfile?.isOnline)
        || (filter === 'OFFLINE' && !driver.driverProfile?.isOnline);
      const matchesSearch = !term || [
        driver.fullName,
        driver.phoneNumber,
        driver.driverProfile?.vehicleType,
        driver.driverProfile?.licenseNumber,
      ].some((value) => value?.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [drivers, filter, search]);

  const onlineCount = drivers.filter((driver) => driver.driverProfile?.isOnline).length;
  const activeJobs = drivers.reduce((sum, driver) => sum + (driver.activeOrderCount || 0), 0);

  function openCreate() {
    setSelected(null);
    setForm(EMPTY_FORM);
    setError('');
    setModal('CREATE');
  }

  function openEdit(driver: Driver) {
    setSelected(driver);
    setForm({
      fullName: driver.fullName,
      phoneNumber: driver.phoneNumber,
      password: '',
      vehicleType: driver.driverProfile?.vehicleType || '',
      licenseNumber: driver.driverProfile?.licenseNumber || '',
    });
    setError('');
    setModal('EDIT');
  }

  function updateField(field: keyof RiderForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveRider(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const isEdit = modal === 'EDIT' && selected;
      const response = isEdit
        ? await axios.patch(`/api/v1/drivers/${selected.id}`, form, { headers: authHeaders() })
        : await axios.post('/api/v1/drivers', form, { headers: authHeaders() });
      const nextDrivers = isEdit
        ? drivers.map((driver) => driver.id === response.data.id ? response.data : driver)
        : [response.data, ...drivers];
      setDrivers(nextDrivers);
      setAdminCache('dashboard-drivers', nextDrivers);
      setModal(null);
      setNotice(isEdit ? `${response.data.fullName} was updated.` : `${response.data.fullName} can now sign in at /riders.`);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Unable to save this rider.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteRider() {
    if (!deleting) return;
    setSaving(true);
    setError('');
    try {
      await axios.delete(`/api/v1/drivers/${deleting.id}`, { headers: authHeaders() });
      const nextDrivers = drivers.filter((driver) => driver.id !== deleting.id);
      setDrivers(nextDrivers);
      setAdminCache('dashboard-drivers', nextDrivers);
      setNotice(`${deleting.fullName} was removed from the fleet.`);
      setDeleting(null);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Unable to delete this rider.');
    } finally {
      setSaving(false);
    }
  }

  if (!authorized) {
    return <div className={styles.loadingPage}>Checking admin access…</div>;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Operations / Fleet</span>
          <h1>Rider management</h1>
          <p>Manage rider access, assignments, vehicle details and availability.</p>
        </div>
        <button className={styles.addButton} onClick={openCreate}>
          <span>+</span> Add rider
        </button>
      </header>

      {notice && (
        <button className={styles.notice} onClick={() => setNotice('')}>
          <span>{notice}</span><X size={16} />
        </button>
      )}

      <section className={styles.metrics}>
        <article>
          <div className={styles.metricIcon}><User size={20} /></div>
          <div><span>Total riders</span><strong>{drivers.length}</strong></div>
          <small>Registered fleet</small>
        </article>
        <article>
          <div className={`${styles.metricIcon} ${styles.green}`}><span className={styles.liveDot} /></div>
          <div><span>Online now</span><strong>{onlineCount}</strong></div>
          <small>{drivers.length ? `${Math.round((onlineCount / drivers.length) * 100)}% availability` : 'No riders yet'}</small>
        </article>
        <article>
          <div className={`${styles.metricIcon} ${styles.amber}`}><Bike size={20} /></div>
          <div><span>Active jobs</span><strong>{activeJobs}</strong></div>
          <small>Across the fleet</small>
        </article>
      </section>

      <section className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, vehicle or license…" />
        </div>
        <div className={styles.filters}>
          {(['ALL', 'ONLINE', 'OFFLINE'] as const).map((value) => (
            <button key={value} className={filter === value ? styles.activeFilter : ''} onClick={() => setFilter(value)}>
              {value.charAt(0) + value.slice(1).toLowerCase()}
              {value === 'ALL' && <span>{drivers.length}</span>}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className={styles.emptyState}>Loading rider fleet…</div>
      ) : filteredDrivers.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><Bike size={28} /></div>
          <h2>{drivers.length ? 'No riders match your search' : 'Build your rider fleet'}</h2>
          <p>{drivers.length ? 'Try another search or availability filter.' : 'Add a rider and create their secure portal credentials.'}</p>
          {!drivers.length && <button onClick={openCreate}>Add your first rider</button>}
        </div>
      ) : (
        <section className={styles.grid}>
          {filteredDrivers.map((driver) => {
            const profile = driver.driverProfile;
            const online = Boolean(profile?.isOnline);
            return (
              <article className={styles.card} key={driver.id}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>{initials(driver.fullName)}</div>
                  <div className={styles.identity}>
                    <div><h2>{driver.fullName}</h2><span className={`${styles.status} ${online ? styles.online : styles.offline}`}><i />{online ? 'Online' : 'Offline'}</span></div>
                    <p>{profile?.vehicleType || 'Vehicle not configured'}</p>
                  </div>
                  <button className={styles.editButton} onClick={() => openEdit(driver)}>Edit</button>
                </div>

                <div className={styles.contact}>
                  <div><span>Phone number</span><strong>{driver.phoneNumber}</strong></div>
                  <div><span>License / ID</span><strong>{profile?.licenseNumber || 'Not provided'}</strong></div>
                </div>

                <div className={styles.cardStats}>
                  <div><strong>{driver.activeOrderCount || 0}</strong><span>Active jobs</span></div>
                  <div><strong>{driver.completedOrderCount || 0}</strong><span>Completed</span></div>
                  <div><strong>{profile?.currentLat && profile?.currentLng ? 'Live' : '—'}</strong><span>Location</span></div>
                </div>

                <div className={styles.cardFooter}>
                  <span><MapPin size={14} />{profile?.currentLat && profile?.currentLng ? 'Location sharing enabled' : 'No location shared yet'}</span>
                  <button onClick={() => { setError(''); setDeleting(driver); }} aria-label={`Delete ${driver.fullName}`}><Trash2 size={16} /></button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {modal && (
        <div className={styles.backdrop} onMouseDown={() => !saving && setModal(null)}>
          <form className={styles.modal} onSubmit={saveRider} onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div><span>{modal === 'EDIT' ? 'Rider profile' : 'New rider'}</span><h2>{modal === 'EDIT' ? 'Edit rider' : 'Add a rider'}</h2><p>{modal === 'EDIT' ? 'Changes sync with the rider portal immediately.' : 'Create access for the rider web and mobile apps.'}</p></div>
              <button type="button" onClick={() => setModal(null)} disabled={saving}><X size={18} /></button>
            </div>
            <div className={styles.formGrid}>
              <label className={styles.fullField}>Full name<input value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} placeholder="e.g. Ada Okafor" required autoFocus /></label>
              <label>Phone number<input value={form.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} placeholder="080 1234 5678" type="tel" required /></label>
              <label>{modal === 'EDIT' ? 'New password' : 'Temporary password'}<input value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder={modal === 'EDIT' ? 'Leave blank to keep current' : 'At least 8 characters'} type="password" minLength={form.password ? 8 : undefined} required={modal === 'CREATE'} /></label>
              <label>Vehicle type<input value={form.vehicleType} onChange={(event) => updateField('vehicleType', event.target.value)} placeholder="e.g. Honda motorcycle" /></label>
              <label>License / rider ID<input value={form.licenseNumber} onChange={(event) => updateField('licenseNumber', event.target.value)} placeholder="e.g. LASRRA-10482" /></label>
            </div>
            {error && <div className={styles.formError}>{error}</div>}
            <div className={styles.modalActions}><button type="button" onClick={() => setModal(null)} disabled={saving}>Cancel</button><button className={styles.saveButton} disabled={saving}>{saving ? 'Saving…' : modal === 'EDIT' ? 'Save changes' : 'Create rider'}</button></div>
          </form>
        </div>
      )}

      {deleting && (
        <div className={styles.backdrop} onMouseDown={() => !saving && setDeleting(null)}>
          <section className={`${styles.modal} ${styles.deleteModal}`} onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.deleteIcon}><Trash2 size={22} /></div>
            <h2>Remove {deleting.fullName}?</h2>
            <p>The rider will immediately lose access to `/riders`. Riders with active assignments cannot be removed until those jobs are reassigned.</p>
            {error && <div className={styles.formError}>{error}</div>}
            <div className={styles.modalActions}><button onClick={() => setDeleting(null)} disabled={saving}>Cancel</button><button className={styles.dangerButton} onClick={deleteRider} disabled={saving}>{saving ? 'Removing…' : 'Remove rider'}</button></div>
          </section>
        </div>
      )}
    </main>
  );
}
