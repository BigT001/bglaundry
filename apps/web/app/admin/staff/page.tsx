'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ADMIN_PERMISSIONS, FULL_ACCESS_ROLES, isSuperAdmin, roleLabel, STAFF_ROLES } from '@/lib/admin-permissions';
import styles from './staff.module.css';

type Staff = {
  id: string; fullName: string; email: string; phoneNumber: string; role: string;
  permissions: string[]; isActive: boolean; createdAt: string;
};

const blankForm = {
  fullName: '', email: '', phoneNumber: '', password: '', role: 'RECEPTION', permissions: [] as string[], isActive: true,
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const adminUser = typeof window === 'undefined' ? null : JSON.parse(localStorage.getItem('adminUser') || 'null');
  const canManage = isSuperAdmin(adminUser);
  const fullAccess = FULL_ACCESS_ROLES.includes(form.role as typeof FULL_ACCESS_ROLES[number]);

  const headers = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('adminToken')}` }), []);
  const load = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/v1/admin/staff', { headers: headers() });
      setStaff(data.staff);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Unable to load staff accounts.');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { if (canManage) void load(); else setLoading(false); }, [canManage, load]);
  useEffect(() => {
    if (!modalOpen) return;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !saving) closeModal(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', closeOnEscape); };
  }, [modalOpen, saving]);

  const filteredStaff = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return staff;
    return staff.filter(member => [member.fullName, member.email, member.phoneNumber, roleLabel(member.role)]
      .some(value => value?.toLowerCase().includes(term)));
  }, [query, staff]);

  function togglePermission(key: string) {
    setForm(current => ({
      ...current,
      permissions: current.permissions.includes(key)
        ? current.permissions.filter(permission => permission !== key)
        : [...current.permissions, key],
    }));
  }

  function addStaff() {
    setEditingId(null); setForm(blankForm); setError(''); setModalOpen(true);
  }

  function edit(member: Staff) {
    setEditingId(member.id);
    setForm({
      fullName: member.fullName, email: member.email || '', phoneNumber: member.phoneNumber,
      password: '', role: member.role, permissions: member.permissions, isActive: member.isActive,
    });
    setError(''); setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setEditingId(null); setForm(blankForm); setError(''); setModalOpen(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      if (editingId) {
        await axios.patch(`/api/v1/admin/staff/${editingId}`, form, { headers: headers() });
        setNotice('Staff account updated. New access applies on their next sign-in.');
      } else {
        await axios.post('/api/v1/admin/staff', form, { headers: headers() });
        setNotice('Staff account created. They can now sign in through the admin portal.');
      }
      setEditingId(null); setForm(blankForm); setModalOpen(false); await load();
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Unable to save staff account.');
    } finally {
      setSaving(false);
    }
  }

  if (!canManage) return <main className={styles.page}><div className={styles.denied}><h1>Access restricted</h1><p>Only the Super Admin can manage staff accounts.</p></div></main>;

  return <main className={styles.page}>
    <header className={styles.pageHeader}>
      <div><span className={styles.eyebrow}>Access control</span><h1>Staffs</h1><p>Create staff logins and control exactly which operational tools they can use.</p></div>
      <button className={styles.addButton} onClick={addStaff}><span>+</span>Add staff</button>
    </header>
    {notice && <button className={styles.notice} onClick={() => setNotice('')}>{notice}<span>×</span></button>}

    <section className={styles.summary}>
      <article><span>Total staffs</span><strong>{staff.length}</strong></article>
      <article><span>Active</span><strong>{staff.filter(member => member.isActive).length}</strong></article>
      <article><span>Limited roles</span><strong>{staff.filter(member => !FULL_ACCESS_ROLES.includes(member.role as typeof FULL_ACCESS_ROLES[number])).length}</strong></article>
    </section>

    <section className={styles.listCard}>
      <div className={styles.listHeader}>
        <div><h2>Staff accounts</h2><p>Manage roles, sign-in status, and module permissions.</p></div>
        <label className={styles.search}><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search staff…" /></label>
      </div>
      {loading ? <div className={styles.empty}>Loading staff accounts…</div> : filteredStaff.length === 0 ? <div className={styles.empty}><strong>{query ? 'No matching staff' : 'No staff accounts yet'}</strong><p>{query ? 'Try another name, email, phone, or role.' : 'Choose Add staff to create the first team login.'}</p></div> :
        <div className={styles.staffList}>{filteredStaff.map(member => {
          const access = FULL_ACCESS_ROLES.includes(member.role as typeof FULL_ACCESS_ROLES[number]) ? 'Full access' : `${member.permissions.length} permission${member.permissions.length === 1 ? '' : 's'}`;
          return <article key={member.id}>
            <div className={styles.avatar}>{member.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</div>
            <div className={styles.identity}><strong>{member.fullName}</strong><span>{member.email}</span></div>
            <div className={styles.role}><span>{roleLabel(member.role)}</span><small>{access}</small></div>
            <div className={styles.contact}><span>{member.phoneNumber}</span><small>Added {new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>
            <span className={`${styles.status} ${member.isActive ? styles.on : styles.off}`}>{member.isActive ? 'Active' : 'Disabled'}</span>
            <button className={styles.editButton} onClick={() => edit(member)}>Edit</button>
          </article>;
        })}</div>}
    </section>

    {modalOpen && <div className={styles.backdrop} onMouseDown={closeModal}>
      <form className={styles.modal} onSubmit={submit} onMouseDown={event => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div><span className={styles.eyebrow}>{editingId ? 'Update account' : 'New team member'}</span><h2>{editingId ? 'Edit staff' : 'Add staff'}</h2><p>{editingId ? 'Update this person’s role, status, or permissions.' : 'Create an independent admin login for a team member.'}</p></div>
          <button type="button" className={styles.closeButton} onClick={closeModal} aria-label="Close">×</button>
        </div>
        <div className={styles.modalBody}>
          {error && <div className={styles.error}>{error}</div>}
          <section className={styles.fields}>
            <label>Full name<input autoFocus value={form.fullName} onChange={event => setForm({ ...form, fullName: event.target.value })} placeholder="Staff member’s name" required /></label>
            <label>Email address<input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="name@bglaundry.com" required /></label>
            <label>Phone number<input type="tel" value={form.phoneNumber} onChange={event => setForm({ ...form, phoneNumber: event.target.value })} placeholder="0705 815 5555" required /></label>
            <label>{editingId ? 'New password (optional)' : 'Temporary password'}<input type="password" minLength={8} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="Minimum 8 characters" required={!editingId} /></label>
            <label>Role<select value={form.role} onChange={event => setForm({ ...form, role: event.target.value, permissions: [] })}>{STAFF_ROLES.filter(role => role !== 'ADMIN').map(role => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></label>
            {editingId && <label className={styles.active}><input type="checkbox" checked={form.isActive} onChange={event => setForm({ ...form, isActive: event.target.checked })} /><span><strong>Account active</strong><small>Allow this staff member to sign in.</small></span></label>}
          </section>
          <div className={styles.permissionHead}><div><h3>Permissions</h3><p>{fullAccess ? `${roleLabel(form.role)} receives all operational permissions.` : 'Select only the modules this person needs.'}</p></div>{!fullAccess && <button type="button" onClick={() => setForm({ ...form, permissions: form.permissions.length === ADMIN_PERMISSIONS.length ? [] : ADMIN_PERMISSIONS.map(item => item.key) })}>{form.permissions.length === ADMIN_PERMISSIONS.length ? 'Clear all' : 'Select all'}</button>}</div>
          <section className={`${styles.permissions} ${fullAccess ? styles.disabled : ''}`}>
            {ADMIN_PERMISSIONS.map(permission => <label key={permission.key}>
              <input type="checkbox" checked={fullAccess || form.permissions.includes(permission.key)} disabled={fullAccess} onChange={() => togglePermission(permission.key)} />
              <span><strong>{permission.label}</strong><small>{permission.description}</small></span>
            </label>)}
          </section>
        </div>
        <footer className={styles.modalFooter}><button type="button" onClick={closeModal}>Cancel</button><button className={styles.primary} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create staff'}</button></footer>
      </form>
    </div>}
  </main>;
}
