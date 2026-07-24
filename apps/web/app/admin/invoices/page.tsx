'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Minus, Plus, Save, Search, X } from '@/lib/icons';
import { getAdminCache, setAdminCache } from '../adminCache';
import styles from './invoices.module.css';

type Customer = { id: string; fullName: string; phoneNumber: string; email?: string | null };
type InvoiceItem = { id?: string; description: string; quantity: number; unitPrice: number; lineTotal?: number };
type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'VOID';
type Invoice = {
  id: string; invoiceNumber: string; status: InvoiceStatus; currency: string; subtotal: number; totalAmount: number;
  notes?: string | null; dueDate?: string | null; createdAt: string; updatedAt: string; sentAt?: string | null;
  customer: Customer; items: InvoiceItem[];
};
type Service = { id: string; name: string; category: string; hasWash: boolean; hasIron: boolean; hasWashIron: boolean; washPrice: number; ironPrice: number; washIronPrice: number };

const blankItem = (): InvoiceItem => ({ description: '', quantity: 1, unitPrice: 0 });
const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

export default function AdminInvoicesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>(() => getAdminCache<Invoice[]>('admin-invoices') || []);
  const [customers, setCustomers] = useState<Customer[]>(() => getAdminCache<Customer[]>('admin-customers') || []);
  const [services, setServices] = useState<Service[]>(() => getAdminCache<Service[]>('admin-services') || []);
  const [loading, setLoading] = useState(() => !getAdminCache<Invoice[]>('admin-invoices'));
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InvoiceStatus>('ALL');
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [serviceQuery, setServiceQuery] = useState('');
  const [notice, setNotice] = useState('');

  const adminHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}` });

  function requestError(error: any, fallback: string) {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      router.replace('/admin');
      return;
    }
    setNotice(error.response?.data?.error || fallback);
  }

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.replace('/admin'); return; }
    setAuthorized(true);
    void loadData();
  }, []);

  async function loadData() {
    if (!getAdminCache<Invoice[]>('admin-invoices')) setLoading(true);
    try {
      const [invoiceResponse, customerResponse, serviceResponse] = await Promise.all([
        axios.get('/api/v1/admin/invoices', { headers: adminHeaders() }),
        getAdminCache<Customer[]>('admin-customers') ? Promise.resolve(null) : axios.get('/api/v1/admin/users', { headers: adminHeaders() }),
        getAdminCache<Service[]>('admin-services') ? Promise.resolve(null) : axios.get('/api/v1/admin/services'),
      ]);
      const nextInvoices = invoiceResponse.data.invoices || [];
      setInvoices(nextInvoices); setAdminCache('admin-invoices', nextInvoices);
      if (customerResponse) {
        const nextCustomers = customerResponse.data.users || [];
        setCustomers(nextCustomers); setAdminCache('admin-customers', nextCustomers);
      }
      if (serviceResponse) {
        const nextServices = serviceResponse.data.services || [];
        setServices(nextServices); setAdminCache('admin-services', nextServices);
      }
    } catch (error: any) { requestError(error, 'Unable to load billing information.'); }
    finally { setLoading(false); }
  }

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0), [items]);
  const matchingServices = services.filter((service) => `${service.name} ${service.category}`.toLowerCase().includes(serviceQuery.toLowerCase())).slice(0, 8);
  const filtered = invoices.filter((invoice) => {
    const matchesSearch = `${invoice.invoiceNumber} ${invoice.customer.fullName} ${invoice.customer.phoneNumber} ${invoice.status}`.toLowerCase().includes(query.toLowerCase());
    return matchesSearch && (statusFilter === 'ALL' || invoice.status === statusFilter);
  });
  const metrics = {
    total: invoices.reduce((sum, invoice) => invoice.status !== 'VOID' ? sum + invoice.totalAmount : sum, 0),
    outstanding: invoices.reduce((sum, invoice) => !['PAID', 'VOID'].includes(invoice.status) ? sum + invoice.totalAmount : sum, 0),
    sent: invoices.filter((invoice) => invoice.status === 'SENT').length,
    paid: invoices.filter((invoice) => invoice.status === 'PAID').length,
  };

  function updateItem(index: number, patch: Partial<InvoiceItem>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  function addCatalogItem(service: Service, option: string, unitPrice: number) {
    setItems((current) => [...current, { description: `${service.name} — ${option}`, quantity: 1, unitPrice }]);
  }

  async function createInvoice(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setNotice('');
    try {
      const response = await axios.post('/api/v1/admin/invoices', { customerId, items, notes, dueDate: dueDate || null }, { headers: adminHeaders() });
      const next = [response.data, ...invoices];
      setInvoices(next); setAdminCache('admin-invoices', next);
      setCreating(false); setCustomerId(''); setItems([]); setNotes(''); setDueDate(''); setServiceQuery('');
      setNotice(`${response.data.invoiceNumber} was created.`);
    } catch (error: any) { requestError(error, 'Unable to create invoice.'); }
    finally { setSaving(false); }
  }

  async function updateStatus(invoice: Invoice, status: InvoiceStatus) {
    setSaving(true); setNotice('');
    try {
      const response = await axios.patch(`/api/v1/admin/invoices/${invoice.id}`, { status }, { headers: adminHeaders() });
      const next = invoices.map((item) => item.id === invoice.id ? response.data : item);
      setInvoices(next); setAdminCache('admin-invoices', next);
      setPreview((current) => current?.id === invoice.id ? response.data : current);
      setNotice(`${invoice.invoiceNumber} is now ${status.toLowerCase()}.`);
      return response.data as Invoice;
    } catch (error: any) { requestError(error, 'Unable to update invoice.'); return null; }
    finally { setSaving(false); }
  }

  function invoiceMessage(invoice: Invoice) {
    const due = invoice.dueDate ? ` Due: ${new Date(invoice.dueDate).toLocaleDateString('en-GB')}.` : '';
    return `Hello ${invoice.customer.fullName}, your BG Laundry invoice ${invoice.invoiceNumber} is ready. Total: ${money.format(invoice.totalAmount)}.${due}`;
  }

  async function shareInvoice(invoice: Invoice) {
    try {
      const current = invoice.status === 'DRAFT' ? await updateStatus(invoice, 'SENT') : invoice;
      if (!current) return;
      const message = invoiceMessage(current);
      if (navigator.share) {
        try { await navigator.share({ title: `Invoice ${current.invoiceNumber}`, text: message }); return; }
        catch (error: any) { if (error?.name === 'AbortError') return; }
      }
      const phone = current.customer.phoneNumber.replace(/\D/g, '').replace(/^0/, '234');
      const shareWindow = window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      if (!shareWindow) setNotice('Please allow popups to share this invoice.');
    } catch (error: any) { requestError(error, 'Unable to share this invoice.'); }
  }

  function printInvoice(invoice: Invoice) {
    const escape = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] || character));
    const rows = invoice.items.map((item) => `<tr><td>${escape(item.description)}</td><td>${item.quantity}</td><td>${money.format(item.unitPrice)}</td><td>${money.format(item.lineTotal ?? item.quantity * item.unitPrice)}</td></tr>`).join('');
    const popup = window.open('', '_blank');
    if (!popup) { setNotice('Please allow popups to save this invoice as PDF.'); return; }
    popup.document.write(`<!doctype html><html><head><title>${invoice.invoiceNumber}</title><style>body{font-family:Arial;color:#14213d;padding:50px;max-width:800px;margin:auto}header{display:flex;justify-content:space-between;border-bottom:3px solid #153778;padding-bottom:24px}.brand{font-size:28px;font-weight:800;color:#153778}table{width:100%;border-collapse:collapse;margin-top:34px}th,td{padding:13px;border-bottom:1px solid #e2e8f0;text-align:left}th:last-child,td:last-child{text-align:right}.total{text-align:right;font-size:24px;font-weight:bold;margin-top:24px}.muted{color:#64748b;font-size:13px}</style></head><body><header><div><div class="brand">BG Laundry</div><p class="muted">${invoice.invoiceNumber}</p></div><div><strong>Bill to</strong><br>${escape(invoice.customer.fullName)}<br><span class="muted">${escape(invoice.customer.phoneNumber)}</span></div></header><table><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><p class="total">Total: ${money.format(invoice.totalAmount)}</p>${invoice.notes ? `<p class="muted">Notes: ${escape(invoice.notes)}</p>` : ''}<script>window.onload=()=>window.print()<\/script></body></html>`);
    popup.document.close();
  }

  if (!authorized) return <div className={styles.loadingPage}>Checking admin access…</div>;

  return <main className={styles.page}>
    <header className={styles.header}><div><span className={styles.eyebrow}>Billing / Invoices</span><h1>Invoice management</h1><p>Create, track, preview, download and share customer invoices.</p></div><button className={styles.primary} onClick={() => setCreating(true)}><Plus size={17} />Create invoice</button></header>
    {notice && <button className={styles.notice} onClick={() => setNotice('')}>{notice}<X size={14} /></button>}
    <section className={styles.metrics}><article><span>Total billed</span><strong>{money.format(metrics.total)}</strong><small>{invoices.length} invoices</small></article><article><span>Outstanding</span><strong>{money.format(metrics.outstanding)}</strong><small>Draft and sent</small></article><article><span>Awaiting payment</span><strong>{metrics.sent}</strong><small>Sent invoices</small></article><article><span>Paid invoices</span><strong>{metrics.paid}</strong><small>Completed billing</small></article></section>
    <section className={styles.toolbar}><div className={styles.search}><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice, customer, phone or status…" /></div><div className={styles.filters}>{(['ALL', 'DRAFT', 'SENT', 'PAID', 'VOID'] as const).map((status) => <button className={statusFilter === status ? styles.activeFilter : ''} onClick={() => setStatusFilter(status)} key={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</button>)}</div></section>
    {loading ? <div className={styles.empty}>Loading invoices…</div> : filtered.length === 0 ? <div className={styles.empty}><strong>No invoices found</strong><span>Create an invoice or try another filter.</span></div> :
      <section className={styles.tableShell}><div className={styles.tableHead}><span>Invoice</span><span>Customer</span><span>Issued</span><span>Due date</span><span>Status</span><span>Amount</span><span>Actions</span></div>{filtered.map((invoice) => <article className={styles.invoiceRow} key={invoice.id}><div><strong>{invoice.invoiceNumber}</strong><span>{invoice.items.length} line items</span></div><div><strong>{invoice.customer.fullName}</strong><span>{invoice.customer.phoneNumber}</span></div><div><strong>{new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong><span>{new Date(invoice.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span></div><div><strong>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}</strong><span>{invoice.dueDate && new Date(invoice.dueDate) < new Date() && !['PAID', 'VOID'].includes(invoice.status) ? 'Overdue' : '—'}</span></div><span className={`${styles.status} ${styles[invoice.status.toLowerCase()]}`}>{invoice.status}</span><strong className={styles.amount}>{money.format(invoice.totalAmount)}</strong><div className={styles.actions}><button onClick={() => setPreview(invoice)}>View</button><button onClick={() => { void shareInvoice(invoice); }}>Share</button><button className={styles.more} onClick={() => printInvoice(invoice)}>PDF</button></div></article>)}</section>}

    {preview && <div className={styles.backdrop} onMouseDown={() => setPreview(null)}><section className={styles.previewModal} onMouseDown={(event) => event.stopPropagation()}><button className={styles.close} onClick={() => setPreview(null)}><X size={18} /></button><article className={styles.invoicePaper}><header><div><div className={styles.invoiceLogo}>BG</div><strong>BG Laundry</strong><span>Premium Laundry & Dry Cleaning</span></div><div><span>INVOICE</span><h2>{preview.invoiceNumber}</h2><b className={`${styles.status} ${styles[preview.status.toLowerCase()]}`}>{preview.status}</b></div></header><section className={styles.billMeta}><div><span>BILL TO</span><strong>{preview.customer.fullName}</strong><p>{preview.customer.phoneNumber}<br />{preview.customer.email || 'No email provided'}</p></div><div><span>INVOICE DETAILS</span><p><b>Issued:</b> {new Date(preview.createdAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}<br /><b>Due:</b> {preview.dueDate ? new Date(preview.dueDate).toLocaleDateString('en-GB', { dateStyle: 'long' }) : 'Due on receipt'}</p></div></section><div className={styles.previewTable}><div><span>Description</span><span>Qty</span><span>Rate</span><span>Amount</span></div>{preview.items.map((item, index) => <div key={item.id || index}><strong>{item.description}</strong><span>{item.quantity}</span><span>{money.format(item.unitPrice)}</span><strong>{money.format(item.lineTotal ?? item.quantity * item.unitPrice)}</strong></div>)}</div><section className={styles.invoiceTotals}><div><span>Subtotal</span><strong>{money.format(preview.subtotal)}</strong></div><div><span>Total due</span><strong>{money.format(preview.totalAmount)}</strong></div></section>{preview.notes && <div className={styles.notes}><span>NOTES</span><p>{preview.notes}</p></div>}<footer><strong>Thank you for choosing BG Laundry.</strong><span>0705 815 5555 · 0805 825 5555</span></footer></article><div className={styles.previewActions}><select value={preview.status} onChange={(event) => { void updateStatus(preview, event.target.value as InvoiceStatus); }} disabled={saving}><option value="DRAFT">Draft</option><option value="SENT">Sent</option><option value="PAID">Paid</option><option value="VOID">Void</option></select><button onClick={() => printInvoice(preview)}>Save PDF</button><button className={styles.primary} onClick={() => { void shareInvoice(preview); }}>Share invoice</button></div></section></div>}

    {creating && <div className={styles.backdrop} onMouseDown={() => !saving && setCreating(false)}><form className={styles.createModal} onSubmit={createInvoice} onMouseDown={(event) => event.stopPropagation()}><div className={styles.modalTop}><div><span className={styles.eyebrow}>New billing record</span><h2>Create invoice</h2><p>Build a professional invoice from your service catalogue.</p></div><button type="button" onClick={() => setCreating(false)}><X size={18} /></button></div><label>Customer<select value={customerId} onChange={(event) => setCustomerId(event.target.value)} required><option value="">Select a customer</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.fullName} — {customer.phoneNumber}</option>)}</select></label><section className={styles.catalog}><div><strong>Add from service catalogue</strong><span>Choose a treatment to add it as an invoice line.</span></div><input value={serviceQuery} onChange={(event) => setServiceQuery(event.target.value)} placeholder="Search services…" />{matchingServices.length === 0 ? <p>No matching services.</p> : <div className={styles.catalogResults}>{matchingServices.map((service) => <div key={service.id}><strong>{service.name}</strong><span>{service.category}</span><section>{service.hasWash && <button type="button" onClick={() => addCatalogItem(service, 'Wash only', service.washPrice)}>Wash · {money.format(service.washPrice)}</button>}{service.hasIron && <button type="button" onClick={() => addCatalogItem(service, 'Iron only', service.ironPrice)}>Iron · {money.format(service.ironPrice)}</button>}{service.hasWashIron && <button type="button" onClick={() => addCatalogItem(service, 'Wash & iron', service.washIronPrice)}>Both · {money.format(service.washIronPrice)}</button>}</section></div>)}</div>}</section><div className={styles.itemTitle}><strong>Invoice items</strong><button type="button" onClick={() => setItems((current) => [...current, blankItem()])}><Plus size={14} />Custom item</button></div>{items.length === 0 ? <div className={styles.noItems}>Select a service above or add a custom item.</div> : items.map((item, index) => <div className={styles.itemRow} key={index}><input value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} placeholder="Description" required /><input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} required /><input type="number" min="0" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: Number(event.target.value) })} required /><button type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Minus size={15} /></button></div>)}<div className={styles.formSplit}><label>Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label><label>Notes<input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional instructions" /></label></div><div className={styles.createTotal}><span>Invoice total</span><strong>{money.format(total)}</strong></div><div className={styles.modalActions}><button type="button" onClick={() => setCreating(false)}>Cancel</button><button className={styles.primary} disabled={saving || !items.length}><Save size={16} />{saving ? 'Creating…' : 'Create invoice'}</button></div></form></div>}
  </main>;
}
