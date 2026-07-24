'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Plus, Minus, Save, Search, User } from '@/lib/icons';
import { getAdminCache, setAdminCache, clearAdminCache } from '../adminCache';

type Customer = { id: string; fullName: string; phoneNumber: string; email?: string | null; role: string };
type InvoiceItem = { id?: string; description: string; quantity: number; unitPrice: number; lineTotal?: number };
type Invoice = {
  id: string; invoiceNumber: string; status: 'DRAFT' | 'SENT' | 'PAID' | 'VOID'; totalAmount: number;
  notes?: string | null; dueDate?: string | null; createdAt: string; sentAt?: string | null;
  customer: Customer; items: InvoiceItem[];
};
type Service = { id: string; name: string; category: string; hasWash: boolean; hasIron: boolean; hasWashIron: boolean; washPrice: number; ironPrice: number; washIronPrice: number };

const blankItem = (): InvoiceItem => ({ description: '', quantity: 1, unitPrice: 0 });
const formatNaira = (value: number) => `₦${Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;

export default function AdminInvoicesPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>(() => getAdminCache<Invoice[]>('admin-invoices') || []);
  const [customers, setCustomers] = useState<Customer[]>(() => getAdminCache<Customer[]>('admin-customers') || []);
  const [services, setServices] = useState<Service[]>(() => getAdminCache<Service[]>('admin-services') || []);
  const [loading, setLoading] = useState(() => !getAdminCache<Invoice[]>('admin-invoices'));
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [serviceQuery, setServiceQuery] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin'); setAuthChecked(true); return; }
    setAuthChecked(true);
    void loadData();
  }, []);

  async function loadData() {
    const cached = getAdminCache<Invoice[]>('admin-invoices');
    if (!cached) setLoading(true);
    try {
      const [invoiceRes, usersRes, servicesRes] = await Promise.all([
        axios.get('/api/v1/admin/invoices'),
        getAdminCache<Customer[]>('admin-customers') ? Promise.resolve(null) : axios.get('/api/v1/admin/users'),
        getAdminCache<Service[]>('admin-services') ? Promise.resolve(null) : axios.get('/api/v1/admin/services'),
      ]);
      const nextInvoices = invoiceRes.data.invoices || [];
      setInvoices(nextInvoices); setAdminCache('admin-invoices', nextInvoices);
      if (usersRes) {
        const nextCustomers = (usersRes.data.users || []).filter((user: Customer) => user.role === 'CUSTOMER');
        setCustomers(nextCustomers); setAdminCache('admin-customers', nextCustomers);
      }
      if (servicesRes) {
        const nextServices = servicesRes.data.services || [];
        setServices(nextServices); setAdminCache('admin-services', nextServices);
      }
    } catch (error) { console.error('Unable to load invoices:', error); }
    finally { setLoading(false); }
  }

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0), [items]);
  const filtered = invoices.filter((invoice) => `${invoice.invoiceNumber} ${invoice.customer.fullName} ${invoice.status}`.toLowerCase().includes(query.toLowerCase()));
  const matchingServices = services.filter((service) => `${service.name} ${service.category}`.toLowerCase().includes(serviceQuery.toLowerCase())).slice(0, 8);

  function updateItem(index: number, patch: Partial<InvoiceItem>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  function addCatalogItem(service: Service, option: 'Wash only' | 'Iron only' | 'Wash & iron', unitPrice: number) {
    setItems((current) => [...current, { description: `${service.name} — ${option}`, quantity: 1, unitPrice }]);
  }

  async function createInvoice(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await axios.post('/api/v1/admin/invoices', { customerId, items, notes, dueDate: dueDate || null });
      const next = [response.data, ...invoices];
      setInvoices(next); setAdminCache('admin-invoices', next);
      setCreating(false); setCustomerId(''); setItems([]); setNotes(''); setDueDate(''); setServiceQuery('');
    } catch (error: any) { alert(error.response?.data?.error || 'Unable to create invoice.'); }
    finally { setSaving(false); }
  }

  async function markSent(invoice: Invoice) {
    try {
      const response = await axios.patch(`/api/v1/admin/invoices/${invoice.id}`, { status: 'SENT' });
      const next = invoices.map((item) => item.id === invoice.id ? response.data : item);
      setInvoices(next); setAdminCache('admin-invoices', next);
    } catch (error: any) { alert(error.response?.data?.error || 'Unable to update invoice.'); }
  }

  function invoiceMessage(invoice: Invoice) {
    const due = invoice.dueDate ? ` Due: ${new Date(invoice.dueDate).toLocaleDateString('en-GB')}.` : '';
    return `Hello ${invoice.customer.fullName}, your BG Laundry invoice ${invoice.invoiceNumber} is ready. Total: ${formatNaira(invoice.totalAmount)}.${due}`;
  }

  async function shareInvoice(invoice: Invoice) {
    await markSent(invoice);
    const message = invoiceMessage(invoice);
    if (navigator.share) {
      try { await navigator.share({ title: `Invoice ${invoice.invoiceNumber}`, text: message }); return; } catch { /* use WhatsApp fallback */ }
    }
    const phone = invoice.customer.phoneNumber.replace(/\D/g, '').replace(/^0/, '234');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  function printInvoice(invoice: Invoice) {
    const escape = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char));
    const rows = invoice.items.map((item) => `<tr><td>${escape(item.description)}</td><td>${item.quantity}</td><td>${formatNaira(item.unitPrice)}</td><td>${formatNaira(item.quantity * item.unitPrice)}</td></tr>`).join('');
    const popup = window.open('', '_blank', 'noopener,noreferrer');
    if (!popup) return alert('Please allow popups to save this invoice as a PDF.');
    popup.document.write(`<!doctype html><html><head><title>${invoice.invoiceNumber}</title><style>body{font-family:Arial,sans-serif;color:#0f172a;padding:44px;max-width:760px;margin:auto}header{display:flex;justify-content:space-between;border-bottom:2px solid #0f172a;padding-bottom:22px}h1{margin:0;font-size:30px}table{width:100%;border-collapse:collapse;margin-top:30px}th,td{padding:12px;border-bottom:1px solid #e2e8f0;text-align:left}th:last-child,td:last-child{text-align:right}.total{text-align:right;font-size:22px;font-weight:bold;margin-top:22px}.muted{color:#64748b;font-size:14px}</style></head><body><header><div><h1>BG Laundry</h1><p class="muted">Invoice ${invoice.invoiceNumber}</p></div><div><strong>Bill to</strong><br>${escape(invoice.customer.fullName)}<br><span class="muted">${escape(invoice.customer.phoneNumber)}</span></div></header><table><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><p class="total">Total: ${formatNaira(invoice.totalAmount)}</p>${invoice.notes ? `<p class="muted">Notes: ${escape(invoice.notes)}</p>` : ''}<script>window.onload=()=>window.print()<\/script></body></html>`);
    popup.document.close();
  }

  if (!authChecked) return null;
  return <div className="invoicePage"><main className="invoiceMain">
    <header className="invoiceHeader"><div><span className="eyebrow">Billing</span><h1>Invoices</h1><p>Create clear invoices, save them as PDF, or share them directly with customers.</p></div><button className="primaryButton" onClick={() => setCreating(true)}><Plus size={18} /> Create invoice</button></header>
    <div className="invoiceToolbar"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice number, customer, or status" /></div>
    <section className="invoiceList">{loading ? <div className="empty">Loading invoices…</div> : filtered.length === 0 ? <div className="empty"><strong>No invoices yet</strong><span>Create your first invoice to start billing customers.</span></div> : filtered.map((invoice) => <article className="invoiceCard" key={invoice.id}><div className="invoiceCardTop"><div><span className="invoiceNumber">{invoice.invoiceNumber}</span><h2>{invoice.customer.fullName}</h2><p>{new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div><span className={`status ${invoice.status.toLowerCase()}`}>{invoice.status}</span></div><div className="invoiceCardBottom"><strong>{formatNaira(invoice.totalAmount)}</strong><div className="actions"><button onClick={() => printInvoice(invoice)}>Save PDF</button><button className="shareButton" onClick={() => shareInvoice(invoice)}>Share</button></div></div></article>)}</section>
  </main>
  {creating && <div className="modalOverlay" onMouseDown={() => !saving && setCreating(false)}><form className="invoiceModal" onSubmit={createInvoice} onMouseDown={(event) => event.stopPropagation()}><div className="modalTop"><div><span className="eyebrow">New invoice</span><h2>Create customer invoice</h2></div><button type="button" className="closeButton" onClick={() => setCreating(false)}>×</button></div><label>Customer<select value={customerId} onChange={(event) => setCustomerId(event.target.value)} required><option value="">Select a customer</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.fullName} — {customer.phoneNumber}</option>)}</select></label><section className="serviceCatalog"><div className="catalogHeader"><div><strong>Add from service catalogue</strong><span>Choose the exact laundry service and treatment.</span></div><Search size={17} /></div><input value={serviceQuery} onChange={(event) => setServiceQuery(event.target.value)} placeholder="Search existing services" aria-label="Search existing services" />{matchingServices.length === 0 ? <p className="catalogEmpty">No matching services found.</p> : <div className="catalogResults">{matchingServices.map((service) => <div className="catalogService" key={service.id}><strong>{service.name}</strong><span>{service.category}</span><div>{service.hasWash && <button type="button" onClick={() => addCatalogItem(service, 'Wash only', service.washPrice)}>Wash only · {formatNaira(service.washPrice)}</button>}{service.hasIron && <button type="button" onClick={() => addCatalogItem(service, 'Iron only', service.ironPrice)}>Iron only · {formatNaira(service.ironPrice)}</button>}{service.hasWashIron && <button type="button" onClick={() => addCatalogItem(service, 'Wash & iron', service.washIronPrice)}>Wash & iron · {formatNaira(service.washIronPrice)}</button>}</div></div>)}</div>}</section><div className="itemHeading"><strong>Invoice items</strong><button type="button" onClick={() => setItems((current) => [...current, blankItem()])}><Plus size={15} /> Custom item</button></div>{items.length === 0 ? <div className="noItems">Select a service above, or add a custom item.</div> : items.map((item, index) => <div className="itemRow" key={index}><input value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} placeholder="Service or item" required /><input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} required /><input type="number" min="0" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: Number(event.target.value) })} required /><button type="button" className="removeItem" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Minus size={16} /></button></div>)}<label>Due date <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label><label>Notes <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional payment instructions" /></label><div className="invoiceTotal"><span>Total</span><strong>{formatNaira(total)}</strong></div><div className="modalActions"><button type="button" onClick={() => setCreating(false)}>Cancel</button><button className="primaryButton" disabled={saving} type="submit"><Save size={17} /> {saving ? 'Creating…' : 'Create invoice'}</button></div></form></div>}
  <style jsx>{`
    .invoicePage{min-height:100vh;background:#f8fafc;color:#0f172a}.invoiceMain{padding:40px;max-width:1180px;margin:0 auto}.invoiceHeader{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:28px}.eyebrow{display:block;color:#64748b;text-transform:uppercase;letter-spacing:.1em;font-size:11px;font-weight:800}.invoiceHeader h1,.modalTop h2{margin:5px 0 6px;font-size:30px;letter-spacing:-.03em}.invoiceHeader p{margin:0;color:#64748b}.primaryButton{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:10px;background:#0f172a;color:#fff;padding:12px 16px;font-size:14px;font-weight:700;cursor:pointer}.invoiceToolbar{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;margin-bottom:18px}.invoiceToolbar input{border:0;outline:0;width:100%;font-size:14px}.invoiceList{display:grid;gap:14px}.invoiceCard{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:20px}.invoiceCardTop,.invoiceCardBottom{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.invoiceCardBottom{align-items:center;border-top:1px solid #f1f5f9;margin-top:16px;padding-top:16px}.invoiceNumber{font-size:12px;font-weight:800;color:#2563eb}.invoiceCard h2{font-size:17px;margin:5px 0}.invoiceCard p{margin:0;color:#64748b;font-size:13px}.status{padding:6px 10px;border-radius:999px;font-size:11px;font-weight:800;background:#f1f5f9;color:#475569}.status.sent{background:#dbeafe;color:#1d4ed8}.status.paid{background:#dcfce7;color:#166534}.actions{display:flex;gap:8px}.actions button,.modalActions button,.itemHeading button{border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:9px;padding:9px 12px;font-size:13px;font-weight:700;cursor:pointer}.actions .shareButton{background:#0f172a;color:#fff;border-color:#0f172a}.empty{display:grid;gap:8px;text-align:center;padding:72px 20px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;color:#64748b}.empty strong{font-size:17px;color:#0f172a}.modalOverlay{position:fixed;inset:0;z-index:250;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.5);overflow:auto}.invoiceModal{width:min(100%,680px);display:grid;gap:15px;background:#fff;border-radius:20px;padding:28px;box-shadow:0 24px 80px rgba(15,23,42,.28)}.modalTop{display:flex;justify-content:space-between;align-items:flex-start}.modalTop h2{font-size:23px}.closeButton{width:34px;height:34px;border:0;border-radius:50%;background:#f1f5f9;font-size:22px;cursor:pointer}.invoiceModal label{display:grid;gap:7px;color:#334155;font-size:13px;font-weight:700}.invoiceModal input,.invoiceModal select,.invoiceModal textarea{box-sizing:border-box;width:100%;padding:11px 12px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#0f172a;font:inherit;font-weight:400}.invoiceModal textarea{min-height:70px;resize:vertical}.serviceCatalog{display:grid;gap:10px;padding:14px;border:1px solid #dbe4ee;border-radius:12px;background:#f8fafc}.catalogHeader{display:flex;justify-content:space-between;gap:12px}.catalogHeader div{display:grid;gap:2px}.catalogHeader strong{font-size:14px}.catalogHeader span{color:#64748b;font-size:12px}.catalogResults{display:grid;gap:8px;max-height:240px;overflow:auto}.catalogService{display:grid;grid-template-columns:1fr auto;gap:3px 12px;padding:10px;background:#fff;border:1px solid #e2e8f0;border-radius:9px}.catalogService>span{font-size:12px;color:#64748b}.catalogService>div{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:6px}.catalogService button{border:1px solid #bfdbfe;background:#eff6ff;color:#1d4ed8;border-radius:7px;padding:6px 8px;font-size:11px;font-weight:700;cursor:pointer}.catalogEmpty,.noItems{margin:0;color:#64748b;font-size:13px}.itemHeading{display:flex;justify-content:space-between;align-items:center}.itemHeading button{display:inline-flex;align-items:center;gap:5px;padding:7px 10px}.itemRow{display:grid;grid-template-columns:minmax(0,1fr) 76px 110px 32px;gap:8px;align-items:center}.itemRow input{min-width:0}.removeItem{height:36px;border:0;border-radius:8px;color:#dc2626;background:#fef2f2;cursor:pointer}.invoiceTotal{display:flex;justify-content:space-between;padding:14px;border-radius:10px;background:#f8fafc;font-size:15px}.invoiceTotal strong{font-size:20px}.modalActions{display:flex;justify-content:flex-end;gap:10px}.modalActions .primaryButton{border:0}@media(max-width:640px){.invoiceMain{padding:20px 16px 32px}.invoiceHeader{padding-left:56px;align-items:flex-start;flex-direction:column}.invoiceHeader h1{font-size:25px}.invoiceHeader p{font-size:13px;line-height:1.45}.invoiceHeader .primaryButton{width:100%}.invoiceCard{padding:16px}.invoiceCardTop{align-items:flex-start}.invoiceCardBottom{align-items:flex-start;flex-direction:column}.actions{width:100%}.actions button{flex:1}.invoiceModal{padding:20px;border-radius:16px}.catalogService{grid-template-columns:1fr}.catalogService>div{grid-column:auto}.itemRow{grid-template-columns:minmax(0,1fr) 64px 86px}.itemRow .removeItem{display:none}.modalActions{flex-direction:column-reverse}.modalActions button{width:100%}}
  `}</style></div>;
}
