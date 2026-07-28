'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
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

  function togglePermission(key: string) {
    setForm(current => ({
      ...current,
      permissions: current.permissions.includes(key)
        ? current.permissions.filter(permission => permission !== key)
        : [...current.permissions, key],
    }));
  }

  function edit(member: Staff) {
    setEditingId(member.id);
    setForm({
      fullName: member.fullName, email: member.email || '', phoneNumber: member.phoneNumber,
      password: '', role: member.role, permissions: member.permissions, isActive: member.isActive,
    });
    setError(''); setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancel() {
    setEditingId(null); setForm(blankForm); setError(''); setNotice('');
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      if (editingId) {
        await axios.patch(`/api/v1/admin/staff/${editingId}`, form, { headers: headers() });
        setNotice('Staff account updated. New permissions apply on the next sign-in.');
      } else {
        await axios.post('/api/v1/admin/staff', form, { headers: headers() });
        setNotice('Staff account created. They can now sign in through the admin portal.');
      }
      setEditingId(null); setForm(blankForm); await load();
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Unable to save staff account.');
    } finally {
      setSaving(false);
    }
  }

  if (!canManage) return <main className={styles.page}><div className={styles.denied}><h1>Access restricted</h1><p>You do not have permission to manage staff accounts.</p></div></main>;

  return <main className={styles.page}>
    <header><div><span className={styles.eyebrow}>Super admin settings</span><h1>Settings</h1><p>Manage staff accounts, roles, account status, and dashboard permissions.</p></div></header>
    {error && <div className={styles.error}>{error}</div>}
    {notice && <div className={styles.notice}>{notice}</div>}

    <section className={styles.grid}>
      <form className={styles.formCard} onSubmit={submit}>
        <div className={styles.cardTitle}><div><h2>{editingId ? 'Edit staff account' : 'Add staff account'}</h2><p>Each person signs in with their own email and password.</p></div>{editingId && <button type="button" onClick={cancel}>Cancel</button>}</div>
        <div className={styles.fields}>
          <label>Full name<input value={form.fullName} onChange={event => setForm({ ...form, fullName: event.target.value })} required /></label>
          <label>Email address<input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} required /></label>
          <label>Phone number<input type="tel" value={form.phoneNumber} onChange={event => setForm({ ...form, phoneNumber: event.target.value })} placeholder="0705 815 5555" required /></label>
          <label>{editingId ? 'New password (optional)' : 'Temporary password'}<input type="password" minLength={8} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} required={!editingId} /></label>
          <label>Role<select value={form.role} onChange={event => setForm({ ...form, role: event.target.value, permissions: [] })}>{STAFF_ROLES.filter(role => role !== 'ADMIN').map(role => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></label>
          {editingId && <label className={styles.active}><input type="checkbox" checked={form.isActive} onChange={event => setForm({ ...form, isActive: event.target.checked })} /> Account active</label>}
        </div>
        <div className={styles.permissionHead}><div><h3>Permissions</h3><p>{fullAccess ? `${roleLabel(form.role)} has full access automatically.` : 'Choose what this person can access.'}</p></div>{!fullAccess && <button type="button" onClick={() => setForm({ ...form, permissions: ADMIN_PERMISSIONS.map(item => item.key) })}>Select all</button>}</div>
        <div className={`${styles.permissions} ${fullAccess ? styles.disabled : ''}`}>
          {ADMIN_PERMISSIONS.map(permission => <label key={permission.key}>
            <input type="checkbox" checked={fullAccess || form.permissions.includes(permission.key)} disabled={fullAccess} onChange={() => togglePermission(permission.key)} />
            <span><strong>{permission.label}</strong><small>{permission.description}</small></span>
          </label>)}
        </div>
        <button className={styles.primary} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create account'}</button>
      </form>

      <section className={styles.listCard}>
        <div className={styles.cardTitle}><div><h2>Team accounts</h2><p>{staff.length} staff member{staff.length === 1 ? '' : 's'}</p></div></div>
        {loading ? <div className={styles.empty}>Loading staff…</div> : staff.length === 0 ? <div className={styles.empty}>No staff accounts yet.</div> :
          <div className={styles.staffList}>{staff.map(member => <article key={member.id}>
            <div className={styles.avatar}>{member.fullName.slice(0, 2).toUpperCase()}</div>
            <div className={styles.memberInfo}><div><strong>{member.fullName}</strong><span className={`${styles.status} ${member.isActive ? styles.on : styles.off}`}>{member.isActive ? 'Active' : 'Disabled'}</span></div><p>{member.email}</p><small>{roleLabel(member.role)} · {FULL_ACCESS_ROLES.includes(member.role as typeof FULL_ACCESS_ROLES[number]) ? 'Full access' : `${member.permissions.length} permissions`}</small></div>
            <button onClick={() => edit(member)}>Edit</button>
          </article>)}</div>}
      </section>
    </section>
  </main>;
}
