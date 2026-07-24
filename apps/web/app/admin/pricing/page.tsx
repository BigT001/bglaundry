'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Sliders, Save, ShieldAlert, Check, Plus, Trash2, Tag, HelpCircle } from '@/lib/icons';
import { getAdminCache, setAdminCache, clearAdminCache } from '../adminCache';

interface ServiceItem {
  id: string;
  name: string;
  category: string; // "Clothing" | "Household" | "Additional"
  icon: string;
  hasWash: boolean;
  hasIron: boolean;
  hasWashIron: boolean;
  washPrice: number;
  ironPrice: number;
  washIronPrice: number;
}

const CATEGORIES = ['Clothing', 'Household', 'Additional'];

export default function AdminPricingPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>(() => getAdminCache<ServiceItem[]>('admin-services') || []);
  const [loading, setLoading] = useState(() => !getAdminCache<ServiceItem[]>('admin-services'));
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Clothing');

  // Add Service Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Clothing');
  const [newIcon, setNewIcon] = useState('tshirt-crew');
  const [newHasWash, setNewHasWash] = useState(true);
  const [newHasIron, setNewHasIron] = useState(true);
  const [newHasWashIron, setNewHasWashIron] = useState(true);
  const [newWashPrice, setNewWashPrice] = useState('500');
  const [newIronPrice, setNewIronPrice] = useState('300');
  const [newWashIronPrice, setNewWashIronPrice] = useState('700');
  const [addingService, setAddingService] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);

  // Authenticate Admin
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      setAuthChecked(true);
    } else {
      setAuthorized(true);
      setAuthChecked(true);
      fetchServices();
    }
  }, []);

  const fetchServices = async () => {
    if (!getAdminCache<ServiceItem[]>('admin-services')) setLoading(true);
    try {
      const response = await axios.get('/api/v1/admin/services');
      const nextServices = response.data.services || [];
      setServices(nextServices);
      setAdminCache('admin-services', nextServices);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRate = (id: string, field: 'washPrice' | 'ironPrice' | 'washIronPrice', value: number) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      // Save all active services consecutively
      for (const service of services) {
        await axios.post('/api/v1/admin/services', service);
      }
      clearAdminCache('admin-services');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchServices();
    } catch (err) {
      console.error('Failed to update service rates:', err);
      alert('Failed to save service rates. Check connections.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('Service name is required');
      return;
    }

    setAddingService(true);
    try {
      await axios.post('/api/v1/admin/services', {
        name: newName.trim(),
        category: newCategory,
        icon: newIcon,
        hasWash: newHasWash,
        hasIron: newHasIron,
        hasWashIron: newHasWashIron,
        washPrice: parseFloat(newWashPrice) || 0,
        ironPrice: parseFloat(newIronPrice) || 0,
        washIronPrice: parseFloat(newWashIronPrice) || 0,
      });

      clearAdminCache('admin-services');

      setNewName('');
      setNewWashPrice('500');
      setNewIronPrice('300');
      setNewWashIronPrice('700');
      setIsCreateServiceOpen(false);
      alert('New service added successfully!');
      fetchServices();
    } catch (err) {
      console.error('Failed to add service:', err);
      alert('Failed to add service.');
    } finally {
      setAddingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await axios.delete(`/api/v1/admin/services/${id}`);
      clearAdminCache('admin-services');
      alert('Service deleted successfully!');
      fetchServices();
    } catch (err) {
      console.error('Failed to delete service:', err);
      alert('Failed to delete service.');
    }
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
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>Loading pricing controls…</h2>
          <p style={{ marginTop: '12px', color: '#64748B' }}>
            Validating admin access and loading service rates.
          </p>
        </div>
      </div>
    );
  }

  const categoryServices = services.filter((s) => s.category === activeCategory);

  const inputStyle = {
    padding: '10px',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0F172A',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <div
      className="pricingPage"
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#F8FAFC',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Main Content */}
      <main className="pricingMain" style={{ flex: 1, padding: '40px', boxSizing: 'border-box', overflowY: 'auto', height: '100vh' }}>

        {/* Category Tabs Selection */}
        <div className="pricingTopRow">
          <div className="categoryTabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="categoryTab"
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: activeCategory === cat ? '#0066FF' : 'transparent',
                  color: activeCategory === cat ? '#FFFFFF' : '#64748B',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <button type="button" className="openCreateButton" onClick={() => setIsCreateServiceOpen(true)}>
            <Plus size={17} /> Add service
          </button>
        </div>

        <section className="pricingGrid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', alignItems: 'flex-start' }}>
          {/* Services rates list panel */}
          <div
            className="servicesPanel"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 16px 0' }}>
              Active {activeCategory} Services ({categoryServices.length})
            </h3>

            {loading ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
                Loading service database...
              </div>
            ) : categoryServices.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94A3B8' }}>
                No active services defined under {activeCategory} category yet.
              </div>
            ) : (
              <form onSubmit={handleSaveRates}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {categoryServices.map((service) => (
                    <div
                      className="serviceCard"
                      key={service.id}
                      style={{
                        padding: '18px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        backgroundColor: '#FAFCFF',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div className="serviceCardHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0066FF' }} />
                          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>
                            {service.name}
                          </span>
                        </div>
                        {confirmDeleteId === service.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                handleDeleteService(service.id);
                                setConfirmDeleteId(null);
                              }}
                              style={{
                                border: 'none',
                                backgroundColor: '#EF4444',
                                color: '#FFFFFF',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              style={{
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#FFFFFF',
                                color: '#475569',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(service.id)}
                            style={{
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="rateGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        {service.hasWash && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                              Wash Only Rate (₦)
                            </label>
                            <input
                              type="number"
                              value={service.washPrice}
                              onChange={(e) => handleUpdateRate(service.id, 'washPrice', parseFloat(e.target.value) || 0)}
                              style={inputStyle}
                            />
                          </div>
                        )}
                        {service.hasIron && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                              Iron Only Rate (₦)
                            </label>
                            <input
                              type="number"
                              value={service.ironPrice}
                              onChange={(e) => handleUpdateRate(service.id, 'ironPrice', parseFloat(e.target.value) || 0)}
                              style={inputStyle}
                            />
                          </div>
                        )}
                        {service.hasWashIron && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                              Wash & Iron Rate (₦)
                            </label>
                            <input
                              type="number"
                              value={service.washIronPrice}
                              onChange={(e) => handleUpdateRate(service.id, 'washIronPrice', parseFloat(e.target.value) || 0)}
                              style={inputStyle}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="saveBar" style={{ marginTop: '28px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      backgroundColor: '#0066FF',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14.5px',
                      fontWeight: '700',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)',
                    }}
                  >
                    {saving ? (
                      'Saving Rates...'
                    ) : saveSuccess ? (
                      <>
                        <Check size={16} /> Saved Successfully
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Save Dynamic Pricing
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Pricing Controls Sidebar: Add new service & calculator */}
          <div
            className={`pricingSidebar ${isCreateServiceOpen ? 'isOpen' : ''}`}
            onMouseDown={() => !addingService && setIsCreateServiceOpen(false)}
          >
            
            {/* Form: Add Custom Service */}
            <div
              className="createPanel"
              onMouseDown={(event) => event.stopPropagation()}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} color="#0066FF" />
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Create New Service
                  </h3>
                </div>
                <button type="button" className="closeCreateButton" onClick={() => setIsCreateServiceOpen(false)} disabled={addingService} aria-label="Close create service form">×</button>
              </div>

              <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569' }}>Service Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Wedding Gown / Silk Shirt"
                    style={inputStyle}
                  />
                </div>

                <div className="formTwoCol" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569' }}>Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      style={inputStyle}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569' }}>App Icon</label>
                    <select
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="tshirt-crew">T-Shirt (Crew)</option>
                      <option value="tshirt-v">Shirt (V-Neck)</option>
                      <option value="hanger">Garment Hanger</option>
                      <option value="tie">Suit / Tie</option>
                      <option value="cards-heart">Dress / Wedding</option>
                      <option value="bed-double-outline">Duvet / Blanket</option>
                      <option value="bed-outline">Curtain / Heavy</option>
                      <option value="shoe-sneaker">Sneaker / Footwear</option>
                    </select>
                  </div>
                </div>

                <div className="serviceConfig" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>Service Configurations</span>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                    <input
                      type="checkbox"
                      checked={newHasWash}
                      onChange={(e) => setNewHasWash(e.target.checked)}
                    />
                    Supports Wash Only
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                    <input
                      type="checkbox"
                      checked={newHasIron}
                      onChange={(e) => setNewHasIron(e.target.checked)}
                    />
                    Supports Iron Only
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                    <input
                      type="checkbox"
                      checked={newHasWashIron}
                      onChange={(e) => setNewHasWashIron(e.target.checked)}
                    />
                    Supports Wash & Iron
                  </label>
                </div>

                <div className="priceGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Wash ₦</label>
                    <input
                      type="number"
                      value={newWashPrice}
                      onChange={(e) => setNewWashPrice(e.target.value)}
                      disabled={!newHasWash}
                      style={{
                        ...inputStyle,
                        padding: '8px',
                        opacity: newHasWash ? 1 : 0.5,
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Iron ₦</label>
                    <input
                      type="number"
                      value={newIronPrice}
                      onChange={(e) => setNewIronPrice(e.target.value)}
                      disabled={!newHasIron}
                      style={{
                        ...inputStyle,
                        padding: '8px',
                        opacity: newHasIron ? 1 : 0.5,
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Combo ₦</label>
                    <input
                      type="number"
                      value={newWashIronPrice}
                      onChange={(e) => setNewWashIronPrice(e.target.value)}
                      disabled={!newHasWashIron}
                      style={{
                        ...inputStyle,
                        padding: '8px',
                        opacity: newHasWashIron ? 1 : 0.5,
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingService}
                  style={{
                    padding: '12px',
                    backgroundColor: '#1E293B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginTop: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  {addingService ? 'Creating...' : 'Create Service Item'}
                </button>
              </form>
            </div>

            {/* Threshold info guidelines block */}
            <div
              className="warningPanel"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <ShieldAlert size={20} color="#EF4444" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                    SaaS Rate Warnings
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                    Updating rates dynamically syncs changes immediately to client checkouts. Ensure rates are aligned with local operating margins.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <style jsx>{`
        .pricingTopRow { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
        .categoryTabs { flex: 1; }
        .openCreateButton { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 10px 16px; border: 0; border-radius: 10px; background: #0F172A; color: #FFFFFF; font-size: 14px; font-weight: 700; white-space: nowrap; cursor: pointer; }
        .openCreateButton:hover { background: #1E293B; }
        .servicesPanel { padding: 0 !important; background: transparent !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
        .serviceCard { background: #FFFFFF !important; }
        .pricingSidebar:not(.isOpen) { display: none !important; }
        .pricingSidebar.isOpen { position: fixed !important; inset: 0 !important; z-index: 220; display: grid !important; place-items: center; padding: 20px; overflow-y: auto; background: rgba(15, 23, 42, 0.48); }
        .pricingSidebar.isOpen .createPanel { width: min(100%, 560px); padding: 28px !important; border-radius: 20px !important; box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28) !important; }
        .pricingSidebar.isOpen .warningPanel { display: none !important; }
        .closeCreateButton { width: 32px; height: 32px; border: 0; border-radius: 50%; background: #F1F5F9; color: #475569; font-size: 22px; line-height: 1; cursor: pointer; }
        .closeCreateButton:disabled { opacity: 0.6; cursor: wait; }
        @media (max-width: 900px) {
          .pricingPage { height: auto !important; min-height: 100vh; overflow: visible !important; }
          .pricingMain { height: auto !important; min-height: 100vh; padding: 28px 20px !important; overflow: visible !important; }
          .pricingGrid { grid-template-columns: 1fr !important; gap: 22px !important; }
          .pricingSidebar { position: static !important; gap: 20px !important; }
        }

        @media (max-width: 640px) {
          .pricingMain { padding: 20px 16px 32px !important; }
          .pricingTopRow { align-items: stretch; flex-direction: column; gap: 12px; margin-bottom: 20px; }
          .categoryTabs {
            gap: 6px !important;
            padding: 0 0 12px 56px !important;
            margin-bottom: 20px !important;
          }
          .openCreateButton { width: 100%; }
          .categoryTab { flex: 1 1 0; padding: 10px 6px !important; font-size: 13px !important; white-space: nowrap; }
          .servicesPanel, .createPanel, .warningPanel { padding: 18px !important; border-radius: 14px !important; }
          .servicesPanel h3 { font-size: 18px !important; line-height: 1.25; }
          .serviceCard { padding: 14px !important; gap: 14px !important; }
          .serviceCardHeader { align-items: flex-start !important; gap: 10px; }
          .serviceCardHeader > div:first-child { min-width: 0; }
          .serviceCardHeader span { font-size: 14px !important; line-height: 1.25; }
          .rateGrid { gap: 10px !important; }
          .rateGrid label { font-size: 11px !important; line-height: 1.15; }
          .rateGrid input { min-width: 0; padding: 9px 7px !important; font-size: 13px !important; }
          .saveBar button { width: 100%; justify-content: center; }
          .formTwoCol { grid-template-columns: 1fr !important; }
          .priceGrid { gap: 7px !important; }
          .priceGrid input { min-width: 0; }
          .pricingSidebar.isOpen { padding: 14px; }
          .pricingSidebar.isOpen .createPanel { padding: 20px !important; }
        }

        @media (max-width: 380px) {
          .categoryTabs { padding-left: 50px !important; }
          .categoryTab { font-size: 12px !important; }
          .rateGrid { grid-template-columns: 1fr !important; }
          .priceGrid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
